import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { DashboardLayout } from '../components/DashboardLayout'
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/usage')({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: Usage,
})

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function Usage() {
  const { data: session } = authClient.useSession()
  const data = useQuery(api.usageLogs.getDashboardStats)
  console.log('[Usage] Data:', data)

  const isLoading = data === undefined

  const dailyRequests = (data as any)?.dailyRequests ?? []
  const maxValue = Math.max(...dailyRequests?.map((d) => d.value ?? 0), 1)

  const stats = data
    ? [
        {
          label: 'Total Requests',
          value: data.totalRequests.toLocaleString(),
          positive: true,
        },
        {
          label: 'Total Tokens',
          value: formatTokens(data.totalTokens),
          positive: true,
        },
        {
          label: 'Avg Response Time',
          value: data.avgResponseTime ? `${data.avgResponseTime}ms` : '—',
          positive: true,
        },
        {
          label: 'Error Rate',
          value: `${data?.errorRate ?? 0}%`,
          positive: data?.errorRate === 0,
        },
      ]
    : []

  return (
    <DashboardLayout
      title="API Usage"
      user={
        session?.user || {
          name: 'Loading...',
          email: '',
        }
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2
            className="animate-spin text-(--accent-gold)"
            size={32}
          />
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center h-64 text-(--text-tertiary)">
          No usage data available yet.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats?.map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="flex items-center justify-end mb-2">
                  <div
                    className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-(--success)' : 'text-(--error)'}`}
                  >
                    {stat.positive ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                  </div>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Requests Chart */}
            <div className="lg:col-span-2 card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-(--text-primary) mb-6">
                Daily Requests (Last 7 Days)
              </h3>

              {dailyRequests?.every((d) => d.value === 0) ? (
                <div className="h-64 flex items-center justify-center text-(--text-tertiary) text-sm">
                  No requests in the last 7 days
                </div>
              ) : (
                <div className="h-64 flex items-end justify-between gap-4">
                  {dailyRequests?.map((day, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-full chart-bar rounded-t-sm"
                        style={{
                          height: `${(day.value / maxValue) * 100}%`,
                          minHeight: day.value > 0 ? '4px' : '0',
                        }}
                      />
                      <span className="text-xs text-(--text-tertiary)">
                        {day.day}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Token Usage by Model */}
            <div className="card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-(--text-primary) mb-6">
                Token Usage by Model
              </h3>

              {data.tokenUsageByModel?.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-(--text-tertiary) text-sm">
                  No token data yet
                </div>
              ) : (
                <div className="space-y-6">
                  {data.tokenUsageByModel?.map((item) => (
                    <div key={item.model}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-(--text-secondary)">
                            {item.model}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-(--text-primary)">
                          {item.percentage}%
                        </span>
                      </div>

                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent API Requests */}
          <div className="card rounded-xl overflow-hidden">
            <div className="p-6 border-b border-(--border-color) flex items-center justify-between">
              <h2 className="text-lg font-semibold text-(--text-primary)">
                Recent API Requests
              </h2>
            </div>

            {data.recentRequests?.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-(--text-tertiary) text-sm">
                No requests yet
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Endpoint</th>
                      <th>Model</th>
                      <th>Time</th>
                      <th>Tokens</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentRequests?.map((req) => (
                      <tr key={req._id}>
                        <td>
                          <span className="badge-method badge-post">
                            {req.method}
                          </span>
                        </td>
                        <td className="font-mono text-sm">{req.endpoint}</td>
                        <td className="text-sm text-(--text-secondary)">
                          {req.modelName}
                        </td>
                        <td>{timeAgo(req.time)}</td>
                        <td>{req.tokens.toLocaleString()}</td>
                        <td>
                          <span
                            className={`text-xs font-mono px-2 py-0.5 rounded ${
                              req.status === 200
                                ? 'bg-green-500/10 text-green-400'
                                : req.status === 402
                                  ? 'bg-yellow-500/10 text-yellow-400'
                                  : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Usage
