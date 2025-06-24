'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Type, Image as ImageIcon, BarChart3, Shapes, Layout, Grid, 
  Search, Plus, Star, Zap, TrendingUp, Users, Target, Lightbulb,
  Quote, List, ArrowRight, CheckCircle, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ELEMENT_TEMPLATES, SHAPE_TEMPLATES, CHART_TEMPLATES } from '@/lib/design/design-system'

interface ElementCategory {
  id: string
  name: string
  icon: React.ReactNode
  count: number
}

interface ElementsLibraryProps {
  onAddElement: (element: any) => void
  selectedElements: string[]
}

const ELEMENT_CATEGORIES: ElementCategory[] = [
  { id: 'text', name: 'Text', icon: <Type className="w-4 h-4" />, count: 0 },
  { id: 'shapes', name: 'Shapes', icon: <Shapes className="w-4 h-4" />, count: 0 },
  { id: 'charts', name: 'Charts', icon: <BarChart3 className="w-4 h-4" />, count: 0 },
  { id: 'layouts', name: 'Layouts', icon: <Layout className="w-4 h-4" />, count: 0 },
  { id: 'icons', name: 'Icons', icon: <Star className="w-4 h-4" />, count: 0 },
  { id: 'media', name: 'Media', icon: <ImageIcon className="w-4 h-4" />, count: 0 }
]

// Expanded Element Templates
const EXTENDED_ELEMENT_TEMPLATES = [
  ...ELEMENT_TEMPLATES,
  // Text Elements
  {
    id: 'heading-large',
    name: 'Large Heading',
    category: 'text',
    type: 'text',
    template: {
      type: 'text',
      content: 'Your Heading Here',
      style: { 
        fontSize: 48, 
        fontWeight: 'bold', 
        color: '#1f2937',
        textAlign: 'left'
      },
      position: { x: 50, y: 50 },
      size: { width: 700, height: 80 }
    },
    thumbnail: '/elements/heading-large.png',
    customizable: ['fontSize', 'fontFamily', 'color', 'textAlign', 'fontWeight']
  },
  {
    id: 'subheading',
    name: 'Subheading',
    category: 'text',
    type: 'text',
    template: {
      type: 'text',
      content: 'Your subheading text here',
      style: { 
        fontSize: 24, 
        fontWeight: '500', 
        color: '#6b7280',
        textAlign: 'left'
      },
      position: { x: 50, y: 150 },
      size: { width: 600, height: 40 }
    },
    thumbnail: '/elements/subheading.png',
    customizable: ['fontSize', 'fontFamily', 'color', 'textAlign', 'fontWeight']
  },
  {
    id: 'body-text',
    name: 'Body Text',
    category: 'text',
    type: 'text',
    template: {
      type: 'text',
      content: 'Your body text goes here. This is perfect for longer descriptions and detailed information.',
      style: { 
        fontSize: 16, 
        fontWeight: 'normal', 
        color: '#374151',
        textAlign: 'left',
        lineHeight: 1.6
      },
      position: { x: 50, y: 200 },
      size: { width: 500, height: 100 }
    },
    thumbnail: '/elements/body-text.png',
    customizable: ['fontSize', 'fontFamily', 'color', 'textAlign', 'lineHeight']
  },
  // Layout Elements
  {
    id: 'two-column',
    name: 'Two Column Layout',
    category: 'layouts',
    type: 'container',
    template: {
      type: 'container',
      elements: [
        {
          type: 'text',
          content: 'Left Column',
          style: { fontSize: 20, fontWeight: 'bold' },
          position: { x: 0, y: 0 },
          size: { width: 300, height: 40 }
        },
        {
          type: 'text',
          content: 'Right Column',
          style: { fontSize: 20, fontWeight: 'bold' },
          position: { x: 350, y: 0 },
          size: { width: 300, height: 40 }
        }
      ]
    },
    thumbnail: '/elements/two-column.png',
    customizable: ['spacing', 'alignment', 'backgroundColor']
  },
  {
    id: 'three-column',
    name: 'Three Column Layout',
    category: 'layouts',
    type: 'container',
    template: {
      type: 'container',
      elements: [
        {
          type: 'text',
          content: 'Column 1',
          style: { fontSize: 18, fontWeight: 'bold' },
          position: { x: 0, y: 0 },
          size: { width: 200, height: 40 }
        },
        {
          type: 'text',
          content: 'Column 2',
          style: { fontSize: 18, fontWeight: 'bold' },
          position: { x: 220, y: 0 },
          size: { width: 200, height: 40 }
        },
        {
          type: 'text',
          content: 'Column 3',
          style: { fontSize: 18, fontWeight: 'bold' },
          position: { x: 440, y: 0 },
          size: { width: 200, height: 40 }
        }
      ]
    },
    thumbnail: '/elements/three-column.png',
    customizable: ['spacing', 'alignment', 'backgroundColor']
  },
  // Icon Elements
  {
    id: 'icon-success',
    name: 'Success Icon',
    category: 'icons',
    type: 'icon',
    template: {
      type: 'icon',
      icon: 'CheckCircle',
      style: { 
        color: '#10b981', 
        fontSize: 32 
      },
      position: { x: 100, y: 100 },
      size: { width: 40, height: 40 }
    },
    thumbnail: '/elements/icon-success.png',
    customizable: ['color', 'size', 'style']
  },
  {
    id: 'icon-warning',
    name: 'Warning Icon',
    category: 'icons',
    type: 'icon',
    template: {
      type: 'icon',
      icon: 'AlertCircle',
      style: { 
        color: '#f59e0b', 
        fontSize: 32 
      },
      position: { x: 100, y: 100 },
      size: { width: 40, height: 40 }
    },
    thumbnail: '/elements/icon-warning.png',
    customizable: ['color', 'size', 'style']
  },
  {
    id: 'icon-trending',
    name: 'Trending Icon',
    category: 'icons',
    type: 'icon',
    template: {
      type: 'icon',
      icon: 'TrendingUp',
      style: { 
        color: '#3b82f6', 
        fontSize: 32 
      },
      position: { x: 100, y: 100 },
      size: { width: 40, height: 40 }
    },
    thumbnail: '/elements/icon-trending.png',
    customizable: ['color', 'size', 'style']
  },
  {
    id: 'icon-users',
    name: 'Users Icon',
    category: 'icons',
    type: 'icon',
    template: {
      type: 'icon',
      icon: 'Users',
      style: { 
        color: '#8b5cf6', 
        fontSize: 32 
      },
      position: { x: 100, y: 100 },
      size: { width: 40, height: 40 }
    },
    thumbnail: '/elements/icon-users.png',
    customizable: ['color', 'size', 'style']
  },
  // Media Elements
  {
    id: 'image-placeholder',
    name: 'Image Placeholder',
    category: 'media',
    type: 'image',
    template: {
      type: 'image',
      src: '/placeholder/image.jpg',
      style: { 
        borderRadius: '8px',
        objectFit: 'cover'
      },
      position: { x: 100, y: 100 },
      size: { width: 300, height: 200 }
    },
    thumbnail: '/elements/image-placeholder.png',
    customizable: ['borderRadius', 'objectFit', 'filter']
  }
]

export default function ElementsLibrary({ onAddElement, selectedElements }: ElementsLibraryProps) {
  const [activeTab, setActiveTab] = useState('text')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)

  // Filter elements based on category and search
  const filteredElements = useMemo(() => {
    let elements = []
    
    switch (activeTab) {
      case 'text':
        elements = EXTENDED_ELEMENT_TEMPLATES.filter(el => el.category === 'text')
        break
      case 'shapes':
        elements = SHAPE_TEMPLATES.map(shape => ({
          id: shape.id,
          name: shape.name,
          category: 'shapes',
          type: 'shape',
          template: {
            type: 'shape',
            shape: shape.id,
            style: { fill: '#3b82f6', stroke: 'none' },
            position: { x: 100, y: 100 },
            size: shape.defaultSize
          },
          thumbnail: `/shapes/${shape.id}.png`,
          customizable: shape.customizable
        }))
        break
      case 'charts':
        elements = CHART_TEMPLATES.map(chart => ({
          id: chart.id,
          name: chart.name,
          category: 'charts',
          type: 'chart',
          template: {
            type: 'chart',
            chartType: chart.type,
            data: chart.template.data,
            config: chart.template.config,
            position: { x: 100, y: 100 },
            size: { width: 400, height: 300 }
          },
          thumbnail: chart.thumbnail,
          customizable: chart.customizable
        }))
        break
      case 'layouts':
        elements = EXTENDED_ELEMENT_TEMPLATES.filter(el => el.category === 'layouts')
        break
      case 'icons':
        elements = EXTENDED_ELEMENT_TEMPLATES.filter(el => el.category === 'icons')
        break
      case 'media':
        elements = EXTENDED_ELEMENT_TEMPLATES.filter(el => el.category === 'media')
        break
      default:
        elements = EXTENDED_ELEMENT_TEMPLATES
    }

    if (searchQuery) {
      elements = elements.filter(element =>
        element.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        element.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return elements
  }, [activeTab, searchQuery])

  const handleAddElement = (elementTemplate: any) => {
    const newElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...elementTemplate.template,
      metadata: {
        templateId: elementTemplate.id,
        createdAt: new Date().toISOString(),
        customizable: elementTemplate.customizable
      }
    }
    onAddElement(newElement)
  }

  const renderElementPreview = (element: any) => {
    const isChart = element.type === 'chart'
    const isShape = element.type === 'shape'
    const isIcon = element.type === 'icon'
    const isText = element.type === 'text'
    
    return (
      <div className="w-full h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        {isText && (
          <div 
            className="text-center px-2"
            style={{
              fontSize: '10px',
              fontWeight: element.template.style?.fontWeight || 'normal',
              color: element.template.style?.color || '#374151'
            }}
          >
            {element.template.content.substring(0, 20)}...
          </div>
        )}
        {isShape && (
          <div 
            className="w-8 h-8 rounded"
            style={{ backgroundColor: '#3b82f6' }}
          />
        )}
        {isChart && (
          <BarChart3 className="w-8 h-8 text-blue-500" />
        )}
        {isIcon && (
          <div className="w-8 h-8 flex items-center justify-center">
            {element.template.icon === 'CheckCircle' && <CheckCircle className="w-6 h-6 text-green-500" />}
            {element.template.icon === 'AlertCircle' && <AlertCircle className="w-6 h-6 text-yellow-500" />}
            {element.template.icon === 'TrendingUp' && <TrendingUp className="w-6 h-6 text-blue-500" />}
            {element.template.icon === 'Users' && <Users className="w-6 h-6 text-purple-500" />}
          </div>
        )}
        {element.category === 'layouts' && (
          <Grid className="w-8 h-8 text-gray-500" />
        )}
        {element.category === 'media' && (
          <ImageIcon className="w-8 h-8 text-gray-500" />
        )}
      </div>
    )
  }

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Elements Library
        </h3>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 m-4 mb-2">
          {ELEMENT_CATEGORIES.slice(0, 6).map(category => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center space-x-1 text-xs p-2"
            >
              {category.icon}
              <span className="hidden lg:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Elements Grid */}
        <div className="flex-1 overflow-y-auto p-4 pt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-3"
            >
              {filteredElements.map(element => (
                <motion.div
                  key={element.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setHoveredElement(element.id)}
                  onHoverEnd={() => setHoveredElement(null)}
                >
                  <Card className={cn(
                    "p-3 cursor-pointer transition-all duration-200 hover:shadow-md group",
                    selectedElements.includes(element.id) && "ring-2 ring-blue-500"
                  )}>
                    {/* Element Preview */}
                    {renderElementPreview(element)}

                    {/* Element Info */}
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {element.name}
                      </h4>
                      <Badge variant="outline" className="text-xs mt-1">
                        {element.category}
                      </Badge>
                    </div>

                    {/* Add Button */}
                    <AnimatePresence>
                      {hoveredElement === element.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center"
                        >
                          <Button
                            size="sm"
                            onClick={() => handleAddElement(element)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredElements.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No elements found
              </p>
            </motion.div>
          )}
        </div>
      </Tabs>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddElement({
              id: `text_${Date.now()}`,
              type: 'text',
              content: 'New Text',
              style: { fontSize: 16, color: '#374151' },
              position: { x: 100, y: 100 },
              size: { width: 200, height: 40 }
            })}
          >
            <Type className="w-4 h-4 mr-1" />
            Text
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddElement({
              id: `shape_${Date.now()}`,
              type: 'shape',
              shape: 'rectangle',
              style: { fill: '#3b82f6' },
              position: { x: 100, y: 100 },
              size: { width: 100, height: 60 }
            })}
          >
            <Shapes className="w-4 h-4 mr-1" />
            Shape
          </Button>
        </div>
      </div>
    </div>
  )
}