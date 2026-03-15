/**
 * Mayar API client (Convex actions)
 *
 * All calls to the Mayar API must go through Convex actions because they
 * require secret env vars (MAYAR_API_KEY, MAYAR_PRODUCT_ID,
 * MAYAR_MEMBERSHIP_TIER_ID) that must never be exposed to the browser.
 */

import { v } from 'convex/values'
import { action, internalAction } from './_generated/server'
import { internal } from './_generated/api'

// ─── helpers ─────────────────────────────────────────────────────────────────

function getMayarBaseUrl() {
  return process.env.MAYAR_SANDBOX === "true"
    ? "https://api.mayar.club"
    : "https://api.mayar.id";
}

function getMayarHeaders() {
  const apiKey = process.env.MAYAR_API_KEY
  if (!apiKey) throw new Error('MAYAR_API_KEY env var is not set')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }
}

// ─── 4.5  Register new Mayar customer ─────────────────────────────

interface CreateCustomerArgs {
  name: string
  email: string
  mobile?: string
}

interface MayarCustomerData {
  name: string
  email: string
  mobile: string
  userId: string
  customerId: string
}

interface CreateCustomerResponse {
  statusCode: number
  messages: string
  data: MayarCustomerData
}

export async function createMayarCustomer(
  args: CreateCustomerArgs,
): Promise<MayarCustomerData> {
  const url = `${getMayarBaseUrl()}/hl/v1/customer/create`

  const body = {
    name: args.name,
    email: args.email,
    mobile: args.mobile ?? '000000000000', // API expects a mobile number
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: getMayarHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `Mayar createCustomer failed (${res.status}): ${text}`,
    )
  }

  const json: CreateCustomerResponse = await res.json()

  if (!json.data || !json.data.customerId) {
    throw new Error(
      `Mayar createCustomer returned invalid data: ${JSON.stringify(json)}`,
    )
  }

  return json.data
}

// ─── 4.6  Internal action: called after Better Auth sign-up ──────────────────

/** Called from the Better Auth `onUserCreate` hook (via internal action). */
export const registerCustomerAfterSignup = internalAction({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { userId, name, email }) => {
    // 1. Register in Mayar
    let mayarCustomerId: string | undefined
    try {
      const mayarCustomer = await createMayarCustomer({ name, email })
      mayarCustomerId = mayarCustomer.customerId
    } catch (err) {
      // Log but don't block signup if Mayar is unavailable (can be synced later)
      console.error('[registerCustomerAfterSignup] Mayar registration failed:', err)
    }

    // 2. Create Convex customers record
    await ctx.runMutation(internal.customers.createCustomer, {
      userId,
      email,
      mayarCustomerId,
      creditBalance: 0,
    })
  },
})

// ─── Public action (for manual/admin use) ────────────────────────────────────

export const registerMayarCustomer = action({
  args: {
    name: v.string(),
    email: v.string(),
    mobile: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    return await createMayarCustomer(args)
  },
})

// ─── 7.2  Generate single payment link via Mayar API ─────────────────────────

const MINIMUM_TOPUP_AMOUNT = 50000 // Rp 50,000

interface PaymentLinkResponse {
  statusCode: number
  messages: string
  data: {
    id: string
    transaction_id: string
    transactionId: string
    link: string
  }
}

/** Generate a Mayar single payment link for credit top-up. */
export const generatePaymentLink = action({
  args: {
    amount: v.number(),
    customerName: v.string(),
    customerEmail: v.string(),
  },
  handler: async (_ctx, { amount, customerName, customerEmail }) => {
    // Validate minimum amount
    if (amount < MINIMUM_TOPUP_AMOUNT) {
      throw new Error(
        `Minimum top-up amount is Rp ${MINIMUM_TOPUP_AMOUNT.toLocaleString('id-ID')}`,
      )
    }

    const siteUrl = process.env.SITE_URL || 'http://localhost:3000'
    const url = `${getMayarBaseUrl()}/hl/v1/payment/create`

    // Set expiration to 24 hours from now
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const body = {
      name: customerName,
      email: customerEmail,
      amount,
      mobile: '000000000000',
      redirectUrl: `${siteUrl}/top-up?status=success`,
      description: `RuteAI Credit Top-up: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)}`,
      expiredAt,
    }

    console.log('[generatePaymentLink] Creating payment link:', {
      amount,
      customerEmail,
    })

    const res = await fetch(url, {
      method: 'POST',
      headers: getMayarHeaders(),
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(
        `[generatePaymentLink] Mayar API error (${res.status}):`,
        text,
      )
      throw new Error(`Failed to create payment link: ${text}`)
    }

    const json: PaymentLinkResponse = await res.json()

    if (!json.data || !json.data.link) {
      throw new Error(
        `Mayar returned invalid payment link data: ${JSON.stringify(json)}`,
      )
    }

    console.log('[generatePaymentLink] Payment link created:', {
      transactionId: json.data.transactionId,
      link: json.data.link,
    })

    return {
      checkoutUrl: json.data.link,
      transactionId: json.data.transactionId,
      paymentId: json.data.id,
    }
  },
})
