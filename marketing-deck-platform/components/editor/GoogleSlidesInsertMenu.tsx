'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Image, Type, Square, BarChart3, Table, Video, Volume2, 
  Link, MessageSquare, Plus, FileImage, Camera, Globe, 
  Play, Shapes, PenTool, Sparkles, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface InsertMenuProps {
  isOpen: boolean
  onClose: () => void
  onInsertElement: (elementType: string, config?: any) => void
  position: { x: number; y: number }
}

interface ElementType {
  id: string
  label: string
  icon: React.ComponentType<any>
  category: 'content' | 'media' | 'interactive' | 'layout'
  hasSubmenu?: boolean
  submenu?: ElementType[]
  shortcut?: string
  popular?: boolean
}

const insertElements: ElementType[] = [
  {
    id: 'image',
    label: 'Image',
    icon: Image,
    category: 'media',
    hasSubmenu: true,
    popular: true,
    submenu: [
      { id: 'image-upload', label: 'Upload from computer', icon: FileImage, category: 'media' },
      { id: 'image-stock', label: 'Stock & web', icon: Globe, category: 'media' },
      { id: 'image-drive', label: 'Drive & Photos', icon: Camera, category: 'media' },
      { id: 'image-camera', label: 'Camera', icon: Camera, category: 'media' },
      { id: 'image-url', label: 'By URL', icon: Link, category: 'media' },
    ]
  },
  {
    id: 'textbox',
    label: 'Text box',
    icon: Type,
    category: 'content',
    popular: true,
    shortcut: '⌘+T'
  },
  {
    id: 'shape',
    label: 'Shape',
    icon: Square,
    category: 'layout',
    hasSubmenu: true,
    submenu: [
      { id: 'shape-rectangle', label: 'Rectangle', icon: Square, category: 'layout' },
      { id: 'shape-circle', label: 'Circle', icon: Square, category: 'layout' },
      { id: 'shape-triangle', label: 'Triangle', icon: Square, category: 'layout' },
      { id: 'shape-arrow', label: 'Arrow', icon: ArrowRight, category: 'layout' },
    ]
  },
  {
    id: 'chart',
    label: 'Chart',
    icon: BarChart3,
    category: 'content',
    hasSubmenu: true,
    submenu: [
      { id: 'chart-bar', label: 'Bar chart', icon: BarChart3, category: 'content' },
      { id: 'chart-line', label: 'Line chart', icon: BarChart3, category: 'content' },
      { id: 'chart-pie', label: 'Pie chart', icon: BarChart3, category: 'content' },
      { id: 'chart-area', label: 'Area chart', icon: BarChart3, category: 'content' },
    ]
  },
  {
    id: 'table',
    label: 'Table',
    icon: Table,
    category: 'content'
  },
  {
    id: 'video',
    label: 'Video',
    icon: Video,
    category: 'media'
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: Volume2,
    category: 'media'
  },
  {
    id: 'link',
    label: 'Link',
    icon: Link,
    category: 'interactive',
    shortcut: '⌘+K'
  },
  {
    id: 'comment',
    label: 'Comment',
    icon: MessageSquare,
    category: 'interactive',
    shortcut: '⌘+Option+M'
  }
]

export default function GoogleSlidesInsertMenu({ isOpen, onClose, onInsertElement, position }: InsertMenuProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredElements = insertElements.filter(element =>
    element.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleElementClick = (element: ElementType) => {
    if (element.hasSubmenu) {
      setActiveSubmenu(activeSubmenu === element.id ? null : element.id)
    } else {
      handleInsertElement(element.id)
    }
  }

  const handleInsertElement = (elementId: string, config?: any) => {
    const elementConfigs: Record<string, any> = {
      'textbox': {
        type: 'text',
        content: 'Click to edit text',
        position: { x: 100, y: 100 },
        size: { width: 300, height: 80 },
        style: {
          fontSize: 18,
          fontWeight: 'normal',
          color: '#ffffff',
          backgroundColor: 'transparent',
          textAlign: 'left',
          fontFamily: 'Inter, sans-serif'
        }
      },
      'image-upload': {
        type: 'image',
        position: { x: 100, y: 100 },
        size: { width: 400, height: 300 },
        triggerUpload: true
      },
      'shape-rectangle': {
        type: 'shape',
        shapeType: 'rectangle',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 150 },
        style: {
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 2,
          borderRadius: 8
        }
      },
      'shape-circle': {
        type: 'shape',
        shapeType: 'circle',
        position: { x: 100, y: 100 },
        size: { width: 150, height: 150 },
        style: {
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 2
        }
      },
      'chart-bar': {
        type: 'chart',
        chartType: 'bar',
        position: { x: 100, y: 100 },
        size: { width: 500, height: 300 },
        data: [
          { name: 'Jan', value: 400 },
          { name: 'Feb', value: 300 },
          { name: 'Mar', value: 200 },
          { name: 'Apr', value: 278 },
          { name: 'May', value: 189 }
        ]
      },
      'chart-line': {
        type: 'chart',
        chartType: 'line',
        position: { x: 100, y: 100 },
        size: { width: 500, height: 300 },
        data: [
          { name: 'Jan', value: 400 },
          { name: 'Feb', value: 300 },
          { name: 'Mar', value: 200 },
          { name: 'Apr', value: 278 },
          { name: 'May', value: 189 }
        ]
      },
      'table': {
        type: 'table',
        position: { x: 100, y: 100 },
        size: { width: 400, height: 200 },
        rows: 3,
        columns: 3,
        data: [
          ['Header 1', 'Header 2', 'Header 3'],
          ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
          ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
        ]
      }
    }

    const elementConfig = elementConfigs[elementId] || config || {
      type: elementId,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 }
    }

    onInsertElement(elementId, elementConfig)
    onClose()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Create a URL for the uploaded file
    const fileUrl = URL.createObjectURL(file)
    
    handleInsertElement('image', {
      type: 'image',
      src: fileUrl,
      alt: file.name,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 }
    })
  }

  if (!isOpen) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-72"
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 400)
        }}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-900">Insert</span>
          </div>
          <Input
            type="text"
            placeholder="Search elements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-2 h-8 text-sm border-gray-200"
          />
        </div>

        {/* Popular Items */}
        {!searchTerm && (
          <div className="p-2 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">Popular</div>
            <div className="flex gap-1">
              {insertElements.filter(el => el.popular).map(element => {
                const Icon = element.icon
                return (
                  <Button
                    key={element.id}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => handleElementClick(element)}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    <span className="text-xs">{element.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Main Menu Items */}
        <div className="max-h-80 overflow-y-auto">
          {filteredElements.map(element => {
            const Icon = element.icon
            const isActive = activeSubmenu === element.id
            
            return (
              <div key={element.id}>
                <button
                  onClick={() => handleElementClick(element)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors",
                    isActive && "bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{element.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {element.shortcut && (
                      <span className="text-xs text-gray-400">{element.shortcut}</span>
                    )}
                    {element.hasSubmenu && (
                      <ArrowRight className={cn(
                        "w-3 h-3 text-gray-400 transition-transform",
                        isActive && "rotate-90"
                      )} />
                    )}
                  </div>
                </button>

                {/* Submenu */}
                <AnimatePresence>
                  {isActive && element.submenu && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="bg-gray-50 overflow-hidden"
                    >
                      {element.submenu.map(subElement => {
                        const SubIcon = subElement.icon
                        return (
                          <button
                            key={subElement.id}
                            onClick={() => {
                              if (subElement.id === 'image-upload') {
                                fileInputRef.current?.click()
                              } else {
                                handleInsertElement(subElement.id)
                              }
                            }}
                            className="w-full flex items-center gap-3 p-3 pl-10 text-left hover:bg-gray-100 transition-colors"
                          >
                            <SubIcon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-900">{subElement.label}</span>
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Use keyboard shortcuts for faster access</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </motion.div>
    </>
  )
}