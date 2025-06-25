'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth/auth-context'
import { useEnterpriseAccess } from '@/lib/hooks/useEnterpriseAccess'
import EnterpriseAIConfig from '@/components/enterprise/EnterpriseAIConfig'
import EnterpriseAITestPanel from '@/components/enterprise/EnterpriseAITestPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, Shield, Zap, Users, Lock, Bell, Eye, Palette,
  ChevronLeft, Building, Crown, Server, Code, ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export default function EnterpriseSettingsPage() {
  const { user, loading } = useAuth()
  const { isEnterprise, enterpriseFeatures } = useEnterpriseAccess()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enterprise settings...</p>
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
            <p className="text-gray-600 mb-4">Please sign in to access enterprise settings.</p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Settings
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Building className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Enterprise Settings</h1>
                  <p className="text-gray-600">Advanced configuration for enterprise organizations</p>
                </div>
                {isEnterprise && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Enterprise
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enterprise Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Custom AI</span>
                    </div>
                    <Badge variant={enterpriseFeatures.customAI ? 'default' : 'secondary'}>
                      {enterpriseFeatures.customAI ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">Security</span>
                    </div>
                    <Badge variant={enterpriseFeatures.advancedSecurity ? 'default' : 'secondary'}>
                      {enterpriseFeatures.advancedSecurity ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">Audit Logs</span>
                    </div>
                    <Badge variant={enterpriseFeatures.auditLogging ? 'default' : 'secondary'}>
                      {enterpriseFeatures.auditLogging ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">SSO</span>
                    </div>
                    <Badge variant={enterpriseFeatures.ssoIntegration ? 'default' : 'secondary'}>
                      {enterpriseFeatures.ssoIntegration ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">Branding</span>
                    </div>
                    <Badge variant={enterpriseFeatures.customBranding ? 'default' : 'secondary'}>
                      {enterpriseFeatures.customBranding ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* AI Configuration Section */}
              <EnterpriseAIConfig 
                isEnterprise={isEnterprise}
                onConfigUpdate={(config) => {
                  console.log('Enterprise AI config updated:', config)
                  // Handle configuration updates
                }}
              />

              {/* Real-time AI Testing Panel */}
              <div className="mt-8">
                <EnterpriseAITestPanel isEnterprise={isEnterprise} />
              </div>

              {/* Developer Documentation Link */}
              {isEnterprise && (
                <div className="mt-8">
                  <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Code className="w-8 h-8 text-purple-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-purple-900">Developer Documentation</h3>
                            <p className="text-sm text-purple-800">
                              Complete technical guide for custom AI integration. Setup instructions, examples, and troubleshooting.
                            </p>
                          </div>
                        </div>
                        <Link href="/settings/enterprise/developer-docs">
                          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Code className="w-4 h-4 mr-2" />
                            View Docs
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Additional Enterprise Features */}
              {isEnterprise && (
                <div className="mt-8 space-y-6">
                  {/* On-Premise LLM Installation Guide */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Server className="w-5 h-5" />
                        <span>On-Premise LLM Installation Guide</span>
                        <Badge className="bg-red-100 text-red-800">Enterprise Only</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">Enterprise AI Brain Integration</h4>
                            <p className="text-sm text-blue-800">
                              When you configure a custom AI endpoint below, our system will automatically route all AI requests 
                              to your on-premise LLM instead of our hosted OpenAI integration. Your data never leaves your infrastructure.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Installation Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-2 border-dashed border-gray-300">
                          <CardHeader>
                            <CardTitle className="text-lg">Option 1: OpenAI-Compatible API</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-gray-600">Deploy any OpenAI-compatible LLM server</p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>vLLM + OpenAI API</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Ollama with OpenAI compatibility</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>LocalAI</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Azure OpenAI Service</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-dashed border-gray-300">
                          <CardHeader>
                            <CardTitle className="text-lg">Option 2: Custom Integration</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-gray-600">Direct integration with your LLM</p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Custom API endpoint</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Authentication headers</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Custom request format</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Detailed Installation Steps */}
                      <div className="space-y-6">
                        <Separator />
                        <h3 className="text-xl font-semibold">Detailed Installation Instructions</h3>
                        
                        {/* Method 1: vLLM Installation */}
                        <Card className="bg-gray-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                              <span>Recommended: vLLM with OpenAI API Compatibility</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                              <div className="space-y-2">
                                <div># Install vLLM</div>
                                <div>pip install vllm</div>
                                <div></div>
                                <div># Start vLLM server with OpenAI compatibility</div>
                                <div>python -m vllm.entrypoints.openai.api_server \</div>
                                <div>&nbsp;&nbsp;--model microsoft/DialoGPT-medium \</div>
                                <div>&nbsp;&nbsp;--host 0.0.0.0 \</div>
                                <div>&nbsp;&nbsp;--port 8000 \</div>
                                <div>&nbsp;&nbsp;--api-key your-secure-api-key</div>
                                <div></div>
                                <div># Your endpoint will be: http://your-server:8000/v1</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium mb-2">Configuration in Enterprise Settings:</h5>
                                <ul className="text-sm space-y-1 text-gray-600">
                                  <li>• Provider: OpenAI</li>
                                  <li>• Endpoint: http://your-server:8000/v1</li>
                                  <li>• API Key: your-secure-api-key</li>
                                  <li>• Model: microsoft/DialoGPT-medium</li>
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium mb-2">Supported Models:</h5>
                                <ul className="text-sm space-y-1 text-gray-600">
                                  <li>• Llama 2 (7B, 13B, 70B)</li>
                                  <li>• Code Llama</li>
                                  <li>• Mistral 7B</li>
                                  <li>• Any HuggingFace model</li>
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Method 2: Ollama Installation */}
                        <Card className="bg-gray-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                              <span>Alternative: Ollama with OpenAI Compatibility</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                              <div className="space-y-2">
                                <div># Install Ollama</div>
                                <div>curl -fsSL https://ollama.ai/install.sh | sh</div>
                                <div></div>
                                <div># Download a model</div>
                                <div>ollama pull llama2</div>
                                <div></div>
                                <div># Install OpenAI compatibility layer</div>
                                <div>pip install ollama-openai-compat</div>
                                <div></div>
                                <div># Start the OpenAI-compatible server</div>
                                <div>ollama-openai-compat --host 0.0.0.0 --port 8000</div>
                                <div></div>
                                <div># Your endpoint will be: http://your-server:8000/v1</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Method 3: Azure OpenAI */}
                        <Card className="bg-gray-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                              <span>Enterprise Option: Azure OpenAI Service</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600">
                              For maximum enterprise compliance, use Azure OpenAI Service with your own Azure subscription.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium mb-2">Configuration:</h5>
                                <ul className="text-sm space-y-1 text-gray-600">
                                  <li>• Provider: Azure OpenAI</li>
                                  <li>• Endpoint: https://your-resource.openai.azure.com</li>
                                  <li>• API Key: Your Azure API key</li>
                                  <li>• Model: gpt-4, gpt-35-turbo, etc.</li>
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium mb-2">Benefits:</h5>
                                <ul className="text-sm space-y-1 text-gray-600">
                                  <li>• Enterprise SLA</li>
                                  <li>• Data residency control</li>
                                  <li>• Advanced security</li>
                                  <li>• Compliance certifications</li>
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Code Integration Instructions */}
                        <Card className="border-2 border-yellow-200 bg-yellow-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">⚙</div>
                              <span>How It Works: Automatic AI Brain Routing</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-white border border-yellow-200 rounded-lg p-4">
                              <h5 className="font-medium mb-3">Our platform automatically detects and routes AI requests:</h5>
                              <div className="space-y-3 text-sm">
                                <div className="flex items-start space-x-3">
                                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                                  <div>
                                    <strong>Configuration Check:</strong> When you save your enterprise AI configuration above, 
                                    our system validates the connection and stores your settings securely.
                                  </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                                  <div>
                                    <strong>Automatic Routing:</strong> All AI analysis requests (deck generation, insights, charts) 
                                    are automatically routed to your configured endpoint instead of our hosted OpenAI.
                                  </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                                  <div>
                                    <strong>Enhanced Features:</strong> Enterprise users get additional AI capabilities: 
                                    15 insights vs 10, revolutionary innovation level, and complex design generation.
                                  </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                                  <div>
                                    <strong>Fallback Protection:</strong> If your on-premise LLM is unavailable, 
                                    the system can optionally fall back to our hosted service (configurable).
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                              <div className="space-y-1">
                                <div># Example: How our platform detects enterprise configuration</div>
                                <div className="text-gray-500"># File: lib/hooks/useEnterpriseAccess.ts</div>
                                <div></div>
                                <div>const getAIEndpoint = () =&gt; &#123;</div>
                                <div>&nbsp;&nbsp;if (isEnterprise && isEnterpriseAIEnabled()) {"{"}</div>
                                <div>&nbsp;&nbsp;&nbsp;&nbsp;return enterpriseConfig.endpoint // YOUR on-premise LLM</div>
                                <div>&nbsp;&nbsp;{"}"}</div>
                                <div>&nbsp;&nbsp;return '/api/ai/analyze' // Default hosted AI</div>
                                <div>{"}"}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Network Requirements */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Network & Security Requirements</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-medium mb-3">Firewall Configuration:</h5>
                                <ul className="text-sm space-y-2 text-gray-600">
                                  <li>• Allow inbound HTTPS (443) from our platform</li>
                                  <li>• Allow outbound to your LLM server port</li>
                                  <li>• Whitelist our IP ranges (provided separately)</li>
                                  <li>• Consider VPN or private network setup</li>
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium mb-3">SSL/TLS Requirements:</h5>
                                <ul className="text-sm space-y-2 text-gray-600">
                                  <li>• Valid SSL certificate for your endpoint</li>
                                  <li>• TLS 1.2 or higher</li>
                                  <li>• Certificate chain validation</li>
                                  <li>• Optional: Client certificate authentication</li>
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Security & Compliance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Security & Compliance</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium">Data Protection</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>End-to-end encryption</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>GDPR compliance</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>SOC 2 certified</span>
                            </li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium">Access Control</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Role-based permissions</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Multi-factor authentication</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Session management</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Organization Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Organization Management</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">Team Management</h3>
                        <p className="text-gray-600 mb-4">
                          Manage users, roles, and permissions for your organization.
                        </p>
                        <Button variant="outline">
                          Manage Team
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}