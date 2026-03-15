import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import { CreditCard, Wallet, Building2, Check, Copy } from 'lucide-react'

export const Route = createFileRoute('/top-up')({
  component: TopUp,
})

// Mock data
const packages = [
  {
    id: 'basic',
    name: 'Basic',
    credits: 100000,
    price: 100000,
    popular: false,
  },
  { id: 'pro', name: 'Pro', credits: 500000, price: 450000, popular: true },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 2000000,
    price: 1500000,
    popular: false,
  },
]

const paymentMethods = [
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2 },
  { id: 'credit_card', name: 'Credit Card', icon: CreditCard },
  { id: 'e_wallet', name: 'E-Wallet', icon: Wallet },
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

function TopUp() {
  const [selectedPackage, setSelectedPackage] = useState('pro')
  const [selectedPayment, setSelectedPayment] = useState('bank_transfer')
  const [copied, setCopied] = useState(false)

  const selectedPkg = packages.find((p) => p.id === selectedPackage)

  const copyVirtualAccount = () => {
    navigator.clipboard.writeText('1234567890123456')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout title="Top-up Credits" user={mockUser}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Current Balance */}
        <div className="card rounded-xl p-8 text-center">
          <p className="text-[var(--text-secondary)] mb-2">Current Balance</p>
          <div className="text-4xl font-bold text-[var(--accent-gold)]">
            {formatCurrency(2130000)}
          </div>
        </div>

        {/* Credit Packages */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Select Package
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                  selectedPackage === pkg.id
                    ? 'border-[var(--accent-gold)] bg-[var(--bg-hover)]'
                    : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--accent-gold)] text-[var(--bg-sidebar)] text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                )}

                <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                  {pkg.name}
                </h4>

                <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                  {formatCurrency(pkg.price)}
                </div>

                <p className="text-sm text-[var(--text-secondary)]">
                  {pkg.credits.toLocaleString()} credits
                </p>

                {pkg.price < pkg.credits && (
                  <p className="text-xs text-[var(--success)] mt-2">
                    Save {formatCurrency(pkg.credits - pkg.price)}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Payment Method
          </h3>

          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    selectedPayment === method.id
                      ? 'border-[var(--accent-gold)] bg-[var(--bg-hover)]'
                      : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedPayment === method.id
                        ? 'bg-[var(--accent-gold)]'
                        : 'bg-[var(--bg-input)]'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={
                        selectedPayment === method.id
                          ? 'text-[var(--bg-sidebar)]'
                          : 'text-[var(--text-secondary)]'
                      }
                    />
                  </div>

                  <span className="flex-1 text-left font-medium text-[var(--text-primary)]">
                    {method.name}
                  </span>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPayment === method.id
                        ? 'border-[var(--accent-gold)]'
                        : 'border-[var(--border-color)]'
                    }`}
                  >
                    {selectedPayment === method.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)]" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Order Summary
          </h3>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Package</span>
              <span className="text-[var(--text-primary)]">
                {selectedPkg?.name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Credits</span>
              <span className="text-[var(--text-primary)]">
                {selectedPkg?.credits.toLocaleString()}
              </span>
            </div>

            <div className="h-px bg-[var(--border-color)]" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-primary)]">
                Total
              </span>
              <span className="text-xl font-bold text-[var(--accent-gold)]">
                {formatCurrency(selectedPkg?.price || 0)}
              </span>
            </div>
          </div>

          {selectedPayment === 'bank_transfer' && (
            <div className="bg-[var(--bg-input)] rounded-lg p-4 mb-4">
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                Virtual Account Number
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-lg font-mono text-[var(--text-primary)]">
                  1234 5678 9012 3456
                </code>
                <button
                  onClick={copyVirtualAccount}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          )}

          <button className="w-full h-12 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-sidebar)] font-semibold rounded-lg transition-colors">
            Complete Payment
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default TopUp
