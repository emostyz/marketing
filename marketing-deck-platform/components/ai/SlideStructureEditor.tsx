'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult
} from '@hello-pangea/dnd'
import {
  PlusCircle,
  Trash2,
  GripVertical,
  Edit3,
  Save,
  RotateCcw,
  FileText,
  BarChart3,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  Eye,
  Move,
  Copy
} from 'lucide-react'
import { type SlideStructure } from '@/lib/ai/insight-feedback-loop'

interface SlideStructureEditorProps {
  initialStructure: SlideStructure
  onStructureChange: (structure: SlideStructure) => void
  onSave: () => void
  onPreview: () => void
  onGenerateSlides: () => void
  isGenerating?: boolean
  hasUnsavedChanges?: boolean
}

type SlideType = 'title' | 'executive_summary' | 'key_finding' | 'trend_analysis' | 'recommendation' | 'conclusion'
type VisualElementType = 'chart' | 'table' | 'callout' | 'metric_highlight'
type ElementPosition = 'left' | 'right' | 'center' | 'full_width'
type ElementPriority = 'high' | 'medium' | 'low'

const slideTypeIcons = {
  title: FileText,
  executive_summary: CheckCircle,
  key_finding: TrendingUp,
  trend_analysis: BarChart3,
  recommendation: Target,
  conclusion: Users
}

const slideTypeLabels = {
  title: 'Title Slide',
  executive_summary: 'Executive Summary',
  key_finding: 'Key Finding',
  trend_analysis: 'Trend Analysis',
  recommendation: 'Recommendation',
  conclusion: 'Conclusion'
}

export default function SlideStructureEditor({
  initialStructure,
  onStructureChange,
  onSave,
  onPreview,
  onGenerateSlides,
  isGenerating = false,
  hasUnsavedChanges = false
}: SlideStructureEditorProps) {
  const [structure, setStructure] = useState<SlideStructure>(initialStructure)
  const [editingSlide, setEditingSlide] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)

  // Update parent when structure changes
  useEffect(() => {
    onStructureChange(structure)
  }, [structure, onStructureChange])

  const handleTitleChange = useCallback((newTitle: string) => {
    setStructure(prev => ({
      ...prev,
      presentationTitle: newTitle
    }))
  }, [])

  const handleSlideReorder = useCallback((result: DropResult) => {
    if (!result.destination) return

    const slides = Array.from(structure.slides)
    const [reorderedSlide] = slides.splice(result.source.index, 1)
    slides.splice(result.destination.index, 0, reorderedSlide)

    // Update sequence numbers
    const updatedSlides = slides.map((slide, index) => ({
      ...slide,
      sequence: index + 1
    }))

    setStructure(prev => ({
      ...prev,
      slides: updatedSlides
    }))
  }, [structure.slides])

  const handleSlideUpdate = useCallback((slideId: string, updates: Partial<typeof structure.slides[0]>) => {
    setStructure(prev => ({
      ...prev,
      slides: prev.slides.map(slide =>
        slide.id === slideId ? { ...slide, ...updates } : slide
      )
    }))
  }, [])

  const handleAddSlide = useCallback((afterIndex?: number) => {
    const newSlideId = `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : structure.slides.length
    
    const newSlide = {
      id: newSlideId,
      type: 'key_finding' as SlideType,
      title: 'New Slide',
      sequence: insertIndex + 1,
      mainContent: 'Add your main content here...',
      supportingPoints: [],
      visualElements: [],
      speakerNotes: '',
      transitionToNext: ''
    }

    const updatedSlides = [...structure.slides]
    updatedSlides.splice(insertIndex, 0, newSlide)

    // Update sequence numbers for all slides after insertion
    const resequencedSlides = updatedSlides.map((slide, index) => ({
      ...slide,
      sequence: index + 1
    }))

    setStructure(prev => ({
      ...prev,
      slides: resequencedSlides
    }))

    setEditingSlide(newSlideId)
  }, [structure.slides])

  const handleDeleteSlide = useCallback((slideId: string) => {
    if (structure.slides.length <= 3) {
      alert('Presentation must have at least 3 slides')
      return
    }

    const updatedSlides = structure.slides
      .filter(slide => slide.id !== slideId)
      .map((slide, index) => ({
        ...slide,
        sequence: index + 1
      }))

    setStructure(prev => ({
      ...prev,
      slides: updatedSlides
    }))

    if (editingSlide === slideId) {
      setEditingSlide(null)
    }
  }, [structure.slides, editingSlide])

  const handleDuplicateSlide = useCallback((slideId: string) => {
    const slideToClone = structure.slides.find(s => s.id === slideId)
    if (!slideToClone) return

    const newSlideId = `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const clonedSlide = {
      ...slideToClone,
      id: newSlideId,
      title: `${slideToClone.title} (Copy)`,
      sequence: slideToClone.sequence + 1
    }

    const slideIndex = structure.slides.findIndex(s => s.id === slideId)
    const updatedSlides = [...structure.slides]
    updatedSlides.splice(slideIndex + 1, 0, clonedSlide)

    // Update sequence numbers
    const resequencedSlides = updatedSlides.map((slide, index) => ({
      ...slide,
      sequence: index + 1
    }))

    setStructure(prev => ({
      ...prev,
      slides: resequencedSlides
    }))
  }, [structure.slides])

  const handleAddVisualElement = useCallback((slideId: string) => {
    const newElement = {
      type: 'chart' as VisualElementType,
      content: 'New visual element',
      position: 'center' as ElementPosition,
      priority: 'medium' as ElementPriority
    }

    handleSlideUpdate(slideId, {
      visualElements: [
        ...structure.slides.find(s => s.id === slideId)?.visualElements || [],
        newElement
      ]
    })
  }, [structure.slides, handleSlideUpdate])

  const handleDeleteVisualElement = useCallback((slideId: string, elementIndex: number) => {
    const slide = structure.slides.find(s => s.id === slideId)
    if (!slide) return

    const updatedElements = slide.visualElements.filter((_, index) => index !== elementIndex)
    handleSlideUpdate(slideId, { visualElements: updatedElements })
  }, [structure.slides, handleSlideUpdate])

  const handleNarrativeUpdate = useCallback((field: keyof typeof structure.narrativeFlow, value: string) => {
    setStructure(prev => ({
      ...prev,
      narrativeFlow: {
        ...prev.narrativeFlow,
        [field]: value
      }
    }))
  }, [])

  const resetToOriginal = useCallback(() => {
    setStructure(initialStructure)
    setEditingSlide(null)
    setEditingTitle(false)
  }, [initialStructure])

  const getSlideIcon = (type: SlideType) => {
    const Icon = slideTypeIcons[type]
    return <Icon className="h-4 w-4" />
  }

  const getSlideTypeColor = (type: SlideType) => {
    const colors = {
      title: 'bg-purple-100 text-purple-800',
      executive_summary: 'bg-blue-100 text-blue-800',
      key_finding: 'bg-green-100 text-green-800',
      trend_analysis: 'bg-orange-100 text-orange-800',
      recommendation: 'bg-red-100 text-red-800',
      conclusion: 'bg-gray-100 text-gray-800'
    }
    return colors[type]
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={structure.presentationTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-2xl font-bold max-w-2xl"
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={() => setEditingTitle(false)}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">{structure.presentationTitle}</h1>
              <Button size="sm" variant="ghost" onClick={() => setEditingTitle(true)}>
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <p className="text-gray-600 mt-1">
            {structure.slides.length} slides • {structure.recommendedDuration} min duration • {structure.targetAudience}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={resetToOriginal} size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={onPreview} size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={onSave} variant="outline" disabled={!hasUnsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button onClick={onGenerateSlides} disabled={isGenerating} className="min-w-[140px]">
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              'Generate Slides'
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slide List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Slide Structure ({structure.slides.length} slides)</span>
                <Button size="sm" onClick={() => handleAddSlide()}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Slide
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleSlideReorder}>
                <Droppable droppableId="slides">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {structure.slides.map((slide, index) => (
                        <Draggable key={slide.id} draggableId={slide.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border rounded-lg p-4 space-y-3 transition-all ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              } ${editingSlide === slide.id ? 'ring-2 ring-blue-500' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                                  </div>
                                  <Badge className={getSlideTypeColor(slide.type)}>
                                    {getSlideIcon(slide.type)}
                                    <span className="ml-1">{slideTypeLabels[slide.type]}</span>
                                  </Badge>
                                  <span className="text-sm text-gray-500">#{slide.sequence}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleAddSlide(index)}
                                  >
                                    <PlusCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDuplicateSlide(slide.id)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingSlide(editingSlide === slide.id ? null : slide.id)}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteSlide(slide.id)}
                                    disabled={structure.slides.length <= 3}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-medium text-gray-900">{slide.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{slide.mainContent}</p>
                                {slide.visualElements.length > 0 && (
                                  <div className="flex gap-1 mt-2">
                                    {slide.visualElements.map((el, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {el.type}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {editingSlide === slide.id && (
                                <div className="border-t pt-4 space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Slide Type</label>
                                      <Select
                                        value={slide.type}
                                        onValueChange={(value) => handleSlideUpdate(slide.id, { type: value as SlideType })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Object.entries(slideTypeLabels).map(([type, label]) => (
                                            <SelectItem key={type} value={type}>
                                              <div className="flex items-center gap-2">
                                                {getSlideIcon(type as SlideType)}
                                                {label}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Title</label>
                                      <Input
                                        value={slide.title}
                                        onChange={(e) => handleSlideUpdate(slide.id, { title: e.target.value })}
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium mb-1">Main Content</label>
                                    <Textarea
                                      value={slide.mainContent}
                                      onChange={(e) => handleSlideUpdate(slide.id, { mainContent: e.target.value })}
                                      rows={3}
                                    />
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <label className="block text-sm font-medium">Visual Elements</label>
                                      <Button size="sm" variant="outline" onClick={() => handleAddVisualElement(slide.id)}>
                                        <PlusCircle className="h-4 w-4 mr-1" />
                                        Add Element
                                      </Button>
                                    </div>
                                    {slide.visualElements.map((element, elemIndex) => (
                                      <div key={elemIndex} className="flex items-center gap-2 mb-2 p-2 border rounded">
                                        <Select
                                          value={element.type}
                                          onValueChange={(value) => {
                                            const updatedElements = [...slide.visualElements]
                                            updatedElements[elemIndex] = { ...element, type: value as VisualElementType }
                                            handleSlideUpdate(slide.id, { visualElements: updatedElements })
                                          }}
                                        >
                                          <SelectTrigger className="w-32">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="chart">Chart</SelectItem>
                                            <SelectItem value="table">Table</SelectItem>
                                            <SelectItem value="callout">Callout</SelectItem>
                                            <SelectItem value="metric_highlight">Metric</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Input
                                          value={element.content}
                                          onChange={(e) => {
                                            const updatedElements = [...slide.visualElements]
                                            updatedElements[elemIndex] = { ...element, content: e.target.value }
                                            handleSlideUpdate(slide.id, { visualElements: updatedElements })
                                          }}
                                          placeholder="Element content"
                                          className="flex-1"
                                        />
                                        <Select
                                          value={element.position}
                                          onValueChange={(value) => {
                                            const updatedElements = [...slide.visualElements]
                                            updatedElements[elemIndex] = { ...element, position: value as ElementPosition }
                                            handleSlideUpdate(slide.id, { visualElements: updatedElements })
                                          }}
                                        >
                                          <SelectTrigger className="w-24">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="left">Left</SelectItem>
                                            <SelectItem value="right">Right</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="full_width">Full</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteVisualElement(slide.id, elemIndex)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium mb-1">Speaker Notes</label>
                                    <Textarea
                                      value={slide.speakerNotes || ''}
                                      onChange={(e) => handleSlideUpdate(slide.id, { speakerNotes: e.target.value })}
                                      rows={2}
                                      placeholder="Speaker notes for this slide..."
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </div>

        {/* Narrative Flow Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Narrative Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Introduction</label>
                <Textarea
                  value={structure.narrativeFlow.introduction}
                  onChange={(e) => handleNarrativeUpdate('introduction', e.target.value)}
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Key Message</label>
                <Textarea
                  value={structure.narrativeFlow.keyMessage}
                  onChange={(e) => handleNarrativeUpdate('keyMessage', e.target.value)}
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Call to Action</label>
                <Textarea
                  value={structure.narrativeFlow.callToAction}
                  onChange={(e) => handleNarrativeUpdate('callToAction', e.target.value)}
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Executive Takeaway</label>
                <Textarea
                  value={structure.narrativeFlow.executiveTakeaway}
                  onChange={(e) => handleNarrativeUpdate('executiveTakeaway', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Presentation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <Input
                  type="number"
                  value={structure.recommendedDuration}
                  onChange={(e) => setStructure(prev => ({ 
                    ...prev, 
                    recommendedDuration: parseInt(e.target.value) || 15 
                  }))}
                  min={5}
                  max={60}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Target Audience</label>
                <Input
                  value={structure.targetAudience}
                  onChange={(e) => setStructure(prev => ({ 
                    ...prev, 
                    targetAudience: e.target.value 
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Key Metrics</label>
                <div className="space-y-2">
                  {structure.keyMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={metric}
                        onChange={(e) => {
                          const updatedMetrics = [...structure.keyMetrics]
                          updatedMetrics[index] = e.target.value
                          setStructure(prev => ({ ...prev, keyMetrics: updatedMetrics }))
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updatedMetrics = structure.keyMetrics.filter((_, i) => i !== index)
                          setStructure(prev => ({ ...prev, keyMetrics: updatedMetrics }))
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStructure(prev => ({ 
                      ...prev, 
                      keyMetrics: [...prev.keyMetrics, 'New Metric'] 
                    }))}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Metric
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}