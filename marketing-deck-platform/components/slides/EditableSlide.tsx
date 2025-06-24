'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartSlide } from './ChartSlide'
import { Edit, Type, BarChart3, Plus, Trash2 } from 'lucide-react'

interface EditableSlideProps {
  slide: any
  onUpdate: (slide: any) => void
  onDelete?: (slideId: string) => void
  editable?: boolean
}

export function EditableSlide({ slide, onUpdate, onDelete, editable = true }: EditableSlideProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(slide.content || {})

  const handleSave = () => {
    onUpdate({
      ...slide,
      content: editContent
    })
    setIsEditing(false)
  }

  const addTextBlock = () => {
    const newContent = {
      ...editContent,
      textBlocks: [
        ...(editContent.textBlocks || []),
        { id: Date.now(), text: 'New text block', style: 'body' }
      ]
    }
    setEditContent(newContent)
  }

  const updateTextBlock = (blockId: number, text: string) => {
    const newContent = {
      ...editContent,
      textBlocks: editContent.textBlocks?.map((block: any) =>
        block.id === blockId ? { ...block, text } : block
      ) || []
    }
    setEditContent(newContent)
  }

  const removeTextBlock = (blockId: number) => {
    const newContent = {
      ...editContent,
      textBlocks: editContent.textBlocks?.filter((block: any) => block.id !== blockId) || []
    }
    setEditContent(newContent)
  }

  // Render chart slide if it has chart data
  if (slide.chartData || slide.data) {
    return (
      <ChartSlide
        slide={{
          ...slide,
          data: slide.chartData || slide.data,
          chartType: slide.chartType || 'area'
        }}
        onUpdate={onUpdate}
        editable={editable}
      />
    )
  }

  return (
    <Card className="p-8 bg-gray-900/50 border-gray-700 text-white min-h-[600px]">
      <div className="flex justify-between items-start mb-6">
        {isEditing ? (
          <input
            type="text"
            value={editContent.title || slide.title}
            onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
            className="text-3xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-white w-full"
            autoFocus
          />
        ) : (
          <h2 className="text-3xl font-bold text-white">{editContent.title || slide.title}</h2>
        )}
        
        {editable && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4" />
                </Button>
                {onDelete && (
                  <Button size="sm" variant="ghost" onClick={() => onDelete(slide.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Subtitle/Body Text */}
        {isEditing ? (
          <textarea
            value={editContent.body || editContent.subtitle || slide.content?.body || slide.content?.subtitle || ''}
            onChange={(e) => setEditContent({ 
              ...editContent, 
              body: e.target.value,
              subtitle: e.target.value 
            })}
            className="w-full h-32 bg-gray-800/50 border border-gray-600 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-white"
            placeholder="Add your content here..."
          />
        ) : (
          <div className="text-lg text-gray-300 leading-relaxed">
            {editContent.body || editContent.subtitle || slide.content?.body || slide.content?.subtitle || 'Add your content here...'}
          </div>
        )}

        {/* Dynamic Text Blocks */}
        {editContent.textBlocks?.map((block: any) => (
          <div key={block.id} className="relative group">
            {isEditing ? (
              <div className="flex gap-2">
                <textarea
                  value={block.text}
                  onChange={(e) => updateTextBlock(block.id, e.target.value)}
                  className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-white"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeTextBlock(block.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className={`
                ${block.style === 'heading' ? 'text-2xl font-semibold' : 'text-base'}
                ${block.style === 'bullet' ? 'ml-4 before:content-["•"] before:mr-2' : ''}
                text-gray-300
              `}>
                {block.text}
              </div>
            )}
          </div>
        ))}

        {/* Add Content Buttons */}
        {isEditing && (
          <div className="flex gap-2 pt-4 border-t border-gray-700">
            <Button size="sm" variant="outline" onClick={addTextBlock}>
              <Plus className="w-4 h-4 mr-2" />
              Add Text Block
            </Button>
          </div>
        )}
      </div>

      {/* Slide Type Preview */}
      {slide.type === 'title' && !isEditing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <h1 className="text-5xl font-bold mb-6 text-white">
            {editContent.title || slide.title}
          </h1>
          <h2 className="text-3xl text-blue-400">
            {editContent.subtitle || slide.content?.subtitle}
          </h2>
        </div>
      )}
    </Card>
  )
}