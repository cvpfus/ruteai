# Design: LLM API SaaS with Mayar Payment Gateway

## Context

This is a greenfield project to build an LLM API proxy service for Indonesian customers. The service will use TanStack Start for the full-stack React framework, Convex as the backend database and server functions, and Mayar as the payment gateway. The architecture needs to support real-time credit balance updates, API key authentication, and proxy requests to multiple LLM providers.

Key constraints:
- Must use Rupiah (IDR) currency via Mayar
- Must support Indonesian payment methods (QRIS, Virtual Account, e-wallets)
- Must provide OpenAI-compatible API endpoints
- Must track usage per API key for billing
- Must handle webhooks from Mayar for payment confirmation

## Goals / Non-Goals

**Goals:**
- Provide OpenAI-compatible `/v1/chat/completions` and `/v1/models` endpoints
- Implement credit-based billing with automatic top-up via Mayar
- Support multiple LLM providers (OpenAI, Anthropic, Google) with unified API
- Real-time balance and usage tracking in customer dashboard
- Secure API key generation and validation
- Rate limiting per customer tier
- Webhook handling for payment notifications

**Non-Goals:**
- Custom LLM training or fine-tuning
- Non-OpenAI-compatible API formats
- Subscription-based billing (only credit-based)
- Multi-currency support (IDR only)
- Mobile native apps (web-only)

## Decisions

### 1. Credit-Based Billing Over Subscription
**Decision:** Use Mayar's Usage-Based Membership (Credit) product instead of SaaS Subscription.

**Rationale:**
- Aligns with pay-per-use LLM pricing model
- Customers can top up any amount
- No recurring billing complexity
- Matches OpenRouter's approach

**Alternatives considered:**
- SaaS Subscription: Rejected because LLM usage varies monthly
- Prepaid packages: Rejected because credit system is more flexible

### 2. Convex for Database and Backend
**Decision:** Use Convex as the primary backend (database + server functions).

**Rationale:**
- Real-time sync for dashboard updates
- Built-in reactive queries
- TypeScript-first
- Automatic scaling
- Simplifies architecture vs separate backend

**Alternatives considered:**
- Separate Node.js backend: Rejected for added complexity
- Supabase: Rejected for less reactive query support

### 3. API Key Storage
**Decision:** Store hashed API keys in Convex, show plaintext only once on creation.

**Rationale:**
- Security best practice
- Keys are unrecoverable if lost (forces regeneration)
- Hashing prevents key leakage if database compromised

**Implementation:**
- Use bcrypt or SHA-256 for hashing
- Store key prefix for identification (e.g., `rute_` + first 8 chars)
- Full key shown only in creation response

### 4. Request Routing Architecture
**Decision:** Use TanStack Start API routes for proxying LLM requests.

**Rationale:**
- Unified codebase with frontend
- Edge deployment ready
- Can use Convex server functions for auth/validation

**Flow:**
```
Client Request → TanStack Start API Route → Convex (auth + billing) → LLM Provider → Response
```

### 5. Credit Deduction Strategy
**Decision:** Deduct credits before LLM request (pre-authorization).

**Rationale:**
- Prevents negative balances
- Simplifies error handling
- Customer sees immediate balance update

**Implementation:**
- Calculate estimated cost based on max_tokens
- Deduct from Convex balance
- If actual usage < estimated, refund difference
- If actual usage > estimated, deduct remainder

### 6. Mayar Webhook Handling
**Decision:** Use Convex HTTP actions for webhook endpoints.

**Rationale:**
- Convex can expose HTTP endpoints via `httpAction`
- Direct database access for updating credits
- No separate webhook server needed

**Security:**
- Verify webhook signature using Mayar secret
- Idempotent processing (check transaction ID)
- Retry logic for failed webhooks

### 7. Rate Limiting
**Decision:** Implement rate limiting in Convex with sliding window.

**Rationale:**
- Centralized in database
- Real-time enforcement
- Can be adjusted per customer tier

**Tiers:**
- Free: 10 RPM, 100 requests/day
- Basic: 60 RPM, 10K requests/day
- Pro: 600 RPM, 100K requests/day
- Enterprise: Custom limits

## Risks / Trade-offs

**[Risk] Mayar API Downtime** → **Mitigation:** Implement retry logic and queue failed credit updates for manual reconciliation

**[Risk] LLM Provider Rate Limits** → **Mitigation:** Implement circuit breaker pattern, fallback to alternative providers

**[Risk] Credit Calculation Discrepancies** → **Mitigation:** Log all token usage, provide admin dashboard for manual adjustments

**[Risk] API Key Leakage** → **Mitigation:** Hash storage, prefix logging only, ability to revoke keys instantly

**[Risk] Webhook Replay Attacks** → **Mitigation:** Verify signatures, idempotent processing with transaction IDs

**[Trade-off] Pre-authorization vs Post-authorization**
- Pre-auth: Simpler, prevents negative balances, but may overcharge
- Post-auth: Accurate billing, but complex with streaming responses
- **Decision:** Pre-auth with refund for unused tokens

**[Trade-off] Real-time vs Batch Usage Updates**
- Real-time: Better UX, immediate balance visibility
- Batch: Better performance, less database load
- **Decision:** Real-time for dashboard, batch for analytics

## Migration Plan

N/A - Greenfield project

## Open Questions

1. Which LLM providers to support initially? (Recommendation: OpenAI, Anthropic Claude, Google Gemini)
2. Pricing strategy per 1K tokens? (Recommendation: Markup 20-30% over provider cost)
3. Free tier allocation? (Recommendation: Rp 10,000 free credits)
4. Minimum top-up amount? (Recommendation: Rp 50,000)
