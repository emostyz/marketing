'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Search, Filter, Grid, List, Star, Download, Eye,
  BarChart3, PieChart, TrendingUp, Users, Target, Zap,
  Briefcase, BookOpen, Lightbulb, Award, Globe, Heart
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Template {
  id: string
  name: string
  category: string
  description: string
  thumbnail: string
  slides: number
  rating: number
  downloads: number
  isPremium: boolean
  tags: string[]
  author: string
  preview: string[]
}

interface TemplateLibraryProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

export function TemplateLibrary({ isOpen, onClose, onSelectTemplate }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('popular')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  const categories = [
    { id: 'all', name: 'All Templates', icon: Grid },
    { id: 'business', name: 'Business', icon: Briefcase },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'marketing', name: 'Marketing', icon: Target },
    { id: 'education', name: 'Education', icon: BookOpen },
    { id: 'creative', name: 'Creative', icon: Lightbulb },
    { id: 'corporate', name: 'Corporate', icon: Award }
  ]

  const mockTemplates: Template[] = [
    {
      id: 'modern-analytics',
      name: 'Modern Analytics Dashboard',
      category: 'analytics',
      description: 'Professional analytics presentation with modern charts and data visualizations',
      thumbnail: '/api/placeholder/300/200',
      slides: 12,
      rating: 4.8,
      downloads: 1247,
      isPremium: false,
      tags: ['charts', 'data', 'modern', 'analytics'],
      author: 'AEDRIN Team',
      preview: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300']
    },
    {
      id: 'business-proposal',
      name: 'Executive Business Proposal',
      category: 'business',
      description: 'Clean and professional template for business proposals and pitches',
      thumbnail: '/api/placeholder/300/200',
      slides: 18,
      rating: 4.9,
      downloads: 2156,
      isPremium: true,
      tags: ['business', 'proposal', 'executive', 'professional'],
      author: 'Design Studio',
      preview: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300']
    },
    {
      id: 'marketing-report',
      name: 'Marketing Performance Report',
      category: 'marketing',
      description: 'Showcase your marketing results with this comprehensive report template',
      thumbnail: '/api/placeholder/300/200',
      slides: 15,
      rating: 4.7,
      downloads: 892,
      isPremium: false,
      tags: ['marketing', 'report', 'performance', 'metrics'],
      author: 'Marketing Pro',
      preview: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300']
    },
    {
      id: 'startup-pitch',
      name: 'Startup Pitch Deck',
      category: 'business',
      description: 'Perfect for startups looking to present to investors',
      thumbnail: '/api/placeholder/300/200',
      slides: 14,
      rating: 4.6,
      downloads: 1823,
      isPremium: true,
      tags: ['startup', 'pitch', 'investor', 'funding'],
      author: 'Pitch Perfect',
      preview: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300']
    },
    {
      id: 'creative-portfolio',
      name: 'Creative Portfolio Showcase',
      category: 'creative',
      description: 'Showcase your creative work with this stunning portfolio template',
      thumbnail: '/api/placeholder/300/200',
      slides: 20,
      rating: 4.5,
      downloads: 634,
      isPremium: false,
      tags: ['creative', 'portfolio', 'showcase', 'design'],
      author: 'Creative Lab',
      preview: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300']
    },
    {
      id: 'educational-course',
      name: 'Educational Course Presentation',
      category: 'education',
      description: 'Engage your students with this interactive educational template',
      thumbnail: '/api/placeholder/300/200',
      slides: 25,
      rating: 4.4,
      downloads: 1456,
      isPremium: false,
      tags: ['education', 'course', 'teaching', 'interactive'],
      author: 'EduDesign',
      preview: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300']
    }
  ]

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads
      case 'rating':
        return b.rating - a.rating
      case 'recent':
        return b.slides - a.slides // Mock recent sorting
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Template Library</h2>
                <p className="text-gray-600">Choose from professionally designed templates</p>
              </div>
              <Button variant="ghost" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-64 border-r border-gray-200 bg-gray-50">
                <div className="p-4 space-y-4">
                  {/* Search */}
                  <div>
                    <Label className="text-sm font-medium">Search Templates</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search templates..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <Label className="text-sm font-medium">Categories</Label>
                    <div className="mt-2 space-y-1">
                      {categories.map((category) => {
                        const Icon = category.icon
                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                              selectedCategory === category.id
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{category.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Filters */}
                  <div>
                    <Label className="text-sm font-medium">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* View Mode */}
                  <div>
                    <Label className="text-sm font-medium">View</Label>
                    <div className="flex mt-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="flex-1"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="flex-1"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                {/* Results Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="text-sm text-gray-600">
                    {sortedTemplates.length} template{sortedTemplates.length !== 1 ? 's' : ''} found
                  </div>
                </div>

                {/* Templates Grid */}
                <ScrollArea className="flex-1 p-4">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {sortedTemplates.map((template) => (
                        <motion.div
                          key={template.id}
                          layout
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                            <div className="relative">
                              <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                                <img 
                                  src={template.thumbnail} 
                                  alt={template.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {template.isPremium && (
                                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500">
                                  Pro
                                </Badge>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                                <div className="space-x-2">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setPreviewTemplate(template)
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Preview
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onSelectTemplate(template)
                                    }}
                                  >
                                    Use Template
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-sm line-clamp-1">{template.name}</h3>
                                <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span>{template.rating}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Download className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-500">{template.downloads}</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {template.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sortedTemplates.map((template) => (
                        <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                <img 
                                  src={template.thumbnail} 
                                  alt={template.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-semibold text-sm truncate">{template.name}</h3>
                                  {template.isPremium && (
                                    <Badge variant="secondary" className="text-xs">Pro</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-1">{template.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                  <span>{template.slides} slides</span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span>{template.rating}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Download className="w-3 h-3" />
                                    <span>{template.downloads}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPreviewTemplate(template)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Preview
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => onSelectTemplate(template)}
                                >
                                  Use Template
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </motion.div>

          {/* Template Preview Modal */}
          <AnimatePresence>
            {previewTemplate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4"
                onClick={() => setPreviewTemplate(null)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">{previewTemplate.name}</h3>
                    <Button variant="ghost" onClick={() => setPreviewTemplate(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      {previewTemplate.preview.map((image, index) => (
                        <div key={index} className="aspect-video bg-gray-100 rounded overflow-hidden">
                          <img src={image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                        Close
                      </Button>
                      <Button onClick={() => {
                        onSelectTemplate(previewTemplate)
                        setPreviewTemplate(null)
                      }}>
                        Use This Template
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}