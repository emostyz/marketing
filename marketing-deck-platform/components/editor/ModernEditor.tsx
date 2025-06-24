'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHotkeys } from 'react-hotkeys-hook'
import { useRouter } from 'next/navigation'
import * as Toolbar from '@radix-ui/react-toolbar'
import * as Tooltip from '@radix-ui/react-tooltip'
import { 
  Bold, Italic, Underline, Type, Image, BarChart3, Shapes,
  AlignLeft, AlignCenter, AlignRight, Layers, Trash2,
  Undo2, Redo2, Save, Download, Share2, Play, Grid,
  Lock, Unlock, Group, Ungroup, BringToFront, SendToBack,
  ArrowLeft, Check, AlertCircle, Plus, Minus, Menu,
  ChevronDown, Eye, Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { ModernButton } from '@/components/ui/ModernButton'
import { cn } from '@/lib/utils'
import { pageTransitions } from '@/lib/animations/transitions'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation?: number
  content?: any
  style?: any
}

interface Slide {
  id: string
  title: string
  elements: SlideElement[]
  thumbnail?: string
}

// Mock slides data
const mockSlides: Slide[] = [
  {
    id: '1',
    title: 'Title Slide',
    elements: [
      {
        id: 'title-1',
        type: 'text',
        position: { x: 100, y: 180 },
        size: { width: 760, height: 80 },
        content: { text: 'Q4 Sales Presentation', fontSize: 48, fontWeight: 'bold', color: '#1a202c' }
      },
      {
        id: 'subtitle-1',
        type: 'text',
        position: { x: 100, y: 280 },
        size: { width: 760, height: 40 },
        content: { text: 'Strategic Review & Forward Outlook', fontSize: 24, color: '#4a5568' }
      }
    ]
  },
  {
    id: '2',
    title: 'Revenue Growth',
    elements: [
      {
        id: 'chart-1',
        type: 'chart',
        position: { x: 50, y: 80 },
        size: { width: 860, height: 380 },
        content: { type: 'line', title: 'Revenue Growth Over Time' }
      }
    ]
  }
]

export function ModernEditor({ deckId }: { deckId?: string }) {
  const [slides, setSlides] = useState<Slide[]>(mockSlides)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [zoom, setZoom] = useState(100)
  const [deckTitle, setDeckTitle] = useState('Q4 Sales Presentation')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const router = useRouter()
  
  // Auto-save simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoSaveStatus('saving')
      setTimeout(() => setAutoSaveStatus('saved'), 1000)
    }, 10000) // Every 10 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  // Hotkeys
  useHotkeys('cmd+z', (e) => {
    e.preventDefault()
    undo()
  })
  useHotkeys('cmd+shift+z', (e) => {
    e.preventDefault()
    redo()
  })
  useHotkeys('cmd+s', (e) => {
    e.preventDefault()
    save()
  })
  useHotkeys('cmd+d', (e) => {
    e.preventDefault()
    duplicateSelected()
  })
  useHotkeys('delete', () => deleteSelected())
  useHotkeys('escape', () => setSelectedElements(new Set()))
  
  const currentSlide = slides[currentSlideIndex]
  
  const undo = useCallback(() => {
    toast.info('Undo')
  }, [])
  
  const redo = useCallback(() => {
    toast.info('Redo')
  }, [])
  
  const save = useCallback(() => {
    setAutoSaveStatus('saving')
    setTimeout(() => {
      setAutoSaveStatus('saved')
      toast.success('Presentation saved')
    }, 1000)
  }, [])
  
  const addElement = useCallback((type: SlideElement['type']) => {
    const newElement: SlideElement = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 200, y: 200 },
      size: { width: 200, height: 100 },
      content: type === 'text' ? { text: 'New text', fontSize: 16 } : {}
    }
    
    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex].elements.push(newElement)
    setSlides(updatedSlides)
    setSelectedElements(new Set([newElement.id]))
    toast.success(`Added ${type}`)
  }, [slides, currentSlideIndex])
  
  const deleteSelected = useCallback(() => {
    if (selectedElements.size === 0) return
    
    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex].elements = updatedSlides[currentSlideIndex].elements.filter(
      element => !selectedElements.has(element.id)
    )
    setSlides(updatedSlides)
    setSelectedElements(new Set())
    toast.success(`Deleted ${selectedElements.size} element(s)`)
  }, [slides, currentSlideIndex, selectedElements])
  
  const duplicateSelected = useCallback(() => {
    if (selectedElements.size === 0) return
    
    const updatedSlides = [...slides]
    const currentElements = updatedSlides[currentSlideIndex].elements
    const newElements: SlideElement[] = []
    
    currentElements.forEach(element => {
      if (selectedElements.has(element.id)) {
        const duplicated = {
          ...element,
          id: `${element.type}-${Date.now()}-${Math.random()}`,
          position: { 
            x: element.position.x + 20, 
            y: element.position.y + 20 
          }
        }
        newElements.push(duplicated)
      }
    })
    
    updatedSlides[currentSlideIndex].elements.push(...newElements)
    setSlides(updatedSlides)
    setSelectedElements(new Set(newElements.map(e => e.id)))
    toast.success(`Duplicated ${selectedElements.size} element(s)`)
  }, [slides, currentSlideIndex, selectedElements])

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Toolbar */}
      <header className="h-14 bg-white border-b border-gray-200">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <ModernButton
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
            </ModernButton>
            
            <div className="flex items-center gap-3">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  className="text-lg font-medium bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-lg font-medium hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                >
                  {deckTitle}
                </button>
              )}
              
              {/* Auto-save status */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {autoSaveStatus === 'saving' ? (
                  <>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" />
                    Saving...
                  </>
                ) : autoSaveStatus === 'saved' ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    Saved
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    Error saving
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-2">
            <ModernButton 
              variant="ghost" 
              size="sm" 
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              Share
            </ModernButton>
            
            <ModernButton
              variant="primary"
              size="sm"
              leftIcon={<Play className="w-4 h-4" />}
              onClick={() => setIsPlaying(true)}
            >
              Present
            </ModernButton>
          </div>
        </div>
      </header>
      
      {/* Editor Toolbar */}
      <Toolbar.Root className="h-12 bg-white border-b border-gray-200 px-4 flex items-center gap-1">
        {/* History */}
        <TooltipButton tooltip="Undo (⌘Z)" onClick={undo}>
          <Undo2 className="w-4 h-4" />
        </TooltipButton>
        
        <TooltipButton tooltip="Redo (⌘⇧Z)" onClick={redo}>
          <Redo2 className="w-4 h-4" />
        </TooltipButton>
        
        <Toolbar.Separator className="w-px h-6 bg-gray-300 mx-2" />
        
        {/* Insert Elements */}
        <TooltipButton tooltip="Add Text" onClick={() => addElement('text')}>
          <Type className="w-4 h-4" />
        </TooltipButton>
        
        <TooltipButton tooltip="Add Image" onClick={() => addElement('image')}>
          <Image className="w-4 h-4" />
        </TooltipButton>
        
        <TooltipButton tooltip="Add Chart" onClick={() => addElement('chart')}>
          <BarChart3 className="w-4 h-4" />
        </TooltipButton>
        
        <TooltipButton tooltip="Add Shape" onClick={() => addElement('shape')}>
          <Shapes className="w-4 h-4" />
        </TooltipButton>
        
        {/* Text Formatting - Show only when text is selected */}
        {selectedElements.size > 0 && (
          <>
            <Toolbar.Separator className="w-px h-6 bg-gray-300 mx-2" />
            
            <TooltipButton tooltip="Bold (⌘B)" onClick={() => {}}>
              <Bold className="w-4 h-4" />
            </TooltipButton>
            
            <TooltipButton tooltip="Italic (⌘I)" onClick={() => {}}>
              <Italic className="w-4 h-4" />
            </TooltipButton>
            
            <TooltipButton tooltip="Underline (⌘U)" onClick={() => {}}>
              <Underline className="w-4 h-4" />
            </TooltipButton>
            
            <Toolbar.Separator className="w-px h-6 bg-gray-300 mx-2" />
            
            <TooltipButton tooltip="Align Left" onClick={() => {}}>
              <AlignLeft className="w-4 h-4" />
            </TooltipButton>
            
            <TooltipButton tooltip="Align Center" onClick={() => {}}>
              <AlignCenter className="w-4 h-4" />
            </TooltipButton>
            
            <TooltipButton tooltip="Align Right" onClick={() => {}}>
              <AlignRight className="w-4 h-4" />
            </TooltipButton>
          </>
        )}
        
        {/* Arrangement - Show when elements are selected */}
        {selectedElements.size > 0 && (
          <>
            <Toolbar.Separator className="w-px h-6 bg-gray-300 mx-2" />
            
            <TooltipButton tooltip="Bring to Front" onClick={() => {}}>
              <BringToFront className="w-4 h-4" />
            </TooltipButton>
            
            <TooltipButton tooltip="Send to Back" onClick={() => {}}>
              <SendToBack className="w-4 h-4" />
            </TooltipButton>
            
            {selectedElements.size > 1 && (
              <>
                <TooltipButton tooltip="Group (⌘G)" onClick={() => {}}>
                  <Group className="w-4 h-4" />
                </TooltipButton>
                
                <TooltipButton tooltip="Ungroup (⌘⇧G)" onClick={() => {}}>
                  <Ungroup className="w-4 h-4" />
                </TooltipButton>
              </>
            )}
            
            <TooltipButton tooltip="Delete" onClick={deleteSelected}>
              <Trash2 className="w-4 h-4" />
            </TooltipButton>
          </>
        )}
        
        {/* Right side tools */}
        <div className="ml-auto flex items-center gap-1">
          <TooltipButton 
            tooltip={showGrid ? "Hide Grid" : "Show Grid"} 
            onClick={() => setShowGrid(!showGrid)}
            active={showGrid}
          >
            <Grid className="w-4 h-4" />
          </TooltipButton>
        </div>
      </Toolbar.Root>
      
      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Slide Thumbnails */}
        <div className="w-60 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Slides</h3>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                className={cn(
                  "relative rounded-lg border-2 transition-all cursor-pointer",
                  index === currentSlideIndex 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => setCurrentSlideIndex(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="aspect-[16/9] p-2">
                  <div className="w-full h-full bg-white rounded border border-gray-100 flex items-center justify-center text-xs text-gray-500">
                    Slide {index + 1}
                  </div>
                </div>
                <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
              </motion.div>
            ))}
            
            {/* Add slide button */}
            <button
              onClick={() => {
                const newSlide: Slide = {
                  id: `slide-${Date.now()}`,
                  title: `Slide ${slides.length + 1}`,
                  elements: []
                }
                setSlides([...slides, newSlide])
                setCurrentSlideIndex(slides.length)
              }}
              className="w-full aspect-[16/9] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="relative">
            {/* Canvas */}
            <motion.div
              className="relative bg-white rounded-lg shadow-xl"
              style={{ 
                width: 960 * (zoom / 100), 
                height: 540 * (zoom / 100),
                transform: `scale(${zoom / 100})`
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
                  <svg width="100%" height="100%" className="opacity-10">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              )}
              
              {/* Elements */}
              {currentSlide?.elements.map(element => (
                <EditableElement
                  key={element.id}
                  element={element}
                  isSelected={selectedElements.has(element.id)}
                  onSelect={(multi) => {
                    if (multi) {
                      const newSelection = new Set(selectedElements)
                      if (selectedElements.has(element.id)) {
                        newSelection.delete(element.id)
                      } else {
                        newSelection.add(element.id)
                      }
                      setSelectedElements(newSelection)
                    } else {
                      setSelectedElements(new Set([element.id]))
                    }
                  }}
                />
              ))}
            </motion.div>
            
            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-2 border border-gray-200">
              <button 
                onClick={() => setZoom(Math.max(25, zoom - 25))} 
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(200, zoom + 25))} 
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Properties Panel */}
        {selectedElements.size > 0 && (
          <PropertiesPanel
            selectedElements={Array.from(selectedElements)}
            currentSlide={currentSlide}
          />
        )}
      </div>
      
      {/* Presentation Mode */}
      <AnimatePresence>
        {isPlaying && (
          <PresentationMode
            slides={slides}
            onClose={() => setIsPlaying(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TooltipButton({ children, tooltip, onClick, active = false }: {
  children: React.ReactNode
  tooltip: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "p-2 rounded-lg transition-colors",
              active 
                ? "bg-blue-100 text-blue-600" 
                : "hover:bg-gray-100 text-gray-700"
            )}
          >
            {children}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 text-white px-2 py-1 text-xs rounded shadow-lg z-50"
            sideOffset={5}
          >
            {tooltip}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

function EditableElement({ element, isSelected, onSelect }: {
  element: SlideElement
  isSelected: boolean
  onSelect: (multi: boolean) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  
  return (
    <motion.div
      className={cn(
        "absolute group cursor-pointer",
        isSelected && "ring-2 ring-blue-500 ring-offset-2"
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        transform: `rotate(${element.rotation || 0}deg)`
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(e.shiftKey || e.metaKey)
      }}
      onDoubleClick={() => element.type === 'text' && setIsEditing(true)}
      whileHover={{ scale: 1.01 }}
      layout
    >
      {element.type === 'text' ? (
        <div className="w-full h-full flex items-center justify-center">
          {isEditing ? (
            <input
              type="text"
              defaultValue={element.content?.text || 'Text'}
              className="w-full h-full bg-transparent border-none outline-none text-center"
              style={{
                fontSize: element.content?.fontSize || 16,
                fontWeight: element.content?.fontWeight || 'normal',
                color: element.content?.color || '#000'
              }}
              autoFocus
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            />
          ) : (
            <span
              style={{
                fontSize: element.content?.fontSize || 16,
                fontWeight: element.content?.fontWeight || 'normal',
                color: element.content?.color || '#000'
              }}
            >
              {element.content?.text || 'Text'}
            </span>
          )}
        </div>
      ) : element.type === 'chart' ? (
        <div className="w-full h-full bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-blue-500" />
        </div>
      ) : element.type === 'image' ? (
        <div className="w-full h-full bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
          <Image className="w-8 h-8 text-gray-500" />
        </div>
      ) : (
        <div className="w-full h-full bg-purple-50 border border-purple-200 rounded flex items-center justify-center">
          <Shapes className="w-8 h-8 text-purple-500" />
        </div>
      )}
      
      {/* Selection handles */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </>
      )}
    </motion.div>
  )
}

function PropertiesPanel({ selectedElements, currentSlide }: {
  selectedElements: string[]
  currentSlide: Slide
}) {
  const elements = currentSlide.elements.filter(el => selectedElements.includes(el.id))
  
  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Properties</h3>
      </div>
      <div className="p-3 space-y-4">
        {elements.length === 1 && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="X"
                  value={elements[0].position.x}
                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                  readOnly
                />
                <input
                  type="number"
                  placeholder="Y"
                  value={elements[0].position.y}
                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                  readOnly
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="W"
                  value={elements[0].size.width}
                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                  readOnly
                />
                <input
                  type="number"
                  placeholder="H"
                  value={elements[0].size.height}
                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                  readOnly
                />
              </div>
            </div>
            
            {elements[0].type === 'text' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <input
                  type="number"
                  value={elements[0].content?.fontSize || 16}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  readOnly
                />
              </div>
            )}
          </>
        )}
        
        {elements.length > 1 && (
          <div className="text-sm text-gray-600">
            {elements.length} elements selected
          </div>
        )}
      </div>
    </div>
  )
}

function PresentationMode({ slides, onClose }: {
  slides: Slide[]
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useHotkeys('escape', onClose)
  useHotkeys('arrowleft', () => setCurrentIndex(Math.max(0, currentIndex - 1)))
  useHotkeys('arrowright', () => setCurrentIndex(Math.min(slides.length - 1, currentIndex + 1)))
  
  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <Eye className="w-6 h-6" />
      </button>
      
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="relative bg-white rounded-lg shadow-2xl" style={{ width: 960, height: 540 }}>
          {slides[currentIndex]?.elements.map(element => (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
                transform: `rotate(${element.rotation || 0}deg)`
              }}
            >
              {element.type === 'text' && (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    fontSize: element.content?.fontSize || 16,
                    fontWeight: element.content?.fontWeight || 'normal',
                    color: element.content?.color || '#000'
                  }}
                >
                  {element.content?.text || 'Text'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 text-white">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="p-2 hover:bg-white/20 rounded disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm">
          {currentIndex + 1} / {slides.length}
        </span>
        <button
          onClick={() => setCurrentIndex(Math.min(slides.length - 1, currentIndex + 1))}
          disabled={currentIndex === slides.length - 1}
          className="p-2 hover:bg-white/20 rounded disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5 rotate-180" />
        </button>
      </div>
    </motion.div>
  )
}