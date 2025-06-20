'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  RotateCw, Move, Maximize2, Lock, Unlock,
  Eye, EyeOff, Link, Volume2, Play, Image as ImageIcon, BarChart3
} from 'lucide-react'
import { ExcelLevelChart } from '@/components/charts/ExcelLevelChart'

interface SlideElement {
  id: string
  type: 'text' | 'shape' | 'image' | 'chart' | 'table' | 'smartart' | 'video' | 'audio'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  locked: boolean
  grouped?: string
  content?: string
  style: any
  shapeType?: string
  src?: string
  alt?: string
  chartData?: any[]
  chartConfig?: any
  tableData?: string[][]
  tableHeaders?: string[]
  link?: any
}

interface SlideElementRendererProps {
  element: SlideElement
  isSelected: boolean
  onSelect: (elementId: string, addToSelection: boolean) => void
  onUpdate: (updates: Partial<SlideElement>) => void
  onContextMenu: (e: React.MouseEvent) => void
  zoom: number
  showGuides: boolean
}

export function SlideElementRenderer({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onContextMenu,
  zoom,
  showGuides
}: SlideElementRendererProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0, rotation: 0 })
  
  const elementRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Handle mouse down for dragging, resizing, or rotating
  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize' | 'rotate', handle?: string) => {
    e.stopPropagation()
    
    if (element.locked) return
    
    onSelect(element.id, e.ctrlKey || e.metaKey)
    
    const rect = elementRef.current?.getBoundingClientRect()
    if (!rect) return
    
    setDragStart({ x: e.clientX, y: e.clientY })
    setElementStart({ 
      x: element.x, 
      y: element.y, 
      width: element.width, 
      height: element.height,
      rotation: element.rotation 
    })
    
    switch (action) {
      case 'drag':
        setIsDragging(true)
        break
      case 'resize':
        setIsResizing(true)
        break
      case 'rotate':
        setIsRotating(true)
        break
    }
  }

  // Handle mouse move for drag, resize, or rotate
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing && !isRotating) return
      
      const deltaX = (e.clientX - dragStart.x) / zoom
      const deltaY = (e.clientY - dragStart.y) / zoom
      
      if (isDragging) {
        onUpdate({
          x: Math.max(0, elementStart.x + deltaX),
          y: Math.max(0, elementStart.y + deltaY)
        })
      } else if (isResizing) {
        // Handle resize based on which handle is being dragged
        const newWidth = Math.max(20, elementStart.width + deltaX)
        const newHeight = Math.max(20, elementStart.height + deltaY)
        onUpdate({
          width: newWidth,
          height: newHeight
        })
      } else if (isRotating) {
        // Calculate rotation based on mouse position relative to element center
        const centerX = elementStart.x + elementStart.width / 2
        const centerY = elementStart.y + elementStart.height / 2
        const angle = Math.atan2(e.clientY / zoom - centerY, e.clientX / zoom - centerX) * 180 / Math.PI
        onUpdate({ rotation: angle })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setIsRotating(false)
    }

    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, isRotating, dragStart, elementStart, zoom, onUpdate])

  // Handle double-click for editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (element.type === 'text' && !element.locked) {
      setIsEditing(true)
    }
  }

  // Render element content based on type
  const renderElementContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <TextElement
            element={element}
            isEditing={isEditing}
            onEdit={setIsEditing}
            onUpdate={onUpdate}
          />
        )
      
      case 'shape':
        return (
          <ShapeElement
            element={element}
            onUpdate={onUpdate}
          />
        )
      
      case 'image':
        return (
          <ImageElement
            element={element}
            onUpdate={onUpdate}
          />
        )
      
      case 'chart':
        return (
          <ChartElement
            element={element}
            onUpdate={onUpdate}
          />
        )
      
      case 'table':
        return (
          <TableElement
            element={element}
            onUpdate={onUpdate}
          />
        )
      
      case 'video':
        return (
          <VideoElement
            element={element}
            onUpdate={onUpdate}
          />
        )
      
      case 'audio':
        return (
          <AudioElement
            element={element}
            onUpdate={onUpdate}
          />
        )
      
      default:
        return (
          <div className="w-full h-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-sm">
            Unknown Element Type
          </div>
        )
    }
  }

  return (
    <motion.div
      ref={elementRef}
      className={`absolute cursor-move select-none ${isSelected ? 'z-50' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
        transformOrigin: 'center'
      }}
      onMouseDown={(e) => handleMouseDown(e, 'drag')}
      onDoubleClick={handleDoubleClick}
      onContextMenu={onContextMenu}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Element Content */}
      <div 
        ref={contentRef}
        className="w-full h-full relative"
        style={{
          backgroundColor: element.style.backgroundColor,
          borderColor: element.style.borderColor,
          borderWidth: element.style.borderWidth,
          borderStyle: element.style.borderStyle,
          borderRadius: element.style.borderRadius,
          boxShadow: element.style.shadow?.enabled 
            ? `${element.style.shadow.offsetX}px ${element.style.shadow.offsetY}px ${element.style.shadow.blur}px ${element.style.shadow.spread}px ${element.style.shadow.color}`
            : 'none',
          overflow: 'hidden'
        }}
      >
        {renderElementContent()}

        {/* Link indicator */}
        {element.link && (
          <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
            <Link className="w-3 h-3" />
          </div>
        )}

        {/* Lock indicator */}
        {element.locked && (
          <div className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1">
            <Lock className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Selection Handles */}
      {isSelected && !element.locked && (
        <>
          {/* Corner resize handles */}
          {['nw', 'ne', 'sw', 'se'].map((corner) => (
            <div
              key={corner}
              className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-sm cursor-nw-resize shadow-md"
              style={{
                top: corner.includes('n') ? -6 : undefined,
                bottom: corner.includes('s') ? -6 : undefined,
                left: corner.includes('w') ? -6 : undefined,
                right: corner.includes('e') ? -6 : undefined,
                cursor: `${corner}-resize`
              }}
              onMouseDown={(e) => handleMouseDown(e, 'resize', corner)}
            />
          ))}

          {/* Edge resize handles */}
          {['n', 'e', 's', 'w'].map((edge) => (
            <div
              key={edge}
              className="absolute bg-blue-500 border border-white rounded-sm shadow-md"
              style={{
                width: edge === 'n' || edge === 's' ? '24px' : '3px',
                height: edge === 'e' || edge === 'w' ? '24px' : '3px',
                top: edge === 'n' ? '-6px' : edge === 's' ? undefined : '50%',
                bottom: edge === 's' ? '-6px' : undefined,
                left: edge === 'w' ? '-6px' : edge === 'e' ? undefined : '50%',
                right: edge === 'e' ? '-6px' : undefined,
                transform: (edge === 'n' || edge === 's') ? 'translateX(-50%)' : 
                          (edge === 'e' || edge === 'w') ? 'translateY(-50%)' : 'none',
                cursor: edge === 'n' || edge === 's' ? 'ns-resize' : 'ew-resize'
              }}
              onMouseDown={(e) => handleMouseDown(e, 'resize', edge)}
            />
          ))}

          {/* Rotation handle */}
          <div
            className="absolute w-4 h-4 bg-green-500 border-2 border-white rounded-full cursor-grab shadow-md flex items-center justify-center"
            style={{
              top: -25,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'rotate')}
          >
            <RotateCw className="w-2 h-2 text-white" />
          </div>

          {/* Selection border */}
          <div className="absolute inset-0 border-2 border-blue-500 border-dashed pointer-events-none" />

          {/* Move cursor indicator */}
          {isDragging && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
              {Math.round(element.x)}, {Math.round(element.y)}
            </div>
          )}

          {/* Size indicator */}
          {isResizing && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
              {Math.round(element.width)} × {Math.round(element.height)}
            </div>
          )}

          {/* Rotation indicator */}
          {isRotating && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
              {Math.round(element.rotation)}°
            </div>
          )}
        </>
      )}

      {/* Alignment guides */}
      {showGuides && isSelected && (isDragging || isResizing) && (
        <AlignmentGuides
          element={element}
          zoom={zoom}
        />
      )}
    </motion.div>
  )
}

// Individual element type components
function TextElement({ element, isEditing, onEdit, onUpdate }: any) {
  const [content, setContent] = useState(element.content || '')

  const handleBlur = () => {
    onEdit(false)
    onUpdate({ content })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleBlur()
    }
    if (e.key === 'Escape') {
      setContent(element.content || '')
      onEdit(false)
    }
  }

  return (
    <div className="w-full h-full p-2 overflow-hidden">
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full h-full resize-none border-none outline-none bg-transparent"
          style={{
            fontSize: element.style.fontSize,
            fontFamily: element.style.fontFamily,
            fontWeight: element.style.fontWeight,
            fontStyle: element.style.fontStyle,
            textDecoration: element.style.textDecoration,
            color: element.style.color,
            textAlign: element.style.textAlign,
            lineHeight: element.style.lineHeight,
            letterSpacing: element.style.letterSpacing
          }}
        />
      ) : (
        <div
          className="w-full h-full cursor-text flex"
          style={{
            fontSize: element.style.fontSize,
            fontFamily: element.style.fontFamily,
            fontWeight: element.style.fontWeight,
            fontStyle: element.style.fontStyle,
            textDecoration: element.style.textDecoration,
            color: element.style.color,
            textAlign: element.style.textAlign,
            lineHeight: element.style.lineHeight,
            letterSpacing: element.style.letterSpacing,
            alignItems: element.style.verticalAlign === 'top' ? 'flex-start' :
                        element.style.verticalAlign === 'bottom' ? 'flex-end' : 'center',
            whiteSpace: 'pre-wrap'
          }}
        >
          <div style={{ width: '100%' }}>
            {element.content || 'Double-click to edit text'}
          </div>
        </div>
      )}
    </div>
  )
}

function ShapeElement({ element, onUpdate }: any) {
  const renderShape = () => {
    const style = {
      width: '100%',
      height: '100%',
      backgroundColor: element.style.backgroundColor,
      borderColor: element.style.borderColor,
      borderWidth: element.style.borderWidth,
      borderStyle: element.style.borderStyle
    }

    switch (element.shapeType) {
      case 'circle':
        return <div style={{ ...style, borderRadius: '50%' }} />
      
      case 'triangle':
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${element.width / 2}px solid transparent`,
              borderRight: `${element.width / 2}px solid transparent`,
              borderBottom: `${element.height}px solid ${element.style.backgroundColor}`
            }}
          />
        )
      
      case 'arrow':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <path
              d="M20 20 L60 20 L60 10 L90 30 L60 50 L60 40 L20 40 Z"
              fill={element.style.backgroundColor}
              stroke={element.style.borderColor}
              strokeWidth={element.style.borderWidth}
            />
          </svg>
        )
      
      case 'star':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <path
              d="M50 10 L61 35 L90 35 L69 56 L80 90 L50 75 L20 90 L31 56 L10 35 L39 35 Z"
              fill={element.style.backgroundColor}
              stroke={element.style.borderColor}
              strokeWidth={element.style.borderWidth}
            />
          </svg>
        )
      
      default: // rectangle
        return <div style={{ ...style, borderRadius: element.style.borderRadius }} />
    }
  }

  return renderShape()
}

function ImageElement({ element, onUpdate }: any) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onUpdate({ src: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {element.src ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          )}
          {hasError ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm">Failed to load image</div>
              </div>
            </div>
          ) : (
            <img
              src={element.src}
              alt={element.alt || 'Image'}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                filter: element.filters ? `
                  brightness(${element.filters.brightness}%) 
                  contrast(${element.filters.contrast}%) 
                  saturate(${element.filters.saturation}%) 
                  blur(${element.filters.blur}px) 
                  sepia(${element.filters.sepia}%)
                ` : 'none'
              }}
            />
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center cursor-pointer">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <div className="text-sm text-gray-500">Click to add image</div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ChartElement({ element, onUpdate }: any) {
  if (!element.chartData || element.chartData.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <div className="text-sm">Chart Placeholder</div>
          <div className="text-xs">Configure chart data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ExcelLevelChart
        data={element.chartData}
        chartId={element.id}
        title={element.chartConfig?.title}
        initialConfig={element.chartConfig}
        onUpdate={(config) => onUpdate({ chartConfig: config })}
        enableFullEditing={true}
      />
    </div>
  )
}

function TableElement({ element, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState<{ row: number, col: number } | null>(null)
  const [editValue, setEditValue] = useState('')

  const data = element.tableData || [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']]
  const headers = element.tableHeaders || data[0]

  const handleCellEdit = (row: number, col: number, value: string) => {
    const newData = [...data]
    newData[row][col] = value
    onUpdate({ tableData: newData })
    setIsEditing(null)
  }

  const addRow = () => {
    const newData = [...data, new Array(data[0]?.length || 2).fill('')]
    onUpdate({ tableData: newData })
  }

  const addColumn = () => {
    const newData = data.map((row: any[]) => [...row, ''])
    onUpdate({ tableData: newData })
  }

  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full h-full border-collapse">
        <thead>
          <tr>
            {headers.map((header: string, colIndex: number) => (
              <th
                key={colIndex}
                className="border border-gray-300 bg-gray-50 p-2 text-left font-semibold"
                style={{ fontSize: '12px' }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row: any[], rowIndex: number) => (
            <tr key={rowIndex}>
              {row.map((cell: string, colIndex: number) => (
                <td
                  key={colIndex}
                  className="border border-gray-300 p-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setIsEditing({ row: rowIndex + 1, col: colIndex })
                    setEditValue(cell)
                  }}
                  style={{ fontSize: '11px' }}
                >
                  {isEditing?.row === rowIndex + 1 && isEditing?.col === colIndex ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleCellEdit(rowIndex + 1, colIndex, editValue)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCellEdit(rowIndex + 1, colIndex, editValue)
                        }
                        if (e.key === 'Escape') {
                          setIsEditing(null)
                        }
                      }}
                      autoFocus
                      className="w-full bg-transparent border-none outline-none"
                    />
                  ) : (
                    cell || 'Click to edit'
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VideoElement({ element, onUpdate }: any) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="w-full h-full bg-black flex items-center justify-center relative">
      {element.src ? (
        <>
          <video
            src={element.src}
            className="w-full h-full object-cover"
            controls={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <button
                onClick={() => setIsPlaying(true)}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-4 transition-all"
              >
                <Play className="w-8 h-8 text-black" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-white">
          <Play className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <div className="text-sm">Video Placeholder</div>
          <div className="text-xs text-gray-400">Click to add video</div>
        </div>
      )}
    </div>
  )
}

function AudioElement({ element, onUpdate }: any) {
  return (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
      {element.src ? (
        <audio src={element.src} controls className="w-full" />
      ) : (
        <div className="text-center text-white">
          <Volume2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <div className="text-sm">Audio Placeholder</div>
          <div className="text-xs text-gray-400">Click to add audio</div>
        </div>
      )}
    </div>
  )
}

function AlignmentGuides({ element, zoom }: any) {
  // This would render alignment guides when dragging/resizing
  // Implementation would detect nearby elements and show snap lines
  return null
}