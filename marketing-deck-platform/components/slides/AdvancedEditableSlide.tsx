'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WorldClassChart } from '@/components/charts/WorldClassChart'
import { 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Brain,
  BarChart3,
  Type,
  Image as ImageIcon,
  Move
} from 'lucide-react'

interface SlideContent {
  title: string
  subtitle?: string
  body?: string
  bulletPoints?: string[]
  description?: string
  narrative?: string[]
  brainGenerated?: boolean
  confidence?: number
}

interface SlideData {
  id: string
  type: 'title' | 'content' | 'chart' | 'image'
  title: string
  content: SlideContent
  chartType?: 'area' | 'bar' | 'line' | 'donut'
  data?: any[]
  categories?: string[]
  index?: string
  tremorConfig?: any
}

interface AdvancedEditableSlideProps {
  slide: SlideData
  slideNumber: number
  onUpdate: (updatedSlide: SlideData) => void
  onDelete: (slideId: string) => void
  onDuplicate: (slide: SlideData) => void
}

export function AdvancedEditableSlide({ 
  slide, 
  slideNumber, 
  onUpdate, 
  onDelete, 
  onDuplicate 
}: AdvancedEditableSlideProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSlide, setEditedSlide] = useState<SlideData>(slide)

  const handleSave = () => {
    onUpdate(editedSlide)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedSlide(slide)
    setIsEditing(false)
  }

  const updateContent = (field: keyof SlideContent, value: any) => {
    setEditedSlide(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }))
  }

  const updateBulletPoint = (index: number, value: string) => {
    const newBulletPoints = [...(editedSlide.content.bulletPoints || [])]
    newBulletPoints[index] = value
    updateContent('bulletPoints', newBulletPoints)
  }

  const addBulletPoint = () => {
    const currentBullets = editedSlide.content.bulletPoints || []
    updateContent('bulletPoints', [...currentBullets, 'New bullet point'])
  }

  const removeBulletPoint = (index: number) => {
    const newBulletPoints = (editedSlide.content.bulletPoints || []).filter((_, i) => i !== index)
    updateContent('bulletPoints', newBulletPoints)
  }

  const updateNarrative = (index: number, value: string) => {
    const newNarrative = [...(editedSlide.content.narrative || [])]
    newNarrative[index] = value
    updateContent('narrative', newNarrative)
  }

  const addNarrative = () => {
    const currentNarrative = editedSlide.content.narrative || []
    updateContent('narrative', [...currentNarrative, 'New insight'])
  }

  const removeNarrative = (index: number) => {
    const newNarrative = (editedSlide.content.narrative || []).filter((_, i) => i !== index)
    updateContent('narrative', newNarrative)
  }

  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all">
      {/* Slide Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            {slideNumber}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editedSlide.title}
              onChange={(e) => setEditedSlide(prev => ({ ...prev, title: e.target.value }))}
              className="text-xl font-semibold bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:border-blue-500"
            />
          ) : (
            <h2 className="text-xl font-semibold text-white">{slide.title}</h2>
          )}
          
          {/* Slide Type Badge */}
          <div className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded text-xs">
            {slide.type === 'chart' && <BarChart3 className="w-3 h-3" />}
            {slide.type === 'content' && <Type className="w-3 h-3" />}
            {slide.type === 'title' && <ImageIcon className="w-3 h-3" />}
            <span className="text-gray-300 capitalize">{slide.type}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Brain Generated Badge */}
          {slide.content?.brainGenerated && (
            <div className="flex items-center gap-2 bg-emerald-900/30 px-3 py-1 rounded-full">
              <Brain className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-300">Brain Generated</span>
              {slide.content?.confidence && (
                <span className="text-xs text-emerald-400 font-semibold">
                  {slide.content.confidence}%
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-1">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDuplicate(slide)}>
                  <Move className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(slide.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <div className="space-y-4">
        {/* Title Slide */}
        {slide.type === 'title' && (
          <div className="text-center py-8">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editedSlide.content.title}
                  onChange={(e) => updateContent('title', e.target.value)}
                  className="text-3xl font-bold bg-gray-700 text-white px-4 py-2 rounded w-full text-center"
                  placeholder="Main Title"
                />
                <input
                  type="text"
                  value={editedSlide.content.subtitle || ''}
                  onChange={(e) => updateContent('subtitle', e.target.value)}
                  className="text-lg bg-gray-700 text-blue-300 px-3 py-1 rounded w-full text-center"
                  placeholder="Subtitle"
                />
                <textarea
                  value={editedSlide.content.description || ''}
                  onChange={(e) => updateContent('description', e.target.value)}
                  className="bg-gray-700 text-gray-300 px-3 py-2 rounded w-full text-center resize-none"
                  rows={3}
                  placeholder="Description"
                />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">{slide.content.title}</h1>
                <h2 className="text-lg text-blue-300 mb-4">{slide.content.subtitle}</h2>
                <p className="text-gray-300">{slide.content.description}</p>
              </>
            )}
          </div>
        )}

        {/* Content Slide */}
        {slide.type === 'content' && (
          <div>
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editedSlide.content.subtitle || ''}
                  onChange={(e) => updateContent('subtitle', e.target.value)}
                  className="text-lg bg-gray-700 text-blue-300 px-3 py-1 rounded w-full"
                  placeholder="Subtitle"
                />
                <textarea
                  value={editedSlide.content.body || ''}
                  onChange={(e) => updateContent('body', e.target.value)}
                  className="bg-gray-700 text-gray-300 px-3 py-2 rounded w-full resize-none"
                  rows={3}
                  placeholder="Main content"
                />
                
                {/* Bullet Points Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">Bullet Points</label>
                    <Button size="sm" onClick={addBulletPoint} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Point
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(editedSlide.content.bulletPoints || []).map((point, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-blue-400 mt-2">•</span>
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => updateBulletPoint(i, e.target.value)}
                          className="flex-1 bg-gray-700 text-gray-200 px-3 py-1 rounded"
                        />
                        <Button size="sm" variant="outline" onClick={() => removeBulletPoint(i)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg text-blue-300 mb-3">{slide.content.subtitle}</h3>
                <p className="text-gray-300 mb-4">{slide.content.body}</p>
                <ul className="space-y-2">
                  {slide.content.bulletPoints?.map((point: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-gray-200">{point}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Chart Slide */}
        {slide.type === 'chart' && (
          <div>
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editedSlide.content.description || ''}
                  onChange={(e) => updateContent('description', e.target.value)}
                  className="bg-gray-700 text-gray-300 px-3 py-2 rounded w-full resize-none"
                  rows={2}
                  placeholder="Chart description"
                />
                
                {/* Narrative Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">Chart Insights</label>
                    <Button size="sm" onClick={addNarrative} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Insight
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(editedSlide.content.narrative || []).map((insight, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={insight}
                          onChange={(e) => updateNarrative(i, e.target.value)}
                          className="flex-1 bg-gray-700 text-blue-200 px-3 py-2 rounded"
                        />
                        <Button size="sm" variant="outline" onClick={() => removeNarrative(i)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-300 mb-4">{slide.content.description}</p>
              </>
            )}

            {/* Render World-Class Chart */}
            {slide.data && slide.categories && slide.index && (
              <WorldClassChart
                data={slide.data}
                chartType={slide.chartType || 'bar'}
                title={`${slide.title} Visualization`}
                subtitle="Strategic data visualization"
                index={slide.index}
                categories={slide.categories}
                colors={slide.tremorConfig?.colors || ['blue', 'emerald', 'violet']}
                height={slide.tremorConfig?.height || 80}
                showCustomization={!isEditing}
                businessImpact={'significant'}
                actionability={'immediate'}
                priority={'high'}
                confidence={slide.content?.confidence || 85}
                advanced={{}}
                onDataChange={(newData) => {
                  setEditedSlide(prev => ({ ...prev, data: newData }))
                }}
              />
            )}

            {/* Chart Insights */}
            {!isEditing && (
              <div className="space-y-2 mt-4">
                {slide.content.narrative?.map((point: string, i: number) => (
                  <p key={i} className="text-sm text-blue-200 bg-blue-900/20 p-3 rounded border-l-4 border-blue-500">
                    💡 {point}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}