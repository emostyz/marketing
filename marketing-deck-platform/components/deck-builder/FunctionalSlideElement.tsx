'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Image, BarChart3, RotateCw, Lock, Upload, Edit3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend
} from 'recharts'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'table' | 'video' | 'audio' | 'shape' | 'icon'
  position: { x: number; y: number; width: number; height: number; rotation: number }
  style: {
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    opacity?: number
    shadow?: boolean
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    color?: string
    textAlign?: 'left' | 'center' | 'right'
    textDecoration?: string
    backgroundImage?: string
    background?: string
    boxShadow?: string
    filter?: string
    textShadow?: string
    lineHeight?: number
    letterSpacing?: string
    padding?: number | string
    WebkitBackgroundClip?: string
    WebkitTextFillColor?: string
    backgroundClip?: string
    transform?: any
  }
  content: any
  layer: number
  locked: boolean
  hidden: boolean
  animations: any[]
}

interface FunctionalSlideElementProps {
  element: SlideElement
  isSelected: boolean
  isEditing: boolean
  onUpdate: (updates: Partial<SlideElement>) => void
  onStartEdit: () => void
  onStopEdit: () => void
  onSelect: () => void
  zoom: number
}

export function FunctionalSlideElement({
  element,
  isSelected,
  isEditing,
  onUpdate,
  onStartEdit,
  onStopEdit,
  onSelect,
  zoom
}: FunctionalSlideElementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [imageUploadHover, setImageUploadHover] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        onUpdate({
          content: {
            ...element.content,
            src: result,
            alt: file.name,
            originalName: file.name
          }
        })
      }
      reader.readAsDataURL(file)
    }
  }, [element.content, onUpdate])

  const handleChartDataUpdate = useCallback((newData: any[]) => {
    onUpdate({
      content: {
        ...element.content,
        data: newData
      }
    })
  }, [element.content, onUpdate])

  // Mouse event handlers for drag, resize, rotate
  const handleMouseDown = useCallback((e: React.MouseEvent, action: 'drag' | 'resize' | 'rotate', handle?: string) => {
    if (element.locked) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    
    setDragStart({ x: startX, y: startY })
    setElementStart({
      x: element.position.x,
      y: element.position.y,
      width: element.position.width,
      height: element.position.height
    })
    
    if (action === 'drag') {
      setIsDragging(true)
    } else if (action === 'resize') {
      setIsResizing(true)
      setResizeHandle(handle || null)
    } else if (action === 'rotate') {
      setIsRotating(true)
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      
      if (action === 'drag') {
        onUpdate({
          position: {
            ...element.position,
            x: Math.max(0, elementStart.x + deltaX / (zoom / 100)),
            y: Math.max(0, elementStart.y + deltaY / (zoom / 100))
          }
        })
      } else if (action === 'resize' && handle) {
        handleResize(handle, deltaX / (zoom / 100), deltaY / (zoom / 100))
      } else if (action === 'rotate') {
        handleRotate(deltaX, deltaY)
      }
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setIsRotating(false)
      setResizeHandle(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [element, zoom, onUpdate])

  const handleResize = useCallback((handle: string, deltaX: number, deltaY: number) => {
    const newPosition = { ...element.position }
    
    switch (handle) {
      case 'nw':
        newPosition.x = elementStart.x + deltaX
        newPosition.y = elementStart.y + deltaY
        newPosition.width = Math.max(20, elementStart.width - deltaX)
        newPosition.height = Math.max(20, elementStart.height - deltaY)
        break
      case 'ne':
        newPosition.y = elementStart.y + deltaY
        newPosition.width = Math.max(20, elementStart.width + deltaX)
        newPosition.height = Math.max(20, elementStart.height - deltaY)
        break
      case 'sw':
        newPosition.x = elementStart.x + deltaX
        newPosition.width = Math.max(20, elementStart.width - deltaX)
        newPosition.height = Math.max(20, elementStart.height + deltaY)
        break
      case 'se':
        newPosition.width = Math.max(20, elementStart.width + deltaX)
        newPosition.height = Math.max(20, elementStart.height + deltaY)
        break
      case 'n':
        newPosition.y = elementStart.y + deltaY
        newPosition.height = Math.max(20, elementStart.height - deltaY)
        break
      case 's':
        newPosition.height = Math.max(20, elementStart.height + deltaY)
        break
      case 'w':
        newPosition.x = elementStart.x + deltaX
        newPosition.width = Math.max(20, elementStart.width - deltaX)
        break
      case 'e':
        newPosition.width = Math.max(20, elementStart.width + deltaX)
        break
    }
    
    onUpdate({ position: newPosition })
  }, [element.position, elementStart, onUpdate])

  const handleRotate = useCallback((deltaX: number, deltaY: number) => {
    const centerX = elementStart.x + elementStart.width / 2
    const centerY = elementStart.y + elementStart.height / 2
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
    
    onUpdate({
      position: {
        ...element.position,
        rotation: (element.position.rotation + angle) % 360
      }
    })
  }, [element.position, elementStart, onUpdate])

  const renderTextElement = () => (
    <div
      className="w-full h-full p-2 outline-none cursor-text"
      style={{
        fontSize: element.style.fontSize || 16,
        fontFamily: element.style.fontFamily || 'Inter',
        fontWeight: element.style.fontWeight || 'normal',
        color: element.style.color || '#000000',
        textAlign: element.style.textAlign || 'left',
        textDecoration: element.style.textDecoration || 'none'
      }}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onDoubleClick={onStartEdit}
      onBlur={onStopEdit}
      onInput={(e) => {
        const target = e.target as HTMLDivElement
        onUpdate({
          content: {
            ...element.content,
            text: target.textContent || '',
            html: target.innerHTML
          }
        })
      }}
      dangerouslySetInnerHTML={{ 
        __html: element.content?.html || element.content?.text || 'Double click to edit text'
      }}
    />
  )

  const renderImageElement = () => (
    <div 
      className="w-full h-full relative group"
      onMouseEnter={() => setImageUploadHover(true)}
      onMouseLeave={() => setImageUploadHover(false)}
    >
      {element.content?.src ? (
        <>
          <img 
            src={element.content.src} 
            alt={element.content.alt || 'Uploaded image'}
            className="w-full h-full object-cover rounded"
            style={{ borderRadius: element.style.borderRadius || 0 }}
          />
          {imageUploadHover && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Change Image
              </Button>
            </div>
          )}
        </>
      ) : (
        <div 
          className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Click to add image</p>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )

  const renderChartElement = () => {
    const chartData = element.content?.data || [
      { name: 'Jan', value: 400 },
      { name: 'Feb', value: 300 },
      { name: 'Mar', value: 500 },
      { name: 'Apr', value: 280 },
      { name: 'May', value: 590 }
    ]

    const chartType = element.content?.type || 'bar'
    const colors = element.content?.colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']

    return (
      <div className="w-full h-full bg-white p-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={colors[0]} />
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={3} />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(element.position.width, element.position.height) / 4}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }

  const renderShapeElement = () => {
    const shapeType = element.content?.shape || 'rectangle'
    const fillColor = element.content?.fillColor || element.style.backgroundColor || '#3b82f6'
    
    const shapeStyles = {
      width: '100%',
      height: '100%',
      backgroundColor: fillColor,
      borderRadius: shapeType === 'circle' ? '50%' : element.style.borderRadius || 0,
      clipPath: shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
    }

    return <div style={shapeStyles} />
  }

  const renderTableElement = () => {
    const headers = element.content?.headers || ['Column 1', 'Column 2']
    const rows = element.content?.rows || [
      ['Row 1 Col 1', 'Row 1 Col 2'],
      ['Row 2 Col 1', 'Row 2 Col 2']
    ]

    return (
      <div className="w-full h-full overflow-auto">
        <table className="w-full h-full border-collapse">
          <thead>
            <tr>
              {headers.map((header: string, index: number) => (
                <th
                  key={index}
                  className="border border-gray-300 p-2 bg-gray-100 text-left font-semibold"
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newHeaders = [...headers]
                    newHeaders[index] = e.target.textContent || ''
                    onUpdate({
                      content: {
                        ...element.content,
                        headers: newHeaders
                      }
                    })
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: string[], rowIndex: number) => (
              <tr key={rowIndex}>
                {row.map((cell: string, cellIndex: number) => (
                  <td
                    key={cellIndex}
                    className="border border-gray-300 p-2"
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newRows = [...rows]
                      newRows[rowIndex][cellIndex] = e.target.textContent || ''
                      onUpdate({
                        content: {
                          ...element.content,
                          rows: newRows
                        }
                      })
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return renderTextElement()
      case 'image':
        return renderImageElement()
      case 'chart':
        return renderChartElement()
      case 'shape':
        return renderShapeElement()
      case 'table':
        return renderTableElement()
      default:
        return (
          <div className="w-full h-full bg-gray-100 border border-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Unsupported element type: {element.type}</span>
          </div>
        )
    }
  }

  if (element.hidden) return null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: element.style.opacity || 1, scale: 1 }}
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.position.width,
        height: element.position.height,
        transform: `rotate(${element.position.rotation}deg)`,
        zIndex: element.layer,
        cursor: element.locked ? 'not-allowed' : 'pointer',
        border: isSelected ? '2px solid #3b82f6' : `${element.style.borderWidth || 0}px solid ${element.style.borderColor || 'transparent'}`,
        borderRadius: element.style.borderRadius || 0,
        backgroundColor: element.type !== 'text' ? element.style.backgroundColor : 'transparent',
        boxShadow: element.style.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
      }}
      onClick={onSelect}
      onMouseDown={(e) => !isSelected && handleMouseDown(e, 'drag')}
      whileHover={!element.locked ? { scale: 1.01 } : {}}
      whileTap={!element.locked ? { scale: 0.99 } : {}}
    >
      {renderContent()}

      {/* Selection Handles */}
      {isSelected && !element.locked && (
        <>
          {/* Corner resize handles */}
          <div 
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-nw-resize hover:bg-blue-700 transition-colors" 
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'nw')}
          />
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-ne-resize hover:bg-blue-700 transition-colors" 
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'ne')}
          />
          <div 
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-sw-resize hover:bg-blue-700 transition-colors" 
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'sw')}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-se-resize hover:bg-blue-700 transition-colors" 
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'se')}
          />
          
          {/* Side resize handles */}
          <div 
            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-n-resize hover:bg-blue-700 transition-colors" 
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'n')}
          />
          <div 
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-s-resize hover:bg-blue-700 transition-colors" 
            onMouseDown={(e) => handleMouseDown(e, 'resize', 's')}
          />
          <div 
            className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-w-resize hover:bg-blue-700 transition-colors" 
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'w')}
          />
          <div 
            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-e-resize hover:bg-blue-700 transition-colors" 
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'e')}
          />
          
          {/* Rotation handle */}
          <div 
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-600 border border-white rounded-full cursor-grab hover:bg-green-700 transition-colors flex items-center justify-center"
            onMouseDown={(e) => handleMouseDown(e, 'rotate')}
          >
            <RotateCw className="w-2 h-2 text-white" />
          </div>
        </>
      )}

      {/* Lock indicator */}
      {element.locked && (
        <div className="absolute top-1 right-1 bg-gray-800 rounded p-1">
          <Lock className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Edit indicator for text */}
      {element.type === 'text' && isEditing && (
        <div className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          <Edit3 className="w-3 h-3 inline mr-1" />
          Editing
        </div>
      )}
    </motion.div>
  )
}