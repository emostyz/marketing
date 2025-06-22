'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Image, BarChart3, RotateCw, Lock, Upload, Edit3
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
  const [imageUploadHover, setImageUploadHover] = useState(false)
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
          {chartType === 'bar' && (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={colors[0]} />
            </BarChart>
          )}
          {chartType === 'line' && (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={3} />
            </LineChart>
          )}
          {chartType === 'pie' && (
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
                {chartData.map((entry, index) => (
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
      whileHover={!element.locked ? { scale: 1.01 } : {}}
      whileTap={!element.locked ? { scale: 0.99 } : {}}
    >
      {renderContent()}

      {/* Selection Handles */}
      {isSelected && !element.locked && (
        <>
          {/* Corner resize handles */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-se-resize" />
          
          {/* Side resize handles */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-n-resize" />
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-s-resize" />
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-w-resize" />
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-e-resize" />
          
          {/* Rotation handle */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-600 border border-white rounded-full cursor-grab flex items-center justify-center">
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