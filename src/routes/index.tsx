import { createFileRoute, Link } from '@tanstack/react-router'
import { Zap, CreditCard, ShieldCheck, Activity } from 'lucide-react'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Hero Section */}
      <section className="relative flex min-h-[900px] items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto flex max-w-[800px] flex-col items-center gap-10 text-center">
          {/* Logo Mark */}
          <div className="flex h-12 w-12 rotate-45 items-center justify-center rounded bg-[#C9A962]" />

          {/* Headline */}
          <h1 className="font-display text-[48px] font-normal leading-[1.1] tracking-tight text-[#FAF8F5] sm:text-[56px] md:text-[72px]">
            LLM API Gateway
            <br />
            for Indonesia
          </h1>

          {/* Subheadline */}
          <p className="max-w-[600px] font-sans text-lg font-normal leading-relaxed text-[#888888] sm:text-xl">
            Access GPT-4, Claude, and Gemini through a single API.
            <br />
            Pay in Rupiah. Scale with confidence.
          </p>

          {/* CTA Button */}
          <Link
            to="/sign-up"
            className="flex h-14 items-center justify-center rounded bg-[#C9A962] px-10 font-sans text-base font-semibold !text-[#0A0A0A] transition-all duration-200 hover:bg-[#b8985c]"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-[120px] xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          {/* Section Title */}
          <h2 className="mb-16 text-center font-display text-[36px] font-normal text-[#FAF8F5] sm:text-[48px]">
            Why RuteAI?
          </h2>

          {/* Features Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="flex flex-col gap-6 rounded border border-[#1F1F1F] bg-[#161616] p-8 sm:p-10">
              <Zap className="h-8 w-8 text-[#C9A962]" strokeWidth={1.5} />
              <h3 className="font-display text-xl font-normal text-[#FAF8F5] sm:text-2xl">
                One API, All Models
              </h3>
              <p className="font-sans text-sm font-normal leading-relaxed text-[#888888] sm:text-[15px]">
                Access GPT-4, Claude 3, and Gemini Pro through a single, unified API. No need to manage multiple integrations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col gap-6 rounded border border-[#1F1F1F] bg-[#161616] p-8 sm:p-10">
              <CreditCard className="h-8 w-8 text-[#C9A962]" strokeWidth={1.5} />
              <h3 className="font-display text-xl font-normal text-[#FAF8F5] sm:text-2xl">
                Pay in Rupiah
              </h3>
              <p className="font-sans text-sm font-normal leading-relaxed text-[#888888] sm:text-[15px]">
                No more currency conversion headaches. Top up with local payment methods - QRIS, Virtual Accounts, and e-Wallets.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col gap-6 rounded border border-[#1F1F1F] bg-[#161616] p-8 sm:p-10">
              <ShieldCheck className="h-8 w-8 text-[#C9A962]" strokeWidth={1.5} />
              <h3 className="font-display text-xl font-normal text-[#FAF8F5] sm:text-2xl">
                Enterprise Security
              </h3>
              <p className="font-sans text-sm font-normal leading-relaxed text-[#888888] sm:text-[15px]">
                SOC 2 compliant, encrypted API keys, and role-based access control. Your data never leaves Indonesia.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col gap-6 rounded border border-[#1F1F1F] bg-[#161616] p-8 sm:p-10">
              <Activity className="h-8 w-8 text-[#C9A962]" strokeWidth={1.5} />
              <h3 className="font-display text-xl font-normal text-[#FAF8F5] sm:text-2xl">
                Real-time Analytics
              </h3>
              <p className="font-sans text-sm font-normal leading-relaxed text-[#888888] sm:text-[15px]">
                Monitor usage, track costs, and optimize performance with detailed analytics and usage breakdowns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-[#0A0A0A] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-[120px] xl:px-12">
        <div className="mx-auto max-w-[1440px]">
          {/* Section Title */}
          <h2 className="mb-4 text-center font-display text-[36px] font-normal text-[#FAF8F5] sm:text-[48px]">
            Usage-Based Pricing
          </h2>
          <p className="mx-auto mb-16 max-w-[600px] text-center font-sans text-base font-normal text-[#888888] sm:text-lg">
            Buy credits in Rupiah. Pay only for the tokens you consume. No subscriptions, no hidden fees.
          </p>

          {/* Pricing Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Model Pricing */}
            <div className="flex flex-col gap-8 rounded border border-[#1F1F1F] bg-[#0F0F0F] p-8 sm:p-12">
              <div>
                <h3 className="mb-2 font-display text-2xl font-normal text-[#FAF8F5] sm:text-[28px]">
                  Per-Token Pricing
                </h3>
                <p className="font-sans text-sm font-normal text-[#888888]">
                  Transparent pricing per 1K tokens. Deducted from your credit balance.
                </p>
              </div>

              <div className="flex flex-col">
                {/* Model Row 1 */}
                <div className="flex items-center justify-between border-b border-[#1F1F1F] py-4">
                  <span className="font-sans text-[15px] font-medium text-[#FAF8F5]">
                    GPT-4 / GPT-4o
                  </span>
                  <span className="font-sans text-[15px] font-semibold text-[#C9A962]">
                    Rp 450 / 1K tokens
                  </span>
                </div>

                {/* Model Row 2 */}
                <div className="flex items-center justify-between border-b border-[#1F1F1F] py-4">
                  <span className="font-sans text-[15px] font-medium text-[#FAF8F5]">
                    Claude 3 (Opus/Sonnet)
                  </span>
                  <span className="font-sans text-[15px] font-semibold text-[#C9A962]">
                    Rp 320 / 1K tokens
                  </span>
                </div>

                {/* Model Row 3 */}
                <div className="flex items-center justify-between py-4">
                  <span className="font-sans text-[15px] font-medium text-[#FAF8F5]">
                    Gemini Pro / Flash
                  </span>
                  <span className="font-sans text-[15px] font-semibold text-[#C9A962]">
                    Rp 180 / 1K tokens
                  </span>
                </div>
              </div>
            </div>

            {/* Top Up Section */}
            <div className="flex flex-col gap-8 rounded border border-[#1F1F1F] bg-[#0F0F0F] p-8 sm:p-12">
              <div>
                <h3 className="mb-2 font-display text-2xl font-normal text-[#FAF8F5] sm:text-[28px]">
                  Buy Credits
                </h3>
                <p className="font-sans text-sm font-normal text-[#888888]">
                  Top up your balance with local payment methods. Credits never expire.
                </p>
              </div>

              {/* Top Up Grid */}
              <div className="grid gap-5 sm:grid-cols-3">
                {/* Top Up 50k */}
                <div className="flex flex-col items-center justify-center gap-2 rounded border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-center">
                  <span className="font-display text-2xl font-normal text-[#FAF8F5]">
                    Rp 50.000
                  </span>
                  <span className="font-sans text-xs font-normal text-[#666666]">
                    ~110K GPT-4 tokens
                  </span>
                </div>

                {/* Top Up 100k - Popular */}
                <div className="relative flex flex-col items-center justify-center gap-2 rounded border-2 border-[#C9A962] bg-[#0A0A0A] p-6 text-center">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-sans text-[10px] font-semibold tracking-wider text-[#C9A962]">
                    POPULAR
                  </span>
                  <span className="font-display text-2xl font-normal text-[#FAF8F5]">
                    Rp 100.000
                  </span>
                  <span className="font-sans text-xs font-medium text-[#C9A962]">
                    ~220K GPT-4 tokens
                  </span>
                </div>

                {/* Top Up 500k */}
                <div className="flex flex-col items-center justify-center gap-2 rounded border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-center">
                  <span className="font-display text-2xl font-normal text-[#FAF8F5]">
                    Rp 500.000
                  </span>
                  <span className="font-sans text-xs font-normal text-[#666666]">
                    ~1.1M GPT-4 tokens
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col items-center gap-4">
                <span className="font-sans text-xs font-normal text-[#666666]">
                  Available payment methods:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="font-sans text-[13px] font-medium text-[#888888]">QRIS</span>
                  <span className="text-[#666666]">•</span>
                  <span className="font-sans text-[13px] font-medium text-[#888888]">Virtual Account (BCA, Mandiri, BNI, BRI)</span>
                  <span className="text-[#666666]">•</span>
                  <span className="font-sans text-[13px] font-medium text-[#888888]">E-Wallet (GoPay, OVO, DANA, ShopeePay)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex min-h-[600px] items-center justify-center bg-[#0F0F0F] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto flex max-w-[800px] flex-col items-center gap-10 text-center">
          <h2 className="font-display text-[40px] font-normal leading-tight text-[#FAF8F5] sm:text-[48px] md:text-[56px]">
            Ready to get started?
          </h2>
          <p className="font-sans text-lg font-normal text-[#888888] sm:text-xl">
            Join thousands of developers building with RuteAI today.
          </p>
          <Link
            to="/sign-up"
            className="flex h-16 items-center justify-center rounded bg-[#C9A962] px-12 font-sans text-lg font-semibold !text-[#0A0A0A] transition-all duration-200 hover:bg-[#b8985c]"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex min-h-[300px] flex-col items-center justify-center gap-6 bg-[#0A0A0A] px-4 py-20 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex h-8 w-8 rotate-45 items-center justify-center rounded bg-[#C9A962]" />

        {/* Brand */}
        <span className="font-display text-2xl font-medium tracking-wider text-[#FAF8F5]">
          RuteAI
        </span>

        {/* Copyright */}
        <p className="font-sans text-sm font-normal text-[#666666]">
          © 2026 RuteAI. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
