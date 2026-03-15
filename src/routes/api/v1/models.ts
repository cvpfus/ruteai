import { createFileRoute } from '@tanstack/react-router'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../convex/_generated/api'

const convexUrl = process.env.VITE_CONVEX_URL!
const convex = new ConvexHttpClient(convexUrl)

export const Route = createFileRoute('/api/v1/models')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          // Fetch models from Convex database
          const activeModels = await convex.query(api.models.listModels)

          // Transform response to match OpenAI's expected JSON payload schema
          const result = {
            object: 'list',
            data: activeModels.map((model) => ({
              id: model.modelId,
              object: 'model',
              created: 1677610602, // Just a stub timestamp like OpenAI does
              owned_by: "ruteai",
              permission: [],
              root: model.modelId,
              parent: null,
              pricing: {
                promptPer1k: model.promptPricePer1k,
                completionPer1k: model.completionPricePer1k,
              },
              context_window: model.contextWindow,
            })),
          }

          return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err: any) {
          console.error('List models API Error:', err)
          return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500 })
        }
      }
    }
  }
})
