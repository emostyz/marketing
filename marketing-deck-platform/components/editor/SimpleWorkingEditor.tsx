'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Type, Image as ImageIcon, BarChart3, Circle, Save, Download,
  Plus, Trash2, Copy, Move, Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface SimpleElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  content: string
  style: {
    fontSize?: number
    color?: string
    backgroundColor?: string
    borderRadius?: number
  }
}

interface SimpleEditorProps {
  presentationId?: string
  onSave?: (elements: SimpleElement[]) => void
  onExport?: (format: string) => void
}

export default function SimpleWorkingEditor({ presentationId, onSave, onExport }: SimpleEditorProps) {
  const [elements, setElements] = useState<SimpleElement[]>([
    {
      id: 'demo-1',
      type: 'text',
      position: { x: 100, y: 100 },
      size: { width: 300, height: 60 },
      content: 'Welcome to the Working Editor!',
      style: { fontSize: 24, color: '#000000' }
    }
  ])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    startPos: { x: number; y: number }
    elementPos: { x: number; y: number }
  } | null>(null)

  const addElement = useCallback((type: SimpleElement['type']) => {
    const newElement: SimpleElement = {
      id: `element_${Date.now()}`,
      type,
      position: { x: 200, y: 200 },
      size: { 
        width: type === 'text' ? 200 : 150, 
        height: type === 'text' ? 60 : 150 
      },
      content: type === 'text' ? 'New Text' : `New ${type}`,
      style: {
        fontSize: 16,
        color: '#000000',
        backgroundColor: type === 'shape' ? '#3B82F6' : 'transparent',
        borderRadius: 0
      }
    }
    setElements(prev => [...prev, newElement])
    setSelectedElement(newElement.id)
  }, [])

  const updateElement = useCallback((elementId: string, updates: Partial<SimpleElement>) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ))
  }, [])

  const deleteElement = useCallback((elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId))
    setSelectedElement(null)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const element = elements.find(el => el.id === elementId)
    if (!element) return

    setSelectedElement(elementId)
    setDragState({
      isDragging: true,
      startPos: { x: e.clientX, y: e.clientY },
      elementPos: element.position
    })

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState?.isDragging) return
      
      const deltaX = e.clientX - dragState.startPos.x
      const deltaY = e.clientY - dragState.startPos.y
      
      updateElement(elementId, {
        position: {
          x: Math.max(0, dragState.elementPos.x + deltaX),
          y: Math.max(0, dragState.elementPos.y + deltaY)
        }
      })
    }

    const handleMouseUp = () => {
      setDragState(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [elements, dragState, updateElement])

  const selectedEl = elements.find(el => el.id === selectedElement)

  return (
    <div className="h-screen bg-gray-950 text-white flex">
      {/* Toolbar */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-4">Working Editor</h2>
        
        {/* Add Elements */}
        <div className="space-y-2 mb-6">
          <h3 className="text-sm font-medium text-gray-300">Add Elements</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => addElement('text')}
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-3 text-white border-gray-600 hover:bg-gray-700"
            >
              <Type className="w-4 h-4" />
              <span className="text-xs">Text</span>
            </Button>
            <Button
              onClick={() => addElement('shape')}
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-3 text-white border-gray-600 hover:bg-gray-700"
            >
              <Circle className="w-4 h-4" />
              <span className="text-xs">Shape</span>
            </Button>
          </div>
        </div>

        {/* Properties */}
        {selectedEl && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Properties</h3>
            
            <div>
              <Label className="text-xs text-gray-400">Content</Label>
              <Input
                value={selectedEl.content}
                onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            {selectedEl.type === 'text' && (
              <div>
                <Label className="text-xs text-gray-400">Font Size</Label>
                <Slider
                  value={[selectedEl.style.fontSize || 16]}
                  onValueChange={([value]) => updateElement(selectedEl.id, {
                    style: { ...selectedEl.style, fontSize: value }
                  })}
                  min={8}
                  max={72}
                  step={1}
                />
              </div>
            )}

            <div>
              <Label className="text-xs text-gray-400">Color</Label>
              <input
                type="color"
                value={selectedEl.style.color || '#000000'}
                onChange={(e) => updateElement(selectedEl.id, {
                  style: { ...selectedEl.style, color: e.target.value }
                })}
                className="w-full h-8 bg-gray-800 border border-gray-600 rounded"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => deleteElement(selectedEl.id)}
                variant="outline"
                size="sm"
                className="flex-1 text-red-400 border-red-600 hover:bg-red-900"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Slide Editor</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => onSave?.(elements)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-800 p-8">
          <div 
            className="relative bg-white rounded-lg shadow-lg mx-auto"
            style={{ width: 800, height: 600 }}
            onClick={() => setSelectedElement(null)}
          >
            {elements.map((element) => (
              <motion.div
                key={element.id}
                className={`absolute cursor-move border-2 ${
                  selectedElement === element.id 
                    ? 'border-blue-500' 
                    : 'border-transparent hover:border-gray-300'
                }`}
                style={{
                  left: element.position.x,
                  top: element.position.y,
                  width: element.size.width,
                  height: element.size.height,
                  backgroundColor: element.style.backgroundColor,
                  borderRadius: element.style.borderRadius
                }}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                animate={{
                  scale: dragState?.isDragging && selectedElement === element.id ? 1.02 : 1
                }}
              >
                {element.type === 'text' ? (
                  <div 
                    className="w-full h-full flex items-center justify-center p-2"
                    style={{
                      fontSize: element.style.fontSize,
                      color: element.style.color,
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {element.content}
                  </div>
                ) : element.type === 'shape' ? (
                  <div className="w-full h-full rounded" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {element.type}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}