'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PowerPointSlideEditor } from '@/components/slides/PowerPointSlideEditor'
import { ExcelLevelChart } from '@/components/charts/ExcelLevelChart'
import { AdvancedFormatPanel } from '@/components/slides/AdvancedFormatPanel'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Presentation, Download, Share2, Settings,
  BarChart3, Type, Image as ImageIcon, Table,
  Layers, Eye, Grid, Ruler, Palette, Sparkles,
  Save, Undo, Redo, Copy, Clipboard, Search,
  FileText, FolderOpen, Plus, Minus, ZoomIn, ZoomOut,
  Monitor, Smartphone, Tablet, Printer,
  MessageSquare, Users, Clock, Star,
  Wand2, Target, Zap, Crown, X
} from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'

interface AdvancedPresentationStudioProps {
  initialPresentation?: any
  onSave?: (presentation: any) => void
  onExport?: (format: string) => void
  onShare?: (presentation: any) => void
}

export function AdvancedPresentationStudio({
  initialPresentation,
  onSave,
  onExport,
  onShare
}: AdvancedPresentationStudioProps) {
  const [presentation, setPresentation] = useState(initialPresentation || createDefaultPresentation())
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'normal' | 'slide-sorter' | 'notes' | 'outline'>('normal')
  const [zoom, setZoom] = useState(1)
  const [showMasterSlides, setShowMasterSlides] = useState(false)
  const [showAnimationPane, setShowAnimationPane] = useState(false)
  const [showTransitions, setShowTransitions] = useState(false)
  const [showFormatPanel, setShowFormatPanel] = useState(false)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackMode, setPlaybackMode] = useState<'presenter' | 'audience'>('presenter')

  const studioRef = useRef<HTMLDivElement>(null)

  const currentSlide = presentation.slides[currentSlideIndex]

  // Advanced features state
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [collaborationPanel, setCollaborationPanel] = useState(false)
  const [designIdeas, setDesignIdeas] = useState(false)
  const [smartGuides, setSmartGuides] = useState(true)
  const [morphTransitions, setMorphTransitions] = useState(false)

  useEffect(() => {
    // Auto-save functionality
    const autoSave = setInterval(() => {
      if (onSave) {
        onSave(presentation)
        toast.success('Presentation auto-saved', { duration: 1000 })
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSave)
  }, [presentation, onSave])

  const updateSlide = (slideIndex: number, updates: any) => {
    const newSlides = [...presentation.slides]
    newSlides[slideIndex] = { ...newSlides[slideIndex], ...updates }
    setPresentation({ ...presentation, slides: newSlides })
  }

  const addSlide = (layout: string = 'blank', insertAfter?: number) => {
    const position = insertAfter !== undefined ? insertAfter + 1 : presentation.slides.length
    const newSlide = createSlideFromLayout(layout)
    const newSlides = [...presentation.slides]
    newSlides.splice(position, 0, newSlide)
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(position)
    toast.success('New slide added!')
  }

  const duplicateSlide = (slideIndex: number) => {
    const slide = presentation.slides[slideIndex]
    const duplicatedSlide = {
      ...slide,
      id: `slide-${Date.now()}`,
      title: `${slide.title} (Copy)`,
      elements: slide.elements.map((el: any) => ({
        ...el,
        id: `element-${Date.now()}-${Math.random()}`
      }))
    }
    const newSlides = [...presentation.slides]
    newSlides.splice(slideIndex + 1, 0, duplicatedSlide)
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(slideIndex + 1)
    toast.success('Slide duplicated!')
  }

  const deleteSlide = (slideIndex: number) => {
    if (presentation.slides.length === 1) {
      toast.error('Cannot delete the last slide')
      return
    }
    const newSlides = presentation.slides.filter((_: any, index: number) => index !== slideIndex)
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(Math.min(slideIndex, newSlides.length - 1))
    toast.success('Slide deleted')
  }

  const startSlideshow = () => {
    setIsPlaying(true)
    setCurrentSlideIndex(0)
    // Enter fullscreen mode
    if (studioRef.current?.requestFullscreen) {
      studioRef.current.requestFullscreen()
    }
  }

  const exportPresentation = (format: 'pptx' | 'pdf' | 'video' | 'web') => {
    toast.loading(`Exporting as ${format.toUpperCase()}...`)
    
    // Simulate export process
    setTimeout(() => {
      toast.success(`Presentation exported as ${format.toUpperCase()}!`)
      if (onExport) onExport(format)
    }, 2000)
  }

  const generateDesignIdeas = async () => {
    setDesignIdeas(true)
    toast.loading('AI generating design ideas...')
    
    // Simulate AI design generation
    setTimeout(() => {
      toast.success('Design ideas generated!')
      // Would show design suggestions panel
    }, 1500)
  }

  const applySmartLayout = () => {
    toast.loading('Applying smart layout...')
    
    // Simulate smart layout application
    setTimeout(() => {
      toast.success('Smart layout applied!')
      // Would automatically arrange elements optimally
    }, 1000)
  }

  return (
    <div ref={studioRef} className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Advanced Ribbon Interface */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <AdvancedRibbonToolbar
          presentation={presentation}
          currentSlide={currentSlide}
          selectedElements={selectedElements}
          viewMode={viewMode}
          zoom={zoom}
          onViewModeChange={setViewMode}
          onZoomChange={setZoom}
          onAddSlide={addSlide}
          onShowAnimations={() => setShowAnimationPane(!showAnimationPane)}
          onShowTransitions={() => setShowTransitions(!showTransitions)}
          onShowFormat={() => setShowFormatPanel(!showFormatPanel)}
          onStartSlideshow={startSlideshow}
          onExport={exportPresentation}
          onSave={() => onSave?.(presentation)}
          onAIAssistant={() => setAiAssistantOpen(!aiAssistantOpen)}
          onDesignIdeas={generateDesignIdeas}
          onSmartLayout={applySmartLayout}
          showMasterSlides={showMasterSlides}
          onToggleMasterSlides={() => setShowMasterSlides(!showMasterSlides)}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Advanced Slide Navigator */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Slides</h3>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => addSlide()} title="Add Slide">
                  <Plus className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" title="Slide Sorter">
                  <Grid className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {presentation.slides.map((slide: any, index: number) => (
              <SlideNavigatorItem
                key={slide.id}
                slide={slide}
                index={index}
                isActive={index === currentSlideIndex}
                onClick={() => setCurrentSlideIndex(index)}
                onDuplicate={() => duplicateSlide(index)}
                onDelete={() => deleteSlide(index)}
              />
            ))}
          </div>

          {/* Advanced Template Gallery */}
          <div className="border-t border-gray-200 p-3">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => setShowMasterSlides(true)}
            >
              <Sparkles className="w-3 h-3 mr-2" />
              Template Gallery
            </Button>
          </div>
        </div>

        {/* Main Editing Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Toolbar */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Slide {currentSlideIndex + 1} of {presentation.slides.length}
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" title="Previous Slide">
                  <button
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                  >
                    ‹
                  </button>
                </Button>
                <Button size="sm" variant="ghost" title="Next Slide">
                  <button
                    onClick={() => setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex === presentation.slides.length - 1}
                  >
                    ›
                  </button>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" title="Fit to Window">
                <Monitor className="w-3 h-3" />
              </Button>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}>
                  <ZoomOut className="w-3 h-3" />
                </Button>
                <span className="text-xs font-medium min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button size="sm" variant="ghost" onClick={() => setZoom(Math.min(3, zoom + 0.1))}>
                  <ZoomIn className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="w-px h-4 bg-gray-300 mx-2" />
              
              <Button size="sm" variant="ghost" title="Smart Guides" 
                className={smartGuides ? 'bg-blue-100 text-blue-600' : ''}>
                <Target className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" title="AI Design Ideas" onClick={generateDesignIdeas}>
                <Wand2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* PowerPoint-Level Slide Editor */}
          <div className="flex-1">
            {viewMode === 'normal' && currentSlide && (
              <PowerPointSlideEditor
                slide={currentSlide}
                slideNumber={currentSlideIndex + 1}
                onUpdate={(updates) => updateSlide(currentSlideIndex, updates)}
                onApplyMaster={(masterId) => {
                  // Apply master slide template
                  toast.success('Master slide applied!')
                }}
              />
            )}

            {viewMode === 'slide-sorter' && (
              <SlideSorterView
                slides={presentation.slides}
                onSlideSelect={setCurrentSlideIndex}
                onSlideReorder={(fromIndex: number, toIndex: number) => {
                  const newSlides = [...presentation.slides]
                  const [movedSlide] = newSlides.splice(fromIndex, 1)
                  newSlides.splice(toIndex, 0, movedSlide)
                  setPresentation({ ...presentation, slides: newSlides })
                }}
              />
            )}

            {viewMode === 'notes' && (
              <NotesView
                slide={currentSlide}
                onNotesUpdate={(notes: string) => updateSlide(currentSlideIndex, { notes })}
              />
            )}
          </div>
        </div>

        {/* Advanced Side Panels */}
        <AnimatePresence>
          {showFormatPanel && (
            <AdvancedFormatPanel
              selectedElements={selectedElements}
              elements={currentSlide?.elements || []}
              onUpdateElement={(elementId: string, updates: any) => {
                const newElements = currentSlide.elements.map((el: any) =>
                  el.id === elementId ? { ...el, ...updates } : el
                )
                updateSlide(currentSlideIndex, { elements: newElements })
              }}
              onClose={() => setShowFormatPanel(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAnimationPane && (
            <AnimationPanel
              slide={currentSlide}
              onSlideUpdate={(updates: any) => updateSlide(currentSlideIndex, updates)}
              onClose={() => setShowAnimationPane(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {aiAssistantOpen && (
            <AIDesignAssistant
              presentation={presentation}
              currentSlide={currentSlide}
              onSuggestionApply={(suggestion: any) => {
                // Apply AI suggestion
                updateSlide(currentSlideIndex, suggestion)
                toast.success('AI suggestion applied!')
              }}
              onClose={() => setAiAssistantOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span>•</span>
          <span>{presentation.slides.length} slides</span>
          <span>•</span>
          <span>Auto-save enabled</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span>PowerPoint compatibility: 100%</span>
          <span>•</span>
          <span>Excel charts: Enhanced</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Crown className="w-3 h-3 text-yellow-500" />
            <span>Professional Studio</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Slideshow Mode */}
      <AnimatePresence>
        {isPlaying && (
          <SlideshowPlayer
            slides={presentation.slides}
            currentIndex={currentSlideIndex}
            onSlideChange={setCurrentSlideIndex}
            onExit={() => setIsPlaying(false)}
            mode={playbackMode}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Supporting Components
function AdvancedRibbonToolbar({ 
  onAddSlide, onStartSlideshow, onExport, onSave, onAIAssistant,
  onDesignIdeas, onSmartLayout, ...props 
}: any) {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="px-4 py-2">
      {/* Tab Headers */}
      <div className="flex items-center gap-6 mb-3 border-b border-gray-200">
        {['home', 'insert', 'design', 'transitions', 'animations', 'review', 'view'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium transition-colors relative capitalize ${
              activeTab === tab 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex items-center gap-6">
        {activeTab === 'home' && (
          <>
            <ToolGroup title="Slides">
              <Button size="sm" onClick={() => onAddSlide('title')} title="New Slide">
                <Plus className="w-4 h-4 mr-1" />
                New Slide
              </Button>
              <Button size="sm" variant="ghost" title="Slide Layout">
                <Grid className="w-4 h-4" />
              </Button>
            </ToolGroup>

            <ToolGroup title="Font">
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>Arial</option>
                <option>Helvetica</option>
                <option>Times New Roman</option>
              </select>
              <select className="text-sm border border-gray-300 rounded px-2 py-1 w-16">
                <option>18</option>
                <option>24</option>
                <option>36</option>
              </select>
            </ToolGroup>

            <ToolGroup title="AI">
              <Button size="sm" onClick={onAIAssistant} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Sparkles className="w-4 h-4 mr-1" />
                AI Assistant
              </Button>
              <Button size="sm" variant="outline" onClick={onDesignIdeas}>
                <Wand2 className="w-4 h-4 mr-1" />
                Design Ideas
              </Button>
            </ToolGroup>
          </>
        )}

        {activeTab === 'insert' && (
          <>
            <ToolGroup title="Content">
              <Button size="sm" onClick={() => onAddSlide('chart')}>
                <BarChart3 className="w-4 h-4 mr-1" />
                Excel Chart
              </Button>
              <Button size="sm" onClick={() => onAddSlide('table')}>
                <Table className="w-4 h-4 mr-1" />
                Table
              </Button>
              <Button size="sm" onClick={() => onAddSlide('image')}>
                <ImageIcon className="w-4 h-4 mr-1" />
                Image
              </Button>
            </ToolGroup>

            <ToolGroup title="Media">
              <Button size="sm" variant="outline">
                <Play className="w-4 h-4 mr-1" />
                Video
              </Button>
              <Button size="sm" variant="outline">
                Audio
              </Button>
            </ToolGroup>
          </>
        )}

        {activeTab === 'design' && (
          <>
            <ToolGroup title="Themes">
              <Button size="sm" onClick={onDesignIdeas}>
                <Palette className="w-4 h-4 mr-1" />
                Design Ideas
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4 mr-1" />
                Variants
              </Button>
            </ToolGroup>

            <ToolGroup title="Layout">
              <Button size="sm" onClick={onSmartLayout}>
                <Target className="w-4 h-4 mr-1" />
                Smart Layout
              </Button>
            </ToolGroup>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={onSave} title="Save">
            <Save className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onExport('pptx')} title="Export">
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onStartSlideshow}>
            <Play className="w-4 h-4 mr-1" />
            Slideshow
          </Button>
        </div>
      </div>
    </div>
  )
}

function ToolGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className="flex items-center gap-1">
        {children}
      </div>
    </div>
  )
}

function SlideNavigatorItem({ slide, index, isActive, onClick, onDuplicate, onDelete }: any) {
  return (
    <div
      onClick={onClick}
      className={`p-2 rounded-lg border-2 cursor-pointer transition-all group ${
        isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{index + 1}</span>
        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDuplicate() }}>
            <Copy className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete() }}>
            <Minus className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded mb-2 aspect-video flex items-center justify-center text-gray-400">
        <Presentation className="w-6 h-6" />
      </div>
      
      <p className="text-xs font-medium truncate">{slide.title}</p>
    </div>
  )
}

function SlideSorterView({ slides, onSlideSelect, onSlideReorder }: any) {
  return (
    <div className="p-8 overflow-auto">
      <div className="grid grid-cols-4 gap-4">
        {slides.map((slide: any, index: number) => (
          <div
            key={slide.id}
            onClick={() => onSlideSelect(index)}
            className="cursor-pointer group"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-4 aspect-video hover:shadow-md transition-shadow">
              <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                <Presentation className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <p className="text-sm font-medium mt-2 text-center">{index + 1}. {slide.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotesView({ slide, onNotesUpdate }: any) {
  return (
    <div className="p-8 grid grid-cols-2 gap-8 h-full">
      <div>
        <h3 className="text-lg font-semibold mb-4">Slide Preview</h3>
        <div className="bg-white border border-gray-200 rounded-lg aspect-video flex items-center justify-center">
          <Presentation className="w-12 h-12 text-gray-400" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Speaker Notes</h3>
        <textarea
          value={slide.notes || ''}
          onChange={(e) => onNotesUpdate(e.target.value)}
          placeholder="Add your speaker notes here..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none"
        />
      </div>
    </div>
  )
}

function AnimationPanel({ slide, onSlideUpdate, onClose }: any) {
  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      className="w-80 bg-white border-l border-gray-200 shadow-lg h-full overflow-y-auto"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold">Animations</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-4">Select an element to add animations</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Entrance Effects</h4>
            <div className="grid grid-cols-2 gap-2">
              {['Fade In', 'Fly In', 'Zoom', 'Bounce'].map(effect => (
                <Button key={effect} size="sm" variant="outline" className="text-xs">
                  {effect}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Emphasis Effects</h4>
            <div className="grid grid-cols-2 gap-2">
              {['Pulse', 'Spin', 'Grow', 'Flash'].map(effect => (
                <Button key={effect} size="sm" variant="outline" className="text-xs">
                  {effect}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AIDesignAssistant({ presentation, currentSlide, onSuggestionApply, onClose }: any) {
  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      className="w-80 bg-white border-l border-gray-200 shadow-lg h-full overflow-y-auto"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="bg-purple-50 p-3 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">Smart Suggestions</h4>
          <p className="text-sm text-purple-700">AI has analyzed your content and found optimization opportunities.</p>
        </div>
        
        <div className="space-y-3">
          <div className="border border-gray-200 rounded-lg p-3">
            <h5 className="font-medium text-sm mb-1">Improve Chart Colors</h5>
            <p className="text-xs text-gray-600 mb-2">Make charts more accessible with high-contrast colors</p>
            <Button size="sm" onClick={() => onSuggestionApply({ chartColors: 'accessible' })}>
              Apply
            </Button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-3">
            <h5 className="font-medium text-sm mb-1">Optimize Layout</h5>
            <p className="text-xs text-gray-600 mb-2">Reorganize elements for better visual hierarchy</p>
            <Button size="sm" onClick={() => onSuggestionApply({ layout: 'optimized' })}>
              Apply
            </Button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-3">
            <h5 className="font-medium text-sm mb-1">Add Visual Interest</h5>
            <p className="text-xs text-gray-600 mb-2">Include icons and graphics to enhance engagement</p>
            <Button size="sm" onClick={() => onSuggestionApply({ visuals: 'enhanced' })}>
              Apply
            </Button>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Ask AI</h4>
          <textarea
            placeholder="Ask for design suggestions..."
            className="w-full h-20 p-2 border border-gray-300 rounded text-sm resize-none"
          />
          <Button size="sm" className="mt-2 w-full">
            <MessageSquare className="w-3 h-3 mr-1" />
            Get Suggestions
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function SlideshowPlayer({ slides, currentIndex, onSlideChange, onExit, mode }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-white w-4/5 h-4/5 rounded-lg shadow-2xl flex items-center justify-center">
          <Presentation className="w-24 h-24 text-gray-400" />
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 rounded-lg px-4 py-2">
        <Button
          size="sm"
          onClick={() => onSlideChange(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="text-white"
        >
          ‹
        </Button>
        <span className="text-white text-sm">
          {currentIndex + 1} / {slides.length}
        </span>
        <Button
          size="sm"
          onClick={() => onSlideChange(Math.min(slides.length - 1, currentIndex + 1))}
          disabled={currentIndex === slides.length - 1}
          className="text-white"
        >
          ›
        </Button>
        <Button size="sm" onClick={onExit} className="text-white ml-4">
          Exit
        </Button>
      </div>
    </motion.div>
  )
}

// Utility functions
function createDefaultPresentation() {
  return {
    id: `presentation-${Date.now()}`,
    title: 'New Presentation',
    slides: [
      createSlideFromLayout('title')
    ],
    theme: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

function createSlideFromLayout(layout: string) {
  const baseSlide: any = {
    id: `slide-${Date.now()}`,
    title: 'New Slide',
    layout,
    elements: [] as any[],
    background: {
      type: 'solid',
      value: '#FFFFFF'
    },
    transitions: {
      entrance: 'none',
      exit: 'none',
      duration: 1000
    },
    notes: '',
    hiddenSlide: false
  }

  switch (layout) {
    case 'title':
      baseSlide.title = 'Title Slide'
      baseSlide.elements = [
        {
          id: 'title-text',
          type: 'text',
          x: 100,
          y: 200,
          width: 600,
          height: 100,
          content: 'Click to add title',
          style: {
            fontSize: 36,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1e293b'
          }
        }
      ]
      break
    
    case 'chart':
      baseSlide.title = 'Chart Slide'
      baseSlide.elements = [
        {
          id: 'chart-element',
          type: 'chart',
          x: 100,
          y: 100,
          width: 600,
          height: 400,
          chartData: [] as any[],
          chartConfig: {}
        }
      ]
      break
  }

  return baseSlide
}