import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'

/** Called internally (from Mayar action) after a new user signs up. */
export const createCustomer = internalMutation({
  args: {
    userId: v.string(),
    mayarCustomerId: v.optional(v.string()),
    creditBalance: v.number(),
  },
  handler: async (ctx, { userId, mayarCustomerId, creditBalance }) => {
    // Idempotent: skip if customer record already exists
    const existing = await ctx.db
      .query('customers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    if (existing) return existing._id

    return await ctx.db.insert('customers', {
      userId,
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
