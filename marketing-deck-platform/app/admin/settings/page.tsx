'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  ArrowLeft, 
  Save, 
  Database, 
  Palette, 
  Globe, 
  Key, 
  FileText, 
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface PlatformSettings {
  general: {
    site_name: string
    site_tagline: string
    contact_email: string
  }
  features: {
    ai_analysis: boolean
    templates: boolean
    exports: boolean
    collaboration: boolean
  }
  limits: {
    max_file_size: number
    max_presentations_per_user: number
  }
  ui: {
    default_theme: string
    primary_color: string
    secondary_color: string
  }
  api: {
    openai_key: string
    openai_model: string
    anthropic_key: string
    anthropic_model: string
    google_key: string
    google_model: string
    active_provider: string
  }
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [changes, setChanges] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      
      const data = await response.json()
      setSettings(data.settings)
    } catch (error) {
      console.error('Error loading settings:', error)
      setError('Failed to load platform settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Settings saved successfully! ${changes.length} changes applied to the platform.`)
        setChanges([])
        
        // Trigger platform rebuild if necessary
        if (changes.some(change => change.includes('homepage') || change.includes('api') || change.includes('general.site_name') || change.includes('ui.'))) {
          await triggerPlatformUpdate()
        }
      } else {
        setError(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const triggerPlatformUpdate = async () => {
    try {
      await fetch('/api/admin/platform/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'settings_update' })
      })
    } catch (error) {
      console.error('Error triggering platform update:', error)
    }
  }

  const updateSetting = (category: keyof PlatformSettings, key: string, value: any) => {
    if (!settings) return

    const newSettings = { ...settings }
    ;(newSettings[category] as any)[key] = value
    setSettings(newSettings)

    // Track changes for rebuild detection
    const changeKey = `${category}.${key}`
    if (!changes.includes(changeKey)) {
      setChanges([...changes, changeKey])
    }
  }

  const testApiConnection = async (provider: string) => {
    try {
      const response = await fetch('/api/admin/settings/test-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, settings: settings?.api })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(`${provider} API connection successful!`)
      } else {
        setError(`${provider} API test failed: ${data.error}`)
      }
    } catch (error) {
      setError(`Failed to test ${provider} API connection`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading platform settings...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Settings Not Available</h2>
            <p className="text-gray-300 mb-6">Failed to load platform settings</p>
            <Button onClick={loadSettings} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="border-gray-600 text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <Settings className="w-8 h-8 text-blue-500" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
                  <p className="text-gray-400">Configure platform-wide settings and integrations</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {changes.length > 0 && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                  {changes.length} unsaved changes
                </Badge>
              )}
              <Button 
                onClick={handleSaveSettings}
                disabled={saving || changes.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">{success}</span>
          </div>
        )}

        {/* Settings Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-lg">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'features', label: 'Features', icon: CheckCircle },
            { id: 'ui', label: 'UI & Branding', icon: Palette },
            { id: 'api', label: 'API & AI', icon: Key },
            { id: 'limits', label: 'Limits', icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Site Name</Label>
                    <Input
                      value={settings.general.site_name}
                      onChange={(e) => updateSetting('general', 'site_name', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Platform name"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Contact Email</Label>
                    <Input
                      value={settings.general.contact_email}
                      onChange={(e) => updateSetting('general', 'contact_email', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="support@example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Site Tagline</Label>
                  <Textarea
                    value={settings.general.site_tagline}
                    onChange={(e) => updateSetting('general', 'site_tagline', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Platform description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feature Flags */}
          {activeTab === 'features' && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Feature Flags
                </CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium capitalize">
                        {key.replace('_', ' ')}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {key === 'ai_analysis' && 'AI-powered presentation analysis'}
                        {key === 'templates' && 'Presentation templates system'}
                        {key === 'exports' && 'Export presentations to various formats'}
                        {key === 'collaboration' && 'Real-time collaboration features'}
                      </p>
                    </div>
                    <button
                      onClick={() => updateSetting('features', key, !value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* UI & Branding */}
          {activeTab === 'ui' && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  UI & Branding
                </CardTitle>
                <CardDescription>Customize the platform appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-gray-300">Default Theme</Label>
                    <select
                      value={settings.ui.default_theme}
                      onChange={(e) => updateSetting('ui', 'default_theme', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="professional">Professional</option>
                      <option value="modern">Modern</option>
                      <option value="minimal">Minimal</option>
                      <option value="creative">Creative</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Primary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="color"
                        value={settings.ui.primary_color}
                        onChange={(e) => updateSetting('ui', 'primary_color', e.target.value)}
                        className="w-16 h-10 p-1 bg-gray-700 border-gray-600"
                      />
                      <Input
                        value={settings.ui.primary_color}
                        onChange={(e) => updateSetting('ui', 'primary_color', e.target.value)}
                        className="flex-1 bg-gray-700 border-gray-600 text-white"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Secondary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="color"
                        value={settings.ui.secondary_color}
                        onChange={(e) => updateSetting('ui', 'secondary_color', e.target.value)}
                        className="w-16 h-10 p-1 bg-gray-700 border-gray-600"
                      />
                      <Input
                        value={settings.ui.secondary_color}
                        onChange={(e) => updateSetting('ui', 'secondary_color', e.target.value)}
                        className="flex-1 bg-gray-700 border-gray-600 text-white"
                        placeholder="#8B5CF6"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* API & AI Settings */}
          {activeTab === 'api' && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    API & AI Configuration
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    className="border-gray-600 text-gray-300"
                  >
                    {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </CardTitle>
                <CardDescription>Configure AI service providers and API keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-gray-300">Active AI Provider</Label>
                  <select
                    value={settings.api.active_provider}
                    onChange={(e) => updateSetting('api', 'active_provider', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="google">Google (Gemini)</option>
                  </select>
                </div>

                {/* OpenAI Configuration */}
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">OpenAI Configuration</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testApiConnection('openai')}
                      className="border-gray-600 text-gray-300"
                    >
                      Test Connection
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">API Key</Label>
                      <Input
                        type={showApiKeys ? 'text' : 'password'}
                        value={settings.api.openai_key}
                        onChange={(e) => updateSetting('api', 'openai_key', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="sk-..."
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Model</Label>
                      <select
                        value={settings.api.openai_model}
                        onChange={(e) => updateSetting('api', 'openai_model', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Anthropic Configuration */}
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">Anthropic Configuration</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testApiConnection('anthropic')}
                      className="border-gray-600 text-gray-300"
                    >
                      Test Connection
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">API Key</Label>
                      <Input
                        type={showApiKeys ? 'text' : 'password'}
                        value={settings.api.anthropic_key}
                        onChange={(e) => updateSetting('api', 'anthropic_key', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="sk-ant-..."
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Model</Label>
                      <select
                        value={settings.api.anthropic_model}
                        onChange={(e) => updateSetting('api', 'anthropic_model', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      >
                        <option value="claude-3-opus">Claude 3 Opus</option>
                        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                        <option value="claude-3-haiku">Claude 3 Haiku</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Google Configuration */}
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">Google Configuration</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testApiConnection('google')}
                      className="border-gray-600 text-gray-300"
                    >
                      Test Connection
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">API Key</Label>
                      <Input
                        type={showApiKeys ? 'text' : 'password'}
                        value={settings.api.google_key}
                        onChange={(e) => updateSetting('api', 'google_key', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="AIza..."
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Model</Label>
                      <select
                        value={settings.api.google_model}
                        onChange={(e) => updateSetting('api', 'google_model', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      >
                        <option value="gemini-pro">Gemini Pro</option>
                        <option value="gemini-pro-vision">Gemini Pro Vision</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Limits */}
          {activeTab === 'limits' && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Platform Limits
                </CardTitle>
                <CardDescription>Configure usage limits and restrictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Max File Size (MB)</Label>
                    <Input
                      type="number"
                      value={settings.limits.max_file_size}
                      onChange={(e) => updateSetting('limits', 'max_file_size', parseInt(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                      min="1"
                      max="1000"
                    />
                    <p className="text-gray-400 text-sm mt-1">Maximum file upload size in megabytes</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Max Presentations per User</Label>
                    <Input
                      type="number"
                      value={settings.limits.max_presentations_per_user}
                      onChange={(e) => updateSetting('limits', 'max_presentations_per_user', parseInt(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                      min="1"
                      max="10000"
                    />
                    <p className="text-gray-400 text-sm mt-1">Maximum presentations each user can create</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}