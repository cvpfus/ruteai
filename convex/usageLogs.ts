import { v } from 'convex/values'
import { query } from './_generated/server'
import { authComponent } from './betterAuth/auth'

/** Get usage statistics for the current user's dashboard. */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) return null

    const customer = await ctx.db
      .query('customers')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first()

    if (!customer) return null

    const allLogs = await ctx.db
      .query('usageLogs')
      .withIndex('by_customerId', (q) => q.eq('customerId', customer._id))
      .order('desc')
      .collect()

    const recentRequests = allLogs.slice(0, 5).map((log) => ({
      _id: log._id,
      method: 'POST',
      endpoint: '/v1/chat/completions',
      status: log.status === 'success' ? 200 : (log.status === 'failed' && log.error?.includes('credit') ? 402 : 500),
      time: log.timestamp,
      tokens: log.promptTokens + log.completionTokens,
    }))

    const totalRequests = allLogs.length
    const totalTokens = allLogs.reduce((acc, log) => acc + log.promptTokens + log.completionTokens, 0)
    
    // Average response time only for successful requests
    const successfulLogs = allLogs.filter((log) => log.status === 'success' && log.responseTimeMs)
    const avgResponseTime = successfulLogs.length
      ? Math.round(successfulLogs.reduce((acc, log) => acc + log.responseTimeMs, 0) / successfulLogs.length)
      : 0

    return {
      totalRequests,
      totalTokens,
      avgResponseTime,
      recentRequests,
      balance: customer.creditBalance,
    }
  },
})
