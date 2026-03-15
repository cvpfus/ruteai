import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import {
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  CreditCard,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

// Mock data
const stats = [
  {
    label: 'Total Requests',
    value: '45,231',
    change: '+12.5%',
    positive: true,
    icon: Activity,
  },
  {
    label: 'Total Tokens',
    value: '2.4M',
    change: '+8.2%',
    positive: true,
    icon: Zap,
  },
  {
    label: 'Avg Response Time',
    value: '245ms',
    change: '-5.3%',
    positive: true,
    icon: Activity,
  },
  {
    label: 'Credits Balance',
    value: 'Rp 2.5M',
    change: '-2.1%',
    positive: false,
    icon: CreditCard,
  },
]

const recentRequests = [
  {
    id: 'req_123',
    method: 'POST',
    endpoint: '/v1/chat/completions',
    status: 200,
    time: '2s ago',
    tokens: 1_240,
  },
  {
    id: 'req_124',
    method: 'GET',
    endpoint: '/v1/models',
    status: 200,
    time: '5s ago',
    tokens: 0,
  },
  {
    id: 'req_125',
    method: 'POST',
    endpoint: '/v1/completions',
    status: 200,
    time: '12s ago',
    tokens: 856,
  },
  {
    id: 'req_126',
    method: 'POST',
    endpoint: '/v1/chat/completions',
    status: 429,
    time: '18s ago',
    tokens: 0,
  },
  {
    id: 'req_127',
    method: 'GET',
    endpoint: '/v1/usage',
    status: 200,
    time: '34s ago',
    tokens: 0,
  },
]

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
}

function Dashboard() {
  return (
    <DashboardLayout title="Dashboard Overview" user={mockUser}>
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
                  <tr key={req.id}>
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
                    <td>{req.time}</td>
                    <td>{req.tokens.toLocaleString()}</td>
                  </tr>
                ))}
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
                  className="text-[var(--accent-gold)] group-hover:text-[var(--bg-sidebar)]"
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
                  className="text-[var(--accent-gold)] group-hover:text-[var(--bg-sidebar)]"
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
                  className="text-[var(--accent-gold)] group-hover:text-[var(--bg-sidebar)]"
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
