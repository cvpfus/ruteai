import { internalMutation, query } from './_generated/server'

const SEED_MODELS = [
  // OpenAI Models
  {
    modelId: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    providerModelId: 'gpt-4o',
    contextWindow: 128000,
    promptPricePer1k: 80, // roughly $0.005 USD
    completionPricePer1k: 240, // roughly $0.015 USD
    status: 'active' as const,
  },
  {
    modelId: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    providerModelId: 'gpt-4o-mini',
    contextWindow: 128000,
    promptPricePer1k: 2, // roughly $0.00015 USD
    completionPricePer1k: 10, // roughly $0.0006 USD
    status: 'active' as const,
  },
  
  // Anthropic Models
  {
    modelId: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    providerModelId: 'claude-3-5-sonnet-20240620', // or latest
    contextWindow: 200000,
    promptPricePer1k: 48, // roughly $0.003 USD
    completionPricePer1k: 240, // roughly $0.015 USD
    status: 'active' as const,
  },
  {
    modelId: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    providerModelId: 'claude-3-haiku-20240307',
    contextWindow: 200000,
    promptPricePer1k: 4, // roughly $0.00025 USD
    completionPricePer1k: 20, // roughly $0.00125 USD
    status: 'active' as const,
  },

  // Google Models
  {
    modelId: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    providerModelId: 'gemini-1.5-pro',
    contextWindow: 2000000,
    promptPricePer1k: 56, // roughly $0.0035
    completionPricePer1k: 168, // roughly $0.0105
    status: 'active' as const,
  },
  {
    modelId: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    providerModelId: 'gemini-1.5-flash',
    contextWindow: 1000000,
    promptPricePer1k: 1, // very cheap
    completionPricePer1k: 5,
    status: 'active' as const,
  },
]

/** Seed initial models into the database. */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const model of SEED_MODELS) {
      const existing = await ctx.db
        .query('models')
        .withIndex('by_modelId', (q) => q.eq('modelId', model.modelId))
        .first()

      if (!existing) {
        await ctx.db.insert('models', model)
      } else {
        await ctx.db.patch(existing._id, model)
      }
    }
    return { success: true, count: SEED_MODELS.length }
  },
})

/** Get all active models */
export const listModels = query({
  args: {},
  handler: async (ctx) => {
    const allModels = await ctx.db.query('models').collect()
    return allModels.filter(m => m.status === 'active')
  },
})
