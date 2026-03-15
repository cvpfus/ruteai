/**
 * Mayar Webhook Handler (Convex HTTP action)
 *
 * Handles incoming webhooks from Mayar for payment notifications.
 * Mounted at /api/webhooks/mayar via convex/http.ts
 *
 * Tasks covered:
 * - 7.3: Webhook signature verification utility
 * - 7.4: Webhook handler HTTP action
 * - 7.5: Payment success processing (update balance + log transaction)
 */

import { v } from 'convex/values'
import { httpAction, internalAction, internalMutation, internalQuery } from './_generated/server'
import { internal } from './_generated/api'

// ─── 7.3  Webhook signature verification ─────────────────────────────────────

/**
 * Verify Mayar webhook signature.
 *
 * Mayar sends a signature in the request headers that we verify
 * against our webhook secret to ensure authenticity.
 *
 * Note: Mayar's webhook verification approach may vary.
 * This implementation supports common patterns:
 * - x-callback-signature header
 * - x-mayar-signature header
 */
async function verifyWebhookSignature(
  body: string,
  signature: string | null,
): Promise<boolean> {
  const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.warn('[webhook] MAYAR_WEBHOOK_SECRET not set, skipping verification')
    // In development, allow unverified webhooks
    return true
  }

  if (!signature) {
    console.error('[webhook] Missing webhook signature')
    return false
  }

  try {
    // Compute HMAC-SHA256 of the body using the webhook secret
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(body),
    )

    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return computedSignature === signature
  } catch (err) {
    console.error('[webhook] Signature verification error:', err)
    return false
  }
}

// ─── 7.4  Webhook handler HTTP action ────────────────────────────────────────

/** Mayar webhook payload structure */
interface MayarWebhookPayload {
  event: string
  data: {
    id: string
    status: boolean
    createdAt: string
    updatedAt: string
    merchantId: string
    merchantEmail: string
    merchantName: string
    customerName: string
    customerEmail: string
    customerMobile: string
    amount: number
    productId: string
    productName: string
    productType: string
    [key: string]: any
  }
}

export const handleMayarWebhook = httpAction(async (ctx, req) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const body = await req.text()
  const signature =
    req.headers.get('x-callback-signature') ||
    req.headers.get('x-mayar-signature')

  // Verify webhook signature
  const isValid = await verifyWebhookSignature(body, signature)
  if (!isValid) {
    console.error('[webhook] Invalid webhook signature')
    // Log the failed verification
    await ctx.runMutation(internal.webhooks.logWebhook, {
      webhookId: 'unknown',
      type: 'signature_verification_failed',
      status: 'failed',
      payload: { body: body.substring(0, 500) },
      timestamp: Date.now(),
    })

    return new Response(
      JSON.stringify({ error: 'Invalid webhook signature' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let payload: MayarWebhookPayload
  try {
    payload = JSON.parse(body)
  } catch {
    console.error('[webhook] Invalid JSON payload')
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  console.log('[webhook] Received webhook:', {
    event: payload.event,
    dataId: payload.data?.id,
    customerEmail: payload.data?.customerEmail,
    amount: payload.data?.amount,
  })

  // Process the webhook based on event type
  try {
    if (payload.event === 'payment.received') {
      await ctx.runAction(internal.webhooks.processPaymentReceived, {
        webhookData: payload.data,
      })
    } else {
      console.log('[webhook] Unhandled event type:', payload.event)
    }

    // Log successful webhook processing
    await ctx.runMutation(internal.webhooks.logWebhook, {
      webhookId: payload.data?.id || 'unknown',
      type: payload.event || 'unknown',
      status: 'success',
      payload: payload.data as any,
      timestamp: Date.now(),
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    console.error('[webhook] Processing error:', err)

    // Log the failed webhook
    await ctx.runMutation(internal.webhooks.logWebhook, {
      webhookId: payload.data?.id || 'unknown',
      type: payload.event || 'unknown',
      status: 'failed',
      payload: { ...payload.data, error: err.message } as any,
      timestamp: Date.now(),
    })

    return new Response(
      JSON.stringify({ error: 'Internal processing error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})

// ─── 7.5  Payment success processing ─────────────────────────────────────────

/** Process a successful payment webhook from Mayar. */
export const processPaymentReceived = internalAction({
  args: {
    webhookData: v.any(),
  },
  handler: async (
    ctx,
    { webhookData },
  ): Promise<{ duplicate: true } | { success: true; newBalance: number }> => {
    const { id: transactionId, customerEmail, amount } = webhookData

    console.log('[webhook] Processing payment received:', {
      transactionId,
      customerEmail,
      amount,
    })

    // Check for duplicate transaction (idempotent processing)
    const existingTransaction = await ctx.runQuery(
      internal.webhooks.getTransactionByMayarId,
      { mayarTransactionId: transactionId },
    )

    if (existingTransaction) {
      console.log('[webhook] Duplicate transaction, skipping:', transactionId)
      return { duplicate: true }
    }

    // Find the customer by email
    const customer: any = await ctx.runMutation(
      internal.customers.getCustomerByEmail,
      { email: customerEmail },
    )

    if (!customer) {
      console.error('[webhook] Customer not found for email:', customerEmail)
      throw new Error(`Customer not found for email: ${customerEmail}`)
    }

    // Add credits to the customer's balance
    const result: { newBalance: number } = await ctx.runMutation(
      internal.customers.addCredits,
      {
        customerId: customer._id,
        amount,
        mayarTransactionId: transactionId,
        description: `Credit top-up via Mayar payment`,
      },
    )

    console.log('[webhook] Credits added successfully:', {
      customerId: customer._id,
      amount,
      newBalance: result.newBalance,
    })

    return { success: true, newBalance: result.newBalance }
  },
})

// ─── Helper queries/mutations for webhook processing ─────────────────────────

/** Check if a transaction with the given Mayar transaction ID already exists. */
export const getTransactionByMayarId = internalQuery({
  args: {
    mayarTransactionId: v.string(),
  },
  handler: async (ctx, { mayarTransactionId }) => {
    return await ctx.db
      .query('creditTransactions')
      .withIndex('by_mayarTransactionId', (q) =>
        q.eq('mayarTransactionId', mayarTransactionId),
      )
      .first()
  },
})

/** Log a webhook event for audit purposes. */
export const logWebhook = internalMutation({
  args: {
    webhookId: v.string(),
    type: v.string(),
    status: v.union(v.literal('success'), v.literal('failed')),
    payload: v.any(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('webhookLogs', args)
  },
})
