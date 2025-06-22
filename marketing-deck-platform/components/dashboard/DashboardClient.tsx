'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UserHeader } from '@/components/ui/UserHeader'
import { useAuth } from '@/lib/auth/auth-context'
import { Plus, FileText, Calendar, TrendingUp, Play, Brain, Settings, Download, MoreVertical } from 'lucide-react'
import { ExportModal } from '@/components/export/ExportModal'

// Simple interface for presentations without database dependency
interface SimplePresentation {
  id: string
  title: string
  description?: string
  status: 'draft' | 'completed' | 'published'
  created_at?: string
  metadata?: {
    generatedAt?: string
  }
}

export function DashboardClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [presentations, setPresentations] = useState<SimplePresentation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [selectedPresentationForExport, setSelectedPresentationForExport] = useState<SimplePresentation | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user) {
      loadUserPresentations()
    }
  }, [user, authLoading, router])

  const loadUserPresentations = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    
    try {
      // Try to load from database first
      const response = await fetch('/api/presentations')
      if (response.ok) {
        const data = await response.json()
        if (data.presentations) {
          setPresentations(data.presentations)
          setLoading(false)
          return
        }
      }
      
      // Fallback to localStorage
      loadFromLocalStorage()
    } catch (error) {
      console.error('Error loading presentations:', error)
      setError('Failed to load presentations')
      loadFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const localPresentations: SimplePresentation[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('presentation_')) {
          const data = localStorage.getItem(key)
          if (data) {
            try {
              const presentation = JSON.parse(data)
              localPresentations.push(presentation)
            } catch (error) {
              console.error('Error parsing localStorage presentation:', error)
            }
          }
        }
      }
      setPresentations(localPresentations)
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      setPresentations([])
    }
  }

  const stats = {
    total: presentations.length,
    thisMonth: presentations.filter(p => {
      const createdDate = new Date(p.created_at || p.metadata?.generatedAt || Date.now())
      const now = new Date()
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear()
    }).length,
    inProgress: presentations.filter(p => p.status === 'draft').length,
    completed: presentations.filter(p => p.status === 'completed' || p.status === 'published').length
  }

  const handleCreatePresentation = () => {
    router.push('/deck-builder/new')
  }

  const handlePresentationClick = (id: string) => {
    router.push(`/deck-builder/${id}`)
  }

  const handleExportClick = (e: React.MouseEvent, presentation: SimplePresentation) => {
    e.stopPropagation() // Prevent navigation
    setSelectedPresentationForExport(presentation)
    setExportModalOpen(true)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Brain className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold">AEDRIN</h1>
          </div>
          <UserHeader />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome back! 👋</h2>
          <p className="text-xl text-gray-300">Ready to create amazing presentations?</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Presentations</p>
                <p className="text-2xl font-bold mt-1 text-blue-400">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">This Month</p>
                <p className="text-2xl font-bold mt-1 text-green-400">{stats.thisMonth}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">In Progress</p>
                <p className="text-2xl font-bold mt-1 text-yellow-400">{stats.inProgress}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold mt-1 text-purple-400">{stats.completed}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30 hover:border-blue-400/50 transition-all cursor-pointer group" onClick={handleCreatePresentation}>
            <div className="flex items-start justify-between mb-4">
              <Brain className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <Plus className="w-5 h-5 text-blue-400/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Deck</h3>
            <p className="text-gray-300 mb-4">Upload your data and let AI create stunning presentations</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Create New Presentation
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30 hover:border-green-400/50 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <FileText className="w-8 h-8 text-green-400 group-hover:text-green-300 transition-colors" />
              <Plus className="w-5 h-5 text-green-400/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Templates</h3>
            <p className="text-gray-300 mb-4">Start with professional templates</p>
            <Button variant="secondary" className="w-full" onClick={() => router.push('/templates')}>
              Browse Templates
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <Settings className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <Plus className="w-5 h-5 text-purple-400/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Export Options</h3>
            <p className="text-gray-300 mb-4">PowerPoint, PDF, Google Slides ready</p>
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
          </Card>
        </div>

        {/* Recent Presentations */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Your Presentations</h3>
            <Button onClick={handleCreatePresentation}>
              <Plus className="w-4 h-4 mr-2" />
              New Presentation
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-gray-700 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : presentations.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">No presentations yet</h4>
              <p className="text-gray-400 mb-6">Create your first AI-powered presentation to get started</p>
              <Button onClick={handleCreatePresentation}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Presentation
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presentations.slice(0, 6).map((presentation) => (
                <Card 
                  key={presentation.id} 
                  className="p-6 hover:bg-gray-800/50 transition-all cursor-pointer group"
                  onClick={() => handlePresentationClick(presentation.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                        {presentation.title}
                      </h4>
                      <p className="text-sm text-gray-400 mb-2">
                        {presentation.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          presentation.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                          presentation.status === 'published' ? 'bg-blue-900/50 text-blue-400' :
                          'bg-yellow-900/50 text-yellow-400'
                        }`}>
                          {presentation.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(presentation.created_at || presentation.metadata?.generatedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleExportClick(e, presentation)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Export presentation"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Play className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
      
      {/* Export Modal */}
      {selectedPresentationForExport && (
        <ExportModal 
          isOpen={exportModalOpen}
          onClose={() => {
            setExportModalOpen(false)
            setSelectedPresentationForExport(null)
          }}
          presentationId={selectedPresentationForExport.id}
          presentationTitle={selectedPresentationForExport.title}
        />
      )}
    </div>
  )
}