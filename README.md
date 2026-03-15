# RuteAI - LLM API SaaS Platform

A production-ready LLM API proxy service built for Indonesian developers and businesses. RuteAI provides OpenAI-compatible API endpoints with Rupiah (IDR) billing via Mayar payment gateway.

## Overview

RuteAI is a full-stack SaaS platform that allows developers to access multiple LLM providers (OpenAI, Anthropic, Google Gemini) through a unified OpenAI-compatible API, with local payment methods (QRIS, Virtual Account, e-wallets) via Mayar.

### Key Features

- **OpenAI-Compatible API**: Drop-in replacement for OpenAI API with `/v1/chat/completions` and `/v1/models` endpoints
- **Multi-Provider Support**: Route requests to OpenAI, Anthropic Claude, or Google Gemini based on model selection
- **Credit-Based Billing**: Pay-per-use with IDR currency, top up via Mayar (QRIS, Virtual Account, e-wallets)
- **API Key Management**: Generate, revoke, and manage API keys with built-in rate limiting
- **Real-Time Dashboard**: Monitor balance, usage analytics, and API key activity
- **Usage Tracking**: Token consumption tracking and cost calculation per request
- **Webhook Integration**: Automatic credit top-ups via Mayar payment webhooks

## Tech Stack

- **Frontend**: TanStack Start (React + TypeScript)
- **Backend**: Convex (Database + Server Functions + Real-time Queries)
- **Authentication**: Better Auth with Convex integration
- **Styling**: Tailwind CSS
- **Payment**: Mayar Payment Gateway
- **LLM Providers**: OpenAI, Anthropic, Google Gemini

## Project Structure

```
├── convex/                    # Convex backend
│   ├── _generated/           # Auto-generated Convex types
│   ├── betterAuth/           # Better Auth component
│   │   ├── _generated/      # Better Auth generated files
│   │   ├── adapter.ts       # Auth adapter functions
│   │   ├── auth.ts          # Better Auth instance
│   │   ├── convex.config.ts # Component config
│   │   └── schema.ts        # Auth schema
│   ├── apiKeys.ts           # API key management
│   ├── auth.config.ts       # Convex auth config
│   ├── auth.ts              # Auth utilities
│   ├── customers.ts         # Customer management
│   ├── http.ts              # HTTP routes (auth + webhooks)
│   ├── mayar.ts             # Mayar API integration
│   ├── models.ts            # LLM model configurations
│   ├── proxy.ts             # LLM proxy logic
│   ├── schema.ts            # Database schema
│   ├── usageLogs.ts         # Usage tracking
│   └── webhooks.ts          # Webhook handlers
├── src/
│   ├── components/          # React components
│   │   └── Sidebar.tsx      # Dashboard sidebar
│   ├── lib/                 # Client libraries
│   │   ├── auth-client.ts   # Better Auth client
│   │   ├── auth-server.ts   # Server auth utilities
│   │   └── llm-proxy.ts     # LLM proxy client
│   ├── routes/              # TanStack Router routes
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Auth API routes
│   │   │   └── v1/          # LLM API v1 routes
│   │   │       ├── chat/completions.ts
│   │   │       └── models.ts
│   │   ├── api-keys.tsx     # API key management page
│   │   ├── dashboard.tsx    # Dashboard overview
│   │   ├── index.tsx        # Landing page
│   │   ├── models.tsx       # Available models page
│   │   ├── sign-in.tsx      # Sign in page
│   │   ├── sign-up.tsx      # Sign up page
│   │   ├── top-up.tsx       # Credit top-up page
│   │   ├── transactions.tsx # Transaction history
│   │   └── usage.tsx        # Usage analytics
│   ├── router.tsx           # Router configuration
│   └── styles.css           # Global styles
├── .env.example             # Environment variables template
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Convex account (free tier available)
- Mayar account for payments
- LLM provider API keys (OpenAI, Anthropic, Google)

### Installation

1. **Clone and install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Convex
VITE_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_convex_deployment

# Better Auth
BETTER_AUTH_SECRET=your_secret_key
SITE_URL=http://localhost:3000

# Mayar Payment Gateway
MAYAR_API_KEY=your_mayar_api_key
MAYAR_API_URL=https://api.mayar.id

# LLM Providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
```

3. **Generate Better Auth secret:**

```bash
npx @better-auth/cli secret
```

4. **Start Convex development server:**

```bash
npx convex dev
```

5. **Run the development server:**

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## Architecture

### Authentication Flow

1. Users sign up/sign in via Better Auth (email/password or social OAuth)
2. On sign-up, a Mayar customer is automatically created
3. User sessions are managed via Convex + Better Auth
4. API keys are generated with `rute_` prefix using Better Auth API Key plugin

### API Request Flow

```
Client Request → TanStack Start API Route
    ↓
Verify API Key (Better Auth)
    ↓
Check Credit Balance (Convex)
    ↓
Route to LLM Provider (OpenAI/Anthropic/Gemini)
    ↓
Stream Response → Count Tokens
    ↓
Deduct Credits (Convex)
    ↓
Log Usage (Convex)
```

### Credit System

- Pre-authorization: Credits deducted before LLM request based on `max_tokens`
- Refund mechanism: Unused tokens refunded after response
- Webhook handling: Mayar payment confirmations automatically update credit balance
- Real-time updates: Dashboard shows live balance via Convex reactive queries

### Rate Limiting

Per-API-key rate limits configured via Better Auth API Key plugin:

- **Free Tier**: 10 RPM, 100 requests/day, 10K tokens/day
- **Basic Tier**: 60 RPM, 10K requests/day, 1M tokens/day
- **Pro Tier**: 600 RPM, 100K requests/day, 10M tokens/day
- **Enterprise**: Custom limits

## API Usage

### Authentication

Include your API key in the Authorization header:

```bash
curl https://your-domain.com/api/v1/chat/completions \
  -H "Authorization: Bearer rute_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Available Models

List all available models:

```bash
curl https://your-domain.com/api/v1/models \
  -H "Authorization: Bearer rute_your_api_key"
```

### Supported Providers

- **OpenAI**: gpt-4o, gpt-4o-mini, gpt-4-turbo, etc.
- **Anthropic**: claude-3-5-sonnet, claude-3-opus, etc.
- **Google**: gemini-1.5-pro, gemini-1.5-flash, etc.

## Deployment

### Convex Deployment

1. Deploy Convex functions:

```bash
npx convex deploy
```

2. Set production environment variables in Convex dashboard

### Production Build

```bash
pnpm build
```

### Mayar Webhook Configuration

Configure Mayar webhook URL to point to your Convex HTTP endpoint:

```
https://your-convex-deployment.convex.site/webhooks/mayar
```

## Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
pnpm check        # Type check
```

### Database Schema

The Convex schema includes:

- **customers**: User profiles with Mayar customer ID and credit balance
- **creditTransactions**: Credit top-up and usage transactions
- **models**: LLM model configurations and pricing
- **usageLogs**: Detailed API usage logs
- **webhookLogs**: Mayar webhook event logs

### Adding New LLM Providers

1. Add provider configuration to `convex/models.ts`
2. Implement provider client in `convex/proxy.ts`
3. Add request/response transformation if needed
4. Update pricing in model configuration

## Security Considerations

- API keys are hashed using Better Auth's built-in hashing
- Webhook signatures are verified using Mayar secrets
- Rate limiting prevents abuse
- CORS configured for API routes
- Environment variables for sensitive data

## Contributing

This project uses Conventional Commits for commit messages:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `chore:` Maintenance tasks
- `refactor:` Code refactoring

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the GitHub issue tracker.

## Acknowledgments

- [TanStack Start](https://tanstack.com/start) - Full-stack React framework
- [Convex](https://convex.dev) - Backend platform
- [Better Auth](https://better-auth.com) - Authentication library
- [Mayar](https://mayar.id) - Indonesian payment gateway
