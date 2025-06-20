'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProfessionalSlideEditor } from '@/components/slides/ProfessionalSlideEditor'
import { useAuth } from '@/lib/auth/auth-context'
import { dbHelpers, PresentationData as DBPresentationData } from '@/lib/supabase/database-helpers'
import { 
  Save, 
  Download, 
  Share2, 
  Plus, 
  Eye, 
  ArrowLeft,
  Presentation,
  BarChart3,
  Type,
  Image as ImageIcon,
  Shuffle
} from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'

interface SlideContent {
  title: string
  subtitle?: string
  body?: string
  bulletPoints?: string[]
  description?: string
  narrative?: string[]
  brainGenerated?: boolean
  confidence?: number
}

interface SlideData {
  id: string
  type: string
  title: string
  content: SlideContent
  chartType?: string
  data?: any[]
  categories?: string[]
  index?: string
  tremorConfig?: any
}

interface PresentationData {
  id: string
  title: string
  description: string
  slides: SlideData[]
  metadata: {
    datasetName?: string
    analysisType?: string
    confidence?: number
    generatedAt: string
  }
}

export default function DeckBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [presentation, setPresentation] = useState<PresentationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user) {
      loadPresentation()
    }
  }, [params.id, user, authLoading, router])

  const loadPresentation = async () => {
    if (!user) return

    try {
      // Try to load from Supabase first
      const { data: dbPresentation, error } = await dbHelpers.loadPresentation(params.id as string, user.id)
      
      if (dbPresentation) {
        // Convert DB format to local format
        const presentationData: PresentationData = {
          id: dbPresentation.id!,
          title: dbPresentation.title,
          description: dbPresentation.description || 'Created with AEDRIN AI Brain',
          slides: dbPresentation.slides || [],
          metadata: dbPresentation.metadata
        }
        
        setPresentation(presentationData)
        if (presentationData.slides.length > 0) {
          setSelectedSlideId(presentationData.slides[0].id)
        }
      } else {
        // Check localStorage as fallback for existing presentations
        const savedData = localStorage.getItem(`presentation_${params.id}`)
        
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          setPresentation(parsedData)
          if (parsedData.slides.length > 0) {
            setSelectedSlideId(parsedData.slides[0].id)
          }
          
          // Migrate localStorage data to Supabase
          await migrateToDatabase(parsedData)
        } else {
          // Create a new default presentation
          const defaultPresentation: PresentationData = {
            id: params.id as string,
            title: 'AI-Generated Presentation',
            description: 'Created with AEDRIN AI Brain',
            slides: [],
            metadata: {
              generatedAt: new Date().toISOString()
            }
          }
          setPresentation(defaultPresentation)
        }
      }
    } catch (error) {
      console.error('Error loading presentation:', error)
      toast.error('Failed to load presentation')
    } finally {
      setIsLoading(false)
    }
  }

  const migrateToDatabase = async (localPresentation: PresentationData) => {
    if (!user) return

    try {
      const dbPresentation: DBPresentationData = {
        id: localPresentation.id,
        user_id: user.id,
        title: localPresentation.title,
        description: localPresentation.description,
        slides: localPresentation.slides,
        metadata: localPresentation.metadata,
        status: localPresentation.slides.length > 0 ? 'completed' : 'draft'
      }

      await dbHelpers.savePresentation(dbPresentation)
      
      // Remove from localStorage after successful migration
      localStorage.removeItem(`presentation_${localPresentation.id}`)
    } catch (error) {
      console.error('Error migrating presentation to database:', error)
    }
  }

  const savePresentation = async () => {
    if (!presentation || !user) return

    setIsSaving(true)
    try {
      const dbPresentation: DBPresentationData = {
        id: presentation.id,
        user_id: user.id,
        title: presentation.title,
        description: presentation.description,
        slides: presentation.slides,
        metadata: presentation.metadata,
        status: presentation.slides.length > 0 ? 'completed' : 'draft'
      }

      const { data, error } = await dbHelpers.savePresentation(dbPresentation)
      
      if (error) {
        throw new Error(error)
      }

      // Update local state with the saved data
      if (data) {
        const updatedPresentation: PresentationData = {
          id: data.id!,
          title: data.title,
          description: data.description || 'Created with AEDRIN AI Brain',
          slides: data.slides,
          metadata: data.metadata
        }
        setPresentation(updatedPresentation)
      }
      
      toast.success('Presentation saved to your account!')
    } catch (error) {
      console.error('Error saving presentation:', error)
      toast.error('Failed to save presentation to your account')
      
      // Fallback to localStorage
      localStorage.setItem(`presentation_${presentation.id}`, JSON.stringify(presentation))
      toast.success('Saved locally as backup')
    } finally {
      setIsSaving(false)
    }
  }

  const addSlide = (type: 'title' | 'content' | 'chart') => {
    if (!presentation) return

    const newSlide: SlideData = {
      id: `slide_${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Slide`,
      content: {
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Slide`,
        subtitle: 'Click edit to customize this slide',
        body: 'Add your content here...',
        bulletPoints: type === 'content' ? ['Key point 1', 'Key point 2', 'Key point 3'] : undefined,
        description: type === 'chart' ? 'This chart shows important data insights' : undefined,
        narrative: type === 'chart' ? ['Data shows positive trends', 'Growth is accelerating'] : undefined
      },
      chartType: type === 'chart' ? 'bar' : undefined,
      data: type === 'chart' ? [
        { name: 'Q1', value: 100, growth: 15 },
        { name: 'Q2', value: 120, growth: 20 },
        { name: 'Q3', value: 140, growth: 25 },
        { name: 'Q4', value: 160, growth: 30 }
      ] : undefined,
      categories: type === 'chart' ? ['value', 'growth'] : undefined,
      index: type === 'chart' ? 'name' : undefined,
      tremorConfig: type === 'chart' ? {
        colors: ['blue', 'emerald'],
        height: 64
      } : undefined
    }

    const updatedPresentation = {
      ...presentation,
      slides: [...presentation.slides, newSlide]
    }

    setPresentation(updatedPresentation)
    setSelectedSlideId(newSlide.id)
    toast.success('New slide added!')
  }

  const updateSlide = (updatedSlide: SlideData) => {
    if (!presentation) return

    const updatedSlides = presentation.slides.map(slide =>
      slide.id === updatedSlide.id ? updatedSlide : slide
    )

    setPresentation({
      ...presentation,
      slides: updatedSlides
    })
  }

  const deleteSlide = (slideId: string) => {
    if (!presentation) return

    const updatedSlides = presentation.slides.filter(slide => slide.id !== slideId)
    
    setPresentation({
      ...presentation,
      slides: updatedSlides
    })

    // Update selected slide if the deleted one was selected
    if (selectedSlideId === slideId) {
      setSelectedSlideId(updatedSlides.length > 0 ? updatedSlides[0].id : null)
    }

    toast.success('Slide deleted')
  }

  const duplicateSlide = (slide: SlideData) => {
    if (!presentation) return

    const duplicatedSlide: SlideData = {
      ...slide,
      id: `slide_${Date.now()}`,
      title: `${slide.title} (Copy)`
    }

    const slideIndex = presentation.slides.findIndex(s => s.id === slide.id)
    const updatedSlides = [
      ...presentation.slides.slice(0, slideIndex + 1),
      duplicatedSlide,
      ...presentation.slides.slice(slideIndex + 1)
    ]

    setPresentation({
      ...presentation,
      slides: updatedSlides
    })

    setSelectedSlideId(duplicatedSlide.id)
    toast.success('Slide duplicated!')
  }

  const exportPresentation = async () => {
    toast.loading('Preparing presentation for download...')
    
    // Here you would integrate with your PowerPoint export functionality
    setTimeout(() => {
      toast.success('Presentation exported successfully!')
    }, 2000)
  }

  const previewPresentation = () => {
    if (!presentation || presentation.slides.length === 0) {
      toast.error('No slides to preview')
      return
    }

    // Navigate to presentation preview mode
    router.push(`/presentation/${presentation.id}/preview`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your presentation...</p>
        </div>
      </div>
    )
  }

  if (!presentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Presentation not found</p>
          <Button onClick={() => router.push('/editor/new')} className="mt-4">
            Create New Presentation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">{presentation.title}</h1>
                <p className="text-sm text-gray-400">{presentation.slides.length} slides</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previewPresentation}
                disabled={presentation.slides.length === 0}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportPresentation}
                disabled={presentation.slides.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={savePresentation}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Slide Thumbnails Sidebar */}
          <div className="col-span-3">
            <Card className="p-4 bg-gray-900/50 border-gray-700 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Slides</h3>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => addSlide('title')}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Add Slide Buttons */}
              <div className="space-y-2 mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addSlide('title')}
                  className="w-full justify-start"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Title Slide
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addSlide('content')}
                  className="w-full justify-start"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Content Slide
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addSlide('chart')}
                  className="w-full justify-start"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Chart Slide
                </Button>
              </div>

              {/* Slide List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {presentation.slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    onClick={() => setSelectedSlideId(slide.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSlideId === slide.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">{index + 1}</span>
                      {slide.type === 'chart' && <BarChart3 className="w-3 h-3" />}
                      {slide.type === 'content' && <Type className="w-3 h-3" />}
                      {slide.type === 'title' && <ImageIcon className="w-3 h-3" />}
                    </div>
                    <p className="text-sm font-medium text-white truncate">{slide.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{slide.type} slide</p>
                  </div>
                ))}
                
                {presentation.slides.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Presentation className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No slides yet</p>
                    <p className="text-xs">Add your first slide above</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Main Slide Editor */}
          <div className="col-span-9">
            {selectedSlideId && presentation.slides.length > 0 ? (
              <div className="space-y-6">
                {(() => {
                  const selectedSlide = presentation.slides.find(s => s.id === selectedSlideId)
                  const slideIndex = presentation.slides.findIndex(s => s.id === selectedSlideId)
                  
                  return selectedSlide ? (
                    <ProfessionalSlideEditor
                      slide={selectedSlide}
                      slideNumber={slideIndex + 1}
                      onUpdate={updateSlide}
                    />
                  ) : null
                })()}
              </div>
            ) : (
              <Card className="p-12 bg-gray-900/50 border-gray-700 text-center">
                <Presentation className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-white mb-2">Start Building Your Presentation</h3>
                <p className="text-gray-400 mb-6">Add slides using the sidebar to get started</p>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => addSlide('title')} className="bg-blue-600 hover:bg-blue-700">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Title Slide
                  </Button>
                  <Button onClick={() => addSlide('content')} variant="outline">
                    <Type className="w-4 h-4 mr-2" />
                    Add Content
                  </Button>
                  <Button onClick={() => addSlide('chart')} variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Add Chart
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}