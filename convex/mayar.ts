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
  return process.env.MAYAR_API_BASE_URL ?? 'https://api.mayar.id'
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
  handler: async (ctx, args) => {
    return await createMayarCustomer(args)
  },
})
