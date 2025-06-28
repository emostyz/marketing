'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Play, Pause, Download, Edit3, Copy, Trash2, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SaveStatusIndicator } from '@/components/ui/SaveStatusIndicator'

interface SimpleDeckViewerProps {
  presentationId: string
}

export default function SimpleDeckViewer({ presentationId }: SimpleDeckViewerProps) {
  const router = useRouter()
  const [presentation, setPresentation] = useState<any>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState<string>('')
  const [showEditPanel, setShowEditPanel] = useState(false)
  
  // Save functionality
  const [saveState, setSaveState] = useState<{ status: 'idle' | 'saving' | 'saved' | 'error' | 'offline', lastSaved: Date | null, lastError: string | null }>({ 
    status: 'idle', 
    lastSaved: null, 
    lastError: null 
  })
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadPresentation()
    
    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [presentationId])
  
  // Debounced save function
  const debouncedSave = (updatedPresentation: any, changeDescription: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      savePresentation(updatedPresentation, changeDescription)
    }, 2000) // Save after 2 seconds of inactivity
  }
  
  const savePresentation = async (presentationData: any, changeDescription: string) => {
    if (!presentationData || presentationId.startsWith('demo-deck-')) {
      console.log('⏭️ Skipping save for demo deck')
      return
    }
    
    try {
      setSaveState(prev => ({ ...prev, status: 'saving', lastError: null }))
      console.log('💾 Saving presentation changes:', changeDescription)
      
      const response = await fetch(`/api/presentations/${presentationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(presentationData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSaveState({
          status: 'saved',
          lastSaved: new Date(),
          lastError: null
        })
        console.log('✅ Presentation saved successfully')
      } else {
        throw new Error(result.error || 'Failed to save presentation')
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Failed to save presentation:', errorMessage)
      setSaveState(prev => ({
        ...prev,
        status: 'error',
        lastError: errorMessage
      }))
    }
  }

  const loadPresentation = async () => {
    try {
      console.log('🔍 Loading presentation:', presentationId)
      setLoading(true)
      
      const response = await fetch(`/api/presentations/${presentationId}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        console.log('✅ Presentation loaded:', data.data)
        setPresentation(data.data)
        setError(null)
      } else {
        console.error('❌ Failed to load presentation:', data)
        setError('Failed to load presentation')
      }
    } catch (err) {
      console.error('💥 Error loading presentation:', err)
      setError('Error loading presentation')
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    if (presentation && currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const startEditing = (elementId: string, currentText: string) => {
    setSelectedElementId(elementId)
    setEditingText(currentText)
    setShowEditPanel(true)
  }

  const saveEdit = () => {
    if (!selectedElementId || !presentation) return

    const updatedPresentation = { ...presentation }
    const currentSlideData = updatedPresentation.slides[currentSlide]
    
    if (currentSlideData && currentSlideData.elements) {
      currentSlideData.elements = currentSlideData.elements.map((element: any) => {
        if (element.id === selectedElementId) {
          return {
            ...element,
            content: {
              ...element.content,
              text: editingText,
              html: editingText
            }
          }
        }
        return element
      })
    }

    setPresentation(updatedPresentation)
    
    // Save the changes
    debouncedSave(updatedPresentation, `Text edited on slide ${currentSlide + 1}`)
    
    setSelectedElementId(null)
    setEditingText('')
    setShowEditPanel(false)
  }

  const cancelEdit = () => {
    setSelectedElementId(null)
    setEditingText('')
    setShowEditPanel(false)
  }

  const duplicateSlide = () => {
    if (!presentation) return

    const currentSlideData = presentation.slides[currentSlide]
    const newSlide = {
      ...currentSlideData,
      id: `${currentSlideData.id}_copy_${Date.now()}`,
      title: `${currentSlideData.title} (Copy)`,
      elements: currentSlideData.elements?.map((element: any) => ({
        ...element,
        id: `${element.id}_copy_${Date.now()}`
      })) || []
    }

    const updatedPresentation = {
      ...presentation,
      slides: [
        ...presentation.slides.slice(0, currentSlide + 1),
        newSlide,
        ...presentation.slides.slice(currentSlide + 1)
      ]
    }

    setPresentation(updatedPresentation)
    setCurrentSlide(currentSlide + 1)
    
    // Save the changes
    debouncedSave(updatedPresentation, `Duplicated slide ${currentSlide + 1}`)
  }

  const deleteSlide = () => {
    if (!presentation || presentation.slides.length <= 1) return

    const updatedPresentation = {
      ...presentation,
      slides: presentation.slides.filter((_: any, index: number) => index !== currentSlide)
    }

    setPresentation(updatedPresentation)
    
    if (currentSlide >= updatedPresentation.slides.length) {
      setCurrentSlide(updatedPresentation.slides.length - 1)
    }
    
    // Save the changes
    debouncedSave(updatedPresentation, `Deleted slide ${currentSlide + 1}`)
  }

  const renderSlideContent = (slide: any) => {
    if (!slide) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Slide Not Found</h2>
            <p>Unable to load slide content</p>
          </div>
        </div>
      )
    }

    // Handle both content array (new format) and elements array (API format)
    const slideElements = slide.elements || slide.content || []
    
    if (!slideElements || slideElements.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{slide.title || 'Untitled Slide'}</h2>
            <p className="text-gray-600">This slide is being generated...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="relative w-full h-full bg-white overflow-hidden">
        {/* Render slide elements with beautiful styling */}
        {slideElements.map((element: any, index: number) => (
          <motion.div
            key={element.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="absolute"
            style={{
              left: element.position?.x || 50,
              top: element.position?.y || 50,
              width: element.position?.width || 400,
              height: element.position?.height || 'auto',
              transform: element.position?.rotation ? `rotate(${element.position.rotation}deg)` : 'none',
              zIndex: element.layer || index + 1
            }}
          >
            {element.type === 'text' && (
              <div 
                className={`w-full h-full flex items-center group cursor-pointer transition-all duration-200 ${
                  editMode ? 'hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50' : ''
                } ${selectedElementId === element.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  backgroundColor: element.style?.backgroundColor || 'transparent',
                  color: element.style?.color || '#1f2937',
                  fontSize: element.style?.fontSize || 16,
                  fontFamily: element.style?.fontFamily || 'Inter, sans-serif',
                  fontWeight: element.style?.fontWeight || 'normal',
                  textAlign: element.style?.textAlign || 'left',
                  lineHeight: element.style?.lineHeight || 1.5,
                  borderRadius: element.style?.borderRadius || 0,
                  border: element.style?.borderWidth ? `${element.style.borderWidth}px solid ${element.style.borderColor || '#e5e7eb'}` : 'none',
                  padding: element.style?.padding || 0,
                  boxShadow: element.style?.boxShadow || 'none'
                }}
                onClick={() => {
                  if (editMode) {
                    const currentText = element.content?.text || element.content?.html || element.content || ''
                    startEditing(element.id, currentText)
                  }
                }}
              >
                {/* Edit button overlay for edit mode */}
                {editMode && (
                  <button
                    className="absolute top-2 right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      const currentText = element.content?.text || element.content?.html || element.content || ''
                      startEditing(element.id, currentText)
                    }}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                
                {element.content?.html ? (
                  <div 
                    className="w-full"
                    dangerouslySetInnerHTML={{ __html: element.content.html }} 
                  />
                ) : (
                  <div className="w-full">
                    {element.content?.text || element.content || 'Text content'}
                  </div>
                )}
              </div>
            )}
            
            {element.type === 'chart' && (
              <div 
                className="w-full h-full bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col"
                style={{
                  borderRadius: element.style?.borderRadius || 12,
                  boxShadow: element.style?.boxShadow || '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {element.content?.title || 'Chart'}
                </h3>
                
                {/* Beautiful chart placeholder with data */}
                <div className="flex-1 relative">
                  {element.content?.type === 'bar' && (
                    <div className="h-full flex items-end space-x-4 px-4">
                      {(element.content.data || []).slice(0, 5).map((item: any, i: number) => {
                        const maxValue = Math.max(...(element.content.data || []).map((d: any) => d.value || d.y || 0))
                        const height = ((item.value || item.y || 0) / maxValue) * 80
                        const colors = element.content.colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
                        
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full rounded-t-lg transition-all duration-500 ease-out"
                              style={{ 
                                height: `${height}%`,
                                backgroundColor: colors[i % colors.length],
                                minHeight: '20px'
                              }}
                            />
                            <div className="text-xs text-gray-600 mt-2 text-center font-medium">
                              {item.name || item.x || `Item ${i + 1}`}
                            </div>
                            <div className="text-xs text-gray-800 font-bold">
                              {formatNumber(item.value || item.y || 0)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  
                  {element.content?.type === 'line' && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{element.content.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(element.content.data || []).length} data points
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {(!element.content?.type || element.content.type === 'default') && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-700">Data Visualization</p>
                        <p className="text-xs text-gray-500 mt-1">Professional chart display</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {element.type === 'image' && (
              <div className="w-full h-full rounded-lg overflow-hidden">
                <img 
                  src={element.content?.src || element.content?.url} 
                  alt={element.content?.alt || 'Slide image'}
                  className="w-full h-full object-cover"
                  style={{
                    borderRadius: element.style?.borderRadius || 8
                  }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  // Helper function to format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Presentation</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-8 max-w-lg bg-white shadow-lg">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Error Loading Presentation</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <Button onClick={loadPresentation}>Try Again</Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!presentation || !presentation.slides || presentation.slides.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-8 max-w-lg bg-white shadow-lg">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">No Slides Found</h2>
            <p className="text-gray-600 mb-6">This presentation doesn't contain any slides.</p>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const currentSlideData = presentation.slides[currentSlide]

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{presentation.title}</h1>
            <p className="text-sm text-gray-600">
              Slide {currentSlide + 1} of {presentation.slides.length}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Save Status Indicator */}
            <SaveStatusIndicator 
              status={saveState.status}
              lastSaved={saveState.lastSaved}
              lastError={saveState.lastError}
              onForceSave={() => {
                if (presentation) {
                  savePresentation(presentation, 'Manual save')
                }
              }}
            />
            
            <Button
              onClick={() => setEditMode(!editMode)}
              size="sm"
              variant={editMode ? "default" : "outline"}
              className={editMode ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {editMode ? 'Exit Edit' : 'Edit Mode'}
            </Button>

            {editMode && (
              <>
                <Button
                  onClick={duplicateSlide}
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                
                <Button
                  onClick={deleteSlide}
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  disabled={presentation?.slides?.length <= 1}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              size="sm"
              variant="outline"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button 
              onClick={() => {
                if (presentation) {
                  savePresentation(presentation, 'Manual save')
                }
              }}
              size="sm" 
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Now
            </Button>
            
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main slide area */}
      <div className="flex-1 relative">
        <div className="h-[calc(100vh-140px)] flex items-center justify-center p-8">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-6xl h-full bg-white rounded-lg border border-gray-200 shadow-lg p-8 relative overflow-hidden"
          >
            {renderSlideContent(currentSlideData)}
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-gray-200 shadow-md">
            <Button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              size="sm"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm text-gray-600 px-4 font-medium">
              {currentSlide + 1} / {presentation.slides.length}
            </span>
            
            <Button
              onClick={nextSlide}
              disabled={currentSlide === presentation.slides.length - 1}
              size="sm"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Slide thumbnails */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {presentation.slides.map((slide: any, index: number) => (
            <button
              key={slide.id || index}
              onClick={() => setCurrentSlide(index)}
              className={`
                flex-shrink-0 w-32 h-20 rounded border-2 transition-all
                ${index === currentSlide 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }
              `}
            >
              <div className="w-full h-full p-2 text-xs text-left overflow-hidden">
                <div className="font-medium text-gray-900 truncate">
                  {slide.title || `Slide ${index + 1}`}
                </div>
                <div className="text-gray-500 text-[10px] mt-1">
                  {slide.content?.length || 0} elements
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Text Editing Panel */}
      {showEditPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Text Content</h3>
              <Button
                onClick={cancelEdit}
                size="sm"
                variant="outline"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Content
              </label>
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your text content..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                onClick={cancelEdit}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={saveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Mode Indicator */}
      {editMode && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-4 h-4" />
            <span className="text-sm font-medium">Edit Mode Active</span>
            <span className="text-xs opacity-75">Click text elements to edit</span>
          </div>
        </div>
      )}
    </div>
  )
}