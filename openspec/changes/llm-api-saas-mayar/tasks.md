# Tasks: LLM API SaaS with Mayar Payment Gateway

## 1. Project Setup ✅

- [x] 1.1 Initialize TanStack Start project with pnpm
- [x] 1.2 Configure TypeScript with strict mode
- [x] 1.3 Set up Convex project and install dependencies
- [x] 1.4 Install Better Auth and Convex integration (`better-auth`, `@convex-dev/better-auth`, `@better-auth/api-key`)
- [x] 1.5 Configure Tailwind CSS for styling
- [x] 1.6 Set up environment variables (.env.example) including `BETTER_AUTH_SECRET`, `SITE_URL`
- [x] 1.7 Configure ESLint and Prettier
- [x] 1.8 Set up Git repository with conventional commits

## 2. Auth & Identity ✅

- [x] 2.1 Create Better Auth Convex component definition (`convex/betterAuth/convex.config.ts`)
- [x] 2.2 Register Better Auth component in `convex/convex.config.ts`
- [x] 2.3 Create Better Auth instance with Convex adapter (`convex/betterAuth/auth.ts`) with email/password and `@better-auth/api-key` plugin (incl. `rute_` prefix)
- [x] 2.4 Generate Better Auth schema (`convex/betterAuth/schema.ts`)
- [x] 2.5 Export adapter functions (`convex/betterAuth/adapter.ts`)
- [x] 2.6 Add Convex auth config (`convex/auth.config.ts`) with `getAuthConfigProvider`
- [x] 2.7 Mount auth routes in `convex/http.ts` via `authComponent.registerRoutes`
- [x] 2.8 Create Better Auth client (`lib/auth-client.ts`) with `convexClient()` and `apiKeyClient()` plugins
- [x] 2.9 Create `ConvexBetterAuthProvider` wrapper component
- [x] 2.10 Set up environment variables in Convex deployment (`BETTER_AUTH_SECRET`, `SITE_URL`)

## 3. Database Schema

- [ ] 3.1 Create customers table schema with Mayar membership ID and Better Auth user ID
- [ ] 3.2 Create creditTransactions table schema (synced from Mayar)
- [ ] 3.3 Create models table schema for LLM configurations (provider, modelId, pricing per 1K tokens, enabled flag)
- [ ] 3.4 Create usageLogs table schema
- [ ] 3.5 Create webhookLogs table schema
- [ ] 3.6 Set up Convex indexes for efficient queries

## 4. Sign-Up, Sign-In & Customer Registration

- [ ] 4.1 Create public landing/home page with sign-in/sign-up CTA
- [ ] 4.2 Implement sign-up page using `authClient.signUp.email`
- [ ] 4.3 Implement sign-in page using `authClient.signIn.email`
- [ ] 4.4 Set up Mayar API client with authentication (Convex action)
- [ ] 4.5 Implement register new customer in Mayar membership (`registNewMembershipCustomer`), linked to Better Auth user ID
- [ ] 4.6 Add auto-registration trigger: on Better Auth sign-up, create Mayar membership customer and Convex `customers` record

## 5. Dashboard Shell & Route Protection

- [ ] 5.1 Add route protection using Better Auth session (redirect unauthenticated users)
- [ ] 5.2 Create dashboard layout with sidebar navigation
- [ ] 5.3 Implement overview page with stats cards (balance, usage, API key count)

## 6. API Key Management (Backend + Frontend)

- [ ] 6.1 Create Convex mutation to create API keys via `auth.api.createApiKey()` with tier-based rate limits
- [ ] 6.2 Create Convex mutation to revoke API keys via `auth.api.deleteApiKey()`
- [ ] 6.3 Create Convex query to list API keys via `auth.api.listApiKeys()` with pagination
- [ ] 6.4 Create API keys management page (list, create, revoke)

## 7. Credit Top-Up & Payment (Backend + Frontend)

- [ ] 7.1 Implement get customer credit balance from Mayar (`customerBalance`)
- [ ] 7.2 Implement generate immutable checkout link for credit top-up
- [ ] 7.3 Create webhook signature verification utility
- [ ] 7.4 Implement webhook handler HTTP action (Convex) — mounted alongside Better Auth routes in `convex/http.ts`
- [ ] 7.5 Add webhook processing for payment success (`addCustomerCredit` callback)
- [ ] 7.6 Create top-up page with amount selection and Mayar checkout link
- [ ] 7.7 Implement transaction history page (credit history from Mayar)

## 8. LLM Proxy (Verify → Balance → Route → Stream → Deduct → Log)

- [ ] 8.1 Create model configuration seed data (OpenAI, Anthropic, Gemini models with pricing)
- [ ] 8.2 Implement model routing logic — resolve model ID to provider + upstream model
- [ ] 8.3 Implement OpenAI provider client
- [ ] 8.4 Implement Anthropic provider client with request/response transformation
- [ ] 8.5 Implement Google Gemini provider client with transformation
- [ ] 8.6 Add streaming response support (SSE)
- [ ] 8.7 Create API key verification utility using `auth.api.verifyApiKey()` for proxy routes
- [ ] 8.8 Implement spend customer credit via Mayar API (`spendCustomerCredit`)
- [ ] 8.9 Implement token counting utility (extract from provider response)
- [ ] 8.10 Implement cost calculation and credit deduction after response
- [ ] 8.11 Create usage log recording function (Convex mutation)
- [ ] 8.12 Create TanStack Start API route for `/v1/chat/completions` — full pipeline: verify API key → check credit balance → route to provider → stream response → count tokens → deduct credits → log usage
- [ ] 8.13 Create TanStack Start API route for `/v1/models` — list available models
- [ ] 8.14 Implement error handling for provider failures and insufficient credits
- [ ] 8.15 Add usage analytics queries and display on dashboard overview

## 9. Deployment

- [ ] 9.1 Configure Convex deployment with Better Auth env vars (`BETTER_AUTH_SECRET`, `SITE_URL`)
- [ ] 9.2 Set up TanStack Start production build
- [ ] 9.3 Configure environment variables for production (LLM provider API keys, Mayar keys)
- [ ] 9.4 Configure Mayar webhook URL pointing to Convex HTTP endpoint
