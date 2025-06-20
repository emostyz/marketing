'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, FileText, Calendar, TrendingUp, Play, Settings, User, LogOut, Brain } from 'lucide-react'
import Link from 'next/link'

interface DashboardClientProps {
  initialPresentations: any[]
  userId: number
}

export function DashboardClient({ initialPresentations, userId }: DashboardClientProps) {
  const router = useRouter()
  const [presentations, setPresentations] = useState(initialPresentations)
  const [loading, setLoading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const stats = {
    total: presentations.length,
    thisMonth: presentations.filter(p => {
      const createdDate = new Date(p.createdAt)
      const now = new Date()
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear()
    }).length,
    inProgress: presentations.filter(p => p.status === 'draft').length,
    completed: presentations.filter(p => p.status === 'completed').length
  }

  const handleCreatePresentation = () => {
    router.push('/editor/new')
  }

  const handlePresentationClick = (id: number) => {
    router.push(`/editor/${id}`)
  }

  const handleLogout = () => {
    // Clear demo cookie
    document.cookie = 'demo-user=; path=/; max-age=0'
    router.push('/auth/login')
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome back! 👋</h2>
          <p className="text-xl text-gray-300">Ready to create amazing presentations?</p>
        </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.length === 0 ? (
              <Card className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="text-6xl mb-4 text-blue-500">📊</div>
                <div className="text-2xl text-blue-200 mb-2">No presentations yet</div>
                <div className="text-blue-400 mb-6">Create your first deck to get started!</div>
                <Button variant="default" onClick={handleCreatePresentation}>
                  New Presentation
                </Button>
              </Card>
            ) : (
              presentations.map((presentation) => (
                <Card 
                  key={presentation.id} 
                  className="p-6 hover:border-blue-500/50 transition-all cursor-pointer group"
                  onClick={() => handlePresentationClick(presentation.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">📊</div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      presentation.status === 'completed' 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-yellow-900/50 text-yellow-300'
                    }`}>
                      {presentation.status}
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-semibold mb-2 group-hover:text-blue-300 transition-colors">
                    {presentation.title || 'Untitled Presentation'}
                  </h4>
                  
                  <div className="text-sm text-gray-400 mb-4">
                    <p>Updated {new Date(presentation.updatedAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Play className="w-3 h-3 mr-1" />
                      Present
                    </Button>
                    <Button size="sm" variant="secondary">
                      <FileText className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </Card>
              ))
            )}

            {/* Add new card */}
            <Card className="p-6 border-dashed border-gray-600 hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[200px]" onClick={handleCreatePresentation}>
              <Plus className="w-12 h-12 text-gray-500 group-hover:text-blue-400 transition-colors mb-4" />
              <h4 className="text-lg font-semibold text-gray-400 group-hover:text-blue-300 transition-colors mb-2">
                Create New Presentation
              </h4>
              <p className="text-sm text-gray-500 text-center">
                Upload your data and let AI create amazing slides
              </p>
            </Card>
          </div>
        </section>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Create New Presentation</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Presentation Name</label>
                <input
                  type="text"
                  placeholder="e.g., Q1 Sales Review"
                  className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Data</label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 font-semibold mb-2">Drag & drop your files here</p>
                  <p className="text-sm text-gray-400 mb-4">Supports CSV, Excel, and JSON files</p>
                  <Button variant="secondary">Browse Files</Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" className="flex-1" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  setShowUploadModal(false)
                  // Navigate to editor
                  router.push('/editor/new')
                }}>
                  Create Presentation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}