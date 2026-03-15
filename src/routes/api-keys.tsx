import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import { Plus, Copy, Eye, EyeOff, Trash2 } from 'lucide-react'

import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { authClient } from '../lib/auth-client'
import { redirect } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/api-keys')({
  //   ssr: false,
  beforeLoad: async ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }

    // await Promise.all([
    //   context.queryClient.ensureQueryData(convexQuery(api.auth.getCurrentUser)),
    // ])
  },
  component: APIKeys,
})

function APIKeys() {
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  console.log('[APIKeys] Session state:', {
    session: session ? 'logged in' : 'no session',
    isSessionPending,
  })

//   const user = useSuspenseQuery(convexQuery(api.auth.getCurrentUser))

//   console.log('[APIKeys] User:', user)

  const keys = useQuery(api.apiKeys.listKeys)
  console.log('[APIKeys] Keys:', keys)
  console.log('[APIKeys] Keys query result:', {
    keys: keys ? `found ${keys.length} keys` : 'undefined (loading)',
  })

  const createKey = useMutation(api.apiKeys.createKey)
  const revokeKey = useMutation(api.apiKeys.revokeKey)

  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const toggleKeyVisibility = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyKey = async (id: string, key: string) => {
    await navigator.clipboard.writeText(key)
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
    console.log('[handleCreateKey] Creating key with name:', name)
    setIsCreating(true)
    try {
      const result = await createKey({ name })
      console.log('[handleCreateKey] Key created successfully:', result)
    } catch (err) {
      console.error('[handleCreateKey] Failed to create API key:', err)
      alert('Failed to create API key: ' + (err as Error).message)
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
      <div className="space-y-6">
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
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-sidebar)] font-medium rounded-lg transition-colors disabled:opacity-50"
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
            keys.map((apiKey) => (
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

                {/* Key Display */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type={showKey[apiKey._id] ? 'text' : 'password'}
                      value={apiKey.key}
                      readOnly
                      className="w-full h-12 px-4 pr-24 font-mono text-sm bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        onClick={() => toggleKeyVisibility(apiKey._id)}
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        {showKey[apiKey._id] ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => copyKey(apiKey._id, apiKey.key)}
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
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
            ))
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
