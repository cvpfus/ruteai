import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { tables as authTables } from './betterAuth/schema'

export default defineSchema({
  ...authTables,
  
  customers: defineTable({
    userId: v.string(), 
    email: v.optional(v.string()),
    mayarCustomerId: v.optional(v.string()), 
    creditBalance: v.number(), 
  })
    .index('by_userId', ['userId'])
    .index('by_email', ['email'])
    .index('by_mayarCustomerId', ['mayarCustomerId']),

  creditTransactions: defineTable({
    customerId: v.id('customers'),
    mayarTransactionId: v.optional(v.string()),
    amount: v.number(),
    type: v.union(v.literal('topup'), v.literal('deduction')),
    description: v.string(),
    timestamp: v.number(),
  })
    .index('by_customerId', ['customerId'])
    .index('by_mayarTransactionId', ['mayarTransactionId']),

  models: defineTable({
    modelId: v.string(), // ID we expose (e.g. gpt-4o)
    name: v.string(),
    provider: v.string(), // 'openai', 'anthropic', 'google'
    providerModelId: v.string(), // Actual model ID for the provider
    contextWindow: v.number(),
    promptPricePer1k: v.number(), // IDR
    completionPricePer1k: v.number(), // IDR
    status: v.union(v.literal('active'), v.literal('deprecated'), v.literal('disabled')),
  })
    .index('by_provider', ['provider'])
    .index('by_modelId', ['modelId']),

  usageLogs: defineTable({
    customerId: v.id('customers'), 
    apiKeyId: v.optional(v.string()), 
    modelId: v.id('models'),
    promptTokens: v.number(),
    completionTokens: v.number(),
    cost: v.number(), // Total cost in IDR
    timestamp: v.number(),
    responseTimeMs: v.number(),
    status: v.union(v.literal('success'), v.literal('failed')),
    error: v.optional(v.string()),
  })
    .index('by_customerId', ['customerId'])
    .index('by_apiKeyId', ['apiKeyId']),

  webhookLogs: defineTable({
    webhookId: v.string(),
    type: v.string(), 
    status: v.union(v.literal('success'), v.literal('failed')),
    payload: v.any(),
    timestamp: v.number(),
  })
    .index('by_webhookId', ['webhookId']),

  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
})
