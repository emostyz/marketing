'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Settings, Download, Share, Play, Undo, Redo, 
  ZoomIn, ZoomOut, Grid, Eye, Save, Upload, Menu,
  Type, Image, Square, BarChart3, Table, Video,
  Palette, AlignLeft, Bold, Copy, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

// Import our new components
import GoogleSlidesInsertMenu from './GoogleSlidesInsertMenu'
import GoogleSlidesFormatMenu from './GoogleSlidesFormatMenu'
import WorkingElementControls from './WorkingElementControls'
import SlideTemplateSelector from './SlideTemplateSelector'
import ChartEditor from './ChartEditor'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'shape' | 'chart' | 'table'
  position: { x: number; y: number }
  size: { width: number; height: number }
  content?: any
  style?: any
  locked?: boolean
  hidden?: boolean
  rotation?: number
  zIndex?: number
}

interface Slide {
  id: string
  title: string
  elements: SlideElement[]
  background?: any
  notes?: string
}

interface PerfectDeckBuilderProps {
  initialSlides?: Slide[]
  onSave?: (slides: Slide[]) => void
  onExport?: (format: string) => void
}

export default function PerfectDeckBuilder({ 
  initialSlides = [], 
  onSave, 
  onExport 
}: PerfectDeckBuilderProps) {
  // State management
  const [slides, setSlides] = useState<Slide[]>(initialSlides.length > 0 ? initialSlides : [
    {
      id: 'slide-1',
      title: 'Slide 1',
      elements: [],
      background: { color: '#ffffff' },
      notes: ''
    }
  ])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Menu states
  const [showInsertMenu, setShowInsertMenu] = useState(false)
  const [showFormatMenu, setShowFormatMenu] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showChartEditor, setShowChartEditor] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  // History for undo/redo
  const [history, setHistory] = useState<Slide[][]>([slides])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentSlide = slides[currentSlideIndex]

  // History management
  const saveToHistory = useCallback((newSlides: Slide[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newSlides)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSlides(history[historyIndex - 1])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSlides(history[historyIndex + 1])
    }
  }, [history, historyIndex])

  // Slide management
  const addSlide = useCallback((templateId?: string) => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${slides.length + 1}`,
      elements: [],
      background: { color: '#ffffff' },
      notes: ''
    }

    const newSlides = [...slides, newSlide]
    setSlides(newSlides)
    setCurrentSlideIndex(newSlides.length - 1)
    saveToHistory(newSlides)
    toast.success('New slide added')
  }, [slides, saveToHistory])

  const duplicateSlide = useCallback((index: number) => {
    const slideToClone = slides[index]
    const newSlide = {
      ...JSON.parse(JSON.stringify(slideToClone)),
      id: `slide-${Date.now()}`,
      title: `${slideToClone.title} (Copy)`,
      elements: slideToClone.elements.map(el => ({
        ...el,
        id: `${el.id}-copy-${Date.now()}`
      }))
    }

    const newSlides = [...slides]
    newSlides.splice(index + 1, 0, newSlide)
    setSlides(newSlides)
    setCurrentSlideIndex(index + 1)
    saveToHistory(newSlides)
    toast.success('Slide duplicated')
  }, [slides, saveToHistory])

  const deleteSlide = useCallback((index: number) => {
    if (slides.length <= 1) {
      toast.error('Cannot delete the only slide')
      return
    }

    const newSlides = slides.filter((_, i) => i !== index)
    setSlides(newSlides)
    
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1)
    } else if (currentSlideIndex > index) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
    
    saveToHistory(newSlides)
    toast.success('Slide deleted')
  }, [slides, currentSlideIndex, saveToHistory])

  // Element management
  const addElement = useCallback((elementType: string, config: any) => {
    const newElement: SlideElement = {
      id: `element-${Date.now()}`,
      type: elementType as any,
      position: config.position || { x: 100, y: 100 },
      size: config.size || { width: 200, height: 100 },
      content: config.content || config,
      style: config.style || {},
      locked: false,
      hidden: false,
      rotation: 0,
      zIndex: currentSlide.elements.length
    }

    const newSlides = [...slides]
    newSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [...currentSlide.elements, newElement]
    }

    setSlides(newSlides)
    setSelectedElements([newElement.id])
    saveToHistory(newSlides)
    
    // Handle special cases
    if (config.triggerUpload) {
      fileInputRef.current?.click()
    }

    toast.success(`${elementType} added to slide`)
  }, [slides, currentSlideIndex, currentSlide, saveToHistory])

  const updateElement = useCallback((elementId: string, updates: Partial<SlideElement>) => {
    const newSlides = [...slides]
    const elementIndex = currentSlide.elements.findIndex(el => el.id === elementId)
    
    if (elementIndex !== -1) {
      newSlides[currentSlideIndex] = {
        ...currentSlide,
        elements: currentSlide.elements.map((el, i) => 
          i === elementIndex ? { ...el, ...updates } : el
        )
      }
      setSlides(newSlides)
      saveToHistory(newSlides)
    }
  }, [slides, currentSlideIndex, currentSlide, saveToHistory])

  const deleteElement = useCallback((elementId: string) => {
    const newSlides = [...slides]
    newSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: currentSlide.elements.filter(el => el.id !== elementId)
    }
    
    setSlides(newSlides)
    setSelectedElements(prev => prev.filter(id => id !== elementId))
    saveToHistory(newSlides)
    toast.success('Element deleted')
  }, [slides, currentSlideIndex, currentSlide, saveToHistory])

  const duplicateElement = useCallback((elementId: string) => {
    const element = currentSlide.elements.find(el => el.id === elementId)
    if (!element) return

    const newElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: `element-${Date.now()}`,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20
      }
    }

    const newSlides = [...slides]
    newSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [...currentSlide.elements, newElement]
    }

    setSlides(newSlides)
    setSelectedElements([newElement.id])
    saveToHistory(newSlides)
    toast.success('Element duplicated')
  }, [slides, currentSlideIndex, currentSlide, saveToHistory])

  // Layer management
  const bringToFront = useCallback((elementId: string) => {
    const maxZ = Math.max(...currentSlide.elements.map(el => el.zIndex || 0))
    updateElement(elementId, { zIndex: maxZ + 1 })
    toast.success('Brought to front')
  }, [currentSlide.elements, updateElement])

  const sendToBack = useCallback((elementId: string) => {
    const minZ = Math.min(...currentSlide.elements.map(el => el.zIndex || 0))
    updateElement(elementId, { zIndex: minZ - 1 })
    toast.success('Sent to back')
  }, [currentSlide.elements, updateElement])

  // Format management
  const formatElements = useCallback((formatType: string, value?: any) => {
    if (selectedElements.length === 0) return

    selectedElements.forEach(elementId => {
      const element = currentSlide.elements.find(el => el.id === elementId)
      if (!element) return

      let updates: Partial<SlideElement> = {}

      switch (formatType) {
        case 'toggleBold':
          updates.style = {
            ...element.style,
            fontWeight: element.style?.fontWeight === 'bold' ? 'normal' : 'bold'
          }
          break
        case 'toggleItalic':
          updates.style = {
            ...element.style,
            fontStyle: element.style?.fontStyle === 'italic' ? 'normal' : 'italic'
          }
          break
        case 'alignLeft':
        case 'alignCenter':
        case 'alignRight':
          updates.style = {
            ...element.style,
            textAlign: formatType.replace('align', '').toLowerCase()
          }
          break
        case 'textColor':
        case 'backgroundColor':
          updates.style = {
            ...element.style,
            [formatType]: value
          }
          break
        case 'bringToFront':
          bringToFront(elementId)
          return
        case 'sendToBack':
          sendToBack(elementId)
          return
        case 'duplicate':
          duplicateElement(elementId)
          return
      }

      if (Object.keys(updates).length > 0) {
        updateElement(elementId, updates)
      }
    })

    toast.success('Format applied')
  }, [selectedElements, currentSlide.elements, updateElement, bringToFront, sendToBack, duplicateElement])

  // Menu handlers
  const handleMenuOpen = useCallback((menuType: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setMenuPosition({ x: rect.left, y: rect.bottom + 5 })
    
    setShowInsertMenu(menuType === 'insert')
    setShowFormatMenu(menuType === 'format')
    setShowTemplateSelector(menuType === 'template')
  }, [])

  const closeAllMenus = useCallback(() => {
    setShowInsertMenu(false)
    setShowFormatMenu(false)
    setShowTemplateSelector(false)
    setShowChartEditor(false)
  }, [])

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileUrl = URL.createObjectURL(file)
    
    // Update the last added image element or create new one
    const imageElements = currentSlide.elements.filter(el => el.type === 'image')
    const lastImageElement = imageElements[imageElements.length - 1]
    
    if (lastImageElement && !lastImageElement.content?.src) {
      updateElement(lastImageElement.id, {
        content: {
          ...lastImageElement.content,
          src: fileUrl,
          alt: file.name
        }
      })
    } else {
      addElement('image', {
        type: 'image',
        src: fileUrl,
        alt: file.name,
        position: { x: 100, y: 100 },
        size: { width: 300, height: 200 }
      })
    }

    toast.success('Image uploaded successfully')
  }, [currentSlide.elements, updateElement, addElement])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      const isCmd = event.metaKey || event.ctrlKey

      if (isCmd) {
        switch (event.key) {
          case 'z':
            event.preventDefault()
            if (event.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 's':
            event.preventDefault()
            onSave?.(slides)
            toast.success('Presentation saved')
            break
          case 'd':
            event.preventDefault()
            if (selectedElements.length > 0) {
              duplicateElement(selectedElements[0])
            }
            break
        }
      } else {
        switch (event.key) {
          case 'Delete':
          case 'Backspace':
            if (selectedElements.length > 0) {
              selectedElements.forEach(deleteElement)
            }
            break
          case 'Escape':
            setSelectedElements([])
            closeAllMenus()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElements, slides, undo, redo, onSave, deleteElement, duplicateElement, closeAllMenus])

  // Render element
  const renderElement = useCallback((element: SlideElement) => {
    const isSelected = selectedElements.includes(element.id)
    const isHovered = hoveredElement === element.id

    return (
      <div key={element.id} className="absolute">
        {/* Element content */}
        <div
          className={cn(
            "absolute cursor-pointer transition-all",
            element.locked && "cursor-not-allowed",
            element.hidden && "opacity-50"
          )}
          style={{
            left: element.position.x,
            top: element.position.y,
            width: element.size.width,
            height: element.size.height,
            transform: `rotate(${element.rotation || 0}deg)`,
            zIndex: element.zIndex || 0,
            ...element.style
          }}
          onClick={() => {
            if (!element.locked) {
              setSelectedElements([element.id])
            }
          }}
          onMouseEnter={() => setHoveredElement(element.id)}
          onMouseLeave={() => setHoveredElement(null)}
        >
          {element.type === 'text' && (
            <div
              className="w-full h-full p-2 border border-transparent hover:border-gray-300 rounded"
              style={{
                fontSize: element.style?.fontSize || 16,
                fontWeight: element.style?.fontWeight || 'normal',
                fontStyle: element.style?.fontStyle || 'normal',
                color: element.style?.color || '#000000',
                backgroundColor: element.style?.backgroundColor || 'transparent',
                textAlign: element.style?.textAlign || 'left',
                fontFamily: element.style?.fontFamily || 'Inter, sans-serif'
              }}
            >
              {element.content || 'Click to edit text'}
            </div>
          )}

          {element.type === 'image' && (
            <div className="w-full h-full border border-gray-300 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
              {element.content?.src ? (
                <img
                  src={element.content.src}
                  alt={element.content.alt || 'Image'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <Image className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm">Click to add image</span>
                </div>
              )}
            </div>
          )}

          {element.type === 'shape' && (
            <div
              className="w-full h-full border rounded"
              style={{
                backgroundColor: element.style?.backgroundColor || '#3b82f6',
                borderColor: element.style?.borderColor || '#2563eb',
                borderWidth: element.style?.borderWidth || 2,
                borderRadius: element.content?.shapeType === 'circle' ? '50%' : element.style?.borderRadius || 8
              }}
            />
          )}

          {element.type === 'chart' && (
            <div className="w-full h-full border border-gray-300 rounded bg-white p-4 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <span className="text-sm text-gray-500">Chart Placeholder</span>
              </div>
            </div>
          )}
        </div>

        {/* Element controls */}
        <WorkingElementControls
          element={element}
          isSelected={isSelected}
          isHovered={isHovered}
          onDuplicate={duplicateElement}
          onDelete={deleteElement}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onLock={(id, locked) => updateElement(id, { locked })}
          onHide={(id, hidden) => updateElement(id, { hidden })}
          onRotate={(id, degrees) => updateElement(id, { rotation: (element.rotation || 0) + degrees })}
          onEdit={(id) => {
            // Handle element editing
            toast.info('Edit functionality coming soon')
          }}
          position={element.position}
          size={element.size}
        />
      </div>
    )
  }, [selectedElements, hoveredElement, duplicateElement, deleteElement, bringToFront, sendToBack, updateElement])

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo (⌘+Z)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (⌘+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleMenuOpen('insert', e)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Insert
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleMenuOpen('format', e)}
              className="flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              Format
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleMenuOpen('template', e)}
              className="flex items-center gap-2"
            >
              <Grid className="w-4 h-4" />
              Layout
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Quick actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addElement('textbox', {
                type: 'text',
                content: 'Click to edit text',
                position: { x: 100, y: 100 },
                size: { width: 300, height: 80 }
              })}
              title="Add text box"
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              title="Add image"
            >
              <Image className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addElement('shape-rectangle', {
                type: 'shape',
                shapeType: 'rectangle',
                position: { x: 100, y: 100 },
                size: { width: 200, height: 150 }
              })}
              title="Add shape"
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={cn(showGrid && "bg-gray-100")}
            title="Toggle grid"
          >
            <Grid className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Present
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              onSave?.(slides)
              toast.success('Presentation saved')
            }}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Slide Thumbnails */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSlide()}
              className="w-full flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New slide
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  "mb-2 p-3 border rounded-lg cursor-pointer transition-colors",
                  currentSlideIndex === index 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => setCurrentSlideIndex(index)}
              >
                <div className="aspect-video bg-white border border-gray-200 rounded mb-2 relative overflow-hidden">
                  <div 
                    className="absolute inset-0"
                    style={{ transform: `scale(0.1)`, transformOrigin: 'top left' }}
                  >
                    {slide.elements.map(element => (
                      <div
                        key={element.id}
                        className="absolute border"
                        style={{
                          left: element.position.x,
                          top: element.position.y,
                          width: element.size.width,
                          height: element.size.height,
                          backgroundColor: element.type === 'text' ? '#e5e7eb' : '#ddd6fe'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{slide.title}</span>
                  <span className="text-xs text-gray-500">{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col bg-gray-100">
          <div className="flex-1 relative overflow-hidden">
            {/* Canvas */}
            <div 
              ref={canvasRef}
              className="absolute inset-0 flex items-center justify-center p-8"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedElements([])
                  closeAllMenus()
                }
              }}
            >
              <motion.div
                className="bg-white shadow-xl relative"
                style={{
                  width: 800 * zoom,
                  height: 600 * zoom,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center'
                }}
                animate={{ scale: zoom }}
                transition={{ duration: 0.2 }}
              >
                {/* Grid overlay */}
                {showGrid && (
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }}
                  />
                )}

                {/* Slide content */}
                <div className="absolute inset-0">
                  {currentSlide.elements
                    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                    .map(renderElement)}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
              {selectedElements.length > 0 && (
                <span>{selectedElements.length} element{selectedElements.length > 1 ? 's' : ''} selected</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menus */}
      <GoogleSlidesInsertMenu
        isOpen={showInsertMenu}
        onClose={closeAllMenus}
        onInsertElement={addElement}
        position={menuPosition}
      />

      <GoogleSlidesFormatMenu
        isOpen={showFormatMenu}
        onClose={closeAllMenus}
        selectedElements={selectedElements.map(id => 
          currentSlide.elements.find(el => el.id === id)
        ).filter(Boolean)}
        onFormatElements={formatElements}
        position={menuPosition}
      />

      <SlideTemplateSelector
        isOpen={showTemplateSelector}
        onClose={closeAllMenus}
        onSelectTemplate={(template) => {
          // Apply template to current slide
          const newSlides = [...slides]
          newSlides[currentSlideIndex] = {
            ...currentSlide,
            elements: template.preview.elements.map((el, idx) => ({
              id: `template-element-${Date.now()}-${idx}`,
              type: el.type,
              position: { x: el.position.x * 3.33, y: el.position.y * 4.29 }, // Scale to canvas size
              size: { width: el.size.width * 3.33, height: el.size.height * 4.29 },
              content: el.placeholder || '',
              style: {},
              zIndex: idx
            }))
          }
          setSlides(newSlides)
          saveToHistory(newSlides)
          toast.success(`Applied ${template.name} template`)
        }}
        position={menuPosition}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}