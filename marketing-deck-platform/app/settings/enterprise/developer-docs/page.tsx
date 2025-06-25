'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth/auth-context'
import { useEnterpriseAccess } from '@/lib/hooks/useEnterpriseAccess'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, Shield, Zap, Users, Lock, Bell, Eye, Palette,
  ChevronLeft, Building, Crown, Server, Code, Terminal,
  Book, Cpu, Network, Database, FileCode, GitBranch,
  AlertTriangle, CheckCircle, Copy, ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function EnterpriseDeveloperDocsPage() {
  const { user, loading } = useAuth()
  const { isEnterprise } = useEnterpriseAccess()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    toast.success('Code copied to clipboard!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading developer documentation...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to access developer documentation.</p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isEnterprise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-lg">
          <CardContent className="text-center p-8">
            <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Enterprise Access Required</h2>
            <p className="text-gray-600 mb-4">
              Developer documentation is available exclusively to Enterprise customers.
            </p>
            <Badge variant="secondary" className="mb-4">Upgrade Required</Badge>
            <p className="text-sm text-gray-500">
              Contact sales to upgrade to Enterprise and unlock advanced AI integration capabilities.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-400 ml-2">{language}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(code, id)}
            className="text-gray-400 hover:text-white"
          >
            {copiedCode === id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <pre className="p-4 text-sm text-green-400 overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <Link href="/settings/enterprise">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Enterprise Settings
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Code className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Enterprise Developer Documentation</h1>
                  <p className="text-gray-600">Complete technical guide for custom AI integration</p>
                </div>
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Enterprise Only
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="authentication">Auth</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="troubleshooting">Debug</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="w-5 h-5" />
                  <span>Enterprise AI Integration Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">What You Can Do</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• <strong>Any LLM Provider:</strong> OpenAI, Anthropic, Azure OpenAI, Google PaLM, Cohere, or custom</li>
                    <li>• <strong>On-Premise Deployment:</strong> vLLM, Ollama, LocalAI, or your own infrastructure</li>
                    <li>• <strong>API-Based Services:</strong> Third-party hosted or managed AI services</li>
                    <li>• <strong>Custom Models:</strong> Fine-tuned models, proprietary algorithms, or specialized AI systems</li>
                    <li>• <strong>Hybrid Setups:</strong> Multiple models for different use cases</li>
                    <li>• <strong>Complete Control:</strong> Data never leaves your infrastructure when configured</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <Shield className="w-8 h-8 text-green-600 mb-2" />
                      <h4 className="font-semibold text-green-900">Security First</h4>
                      <p className="text-sm text-green-800">Your data stays within your infrastructure</p>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <Zap className="w-8 h-8 text-blue-600 mb-2" />
                      <h4 className="font-semibold text-blue-900">Real-time Switching</h4>
                      <p className="text-sm text-blue-800">Instant routing to your AI endpoint</p>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <Cpu className="w-8 h-8 text-purple-600 mb-2" />
                      <h4 className="font-semibold text-purple-900">Enhanced Features</h4>
                      <p className="text-sm text-purple-800">15 insights, advanced algorithms</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Terminal className="w-5 h-5 mr-2" />
                    Architecture Overview
                  </h3>
                  <div className="text-gray-300 text-sm space-y-2 font-mono">
                    <div>┌─ User Request ─────────────────────────────────────┐</div>
                    <div>│                                                   │</div>
                    <div>├─ useEnterpriseAccess() ──→ Check Configuration    │</div>
                    <div>│                                                   │</div>
                    <div>├─ getAIEndpoint() ────────→ Route Decision         │</div>
                    <div>│                           ├─ Enterprise: YOUR_LLM │</div>
                    <div>│                           └─ Standard: Hosted AI  │</div>
                    <div>│                                                   │</div>
                    <div>├─ Request Headers ────────→ Custom Auth + API Key  │</div>
                    <div>│                                                   │</div>
                    <div>└─ Response Processing ───→ Enhanced Features       │</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Setup */}
          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-5 h-5" />
                  <span>LLM Setup Instructions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* vLLM Setup */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">1</div>
                    vLLM (Recommended)
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-gray-600">Deploy any HuggingFace model with OpenAI-compatible API</p>
                    
                    <h4 className="font-medium">Installation:</h4>
                    <CodeBlock 
                      language="bash"
                      id="vllm-install"
                      code={`# Install vLLM with CUDA support
pip install vllm

# For CPU-only deployment
pip install vllm[cpu]

# For specific GPU configurations
pip install vllm[cuda11.8]  # or cuda12.1`}
                    />

                    <h4 className="font-medium">Start Server:</h4>
                    <CodeBlock 
                      language="bash"
                      id="vllm-start"
                      code={`# Basic deployment
python -m vllm.entrypoints.openai.api_server \\
  --model microsoft/DialoGPT-medium \\
  --host 0.0.0.0 \\
  --port 8000 \\
  --api-key your-secure-api-key

# Production deployment with more options
python -m vllm.entrypoints.openai.api_server \\
  --model meta-llama/Llama-2-7b-chat-hf \\
  --host 0.0.0.0 \\
  --port 8000 \\
  --api-key ent_$(openssl rand -hex 16) \\
  --tensor-parallel-size 2 \\
  --max-model-len 4096 \\
  --served-model-name llama-2-7b \\
  --trust-remote-code`}
                    />

                    <h4 className="font-medium">Configuration in Platform:</h4>
                    <CodeBlock 
                      language="json"
                      id="vllm-config"
                      code={`{
  "provider": "openai",
  "endpoint": "https://your-vllm-server.company.com:8000/v1",
  "apiKey": "your-secure-api-key",
  "model": "meta-llama/Llama-2-7b-chat-hf",
  "headers": {
    "X-Custom-Auth": "your-internal-auth-token"
  }
}`}
                    />
                  </div>
                </div>

                {/* Ollama Setup */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">2</div>
                    Ollama with OpenAI Compatibility
                  </h3>
                  
                  <div className="space-y-4">
                    <CodeBlock 
                      language="bash"
                      id="ollama-setup"
                      code={`# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download models
ollama pull llama2:7b
ollama pull codellama:7b
ollama pull mistral:7b

# Install OpenAI compatibility layer
pip install ollama-openai-compat

# Start OpenAI-compatible server
ollama-openai-compat \\
  --host 0.0.0.0 \\
  --port 8000 \\
  --model llama2:7b`}
                    />
                  </div>
                </div>

                {/* Azure OpenAI */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">3</div>
                    Azure OpenAI Service
                  </h3>
                  
                  <div className="space-y-4">
                    <CodeBlock 
                      language="bash"
                      id="azure-setup"
                      code={`# Create Azure OpenAI resource
az cognitiveservices account create \\
  --name my-openai-resource \\
  --resource-group my-resource-group \\
  --kind OpenAI \\
  --sku S0 \\
  --location eastus

# Deploy a model
az cognitiveservices account deployment create \\
  --name my-openai-resource \\
  --resource-group my-resource-group \\
  --deployment-name gpt-4 \\
  --model-name gpt-4 \\
  --model-version "0613" \\
  --model-format OpenAI \\
  --scale-settings-scale-type "Standard"`}
                    />

                    <h4 className="font-medium">Platform Configuration:</h4>
                    <CodeBlock 
                      language="json"
                      id="azure-config"
                      code={`{
  "provider": "azure",
  "endpoint": "https://your-resource.openai.azure.com",
  "apiKey": "your-azure-api-key",
  "model": "gpt-4",
  "apiVersion": "2023-12-01-preview",
  "headers": {
    "X-Azure-Subscription": "your-subscription-id"
  }
}`}
                    />
                  </div>
                </div>

                {/* Custom API */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">4</div>
                    Custom API Integration
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-gray-600">Integrate any AI service by creating an OpenAI-compatible wrapper</p>
                    
                    <CodeBlock 
                      language="python"
                      id="custom-wrapper"
                      code={`# Custom API wrapper example (Flask)
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/v1/chat/completions', methods=['POST'])
def chat_completions():
    data = request.json
    
    # Transform request to your API format
    custom_request = {
        "prompt": data["messages"][-1]["content"],
        "max_tokens": data.get("max_tokens", 150),
        "temperature": data.get("temperature", 0.7)
    }
    
    # Call your custom AI service
    response = requests.post(
        "https://your-custom-ai-api.com/generate",
        json=custom_request,
        headers={"Authorization": "Bearer YOUR_API_KEY"}
    )
    
    # Transform response to OpenAI format
    result = response.json()
    return jsonify({
        "choices": [{
            "message": {
                "role": "assistant",
                "content": result["generated_text"]
            }
        }]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints */}
          <TabsContent value="endpoints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Network className="w-5 h-5" />
                  <span>API Endpoints & Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Required Endpoint</h4>
                      <p className="text-sm text-yellow-800">
                        Your LLM must implement the OpenAI Chat Completions API at minimum.
                        This is the only endpoint our platform uses for AI requests.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Required Endpoint Implementation</h3>
                  
                  <h4 className="font-medium mb-2">POST /v1/chat/completions</h4>
                  <CodeBlock 
                    language="typescript"
                    id="endpoint-spec"
                    code={`// Request format our platform sends
interface ChatCompletionRequest {
  model: string
  messages: Array<{
    role: "system" | "user" | "assistant"
    content: string
  }>
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

// Response format your endpoint must return
interface ChatCompletionResponse {
  id: string
  object: "chat.completion"
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: "assistant"
      content: string
    }
    finish_reason: "stop" | "length" | "content_filter"
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Example Request/Response</h3>
                  
                  <h4 className="font-medium mb-2">Request from our platform:</h4>
                  <CodeBlock 
                    language="json"
                    id="example-request"
                    code={`{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert data analyst. Analyze the provided data and generate actionable business insights."
    },
    {
      "role": "user", 
      "content": "Analyze this sales data: [{"month": "Jan", "revenue": 100000, "customers": 500}, {"month": "Feb", "revenue": 120000, "customers": 600}]. Generate 3 key insights with business recommendations."
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.7
}`}
                  />

                  <h4 className="font-medium mb-2 mt-4">Expected response from your LLM:</h4>
                  <CodeBlock 
                    language="json"
                    id="example-response"
                    code={`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1699896916,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Based on the sales data analysis, here are 3 key insights:\\n\\n1. **Revenue Growth Acceleration**: 20% month-over-month revenue increase from $100K to $120K indicates strong business momentum.\\n   - Recommendation: Scale marketing efforts to maintain this growth trajectory\\n\\n2. **Customer Acquisition Efficiency**: 20% increase in customers (500 to 600) aligns with revenue growth, suggesting healthy unit economics.\\n   - Recommendation: Invest in customer retention programs to maximize lifetime value\\n\\n3. **Average Revenue Per Customer**: Consistent at $200 per customer indicates stable pricing power.\\n   - Recommendation: Test premium pricing tiers to capture additional value from high-engagement customers"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Platform Integration Points</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Deck Builder Integration</h4>
                        <p className="text-sm text-blue-800 mb-2">
                          File: <code>components/deck-builder/UltimateDeckBuilder.tsx:783-793</code>
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Real-time endpoint detection</li>
                          <li>• Automatic request routing</li>
                          <li>• Enhanced enterprise features</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-900 mb-2">AI Analysis Service</h4>
                        <p className="text-sm text-green-800 mb-2">
                          File: <code>app/api/ai/analyze/route.ts</code>
                        </p>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Data preprocessing</li>
                          <li>• Insight generation</li>
                          <li>• Chart recommendations</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication */}
          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Authentication & Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Authentication Methods</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">1. Bearer Token (Recommended)</h4>
                      <CodeBlock 
                        language="bash"
                        id="bearer-auth"
                        code={`# Your endpoint receives:
Authorization: Bearer your-api-key

# Configure in platform:
{
  "apiKey": "your-api-key"
}`}
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">2. Custom Headers</h4>
                      <CodeBlock 
                        language="bash"
                        id="custom-headers"
                        code={`# Configure custom authentication headers:
{
  "headers": {
    "X-API-Key": "your-api-key",
    "X-Enterprise-Auth": "enterprise-token",
    "X-Tenant-ID": "your-tenant-id"
  }
}`}
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">3. Azure OpenAI Authentication</h4>
                      <CodeBlock 
                        language="bash"
                        id="azure-auth"
                        code={`# Azure-specific headers:
{
  "apiKey": "your-azure-key",
  "apiVersion": "2023-12-01-preview",
  "headers": {
    "api-key": "your-azure-key"
  }
}`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Security Implementation</h3>
                  
                  <CodeBlock 
                    language="typescript"
                    id="security-implementation"
                    code={`// How our platform handles your authentication
// File: components/deck-builder/UltimateDeckBuilder.tsx

const headers: Record<string, string> = { 
  'Content-Type': 'application/json' 
}

// Add enterprise headers if configured
if (isEnterprise && aiConfig.headers) {
  Object.assign(headers, aiConfig.headers)
}

// Add API key authentication
if (aiConfig.apiKey) {
  if (aiConfig.provider === 'azure') {
    headers['api-key'] = aiConfig.apiKey
  } else {
    headers['Authorization'] = \`Bearer \${aiConfig.apiKey}\`
  }
}

// Make request to your endpoint
const response = await fetch(aiEndpoint, {
  method: 'POST',
  headers,
  body: JSON.stringify(requestData)
})`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Network Security Requirements</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-red-900 mb-2">Required</h4>
                        <ul className="text-sm text-red-800 space-y-1">
                          <li>• Valid SSL/TLS certificate</li>
                          <li>• HTTPS endpoint (port 443)</li>
                          <li>• TLS 1.2 or higher</li>
                          <li>• Certificate chain validation</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">Recommended</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• IP whitelisting</li>
                          <li>• VPN or private network</li>
                          <li>• Client certificate auth</li>
                          <li>• Rate limiting</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Firewall Configuration</h3>
                  
                  <CodeBlock 
                    language="bash"
                    id="firewall-config"
                    code={`# Inbound rules (your LLM server)
# Allow HTTPS from our platform
iptables -A INPUT -p tcp --dport 443 -s OUR_PLATFORM_IPS -j ACCEPT

# Outbound rules (if needed for model downloads)
iptables -A OUTPUT -p tcp --dport 443 -d huggingface.co -j ACCEPT
iptables -A OUTPUT -p tcp --dport 443 -d github.com -j ACCEPT

# Platform IP ranges (contact support for current ranges)
# - US East: 52.0.0.0/8
# - US West: 54.0.0.0/8  
# - EU: 35.0.0.0/8`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Models */}
          <TabsContent value="models" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5" />
                  <span>Model Configuration & Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recommended Models by Use Case</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-900 mb-2">📊 Data Analysis</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• <strong>GPT-4:</strong> Best accuracy, complex reasoning</li>
                          <li>• <strong>Claude-3:</strong> Excellent analytical skills</li>
                          <li>• <strong>Llama-2-70B:</strong> Good open-source option</li>
                          <li>• <strong>Code Llama:</strong> Data processing tasks</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">🎨 Creative Content</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• <strong>GPT-4-Turbo:</strong> Rich presentations</li>
                          <li>• <strong>Claude-3-Opus:</strong> Creative writing</li>
                          <li>• <strong>Mistral-7B:</strong> Fast, lightweight</li>
                          <li>• <strong>Llama-2-Chat:</strong> Conversational style</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">⚡ High Performance</h4>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• <strong>GPT-3.5-Turbo:</strong> Fast, cost-effective</li>
                          <li>• <strong>Mistral-7B:</strong> Efficient open-source</li>
                          <li>• <strong>Phi-2:</strong> Microsoft's small model</li>
                          <li>• <strong>TinyLlama:</strong> Ultra-lightweight</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">🔒 Enterprise Security</h4>
                        <ul className="text-sm text-orange-800 space-y-1">
                          <li>• <strong>Azure OpenAI:</strong> Enterprise SLA</li>
                          <li>• <strong>Self-hosted Llama:</strong> Complete control</li>
                          <li>• <strong>Private Claude:</strong> Anthropic enterprise</li>
                          <li>• <strong>Custom fine-tuned:</strong> Proprietary models</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Performance Optimization</h3>
                  
                  <CodeBlock 
                    language="python"
                    id="performance-optimization"
                    code={`# vLLM performance configuration
python -m vllm.entrypoints.openai.api_server \\
  --model meta-llama/Llama-2-7b-chat-hf \\
  --tensor-parallel-size 2 \\        # Multi-GPU
  --max-model-len 4096 \\            # Context length
  --max-num-batched-tokens 8192 \\   # Batch processing
  --max-num-seqs 256 \\              # Concurrent requests
  --gpu-memory-utilization 0.9 \\   # GPU memory usage
  --disable-log-stats \\             # Reduce logging
  --trust-remote-code                # Allow custom models

# Production-ready systemd service
cat > /etc/systemd/system/vllm.service << EOF
[Unit]
Description=vLLM OpenAI API Server
After=network.target

[Service]
Type=simple
User=vllm
WorkingDirectory=/opt/vllm
Environment=CUDA_VISIBLE_DEVICES=0,1
ExecStart=/opt/vllm/bin/python -m vllm.entrypoints.openai.api_server \\
  --model meta-llama/Llama-2-7b-chat-hf \\
  --tensor-parallel-size 2 \\
  --host 0.0.0.0 \\
  --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Model Response Optimization</h3>
                  
                  <CodeBlock 
                    language="json"
                    id="model-optimization"
                    code={`// Optimal request parameters for our platform
{
  "model": "your-model-name",
  "messages": [...],
  
  // Recommended settings for business analysis
  "temperature": 0.7,        // Balanced creativity/accuracy
  "top_p": 0.9,             // Nucleus sampling
  "max_tokens": 2000,       // Sufficient for detailed insights
  "frequency_penalty": 0.1,  // Reduce repetition
  "presence_penalty": 0.1,   // Encourage diverse topics
  
  // Optional: streaming for real-time updates
  "stream": false           // We handle non-streaming responses
}`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Hardware Requirements</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Model Size</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">GPU Memory</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">CPU Cores</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">System RAM</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">7B Parameters</td>
                          <td className="border border-gray-300 px-4 py-2">16GB VRAM</td>
                          <td className="border border-gray-300 px-4 py-2">8+ cores</td>
                          <td className="border border-gray-300 px-4 py-2">32GB</td>
                          <td className="border border-gray-300 px-4 py-2">~2 tokens/sec</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">13B Parameters</td>
                          <td className="border border-gray-300 px-4 py-2">32GB VRAM</td>
                          <td className="border border-gray-300 px-4 py-2">16+ cores</td>
                          <td className="border border-gray-300 px-4 py-2">64GB</td>
                          <td className="border border-gray-300 px-4 py-2">~1.5 tokens/sec</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">70B Parameters</td>
                          <td className="border border-gray-300 px-4 py-2">80GB VRAM (2x A100)</td>
                          <td className="border border-gray-300 px-4 py-2">32+ cores</td>
                          <td className="border border-gray-300 px-4 py-2">128GB</td>
                          <td className="border border-gray-300 px-4 py-2">~0.8 tokens/sec</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Monitoring & Observability</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Platform Monitoring</h3>
                  <p className="text-gray-600 mb-4">
                    Our platform provides built-in monitoring for your enterprise AI integration:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">🔍 Real-time Testing</h4>
                        <p className="text-sm text-blue-800 mb-2">
                          Location: Enterprise Settings → Testing Panel
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Connection health checks</li>
                          <li>• Response time monitoring</li>
                          <li>• Error rate tracking</li>
                          <li>• Endpoint validation</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-900 mb-2">📊 Usage Analytics</h4>
                        <p className="text-sm text-green-800 mb-2">
                          Comprehensive usage tracking
                        </p>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Request volume metrics</li>
                          <li>• Processing time trends</li>
                          <li>• Error classification</li>
                          <li>• Cost optimization insights</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Custom Monitoring Setup</h3>
                  
                  <h4 className="font-medium mb-2">1. Application Logging</h4>
                  <CodeBlock 
                    language="python"
                    id="monitoring-logging"
                    code={`# Python logging setup for your LLM server
import logging
import time
from functools import wraps

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/llm-server.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def monitor_requests(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        request_id = kwargs.get('request_id', 'unknown')
        
        try:
            logger.info(f"Request started: {request_id}")
            result = func(*args, **kwargs)
            
            processing_time = time.time() - start_time
            logger.info(f"Request completed: {request_id}, time: {processing_time:.2f}s")
            
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Request failed: {request_id}, time: {processing_time:.2f}s, error: {str(e)}")
            raise
            
    return wrapper`}
                  />

                  <h4 className="font-medium mb-2 mt-4">2. Prometheus Metrics</h4>
                  <CodeBlock 
                    language="python"
                    id="monitoring-prometheus"
                    code={`# Prometheus metrics for your LLM server
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# Define metrics
request_count = Counter(
    'llm_requests_total', 
    'Total number of LLM requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'llm_request_duration_seconds',
    'Time spent processing LLM requests',
    ['endpoint']
)

active_requests = Gauge(
    'llm_active_requests',
    'Number of currently active requests'
)

model_memory_usage = Gauge(
    'llm_model_memory_bytes',
    'Memory usage of the loaded model'
)

# Usage in your API handler
@app.route('/v1/chat/completions', methods=['POST'])
def chat_completions():
    with request_duration.labels(endpoint='/v1/chat/completions').time():
        active_requests.inc()
        try:
            # Your LLM processing here
            result = process_chat_completion(request.json)
            request_count.labels(method='POST', endpoint='/v1/chat/completions', status='success').inc()
            return result
        except Exception as e:
            request_count.labels(method='POST', endpoint='/v1/chat/completions', status='error').inc()
            raise
        finally:
            active_requests.dec()

# Start Prometheus metrics server
start_http_server(9090)`}
                  />

                  <h4 className="font-medium mb-2 mt-4">3. Health Check Endpoint</h4>
                  <CodeBlock 
                    language="python"
                    id="monitoring-health"
                    code={`# Health check endpoint for monitoring systems
@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Check model availability
        model_status = check_model_loaded()
        
        # Check GPU memory
        gpu_memory = get_gpu_memory_usage()
        
        # Check disk space
        disk_usage = get_disk_usage()
        
        # Overall health determination
        is_healthy = (
            model_status and 
            gpu_memory < 0.95 and  # Less than 95% GPU memory
            disk_usage < 0.9       # Less than 90% disk usage
        )
        
        response = {
            "status": "healthy" if is_healthy else "unhealthy",
            "timestamp": time.time(),
            "checks": {
                "model_loaded": model_status,
                "gpu_memory_usage": gpu_memory,
                "disk_usage": disk_usage
            }
        }
        
        return jsonify(response), 200 if is_healthy else 503
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": time.time()
        }), 500`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Alerting Configuration</h3>
                  
                  <CodeBlock 
                    language="yaml"
                    id="monitoring-alerts"
                    code={`# Prometheus alerting rules
groups:
  - name: llm_server_alerts
    rules:
      - alert: LLMServerDown
        expr: up{job="llm-server"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "LLM server is down"
          description: "LLM server has been down for more than 1 minute"

      - alert: HighRequestLatency
        expr: histogram_quantile(0.95, llm_request_duration_seconds) > 30
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High request latency detected"
          description: "95th percentile latency is above 30 seconds"

      - alert: HighErrorRate
        expr: rate(llm_requests_total{status="error"}[5m]) / rate(llm_requests_total[5m]) > 0.1
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 10% for 3 minutes"

      - alert: GPUMemoryHigh
        expr: llm_model_memory_bytes / 1024^3 > 15  # 15GB threshold
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "GPU memory usage is high"
          description: "GPU memory usage is above 15GB"`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Troubleshooting */}
          <TabsContent value="troubleshooting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Troubleshooting & Debugging</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Common Issues & Solutions</h3>
                  
                  <div className="space-y-4">
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-red-900 mb-2">❌ Connection Failed</h4>
                        <p className="text-sm text-red-800 mb-2"><strong>Symptoms:</strong> "Enterprise AI connection failed" error</p>
                        <div className="text-sm text-red-800">
                          <strong>Solutions:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>• Check if your LLM server is running and accessible</li>
                            <li>• Verify the endpoint URL is correct (include /v1 path)</li>
                            <li>• Ensure SSL certificate is valid and trusted</li>
                            <li>• Check firewall rules allow our platform IPs</li>
                            <li>• Test manually: <code>curl -H "Authorization: Bearer YOUR_KEY" YOUR_ENDPOINT/v1/chat/completions</code></li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Authentication Failed</h4>
                        <p className="text-sm text-yellow-800 mb-2"><strong>Symptoms:</strong> 401 Unauthorized responses</p>
                        <div className="text-sm text-yellow-800">
                          <strong>Solutions:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>• Verify API key is correct and not expired</li>
                            <li>• Check if using correct authentication method</li>
                            <li>• For Azure: ensure api-version header is set</li>
                            <li>• Validate custom headers are properly configured</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">🐌 Slow Response Times</h4>
                        <p className="text-sm text-blue-800 mb-2"><strong>Symptoms:</strong> Requests taking &gt;30 seconds</p>
                        <div className="text-sm text-blue-800">
                          <strong>Solutions:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>• Increase GPU memory allocation</li>
                            <li>• Use tensor parallelism for larger models</li>
                            <li>• Reduce max_tokens in requests</li>
                            <li>• Consider switching to a smaller, faster model</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">🔄 Memory Issues</h4>
                        <p className="text-sm text-purple-800 mb-2"><strong>Symptoms:</strong> Out of memory errors, server crashes</p>
                        <div className="text-sm text-purple-800">
                          <strong>Solutions:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>• Reduce max-model-len parameter</li>
                            <li>• Lower gpu-memory-utilization setting</li>
                            <li>• Use quantized models (4-bit, 8-bit)</li>
                            <li>• Enable CPU offloading for large models</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Debug Commands</h3>
                  
                  <CodeBlock 
                    language="bash"
                    id="debug-commands"
                    code={`# Test endpoint connectivity
curl -v -X POST "https://your-llm-server.com:8000/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "your-model",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 50
  }'

# Check SSL certificate
openssl s_client -connect your-llm-server.com:8000 -servername your-llm-server.com

# Monitor GPU usage
nvidia-smi -l 1

# Check vLLM server logs
journalctl -u vllm -f

# Test DNS resolution
nslookup your-llm-server.com

# Check port accessibility
telnet your-llm-server.com 8000`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Platform Debug Information</h3>
                  
                  <p className="text-gray-600 mb-3">
                    Our platform provides detailed debug information in the browser console:
                  </p>
                  
                  <CodeBlock 
                    language="javascript"
                    id="platform-debug"
                    code={`// Open browser console (F12) and look for these logs:

🏢 AI BRAIN ROUTING: {
  userType: "Enterprise",
  endpoint: "https://your-llm-server.com:8000/v1",
  isEnterpriseAIActive: true,
  aiConfig: {
    provider: "openai",
    endpoint: "https://your-llm-server.com:8000/v1",
    model: "llama-2-7b"
  },
  switchedAt: "2024-01-15T10:30:00.000Z"
}

// If you see 'Standard' instead of 'Enterprise', check:
// 1. User has enterprise subscription
// 2. Enterprise AI configuration is saved
// 3. Configuration has valid endpoint and API key`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Emergency Fallback</h3>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900">Automatic Fallback to Hosted AI</h4>
                        <p className="text-sm text-orange-800 mt-1">
                          If your enterprise endpoint becomes unavailable, our platform can automatically 
                          fall back to our hosted AI service to ensure uninterrupted operation. 
                          This fallback behavior is configurable in your enterprise settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Getting Support</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">📧 Enterprise Support</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Email: enterprise@yourplatform.com</li>
                          <li>• Priority: 4-hour response SLA</li>
                          <li>• Include: Error logs, configuration, debug output</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-900 mb-2">🔧 Self-Service Tools</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Real-time testing panel</li>
                          <li>• Connection diagnostics</li>
                          <li>• Performance monitoring</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileCode className="w-5 h-5" />
                  <span>Complete Implementation Examples</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Complete vLLM Setup</h3>
                  
                  <CodeBlock 
                    language="bash"
                    id="complete-vllm"
                    code={`#!/bin/bash
# Complete vLLM enterprise setup script

# 1. System preparation
sudo apt update && sudo apt upgrade -y
sudo apt install python3.10 python3.10-venv nvidia-docker2 -y

# 2. Create dedicated user
sudo useradd -m -s /bin/bash vllm
sudo usermod -aG docker vllm

# 3. Setup Python environment
sudo -u vllm python3.10 -m venv /home/vllm/venv
sudo -u vllm /home/vllm/venv/bin/pip install --upgrade pip
sudo -u vllm /home/vllm/venv/bin/pip install vllm torch

# 4. Download model (adjust model as needed)
sudo -u vllm mkdir -p /home/vllm/models
sudo -u vllm /home/vllm/venv/bin/python -c "
from transformers import AutoTokenizer, AutoModelForCausalLM
tokenizer = AutoTokenizer.from_pretrained('meta-llama/Llama-2-7b-chat-hf')
model = AutoModelForCausalLM.from_pretrained('meta-llama/Llama-2-7b-chat-hf')
tokenizer.save_pretrained('/home/vllm/models/llama-2-7b-chat')
model.save_pretrained('/home/vllm/models/llama-2-7b-chat')
"

# 5. Create systemd service
sudo tee /etc/systemd/system/vllm.service > /dev/null << EOF
[Unit]
Description=vLLM OpenAI API Server
After=network.target

[Service]
Type=simple
User=vllm
Group=vllm
WorkingDirectory=/home/vllm
Environment=PATH=/home/vllm/venv/bin
Environment=CUDA_VISIBLE_DEVICES=0
ExecStart=/home/vllm/venv/bin/python -m vllm.entrypoints.openai.api_server \\
  --model /home/vllm/models/llama-2-7b-chat \\
  --host 0.0.0.0 \\
  --port 8000 \\
  --api-key ent_$(openssl rand -hex 16) \\
  --tensor-parallel-size 1 \\
  --max-model-len 4096 \\
  --trust-remote-code
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 6. Start and enable service
sudo systemctl daemon-reload
sudo systemctl enable vllm
sudo systemctl start vllm

# 7. Setup nginx reverse proxy with SSL
sudo apt install nginx certbot python3-certbot-nginx -y

sudo tee /etc/nginx/sites-available/vllm > /dev/null << EOF
server {
    listen 80;
    server_name your-llm-server.company.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/vllm /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# 8. Get SSL certificate
sudo certbot --nginx -d your-llm-server.company.com

echo "Setup complete! Your vLLM server is running at:"
echo "https://your-llm-server.company.com/v1"
echo ""
echo "API Key: Check /etc/systemd/system/vllm.service for generated key"
echo "Health check: curl https://your-llm-server.company.com/health"`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Docker Deployment</h3>
                  
                  <CodeBlock 
                    language="yaml"
                    id="docker-deployment"
                    code={`# docker-compose.yml for enterprise LLM deployment
version: '3.8'

services:
  vllm-server:
    image: vllm/vllm-openai:latest
    container_name: enterprise-llm
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./models:/models
      - ./logs:/logs
    environment:
      - CUDA_VISIBLE_DEVICES=0,1
      - MODEL_NAME=meta-llama/Llama-2-7b-chat-hf
      - API_KEY=ent_your_secure_key_here
      - MAX_MODEL_LEN=4096
      - TENSOR_PARALLEL_SIZE=2
    command: >
      --model /models/llama-2-7b-chat
      --host 0.0.0.0
      --port 8000
      --api-key \${API_KEY}
      --tensor-parallel-size \${TENSOR_PARALLEL_SIZE}
      --max-model-len \${MAX_MODEL_LEN}
      --trust-remote-code
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 2
              capabilities: [gpu]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx-proxy:
    image: nginx:alpine
    container_name: enterprise-llm-proxy
    restart: unless-stopped
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - vllm-server

  prometheus:
    image: prom/prometheus:latest
    container_name: enterprise-llm-monitoring
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

volumes:
  prometheus_data:`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Custom API Wrapper</h3>
                  
                  <CodeBlock 
                    language="python"
                    id="custom-api-wrapper"
                    code={`#!/usr/bin/env python3
"""
Enterprise AI API Wrapper
Converts any AI service to OpenAI-compatible format
"""

from flask import Flask, request, jsonify, Response
import requests
import json
import time
import logging
from functools import wraps

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
CUSTOM_AI_ENDPOINT = "https://your-ai-service.com/api/generate"
CUSTOM_AI_KEY = "your-custom-api-key"
SERVICE_API_KEY = "ent_your_platform_key"  # Key for our platform

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization'}), 401
        
        token = auth_header.split(' ')[1]
        if token != SERVICE_API_KEY:
            return jsonify({'error': 'Invalid API key'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

@app.route('/v1/chat/completions', methods=['POST'])
@require_auth
def chat_completions():
    try:
        start_time = time.time()
        data = request.json
        
        # Log incoming request
        logger.info(f"Received request: {len(data.get('messages', []))} messages")
        
        # Extract message content
        messages = data.get('messages', [])
        if not messages:
            return jsonify({'error': 'No messages provided'}), 400
        
        # Convert to your AI service format
        prompt = "\\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
        
        custom_request = {
            "prompt": prompt,
            "max_tokens": data.get('max_tokens', 1000),
            "temperature": data.get('temperature', 0.7),
            "top_p": data.get('top_p', 0.9),
            "model": data.get('model', 'default')
        }
        
        # Call your custom AI service
        response = requests.post(
            CUSTOM_AI_ENDPOINT,
            json=custom_request,
            headers={
                "Authorization": f"Bearer {CUSTOM_AI_KEY}",
                "Content-Type": "application/json"
            },
            timeout=60
        )
        
        if response.status_code != 200:
            logger.error(f"Custom AI service error: {response.status_code} - {response.text}")
            return jsonify({'error': 'AI service unavailable'}), 502
        
        ai_result = response.json()
        processing_time = time.time() - start_time
        
        # Convert response to OpenAI format
        openai_response = {
            "id": f"chatcmpl-{int(time.time())}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": data.get('model', 'custom-model'),
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": ai_result.get('generated_text', ai_result.get('response', ''))
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": len(ai_result.get('generated_text', '').split()),
                "total_tokens": len(prompt.split()) + len(ai_result.get('generated_text', '').split())
            }
        }
        
        logger.info(f"Request completed in {processing_time:.2f}s")
        return jsonify(openai_response)
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Test your AI service
        test_response = requests.get(
            f"{CUSTOM_AI_ENDPOINT}/health",
            headers={"Authorization": f"Bearer {CUSTOM_AI_KEY}"},
            timeout=5
        )
        
        is_healthy = test_response.status_code == 200
        
        return jsonify({
            "status": "healthy" if is_healthy else "unhealthy",
            "timestamp": time.time(),
            "ai_service_status": test_response.status_code
        }), 200 if is_healthy else 503
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": time.time()
        }), 500

@app.route('/v1/models', methods=['GET'])
@require_auth
def list_models():
    return jsonify({
        "object": "list",
        "data": [{
            "id": "custom-model",
            "object": "model",
            "created": int(time.time()),
            "owned_by": "enterprise"
        }]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">4. Platform Configuration</h3>
                  
                  <CodeBlock 
                    language="json"
                    id="platform-configuration"
                    code={`// Complete configuration examples for different setups

// 1. vLLM Configuration
{
  "provider": "openai",
  "endpoint": "https://llm.company.com/v1",
  "apiKey": "ent_abc123def456",
  "model": "meta-llama/Llama-2-7b-chat-hf",
  "enabled": true,
  "headers": {
    "X-Enterprise-ID": "your-company-id"
  }
}

// 2. Azure OpenAI Configuration  
{
  "provider": "azure",
  "endpoint": "https://your-resource.openai.azure.com",
  "apiKey": "your-azure-key",
  "model": "gpt-4",
  "apiVersion": "2023-12-01-preview",
  "enabled": true,
  "headers": {
    "X-Subscription-ID": "your-subscription-id"
  }
}

// 3. Custom API Configuration
{
  "provider": "custom",
  "endpoint": "https://ai-wrapper.company.com/v1",
  "apiKey": "custom-service-key",
  "model": "custom-model",
  "enabled": true,
  "headers": {
    "X-Custom-Auth": "enterprise-token",
    "X-Tenant-ID": "tenant-123"
  }
}

// 4. Anthropic Claude Configuration
{
  "provider": "anthropic",
  "endpoint": "https://api.anthropic.com/v1",
  "apiKey": "sk-ant-api03-...",
  "model": "claude-3-opus-20240229",
  "enabled": true,
  "headers": {
    "anthropic-version": "2023-06-01"
  }
}`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">5. Production Deployment Script</h3>
                  
                  <CodeBlock 
                    language="bash"
                    id="production-deployment"
                    code={`#!/bin/bash
# Production-ready enterprise AI deployment

set -e

# Configuration
DOMAIN="llm.yourcompany.com"
MODEL="meta-llama/Llama-2-7b-chat-hf"
API_KEY="ent_$(openssl rand -hex 32)"
EMAIL="admin@yourcompany.com"

echo "🚀 Starting enterprise AI deployment..."

# 1. System setup
apt update && apt upgrade -y
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# 2. Create directory structure
mkdir -p /opt/enterprise-ai/{models,config,logs,ssl}
cd /opt/enterprise-ai

# 3. Create docker-compose configuration
cat > docker-compose.yml << EOF
version: '3.8'
services:
  vllm:
    image: vllm/vllm-openai:latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:8000:8000"
    volumes:
      - ./models:/models
      - ./logs:/logs
    environment:
      - CUDA_VISIBLE_DEVICES=0
    command: >
      --model ${MODEL}
      --host 0.0.0.0
      --port 8000
      --api-key ${API_KEY}
      --max-model-len 4096
      --trust-remote-code
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
EOF

# 4. Create nginx configuration
cat > /etc/nginx/sites-available/enterprise-ai << EOF
server {
    listen 80;
    server_name ${DOMAIN};
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
EOF

ln -s /etc/nginx/sites-available/enterprise-ai /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# 5. Get SSL certificate
certbot --nginx -d ${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive

# 6. Start services
docker-compose up -d

# 7. Wait for service to be ready
echo "⏳ Waiting for AI service to start..."
sleep 30

# 8. Test deployment
TEST_RESULT=$(curl -s -o /dev/null -w "%{http_code}" \\
  -X POST "https://${DOMAIN}/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${API_KEY}" \\
  -d '{
    "model": "'${MODEL}'",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }')

if [ "$TEST_RESULT" = "200" ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Configuration Details:"
    echo "Domain: https://${DOMAIN}"
    echo "Endpoint: https://${DOMAIN}/v1"
    echo "API Key: ${API_KEY}"
    echo "Model: ${MODEL}"
    echo ""
    echo "🔧 Configure in platform:"
    echo '{
  "provider": "openai",
  "endpoint": "https://'${DOMAIN}'/v1",
  "apiKey": "'${API_KEY}'",
  "model": "'${MODEL}'",
  "enabled": true
}'
else
    echo "❌ Deployment failed - HTTP status: $TEST_RESULT"
    echo "Check logs: docker-compose logs"
    exit 1
fi`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}