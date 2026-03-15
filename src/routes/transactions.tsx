import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Wallet,
  TrendingUp,
  CreditCard,
} from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { authClient } from '../lib/auth-client'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/transactions')({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: Transactions,
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function formatRelativeDate(timestamp: number) {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

function Transactions() {
  const { data: session } = authClient.useSession()
  const transactionData = useQuery(api.customers.getTransactionHistory, {})
  const stats = useQuery(api.customers.getTransactionStats)

  const isLoading = transactionData === undefined || stats === undefined

  return (
    <DashboardLayout
      title="Transaction History"
      user={
        session?.user || {
          name: 'Loading...',
          email: '',
        }
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-[var(--bg-input)] rounded-lg">
                <TrendingUp size={18} className="text-[var(--error)]" />
              </div>
            </div>
            <div className="stat-value">
              {isLoading ? (
                <span className="text-[var(--text-tertiary)]">—</span>
              ) : (
                formatCurrency(stats?.totalSpent || 0)
              )}
            </div>
            <div className="stat-label mt-1">Total Spent</div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-[var(--bg-input)] rounded-lg">
                <Wallet size={18} className="text-[var(--success)]" />
              </div>
            </div>
            <div className="stat-value">
              {isLoading ? (
                <span className="text-[var(--text-tertiary)]">—</span>
              ) : (
                formatCurrency(stats?.totalTopups || 0)
              )}
            </div>
            <div className="stat-label mt-1">Total Top-ups</div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-[var(--bg-input)] rounded-lg">
                <CreditCard size={18} className="text-[var(--accent-gold)]" />
              </div>
            </div>
            <div className="stat-value text-[var(--accent-gold)]">
              {isLoading ? (
                <span className="text-[var(--text-tertiary)]">—</span>
              ) : (
                formatCurrency(stats?.balance || 0)
              )}
            </div>
            <div className="stat-label mt-1">Current Balance</div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Transactions
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-tertiary)]">
                {transactionData
                  ? `${transactionData.total} total`
                  : 'Loading...'}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">
                Loading transactions...
              </p>
            </div>
          ) : transactionData.transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-input)] flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-[var(--text-tertiary)]" />
              </div>
              <p className="text-[var(--text-secondary)] font-medium mb-1">
                No transactions yet
              </p>
              <p className="text-sm text-[var(--text-tertiary)]">
                Your credit transactions will appear here once you make your
                first top-up.
              </p>
              <a
                href="/top-up"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[var(--accent-gold)] !text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-[var(--accent-gold-hover)] transition-colors"
              >
                <CreditCard size={16} />
                Top Up Credits
              </a>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {transactionData.transactions.map((txn) => (
                <div
                  key={txn._id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      txn.type === 'topup'
                        ? 'bg-[var(--success)]/10'
                        : 'bg-[var(--error)]/10'
                    }`}
                  >
                    {txn.type === 'topup' ? (
                      <ArrowDownRight
                        size={18}
                        className="text-[var(--success)]"
                      />
                    ) : (
                      <ArrowUpRight size={18} className="text-[var(--error)]" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {txn.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                      <span>{formatDate(txn.timestamp)}</span>
                      <span>·</span>
                      <span>{formatRelativeDate(txn.timestamp)}</span>
                      {txn.mayarTransactionId && (
                        <>
                          <span>·</span>
                          <span className="font-mono">
                            {txn.mayarTransactionId.substring(0, 8)}...
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-base font-semibold ${
                        txn.type === 'topup'
                          ? 'text-[var(--success)]'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {txn.type === 'topup' ? '+' : '-'}
                      {formatCurrency(Math.abs(txn.amount))}
                    </span>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {txn.type === 'topup' ? 'Credit' : 'Debit'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination info */}
        {transactionData && transactionData.transactions.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-tertiary)]">
              Showing {transactionData.transactions.length} of{' '}
              {transactionData.total} transactions
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Transactions
