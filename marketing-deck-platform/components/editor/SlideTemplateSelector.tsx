'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, LayoutTemplate, FileText, BarChart3, 
  Image, Quote, Users, Target, TrendingUp,
  Grid3X3, Columns, Layout, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SlideTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: 'layout' | 'content' | 'chart' | 'special'
  preview: {
    elements: Array<{
      type: 'text' | 'image' | 'shape' | 'chart'
      position: { x: number; y: number }
      size: { width: number; height: number }
      placeholder?: string
    }>
  }
  popular?: boolean
}

const slideTemplates: SlideTemplate[] = [
  // Layout Templates
  {
    id: 'title-slide',
    name: 'Title slide',
    description: 'Main title with subtitle',
    icon: FileText,
    category: 'layout',
    popular: true,
    preview: {
      elements: [
        { type: 'text', position: { x: 20, y: 30 }, size: { width: 200, height: 40 }, placeholder: 'Click to add title' },
        { type: 'text', position: { x: 20, y: 80 }, size: { width: 180, height: 20 }, placeholder: 'Click to add subtitle' }
      ]
    }
  },
  {
    id: 'section-header',
    name: 'Section header',
    description: 'Section title and description',
    icon: LayoutTemplate,
    category: 'layout',
    preview: {
      elements: [
        { type: 'text', position: { x: 20, y: 40 }, size: { width: 200, height: 30 }, placeholder: 'Click to add title' },
        { type: 'text', position: { x: 20, y: 80 }, size: { width: 200, height: 40 }, placeholder: 'Click to add text' }
      ]
    }
  },
  {
    id: 'title-and-body',
    name: 'Title and body',
    description: 'Title with content area',
    icon: FileText,
    category: 'layout',
    popular: true,
    preview: {
      elements: [
        { type: 'text', position: { x: 20, y: 20 }, size: { width: 200, height: 25 }, placeholder: 'Click to add title' },
        { type: 'text', position: { x: 20, y: 55 }, size: { width: 200, height: 80 }, placeholder: 'Click to add text' }
      ]
    }
  },
  {
    id: 'title-and-two-columns',
    name: 'Title and two columns',
    description: 'Title with two-column layout',
    icon: Columns,
    category: 'layout',
    preview: {
      elements: [
        { type: 'text', position: { x: 20, y: 20 }, size: { width: 200, height: 25 }, placeholder: 'Click to add title' },
        { type: 'text', position: { x: 20, y: 55 }, size: { width: 90, height: 70 }, placeholder: 'Click to add text' },
        { type: 'text', position: { x: 120, y: 55 }, size: { width: 90, height: 70 }, placeholder: 'Click to add text' }
      ]
    }
  },
  {
    id: 'title-only',
    name: 'Title only',
    description: 'Large centered title',
    icon: FileText,
    category: 'layout',
    preview: {
      elements: [
        { type: 'text', position: { x: 40, y: 60 }, size: { width: 160, height: 30 }, placeholder: 'Click to add title' }
      ]
    }
  },
  {
    id: 'one-column-text',
    name: 'One column text',
    description: 'Full-width text content',
    icon: Layout,
    category: 'layout',
    preview: {
      elements: [
        { type: 'text', position: { x: 20, y: 30 }, size: { width: 200, height: 90 }, placeholder: 'Click to add text' }
      ]
    }
  },

  // Content Templates
  {
    id: 'main-point',
    name: 'Main point',
    description: 'Key message with supporting text',
    icon: Target,
    category: 'content',
    preview: {
      elements: [
        { type: 'text', position: { x: 50, y: 40 }, size: { width: 140, height: 40 }, placeholder: 'Click to add title' },
        { type: 'text', position: { x: 30, y: 90 }, size: { width: 180, height: 30 }, placeholder: 'Click to add text' }
      ]
    }
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'Large quote with attribution',
    icon: Quote,
    category: 'content',
    preview: {
      elements: [
        { type: 'text', position: { x: 30, y: 40 }, size: { width: 180, height: 50 }, placeholder: '"Click to add quote"' },
        { type: 'text', position: { x: 140, y: 100 }, size: { width: 80, height: 20 }, placeholder: '— Attribution' }
      ]
    }
  },
  {
    id: 'caption',
    name: 'Caption',
    description: 'Image with caption below',
    icon: Image,
    category: 'content',
    preview: {
      elements: [
        { type: 'image', position: { x: 60, y: 30 }, size: { width: 120, height: 70 }, placeholder: 'Image' },
        { type: 'text', position: { x: 60, y: 110 }, size: { width: 120, height: 20 }, placeholder: 'Click to add caption' }
      ]
    }
  },

  // Chart Templates
  {
    id: 'big-number',
    name: 'Big number',
    description: 'Large metric display',
    icon: TrendingUp,
    category: 'chart',
    popular: true,
    preview: {
      elements: [
        { type: 'text', position: { x: 80, y: 45 }, size: { width: 80, height: 40 }, placeholder: 'XX%' },
        { type: 'text', position: { x: 60, y: 90 }, size: { width: 120, height: 20 }, placeholder: 'Description' }
      ]
    }
  },
  {
    id: 'comparison-chart',
    name: 'Comparison chart',
    description: 'Side-by-side comparison',
    icon: BarChart3,
    category: 'chart',
    preview: {
      elements: [
        { type: 'text', position: { x: 20, y: 20 }, size: { width: 200, height: 25 }, placeholder: 'Comparison Title' },
        { type: 'chart', position: { x: 40, y: 50 }, size: { width: 160, height: 70 } }
      ]
    }
  },

  // Special Templates
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty slide to customize',
    icon: Plus,
    category: 'special',
    popular: true,
    preview: {
      elements: []
    }
  }
]

interface SlideTemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: SlideTemplate) => void
  position: { x: number; y: number }
}

export default function SlideTemplateSelector({ 
  isOpen, 
  onClose, 
  onSelectTemplate, 
  position 
}: SlideTemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    { id: 'layout', label: 'Layouts', icon: LayoutTemplate },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'chart', label: 'Charts', icon: BarChart3 },
    { id: 'special', label: 'Special', icon: Plus }
  ]

  const filteredTemplates = slideTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleTemplateSelect = (template: SlideTemplate) => {
    onSelectTemplate(template)
    onClose()
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
        className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-96"
        style={{
          left: Math.min(position.x, window.innerWidth - 400),
          top: Math.min(position.y, window.innerHeight - 500)
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <LayoutTemplate className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Choose a layout</span>
          </div>
          <Input
            type="text"
            placeholder="Search layouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm border-gray-200"
          />
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex gap-1">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(category => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {category.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Popular Templates */}
        {!searchTerm && !selectedCategory && (
          <div className="p-4 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-700 mb-2">Popular</div>
            <div className="grid grid-cols-3 gap-2">
              {slideTemplates.filter(t => t.popular).map(template => {
                const Icon = template.icon
                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-2 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group"
                  >
                    <div className="aspect-video bg-gray-50 rounded border mb-2 relative overflow-hidden">
                      {/* Template Preview */}
                      <div className="absolute inset-1">
                        {template.preview.elements.map((element, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "absolute border rounded text-xs flex items-center justify-center",
                              element.type === 'text' && "bg-gray-200 border-gray-300 text-gray-600",
                              element.type === 'image' && "bg-blue-100 border-blue-200 text-blue-600",
                              element.type === 'chart' && "bg-green-100 border-green-200 text-green-600",
                              element.type === 'shape' && "bg-purple-100 border-purple-200"
                            )}
                            style={{
                              left: `${(element.position.x / 240) * 100}%`,
                              top: `${(element.position.y / 140) * 100}%`,
                              width: `${(element.size.width / 240) * 100}%`,
                              height: `${(element.size.height / 140) * 100}%`,
                            }}
                          >
                            {element.placeholder && element.placeholder.length > 15 
                              ? element.placeholder.substring(0, 12) + '...'
                              : element.placeholder}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon className="w-3 h-3 text-gray-600" />
                      <span className="text-xs font-medium text-gray-900 truncate">{template.name}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* All Templates */}
        <div className="max-h-80 overflow-y-auto">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {filteredTemplates.map(template => {
                const Icon = template.icon
                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group text-left"
                  >
                    <div className="aspect-video bg-gray-50 rounded border mb-2 relative overflow-hidden">
                      {/* Template Preview */}
                      <div className="absolute inset-1">
                        {template.preview.elements.map((element, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "absolute border rounded text-xs flex items-center justify-center",
                              element.type === 'text' && "bg-gray-200 border-gray-300 text-gray-600",
                              element.type === 'image' && "bg-blue-100 border-blue-200 text-blue-600",
                              element.type === 'chart' && "bg-green-100 border-green-200 text-green-600",
                              element.type === 'shape' && "bg-purple-100 border-purple-200"
                            )}
                            style={{
                              left: `${(element.position.x / 240) * 100}%`,
                              top: `${(element.position.y / 140) * 100}%`,
                              width: `${(element.size.width / 240) * 100}%`,
                              height: `${(element.size.height / 140) * 100}%`,
                            }}
                          >
                            {element.placeholder && element.placeholder.length > 10 
                              ? element.placeholder.substring(0, 8) + '...'
                              : element.placeholder}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900 truncate">{template.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{filteredTemplates.length} layouts available</span>
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
      </motion.div>
    </>
  )
}