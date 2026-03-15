import { createFileRoute } from '@tanstack/react-router'
import { proxyOpenAI, proxyAnthropic, proxyGemini } from '#/lib/llm-proxy'

import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'
import type { VerifyApiAccessResult } from '../../../../../convex/proxy'

const convexUrl = process.env.VITE_CONVEX_URL!
const convex = new ConvexHttpClient(convexUrl)

export const Route = createFileRoute('/api/v1/chat/completions')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          // 1. Verify API Key
          const CT_JSON = { 'Content-Type': 'application/json' }

          const authHeader = request.headers.get('Authorization')
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), { status: 401, headers: CT_JSON })
          }
          const apiKey = authHeader.replace('Bearer ', '')

          const authResult = await convex.action(api.proxy.verifyApiAccess, { apiKey }) as VerifyApiAccessResult
          
          if ('error' in authResult) {
            return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status, headers: CT_JSON })
          }

          // Check credit balance before request
          if (authResult.balance <= 0) {
            return new Response(JSON.stringify({ error: 'Insufficient credits' }), { status: 402, headers: CT_JSON })
          }

          // 2. Parse request body
          let reqBody: any
          try {
            reqBody = await request.json()
          } catch {
            return new Response(JSON.stringify({ error: 'Request body must be valid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
          }

          const requestedModel = reqBody.model
          if (!requestedModel) {
            return new Response(JSON.stringify({ error: 'Model is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
          }

          // 3. Resolve Model Configuration
          const allModels = await convex.query(api.models.listModels)
          const modelConfig = allModels.find((m) => m.modelId === requestedModel)
          
          if (!modelConfig) {
            return new Response(JSON.stringify({ error: `Model ${requestedModel} is not supported` }), { status: 404, headers: CT_JSON })
          }

          // 4. Route to upstream provider
          let providerResponse: Response
          const startTime = Date.now()

          try {
            // if (modelConfig.provider === 'openai') {
            //   providerResponse = await proxyOpenAI(reqBody, modelConfig.providerModelId)
            // } else if (modelConfig.provider === 'anthropic') {
            //   providerResponse = await proxyAnthropic(reqBody, modelConfig.providerModelId)
            // } else if (modelConfig.provider === 'google') {
            //   providerResponse = await proxyGemini(reqBody, modelConfig.providerModelId)
            // } else {
            //   throw new Error('Unsupported provider')
            // }

            // Temporary Mock Response 
            const mockText = "This is a random mock response generated locally by the proxy!"
            
            if (reqBody.stream) {
              const stream = new ReadableStream({
                start(controller) {
                  const encoder = new TextEncoder()
                  // Simulated SSE data chunk (since the downstream pipeline pipes this directly to the user)
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: mockText } }] })}\n\n`))
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"))
                  controller.close()
                }
              })
              providerResponse = new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
            } else {
              // Create a payload that satisfies the various provider-specific parsing blocks below
              const mockPayload = {
                usage: { prompt_tokens: 20, completion_tokens: 35, input_tokens: 20, output_tokens: 35 },
                usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 35 },
                choices: [{ message: { role: 'assistant', content: mockText }, finish_reason: 'stop', index: 0 }],
                content: [{ text: mockText }], // Anthropic mock field
                candidates: [{ content: { parts: [{ text: mockText }] } }] // Gemini mock field
              }
              providerResponse = new Response(JSON.stringify(mockPayload), { status: 200, headers: { 'Content-Type': 'application/json' } })
            }
          } catch (err: any) {
            console.error('Provider error:', err)
            // Log failed usage tracking
            await convex.mutation(api.proxy.recordUsage, {
              customerId: authResult.customerId as any,
              apiKeyId: authResult.apiKeyId,
              modelId: modelConfig._id as any,
              promptTokens: 0,
              completionTokens: 0,
              cost: 0,
              responseTimeMs: Date.now() - startTime,
              status: 'failed',
              error: err.message || 'Provider failure',
            })
            return new Response(JSON.stringify({ error: 'Provider routing failed' }), { status: 502, headers: CT_JSON })
          }

          if (!providerResponse.ok) {
            return new Response(providerResponse.body, { 
              status: providerResponse.status,
              headers: providerResponse.headers,
            })
          }

          // 5. Calculate cost / count tokens after response streams or returns
          if (!reqBody.stream) {
            const data = await providerResponse.json()
            let promptTokens = 0
            let completionTokens = 0
            
            if (modelConfig.provider === 'openai') {
              promptTokens = data.usage?.prompt_tokens || 0
              completionTokens = data.usage?.completion_tokens || 0
            } else if (modelConfig.provider === 'anthropic') {
              promptTokens = data.usage?.input_tokens || 0
              completionTokens = data.usage?.output_tokens || 0
              data.object = "chat.completion"
              data.choices = [{ message: { role: 'assistant', content: data.content?.[0]?.text }, finish_reason: 'stop', index: 0 }]
            } else if (modelConfig.provider === 'google') {
              promptTokens = data.usageMetadata?.promptTokenCount || 0
              completionTokens = data.usageMetadata?.candidatesTokenCount || 0
              data.object = "chat.completion"
              data.choices = [{ message: { role: 'assistant', content: data.candidates?.[0]?.content?.parts?.[0]?.text }, finish_reason: 'stop', index: 0 }]
            }
            
            const cost = (promptTokens / 1000) * modelConfig.promptPricePer1k + (completionTokens / 1000) * modelConfig.completionPricePer1k

            await convex.mutation(api.proxy.recordUsage, {
              customerId: authResult.customerId as any,
              apiKeyId: authResult.apiKeyId,
              modelId: modelConfig._id as any,
              promptTokens,
              completionTokens,
              cost,
              responseTimeMs: Date.now() - startTime,
              status: 'success',
            })
            
            return new Response(JSON.stringify(data), {
              headers: { 'Content-Type': 'application/json' }
            })
          }

          // 6. Handle Streaming Response
          const stream = providerResponse.body
          if (!stream) {
            return new Response(JSON.stringify({ error: 'Provider returned no stream body' }), { status: 500, headers: CT_JSON })
          }

          let completionChars = 0

          const transformStream = new TransformStream({
            transform(chunk, controller) {
              const text = new TextDecoder().decode(chunk)
              completionChars += text.length
              controller.enqueue(chunk)
            },
            async flush() {
              const estimatedTokens = Math.ceil(completionChars / 4)
              const estimatedPromptTokens = Math.ceil(JSON.stringify(reqBody.messages).length / 4)
              const cost = (estimatedPromptTokens / 1000) * modelConfig.promptPricePer1k + (estimatedTokens / 1000) * modelConfig.completionPricePer1k
              
              await convex.mutation(api.proxy.recordUsage, {
                customerId: authResult.customerId as any,
                apiKeyId: authResult.apiKeyId,
                modelId: modelConfig._id as any,
                promptTokens: estimatedPromptTokens,
                completionTokens: estimatedTokens,
                cost,
                responseTimeMs: Date.now() - startTime,
                status: 'success',
              })
            }
          })

          return new Response(stream.pipeThrough(transformStream), {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            }
          })

        } catch (err: any) {
          console.error('Chat Completion API Error:', err)
          return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
      }
    }
  }
})
