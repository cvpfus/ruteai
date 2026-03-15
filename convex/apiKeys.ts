import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { authComponent } from './betterAuth/auth'

function generateApiKeyPrefix() {
  return 'rute_'
}

function generateSecureApiKey() {
  const array = new Uint8Array(24)
  crypto.getRandomValues(array)
  const hex = Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `${generateApiKeyPrefix()}${hex}`
}

export const createKey = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('[createKey] Starting mutation with name:', args.name)

    const user = await authComponent.getAuthUser(ctx)
    console.log(
      '[createKey] Auth user result:',
      user ? `User ID: ${user._id}` : 'No user found',
    )

    if (!user) {
      console.error('[createKey] Unauthorized - no user found')
      throw new Error('Unauthorized')
    }

    const key = generateSecureApiKey()
    console.log('[createKey] Generated key prefix:', key.substring(0, 10))

    // Create an API key.
    // Tier-based rate-limits can be set here. For example:
    // Free: 100/day
    // Premium: 1000/day (hardcoded to standard tier for now)
    try {
      const newDocId = await ctx.db.insert('apikey', {
        userId: user._id, // User's ID
        name: args.name,
        key: key,
        start: key.substring(0, 10),
        prefix: generateApiKeyPrefix(),
        enabled: true,
        rateLimitEnabled: true,
        rateLimitMax: 100, // 100 requests (tier based limit placeholders)
        rateLimitTimeWindow: 86400, // per day
        requestCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      console.log('[createKey] Successfully inserted key with ID:', newDocId)

      // Return the created key, mirroring Better Auth response shape
      const newKeyRecord = await ctx.db.get(newDocId)
      console.log(
        '[createKey] Retrieved new key record:',
        newKeyRecord ? 'Found' : 'Not found',
      )
      return { key, ...newKeyRecord }
    } catch (err) {
      console.error('[createKey] Error inserting key:', err)
      throw err
    }
  },
})

export const revokeKey = mutation({
  args: {
    keyId: v.id('apikey'),
  },
  handler: async (ctx, args) => {
    console.log('[revokeKey] Starting mutation for keyId:', args.keyId)

    const user = await authComponent.getAuthUser(ctx)
    console.log(
      '[revokeKey] Auth user result:',
      user ? `User ID: ${user._id}` : 'No user found',
    )

    if (!user) {
      console.error('[revokeKey] Unauthorized - no user found')
      throw new Error('Unauthorized')
    }

    const key = await ctx.db.get(args.keyId)
    console.log(
      '[revokeKey] Key lookup result:',
      key ? `Key userId: ${key.userId}` : 'Key not found',
    )

    if (!key) {
      console.error('[revokeKey] Key not found:', args.keyId)
      throw new Error('Key not found')
    }

    if (key.userId !== user._id) {
      console.error(
        '[revokeKey] Unauthorized - key userId:',
        key.userId,
        'does not match user._id:',
        user._id,
      )
      throw new Error('Unauthorized')
    }

    await ctx.db.delete(key._id)
    console.log('[revokeKey] Successfully deleted key:', args.keyId)
    return { success: true }
  },
})

export const listKeys = query({
  args: {},
  handler: async (ctx) => {
    console.log('[listKeys] Starting query')

    const user = await authComponent.getAuthUser(ctx)
    console.log(
      '[listKeys] Auth user result:',
      user ? `User ID: ${user._id}` : 'No user found',
    )

    if (!user) {
      console.log('[listKeys] No user found, returning empty array')
      return []
    }

    console.log('[listKeys] Querying keys for user:', user._id)
    const keys = await ctx.db
      .query('apikey')
      .withIndex('userId', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect()

    console.log('[listKeys] Found keys count:', keys.length)
    return keys
  },
})
