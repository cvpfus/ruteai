import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/DashboardLayout'
import { Plus, Copy, Eye, EyeOff, Trash2, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/api-keys')({
  component: APIKeys,
})

// Mock data
const mockApiKeys = [
  {
    id: 'key_1',
    name: 'Production API Key',
    key: 'rute_sk_prod_1234567890abcdef',
    createdAt: '2024-03-01',
    lastUsed: '2 hours ago',
    status: 'active',
  },
  {
    id: 'key_2',
    name: 'Development API Key',
    key: 'rute_sk_dev_0987654321fedcba',
    createdAt: '2024-03-10',
    lastUsed: '5 minutes ago',
    status: 'active',
  },
  {
    id: 'key_3',
    name: 'Testing API Key',
    key: 'rute_sk_test_abcdef1234567890',
    createdAt: '2024-03-12',
    lastUsed: '3 days ago',
    status: 'inactive',
  },
]

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
}

function APIKeys() {
  const [apiKeys, setApiKeys] = useState(mockApiKeys)
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const toggleKeyVisibility = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyKey = async (id: string, key: string) => {
    await navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const deleteKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id))
  }

  const regenerateKey = (id: string) => {
    // Mock regeneration
    console.log('Regenerate key:', id)
  }

  return (
    <DashboardLayout title="API Keys Management" user={mockUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--text-secondary)]">
              Manage your API keys for accessing the RuteAI API
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-sidebar)] font-medium rounded-lg transition-colors">
            <Plus size={18} />
            Create New Key
          </button>
        </div>

        {/* API Keys List */}
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="card rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {apiKey.name}
                    </h3>
                    <span
                      className={`badge ${apiKey.status === 'active' ? 'badge-success' : 'badge-neutral'}`}
                    >
                      {apiKey.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-tertiary)] mt-1">
                    Created on {apiKey.createdAt} • Last used {apiKey.lastUsed}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => regenerateKey(apiKey.id)}
                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button
                    onClick={() => deleteKey(apiKey.id)}
                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Key Display */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type={showKey[apiKey.id] ? 'text' : 'password'}
                    value={apiKey.key}
                    readOnly
                    className="w-full h-12 px-4 pr-24 font-mono text-sm bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showKey[apiKey.id] ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => copyKey(apiKey.id, apiKey.key)}
                      className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                {copiedId === apiKey.id && (
                  <span className="text-sm text-[var(--success)]">Copied!</span>
                )}
              </div>
            </div>
          ))}
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
