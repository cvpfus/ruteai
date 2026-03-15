import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { authComponent } from './betterAuth/auth'

export const revokeKey = mutation({
  args: {
    keyId: v.id('apikey'),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) throw new Error('Unauthorized')

    const key = await ctx.db.get(args.keyId)
    if (!key) throw new Error('Key not found')

    // Plugin stores user as referenceId; fall back to userId for legacy records
    const ownerId = key.referenceId ?? key.userId
    if (ownerId !== user._id) throw new Error('Unauthorized')

    await ctx.db.delete(key._id)
    return { success: true }
  },
})

export const listKeys = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) return []

    // Plugin stores user as referenceId; also check userId for legacy records
    const byRef = await ctx.db
      .query('apikey')
      .withIndex('referenceId', (q) => q.eq('referenceId', user._id))
      .order('desc')
      .collect()

    const byUserId = await ctx.db
      .query('apikey')
      .withIndex('userId', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect()

    const seen = new Set<string>()
    const keys = [...byRef, ...byUserId].filter((k) => {
      if (seen.has(k._id)) return false
      seen.add(k._id)
      return true
    })

    // Strip the hashed key — only expose display-safe fields
    return keys.map(({ key: _key, ...rest }) => rest)
  },
})
