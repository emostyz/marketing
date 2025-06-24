'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import EditableElement from './EditableElement'
import EditorToolbar from './EditorToolbar'
import RichTextEditor from './RichTextEditor'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useMultiSelection } from '@/hooks/useMultiSelection'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useHistory, setStoreReferences } from '@/stores/history-store'
import { Save, Grid, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation?: number
  content?: any
  style?: any
  isLocked?: boolean
  isHidden?: boolean
  zIndex?: number
}

interface Slide {
  id: string
  title: string
  elements: SlideElement[]
  backgroundColor: string
  notes?: string
}

interface EnhancedPresentationEditorProps {
  presentationId?: string
  initialSlides?: any[]
  onSave?: (slides: Slide[]) => void
  onExport?: (format: string) => void
  onRegenerateSlide?: (slideIndex: number, customPrompt?: string) => Promise<any>
  className?: string
}

export default function EnhancedPresentationEditor({
  presentationId,
  initialSlides = [],
  onSave,
  onExport,
  onRegenerateSlide,
  className = ''
}: EnhancedPresentationEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [tool, setTool] = useState<'select' | 'text' | 'shape' | 'pan'>('select')
  const [zoom, setZoom] = useState(1)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [gridSize] = useState(20)
  
  // Convert initial slides to internal format
  const convertInitialSlides = useCallback((slides: any[]): Slide[] => {
    if (!slides || slides.length === 0) {
      return [{
        id: 'slide_default',
        title: 'Title Slide',
        backgroundColor: '#ffffff',
        elements: [],
        notes: ''
      }]
    }

    return slides.map((slide, index) => ({
      id: slide.id || `slide_${index}`,
      title: slide.title || `Slide ${index + 1}`,
      backgroundColor: slide.backgroundColor || slide.background?.value || '#ffffff',
      elements: (slide.elements || []).map((el: any) => ({
        id: el.id || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: el.type || 'text',
        position: el.position || { x: 100, y: 100 },
        size: el.size || { width: 200, height: 50 },
        rotation: el.rotation || 0,
        content: el.content,
        style: el.style || {},
        isLocked: el.isLocked || false,
        isHidden: el.isHidden || false,
        zIndex: el.zIndex || 1
      })),
      notes: slide.notes || ''
    }))
  }, [])

  const [slides, setSlides] = useState<Slide[]>(() => convertInitialSlides(initialSlides))
  const currentSlide = slides[currentSlideIndex] || slides[0]

  // History system
  const { recordElementUpdate, recordElementCreate, recordElementDelete } = useHistory()

  // Set up store references for history system
  useEffect(() => {
    setStoreReferences({
      updateElement: updateSlideElement,
      deleteElement: deleteSlideElement, 
      addElement: addSlideElement,
      updateSlide: updateSlide
    })
  }, [])

  // Auto-save system
  const { isSaving, saveError, getStatusText } = useAutoSave(
    slides,
    async (slidesToSave) => {
      if (onSave) {
        await onSave(slidesToSave)
      }
      return { success: true }
    },
    { 
      enabled: !!onSave,
      debounceDelay: 3000 // 3 second debounce
    }
  )

  // Multi-selection system
  const {
    selectedIds,
    selectedElements,
    hasSelection,
    hasMultipleSelection,
    selectionBox,
    isSelecting,
    selectAll,
    clearSelection,
    handleElementClick,
    isSelected
  } = useMultiSelection({
    elements: currentSlide?.elements || [],
    containerRef: canvasRef,
    onSelectionChange: (ids) => {
      // Selection changed
    },
    disabled: tool !== 'select'
  })

  // Element operations
  const updateSlideElement = useCallback((slideId: string, elementId: string, updates: Partial<SlideElement>) => {
    setSlides(prev => prev.map(slide => {
      if (slide.id !== slideId) return slide
      
      return {
        ...slide,
        elements: slide.elements.map(element => {
          if (element.id !== elementId) return element
          return { ...element, ...updates }
        })
      }
    }))
  }, [])

  const deleteSlideElement = useCallback((slideId: string, elementId: string) => {
    setSlides(prev => prev.map(slide => {
      if (slide.id !== slideId) return slide
      
      return {
        ...slide,
        elements: slide.elements.filter(element => element.id !== elementId)
      }
    }))
  }, [])

  const addSlideElement = useCallback((slideId: string, element: SlideElement) => {
    setSlides(prev => prev.map(slide => {
      if (slide.id !== slideId) return slide
      
      return {
        ...slide,
        elements: [...slide.elements, element]
      }
    }))
  }, [])

  const updateSlide = useCallback((slideId: string, updates: Partial<Slide>) => {
    setSlides(prev => prev.map(slide => {
      if (slide.id !== slideId) return slide
      return { ...slide, ...updates }
    }))
  }, [])

  // Element actions
  const handleUpdateElement = useCallback((elementId: string, updates: Partial<SlideElement>) => {
    const element = currentSlide.elements.find(el => el.id === elementId)
    if (!element) return

    recordElementUpdate(currentSlide.id, elementId, element, { ...element, ...updates })
    updateSlideElement(currentSlide.id, elementId, updates)
  }, [currentSlide, recordElementUpdate, updateSlideElement])

  const handleDeleteElements = useCallback((elementIds: string[]) => {
    elementIds.forEach(elementId => {
      const element = currentSlide.elements.find(el => el.id === elementId)
      if (element) {
        recordElementDelete(currentSlide.id, element)
        deleteSlideElement(currentSlide.id, elementId)
      }
    })
    clearSelection()
    toast.success(`Deleted ${elementIds.length} element(s)`)
  }, [currentSlide, recordElementDelete, deleteSlideElement, clearSelection])

  const handleDuplicateElements = useCallback((elementIds: string[]) => {
    elementIds.forEach(elementId => {
      const element = currentSlide.elements.find(el => el.id === elementId)
      if (element) {
        const newElement: SlideElement = {
          ...element,
          id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          position: {
            x: element.position.x + 20,
            y: element.position.y + 20
          }
        }
        recordElementCreate(currentSlide.id, newElement)
        addSlideElement(currentSlide.id, newElement)
      }
    })
    toast.success(`Duplicated ${elementIds.length} element(s)`)
  }, [currentSlide, recordElementCreate, addSlideElement])

  const handleAddElement = useCallback((type: string, position?: { x: number; y: number }) => {
    const newElement: SlideElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      position: position || { x: 100, y: 100 },
      size: type === 'text' ? { width: 200, height: 50 } : { width: 200, height: 150 },
      rotation: 0,
      content: type === 'text' ? 'Edit this text' : {},
      style: {
        backgroundColor: type === 'shape' ? '#3b82f6' : 'transparent',
        color: type === 'text' ? '#000000' : undefined,
        fontSize: type === 'text' ? 16 : undefined,
        fontFamily: type === 'text' ? 'Inter' : undefined
      },
      isLocked: false,
      isHidden: false,
      zIndex: currentSlide.elements.length + 1
    }

    recordElementCreate(currentSlide.id, newElement)
    addSlideElement(currentSlide.id, newElement)
    toast.success(`Added ${type} element`)
  }, [currentSlide, recordElementCreate, addSlideElement])

  // Element movement
  const moveSelectedElements = useCallback((dx: number, dy: number) => {
    selectedElements.forEach(element => {
      if (element.isLocked) return
      
      const newPosition = {
        x: Math.max(0, element.position.x + dx),
        y: Math.max(0, element.position.y + dy)
      }
      
      handleUpdateElement(element.id, { position: newPosition })
    })
  }, [selectedElements, handleUpdateElement])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    actions: {
      save: () => onSave?.(slides),
      export: () => onExport?.('pdf'),
      copy: () => {
        if (hasSelection) {
          const serialized = JSON.stringify(selectedElements)
          navigator.clipboard.writeText(serialized)
          toast.success('Copied to clipboard')
        }
      },
      paste: async () => {
        try {
          const text = await navigator.clipboard.readText()
          const elements = JSON.parse(text)
          if (Array.isArray(elements)) {
            elements.forEach((el, index) => {
              handleAddElement(el.type, {
                x: el.position.x + 20 + (index * 10),
                y: el.position.y + 20 + (index * 10)
              })
            })
          }
        } catch (error) {
          toast.error('Failed to paste')
        }
      },
      duplicate: () => handleDuplicateElements(selectedIds),
      delete: () => handleDeleteElements(selectedIds),
      selectAll,
      clearSelection,
      moveUp: (large) => moveSelectedElements(0, large ? -gridSize : -1),
      moveDown: (large) => moveSelectedElements(0, large ? gridSize : 1),
      moveLeft: (large) => moveSelectedElements(large ? -gridSize : -1, 0),
      moveRight: (large) => moveSelectedElements(large ? gridSize : 1, 0),
      zoomIn: () => setZoom(prev => Math.min(5, prev * 1.2)),
      zoomOut: () => setZoom(prev => Math.max(0.1, prev / 1.2)),
      zoomActual: () => setZoom(1),
      toggleGrid: () => setShowGrid(prev => !prev),
      toggleSnap: () => setSnapToGrid(prev => !prev),
      selectTool: () => setTool('select'),
      textTool: () => setTool('text'),
      addText: () => handleAddElement('text'),
      addShape: () => handleAddElement('shape')
    },
    selectedElements
  })

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (tool === 'text') {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const x = (e.clientX - rect.left) / zoom
        const y = (e.clientY - rect.top) / zoom
        handleAddElement('text', { x, y })
        setTool('select')
      }
    }
  }, [tool, zoom, handleAddElement])

  return (
    <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
      {/* Toolbar */}
      <EditorToolbar
        selectedElements={selectedElements}
        onUpdateElements={({ elementIds, updates }) => {
          elementIds.forEach(id => handleUpdateElement(id, updates))
        }}
        onDeleteElements={handleDeleteElements}
        onDuplicateElements={handleDuplicateElements}
        onGroupElements={() => {}} // TODO: Implement grouping
        onUngroupElements={() => {}} // TODO: Implement ungrouping
        onAddElement={handleAddElement}
        onSave={() => onSave?.(slides)}
        onExport={(format) => onExport?.(format)}
        zoom={zoom}
        onZoomChange={setZoom}
        tool={tool}
        onToolChange={setTool}
        snapToGrid={snapToGrid}
        onSnapToGridChange={setSnapToGrid}
        showGrid={showGrid}
        onShowGridChange={setShowGrid}
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
          {hasSelection && (
            <Badge variant="secondary">
              {selectedElements.length} selected
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            <span>Grid: {showGrid ? 'On' : 'Off'}</span>
            <span>Snap: {snapToGrid ? 'On' : 'Off'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <div className="flex items-center gap-2">
            {isSaving ? (
              <Save className="w-4 h-4 animate-spin" />
            ) : (
              <div className={`w-2 h-2 rounded-full ${saveError ? 'bg-red-500' : 'bg-green-500'}`} />
            )}
            <span>{getStatusText()}</span>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Canvas */}
        <div 
          className="flex-1 relative overflow-auto bg-gray-100 p-8"
          style={{ cursor: tool === 'pan' ? 'grab' : 'default' }}
        >
          <div
            ref={canvasRef}
            className="slide-canvas relative mx-auto bg-white shadow-lg rounded"
            style={{
              width: 800 * zoom,
              height: 600 * zoom,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
            onClick={handleCanvasClick}
          >
            {/* Grid */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                  `,
                  backgroundSize: `${gridSize}px ${gridSize}px`
                }}
              />
            )}

            {/* Background */}
            <div 
              className="absolute inset-0 rounded"
              style={{ backgroundColor: currentSlide?.backgroundColor || '#ffffff' }}
            />

            {/* Elements */}
            <AnimatePresence>
              {currentSlide?.elements
                .filter(element => !element.isHidden)
                .map(element => (
                  <EditableElement
                    key={element.id}
                    element={element}
                    slideId={currentSlide.id}
                    isSelected={isSelected(element.id)}
                    onSelect={() => handleElementClick(element.id, { 
                      shiftKey: false, 
                      ctrlKey: false, 
                      metaKey: false 
                    } as MouseEvent)}
                    onUpdate={(updates) => handleUpdateElement(element.id, updates)}
                    onDelete={() => handleDeleteElements([element.id])}
                    onDuplicate={() => handleDuplicateElements([element.id])}
                    containerRef={canvasRef}
                    guidelines={{
                      horizontal: [0, 150, 300, 450, 600],
                      vertical: [0, 200, 400, 600, 800]
                    }}
                    snapToGrid={snapToGrid}
                    gridSize={gridSize}
                  />
                ))
              }
            </AnimatePresence>

            {/* Selection Box */}
            {isSelecting && selectionBox && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-20 pointer-events-none"
                style={{
                  left: selectionBox.x,
                  top: selectionBox.y,
                  width: selectionBox.width,
                  height: selectionBox.height
                }}
              />
            )}
          </div>
        </div>

        {/* Slide Thumbnails */}
        <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Slides</h3>
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <Card
                key={slide.id}
                className={`
                  p-2 cursor-pointer transition-all border-2
                  ${index === currentSlideIndex 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setCurrentSlideIndex(index)}
              >
                <div className="aspect-[4/3] bg-gray-100 rounded mb-2 relative overflow-hidden">
                  {/* Slide preview */}
                  <div 
                    className="absolute inset-0 text-xs"
                    style={{ backgroundColor: slide.backgroundColor }}
                  >
                    {slide.elements.slice(0, 3).map(el => (
                      <div
                        key={el.id}
                        className="absolute bg-gray-300 rounded"
                        style={{
                          left: `${(el.position.x / 800) * 100}%`,
                          top: `${(el.position.y / 600) * 100}%`,
                          width: `${(el.size.width / 800) * 100}%`,
                          height: `${(el.size.height / 600) * 100}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-sm font-medium truncate">
                  {slide.title}
                </div>
                <div className="text-xs text-gray-500">
                  {slide.elements.length} elements
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}