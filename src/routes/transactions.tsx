import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import { Download, Filter } from 'lucide-react'

export const Route = createFileRoute('/transactions')({
  component: Transactions,
})

// Mock data
const transactions = [
  {
    id: 'txn_001',
    date: '2024-03-15',
    description: 'Credit Top-up',
    amount: 500000,
    status: 'completed',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'txn_002',
    date: '2024-03-14',
    description: 'API Usage',
    amount: -125000,
    status: 'completed',
    paymentMethod: '-',
  },
  {
    id: 'txn_003',
    date: '2024-03-12',
    description: 'Credit Top-up',
    amount: 1000000,
    status: 'completed',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'txn_004',
    date: '2024-03-10',
    description: 'API Usage',
    amount: -89000,
    status: 'completed',
    paymentMethod: '-',
  },
  {
    id: 'txn_005',
    date: '2024-03-08',
    description: 'Credit Top-up',
    amount: 250000,
    status: 'pending',
    paymentMethod: 'Virtual Account',
  },
  {
    id: 'txn_006',
    date: '2024-03-05',
    description: 'API Usage',
    amount: -156000,
    status: 'completed',
    paymentMethod: '-',
  },
  {
    id: 'txn_007',
    date: '2024-03-01',
    description: 'Credit Top-up',
    amount: 750000,
    status: 'completed',
    paymentMethod: 'Bank Transfer',
  },
]

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function Transactions() {
  return (
    <DashboardLayout title="Transaction History" user={mockUser}>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="stat-label mb-2">Total Spent</div>
            <div className="stat-value">{formatCurrency(370000)}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label mb-2">Total Top-ups</div>
            <div className="stat-value">{formatCurrency(2500000)}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label mb-2">Current Balance</div>
            <div className="stat-value text-[var(--accent-gold)]">
              {formatCurrency(2130000)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
              <Filter size={16} />
              Filter
            </button>

            <select className="px-4 py-2 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] bg-[var(--bg-input)]">
              <option>All Time</option>
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>

        {/* Transactions Table */}
        <div className="card rounded-xl overflow-hidden">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{txn.date}</td>
                    <td className="font-medium text-[var(--text-primary)]">
                      {txn.description}
                    </td>
                    <td>{txn.paymentMethod}</td>
                    <td>
                      <span
                        className={`badge ${
                          txn.status === 'completed'
                            ? 'badge-success'
                            : txn.status === 'pending'
                              ? 'badge-warning'
                              : 'badge-error'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td
                      className={`text-right font-medium ${
                        txn.amount > 0
                          ? 'text-[var(--success)]'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {txn.amount > 0 ? '+' : ''}
                      {formatCurrency(txn.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-tertiary)]">
            Showing 1-7 of 7 transactions
          </p>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button
              className="px-3 py-1 border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Transactions
