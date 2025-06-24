'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Layout, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  ArrowLeft,
  Copy,
  Settings,
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Star,
  MoreHorizontal
} from 'lucide-react'

interface TemplateData {
  id: string
  name: string
  description: string
  category: string
  template_type: string
  slide_structure: any[]
  design_settings: any
  usage_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/templates')
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      
      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Error loading templates:', error)
      setError('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadTemplates()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template')
    }
  }

  const handleToggleStatus = async (templateId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/templates/${templateId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (response.ok) {
        await loadTemplates()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update template status')
      }
    } catch (error) {
      console.error('Error updating template status:', error)
      alert('Failed to update template status')
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && template.is_active) ||
                         (filterStatus === 'inactive' && !template.is_active)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'business': 'bg-blue-600',
      'marketing': 'bg-green-600',
      'sales': 'bg-purple-600',
      'finance': 'bg-orange-600',
      'general': 'bg-gray-600'
    }
    
    return (
      <Badge className={`${colors[category] || 'bg-gray-600'} text-white`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading templates...</p>
        </div>
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
                <Layout className="w-8 h-8 text-purple-500" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Template Management</h1>
                  <p className="text-gray-400">{filteredTemplates.length} templates displayed</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/admin/templates/new')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Templates</p>
                  <p className="text-2xl font-bold text-white">{templates.length}</p>
                </div>
                <Layout className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Templates</p>
                  <p className="text-2xl font-bold text-white">
                    {templates.filter(t => t.is_active).length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Usage</p>
                  <p className="text-2xl font-bold text-white">
                    {templates.reduce((sum, t) => sum + t.usage_count, 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Categories</p>
                  <p className="text-2xl font-bold text-white">
                    {new Set(templates.map(t => t.category)).size}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search templates by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="finance">Finance</option>
                  <option value="general">General</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        {error ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <p className="text-red-400">{error}</p>
              <Button onClick={loadTemplates} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2">{template.name}</CardTitle>
                      <CardDescription className="text-gray-400 text-sm mb-3">
                        {template.description || 'No description available'}
                      </CardDescription>
                      <div className="flex items-center space-x-2 mb-3">
                        {getCategoryBadge(template.category)}
                        <Badge 
                          variant="outline" 
                          className={`${template.is_active ? 'border-green-500 text-green-400' : 'border-gray-500 text-gray-400'}`}
                        >
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Slides</p>
                        <p className="text-white font-medium">{template.slide_structure?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Usage Count</p>
                        <p className="text-white font-medium">{template.usage_count}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="text-gray-400">Created: {formatDate(template.created_at)}</p>
                      {template.updated_at !== template.created_at && (
                        <p className="text-gray-400">Updated: {formatDate(template.updated_at)}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-700">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                        onClick={() => router.push(`/admin/templates/${template.id}`)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => router.push(`/admin/templates/${template.id}/edit`)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                        onClick={() => router.push(`/admin/templates/${template.id}/clone`)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Clone
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`${template.is_active ? 'border-yellow-600 text-yellow-400' : 'border-green-600 text-green-400'}`}
                        onClick={() => handleToggleStatus(template.id, template.is_active)}
                      >
                        {template.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && !error && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-12 text-center">
              <Layout className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No templates found</p>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters, or create a new template</p>
              <Button 
                onClick={() => router.push('/admin/templates/new')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}