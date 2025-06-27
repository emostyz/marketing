'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserHeader } from '@/components/ui/UserHeader'
import { useAuth } from '@/lib/auth/auth-context'
import { Plus, FileText, Calendar, TrendingUp, Play, Brain, Settings, Download, MoreVertical } from 'lucide-react'
import { ExportModal } from '@/components/export/ExportModal'
import { DeckDraft } from '@/lib/deck-persistence'
import { ClientTracker } from '@/lib/analytics/client-tracker'

interface DashboardClientProps {
  user: any
  drafts: DeckDraft[]
}

export function DashboardClient({ user, drafts }: DashboardClientProps) {
  const router = useRouter()
  const [presentations, setPresentations] = useState<DeckDraft[]>(drafts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [selectedPresentationForExport, setSelectedPresentationForExport] = useState<DeckDraft | null>(null)

  useEffect(() => {
    setPresentations(drafts)
    
    // Initialize client tracker with user ID
    if (user?.id) {
      ClientTracker.init(user.id)
    }
    
    // Track dashboard view
    ClientTracker.trackPageView('/dashboard', 'Dashboard')
    ClientTracker.trackEngagement('session_start', {
      user_tier: user?.subscription || 'free',
      presentation_count: drafts.length
    })
  }, [drafts, user])

  const stats = {
    total: presentations.length,
    thisMonth: presentations.filter(p => {
      const createdDate = new Date(p.createdAt)
      const now = new Date()
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear()
    }).length,
    inProgress: presentations.filter(p => p.status === 'draft').length,
    completed: presentations.filter(p => p.status === 'completed' || p.status === 'published').length
  }

  const handleCreatePresentation = () => {
    ClientTracker.trackUserInteraction('create_presentation_clicked', {
      source: 'dashboard',
      user_tier: user?.subscription || 'free'
    })
    router.push('/deck-builder/new')
  }

  const handlePresentationClick = (id: string) => {
    const presentation = presentations.find(p => p.id === id)
    ClientTracker.trackPresentationEvent('opened', id, {
      title: presentation?.title || 'Untitled',
      status: presentation?.status || 'unknown',
      last_modified: presentation?.updatedAt
    })
    router.push(`/deck-builder/${id}`)
  }

  const handleExportClick = (e: React.MouseEvent, presentation: DeckDraft) => {
    e.stopPropagation() // Prevent navigation
    ClientTracker.trackPresentationEvent('exported', presentation.id, {
      title: presentation.title || 'Untitled',
      slide_count: presentation.slides?.length || 0,
      export_source: 'dashboard'
    })
    setSelectedPresentationForExport(presentation)
    setExportModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Brain className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold">EasyDecks.ai</h1>
          </div>
          <UserHeader />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome back, {user.name}! 👋</h2>
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
                <p className="text-2xl font-bold mt-1 text-emerald-400">{stats.completed}</p>
              </div>
              <Play className="w-8 h-8 text-emerald-500" />
            </div>
          </Card>
        </div>

        {/* Create New Presentation */}
        <div className="mb-8">
          <Button 
            onClick={handleCreatePresentation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Presentation
          </Button>
        </div>

        {/* Presentations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentations.map((presentation) => (
            <Card 
              key={presentation.id}
              className="p-6 hover:bg-gray-800/50 transition-colors cursor-pointer"
              onClick={() => handlePresentationClick(presentation.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{presentation.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">
                    {presentation.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{presentation.slides.length} slides</span>
                    <span>•</span>
                    <span>{new Date(presentation.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleExportClick(e, presentation)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  presentation.status === 'draft' ? 'bg-yellow-900/30 text-yellow-300' :
                  presentation.status === 'completed' ? 'bg-green-900/30 text-green-300' :
                  'bg-blue-900/30 text-blue-300'
                }`}>
                  {presentation.status}
                </span>
                <Button
                  size="sm"
                  onClick={() => handlePresentationClick(presentation.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {presentations.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No presentations yet</h3>
            <p className="text-gray-400 mb-6">Create your first AI-powered presentation to get started</p>
            <Button 
              onClick={handleCreatePresentation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Presentation
            </Button>
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        presentationId={selectedPresentationForExport?.id || ''}
        presentationTitle={selectedPresentationForExport?.title || ''}
      />
    </div>
  )
}