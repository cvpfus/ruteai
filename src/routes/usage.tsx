import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { authClient } from '../lib/auth-client'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/usage')({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: Usage,
})

// Mock data
const stats = [
  {
    label: 'Total Requests',
    value: '45,231',
    change: '+12.5%',
    positive: true,
  },
  { label: 'Total Tokens', value: '2.4M', change: '+8.2%', positive: true },
  {
    label: 'Avg Response Time',
    value: '245ms',
    change: '-5.3%',
    positive: true,
  },
  { label: 'Error Rate', value: '0.3%', change: '-0.1%', positive: true },
]

const dailyRequests = [
  { day: 'Mon', value: 3200 },
  { day: 'Tue', value: 4500 },
  { day: 'Wed', value: 3800 },
  { day: 'Thu', value: 5200 },
  { day: 'Fri', value: 6100 },
  { day: 'Sat', value: 4800 },
  { day: 'Sun', value: 5500 },
]

const tokenUsageByModel = [
  { model: 'GPT-4', percentage: 45, color: '#c9a86c' },
  { model: 'Claude 3', percentage: 30, color: '#a0a0a0' },
  { model: 'DeepSeek', percentage: 25, color: '#4ade80' },
]

const recentRequests = [
  {
    id: 'req_123',
    method: 'POST',
    endpoint: '/v1/chat/completions',
    timestamp: '2 minutes ago',
    tokens: 1240,
  },
  {
    id: 'req_124',
    method: 'POST',
    endpoint: '/v1/completions',
    timestamp: '5 minutes ago',
    tokens: 856,
  },
  {
    id: 'req_125',
    method: 'POST',
    endpoint: '/v1/chat/completions',
    timestamp: '12 minutes ago',
    tokens: 2100,
  },
  {
    id: 'req_126',
    method: 'GET',
    endpoint: '/v1/models',
    timestamp: '18 minutes ago',
    tokens: 0,
  },
  {
    id: 'req_127',
    method: 'POST',
    endpoint: '/v1/chat/completions',
    timestamp: '34 minutes ago',
    tokens: 980,
  },
]

function Usage() {
  const { data: session } = authClient.useSession()
  const maxValue = Math.max(...dailyRequests.map((d) => d.value))

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
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center justify-end mb-2">
                <div
                  className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}
                >
                  {stat.positive ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                  <span>{stat.change}</span>
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
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
              Daily Requests (Last 7 Days)
            </h3>

            <div className="h-64 flex items-end justify-between gap-4">
              {dailyRequests.map((day) => (
                <div
                  key={day.day}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full chart-bar rounded-t-sm"
                    style={{
                      height: `${(day.value / maxValue) * 100}%`,
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Token Usage by Model */}
          <div className="card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
              Token Usage by Model
            </h3>

            <div className="space-y-6">
              {tokenUsageByModel.map((item) => (
                <div key={item.model}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {item.model}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
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
          </div>
        </div>

        {/* Recent API Requests */}
        <div className="card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Recent API Requests
            </h2>
            <a
              href="#"
              className="text-sm text-[var(--accent-gold)] hover:text-[var(--accent-gold-hover)]"
            >
              View All
            </a>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Time</th>
                  <th>Tokens</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <span
                        className={`badge-method badge-${req.method.toLowerCase()}`}
                      >
                        {req.method}
                      </span>
                    </td>
                    <td className="font-mono text-sm">{req.endpoint}</td>
                    <td>{req.timestamp}</td>
                    <td>{req.tokens.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Usage
