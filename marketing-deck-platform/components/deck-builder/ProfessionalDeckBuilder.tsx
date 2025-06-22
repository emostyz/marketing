'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, SkipBack, SkipForward, Download, Share2, Save, 
  Plus, Trash2, Copy, Move, Layers, Type, Image, BarChart3, 
  Table, Video, Mic, Settings, Undo, Redo, ZoomIn, ZoomOut,
  Grid, AlignLeft, AlignCenter, AlignRight, Bold, Italic, 
  Underline, Palette, Eye, EyeOff, Lock, Unlock, MessageCircle,
  ChevronDown, ChevronRight, Search, Filter, MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AdvancedSlideEditor } from './AdvancedSlideEditor'
import { ChartEditingSystem } from './ChartEditingSystem'
import { TemplateLibrary } from './TemplateLibrary'
import { CollaborationPanel } from './CollaborationPanel'
import { PresentationPreview } from './PresentationPreview'

interface Slide {
  id: string
  title: string
  content: any[]
  template: string
  notes: string
  duration: number
  animations: any[]
  background: any
  locked: boolean
  hidden: boolean
  thumbnail?: string
}

interface Presentation {
  id: string
  title: string
  slides: Slide[]
  theme: any
  settings: any
  collaborators: any[]
  lastModified: Date
}

interface ProfessionalDeckBuilderProps {
  presentationId?: string
  onSave?: (presentation: Presentation) => void
  onExport?: (format: string) => void
}

export default function ProfessionalDeckBuilder({ 
  presentationId, 
  onSave, 
  onExport 
}: ProfessionalDeckBuilderProps) {
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(false)
  const [showRulers, setShowRulers] = useState(false)
  const [panelMode, setPanelMode] = useState<'design' | 'animations' | 'transitions' | 'notes'>('design')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(false)
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [collaborationMode, setCollaborationMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTool, setSelectedTool] = useState<string>('select')
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const autoSaveRef = useRef<NodeJS.Timeout>()

  // Initialize presentation
  useEffect(() => {
    if (presentationId) {
      loadPresentation(presentationId)
    } else {
      createNewPresentation()
    }
  }, [presentationId])

  // Auto-save functionality
  useEffect(() => {
    if (presentation) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
      autoSaveRef.current = setTimeout(() => {
        handleAutoSave()
      }, 2000)
    }
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
    }
  }, [presentation])

  const loadPresentation = async (id: string) => {
    try {
      // Load presentation from API
      const response = await fetch(`/api/presentations/${id}`)
      const data = await response.json()
      if (data.success) {
        setPresentation(data.presentation)
      }
    } catch (error) {
      console.error('Error loading presentation:', error)
    }
  }

  const createNewPresentation = () => {
    const newPresentation: Presentation = {
      id: 'new-' + Date.now(),
      title: 'Untitled Presentation',
      slides: [createBlankSlide()],
      theme: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#f59e0b',
          background: '#ffffff',
          text: '#1e293b'
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter',
          monospace: 'JetBrains Mono'
        },
        spacing: 'comfortable'
      },
      settings: {
        aspectRatio: '16:9',
        slideSize: 'standard',
        defaultTransition: 'slide'
      },
      collaborators: [],
      lastModified: new Date()
    }
    setPresentation(newPresentation)
  }

  const createBlankSlide = (): Slide => ({
    id: 'slide-' + Date.now(),
    title: 'Untitled Slide',
    content: [],
    template: 'blank',
    notes: '',
    duration: 5,
    animations: [],
    background: { type: 'solid', color: '#ffffff' },
    locked: false,
    hidden: false
  })

  const handleAutoSave = useCallback(async () => {
    if (!presentation) return
    
    setIsAutoSaving(true)
    try {
      // Auto-save logic
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      console.log('Auto-saved presentation')
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [presentation])

  const addSlide = (template: string = 'blank', index?: number) => {
    if (!presentation) return

    const newSlide = createBlankSlide()
    newSlide.template = template
    
    const insertIndex = index !== undefined ? index : currentSlideIndex + 1
    const newSlides = [...presentation.slides]
    newSlides.splice(insertIndex, 0, newSlide)
    
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(insertIndex)
  }

  const duplicateSlide = (index: number) => {
    if (!presentation) return

    const slideToClone = presentation.slides[index]
    const newSlide = { 
      ...slideToClone, 
      id: 'slide-' + Date.now(),
      title: slideToClone.title + ' (Copy)'
    }
    
    const newSlides = [...presentation.slides]
    newSlides.splice(index + 1, 0, newSlide)
    
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(index + 1)
  }

  const deleteSlide = (index: number) => {
    if (!presentation || presentation.slides.length <= 1) return

    const newSlides = presentation.slides.filter((_, i) => i !== index)
    setPresentation({ ...presentation, slides: newSlides })
    
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1)
    }
  }

  const moveSlide = (fromIndex: number, toIndex: number) => {
    if (!presentation) return

    const newSlides = [...presentation.slides]
    const [removed] = newSlides.splice(fromIndex, 1)
    newSlides.splice(toIndex, 0, removed)
    
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(toIndex)
  }

  const updateSlide = (slideIndex: number, updates: Partial<Slide>) => {
    if (!presentation) return

    const newSlides = [...presentation.slides]
    newSlides[slideIndex] = { ...newSlides[slideIndex], ...updates }
    
    setPresentation({ ...presentation, slides: newSlides })
  }

  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault()
          handleAutoSave()
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            // Redo
          } else {
            // Undo
          }
          break
        case 'd':
          e.preventDefault()
          duplicateSlide(currentSlideIndex)
          break
        case 'n':
          e.preventDefault()
          addSlide()
          break
      }
    }
    
    switch (e.key) {
      case 'Delete':
        if (selectedElements.length > 0) {
          // Delete selected elements
        }
        break
      case 'ArrowLeft':
        if (currentSlideIndex > 0) {
          setCurrentSlideIndex(currentSlideIndex - 1)
        }
        break
      case 'ArrowRight':
        if (presentation && currentSlideIndex < presentation.slides.length - 1) {
          setCurrentSlideIndex(currentSlideIndex + 1)
        }
        break
    }
  }, [currentSlideIndex, selectedElements, presentation])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts)
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [handleKeyboardShortcuts])

  if (!presentation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading presentation...</p>
        </div>
      </div>
    )
  }

  const currentSlide = presentation.slides[currentSlideIndex]

  return (
    <TooltipProvider>
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-gray-900 min-w-0">
                <input
                  value={presentation.title}
                  onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
                  className="bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
                />
              </h1>
              {isAutoSaving && (
                <Badge variant="secondary" className="text-xs">
                  Auto-saving...
                </Badge>
              )}
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => {}}>
                    <Undo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => {}}>
                    <Redo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Tabs value={selectedTool} onValueChange={setSelectedTool} className="w-auto">
              <TabsList className="grid grid-cols-6 w-auto">
                <TabsTrigger value="select" className="px-3">
                  <div className="w-4 h-4 border border-gray-400 bg-white"></div>
                </TabsTrigger>
                <TabsTrigger value="text">
                  <Type className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="image">
                  <Image className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="chart">
                  <BarChart3 className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="table">
                  <Table className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="shape">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 mr-4">
              <Label className="text-sm">Zoom:</Label>
              <Select value={zoom.toString()} onValueChange={(value) => setZoom(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                  <SelectItem value="125">125%</SelectItem>
                  <SelectItem value="150">150%</SelectItem>
                  <SelectItem value="200">200%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)}>
              <Grid className={`w-4 h-4 ${showGrid ? 'text-blue-600' : ''}`} />
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="ghost" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setCollaborationMode(!collaborationMode)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Collaborate
            </Button>
            
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Slide Navigator */}
          <motion.div 
            initial={false}
            animate={{ width: sidebarCollapsed ? 60 : 280 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-r border-gray-200 flex flex-col shadow-sm"
          >
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {!sidebarCollapsed && (
                  <h3 className="font-medium text-gray-900">Slides</h3>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
              
              {!sidebarCollapsed && (
                <div className="mt-2 flex items-center space-x-2">
                  <Input
                    placeholder="Search slides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8"
                  />
                  <Button variant="outline" size="sm" onClick={() => addSlide()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {presentation.slides.map((slide, index) => (
                  <motion.div
                    key={slide.id}
                    layout
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                      index === currentSlideIndex 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentSlideIndex(index)}
                  >
                    {!sidebarCollapsed ? (
                      <div className="p-3">
                        <div className="aspect-video bg-white rounded border mb-2 relative overflow-hidden">
                          {slide.thumbnail ? (
                            <img src={slide.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">Slide {index + 1}</span>
                            </div>
                          )}
                          
                          {slide.hidden && (
                            <div className="absolute top-1 right-1">
                              <EyeOff className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                          
                          {slide.locked && (
                            <div className="absolute top-1 left-1">
                              <Lock className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700 truncate">
                            {slide.title}
                          </span>
                          <span className="text-xs text-gray-500">{index + 1}</span>
                        </div>
                        
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateSlide(index)
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteSlide(index)
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 flex items-center justify-center">
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col bg-gray-100">
            <div className="flex-1 flex items-center justify-center p-8">
              <div 
                ref={canvasRef}
                className="relative bg-white rounded-lg shadow-lg"
                style={{ 
                  width: `${720 * (zoom / 100)}px`, 
                  height: `${405 * (zoom / 100)}px`,
                  transform: `scale(${zoom / 100})`
                }}
              >
                {showGrid && (
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}
                  />
                )}
                
                <AdvancedSlideEditor
                  slide={currentSlide}
                  selectedElements={selectedElements}
                  onUpdateSlide={(updates) => updateSlide(currentSlideIndex, updates)}
                  onSelectElements={setSelectedElements}
                  tool={selectedTool}
                  zoom={zoom}
                />
              </div>
            </div>
            
            {/* Bottom Timeline */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 bg-gray-100 rounded-full h-2 relative">
                  <div 
                    className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full transition-all"
                    style={{ width: `${((currentSlideIndex + 1) / presentation.slides.length) * 100}%` }}
                  />
                </div>
                
                <Button variant="ghost" size="sm" onClick={() => setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))}>
                  <SkipForward className="w-4 h-4" />
                </Button>
                
                <span className="text-sm text-gray-600">
                  {currentSlideIndex + 1} of {presentation.slides.length}
                </span>
              </div>
            </div>
          </div>

          {/* Right Properties Panel */}
          <motion.div 
            initial={false}
            animate={{ width: propertiesCollapsed ? 60 : 320 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-l border-gray-200 flex flex-col shadow-sm"
          >
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {!propertiesCollapsed && (
                  <h3 className="font-medium text-gray-900">Properties</h3>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPropertiesCollapsed(!propertiesCollapsed)}
                >
                  {propertiesCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
              
              {!propertiesCollapsed && (
                <Tabs value={panelMode} onValueChange={(value: any) => setPanelMode(value)} className="mt-2">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
                    <TabsTrigger value="animations" className="text-xs">Animate</TabsTrigger>
                    <TabsTrigger value="transitions" className="text-xs">Transition</TabsTrigger>
                    <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
            
            {!propertiesCollapsed && (
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <TabsContent value="design" className="space-y-4">
                    {/* Design properties */}
                    <div>
                      <Label className="text-sm font-medium">Background</Label>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {['#ffffff', '#f8fafc', '#1e293b', '#3b82f6', '#ef4444', '#10b981'].map((color) => (
                          <button
                            key={color}
                            className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                            style={{ backgroundColor: color }}
                            onClick={() => updateSlide(currentSlideIndex, { 
                              background: { type: 'solid', color } 
                            })}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Template</Label>
                      <Select 
                        value={currentSlide.template} 
                        onValueChange={(value) => updateSlide(currentSlideIndex, { template: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blank">Blank</SelectItem>
                          <SelectItem value="title">Title Slide</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="two-column">Two Column</SelectItem>
                          <SelectItem value="image-text">Image & Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="animations" className="space-y-4">
                    <p className="text-sm text-gray-600">Animation properties will go here</p>
                  </TabsContent>
                  
                  <TabsContent value="transitions" className="space-y-4">
                    <p className="text-sm text-gray-600">Transition properties will go here</p>
                  </TabsContent>
                  
                  <TabsContent value="notes" className="space-y-4">
                    <Label className="text-sm font-medium">Speaker Notes</Label>
                    <textarea
                      value={currentSlide.notes}
                      onChange={(e) => updateSlide(currentSlideIndex, { notes: e.target.value })}
                      className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none text-sm"
                      placeholder="Add your speaker notes here..."
                    />
                  </TabsContent>
                </div>
              </ScrollArea>
            )}
          </motion.div>
        </div>

        {/* Collaboration Panel Overlay */}
        <AnimatePresence>
          {collaborationMode && (
            <CollaborationPanel 
              presentation={presentation}
              onClose={() => setCollaborationMode(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}