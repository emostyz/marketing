'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card as UICard } from '@/components/ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  Search, Filter, Download, Eye, Heart, Star, Copy, Share2,
  TrendingUp, BarChart3, PieChart, LineChart, AreaChart,
  Users, Building, Target, Lightbulb, Sparkles, Zap,
  ChevronDown, ChevronUp, Grid, List, Bookmark, BookmarkPlus
} from 'lucide-react'

export interface Template {
  id: string
  name: string
  description: string
  category: 'business' | 'marketing' | 'financial' | 'technical' | 'creative' | 'educational'
  type: 'executive' | 'investor' | 'sales' | 'training' | 'report' | 'pitch'
  tags: string[]
  slides: number
  colors: string[]
  fonts: string[]
  features: string[]
  preview: string
  license: 'MIT' | 'Apache' | 'GPL' | 'CC0' | 'Custom'
  author: string
  downloads: number
  rating: number
  reviews: number
  lastUpdated: string
  compatibility: 'tremor' | 'custom' | 'both'
  dataTypes: string[]
  chartTypes: string[]
}

interface TemplateLibraryProps {
  onTemplateSelect: (template: Template) => void
  onTemplatePreview: (template: Template) => void
  className?: string
}

export function TemplateLibrary({ onTemplateSelect, onTemplatePreview, className = '' }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'downloads'>('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<string[]>([])

  // Template data
  const templates: Template[] = [
    {
      id: 'executive-dashboard',
      name: 'Executive Dashboard',
      description: 'Professional executive dashboard with KPI tracking and performance metrics',
      category: 'business',
      type: 'executive',
      tags: ['dashboard', 'kpi', 'metrics', 'professional'],
      slides: 12,
      colors: ['#1f2937', '#3b82f6', '#10b981', '#f59e0b'],
      fonts: ['Inter', 'Roboto'],
      features: ['Interactive charts', 'Real-time data', 'Responsive design', 'Dark mode'],
      preview: '/templates/executive-dashboard.png',
      license: 'MIT',
      author: 'Tremor Team',
      downloads: 15420,
      rating: 4.8,
      reviews: 342,
      lastUpdated: '2024-01-15',
      compatibility: 'tremor',
      dataTypes: ['time-series', 'categorical', 'numerical'],
      chartTypes: ['line', 'bar', 'area', 'donut', 'metric']
    },
    {
      id: 'marketing-campaign',
      name: 'Marketing Campaign Analysis',
      description: 'Comprehensive marketing campaign performance and ROI analysis',
      category: 'marketing',
      type: 'report',
      tags: ['marketing', 'campaign', 'roi', 'analytics'],
      slides: 15,
      colors: ['#8b5cf6', '#06b6d4', '#f97316', '#ec4899'],
      fonts: ['Poppins', 'Open Sans'],
      features: ['Funnel analysis', 'Conversion tracking', 'A/B testing results', 'Customer journey'],
      preview: '/templates/marketing-campaign.png',
      license: 'Apache',
      author: 'DataViz Pro',
      downloads: 8920,
      rating: 4.6,
      reviews: 156,
      lastUpdated: '2024-01-10',
      compatibility: 'tremor',
      dataTypes: ['funnel', 'conversion', 'attribution'],
      chartTypes: ['funnel', 'bar', 'line', 'scatter', 'heatmap']
    },
    {
      id: 'financial-report',
      name: 'Financial Performance Report',
      description: 'Professional financial reporting with P&L, cash flow, and key metrics',
      category: 'financial',
      type: 'report',
      tags: ['financial', 'p&l', 'cash-flow', 'metrics'],
      slides: 18,
      colors: ['#059669', '#dc2626', '#7c3aed', '#1e40af'],
      fonts: ['Roboto', 'Source Sans Pro'],
      features: ['P&L analysis', 'Cash flow tracking', 'Budget vs actual', 'Forecasting'],
      preview: '/templates/financial-report.png',
      license: 'MIT',
      author: 'Finance Templates',
      downloads: 12340,
      rating: 4.7,
      reviews: 289,
      lastUpdated: '2024-01-12',
      compatibility: 'tremor',
      dataTypes: ['financial', 'time-series', 'budget'],
      chartTypes: ['waterfall', 'bar', 'line', 'area', 'metric']
    },
    {
      id: 'startup-pitch',
      name: 'Startup Pitch Deck',
      description: 'Modern startup pitch deck with growth metrics and market analysis',
      category: 'business',
      type: 'pitch',
      tags: ['startup', 'pitch', 'growth', 'market'],
      slides: 10,
      colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
      fonts: ['Inter', 'Montserrat'],
      features: ['Growth metrics', 'Market size', 'Competitive analysis', 'Financial projections'],
      preview: '/templates/startup-pitch.png',
      license: 'CC0',
      author: 'Startup Templates',
      downloads: 21560,
      rating: 4.9,
      reviews: 567,
      lastUpdated: '2024-01-08',
      compatibility: 'tremor',
      dataTypes: ['growth', 'market', 'financial'],
      chartTypes: ['area', 'bar', 'pie', 'scatter', 'metric']
    },
    {
      id: 'sales-performance',
      name: 'Sales Performance Dashboard',
      description: 'Comprehensive sales tracking with pipeline and performance analytics',
      category: 'business',
      type: 'sales',
      tags: ['sales', 'pipeline', 'performance', 'analytics'],
      slides: 14,
      colors: ['#dc2626', '#ea580c', '#d97706', '#65a30d'],
      fonts: ['Inter', 'Roboto'],
      features: ['Pipeline tracking', 'Performance metrics', 'Forecasting', 'Team analytics'],
      preview: '/templates/sales-performance.png',
      license: 'MIT',
      author: 'Sales Analytics Pro',
      downloads: 9870,
      rating: 4.5,
      reviews: 234,
      lastUpdated: '2024-01-14',
      compatibility: 'tremor',
      dataTypes: ['pipeline', 'performance', 'forecast'],
      chartTypes: ['funnel', 'bar', 'line', 'donut', 'metric']
    },
    {
      id: 'data-science-report',
      name: 'Data Science Report',
      description: 'Advanced data science presentation with statistical analysis and ML insights',
      category: 'technical',
      type: 'report',
      tags: ['data-science', 'ml', 'statistics', 'analysis'],
      slides: 20,
      colors: ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b'],
      fonts: ['JetBrains Mono', 'Inter'],
      features: ['Statistical analysis', 'ML model results', 'Feature importance', 'Predictions'],
      preview: '/templates/data-science-report.png',
      license: 'Apache',
      author: 'Data Science Templates',
      downloads: 6540,
      rating: 4.8,
      reviews: 123,
      lastUpdated: '2024-01-11',
      compatibility: 'tremor',
      dataTypes: ['statistical', 'ml', 'predictions'],
      chartTypes: ['scatter', 'histogram', 'box', 'heatmap', 'line']
    },
    {
      id: 'product-analytics',
      name: 'Product Analytics Dashboard',
      description: 'Product performance tracking with user behavior and feature adoption',
      category: 'technical',
      type: 'report',
      tags: ['product', 'analytics', 'user-behavior', 'adoption'],
      slides: 16,
      colors: ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981'],
      fonts: ['Inter', 'Poppins'],
      features: ['User behavior', 'Feature adoption', 'Retention analysis', 'A/B testing'],
      preview: '/templates/product-analytics.png',
      license: 'MIT',
      author: 'Product Analytics Pro',
      downloads: 11230,
      rating: 4.7,
      reviews: 198,
      lastUpdated: '2024-01-13',
      compatibility: 'tremor',
      dataTypes: ['user-behavior', 'adoption', 'retention'],
      chartTypes: ['cohort', 'funnel', 'line', 'bar', 'heatmap']
    },
    {
      id: 'creative-portfolio',
      name: 'Creative Portfolio Showcase',
      description: 'Modern creative portfolio with project highlights and case studies',
      category: 'creative',
      type: 'pitch',
      tags: ['portfolio', 'creative', 'showcase', 'projects'],
      slides: 12,
      colors: ['#f97316', '#ec4899', '#8b5cf6', '#06b6d4'],
      fonts: ['Playfair Display', 'Inter'],
      features: ['Project showcase', 'Case studies', 'Process visualization', 'Client testimonials'],
      preview: '/templates/creative-portfolio.png',
      license: 'CC0',
      author: 'Creative Templates',
      downloads: 8760,
      rating: 4.6,
      reviews: 145,
      lastUpdated: '2024-01-09',
      compatibility: 'both',
      dataTypes: ['portfolio', 'case-studies', 'testimonials'],
      chartTypes: ['image', 'text', 'timeline', 'gallery']
    }
  ]

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesType = selectedType === 'all' || template.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  // Sort templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads
      case 'newest':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      case 'rating':
        return b.rating - a.rating
      case 'downloads':
        return b.downloads - a.downloads
      default:
        return 0
    }
  })

  // Categories
  const categories = [
    { id: 'all', name: 'All Categories', count: templates.length },
    { id: 'business', name: 'Business', count: templates.filter(t => t.category === 'business').length },
    { id: 'marketing', name: 'Marketing', count: templates.filter(t => t.category === 'marketing').length },
    { id: 'financial', name: 'Financial', count: templates.filter(t => t.category === 'financial').length },
    { id: 'technical', name: 'Technical', count: templates.filter(t => t.category === 'technical').length },
    { id: 'creative', name: 'Creative', count: templates.filter(t => t.category === 'creative').length }
  ]

  // Types
  const types = [
    { id: 'all', name: 'All Types', count: templates.length },
    { id: 'executive', name: 'Executive', count: templates.filter(t => t.type === 'executive').length },
    { id: 'report', name: 'Report', count: templates.filter(t => t.type === 'report').length },
    { id: 'pitch', name: 'Pitch', count: templates.filter(t => t.type === 'pitch').length },
    { id: 'sales', name: 'Sales', count: templates.filter(t => t.type === 'sales').length }
  ]

  // Toggle favorite
  const toggleFavorite = useCallback((templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }, [])

  // Handle template selection
  const handleTemplateSelect = useCallback((template: Template) => {
    onTemplateSelect(template)
    toast.success(`Selected template: ${template.name}`)
  }, [onTemplateSelect])

  // Handle template preview
  const handleTemplatePreview = useCallback((template: Template) => {
    onTemplatePreview(template)
  }, [onTemplatePreview])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
            <p className="text-gray-600 mt-1">
              {sortedTemplates.length} templates available • All free and open source
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500"
              >
                {types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="downloads">Most Downloaded</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="px-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isFavorite={favorites.includes(template.id)}
                onSelect={handleTemplateSelect}
                onPreview={handleTemplatePreview}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTemplates.map(template => (
              <TemplateListItem
                key={template.id}
                template={template}
                isFavorite={favorites.includes(template.id)}
                onSelect={handleTemplateSelect}
                onPreview={handleTemplatePreview}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}

        {sortedTemplates.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: Template
  isFavorite: boolean
  onSelect: (template: Template) => void
  onPreview: (template: Template) => void
  onToggleFavorite: (templateId: string) => void
}

function TemplateCard({ template, isFavorite, onSelect, onPreview, onToggleFavorite }: TemplateCardProps) {
  return (
    <UICard className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      {/* Preview Image */}
      <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-transparent" />
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(template.id)
            }}
            className="bg-white/80 hover:bg-white"
          >
            {isFavorite ? <BookmarkPlus className="w-4 h-4 text-red-500" /> : <Bookmark className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onPreview(template)
            }}
            className="bg-white/80 hover:bg-white"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
        
        {/* License Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            {template.license}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {template.name}
          </h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{template.rating}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{template.tags.length - 3}</span>
          )}
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{template.slides} slides</span>
          <span>{template.downloads.toLocaleString()} downloads</span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => onSelect(template)}
            className="flex-1"
          >
            Use Template
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPreview(template)}
          >
            Preview
          </Button>
        </div>
      </div>
    </UICard>
  )
}

// Template List Item Component
function TemplateListItem({ template, isFavorite, onSelect, onPreview, onToggleFavorite }: TemplateCardProps) {
  return (
    <UICard className="p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center space-x-4">
        {/* Preview */}
        <div className="w-24 h-16 bg-gray-100 rounded flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{template.rating}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onToggleFavorite(template.id)}
              >
                {isFavorite ? <BookmarkPlus className="w-4 h-4 text-red-500" /> : <Bookmark className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{template.category}</span>
            <span>•</span>
            <span>{template.type}</span>
            <span>•</span>
            <span>{template.slides} slides</span>
            <span>•</span>
            <span>{template.downloads.toLocaleString()} downloads</span>
            <span>•</span>
            <span className="text-green-600">{template.license}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={() => onSelect(template)}>
            Use Template
          </Button>
          <Button size="sm" variant="outline" onClick={() => onPreview(template)}>
            Preview
          </Button>
        </div>
      </div>
    </UICard>
  )
} 