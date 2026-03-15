import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import {
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  CreditCard,
} from 'lucide-react'

import { authClient } from '../lib/auth-client'
import { redirect } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/dashboard')({
  ssr: false,
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: Dashboard,
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function formatRelativeDate(timestamp: number) {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function Dashboard() {
  const { data: session } = authClient.useSession()
  const statsData = useQuery(api.usageLogs.getDashboardStats)

  // Mapping DB response back to local structured UI
  const stats = [
    {
      label: 'Total Requests',
      value: statsData ? formatNumber(statsData.totalRequests) : '-',
      change: '',
      positive: true,
      icon: Activity,
    },
    {
      label: 'Total Tokens',
      value: statsData ? formatNumber(statsData.totalTokens) : '-',
      change: '',
      positive: true,
      icon: Zap,
    },
    {
      label: 'Avg Response Time',
      value: statsData ? `${statsData.avgResponseTime}ms` : '-',
      change: '',
      positive: true,
      icon: Activity,
    },
    {
      label: 'Credits Balance',
      value: statsData ? formatCurrency(statsData.balance) : '-',
      change: '',
      positive: true,
      icon: CreditCard,
    },
  ]

  const recentRequests = statsData?.recentRequests || []

  return (
    <DashboardLayout
      title="Dashboard Overview"
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
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="stat-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-[var(--bg-input)] rounded-lg">
                    <Icon size={20} className="text-[var(--accent-gold)]" />
                  </div>
                  {stat.change && (
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
                  )}
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label mt-1">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Recent API Requests
            </h2>
            <a
              href="/usage"
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
                  <th>Status</th>
                  <th>Time</th>
                  <th>Tokens</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <span
                        className={`badge-method badge-${req.method.toLowerCase()}`}
                      >
                        {req.method}
                      </span>
                    </td>
                    <td className="font-mono text-sm">{req.endpoint}</td>
                    <td>
                      <span
                        className={`badge ${req.status === 200 ? 'badge-success' : 'badge-error'}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td>{formatRelativeDate(req.time)}</td>
                    <td>{req.tokens.toLocaleString()}</td>
                  </tr>
                ))}
                {recentRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-[var(--text-tertiary)]">
                      No recent activity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/api-keys"
            className="card rounded-xl p-6 hover:border-[var(--accent-gold)] transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-input)] flex items-center justify-center group-hover:bg-[var(--accent-gold)] transition-colors">
                <Activity
                  size={24}
                  className="text-[var(--accent-gold)] group-hover:!text-[#0A0A0A]"
                />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Manage API Keys
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Create and manage your API keys
                </p>
              </div>
            </div>
          </a>

          <a
            href="/top-up"
            className="card rounded-xl p-6 hover:border-[var(--accent-gold)] transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-input)] flex items-center justify-center group-hover:bg-[var(--accent-gold)] transition-colors">
                <CreditCard
                  size={24}
                  className="text-[var(--accent-gold)] group-hover:!text-[#0A0A0A]"
                />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Top Up Credits
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Add credits to your account
                </p>
              </div>
            </div>
          </a>

          <a
            href="/usage"
            className="card rounded-xl p-6 hover:border-[var(--accent-gold)] transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-input)] flex items-center justify-center group-hover:bg-[var(--accent-gold)] transition-colors">
                <Zap
                  size={24}
                  className="text-[var(--accent-gold)] group-hover:!text-[#0A0A0A]"
                />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  View Usage
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Monitor your API usage
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
