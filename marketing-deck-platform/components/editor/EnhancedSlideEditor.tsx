'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Type, Image, BarChart3, Square, Circle, Triangle, 
  Plus, Trash2, Copy, Lock, Unlock, Layers,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Palette, Settings, Undo, Redo
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import MovableElement from './MovableElement'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  content?: string
  style?: any
  isLocked?: boolean
}

interface EnhancedSlideEditorProps {
  slideId: string
  elements: SlideElement[]
  onElementsChange: (elements: SlideElement[]) => void
  backgroundColor?: string
  onBackgroundChange?: (color: string) => void
}

export default function EnhancedSlideEditor({
  slideId,
  elements,
  onElementsChange,
  backgroundColor = '#ffffff',
  onBackgroundChange
}: EnhancedSlideEditorProps) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [tool, setTool] = useState<'select' | 'text' | 'image' | 'chart' | 'shape'>('select')
  const [history, setHistory] = useState<SlideElement[][]>([elements])
  const [historyIndex, setHistoryIndex] = useState(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  const selectedElement = elements.find(el => el.id === selectedElementId)

  // History management
  const addToHistory = useCallback((newElements: SlideElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newElements])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevElements = history[historyIndex - 1]
      onElementsChange([...prevElements])
      setHistoryIndex(historyIndex - 1)
    }
  }, [history, historyIndex, onElementsChange])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextElements = history[historyIndex + 1]
      onElementsChange([...nextElements])
      setHistoryIndex(historyIndex + 1)
    }
  }, [history, historyIndex, onElementsChange])

  // Element operations
  const updateElement = useCallback((elementId: string, updates: Partial<SlideElement>) => {
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    )
    onElementsChange(newElements)
  }, [elements, onElementsChange])

  const addElement = useCallback((type: 'text' | 'image' | 'chart' | 'shape', position?: { x: number; y: number }) => {
    const newElement: SlideElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      position: position || { x: 100, y: 100 },
      size: type === 'text' ? { width: 200, height: 50 } : { width: 200, height: 150 },
      rotation: 0,
      content: type === 'text' ? 'Edit this text' : undefined,
      style: {
        backgroundColor: type === 'shape' ? '#3b82f6' : 'transparent',
        color: type === 'text' ? '#000000' : undefined,
        fontSize: type === 'text' ? 16 : undefined,
        fontFamily: type === 'text' ? 'Inter' : undefined,
        fontWeight: type === 'text' ? 400 : undefined,
        textAlign: type === 'text' ? 'left' : undefined,
        borderRadius: type === 'shape' ? 8 : 0
      },
      isLocked: false
    }

    const newElements = [...elements, newElement]
    onElementsChange(newElements)
    addToHistory(newElements)
    setSelectedElementId(newElement.id)
  }, [elements, onElementsChange, addToHistory])

  const deleteElement = useCallback((elementId: string) => {
    const newElements = elements.filter(el => el.id !== elementId)
    onElementsChange(newElements)
    addToHistory(newElements)
    if (selectedElementId === elementId) {
      setSelectedElementId(null)
    }
  }, [elements, onElementsChange, addToHistory, selectedElementId])

  const duplicateElement = useCallback((elementId: string) => {
    const element = elements.find(el => el.id === elementId)
    if (!element) return

    const newElement: SlideElement = {
      ...element,
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: { x: element.position.x + 20, y: element.position.y + 20 }
    }

    const newElements = [...elements, newElement]
    onElementsChange(newElements)
    addToHistory(newElements)
    setSelectedElementId(newElement.id)
  }, [elements, onElementsChange, addToHistory])

  const toggleLock = useCallback((elementId: string) => {
    updateElement(elementId, { isLocked: !elements.find(el => el.id === elementId)?.isLocked })
  }, [elements, updateElement])

  // Canvas click handler
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      if (tool !== 'select') {
        // Add element at click position
        const rect = canvasRef.current!.getBoundingClientRect()
        const position = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
        addElement(tool === 'text' ? 'text' : tool === 'chart' ? 'chart' : tool === 'image' ? 'image' : 'shape', position)
        setTool('select')
      } else {
        setSelectedElementId(null)
      }
    }
  }, [tool, addElement])

  // Render element content
  const renderElementContent = useCallback((element: SlideElement) => {
    switch (element.type) {
      case 'text':
        return (
          <div
            contentEditable={selectedElementId === element.id && !element.isLocked}
            suppressContentEditableWarning
            className="w-full h-full outline-none"
            style={{
              color: element.style?.color,
              fontSize: `${element.style?.fontSize || 16}px`,
              fontFamily: element.style?.fontFamily || 'Inter',
              fontWeight: element.style?.fontWeight || 400,
              textAlign: element.style?.textAlign || 'left',
              lineHeight: element.style?.lineHeight || 1.4,
              padding: '8px'
            }}
            onBlur={(e) => {
              updateElement(element.id, { content: e.target.textContent || '' })
            }}
            dangerouslySetInnerHTML={{ __html: element.content || 'Edit this text' }}
          />
        )
      
      case 'shape':
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.style?.backgroundColor || '#3b82f6',
              borderRadius: `${element.style?.borderRadius || 8}px`,
              border: element.style?.border || 'none'
            }}
          />
        )
      
      case 'chart':
        return (
          <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500">
            <BarChart3 className="w-8 h-8 mr-2" />
            Chart Placeholder
          </div>
        )
      
      case 'image':
        return (
          <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500">
            <Image className="w-8 h-8 mr-2" />
            Image Placeholder
          </div>
        )
      
      default:
        return <div className="w-full h-full bg-gray-200" />
    }
  }, [selectedElementId, updateElement])

  return (
    <div className="flex h-full">
      {/* Toolbar */}
      <div className="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-2">
        <Button
          variant={tool === 'select' ? 'default' : 'ghost'}
          size="sm"
          className="w-10 h-10 p-0"
          onClick={() => setTool('select')}
        >
          <Plus className="w-4 h-4" />
        </Button>
        
        <Button
          variant={tool === 'text' ? 'default' : 'ghost'}
          size="sm"
          className="w-10 h-10 p-0"
          onClick={() => setTool('text')}
        >
          <Type className="w-4 h-4" />
        </Button>
        
        <Button
          variant={tool === 'image' ? 'default' : 'ghost'}
          size="sm"
          className="w-10 h-10 p-0"
          onClick={() => setTool('image')}
        >
          <Image className="w-4 h-4" />
        </Button>
        
        <Button
          variant={tool === 'chart' ? 'default' : 'ghost'}
          size="sm"
          className="w-10 h-10 p-0"
          onClick={() => setTool('chart')}
        >
          <BarChart3 className="w-4 h-4" />
        </Button>
        
        <Button
          variant={tool === 'shape' ? 'default' : 'ghost'}
          size="sm"
          className="w-10 h-10 p-0"
          onClick={() => setTool('shape')}
        >
          <Square className="w-4 h-4" />
        </Button>

        <div className="border-t border-gray-700 w-8 my-2" />

        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0"
          onClick={undo}
          disabled={historyIndex <= 0}
        >
          <Undo className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full relative"
          style={{ backgroundColor }}
          onClick={handleCanvasClick}
        >
          {elements.map((element) => (
            <MovableElement
              key={element.id}
              id={element.id}
              position={element.position}
              size={element.size}
              rotation={element.rotation}
              isSelected={selectedElementId === element.id}
              isLocked={element.isLocked}
              onUpdate={(updates) => {
                updateElement(element.id, updates)
              }}
              onSelect={() => setSelectedElementId(element.id)}
            >
              {renderElementContent(element)}
            </MovableElement>
          ))}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedElement && (
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Element Properties</h3>
              
              {/* Element Actions */}
              <div className="flex space-x-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateElement(selectedElement.id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleLock(selectedElement.id)}
                >
                  {selectedElement.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteElement(selectedElement.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Position */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="text-sm font-medium">X</label>
                  <Input
                    type="number"
                    value={selectedElement.position.x}
                    onChange={(e) => updateElement(selectedElement.id, {
                      position: { ...selectedElement.position, x: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Y</label>
                  <Input
                    type="number"
                    value={selectedElement.position.y}
                    onChange={(e) => updateElement(selectedElement.id, {
                      position: { ...selectedElement.position, y: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>

              {/* Size */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="text-sm font-medium">Width</label>
                  <Input
                    type="number"
                    value={selectedElement.size.width}
                    onChange={(e) => updateElement(selectedElement.id, {
                      size: { ...selectedElement.size, width: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Height</label>
                  <Input
                    type="number"
                    value={selectedElement.size.height}
                    onChange={(e) => updateElement(selectedElement.id, {
                      size: { ...selectedElement.size, height: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>

              {/* Rotation */}
              <div className="mb-4">
                <label className="text-sm font-medium">Rotation</label>
                <Slider
                  value={[selectedElement.rotation]}
                  onValueChange={(value) => updateElement(selectedElement.id, { rotation: value[0] })}
                  max={360}
                  min={0}
                  step={1}
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">{selectedElement.rotation}°</div>
              </div>

              {/* Text-specific properties */}
              {selectedElement.type === 'text' && (
                <>
                  <div className="mb-4">
                    <label className="text-sm font-medium">Font Size</label>
                    <Input
                      type="number"
                      value={selectedElement.style?.fontSize || 16}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, fontSize: parseInt(e.target.value) || 16 }
                      })}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="text-sm font-medium">Text Color</label>
                    <Input
                      type="color"
                      value={selectedElement.style?.color || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, color: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="text-sm font-medium">Font Weight</label>
                    <Select
                      value={selectedElement.style?.fontWeight?.toString() || '400'}
                      onValueChange={(value) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, fontWeight: parseInt(value) }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">Light</SelectItem>
                        <SelectItem value="400">Normal</SelectItem>
                        <SelectItem value="500">Medium</SelectItem>
                        <SelectItem value="600">Semi Bold</SelectItem>
                        <SelectItem value="700">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Shape-specific properties */}
              {selectedElement.type === 'shape' && (
                <>
                  <div className="mb-4">
                    <label className="text-sm font-medium">Background Color</label>
                    <Input
                      type="color"
                      value={selectedElement.style?.backgroundColor || '#3b82f6'}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, backgroundColor: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="text-sm font-medium">Border Radius</label>
                    <Input
                      type="number"
                      value={selectedElement.style?.borderRadius || 8}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, borderRadius: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}