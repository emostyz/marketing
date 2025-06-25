'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  AlertTriangle,
  Server,
  Cpu,
  Zap,
  Globe,
  Shield,
  BarChart3,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/auth/auth-context'

interface BrainProvider {
  id: string
  name: string
  displayName: string
  type: 'openai' | 'anthropic' | 'local' | 'custom'
  config: {
    apiKey?: string
    baseUrl?: string
    model: string
    maxTokens: number
    temperature: number
    systemPrompt: string
    customHeaders?: Record<string, string>
  }
  isActive: boolean
  priority: number
}

interface BrainStatus {
  providers: Array<{
    id: string
    name: string
    status: 'active' | 'inactive' | 'error'
    lastUsed?: Date
    usage24h: number
    avgResponseTime: number
  }>
  fallbackChain: string[]
  configuration: any
}

export default function BrainConfigurationPanel() {
  const { user, subscription } = useAuth()
  const [providers, setProviders] = useState<BrainProvider[]>([])
  const [brainStatus, setBrainStatus] = useState<BrainStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [newProvider, setNewProvider] = useState<Partial<BrainProvider> | null>(null)

  const isEnterprise = subscription?.plan === 'enterprise'

  useEffect(() => {
    if (isEnterprise) {
      loadBrainConfiguration()
    }
  }, [isEnterprise])

  const loadBrainConfiguration = async () => {
    try {
      setLoading(true)
      
      // Load current brain status
      const statusResponse = await fetch('/api/admin/brain/status', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      })
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setBrainStatus(statusData.status)
      }

      // Load current providers
      const providersResponse = await fetch(`/api/admin/brain/providers?organizationId=${user?.id}`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      })
      
      if (providersResponse.ok) {
        const providersData = await providersResponse.json()
        setProviders(providersData.providers || [])
      }

    } catch (error) {
      console.error('Failed to load brain configuration:', error)
      toast.error('Failed to load brain configuration')
    } finally {
      setLoading(false)
    }
  }

  const saveProviderConfiguration = async (provider: BrainProvider) => {
    try {
      const response = await fetch('/api/admin/brain/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          action: 'update_brain_config',
          organizationId: user?.id,
          updatedBy: user?.id,
          config: {
            providers: providers.map(p => p.id === provider.id ? provider : p),
            fallbackStrategy: 'sequential'
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Brain configuration updated successfully')
        await loadBrainConfiguration()
        setEditing(null)
      } else {
        toast.error(result.error || 'Failed to update configuration')
      }

    } catch (error) {
      toast.error('Failed to save configuration')
    }
  }

  const addNewProvider = async () => {
    if (!newProvider) return

    try {
      const provider: BrainProvider = {
        id: `custom_${Date.now()}`,
        name: newProvider.name || 'custom_provider',
        displayName: newProvider.displayName || 'Custom Provider',
        type: newProvider.type || 'custom',
        config: {
          model: newProvider.config?.model ?? '',
          maxTokens: newProvider.config?.maxTokens ?? 0,
          temperature: newProvider.config?.temperature ?? 0,
          systemPrompt: newProvider.config?.systemPrompt ?? '',
          apiKey: newProvider.config?.apiKey ?? '',
          baseUrl: newProvider.config?.baseUrl ?? '',
          customHeaders: newProvider.config?.customHeaders ?? undefined
        },
        isActive: true,
        priority: 50
      }

      await saveProviderConfiguration(provider)
      setNewProvider(null)

    } catch (error) {
      toast.error('Failed to add provider')
    }
  }

  const deleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return

    try {
      const updatedProviders = providers.filter(p => p.id !== providerId)
      
      const response = await fetch('/api/admin/brain/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          action: 'update_brain_config',
          organizationId: user?.id,
          updatedBy: user?.id,
          config: {
            providers: updatedProviders,
            fallbackStrategy: 'sequential'
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Provider deleted successfully')
        await loadBrainConfiguration()
      } else {
        toast.error(result.error || 'Failed to delete provider')
      }

    } catch (error) {
      toast.error('Failed to delete provider')
    }
  }

  const reloadProviders = async () => {
    try {
      const response = await fetch('/api/admin/brain/reload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          organizationId: user?.id,
          requestedBy: user?.id
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Providers reloaded successfully')
        await loadBrainConfiguration()
      } else {
        toast.error(result.error || 'Failed to reload providers')
      }

    } catch (error) {
      toast.error('Failed to reload providers')
    }
  }

  const testProvider = async (providerId: string) => {
    try {
      const response = await fetch('/api/admin/brain/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          providerId,
          organizationId: user?.id
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Provider test successful')
      } else {
        toast.error(result.error || 'Provider test failed')
      }

    } catch (error) {
      toast.error('Failed to test provider')
    }
  }

  if (!isEnterprise) {
    return (
      <Card className="p-8 text-center">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Enterprise Feature</h3>
        <p className="text-gray-400 mb-6">
          Brain configuration is available for Enterprise subscribers only
        </p>
        <Button onClick={() => window.open('/settings/subscription', '_blank')}>
          Upgrade to Enterprise
        </Button>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading brain configuration...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">AI Brain Configuration</h2>
            <p className="text-gray-400">Manage your organization's AI providers and settings</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={reloadProviders}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload
          </Button>
          <Button onClick={() => setNewProvider({})}>
            <Plus className="w-4 h-4 mr-2" />
            Add Provider
          </Button>
        </div>
      </div>

      {/* Brain Status Overview */}
      {brainStatus && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Brain Status Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400">Active Providers</h4>
              <div className="text-2xl font-bold text-green-400">
                {brainStatus.providers.filter(p => p.status === 'active').length}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400">24h Usage</h4>
              <div className="text-2xl font-bold text-blue-400">
                {brainStatus.providers.reduce((sum, p) => sum + p.usage24h, 0)}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400">Avg Response Time</h4>
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round(brainStatus.providers.reduce((sum, p) => sum + p.avgResponseTime, 0) / brainStatus.providers.length || 0)}ms
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Fallback Chain</h4>
            <div className="flex flex-wrap gap-2">
              {brainStatus.fallbackChain.map((providerId, index) => (
                <div key={providerId} className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                    {index + 1}. {providerId}
                  </span>
                  {index < brainStatus.fallbackChain.length - 1 && (
                    <span className="text-gray-600">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Provider Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {provider.type === 'openai' && <Zap className="w-6 h-6 text-green-400" />}
                {provider.type === 'anthropic' && <Brain className="w-6 h-6 text-purple-400" />}
                {provider.type === 'local' && <Server className="w-6 h-6 text-blue-400" />}
                {provider.type === 'custom' && <Settings className="w-6 h-6 text-orange-400" />}
                
                <div>
                  <h3 className="text-lg font-semibold text-white">{provider.displayName}</h3>
                  <p className="text-sm text-gray-400">{provider.type} • {provider.config.model}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {provider.isActive ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                )}
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => testProvider(provider.id)}
                >
                  Test
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setEditing(provider.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => deleteProvider(provider.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {editing === provider.id ? (
              <EditProviderForm 
                provider={provider}
                onSave={(updatedProvider) => saveProviderConfiguration(updatedProvider)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Priority:</span>
                    <span className="text-white ml-2">{provider.priority}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Max Tokens:</span>
                    <span className="text-white ml-2">{provider.config.maxTokens}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Temperature:</span>
                    <span className="text-white ml-2">{provider.config.temperature}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className={`ml-2 ${provider.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {provider.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                {provider.config.baseUrl && (
                  <div className="text-sm">
                    <span className="text-gray-400">Base URL:</span>
                    <span className="text-white ml-2">{provider.config.baseUrl}</span>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add New Provider Modal */}
      {newProvider && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card className="p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-6">Add New AI Provider</h3>
            
            <NewProviderForm 
              provider={newProvider}
              onChange={setNewProvider}
              onSave={addNewProvider}
              onCancel={() => setNewProvider(null)}
            />
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// Provider editing form component
function EditProviderForm({ 
  provider, 
  onSave, 
  onCancel 
}: { 
  provider: BrainProvider
  onSave: (provider: BrainProvider) => void
  onCancel: () => void
}) {
  const [editedProvider, setEditedProvider] = useState<BrainProvider>(provider)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
          <input
            type="text"
            value={editedProvider.displayName}
            onChange={(e) => setEditedProvider({
              ...editedProvider,
              displayName: e.target.value
            })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Model</label>
          <input
            type="text"
            value={editedProvider.config.model}
            onChange={(e) => setEditedProvider({
              ...editedProvider,
              config: {
                ...editedProvider.config,
                model: e.target.value || ''
              }
            })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
          <input
            type="number"
            value={editedProvider.priority}
            onChange={(e) => setEditedProvider({
              ...editedProvider,
              priority: parseInt(e.target.value)
            })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Max Tokens</label>
          <input
            type="number"
            value={editedProvider.config.maxTokens}
            onChange={(e) => setEditedProvider({
              ...editedProvider,
              config: {
                ...editedProvider.config,
                maxTokens: parseInt(e.target.value) || 0
              }
            })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Temperature</label>
        <input
          type="number"
          value={editedProvider.config.temperature}
          onChange={(e) => setEditedProvider({
            ...editedProvider,
            config: {
              ...editedProvider.config,
              temperature: parseFloat(e.target.value) || 0
            }
          })}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
        <input
          type="password"
          value={editedProvider.config.apiKey || ''}
          onChange={(e) => setEditedProvider({
            ...editedProvider,
            config: {
              ...editedProvider.config,
              apiKey: e.target.value
            }
          })}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Base URL</label>
        <input
          type="url"
          value={editedProvider.config.baseUrl || ''}
          onChange={(e) => setEditedProvider({
            ...editedProvider,
            config: {
              ...editedProvider.config,
              baseUrl: e.target.value
            }
          })}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(editedProvider)}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}

// New provider form component
function NewProviderForm({ 
  provider, 
  onChange, 
  onSave, 
  onCancel 
}: { 
  provider: Partial<BrainProvider>
  onChange: (provider: Partial<BrainProvider>) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Provider Type</label>
          <select
            value={provider.type || 'custom'}
            onChange={(e) => onChange({
              ...provider,
              type: e.target.value as any
            })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="local">Local LLM</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
          <input
            type="text"
            value={provider.displayName || ''}
            onChange={(e) => onChange({
              ...provider,
              displayName: e.target.value
            })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
            placeholder="My Custom Provider"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Model Name</label>
          <input
            type="text"
            value={provider.config?.model || ''}
            onChange={(e) => onChange({
              ...provider,
              config: {
                ...provider.config,
                model: e.target.value || ''
              }
            })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
            placeholder="gpt-4-turbo-preview"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Max Tokens</label>
          <input
            type="number"
            value={provider.config?.maxTokens ?? 0}
            onChange={(e) => onChange({
              ...provider,
              config: {
                ...provider.config,
                maxTokens: parseInt(e.target.value) || 0
              }
            })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Temperature</label>
        <input
          type="number"
          value={provider.config?.temperature ?? 0}
          onChange={(e) => onChange({
            ...provider,
            config: {
              ...provider.config,
              temperature: parseFloat(e.target.value) || 0
            }
          })}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
        <input
          type="password"
          value={provider.config?.apiKey || ''}
          onChange={(e) => onChange({
            ...provider,
            config: {
              ...provider.config,
              apiKey: e.target.value
            }
          })}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          placeholder="Your API key"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Base URL</label>
        <input
          type="url"
          value={provider.config?.baseUrl || ''}
          onChange={(e) => onChange({
            ...provider,
            config: {
              ...provider.config,
              baseUrl: e.target.value
            }
          })}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          placeholder="https://api.example.com/v1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">System Prompt</label>
        <textarea
          value={provider.config?.systemPrompt || ''}
          onChange={(e) => onChange({
            ...provider,
            config: {
              ...provider.config,
              systemPrompt: e.target.value
            }
          })}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white h-24"
          placeholder="You are a helpful AI assistant..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          Add Provider
        </Button>
      </div>
    </div>
  )
}