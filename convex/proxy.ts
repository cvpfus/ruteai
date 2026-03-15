import { v } from 'convex/values'
import { action, mutation, internalQuery } from './_generated/server'
import { internal } from './_generated/api'
import { createAuth } from './betterAuth/auth'

export type VerifyApiAccessResult = 
  | { success: true; apiKeyId: string; userId: string; customerId: string; balance: number }
  | { error: string; status: number }

/**
 * Verifies an API key and returns the associated customer and credit balance.
 * This is called by the TanStack Start API routes before routing to LLM providers.
 */
export const verifyApiAccess = action({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, { apiKey }): Promise<VerifyApiAccessResult> => {
    // 1. Verify API Key using Better Auth
    const auth = createAuth(ctx as any)
    
    try {
      const result = await auth.api.verifyApiKey({
        body: { key: apiKey },
      })
      
      if (!result?.key) {
        return { error: 'Invalid API key', status: 401 }
      }
      
      // Plugin stores owner as referenceId in newer versions; fall back to userId
      const userId = (result.key as any).referenceId ?? (result.key as any).userId

      // 2. Fetch the customer record and balance
      const customerInfo = await ctx.runQuery(internal.proxy.getCustomerByUserId, { userId })
      
      if (!customerInfo) {
        return { error: 'Customer record not found', status: 404 }
      }

      return {
        success: true,
        apiKeyId: result.key.id,
        userId: userId,
        customerId: customerInfo.customerId,
        balance: customerInfo.balance,
      }
    } catch (error) {
      console.error('[verifyApiAccess] Auth error:', error)
      return { error: 'Authentication failed', status: 401 }
    }
  },
})

/** Helper query to get customer info by user ID for the action above. */
export const getCustomerByUserId = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const customer = await ctx.db
      .query('customers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()
    
    if (!customer) return null
    return {
      customerId: customer._id,
      balance: customer.creditBalance,
    }
  },
})

/**
 * Record usage log and deduct credits after a successful or failed request.
 */
export const recordUsage = mutation({
  args: {
    customerId: v.id('customers'),
    apiKeyId: v.optional(v.string()),
    modelId: v.id('models'),
    promptTokens: v.number(),
    completionTokens: v.number(),
    cost: v.number(), // in IDR
    responseTimeMs: v.number(),
    status: v.union(v.literal('success'), v.literal('failed')),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Log usage
    await ctx.db.insert('usageLogs', {
      customerId: args.customerId,
      apiKeyId: args.apiKeyId,
      modelId: args.modelId,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      cost: args.cost,
      timestamp: Date.now(),
      responseTimeMs: args.responseTimeMs,
      status: args.status,
      error: args.error,
    })

    // 2. Deduct credits if cost > 0
    if (args.cost > 0 && args.status === 'success') {
      const customer = await ctx.db.get(args.customerId)
      if (customer) {
        await ctx.db.patch(args.customerId, {
          creditBalance: customer.creditBalance - args.cost,
        })
        
        // Log transaction
        await ctx.db.insert('creditTransactions', {
          customerId: args.customerId,
          amount: -args.cost,
          type: 'deduction',
          description: `LLM API Usage (${args.promptTokens + args.completionTokens} tokens)`,
          timestamp: Date.now(),
        })
      }
    }

    return { success: true }
  },
})
