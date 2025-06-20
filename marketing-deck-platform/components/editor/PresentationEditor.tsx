'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SlideEditor } from './SlideEditor'
import { DataUploadModal } from '@/components/upload/SimpleDataUploadModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Save, Download, ChevronLeft, ChevronRight, Plus, Brain } from 'lucide-react'

interface PresentationEditorProps {
  userId: number
  presentationId?: string
  initialData?: any
  mode: 'new' | 'edit'
}

export function PresentationEditor({ 
  userId, 
  presentationId, 
  initialData,
  mode 
}: PresentationEditorProps) {
  const router = useRouter()
  const [presentation, setPresentation] = useState(initialData || {
    title: 'Untitled Presentation',
    slides: [{
      id: '1',
      type: 'title',
      content: {
        title: 'Your Presentation Title',
        subtitle: 'Add your subtitle here'
      }
    }]
  })
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(mode === 'new')

  const currentSlide = presentation.slides[currentSlideIndex]

  const handleSave = async () => {
    setSaving(true)
    try {
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (mode === 'new') {
        // In a real app, this would create a new presentation in the database
        // For now, navigate to the existing working editor
        router.push('/editor/1')
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSlideUpdate = (updatedSlide: any) => {
    const newSlides = [...presentation.slides]
    newSlides[currentSlideIndex] = updatedSlide
    setPresentation({ ...presentation, slides: newSlides })
  }

  const addNewSlide = () => {
    const newSlide = {
      id: Date.now().toString(),
      type: 'content',
      content: {
        title: 'New Slide',
        body: 'Add your content here'
      }
    }
    
    const newSlides = [...presentation.slides]
    newSlides.splice(currentSlideIndex + 1, 0, newSlide)
    
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(currentSlideIndex + 1)
  }

  const handleDataUpload = async (uploadData: any) => {
    setShowUploadModal(false)
    
    try {
      // Call the API to generate slides from the uploaded data
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: uploadData.title,
          data: uploadData.data
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.slides) {
          setPresentation({
            title: uploadData.title,
            slides: result.slides
          })
          setCurrentSlideIndex(0)
        }
      } else {
        console.error('Failed to generate slides')
        // Fallback to sample presentation
        setPresentation({
          title: uploadData.title,
          slides: [
            {
              id: '1',
              type: 'title',
              content: {
                title: uploadData.title,
                subtitle: 'Generated from your data'
              }
            }
          ]
        })
      }
    } catch (error) {
      console.error('Error generating presentation:', error)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <input
              type="text"
              value={presentation.title}
              onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
              className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowUploadModal(true)}
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slide Thumbnails */}
        <div className="w-64 border-r border-gray-700 bg-gray-900/30 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Slides</h3>
            <Button
              size="sm"
              onClick={addNewSlide}
              className="flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            {presentation.slides.map((slide: any, index: number) => (
              <div
                key={slide.id}
                onClick={() => setCurrentSlideIndex(index)}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  index === currentSlideIndex
                    ? 'bg-blue-900/50 border-2 border-blue-500'
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border-2 border-transparent'
                }`}
              >
                <div className="text-sm font-medium">Slide {index + 1}</div>
                <div className="text-xs text-gray-400 truncate">
                  {slide.content?.title || 'Untitled'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Editor */}
        <div className="flex-1 p-6">
          <Card className="h-full bg-gray-900/30">
            <div className="p-8 h-full">
              <div className="mb-6">
                <input
                  type="text"
                  value={currentSlide?.content?.title || ''}
                  onChange={(e) => {
                    const updatedSlide = {
                      ...currentSlide,
                      content: {
                        ...currentSlide.content,
                        title: e.target.value
                      }
                    }
                    handleSlideUpdate(updatedSlide)
                  }}
                  className="text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 w-full"
                  placeholder="Slide Title"
                />
              </div>
              
              <div className="mb-6">
                <textarea
                  value={currentSlide?.content?.body || currentSlide?.content?.subtitle || ''}
                  onChange={(e) => {
                    const updatedSlide = {
                      ...currentSlide,
                      content: {
                        ...currentSlide.content,
                        body: e.target.value,
                        subtitle: e.target.value
                      }
                    }
                    handleSlideUpdate(updatedSlide)
                  }}
                  className="w-full h-32 bg-gray-800/50 border border-gray-600 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add your content here..."
                />
              </div>

              {currentSlide?.type === 'title' && (
                <div className="text-center py-8">
                  <h1 className="text-4xl font-bold mb-4">{currentSlide.content?.title || 'Title'}</h1>
                  <h2 className="text-2xl text-blue-400">{currentSlide.content?.subtitle || 'Subtitle'}</h2>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="border-t border-gray-700 bg-gray-900/50 px-6 py-3">
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="text-sm text-gray-400">
            {currentSlideIndex + 1} / {presentation.slides.length}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))}
            disabled={currentSlideIndex === presentation.slides.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <DataUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleDataUpload}
        />
      )}
    </div>
  )
}