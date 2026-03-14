# Tasks: LLM API SaaS with Mayar Payment Gateway

## 1. Project Setup

- [ ] 1.1 Initialize TanStack Start project with pnpm
- [ ] 1.2 Configure TypeScript with strict mode
- [ ] 1.3 Set up Convex project and install dependencies
- [ ] 1.4 Configure Tailwind CSS for styling
- [ ] 1.5 Set up environment variables (.env.example)
- [ ] 1.6 Configure ESLint and Prettier
- [ ] 1.7 Set up Git repository with conventional commits

## 2. Convex Database Schema

- [ ] 2.1 Create customers table schema with Mayar membership ID
- [ ] 2.2 Create apiKeys table schema with hashed keys
- [ ] 2.3 Create creditTransactions table schema (synced from Mayar)
- [ ] 2.4 Create usageLogs table schema
- [ ] 2.5 Create models table schema for LLM configurations
- [ ] 2.6 Create rateLimitLogs table schema
- [ ] 2.7 Create webhookLogs table schema
- [ ] 2.8 Create mayarMembershipCache table for credit balance caching
- [ ] 2.9 Set up Convex indexes for efficient queries

## 3. API Key Management

- [ ] 3.1 Implement API key generation function (Convex mutation)
- [ ] 3.2 Implement API key hashing utility
- [ ] 3.3 Implement API key validation function (Convex query)
- [ ] 3.4 Implement API key revocation function
- [ ] 3.5 Implement list API keys function with pagination
- [ ] 3.6 Create API key middleware for TanStack Start API routes
- [ ] 3.7 Add API key authentication tests

## 4. Credit System (Mayar Usage-Based Membership)

- [ ] 4.1 Create Mayar Usage-Based Membership product for credit system
- [ ] 4.2 Implement register new customer in Mayar membership (registNewMembershipCustomer)
- [ ] 4.3 Implement get customer credit balance from Mayar (customerBalance)
- [ ] 4.4 Implement add customer credit via Mayar API (addCustomerCredit)
- [ ] 4.5 Implement spend customer credit via Mayar API (spendCustomerCredit)
- [ ] 4.6 Implement get paginated customer credit history from Mayar
- [ ] 4.7 Create local credit cache/sync mechanism for performance
- [ ] 4.8 Implement refund credit function for unused tokens
- [ ] 4.9 Add credit system integration tests with Mayar API

## 5. Mayar Payment Integration

- [ ] 5.1 Set up Mayar API client with authentication
- [ ] 5.2 Implement generate immutable checkout link for credit top-up
- [ ] 5.3 Create webhook signature verification utility
- [ ] 5.4 Implement webhook handler HTTP action (Convex)
- [ ] 5.5 Add webhook processing for payment success (addCustomerCredit callback)
- [ ] 5.6 Add webhook idempotency handling
- [ ] 5.7 Create webhook retry mechanism
- [ ] 5.8 Add Mayar integration tests

## 6. LLM Proxy

- [ ] 6.1 Create TanStack Start API route for /v1/chat/completions
- [ ] 6.2 Create TanStack Start API route for /v1/models
- [ ] 6.3 Implement OpenAI provider client
- [ ] 6.4 Implement Anthropic provider client with request/response transformation
- [ ] 6.5 Implement Google Gemini provider client with transformation
- [ ] 6.6 Add streaming response support (SSE)
- [ ] 6.7 Implement error handling for provider failures
- [ ] 6.8 Add request/response logging
- [ ] 6.9 Create provider health check mechanism
- [ ] 6.10 Add LLM proxy integration tests

## 7. Usage Tracking

- [ ] 7.1 Implement token counting utility
- [ ] 7.2 Create usage log recording function
- [ ] 7.3 Implement cost calculation based on model pricing
- [ ] 7.4 Create daily usage aggregation function
- [ ] 7.5 Implement monthly usage report generation
- [ ] 7.6 Add usage analytics queries for dashboard
- [ ] 7.7 Create usage tracking tests

## 8. Rate Limiting

- [ ] 8.1 Implement rate limit configuration per tier
- [ ] 8.2 Create sliding window rate limit check function
- [ ] 8.3 Implement rate limit middleware for API routes
- [ ] 8.4 Add rate limit headers to responses
- [ ] 8.5 Create rate limit bypass for admin keys
- [ ] 8.6 Implement rate limit error responses
- [ ] 8.7 Add rate limiting tests

## 9. Model Routing

- [ ] 9.1 Create model configuration management
- [ ] 9.2 Implement model routing logic based on model ID
- [ ] 9.3 Add model alias resolution
- [ ] 9.4 Implement model capability validation
- [ ] 9.5 Create fallback routing mechanism
- [ ] 9.6 Implement model listing endpoint
- [ ] 9.7 Add model routing tests

## 10. Customer Dashboard

- [ ] 10.1 Create dashboard layout with navigation
- [ ] 10.2 Implement overview page with stats cards
- [ ] 10.3 Create API keys management page
- [ ] 10.4 Implement API key creation modal
- [ ] 10.5 Create usage analytics page with charts
- [ ] 10.6 Implement transaction history page
- [ ] 10.7 Create top-up page with amount selection
- [ ] 10.8 Implement magic link authentication
- [ ] 10.9 Add responsive design for mobile
- [ ] 10.10 Create dashboard E2E tests

## 11. Frontend Components

- [ ] 11.1 Create reusable Button component
- [ ] 11.2 Create Input and Form components
- [ ] 11.3 Create Modal component
- [ ] 11.4 Create Table component with pagination
- [ ] 11.5 Create Chart components (line, bar, pie)
- [ ] 11.6 Create Card and StatCard components
- [ ] 11.7 Create Toast notification component
- [ ] 11.8 Create Loading and Skeleton components

## 12. Documentation

- [ ] 12.1 Create API documentation (OpenAPI spec)
- [ ] 12.2 Write getting started guide
- [ ] 12.3 Create authentication documentation
- [ ] 12.4 Write pricing and billing documentation
- [ ] 12.5 Create webhook integration guide
- [ ] 12.6 Add code examples (curl, Python, JavaScript)
- [ ] 12.7 Create FAQ page

## 13. Deployment

- [ ] 13.1 Configure Convex deployment
- [ ] 13.2 Set up TanStack Start production build
- [ ] 13.3 Configure environment variables for production
- [ ] 13.4 Set up domain and SSL
- [ ] 13.5 Configure Mayar webhook URL
- [ ] 13.6 Set up monitoring and alerting
- [ ] 13.7 Create deployment documentation

## 14. Testing

- [ ] 14.1 Set up testing framework (Vitest)
- [ ] 14.2 Write unit tests for utilities
- [ ] 14.3 Write integration tests for Convex functions
- [ ] 14.4 Create API endpoint tests
- [ ] 14.5 Set up E2E testing with Playwright
- [ ] 14.6 Add load testing for rate limiting
- [ ] 14.7 Set up CI/CD pipeline with GitHub Actions
