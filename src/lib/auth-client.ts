import { createAuthClient } from 'better-auth/react'
import { convexClient } from '@convex-dev/better-auth/client/plugins'
import { apiKeyClient } from '@better-auth/api-key/client'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export const authClient = createAuthClient({
  plugins: [convexClient(), apiKeyClient(), tanstackStartCookies()],
})
