import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { DashboardLayout } from '../components/DashboardLayout'
import { Brain, Loader2, Copy, Check, Zap, Moon, Sparkles } from 'lucide-react'
import { authClient } from '../lib/auth-client'
import { useState, useMemo, useEffect } from 'react'
import { codeToHtml } from 'shiki'

export const Route = createFileRoute('/models')({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: Models,
})

const providerIcons: Record<string, React.ReactNode> = {
  openai: <Zap size={16} className="text-[var(--accent-gold)]" />,
  anthropic: <Moon size={16} className="text-[var(--accent-gold)]" />,
  google: <Sparkles size={16} className="text-[var(--accent-gold)]" />,
}

const providerLabels: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
}

function formatContextWindow(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M tokens`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K tokens`
  return `${n} tokens`
}

function formatPrice(price: number): string {
  return `Rp ${price} / 1K`
}

// Hook to get the base URL dynamically
function useBaseUrl(): string {
  return useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/v1`
    }
    return 'https://your-domain.com/api/v1'
  }, [])
}

function useExamples() {
  const baseUrl = useBaseUrl()

  const curlExample = useMemo(() => `curl ${baseUrl}/chat/completions \\
  -H "Authorization: Bearer rute_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`, [baseUrl])

  const jsExample = useMemo(() => `const response = await fetch(
  '${baseUrl}/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer rute_YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: 'Hello!'
    }]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`, [baseUrl])

  return { curlExample, jsExample }
}

function CodeBlock({ code, label, lang }: { code: string; label: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  const [highlightedHtml, setHighlightedHtml] = useState<string>('')

  useEffect(() => {
    let isMounted = true
    codeToHtml(code, {
      lang,
      theme: 'github-dark',
    }).then((html) => {
      if (isMounted) {
        setHighlightedHtml(html)
      }
    })
    return () => { isMounted = false }
  }, [code, lang])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          {label}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div
        className="shiki-wrapper bg-[var(--bg-input)] rounded-lg p-4 overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  )
}

function CopyableModelId({ modelId }: { modelId: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(modelId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <code className="text-xs font-mono bg-[var(--bg-input)] px-2 py-1 rounded text-[var(--text-secondary)]">
        {modelId}
      </code>
      <button
        onClick={handleCopy}
        className="p-1 text-[var(--text-tertiary)] hover:text-[var(--accent-gold)] transition-colors"
        title="Copy model ID"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  )
}

function Models() {
  const { data: session } = authClient.useSession()
  const models = useQuery(api.models.listModels)
  const isLoading = models === undefined
  const { curlExample, jsExample } = useExamples()

  return (
    <DashboardLayout
      title="Available Models"
      user={
        session?.user || {
          name: 'Loading...',
          email: '',
        }
      }
    >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Choose from our selection of AI models. All models are accessible via the same API endpoint with your API key.
          </p>
        </div>

        {/* Models Table */}
        <div className="card rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2
                className="animate-spin text-[var(--accent-gold)]"
                size={32}
              />
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Model ID</th>
                    <th>Provider</th>
                    <th>Context Window</th>
                    <th>Prompt Price</th>
                    <th>Completion Price</th>
                  </tr>
                </thead>
                <tbody>
                  {models?.map((model) => (
                    <tr key={model.modelId}>
                      <td>
                        <div className="flex items-center gap-2">
                          {providerIcons[model.provider] || (
                            <Brain size={16} className="text-[var(--accent-gold)]" />
                          )}
                          <span className="font-medium text-[var(--text-primary)]">
                            {model.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <CopyableModelId modelId={model.modelId} />
                      </td>
                      <td className="text-sm text-[var(--text-secondary)]">
                        {providerLabels[model.provider] || model.provider}
                      </td>
                      <td className="text-sm text-[var(--text-secondary)]">
                        {formatContextWindow(model.contextWindow)}
                      </td>
                      <td className="text-sm text-[var(--text-secondary)]">
                        {formatPrice(model.promptPricePer1k)}
                      </td>
                      <td className="text-sm text-[var(--text-secondary)]">
                        {formatPrice(model.completionPricePer1k)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* How to Use Section - only show when data is loaded */}
        {!isLoading && (
          <div className="card rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                How to Use
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Make requests to any model using your API key. Simply specify the model ID in your request.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CodeBlock code={curlExample} label="cURL Example" lang="bash" />
              <CodeBlock code={jsExample} label="JavaScript/Node.js Example" lang="javascript" />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Models
