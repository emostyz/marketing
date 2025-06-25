'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, CheckCircle, XCircle, AlertCircle, RefreshCw, 
  Brain, Server, Wifi, WifiOff 
} from 'lucide-react'
import { useEnterpriseAccess } from '@/lib/hooks/useEnterpriseAccess'
import { toast } from 'react-hot-toast'

interface TestResult {
  status: 'idle' | 'testing' | 'success' | 'error'
  message: string
  details?: any
  timestamp?: Date
}

interface EnterpriseAITestPanelProps {
  isEnterprise: boolean
}

export default function EnterpriseAITestPanel({ isEnterprise }: EnterpriseAITestPanelProps) {
  const { getAIEndpoint, getAIConfig, isEnterpriseAIEnabled } = useEnterpriseAccess()
  const [connectionTest, setConnectionTest] = useState<TestResult>({ status: 'idle', message: 'Ready to test' })
  const [aiRoutingTest, setAiRoutingTest] = useState<TestResult>({ status: 'idle', message: 'Ready to test' })

  const testConnection = async () => {
    if (!isEnterprise) {
      toast.error('Enterprise plan required for AI configuration testing')
      return
    }

    setConnectionTest({ status: 'testing', message: 'Testing connection...' })
    
    try {
      const config = getAIConfig()
      if (!config || !config.endpoint) {
        setConnectionTest({ 
          status: 'error', 
          message: 'No enterprise AI configuration found', 
          timestamp: new Date() 
        })
        return
      }

      // Test the configured endpoint
      const testPayload = {
        model: config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 5
      }

      const response = await fetch(config.endpoint + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          ...(config.provider === 'azure' && config.apiVersion ? {
            'api-version': config.apiVersion
          } : {})
        },
        body: JSON.stringify(testPayload)
      })

      if (response.ok) {
        const result = await response.json()
        setConnectionTest({ 
          status: 'success', 
          message: `Connection successful to ${config.provider} endpoint`, 
          details: {
            endpoint: config.endpoint,
            model: config.model,
            provider: config.provider,
            responseTime: Date.now() - (connectionTest.timestamp?.getTime() || Date.now())
          },
          timestamp: new Date() 
        })
        toast.success('Enterprise AI connection verified!')
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      setConnectionTest({ 
        status: 'error', 
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        timestamp: new Date() 
      })
      toast.error('Enterprise AI connection failed')
    }
  }

  const testAIRouting = async () => {
    if (!isEnterprise) {
      toast.error('Enterprise plan required for AI routing testing')
      return
    }

    setAiRoutingTest({ status: 'testing', message: 'Testing AI routing...' })
    
    try {
      const endpoint = getAIEndpoint()
      const isUsingEnterprise = isEnterpriseAIEnabled()

      console.log('🔍 AI Routing Test:', {
        endpoint,
        isUsingEnterprise,
        isEnterprise,
        config: getAIConfig()
      })

      // Test the actual routing logic
      const testData = [
        { name: 'Test', value: 100 },
        { name: 'Data', value: 200 }
      ]

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: testData,
          context: {
            description: 'Enterprise AI routing test',
            businessContext: 'Verification test'
          },
          options: {
            maxInsights: 1,
            includeChartRecommendations: false,
            includeExecutiveSummary: false
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        setAiRoutingTest({ 
          status: 'success', 
          message: isUsingEnterprise 
            ? '✅ Successfully routing to Enterprise AI brain' 
            : '⚠️ Using standard hosted AI (Enterprise AI not configured)',
          details: {
            endpoint,
            usingEnterpriseAI: isUsingEnterprise,
            responseSuccess: result.success,
            processingTime: result.metadata?.processingTimeMs
          },
          timestamp: new Date() 
        })
        
        if (isUsingEnterprise) {
          toast.success('Enterprise AI brain is active and working!')
        } else {
          toast('Using standard AI - configure Enterprise AI above to switch', {
            icon: '⚠️'
          })
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      setAiRoutingTest({ 
        status: 'error', 
        message: `AI routing test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        timestamp: new Date() 
      })
      toast.error('AI routing test failed')
    }
  }

  const resetTests = () => {
    setConnectionTest({ status: 'idle', message: 'Ready to test' })
    setAiRoutingTest({ status: 'idle', message: 'Ready to test' })
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'testing': return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'testing': return 'bg-blue-50 border-blue-200'
      case 'success': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (!isEnterprise) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="text-center py-8">
          <Server className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Enterprise Testing</h3>
          <p className="text-gray-600 mb-4">
            AI configuration testing is available for Enterprise users only.
          </p>
          <Badge variant="secondary">Upgrade Required</Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <span>Enterprise AI Testing Panel</span>
          <Badge className="bg-blue-100 text-blue-800">Live Testing</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center space-x-2">
            <Wifi className="w-4 h-4" />
            <span>Current AI Configuration Status</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Endpoint:</strong> {getAIEndpoint()}
            </div>
            <div>
              <strong>Enterprise AI:</strong> {isEnterpriseAIEnabled() ? '✅ Active' : '❌ Inactive'}
            </div>
            <div>
              <strong>Provider:</strong> {getAIConfig()?.provider || 'Default'}
            </div>
          </div>
        </div>

        {/* Connection Test */}
        <motion.div 
          className={`border rounded-lg p-4 ${getStatusColor(connectionTest.status)}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center space-x-2">
              <Server className="w-4 h-4" />
              <span>Connection Test</span>
            </h4>
            <div className="flex items-center space-x-2">
              {getStatusIcon(connectionTest.status)}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={testConnection}
                disabled={connectionTest.status === 'testing' || !isEnterpriseAIEnabled()}
              >
                {connectionTest.status === 'testing' ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
          </div>
          <p className="text-sm mb-2">{connectionTest.message}</p>
          {connectionTest.details && (
            <div className="text-xs space-y-1 bg-white bg-opacity-50 rounded p-2">
              <div><strong>Endpoint:</strong> {connectionTest.details.endpoint}</div>
              <div><strong>Provider:</strong> {connectionTest.details.provider}</div>
              <div><strong>Model:</strong> {connectionTest.details.model}</div>
              {connectionTest.details.responseTime && (
                <div><strong>Response Time:</strong> {connectionTest.details.responseTime}ms</div>
              )}
            </div>
          )}
          {connectionTest.timestamp && (
            <p className="text-xs text-gray-500 mt-2">
              Tested at {connectionTest.timestamp.toLocaleTimeString()}
            </p>
          )}
          {!isEnterpriseAIEnabled() && (
            <p className="text-xs text-yellow-600 mt-2">
              ⚠️ Configure Enterprise AI settings above to enable connection testing
            </p>
          )}
        </motion.div>

        {/* AI Routing Test */}
        <motion.div 
          className={`border rounded-lg p-4 ${getStatusColor(aiRoutingTest.status)}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>AI Brain Routing Test</span>
            </h4>
            <div className="flex items-center space-x-2">
              {getStatusIcon(aiRoutingTest.status)}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={testAIRouting}
                disabled={aiRoutingTest.status === 'testing'}
              >
                {aiRoutingTest.status === 'testing' ? 'Testing...' : 'Test AI Routing'}
              </Button>
            </div>
          </div>
          <p className="text-sm mb-2">{aiRoutingTest.message}</p>
          {aiRoutingTest.details && (
            <div className="text-xs space-y-1 bg-white bg-opacity-50 rounded p-2">
              <div><strong>Endpoint:</strong> {aiRoutingTest.details.endpoint}</div>
              <div><strong>Using Enterprise AI:</strong> {aiRoutingTest.details.usingEnterpriseAI ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Response Success:</strong> {aiRoutingTest.details.responseSuccess ? '✅ Yes' : '❌ No'}</div>
              {aiRoutingTest.details.processingTime && (
                <div><strong>Processing Time:</strong> {aiRoutingTest.details.processingTime}ms</div>
              )}
            </div>
          )}
          {aiRoutingTest.timestamp && (
            <p className="text-xs text-gray-500 mt-2">
              Tested at {aiRoutingTest.timestamp.toLocaleTimeString()}
            </p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            <strong>Real-time Testing:</strong> These tests verify your Enterprise AI configuration works immediately.
          </div>
          <Button variant="outline" size="sm" onClick={resetTests}>
            Reset Tests
          </Button>
        </div>

        {/* Status Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Live Status Summary</span>
          </h4>
          <div className="text-sm space-y-1">
            <div className="flex items-center space-x-2">
              {isEnterpriseAIEnabled() ? <WifiOff className="w-3 h-3 text-red-500" /> : <Wifi className="w-3 h-3 text-green-500" />}
              <span>
                AI requests are currently routed to: <strong>
                {isEnterpriseAIEnabled() ? 'Your Enterprise LLM' : 'Hosted OpenAI'}
                </strong>
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              {isEnterpriseAIEnabled() 
                ? '🔒 Your data stays within your infrastructure when Enterprise AI is active.'
                : '☁️ Using our hosted AI service. Configure Enterprise AI above to switch immediately.'
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}