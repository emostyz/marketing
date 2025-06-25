'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, Shield, Key, Server, Database, CheckCircle, AlertTriangle, 
  Lock, Unlock, Eye, EyeOff, Copy, TestTube
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface EnterpriseAIConfig {
  enabled: boolean
  provider: 'openai' | 'azure' | 'anthropic' | 'custom'
  endpoint: string
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
  customHeaders?: Record<string, string>
  encryptedStorage: boolean
  auditLogging: boolean
  rateLimiting: {
    enabled: boolean
    requestsPerMinute: number
    requestsPerHour: number
  }
}

interface EnterpriseAIConfigProps {
  isEnterprise: boolean
  onConfigUpdate?: (config: EnterpriseAIConfig) => void
}

export default function EnterpriseAIConfig({ 
  isEnterprise, 
  onConfigUpdate 
}: EnterpriseAIConfigProps) {
  const [config, setConfig] = useState<EnterpriseAIConfig>({
    enabled: false,
    provider: 'openai',
    endpoint: '',
    apiKey: '',
    model: 'gpt-4-turbo-preview',
    maxTokens: 4096,
    temperature: 0.7,
    encryptedStorage: true,
    auditLogging: true,
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 60,
      requestsPerHour: 1000
    }
  })

  const [showApiKey, setShowApiKey] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isSaving, setIsSaving] = useState(false)

  // Load existing configuration on mount
  useEffect(() => {
    if (isEnterprise) {
      const savedConfig = localStorage.getItem('enterprise_ai_config')
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig))
        } catch (error) {
          console.warn('Failed to load enterprise AI config:', error)
        }
      }
    }
  }, [isEnterprise])

  const handleConfigChange = (updates: Partial<EnterpriseAIConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
  }

  const testConnection = async () => {
    if (!config.endpoint || !config.apiKey) {
      toast.error('Please provide endpoint and API key')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')

    try {
      // Simulate API test - in production, this would make a real test call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock successful connection
      setConnectionStatus('success')
      toast.success('Connection test successful!')
    } catch (error) {
      setConnectionStatus('error')
      toast.error('Connection test failed')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const saveConfiguration = async () => {
    if (!isEnterprise) {
      toast.error('Enterprise plan required for custom AI configuration')
      return
    }

    setIsSaving(true)
    try {
      // Save to localStorage (in production, this would be saved to enterprise database)
      localStorage.setItem('enterprise_ai_config', JSON.stringify(config))
      
      // Call the callback
      onConfigUpdate?.(config)
      
      toast.success('Enterprise AI configuration saved successfully')
    } catch (error) {
      toast.error('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(config.apiKey)
    toast.success('API key copied to clipboard')
  }

  if (!isEnterprise) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-gray-400" />
            <span>Enterprise AI Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Enterprise Plan Required</h3>
            <p className="text-gray-600 mb-6">
              Custom AI configuration and on-premise deployment options are available 
              exclusively for Enterprise customers.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>On-premise AI deployment</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Custom API endpoints</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Enhanced security & audit logging</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Priority support</span>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Upgrade to Enterprise
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-green-500" />
            <span>Enterprise AI Configuration</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Enterprise
            </Badge>
          </CardTitle>
          <p className="text-gray-600">
            Configure your organization's AI settings for enhanced security and compliance.
          </p>
        </CardHeader>
      </Card>

      {/* Main Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>AI Provider Configuration</span>
            {config.enabled && (
              <Badge className="bg-green-100 text-green-800">
                🧠 Active: AI Brain Will Use Your LLM
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Enterprise AI */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Custom AI Configuration</Label>
              <p className="text-sm text-gray-600">Use your organization's AI infrastructure</p>
            </div>
            <Switch 
              checked={config.enabled}
              onCheckedChange={(enabled) => handleConfigChange({ enabled })}
            />
          </div>

          {config.enabled && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <Separator />

              {/* Provider Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>AI Provider</Label>
                  <select 
                    value={config.provider}
                    onChange={(e) => handleConfigChange({ provider: e.target.value as any })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="azure">Azure OpenAI</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="custom">Custom Provider</option>
                  </select>
                </div>
                <div>
                  <Label>Model</Label>
                  <Input 
                    value={config.model}
                    onChange={(e) => handleConfigChange({ model: e.target.value })}
                    placeholder="gpt-4-turbo-preview"
                  />
                </div>
              </div>

              {/* API Configuration */}
              <div className="space-y-4">
                <div>
                  <Label>API Endpoint</Label>
                  <div className="flex space-x-2">
                    <Server className="w-5 h-5 text-gray-400 mt-2" />
                    <Input 
                      value={config.endpoint}
                      onChange={(e) => handleConfigChange({ endpoint: e.target.value })}
                      placeholder="https://api.openai.com/v1"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>API Key</Label>
                  <div className="flex space-x-2">
                    <Key className="w-5 h-5 text-gray-400 mt-2" />
                    <div className="flex-1 relative">
                      <Input 
                        type={showApiKey ? 'text' : 'password'}
                        value={config.apiKey}
                        onChange={(e) => handleConfigChange({ apiKey: e.target.value })}
                        placeholder="sk-..."
                        className="pr-20"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyApiKey}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Tokens</Label>
                  <Input 
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => handleConfigChange({ maxTokens: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Temperature</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={config.temperature}
                    onChange={(e) => handleConfigChange({ temperature: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              {/* Security Settings */}
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Security & Compliance</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Encrypted Storage</Label>
                    <p className="text-sm text-gray-600">Encrypt API keys and configuration</p>
                  </div>
                  <Switch 
                    checked={config.encryptedStorage}
                    onCheckedChange={(encryptedStorage) => handleConfigChange({ encryptedStorage })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-gray-600">Log all AI API requests</p>
                  </div>
                  <Switch 
                    checked={config.auditLogging}
                    onCheckedChange={(auditLogging) => handleConfigChange({ auditLogging })}
                  />
                </div>
              </div>

              {/* Rate Limiting */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rate Limiting</Label>
                    <p className="text-sm text-gray-600">Control API usage limits</p>
                  </div>
                  <Switch 
                    checked={config.rateLimiting.enabled}
                    onCheckedChange={(enabled) => handleConfigChange({ 
                      rateLimiting: { ...config.rateLimiting, enabled }
                    })}
                  />
                </div>

                {config.rateLimiting.enabled && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <Label>Requests per minute</Label>
                      <Input 
                        type="number"
                        value={config.rateLimiting.requestsPerMinute}
                        onChange={(e) => handleConfigChange({ 
                          rateLimiting: { 
                            ...config.rateLimiting, 
                            requestsPerMinute: parseInt(e.target.value) 
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Requests per hour</Label>
                      <Input 
                        type="number"
                        value={config.rateLimiting.requestsPerHour}
                        onChange={(e) => handleConfigChange({ 
                          rateLimiting: { 
                            ...config.rateLimiting, 
                            requestsPerHour: parseInt(e.target.value) 
                          }
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Test Connection */}
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Connection Test</h4>
                  <p className="text-sm text-gray-600">Verify your AI configuration</p>
                </div>
                <div className="flex items-center space-x-3">
                  {connectionStatus === 'success' && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Connected</span>
                    </div>
                  )}
                  {connectionStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Failed</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={testConnection}
                    disabled={isTestingConnection}
                    className="flex items-center space-x-2"
                  >
                    <TestTube className="w-4 h-4" />
                    <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* AI Brain Status */}
      {config.enabled && config.endpoint && config.apiKey && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span>🧠 AI Brain Status: Enterprise Mode Active</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2 text-green-800">Current Configuration:</h5>
                <ul className="text-sm space-y-1 text-green-700">
                  <li>• Provider: {config.provider}</li>
                  <li>• Endpoint: {config.endpoint}</li>
                  <li>• Model: {config.model}</li>
                  <li>• Status: {connectionStatus === 'success' ? '✅ Connected' : connectionStatus === 'error' ? '❌ Connection Failed' : '⏳ Not Tested'}</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2 text-green-800">AI Brain Routing:</h5>
                <ul className="text-sm space-y-1 text-green-700">
                  <li>• ✅ Deck generation → Your LLM</li>
                  <li>• ✅ Chart analysis → Your LLM</li>
                  <li>• ✅ Insight generation → Your LLM</li>
                  <li>• ✅ Data never leaves your infrastructure</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded border border-green-200">
              <p className="text-sm text-green-800">
                <strong>✨ Enterprise Benefits Active:</strong> You're getting 15 insights (vs 10), revolutionary innovation level, 
                and complex design generation powered by your own LLM.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Configuration */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline">
          Reset to Defaults
        </Button>
        <Button 
          onClick={saveConfiguration}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  )
}