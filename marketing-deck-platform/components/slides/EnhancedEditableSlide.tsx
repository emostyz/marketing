'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TremorAdvancedChart } from '@/components/charts/TremorAdvancedCharts'
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Palette, Type, Move, Plus, Trash2, Copy, RotateCcw
} from 'lucide-react'

interface TextBlock {
  id: string
  text: string
  style: 'title' | 'body' | 'bullet' | 'highlight' | 'caption'
  formatting: {
    bold: boolean
    italic: boolean
    underline: boolean
    alignment: 'left' | 'center' | 'right'
    fontSize: number
    color: string
  }
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface SlideContent {
  id: string
  type: 'title' | 'content' | 'chart'
  title: string
  textBlocks: TextBlock[]
  chartConfig?: any
  data?: any[]
  theme?: string
}

interface EnhancedEditableSlideProps {
  slide: SlideContent
  onUpdate: (slide: SlideContent) => void
  editable?: boolean
  theme?: string
}

const themes = {
  dark: {
    background: 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950',
    text: 'text-white',
    accent: 'text-blue-400',
    card: 'bg-gray-900/50 border-gray-700'
  },
  blue: {
    background: 'bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950',
    text: 'text-white',
    accent: 'text-blue-300',
    card: 'bg-blue-900/50 border-blue-700'
  },
  purple: {
    background: 'bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950',
    text: 'text-white',
    accent: 'text-purple-300',
    card: 'bg-purple-900/50 border-purple-700'
  },
  green: {
    background: 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950',
    text: 'text-white',
    accent: 'text-emerald-300',
    card: 'bg-emerald-900/50 border-emerald-700'
  }
}

export function EnhancedEditableSlide({ slide, onUpdate, editable = true, theme = 'dark' }: EnhancedEditableSlideProps) {
  const [selectedTextBlock, setSelectedTextBlock] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [showFormatting, setShowFormatting] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const slideRef = useRef<HTMLDivElement>(null)

  const currentTheme = themes[theme as keyof typeof themes] || themes.dark

  const handleTextChange = (blockId: string, newText: string) => {
    const updatedBlocks = slide.textBlocks.map(block =>
      block.id === blockId ? { ...block, text: newText } : block
    )
    onUpdate({ ...slide, textBlocks: updatedBlocks })
  }

  const handleFormatChange = (blockId: string, formatting: Partial<TextBlock['formatting']>) => {
    const updatedBlocks = slide.textBlocks.map(block =>
      block.id === blockId 
        ? { ...block, formatting: { ...block.formatting, ...formatting } }
        : block
    )
    onUpdate({ ...slide, textBlocks: updatedBlocks })
  }

  const handlePositionChange = (blockId: string, position: Partial<TextBlock['position']>) => {
    const updatedBlocks = slide.textBlocks.map(block =>
      block.id === blockId 
        ? { ...block, position: { ...block.position, ...position } }
        : block
    )
    onUpdate({ ...slide, textBlocks: updatedBlocks })
  }

  const addTextBlock = (style: TextBlock['style'] = 'body') => {
    const newBlock: TextBlock = {
      id: Date.now().toString(),
      text: 'New text block',
      style,
      formatting: {
        bold: style === 'title',
        italic: false,
        underline: false,
        alignment: 'left',
        fontSize: style === 'title' ? 32 : style === 'body' ? 16 : 14,
        color: style === 'title' ? '#ffffff' : '#d1d5db'
      },
      position: {
        x: 50,
        y: 100 + slide.textBlocks.length * 60,
        width: 400,
        height: 40
      }
    }
    
    onUpdate({ ...slide, textBlocks: [...slide.textBlocks, newBlock] })
  }

  const deleteTextBlock = (blockId: string) => {
    const updatedBlocks = slide.textBlocks.filter(block => block.id !== blockId)
    onUpdate({ ...slide, textBlocks: updatedBlocks })
    setSelectedTextBlock(null)
  }

  const duplicateTextBlock = (blockId: string) => {
    const blockToDuplicate = slide.textBlocks.find(block => block.id === blockId)
    if (blockToDuplicate) {
      const newBlock: TextBlock = {
        ...blockToDuplicate,
        id: Date.now().toString(),
        position: {
          ...blockToDuplicate.position,
          x: blockToDuplicate.position.x + 20,
          y: blockToDuplicate.position.y + 20
        }
      }
      onUpdate({ ...slide, textBlocks: [...slide.textBlocks, newBlock] })
    }
  }

  const handleMouseDown = (e: React.MouseEvent, blockId: string) => {
    if (!editable) return
    
    setIsDragging(blockId)
    setSelectedTextBlock(blockId)
    
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !slideRef.current) return
    
    const slideRect = slideRef.current.getBoundingClientRect()
    const newX = e.clientX - slideRect.left - dragOffset.x
    const newY = e.clientY - slideRect.top - dragOffset.y
    
    handlePositionChange(isDragging, { x: Math.max(0, newX), y: Math.max(0, newY) })
  }

  const handleMouseUp = () => {
    setIsDragging(null)
  }

  const renderTextBlock = (block: TextBlock) => {
    const isSelected = selectedTextBlock === block.id
    const { formatting, position } = block
    
    const textStyle = {
      fontSize: `${formatting.fontSize}px`,
      color: formatting.color,
      fontWeight: formatting.bold ? 'bold' : 'normal',
      fontStyle: formatting.italic ? 'italic' : 'normal',
      textDecoration: formatting.underline ? 'underline' : 'none',
      textAlign: formatting.alignment as 'left' | 'center' | 'right',
      width: `${position.width}px`,
      minHeight: `${position.height}px`
    }

    return (
      <div
        key={block.id}
        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''} ${editable ? 'hover:ring-1 hover:ring-gray-400' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${position.width}px`,
          minHeight: `${position.height}px`
        }}
        onMouseDown={(e) => handleMouseDown(e, block.id)}
      >
        {editable ? (
          <textarea
            value={block.text}
            onChange={(e) => handleTextChange(block.id, e.target.value)}
            className="w-full h-full bg-transparent border-none resize-none focus:outline-none"
            style={textStyle}
            placeholder="Enter text..."
          />
        ) : (
          <div style={textStyle}>{block.text}</div>
        )}
        
        {isSelected && editable && (
          <div className="absolute -top-8 left-0 flex gap-1 bg-gray-800 rounded p-1 z-10">
            <button
              onClick={() => duplicateTextBlock(block.id)}
              className="p-1 text-gray-300 hover:text-white"
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={() => deleteTextBlock(block.id)}
              className="p-1 text-red-400 hover:text-red-300"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderFormattingToolbar = () => {
    if (!selectedTextBlock) return null
    
    const selectedBlock = slide.textBlocks.find(b => b.id === selectedTextBlock)
    if (!selectedBlock) return null

    const { formatting } = selectedBlock

    return (
      <div className="absolute top-4 left-4 bg-gray-900 border border-gray-700 rounded-lg p-3 z-20 shadow-xl">
        <h4 className="text-white text-sm font-semibold mb-3">Text Formatting</h4>
        
        {/* Style toggles */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => handleFormatChange(selectedTextBlock, { bold: !formatting.bold })}
            className={`p-2 rounded ${formatting.bold ? 'bg-blue-600' : 'bg-gray-700'} text-white hover:bg-blue-500`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleFormatChange(selectedTextBlock, { italic: !formatting.italic })}
            className={`p-2 rounded ${formatting.italic ? 'bg-blue-600' : 'bg-gray-700'} text-white hover:bg-blue-500`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleFormatChange(selectedTextBlock, { underline: !formatting.underline })}
            className={`p-2 rounded ${formatting.underline ? 'bg-blue-600' : 'bg-gray-700'} text-white hover:bg-blue-500`}
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex gap-2 mb-3">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => handleFormatChange(selectedTextBlock, { alignment: align })}
              className={`p-2 rounded ${formatting.alignment === align ? 'bg-blue-600' : 'bg-gray-700'} text-white hover:bg-blue-500`}
            >
              {align === 'left' && <AlignLeft className="w-4 h-4" />}
              {align === 'center' && <AlignCenter className="w-4 h-4" />}
              {align === 'right' && <AlignRight className="w-4 h-4" />}
            </button>
          ))}
        </div>

        {/* Font size */}
        <div className="mb-3">
          <label className="block text-sm text-gray-300 mb-2">Font Size</label>
          <input
            type="range"
            min="12"
            max="48"
            value={formatting.fontSize}
            onChange={(e) => handleFormatChange(selectedTextBlock, { fontSize: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-gray-400">{formatting.fontSize}px</div>
        </div>

        {/* Color picker */}
        <div className="mb-3">
          <label className="block text-sm text-gray-300 mb-2">Text Color</label>
          <div className="grid grid-cols-4 gap-2">
            {['#ffffff', '#d1d5db', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
              <button
                key={color}
                onClick={() => handleFormatChange(selectedTextBlock, { color })}
                className="w-6 h-6 rounded border-2 border-gray-600"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowFormatting(false)}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-[600px] rounded-lg ${currentTheme.background} ${currentTheme.card} overflow-hidden`}>
      {/* Slide canvas */}
      <div
        ref={slideRef}
        className="relative w-full h-full p-8"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => setSelectedTextBlock(null)}
      >
        {/* Chart rendering for chart slides */}
        {slide.type === 'chart' && slide.data && slide.data.length > 0 && (
          <div className="absolute top-20 left-8 right-8 bottom-20">
            <div className="h-full">
              <TremorAdvancedChart
                data={slide.data}
                title={slide.title}
                config={slide.chartConfig || {
                  type: (slide as any).chartType || 'bar',
                  colors: ['blue-500', 'green-500', 'purple-500', 'orange-500'],
                  showLegend: true,
                  showGradient: (slide as any).chartType === 'area',
                  showGrid: true,
                  showTooltip: true,
                  animation: true,
                  height: 80
                }}
                categories={(slide as any).categories}
                index={(slide as any).index}
                editable={editable}
                onConfigChange={(newConfig) => {
                  onUpdate({ ...slide, chartConfig: newConfig })
                }}
              />
            </div>
          </div>
        )}

        {/* Text blocks */}
        {slide.textBlocks.map(renderTextBlock)}
      </div>

      {/* Toolbar */}
      {editable && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => addTextBlock('title')}>
              <Type className="w-4 h-4 mr-1" />
              Title
            </Button>
            <Button size="sm" onClick={() => addTextBlock('body')}>
              <Plus className="w-4 h-4 mr-1" />
              Text
            </Button>
            <Button size="sm" onClick={() => addTextBlock('bullet')}>
              • Bullet
            </Button>
          </div>

          <div className="flex gap-2">
            {selectedTextBlock && (
              <Button 
                size="sm" 
                onClick={() => setShowFormatting(!showFormatting)}
                variant={showFormatting ? 'default' : 'secondary'}
              >
                <Palette className="w-4 h-4 mr-1" />
                Format
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Formatting toolbar */}
      {showFormatting && renderFormattingToolbar()}
    </div>
  )
}