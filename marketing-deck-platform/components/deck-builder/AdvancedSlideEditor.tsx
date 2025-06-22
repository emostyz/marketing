'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, Reorder, AnimatePresence } from 'framer-motion'
import { 
  Type, Image, BarChart3, Table, Video, Mic, Square, Circle,
  Triangle, Arrow, Star, Heart, Zap, Move, RotateCw, Copy,
  Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Underline, Palette, Link2, Settings, Lock, Unlock, Eye,
  EyeOff, ChevronUp, ChevronDown, MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent } from '@/components/ui/Card'
import { Separator } from '@/components/ui/separator'
import { ColorPicker } from '@/components/ui/color-picker'
import { FontPicker } from '@/components/ui/font-picker'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'table' | 'video' | 'audio' | 'shape' | 'icon'
  position: { x: number; y: number; width: number; height: number; rotation: number }
  style: {
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    opacity?: number
    shadow?: boolean
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    color?: string
    textAlign?: 'left' | 'center' | 'right'
    textDecoration?: string
  }
  content: any
  layer: number
  locked: boolean
  hidden: boolean
  animations: any[]
}

interface Slide {
  id: string
  title: string
  content: SlideElement[]
  template: string
  notes: string
  duration: number
  animations: any[]
  background: any
  locked: boolean
  hidden: boolean
}

interface AdvancedSlideEditorProps {
  slide: Slide
  selectedElements: string[]
  onUpdateSlide: (updates: Partial<Slide>) => void
  onSelectElements: (elementIds: string[]) => void
  tool: string
  zoom: number
}

export function AdvancedSlideEditor({
  slide,
  selectedElements,
  onUpdateSlide,
  onSelectElements,
  tool,
  zoom
}: AdvancedSlideEditorProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [clipboard, setClipboard] = useState<SlideElement[]>([])
  const [selectionBox, setSelectionBox] = useState<any>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId?: string } | null>(null)
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const textEditorRef = useRef<HTMLDivElement>(null)

  const createElement = (type: string, position: { x: number; y: number }) => {
    const baseElement: SlideElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      position: { 
        x: position.x, 
        y: position.y, 
        width: 200, 
        height: 100, 
        rotation: 0 
      },
      style: {
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 4,
        opacity: 1,
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: '400',
        color: '#1f2937',
        textAlign: 'left'
      },
      content: null,
      layer: slide.content.length,
      locked: false,
      hidden: false,
      animations: []
    }

    switch (type) {
      case 'text':
        baseElement.content = { text: 'Click to edit text', html: '<p>Click to edit text</p>' }
        baseElement.position.height = 50
        break
      case 'image':
        baseElement.content = { src: '', alt: '', caption: '' }
        baseElement.position.width = 300
        baseElement.position.height = 200
        break
      case 'chart':
        baseElement.content = { 
          type: 'bar', 
          data: [], 
          options: {},
          title: 'Chart Title'
        }
        baseElement.position.width = 400
        baseElement.position.height = 300
        break
      case 'table':
        baseElement.content = {
          headers: ['Column 1', 'Column 2'],
          rows: [['Row 1 Col 1', 'Row 1 Col 2'], ['Row 2 Col 1', 'Row 2 Col 2']],
          styling: {}
        }
        baseElement.position.width = 300
        baseElement.position.height = 150
        break
      case 'shape':
        baseElement.content = { shape: 'rectangle', fillColor: '#3b82f6' }
        baseElement.position.width = 150
        baseElement.position.height = 150
        break
    }

    return baseElement
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool !== 'select' && tool !== 'text' && tool !== 'image' && tool !== 'chart' && tool !== 'table' && tool !== 'shape') return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / (zoom / 100)) - (canvasRef.current?.scrollLeft || 0)
    const y = ((e.clientY - rect.top) / (zoom / 100)) - (canvasRef.current?.scrollTop || 0)

    if (tool !== 'select') {
      const newElement = createElement(tool, { x, y })
      const newContent = [...slide.content, newElement]
      onUpdateSlide({ content: newContent })
      onSelectElements([newElement.id])
    } else {
      onSelectElements([])
    }
  }

  const handleElementClick = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    
    if (e.ctrlKey || e.metaKey) {
      // Multi-select
      if (selectedElements.includes(elementId)) {
        onSelectElements(selectedElements.filter(id => id !== elementId))
      } else {
        onSelectElements([...selectedElements, elementId])
      }
    } else {
      onSelectElements([elementId])
    }
  }

  const handleElementDoubleClick = (elementId: string) => {
    const element = slide.content.find(el => el.id === elementId)
    if (element?.type === 'text') {
      setIsEditing(elementId)
    }
  }

  const handleElementDrag = (elementId: string, x: number, y: number) => {
    const newContent = slide.content.map(element => 
      element.id === elementId 
        ? { ...element, position: { ...element.position, x, y } }
        : element
    )
    onUpdateSlide({ content: newContent })
  }

  const handleElementResize = (elementId: string, width: number, height: number) => {
    const newContent = slide.content.map(element => 
      element.id === elementId 
        ? { ...element, position: { ...element.position, width, height } }
        : element
    )
    onUpdateSlide({ content: newContent })
  }

  const handleElementStyleUpdate = (elementId: string, styleUpdates: Partial<SlideElement['style']>) => {
    const newContent = slide.content.map(element => 
      element.id === elementId 
        ? { ...element, style: { ...element.style, ...styleUpdates } }
        : element
    )
    onUpdateSlide({ content: newContent })
  }

  const handleElementContentUpdate = (elementId: string, contentUpdates: any) => {
    const newContent = slide.content.map(element => 
      element.id === elementId 
        ? { ...element, content: { ...element.content, ...contentUpdates } }
        : element
    )
    onUpdateSlide({ content: newContent })
  }

  const deleteSelectedElements = () => {
    const newContent = slide.content.filter(element => !selectedElements.includes(element.id))
    onUpdateSlide({ content: newContent })
    onSelectElements([])
  }

  const copySelectedElements = () => {
    const elementsToCopy = slide.content.filter(element => selectedElements.includes(element.id))
    setClipboard(elementsToCopy)
  }

  const pasteElements = () => {
    if (clipboard.length === 0) return

    const newElements = clipboard.map(element => ({
      ...element,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        ...element.position,
        x: element.position.x + 20,
        y: element.position.y + 20
      }
    }))

    const newContent = [...slide.content, ...newElements]
    onUpdateSlide({ content: newContent })
    onSelectElements(newElements.map(el => el.id))
  }

  const bringToFront = (elementId: string) => {
    const maxLayer = Math.max(...slide.content.map(el => el.layer))
    const newContent = slide.content.map(element => 
      element.id === elementId 
        ? { ...element, layer: maxLayer + 1 }
        : element
    )
    onUpdateSlide({ content: newContent })
  }

  const sendToBack = (elementId: string) => {
    const minLayer = Math.min(...slide.content.map(el => el.layer))
    const newContent = slide.content.map(element => 
      element.id === elementId 
        ? { ...element, layer: minLayer - 1 }
        : element
    )
    onUpdateSlide({ content: newContent })
  }

  const alignElements = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedElements.length < 2) return

    const selectedElems = slide.content.filter(el => selectedElements.includes(el.id))
    
    let alignValue: number
    switch (alignment) {
      case 'left':
        alignValue = Math.min(...selectedElems.map(el => el.position.x))
        break
      case 'center':
        alignValue = selectedElems.reduce((sum, el) => sum + el.position.x + el.position.width / 2, 0) / selectedElems.length
        break
      case 'right':
        alignValue = Math.max(...selectedElems.map(el => el.position.x + el.position.width))
        break
      case 'top':
        alignValue = Math.min(...selectedElems.map(el => el.position.y))
        break
      case 'middle':
        alignValue = selectedElems.reduce((sum, el) => sum + el.position.y + el.position.height / 2, 0) / selectedElems.length
        break
      case 'bottom':
        alignValue = Math.max(...selectedElems.map(el => el.position.y + el.position.height))
        break
      default:
        return
    }

    const newContent = slide.content.map(element => {
      if (!selectedElements.includes(element.id)) return element

      let newPosition = { ...element.position }
      switch (alignment) {
        case 'left':
          newPosition.x = alignValue
          break
        case 'center':
          newPosition.x = alignValue - element.position.width / 2
          break
        case 'right':
          newPosition.x = alignValue - element.position.width
          break
        case 'top':
          newPosition.y = alignValue
          break
        case 'middle':
          newPosition.y = alignValue - element.position.height / 2
          break
        case 'bottom':
          newPosition.y = alignValue - element.position.height
          break
      }

      return { ...element, position: newPosition }
    })

    onUpdateSlide({ content: newContent })
  }

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        if (selectedElements.length > 0) {
          deleteSelectedElements()
        }
        break
      case 'c':
        if (e.ctrlKey || e.metaKey) {
          copySelectedElements()
        }
        break
      case 'v':
        if (e.ctrlKey || e.metaKey) {
          pasteElements()
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        moveSelectedElements(0, e.shiftKey ? -10 : -1)
        break
      case 'ArrowDown':
        e.preventDefault()
        moveSelectedElements(0, e.shiftKey ? 10 : 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        moveSelectedElements(e.shiftKey ? -10 : -1, 0)
        break
      case 'ArrowRight':
        e.preventDefault()
        moveSelectedElements(e.shiftKey ? 10 : 1, 0)
        break
    }
  }, [selectedElements])

  const moveSelectedElements = (deltaX: number, deltaY: number) => {
    const newContent = slide.content.map(element => 
      selectedElements.includes(element.id)
        ? { 
            ...element, 
            position: { 
              ...element.position, 
              x: element.position.x + deltaX,
              y: element.position.y + deltaY
            }
          }
        : element
    )
    onUpdateSlide({ content: newContent })
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const renderElement = (element: SlideElement) => {
    const isSelected = selectedElements.includes(element.id)
    const isLocked = element.locked
    const isHidden = element.hidden

    if (isHidden) return null

    return (
      <motion.div
        key={element.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: element.style.opacity || 1, scale: 1 }}
        style={{
          position: 'absolute',
          left: element.position.x,
          top: element.position.y,
          width: element.position.width,
          height: element.position.height,
          transform: `rotate(${element.position.rotation}deg)`,
          zIndex: element.layer,
          cursor: isLocked ? 'not-allowed' : 'pointer',
          border: isSelected ? '2px solid #3b82f6' : '1px solid transparent',
          borderRadius: element.style.borderRadius || 0,
          backgroundColor: element.style.backgroundColor,
          borderColor: element.style.borderColor,
          borderWidth: element.style.borderWidth,
          boxShadow: element.style.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
        }}
        onClick={(e) => handleElementClick(e, element.id)}
        onDoubleClick={() => handleElementDoubleClick(element.id)}
        drag={!isLocked && isSelected && tool === 'select'}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          const newX = element.position.x + info.offset.x
          const newY = element.position.y + info.offset.y
          handleElementDrag(element.id, newX, newY)
        }}
        whileHover={!isLocked ? { scale: 1.02 } : {}}
        whileTap={!isLocked ? { scale: 0.98 } : {}}
      >
        {/* Element Content */}
        <div className="w-full h-full overflow-hidden">
          {element.type === 'text' && (
            <div
              className="w-full h-full p-2 outline-none"
              style={{
                fontSize: element.style.fontSize,
                fontFamily: element.style.fontFamily,
                fontWeight: element.style.fontWeight,
                color: element.style.color,
                textAlign: element.style.textAlign
              }}
              contentEditable={isEditing === element.id}
              suppressContentEditableWarning
              onBlur={() => setIsEditing(null)}
              onInput={(e) => {
                const target = e.target as HTMLDivElement
                handleElementContentUpdate(element.id, { 
                  text: target.textContent,
                  html: target.innerHTML 
                })
              }}
              dangerouslySetInnerHTML={{ __html: element.content.html }}
            />
          )}
          
          {element.type === 'image' && (
            <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              {element.content.src ? (
                <img 
                  src={element.content.src} 
                  alt={element.content.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to add image</p>
                </div>
              )}
            </div>
          )}
          
          {element.type === 'chart' && (
            <div className="w-full h-full bg-gray-50 border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">{element.content.title || 'Chart'}</p>
              </div>
            </div>
          )}
          
          {element.type === 'shape' && (
            <div 
              className="w-full h-full"
              style={{
                backgroundColor: element.content.fillColor,
                borderRadius: element.content.shape === 'circle' ? '50%' : 
                               element.content.shape === 'triangle' ? '0' : 
                               element.style.borderRadius
              }}
            />
          )}
        </div>

        {/* Selection Handles */}
        {isSelected && !isLocked && (
          <>
            {/* Corner resize handles */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-nw-resize" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-ne-resize" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-sw-resize" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-se-resize" />
            
            {/* Side resize handles */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-n-resize" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-s-resize" />
            <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-w-resize" />
            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-e-resize" />
            
            {/* Rotation handle */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-600 border border-white rounded-full cursor-grab">
              <RotateCw className="w-2 h-2 text-white" />
            </div>
          </>
        )}

        {/* Element status indicators */}
        {isLocked && (
          <div className="absolute top-1 right-1">
            <Lock className="w-3 h-3 text-gray-500" />
          </div>
        )}
      </motion.div>
    )
  }

  const selectedElement = selectedElements.length === 1 ? 
    slide.content.find(el => el.id === selectedElements[0]) : null

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full relative cursor-crosshair"
        style={{ backgroundColor: slide.background?.color || '#ffffff' }}
        onClick={handleCanvasClick}
        onContextMenu={(e) => {
          e.preventDefault()
          setContextMenu({ x: e.clientX, y: e.clientY })
        }}
      >
        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Elements */}
        <Reorder.Group
          axis="y"
          values={slide.content}
          onReorder={(newOrder) => onUpdateSlide({ content: newOrder })}
          className="absolute inset-0"
        >
          {slide.content
            .sort((a, b) => a.layer - b.layer)
            .map(renderElement)}
        </Reorder.Group>
      </div>

      {/* Floating Toolbar for Selected Elements */}
      <AnimatePresence>
        {selectedElements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center space-x-1 z-50"
          >
            {selectedElement && (
              <>
                {/* Text formatting tools */}
                {selectedElement.type === 'text' && (
                  <>
                    <FontPicker
                      value={selectedElement.style.fontFamily || 'Inter'}
                      onChange={(font) => handleElementStyleUpdate(selectedElement.id, { fontFamily: font })}
                    />
                    <Input
                      type="number"
                      value={selectedElement.style.fontSize || 16}
                      onChange={(e) => handleElementStyleUpdate(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                      className="w-16 h-8"
                    />
                    <Button
                      variant={selectedElement.style.fontWeight === 'bold' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleElementStyleUpdate(selectedElement.id, { 
                        fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold' 
                      })}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={selectedElement.style.fontWeight === 'italic' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleElementStyleUpdate(selectedElement.id, { 
                        fontWeight: selectedElement.style.fontWeight === 'italic' ? 'normal' : 'italic' 
                      })}
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                  </>
                )}

                {/* Color tools */}
                <ColorPicker
                  value={selectedElement.style.color || '#000000'}
                  onChange={(color) => handleElementStyleUpdate(selectedElement.id, { color })}
                  trigger={<Button variant="ghost" size="sm"><Palette className="w-4 h-4" /></Button>}
                />
                
                <ColorPicker
                  value={selectedElement.style.backgroundColor || '#ffffff'}
                  onChange={(color) => handleElementStyleUpdate(selectedElement.id, { backgroundColor: color })}
                  trigger={<Button variant="ghost" size="sm"><Square className="w-4 h-4" /></Button>}
                />

                <Separator orientation="vertical" className="h-6" />

                {/* Alignment tools */}
                <Button variant="ghost" size="sm" onClick={() => alignElements('left')}>
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => alignElements('center')}>
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => alignElements('right')}>
                  <AlignRight className="w-4 h-4" />
                </Button>

                <Separator orientation="vertical" className="h-6" />

                {/* Layer controls */}
                <Button variant="ghost" size="sm" onClick={() => bringToFront(selectedElement.id)}>
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => sendToBack(selectedElement.id)}>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                <Separator orientation="vertical" className="h-6" />

                {/* Action tools */}
                <Button variant="ghost" size="sm" onClick={copySelectedElements}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={deleteSelectedElements}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onBlur={() => setContextMenu(null)}
          >
            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm">Copy</button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm" onClick={pasteElements}>Paste</button>
            <Separator className="my-1" />
            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm">Bring to Front</button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm">Send to Back</button>
            <Separator className="my-1" />
            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-red-600">Delete</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}