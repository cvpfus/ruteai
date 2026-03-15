import { query } from './_generated/server'
import { authComponent } from './betterAuth/auth'

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    console.log('[getCurrentUser] Starting query')
    return await authComponent.getAuthUser(ctx)
  },
})
