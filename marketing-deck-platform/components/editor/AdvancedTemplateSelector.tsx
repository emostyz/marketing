'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Grid, List, Star, TrendingUp, Briefcase, Presentation, Zap, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  isPremium: boolean
  tags: string[]
  slides: number
  rating: number
  downloads: number
  template_data: any
  colors: string[]
  style: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant'
}

interface TemplateCategory {
  id: string
  name: string
  icon: React.ReactNode
  count: number
}

interface AdvancedTemplateSelectorProps {
  onSelectTemplate: (template: Template) => void
  onPreviewTemplate: (template: Template) => void
  currentTemplate?: Template
}

const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'all', name: 'All Templates', icon: <Grid className="w-4 h-4" />, count: 0 },
  { id: 'business', name: 'Business', icon: <Briefcase className="w-4 h-4" />, count: 0 },
  { id: 'pitch', name: 'Pitch Deck', icon: <TrendingUp className="w-4 h-4" />, count: 0 },
  { id: 'presentation', name: 'Presentation', icon: <Presentation className="w-4 h-4" />, count: 0 },
  { id: 'startup', name: 'Startup', icon: <Zap className="w-4 h-4" />, count: 0 },
  { id: 'premium', name: 'Premium', icon: <Star className="w-4 h-4" />, count: 0 }
]

// Mock templates - in real app, these would come from Supabase
const MOCK_TEMPLATES: Template[] = [
  {
    id: 'modern-business',
    name: 'Modern Business',
    description: 'Clean, professional template perfect for business presentations',
    category: 'business',
    thumbnail: '/templates/modern-business.jpg',
    isPremium: false,
    tags: ['clean', 'professional', 'charts'],
    slides: 12,
    rating: 4.8,
    downloads: 1250,
    template_data: {
      slides: [],
      theme: { primary: '#2563eb', secondary: '#64748b' }
    },
    colors: ['#2563eb', '#64748b', '#ffffff', '#f8fafc'],
    style: 'modern'
  },
  {
    id: 'startup-pitch',
    name: 'Startup Pitch',
    description: 'Bold, energetic template designed for startup pitch decks',
    category: 'pitch',
    thumbnail: '/templates/startup-pitch.jpg',
    isPremium: true,
    tags: ['bold', 'startup', 'energetic'],
    slides: 15,
    rating: 4.9,
    downloads: 890,
    template_data: {
      slides: [],
      theme: { primary: '#7c3aed', secondary: '#ec4899' }
    },
    colors: ['#7c3aed', '#ec4899', '#ffffff', '#faf7ff'],
    style: 'bold'
  },
  {
    id: 'minimal-elegant',
    name: 'Minimal Elegant',
    description: 'Sophisticated minimal design for executive presentations',
    category: 'presentation',
    thumbnail: '/templates/minimal-elegant.jpg',
    isPremium: true,
    tags: ['minimal', 'elegant', 'executive'],
    slides: 10,
    rating: 4.7,
    downloads: 654,
    template_data: {
      slides: [],
      theme: { primary: '#059669', secondary: '#6b7280' }
    },
    colors: ['#059669', '#6b7280', '#ffffff', '#f9fafb'],
    style: 'minimal'
  },
  {
    id: 'corporate-classic',
    name: 'Corporate Classic',
    description: 'Traditional corporate template with timeless appeal',
    category: 'business',
    thumbnail: '/templates/corporate-classic.jpg',
    isPremium: false,
    tags: ['corporate', 'traditional', 'reliable'],
    slides: 18,
    rating: 4.5,
    downloads: 2100,
    template_data: {
      slides: [],
      theme: { primary: '#1f2937', secondary: '#4b5563' }
    },
    colors: ['#1f2937', '#4b5563', '#ffffff', '#f3f4f6'],
    style: 'classic'
  },
  {
    id: 'tech-innovation',
    name: 'Tech Innovation',
    description: 'Futuristic design perfect for technology presentations',
    category: 'startup',
    thumbnail: '/templates/tech-innovation.jpg',
    isPremium: true,
    tags: ['tech', 'futuristic', 'innovation'],
    slides: 14,
    rating: 4.9,
    downloads: 445,
    template_data: {
      slides: [],
      theme: { primary: '#0ea5e9', secondary: '#8b5cf6' }
    },
    colors: ['#0ea5e9', '#8b5cf6', '#ffffff', '#f0f9ff'],
    style: 'modern'
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Premium luxury template with gold accents',
    category: 'premium',
    thumbnail: '/templates/luxury-gold.jpg',
    isPremium: true,
    tags: ['luxury', 'premium', 'gold'],
    slides: 16,
    rating: 4.8,
    downloads: 298,
    template_data: {
      slides: [],
      theme: { primary: '#d97706', secondary: '#92400e' }
    },
    colors: ['#d97706', '#92400e', '#ffffff', '#fffbeb'],
    style: 'elegant'
  }
]

export default function AdvancedTemplateSelector({
  onSelectTemplate,
  onPreviewTemplate,
  currentTemplate
}: AdvancedTemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'recent' | 'name'>('popular')
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(currentTemplate || null)

  // Filter templates based on category and search
  const filteredTemplates = MOCK_TEMPLATES.filter(template => {
    const matchesCategory = activeCategory === 'all' || 
                           template.category === activeCategory ||
                           (activeCategory === 'premium' && template.isPremium)
    
    const matchesSearch = searchQuery === '' ||
                         template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  // Sort templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads
      case 'rating':
        return b.rating - a.rating
      case 'recent':
        return 0 // Would be actual date comparison in real app
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const handleTemplateSelect = useCallback((template: Template) => {
    setSelectedTemplate(template)
    onSelectTemplate(template)
  }, [onSelectTemplate])

  const handleTemplatePreview = useCallback((template: Template) => {
    onPreviewTemplate(template)
  }, [onPreviewTemplate])

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Template</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Start with a professionally designed template
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="recent">Most Recent</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1">
            <TabsList className="grid grid-cols-6 w-full">
              {TEMPLATE_CATEGORIES.map(category => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center space-x-2 text-sm"
                >
                  {category.icon}
                  <span>{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Templates Grid/List */}
      <div className="p-6 overflow-y-auto h-full">
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {sortedTemplates.map(template => (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  onHoverStart={() => setHoveredTemplate(template.id)}
                  onHoverEnd={() => setHoveredTemplate(null)}
                >
                  <Card className={cn(
                    "overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl",
                    selectedTemplate?.id === template.id && "ring-2 ring-blue-500"
                  )}>
                    {/* Template Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                      {/* Mock thumbnail with template colors */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})`
                        }}
                      />
                      
                      {/* Overlay on hover */}
                      <AnimatePresence>
                        {hoveredTemplate === template.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-2"
                          >
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTemplatePreview(template)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleTemplateSelect(template)}
                            >
                              Select
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Premium Badge */}
                      {template.isPremium && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-yellow-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        </div>
                      )}

                      {/* Slide Count */}
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="outline" className="bg-white/90 text-gray-800">
                          {template.slides} slides
                        </Badge>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      {/* Rating and Downloads */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {template.rating}
                          </span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-500">
                          {template.downloads.toLocaleString()} downloads
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs px-2 py-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {sortedTemplates.map(template => (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={cn(
                    "flex items-center p-4 cursor-pointer transition-all duration-300 hover:shadow-lg",
                    selectedTemplate?.id === template.id && "ring-2 ring-blue-500"
                  )}
                  onClick={() => handleTemplateSelect(template)}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-12 rounded-lg mr-4 overflow-hidden">
                      <div 
                        className="w-full h-full"
                        style={{
                          background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})`
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        {template.isPremium && (
                          <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {template.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{template.slides} slides</span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                          {template.rating}
                        </span>
                        <span>{template.downloads.toLocaleString()} downloads</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTemplatePreview(template)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        Select
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {sortedTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No templates found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}