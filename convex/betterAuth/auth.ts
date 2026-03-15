import { createClient } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import type { GenericCtx } from '@convex-dev/better-auth'
import type { BetterAuthOptions } from 'better-auth'
import { betterAuth } from 'better-auth'
import { apiKey } from '@better-auth/api-key'
import { components, internal } from '../_generated/api'
import type { DataModel } from '../_generated/dataModel'
import authConfig from '../auth.config'
import schema from './schema'
const siteUrl = process.env.SITE_URL!

// Better Auth Component
export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  },
)

// Better Auth Options
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    appName: 'RuteAI',
    baseURL: siteUrl,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      convex({ authConfig }),
      apiKey({
        defaultPrefix: 'rute_',
      }),
    ],
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            // Fire-and-forget: schedule Mayar customer registration
            // We use ctx.scheduler so it runs outside the auth transaction
            try {
              await (ctx as any).scheduler.runAfter(
                0,
                internal.mayar.registerCustomerAfterSignup,
                {
                  userId: user.id,
                  name: user.name,
                  email: user.email,
                },
              )
            } catch (err) {
              // Do not block user creation if scheduling fails
              console.error('[auth] Failed to schedule Mayar registration:', err)
            }
          },
        },
      },
    },
  } satisfies BetterAuthOptions
}

// For `auth` CLI
export const options = createAuthOptions({} as GenericCtx<DataModel>)

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx))
}
