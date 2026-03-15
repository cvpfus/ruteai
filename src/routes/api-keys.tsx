import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import { Plus, Copy, Trash2, X, ShieldAlert, AlertCircle } from 'lucide-react'

import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { authClient } from '../lib/auth-client'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/api-keys')({
  beforeLoad: async ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: APIKeys,
})

function NewKeyModal({
  keyValue,
  onClose,
}: {
  keyValue: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(keyValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent-gold)]/10">
              <ShieldAlert size={20} className="text-[var(--accent-gold)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                Save your API key
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                This is the only time it will be shown.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-4 mb-4">
          <p className="font-mono text-sm text-[var(--text-primary)] break-all select-all">
            {keyValue}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] !text-[#0A0A0A] font-medium rounded-lg transition-colors"
          >
            <Copy size={16} />
            {copied ? 'Copied!' : 'Copy key'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function APIKeys() {
  const { data: session } = authClient.useSession()

  const keys = useQuery(api.apiKeys.listKeys)
  const revokeKey = useMutation(api.apiKeys.revokeKey)

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const copyStart = async (id: string, start: string) => {
    await navigator.clipboard.writeText(start)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteKey = async (id: string) => {
    if (confirm('Are you sure you want to revoke this API key?')) {
      await revokeKey({ keyId: id as any })
    }
  }

  const handleCreateKey = async () => {
    const name = prompt('Enter a name for the new API key:')
    if (!name) return
    setIsCreating(true)
    try {
      const { data, error } = await authClient.apiKey.create({ name })
      if (error) {
        setErrorMessage('Failed to create API key: ' + error.message)
        return
      }
      if (data?.key) {
        setNewKeySecret(data.key)
      }
    } catch (err) {
      setErrorMessage('Failed to create API key: ' + (err as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <DashboardLayout
      title="API Keys Management"
      user={
        session?.user || {
          name: 'Loading...',
          email: '',
        }
      }
    >
      {newKeySecret && (
        <NewKeyModal
          keyValue={newKeySecret}
          onClose={() => setNewKeySecret(null)}
        />
      )}

      <div className="space-y-6">
        {/* Error banner */}
        {errorMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/30">
            <AlertCircle size={20} className="text-[var(--error)] flex-shrink-0" />
            <p className="flex-1 text-sm text-[var(--error)]">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-md text-[var(--error)]/60 hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--text-secondary)]">
              Manage your API keys for accessing the RuteAI API
            </p>
          </div>
          <button
            onClick={handleCreateKey}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] !text-[#0A0A0A] font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus size={18} />
            {isCreating ? 'Creating...' : 'Create New Key'}
          </button>
        </div>

        {/* API Keys List */}
        <div className="space-y-4">
          {!keys ? (
            <p>Loading API keys...</p>
          ) : keys.length === 0 ? (
            <div className="text-center p-8 bg-[var(--bg-input)] rounded-xl border border-dashed border-[var(--border-color)]">
              <p className="text-[var(--text-secondary)]">
                You do not have any API keys yet.
              </p>
            </div>
          ) : (
            keys.map((apiKey) => {
              const displayKey = apiKey.start
                ? `${apiKey.start}${'•'.repeat(24)}`
                : '••••••••••••••••••••••••••••••'

              return (
                <div key={apiKey._id} className="card rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-[var(--text-primary)]">
                          {apiKey.name}
                        </h3>
                        <span
                          className={`badge ${apiKey.enabled ? 'badge-success' : 'badge-neutral'}`}
                        >
                          {apiKey.enabled ? 'active' : 'inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        Created on{' '}
                        {new Date(apiKey.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteKey(apiKey._id)}
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                        title="Revoke"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Key Display — prefix + masked */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <div className="flex items-center h-12 px-4 pr-16 font-mono text-sm bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg">
                        <span className="text-[var(--accent-gold)]">
                          {apiKey.start ?? 'rute_'}
                        </span>
                        <span className="text-[var(--text-tertiary)] tracking-wider">
                          {'•'.repeat(24)}
                        </span>
                      </div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <button
                          onClick={() =>
                            copyStart(apiKey._id, displayKey)
                          }
                          className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
                          title="Copy prefix"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    {copiedId === apiKey._id && (
                      <span className="text-sm text-[var(--success)]">
                        Copied!
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Info Card */}
        <div className="card rounded-xl p-6 bg-[var(--bg-input)] border-dashed">
          <h4 className="font-semibold text-[var(--text-primary)] mb-2">
            API Key Security
          </h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>
              • Keep your API keys secure and never share them in public
              repositories
            </li>
            <li>
              • Use environment variables to store API keys in your applications
            </li>
            <li>• Rotate your keys regularly for enhanced security</li>
            <li>
              • Use separate keys for different environments (development,
              staging, production)
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default APIKeys
