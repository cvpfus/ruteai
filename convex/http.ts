import { httpRouter } from 'convex/server'
import { authComponent, createAuth } from './betterAuth/auth'
import { handleMayarWebhook } from './webhooks'

const http = httpRouter()

// Better Auth routes
authComponent.registerRoutes(http, createAuth)

// 7.4: Mayar webhook handler
http.route({
  path: '/api/webhooks/mayar',
  method: 'POST',
  handler: handleMayarWebhook,
})

export default http

