'use client'

import PublicNavigation from '@/components/navigation/PublicNavigation'
import PublicFooter from '@/components/navigation/PublicFooter'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, FileText, Calendar, Eye, Sparkles, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

const mockPresentations = [
  {
    id: '1',
    title: 'Q2 Board Update',
    createdAt: '2024-06-01',
    slides: 12
  },
  {
    id: '2',
    title: 'Customer Insights',
    createdAt: '2024-05-15',
    slides: 8
  }
]

export default function PresentationsPage() {
  const [generatingSlides, setGeneratingSlides] = useState<string | null>(null)
  const [queueStatuses, setQueueStatuses] = useState<Record<string, any>>({})
  const presentations = mockPresentations // Replace with real data fetch

  const generateSlides = async (presentationId: string) => {
    setGeneratingSlides(presentationId)
    toast.loading('Starting AI pipeline...', { id: 'generate' })

    try {
      // Call the AI pipeline
      const response = await fetch('/api/ai/run-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ presentationId })
      })

      if (!response.ok) {
        throw new Error('Failed to start pipeline')
      }

      const result = await response.json()
      toast.success('Pipeline started! Generating slides...', { id: 'generate' })

      // Poll for completion
      pollQueueStatus(presentationId)
    } catch (error) {
      console.error('Pipeline error:', error)
      toast.error('Failed to start pipeline', { id: 'generate' })
      setGeneratingSlides(null)
    }
  }

  const pollQueueStatus = async (presentationId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/ai/queue-status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (response.ok) {
          const status = await response.json()
          setQueueStatuses(prev => ({ ...prev, [presentationId]: status }))

          if (status.status === 'completed') {
            clearInterval(pollInterval)
            setGeneratingSlides(null)
            
            // Fetch final JSON
            const presentationResponse = await fetch(`/api/presentations/${presentationId}`)
            if (presentationResponse.ok) {
              const presentationData = await presentationResponse.json()
              toast.success('Slides generated successfully!', { id: 'generate' })
              
              // Navigate to deck builder with the generated data
              window.location.href = `/deck-builder/${presentationId}?generated=true`
            }
          } else if (status.status === 'failed') {
            clearInterval(pollInterval)
            setGeneratingSlides(null)
            toast.error('Pipeline failed', { id: 'generate' })
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000) // Poll every 2 seconds
  }
  return (
    <>
      <PublicNavigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold text-white mb-1">Your Presentations</h1>
              <p className="text-lg text-gray-400">All your decks in one place. Create, edit, and present with ease.</p>
            </div>
            <Link href="/deck-builder/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3">
                <Plus className="w-5 h-5 mr-2" /> New Presentation
              </Button>
            </Link>
          </div>
          {presentations.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No presentations yet</h2>
              <p className="mb-6">Create your first presentation to get started.</p>
              <Link href="/deck-builder/new">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3">
                  <Plus className="w-5 h-5 mr-2" /> New Presentation
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {presentations.map(p => (
                <div key={p.id} data-cy="presentation-card" className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 flex flex-col shadow-lg">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 truncate">{p.title}</h3>
                    <div className="flex items-center text-gray-400 text-sm mb-4">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created {p.createdAt}
                    </div>
                    <div className="text-gray-300 text-sm mb-4">{p.slides} slides</div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50 hover:from-purple-600/30 hover:to-blue-600/30"
                      onClick={() => generateSlides(p.id)}
                      disabled={generatingSlides === p.id}
                      data-cy="generate-slides-button"
                    >
                      {generatingSlides === p.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-1" />
                      )}
                      Generate Slides
                    </Button>
                    <Link href={`/presentation/${p.id}/preview`}>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" /> Preview
                      </Button>
                    </Link>
                    <Link href={`/deck-builder/${p.id}`}>
                      <Button size="sm" variant="outline" className="flex-1">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <PublicFooter />
    </>
  )
} 