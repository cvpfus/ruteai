import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'
import { authComponent } from './betterAuth/auth'

/** Called internally (from Mayar action) after a new user signs up. */
export const createCustomer = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
    mayarCustomerId: v.optional(v.string()),
    creditBalance: v.number(),
  },
  handler: async (ctx, { userId, email, mayarCustomerId, creditBalance }) => {
    // Idempotent: skip if customer record already exists
    const existing = await ctx.db
      .query('customers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    if (existing) return existing._id

    return await ctx.db.insert('customers', {
      userId,
      email,
      mayarCustomerId,
      creditBalance,
    })
  },
})

/** Get the customer record for the currently-authenticated user. */
export const getMyCustomer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    return await ctx.db
      .query('customers')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .first()
  },
})

// ─── 7.1  Get customer credit balance ────────────────────────────────────────

/** Get the credit balance for the currently-authenticated user. */
export const getCreditBalance = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) return null

    const customer = await ctx.db
      .query('customers')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first()

    if (!customer) return null

    return {
      balance: customer.creditBalance,
      customerId: customer._id,
      mayarCustomerId: customer.mayarCustomerId,
    }
  },
})

// ─── 7.5  Internal mutations for credit management ───────────────────────────

/** Add credits to a customer's balance (called from webhook handler). */
export const addCredits = internalMutation({
  args: {
    customerId: v.id('customers'),
    amount: v.number(),
    mayarTransactionId: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { customerId, amount, mayarTransactionId, description }) => {
    const customer = await ctx.db.get(customerId)
    if (!customer) throw new Error('Customer not found')

    // Update credit balance
    await ctx.db.patch(customerId, {
      creditBalance: customer.creditBalance + amount,
    })

    // Record the transaction
    await ctx.db.insert('creditTransactions', {
      customerId,
      mayarTransactionId,
      amount,
      type: 'topup',
      description,
      timestamp: Date.now(),
    })

    return { newBalance: customer.creditBalance + amount }
  },
})

/** Get customer by email (used during webhook processing). */
export const getCustomerByEmail = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query('customers')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first()
  },
})

// ─── 7.7  Transaction history queries ────────────────────────────────────────

/** Get paginated transaction history for the current user. */
export const getTransactionHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) return { transactions: [], total: 0 }

    const customer = await ctx.db
      .query('customers')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first()

    if (!customer) return { transactions: [], total: 0 }

    const pageSize = 20

    const transactions = await ctx.db
      .query('creditTransactions')
      .withIndex('by_customerId', (q) => q.eq('customerId', customer._id))
      .order('desc')
      .take(pageSize)

    // Get total count
    const allTransactions = await ctx.db
      .query('creditTransactions')
      .withIndex('by_customerId', (q) => q.eq('customerId', customer._id))
      .collect()

    return {
      transactions,
      total: allTransactions.length,
      balance: customer.creditBalance,
    }
  },
})

/** Get transaction stats (total spent, total top-ups). */
export const getTransactionStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) return null

    const customer = await ctx.db
      .query('customers')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first()

    if (!customer) return null

    const transactions = await ctx.db
      .query('creditTransactions')
      .withIndex('by_customerId', (q) => q.eq('customerId', customer._id))
      .collect()

    const totalTopups = transactions
      .filter((t) => t.type === 'topup')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalSpent = transactions
      .filter((t) => t.type === 'deduction')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      totalTopups,
      totalSpent,
      balance: customer.creditBalance,
    }
  },
})
