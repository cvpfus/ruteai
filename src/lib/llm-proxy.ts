/**
 * LLM Provider Proxy implementations
 * Handles translating OpenAI API format to provider-specific formats and parsing responses.
 */

// Basic types for OpenAI Chat Completions API
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

// Response parsing for stream vs non-stream will be handled by the route itself

export async function proxyOpenAI(req: ChatCompletionRequest, targetModel: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')

  // Just forward the request changing the model to the target providerModelId
  const body = {
    ...req,
    model: targetModel,
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  return response
}

export async function proxyAnthropic(req: ChatCompletionRequest, targetModel: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured')

  // Transform OpenAI format to Anthropic Format
  // Extract system messages out
  const systemMessages = req.messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n')
  const messages = req.messages.filter((m) => m.role !== 'system').map(m => ({
    role: m.role,
    content: m.content
  }))

  const body: any = {
    model: targetModel,
    messages: messages,
    max_tokens: req.max_tokens ?? 4096, // Anthropic requires max_tokens
  }

  if (systemMessages) {
    body.system = systemMessages
  }
  if (req.temperature !== undefined) {
    body.temperature = req.temperature
  }
  if (req.stream) {
    body.stream = true
  }

  // If stream, Anthropic sends different SSE format, we may need to transform it back to OpenAI.
  // We'll handle SSE transformation at the streaming parser layer if requested.
  // Let's do a basic proxy first.

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  return response
}

export async function proxyGemini(req: ChatCompletionRequest, targetModel: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')

  // Transform OpenAI request to Gemini request
  let systemInstruction
  
  const contents = req.messages.filter(m => {
    if (m.role === 'system') {
      systemInstruction = { parts: [{ text: m.content }] }
      return false
    }
    return true
  }).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }))

  const body: any = {
    contents,
  }

  if (systemInstruction) {
    body.systemInstruction = systemInstruction
  }
  if (req.temperature !== undefined) {
    body.generationConfig = { temperature: req.temperature }
  }

  const endpoint = req.stream 
    ? `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?key=${apiKey}&alt=sse`
    : `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return response
}
