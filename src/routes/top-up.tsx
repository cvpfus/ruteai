import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import {
  CreditCard,
  Wallet,
  Sparkles,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useQuery, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'

import { authClient } from '../lib/auth-client'
import { redirect, useSearch } from '@tanstack/react-router'

export const Route = createFileRoute('/top-up')({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    status: (search.status as string) || undefined,
  }),
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: TopUp,
})

// Credit packages
const packages = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 50000,
    price: 50000,
    popular: false,
    description: 'Great for trying out',
  },
  {
    id: 'basic',
    name: 'Basic',
    credits: 100000,
    price: 100000,
    popular: false,
    description: 'For light usage',
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 500000,
    price: 450000,
    popular: true,
    description: 'Best value for teams',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 2000000,
    price: 1500000,
    popular: false,
    description: 'For heavy workloads',
  },
]

// Custom amount presets
const customPresets = [100000, 250000, 500000, 1000000]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function TopUp() {
  const { data: session } = authClient.useSession()
  const search = useSearch({ from: '/top-up' })
  const creditData = useQuery(api.customers.getCreditBalance)
  const generatePaymentLink = useAction(api.mayar.generatePaymentLink)

  const [selectedPackage, setSelectedPackage] = useState<string | null>('pro')
  const [customAmount, setCustomAmount] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  const selectedPkg = !useCustom
    ? packages.find((p) => p.id === selectedPackage)
    : null
  const effectiveAmount = useCustom
    ? parseInt(customAmount) || 0
    : selectedPkg?.price || 0

  const effectiveCredits = useCustom
    ? parseInt(customAmount) || 0
    : selectedPkg?.credits || 0

  const showSuccess = search.status === 'success'

  const handleGenerateCheckout = async () => {
    if (!session?.user) return
    if (effectiveAmount < 50000) {
      setError('Minimum top-up amount is Rp 50,000')
      return
    }

    setError(null)
    setIsGenerating(true)
    setCheckoutUrl(null)

    try {
      const result = await generatePaymentLink({
        amount: effectiveAmount,
        customerName: session.user.name,
        customerEmail: session.user.email,
      })

      setCheckoutUrl(result.checkoutUrl)
    } catch (err: any) {
      console.error('[TopUp] Failed to generate payment link:', err)
      setError(err.message || 'Failed to generate payment link')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <DashboardLayout
      title="Top Up Credits"
      user={
        session?.user || {
          name: 'Loading...',
          email: '',
        }
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Banner (after returning from Mayar checkout) */}
        {showSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/30">
            <CheckCircle2
              size={24}
              className="text-[var(--success)] flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-[var(--success)]">
                Payment submitted!
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Your credits will be added automatically once the payment is
                confirmed. This usually takes 1-2 minutes.
              </p>
            </div>
          </div>
        )}

        {/* Current Balance */}
        <div className="card rounded-xl p-8 text-center">
          <p className="text-[var(--text-secondary)] mb-2">Current Balance</p>
          <div className="text-4xl font-bold text-[var(--accent-gold)]">
            {creditData
              ? formatCurrency(creditData.balance)
              : 'Loading...'}
          </div>
        </div>

        {/* Toggle: Package / Custom Amount */}
        <div className="flex items-center gap-2 p-1 bg-[var(--bg-input)] rounded-lg w-fit">
          <button
            onClick={() => {
              setUseCustom(false)
              setCheckoutUrl(null)
              setError(null)
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              !useCustom
                ? 'bg-[var(--accent-gold)] text-[var(--bg-sidebar)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Select Package
          </button>
          <button
            onClick={() => {
              setUseCustom(true)
              setSelectedPackage(null)
              setCheckoutUrl(null)
              setError(null)
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              useCustom
                ? 'bg-[var(--accent-gold)] text-[var(--bg-sidebar)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Custom Amount
          </button>
        </div>

        {/* Credit Packages */}
        {!useCustom && (
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Select Package
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => {
                    setSelectedPackage(pkg.id)
                    setCheckoutUrl(null)
                    setError(null)
                  }}
                  className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                    selectedPackage === pkg.id
                      ? 'border-[var(--accent-gold)] bg-[var(--bg-hover)]'
                      : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--accent-gold)] text-[var(--bg-sidebar)] text-xs font-semibold rounded-full flex items-center gap-1">
                      <Sparkles size={12} />
                      Best Value
                    </span>
                  )}

                  <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                    {pkg.name}
                  </h4>

                  <p className="text-xs text-[var(--text-tertiary)] mb-3">
                    {pkg.description}
                  </p>

                  <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                    {formatCurrency(pkg.price)}
                  </div>

                  <p className="text-sm text-[var(--text-secondary)]">
                    {pkg.credits.toLocaleString()} credits
                  </p>

                  {pkg.price < pkg.credits && (
                    <p className="text-xs text-[var(--success)] mt-2 flex items-center gap-1">
                      <Check size={12} />
                      Save {formatCurrency(pkg.credits - pkg.price)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Amount */}
        {useCustom && (
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Enter Amount
            </h3>

            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-medium">
                  Rp
                </span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setCheckoutUrl(null)
                    setError(null)
                  }}
                  placeholder="50,000"
                  min="50000"
                  step="10000"
                  className="w-full h-14 pl-12 pr-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] text-2xl font-bold focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {customPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setCustomAmount(preset.toString())
                      setCheckoutUrl(null)
                      setError(null)
                    }}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      customAmount === preset.toString()
                        ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'
                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                    }`}
                  >
                    {formatCurrency(preset)}
                  </button>
                ))}
              </div>

              {customAmount && parseInt(customAmount) < 50000 && (
                <p className="text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle size={14} />
                  Minimum top-up amount is Rp 50,000
                </p>
              )}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Order Summary
          </h3>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">
                {useCustom ? 'Custom Amount' : 'Package'}
              </span>
              <span className="text-[var(--text-primary)]">
                {useCustom
                  ? formatCurrency(effectiveAmount)
                  : selectedPkg?.name || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Credits</span>
              <span className="text-[var(--text-primary)]">
                {effectiveCredits > 0
                  ? effectiveCredits.toLocaleString()
                  : '—'}
              </span>
            </div>

            {!useCustom && selectedPkg && selectedPkg.price < selectedPkg.credits && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Bonus</span>
                <span className="text-[var(--success)]">
                  +{(selectedPkg.credits - selectedPkg.price).toLocaleString()}{' '}
                  credits
                </span>
              </div>
            )}

            <div className="h-px bg-[var(--border-color)]" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-primary)]">
                Total
              </span>
              <span className="text-xl font-bold text-[var(--accent-gold)]">
                {formatCurrency(effectiveAmount)}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/30">
              <AlertCircle size={16} className="text-[var(--error)] flex-shrink-0" />
              <p className="text-sm text-[var(--error)]">{error}</p>
            </div>
          )}

          {/* Checkout URL result */}
          {checkoutUrl && (
            <div className="mb-4 p-4 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30">
              <p className="text-sm text-[var(--success)] font-semibold mb-2">
                Payment link generated!
              </p>
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[var(--accent-gold)] hover:text-[var(--accent-gold-hover)] underline transition-colors"
              >
                <ExternalLink size={14} />
                Open Mayar Checkout
              </a>
            </div>
          )}

          {/* Generate Payment Button */}
          {!checkoutUrl ? (
            <button
              onClick={handleGenerateCheckout}
              disabled={isGenerating || effectiveAmount < 50000}
              className="w-full h-12 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-sidebar)] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating payment link...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Generate Payment Link
                </>
              )}
            </button>
          ) : (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-sidebar)] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} />
              Proceed to Payment
            </a>
          )}

          <p className="text-xs text-[var(--text-tertiary)] text-center mt-3">
            You will be redirected to Mayar's secure payment page. After
            payment, credits will be added automatically.
          </p>
        </div>

        {/* Payment Info */}
        <div className="card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Payment Information
          </h3>
          <div className="space-y-3 text-sm text-[var(--text-tertiary)]">
            <div className="flex items-start gap-3">
              <Wallet
                size={16}
                className="text-[var(--accent-gold)] mt-0.5 flex-shrink-0"
              />
              <p>
                Supports QRIS, Bank Transfer, Virtual Account, and E-Wallet
                payments via Mayar.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check
                size={16}
                className="text-[var(--success)] mt-0.5 flex-shrink-0"
              />
              <p>
                Credits are added to your account automatically within 1-2
                minutes after payment is confirmed.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle
                size={16}
                className="text-[var(--text-tertiary)] mt-0.5 flex-shrink-0"
              />
              <p>
                Payment links expire after 24 hours. Minimum top-up amount is Rp
                50,000.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default TopUp
