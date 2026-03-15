import { convexBetterAuthReactStart } from '@convex-dev/better-auth/react-start'

console.log('process.env.VITE_CONVEX_URL', process.env.VITE_CONVEX_URL)
console.log('process.env.VITE_CONVEX_SITE_URL', process.env.VITE_CONVEX_SITE_URL)

export const {
  handler,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthReactStart({
  convexUrl: process.env.VITE_CONVEX_URL!,
  convexSiteUrl: process.env.VITE_CONVEX_SITE_URL!,
})
