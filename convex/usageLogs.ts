import type { Id } from './_generated/dataModel'
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

    const recentRequests = await Promise.all(
      allLogs.slice(0, 10).map(async (log) => {
        const model = await ctx.db.get(log.modelId)
        return {
          _id: log._id,
          method: 'POST',
          endpoint: '/v1/chat/completions',
          status:
            log.status === 'success'
              ? 200
              : log.error?.includes('credit')
                ? 402
                : 500,
          time: log.timestamp,
          tokens: log.promptTokens + log.completionTokens,
          modelName: model?.name ?? 'Unknown',
        }
      }),
    )

    const totalRequests = allLogs.length
    const totalTokens = allLogs.reduce(
      (acc, log) => acc + log.promptTokens + log.completionTokens,
      0,
    )

    const failedCount = allLogs.filter((log) => log.status === 'failed').length
    const errorRate =
      totalRequests > 0
        ? parseFloat(((failedCount / totalRequests) * 100).toFixed(1))
        : 0

    // Average response time only for successful requests
    const successfulLogs = allLogs.filter(
      (log) => log.status === 'success' && log.responseTimeMs,
    )
    const avgResponseTime = successfulLogs.length
      ? Math.round(
          successfulLogs.reduce((acc, log) => acc + log.responseTimeMs, 0) /
            successfulLogs.length,
        )
      : 0

    // Daily requests for the last 7 days
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dailyRequests = Array.from({ length: 7 }, (_, i) => {
      const dayStart = now - (6 - i) * dayMs
      const dayEnd = dayStart + dayMs
      const d = new Date(dayStart)
      return {
        day: days[d.getDay()],
        value: allLogs.filter(
          (log) => log.timestamp >= dayStart && log.timestamp < dayEnd,
        ).length,
      }
    })

    // Token usage by model
    const tokensByModelId: Record<string, number> = {}
    for (const log of allLogs) {
      const key = log.modelId.toString()
      tokensByModelId[key] =
        (tokensByModelId[key] ?? 0) + log.promptTokens + log.completionTokens
    }

    const MODEL_COLORS = [
      '#c9a86c',
      '#a0a0a0',
      '#4ade80',
      '#60a5fa',
      '#f472b6',
      '#fb923c',
    ]
    const tokenUsageByModel = await Promise.all(
      Object.entries(tokensByModelId)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(async ([modelId, tokens], idx) => {
          const model = await ctx.db.get(modelId as Id<'models'>)
          const percentage =
            totalTokens > 0
              ? parseFloat(((tokens / totalTokens) * 100).toFixed(1))
              : 0
          return {
            model: model?.name ?? 'Unknown',
            tokens,
            percentage,
            color: MODEL_COLORS[idx % MODEL_COLORS.length],
          }
        }),
    )

    return {
      totalRequests,
      totalTokens,
      avgResponseTime,
      errorRate,
      recentRequests,
      dailyRequests,
      tokenUsageByModel,
      balance: customer.creditBalance,
    }
  },
})
