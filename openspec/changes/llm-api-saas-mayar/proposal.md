# Proposal: LLM API SaaS with Mayar Payment Gateway

## Why

Indonesian developers and businesses need a local, Rupiah-based LLM API service that integrates with familiar payment methods. Current solutions like OpenRouter require foreign currency payments and don't support Indonesian payment gateways. This service will provide OpenAI-compatible API endpoints with Mayar as the payment gateway, enabling seamless integration for Indonesian customers using local payment methods (QRIS, Virtual Account, e-wallets).

## What Changes

- **New SaaS Platform**: Build a complete LLM API proxy service with API key authentication
- **Authentication**: Better Auth with Convex integration for user authentication (email/password, social login) and API key management via `@better-auth/api-key` plugin
- **Mayar Integration**: Credit-based billing system using Mayar's Usage-Based Membership API
- **API Key Management**: Better Auth API Key plugin for generating, revoking, verifying, and managing API keys with built-in rate limiting
- **Usage Tracking**: Real-time token consumption tracking and billing
- **Dashboard**: Customer portal for balance monitoring, usage analytics, and API key management
- **Webhook Handling**: Process Mayar payment webhooks for automatic credit top-ups
- **Rate Limiting**: Tiered rate limits via Better Auth API Key plugin's built-in rate limiting + custom token/daily limits
- **Multi-Model Support**: Proxy to multiple LLM providers (OpenAI, Anthropic, Google, etc.)

## Capabilities

### New Capabilities

- `authentication`: Better Auth with Convex integration for user sign-up/sign-in (email/password, social OAuth), session management, and protected routes
- `api-key-management`: Better Auth API Key plugin (`@better-auth/api-key`) for generating, revoking, verifying, and listing API keys with `rute_` prefix
- `credit-system`: Mayar-based credit balance management with top-up via payment webhooks
- `llm-proxy`: OpenAI-compatible API endpoints that proxy to upstream LLM providers
- `usage-tracking`: Token consumption tracking and cost calculation per request
- `customer-dashboard`: Web interface for customers to manage API keys, view usage, and monitor balance
- `webhook-handler`: Process Mayar payment notifications and update customer credits
- `rate-limiting`: Better Auth API Key built-in rate limiting per key + custom tiered token/daily limits
- `model-routing`: Route requests to appropriate LLM providers based on model parameter

### Modified Capabilities

- None (new project)

## Impact

- **Frontend**: TanStack Start React application with TypeScript
- **Backend**: Convex for database, server functions, and real-time queries
- **Authentication**: Better Auth with `@convex-dev/better-auth` component + `@better-auth/api-key` plugin
- **Payment**: Mayar API integration for credit-based billing
- **LLM Providers**: OpenAI, Anthropic, Google Gemini, and other providers
- **Infrastructure**: Edge deployment for low-latency API responses
- **Security**: Better Auth session management, API key hashing, rate limiting
- **Monitoring**: Usage analytics, error tracking, performance metrics
