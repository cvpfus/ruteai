# Tasks: LLM API SaaS with Mayar Payment Gateway

## 1. Project Setup

- [ ] 1.1 Initialize TanStack Start project with pnpm
- [ ] 1.2 Configure TypeScript with strict mode
- [ ] 1.3 Set up Convex project and install dependencies
- [ ] 1.4 Install Better Auth and Convex integration (`better-auth`, `@convex-dev/better-auth`, `@better-auth/api-key`)
- [ ] 1.5 Configure Tailwind CSS for styling
- [ ] 1.6 Set up environment variables (.env.example) including `BETTER_AUTH_SECRET`, `SITE_URL`
- [ ] 1.7 Configure ESLint and Prettier
- [ ] 1.8 Set up Git repository with conventional commits

## 2. Better Auth Setup

- [ ] 2.1 Create Better Auth Convex component definition (`convex/betterAuth/convex.config.ts`)
- [ ] 2.2 Register Better Auth component in `convex/convex.config.ts`
- [ ] 2.3 Create Better Auth instance with Convex adapter (`convex/betterAuth/auth.ts`) with email/password and `@better-auth/api-key` plugin
- [ ] 2.4 Generate Better Auth schema (`convex/betterAuth/schema.ts`) via `npx auth generate`
- [ ] 2.5 Export adapter functions (`convex/betterAuth/adapter.ts`)
- [ ] 2.6 Add Convex auth config (`convex/auth.config.ts`) with `getAuthConfigProvider`
- [ ] 2.7 Mount auth routes in `convex/http.ts` via `authComponent.registerRoutes`
- [ ] 2.8 Create Better Auth client (`lib/auth-client.ts`) with `convexClient()` and `apiKeyClient()` plugins
- [ ] 2.9 Create `ConvexBetterAuthProvider` wrapper component
- [ ] 2.10 Set up environment variables in Convex deployment (`BETTER_AUTH_SECRET`, `SITE_URL`)

## 3. Convex Database Schema

- [ ] 3.1 Create customers table schema with Mayar membership ID and Better Auth user ID
- [ ] 3.2 Create creditTransactions table schema (synced from Mayar)
- [ ] 3.3 Create usageLogs table schema
- [ ] 3.4 Create models table schema for LLM configurations
- [ ] 3.5 Create rateLimitLogs table schema (for daily/token limits beyond Better Auth API Key rate limiting)
- [ ] 3.6 Create webhookLogs table schema
- [ ] 3.7 Create mayarMembershipCache table for credit balance caching
- [ ] 3.8 Set up Convex indexes for efficient queries

## 4. API Key Management (Better Auth API Key Plugin)

- [ ] 4.1 Configure `@better-auth/api-key` plugin with `rute_` prefix in Better Auth instance
- [ ] 4.2 Create Convex mutation to create API keys via `auth.api.createApiKey()` with tier-based rate limits
- [ ] 4.3 Create Convex mutation to revoke API keys via `auth.api.deleteApiKey()`
- [ ] 4.4 Create Convex query to list API keys via `auth.api.listApiKeys()` with pagination
- [ ] 4.5 Create API key verification middleware using `auth.api.verifyApiKey()` for LLM proxy routes
- [ ] 4.6 Add API key authentication tests

## 5. Credit System (Mayar Usage-Based Membership)

- [ ] 5.1 Create Mayar Usage-Based Membership product for credit system
- [ ] 5.2 Implement register new customer in Mayar membership (registNewMembershipCustomer), linked to Better Auth user ID
- [ ] 5.3 Implement get customer credit balance from Mayar (customerBalance)
- [ ] 5.4 Implement add customer credit via Mayar API (addCustomerCredit)
- [ ] 5.5 Implement spend customer credit via Mayar API (spendCustomerCredit)
- [ ] 5.6 Implement get paginated customer credit history from Mayar
- [ ] 5.7 Create local credit cache/sync mechanism for performance
- [ ] 5.8 Implement refund credit function for unused tokens
- [ ] 5.9 Add credit system integration tests with Mayar API

## 6. Mayar Payment Integration

- [ ] 6.1 Set up Mayar API client with authentication
- [ ] 6.2 Implement generate immutable checkout link for credit top-up
- [ ] 6.3 Create webhook signature verification utility
- [ ] 6.4 Implement webhook handler HTTP action (Convex) — mounted alongside Better Auth routes in `convex/http.ts`
- [ ] 6.5 Add webhook processing for payment success (addCustomerCredit callback)
- [ ] 6.6 Add webhook idempotency handling
- [ ] 6.7 Create webhook retry mechanism
- [ ] 6.8 Add Mayar integration tests

## 7. LLM Proxy

- [ ] 7.1 Create TanStack Start API route for /v1/chat/completions
- [ ] 7.2 Create TanStack Start API route for /v1/models
- [ ] 7.3 Add Better Auth API Key verification middleware to proxy routes
- [ ] 7.4 Implement OpenAI provider client
- [ ] 7.5 Implement Anthropic provider client with request/response transformation
- [ ] 7.6 Implement Google Gemini provider client with transformation
- [ ] 7.7 Add streaming response support (SSE)
- [ ] 7.8 Implement error handling for provider failures
- [ ] 7.9 Add request/response logging
- [ ] 7.10 Create provider health check mechanism
- [ ] 7.11 Add LLM proxy integration tests

## 8. Usage Tracking

- [ ] 8.1 Implement token counting utility
- [ ] 8.2 Create usage log recording function
- [ ] 8.3 Implement cost calculation based on model pricing
- [ ] 8.4 Create daily usage aggregation function
- [ ] 8.5 Implement monthly usage report generation
- [ ] 8.6 Add usage analytics queries for dashboard
- [ ] 8.7 Create usage tracking tests

## 9. Rate Limiting

- [ ] 9.1 Configure Better Auth API Key plugin rate limits per tier (RPM via `rateLimitMax`/`rateLimitTimeWindow`)
- [ ] 9.2 Implement custom daily request count limit in Convex
- [ ] 9.3 Implement custom daily token limit in Convex
- [ ] 9.4 Add rate limit headers to responses (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- [ ] 9.5 Create rate limit bypass for admin keys
- [ ] 9.6 Implement rate limit error responses (429)
- [ ] 9.7 Add rate limiting tests

## 10. Model Routing

- [ ] 10.1 Create model configuration management
- [ ] 10.2 Implement model routing logic based on model ID
- [ ] 10.3 Add model alias resolution
- [ ] 10.4 Implement model capability validation
- [ ] 10.5 Create fallback routing mechanism
- [ ] 10.6 Implement model listing endpoint
- [ ] 10.7 Add model routing tests

## 11. Customer Dashboard

- [ ] 11.1 Create dashboard layout with navigation
- [ ] 11.2 Implement sign-up/sign-in pages using Better Auth client (`authClient.signIn.email`, `authClient.signUp.email`)
- [ ] 11.3 Add route protection using Better Auth session (redirect unauthenticated users)
- [ ] 11.4 Implement overview page with stats cards
- [ ] 11.5 Create API keys management page (using `authClient.apiKey.list`, `authClient.apiKey.create`, `authClient.apiKey.delete`)
- [ ] 11.6 Implement API key creation modal
- [ ] 11.7 Create usage analytics page with charts
- [ ] 11.8 Implement transaction history page
- [ ] 11.9 Create top-up page with amount selection
- [ ] 11.10 Add responsive design for mobile
- [ ] 11.11 Create dashboard E2E tests

## 12. Frontend Components

- [ ] 12.1 Create reusable Button component
- [ ] 12.2 Create Input and Form components
- [ ] 12.3 Create Modal component
- [ ] 12.4 Create Table component with pagination
- [ ] 12.5 Create Chart components (line, bar, pie)
- [ ] 12.6 Create Card and StatCard components
- [ ] 12.7 Create Toast notification component
- [ ] 12.8 Create Loading and Skeleton components

## 13. Documentation

- [ ] 13.1 Create API documentation (OpenAPI spec)
- [ ] 13.2 Write getting started guide
- [ ] 13.3 Create authentication documentation (Better Auth sign-up/sign-in + API keys)
- [ ] 13.4 Write pricing and billing documentation
- [ ] 13.5 Create webhook integration guide
- [ ] 13.6 Add code examples (curl, Python, JavaScript)
- [ ] 13.7 Create FAQ page

## 14. Deployment

- [ ] 14.1 Configure Convex deployment with Better Auth env vars (`BETTER_AUTH_SECRET`, `SITE_URL`)
- [ ] 14.2 Set up TanStack Start production build
- [ ] 14.3 Configure environment variables for production
- [ ] 14.4 Set up domain and SSL
- [ ] 14.5 Configure Mayar webhook URL
- [ ] 14.6 Set up monitoring and alerting
- [ ] 14.7 Create deployment documentation

## 15. Testing

- [ ] 15.1 Set up testing framework (Vitest)
- [ ] 15.2 Write unit tests for utilities
- [ ] 15.3 Write integration tests for Convex functions
- [ ] 15.4 Create API endpoint tests (including Better Auth API Key verification)
- [ ] 15.5 Set up E2E testing with Playwright (including auth flows)
- [ ] 15.6 Add load testing for rate limiting
- [ ] 15.7 Set up CI/CD pipeline with GitHub Actions
