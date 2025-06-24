'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Crown, 
  Download, 
  Server, 
  Shield, 
  Cpu, 
  HardDrive,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Terminal,
  Settings,
  Play,
  Pause,
  Monitor
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/auth/auth-context'

interface LocalLLMModel {
  id: string
  name: string
  displayName: string
  description: string
  modelSize: string
  requirements: {
    minMemoryGB: number
    minCPUCores: number
    gpuOptional: boolean
    storageGB: number
  }
  downloadUrl: string
  installGuide: string
  performance: {
    speed: 'Fast' | 'Medium' | 'Slow'
    quality: 'High' | 'Medium' | 'Good'
    useCase: string
  }
}

export default function LocalLLMSetupPage() {
  const router = useRouter()
  const { user, subscription } = useAuth()
  const [selectedModel, setSelectedModel] = useState<LocalLLMModel | null>(null)
  const [setupStep, setSetupStep] = useState(1)
  const [systemChecks, setSystemChecks] = useState({
    memory: false,
    cpu: false,
    storage: false,
    gpu: false
  })
  const [loading, setLoading] = useState(false)
  const [serverUrl, setServerUrl] = useState('http://localhost:8000')
  const [isConnected, setIsConnected] = useState(false)

  // Check if user has enterprise plan
  const hasEnterprisePlan = subscription?.plan === 'enterprise'

  const availableModels: LocalLLMModel[] = [
    {
      id: 'llama-2-70b',
      name: 'llama-2-70b-chat',
      displayName: 'Llama 2 70B Chat',
      description: 'Meta\'s powerful open-source conversational AI model. Excellent for general business use.',
      modelSize: '140 GB',
      requirements: {
        minMemoryGB: 80,
        minCPUCores: 16,
        gpuOptional: true,
        storageGB: 150
      },
      downloadUrl: 'https://huggingface.co/meta-llama/Llama-2-70b-chat-hf',
      installGuide: '/docs/local-llm/llama-setup',
      performance: {
        speed: 'Medium',
        quality: 'High',
        useCase: 'General business analysis and presentation generation'
      }
    },
    {
      id: 'codellama-34b',
      name: 'codellama-34b-instruct',
      displayName: 'Code Llama 34B',
      description: 'Specialized for code generation and technical analysis. Great for data processing workflows.',
      modelSize: '68 GB',
      requirements: {
        minMemoryGB: 40,
        minCPUCores: 8,
        gpuOptional: true,
        storageGB: 80
      },
      downloadUrl: 'https://huggingface.co/codellama/CodeLlama-34b-Instruct-hf',
      installGuide: '/docs/local-llm/codellama-setup',
      performance: {
        speed: 'Fast',
        quality: 'High',
        useCase: 'Technical analysis and data processing'
      }
    },
    {
      id: 'mistral-7b',
      name: 'mistral-7b-instruct',
      displayName: 'Mistral 7B Instruct',
      description: 'Efficient and capable model with lower hardware requirements. Perfect for smaller deployments.',
      modelSize: '14 GB',
      requirements: {
        minMemoryGB: 16,
        minCPUCores: 4,
        gpuOptional: false,
        storageGB: 20
      },
      downloadUrl: 'https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2',
      installGuide: '/docs/local-llm/mistral-setup',
      performance: {
        speed: 'Fast',
        quality: 'Good',
        useCase: 'Lightweight analysis and basic presentation generation'
      }
    }
  ]

  useEffect(() => {
    if (!hasEnterprisePlan) {
      toast.error('Enterprise plan required for Local LLM support')
      router.push('/settings')
      return
    }

    performSystemChecks()
  }, [hasEnterprisePlan])

  const performSystemChecks = async () => {
    // Simulate system checks (in production, these would be real hardware checks)
    setLoading(true)
    
    setTimeout(() => {
      setSystemChecks({
        memory: navigator.deviceMemory ? navigator.deviceMemory >= 16 : true,
        cpu: navigator.hardwareConcurrency ? navigator.hardwareConcurrency >= 4 : true,
        storage: true, // Assume sufficient storage
        gpu: true // Assume GPU available
      })
      setLoading(false)
    }, 2000)
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsConnected(true)
      toast.success('Successfully connected to local LLM server!')
    } catch (error) {
      setIsConnected(false)
      toast.error('Failed to connect to local LLM server')
    } finally {
      setLoading(false)
    }
  }

  const setupLocalLLM = async () => {
    if (!selectedModel) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/ai-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`
        },
        body: JSON.stringify({
          action: 'setup_local_llm',
          organizationId: user?.current_organization_id,
          userId: user?.id,
          config: {
            modelPath: selectedModel.downloadUrl,
            modelName: selectedModel.name,
            serverUrl: serverUrl,
            hardware: {
              gpu: systemChecks.gpu,
              memoryGB: selectedModel.requirements.minMemoryGB,
              threads: selectedModel.requirements.minCPUCores
            },
            performance: {
              batchSize: 1,
              contextLength: 4096,
              temperature: 0.7
            }
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Local LLM configured successfully!')
        setSetupStep(4)
      } else {
        toast.error(result.error || 'Failed to setup Local LLM')
      }

    } catch (error) {
      toast.error('Setup failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (!hasEnterprisePlan) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Enterprise Only</h2>
          <p className="text-gray-400 mb-6">
            Local LLM support requires an Enterprise subscription
          </p>
          <Button onClick={() => router.push('/settings/subscription')}>
            Upgrade to Enterprise
          </Button>
        </Card>
      </div>
    )
  }

  const renderSystemChecks = () => (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Monitor className="w-6 h-6" />
        System Requirements Check
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white font-medium">Memory (RAM)</p>
              <p className="text-gray-400 text-sm">
                {selectedModel ? `${selectedModel.requirements.minMemoryGB}GB required` : '16GB+ recommended'}
              </p>
            </div>
          </div>
          {systemChecks.memory ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white font-medium">CPU Cores</p>
              <p className="text-gray-400 text-sm">
                {selectedModel ? `${selectedModel.requirements.minCPUCores}+ cores required` : '4+ cores recommended'}
              </p>
            </div>
          </div>
          {systemChecks.cpu ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white font-medium">Storage</p>
              <p className="text-gray-400 text-sm">
                {selectedModel ? `${selectedModel.requirements.storageGB}GB required` : '20GB+ recommended'}
              </p>
            </div>
          </div>
          {systemChecks.storage ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white font-medium">GPU (Optional)</p>
              <p className="text-gray-400 text-sm">Accelerates inference speed</p>
            </div>
          </div>
          {systemChecks.gpu ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Checking system...</p>
        </div>
      ) : (
        <Button 
          onClick={performSystemChecks}
          className="w-full mt-6"
          variant="outline"
        >
          Re-check System
        </Button>
      )}
    </Card>
  )

  const renderModelSelection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Choose Your Local LLM Model</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableModels.map((model) => (
          <Card 
            key={model.id} 
            className={`p-6 cursor-pointer transition-all ${
              selectedModel?.id === model.id 
                ? 'border-blue-500 bg-blue-950/20' 
                : 'hover:border-gray-600'
            }`}
            onClick={() => setSelectedModel(model)}
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-white">{model.displayName}</h4>
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                {model.modelSize}
              </span>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">{model.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Speed:</span>
                <span className="text-white">{model.performance.speed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Quality:</span>
                <span className="text-white">{model.performance.quality}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Memory:</span>
                <span className="text-white">{model.requirements.minMemoryGB}GB</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(model.downloadUrl, '_blank')
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Model
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(model.installGuide, '_blank')
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Setup Guide
              </Button>
            </div>

            {selectedModel?.id === model.id && (
              <div className="mt-4 p-3 bg-blue-950/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                <p className="text-green-400 text-center text-sm mt-1">Selected</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )

  const renderServerSetup = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Configure Local Server</h3>
      
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Installation Commands</h4>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm mb-2">1. Install Ollama (recommended local LLM server):</p>
            <div className="bg-gray-900 p-3 rounded-lg flex items-center justify-between">
              <code className="text-green-400 text-sm">curl -fsSL https://ollama.ai/install.sh | sh</code>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard('curl -fsSL https://ollama.ai/install.sh | sh')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">2. Pull the selected model:</p>
            <div className="bg-gray-900 p-3 rounded-lg flex items-center justify-between">
              <code className="text-green-400 text-sm">
                ollama pull {selectedModel?.name || 'mistral:7b'}
              </code>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(`ollama pull ${selectedModel?.name || 'mistral:7b'}`)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">3. Start the server:</p>
            <div className="bg-gray-900 p-3 rounded-lg flex items-center justify-between">
              <code className="text-green-400 text-sm">ollama serve</code>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard('ollama serve')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Server Connection</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Server URL:</label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              placeholder="http://localhost:8000"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={testConnection}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : isConnected ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>

            {isConnected && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>Connected</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )

  const renderCompletion = () => (
    <div className="text-center space-y-6">
      <CheckCircle className="w-24 h-24 text-green-400 mx-auto" />
      
      <div>
        <h3 className="text-2xl font-semibold text-white mb-2">Local LLM Setup Complete!</h3>
        <p className="text-gray-400">
          Your {selectedModel?.displayName} is now configured and ready to use.
        </p>
      </div>

      <Card className="p-6 text-left">
        <h4 className="text-lg font-semibold text-white mb-4">What's Next?</h4>
        <ul className="space-y-2 text-gray-400">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Complete privacy - your data never leaves your infrastructure
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Works offline without internet connection
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            No per-token costs or API limits
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Full control over model parameters and behavior
          </li>
        </ul>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={() => router.push('/settings')}>
          AI Settings
        </Button>
      </div>
    </div>
  )

  const stepProgress = (setupStep / 4) * 100

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Local LLM Setup</h1>
              <p className="text-gray-400">Configure your private, offline AI assistant</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-yellow-900 text-yellow-300 text-sm rounded-full">
                Enterprise Only
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>System Check</span>
            <span>Model Selection</span>
            <span>Server Setup</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={setupStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {setupStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderSystemChecks()}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Benefits of Local LLM</h3>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span>Complete data privacy and security</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <WifiOff className="w-5 h-5 text-blue-400" />
                    <span>Works completely offline</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-purple-400" />
                    <span>No API costs or rate limits</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-orange-400" />
                    <span>Full control over model behavior</span>
                  </li>
                </ul>
                
                <div className="mt-6">
                  <Button 
                    onClick={() => setSetupStep(2)}
                    disabled={!Object.values(systemChecks).some(check => check)}
                    className="w-full"
                  >
                    Continue to Model Selection
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {setupStep === 2 && (
            <div>
              {renderModelSelection()}
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setSetupStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setSetupStep(3)}
                  disabled={!selectedModel}
                >
                  Continue to Server Setup
                </Button>
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div>
              {renderServerSetup()}
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setSetupStep(2)}>
                  Back
                </Button>
                <Button 
                  onClick={setupLocalLLM}
                  disabled={!isConnected || loading}
                >
                  {loading ? 'Configuring...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}

          {setupStep === 4 && renderCompletion()}
        </motion.div>
      </div>
    </div>
  )
}