'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Copy, Trash2, RotateCcw, RotateCw, ArrowUp, ArrowDown, 
  Move, MousePointer, Square, Type, Image, BarChart3,
  Lock, Unlock, Eye, EyeOff, Settings, Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WorkingElementControlsProps {
  element: any
  isSelected: boolean
  isHovered: boolean
  onDuplicate: (elementId: string) => void
  onDelete: (elementId: string) => void
  onBringToFront: (elementId: string) => void
  onSendToBack: (elementId: string) => void
  onLock: (elementId: string, locked: boolean) => void
  onHide: (elementId: string, hidden: boolean) => void
  onRotate: (elementId: string, degrees: number) => void
  onEdit: (elementId: string) => void
  position: { x: number; y: number }
  size: { width: number; height: number }
}

const getElementIcon = (type: string) => {
  switch (type) {
    case 'text': return Type
    case 'image': return Image
    case 'shape': return Square
    case 'chart': return BarChart3
    default: return Square
  }
}

export default function WorkingElementControls({
  element,
  isSelected,
  isHovered,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack,
  onLock,
  onHide,
  onRotate,
  onEdit,
  position,
  size
}: WorkingElementControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleAction = useCallback((action: () => void, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    action()
  }, [])

  if (!isSelected && !isHovered) return null

  const ElementIcon = getElementIcon(element.type)
  
  return (
    <>
      {/* Selection Border */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute pointer-events-none"
        style={{
          left: position.x - 2,
          top: position.y - 2,
          width: size.width + 4,
          height: size.height + 4,
        }}
      >
        <div className={cn(
          "w-full h-full border-2 border-dashed rounded",
          isSelected ? "border-blue-500" : "border-blue-300"
        )} />
        
        {/* Corner resize handles */}
        {isSelected && (
          <>
            {/* Top-left */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-nw-resize" />
            {/* Top-right */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-ne-resize" />
            {/* Bottom-left */}
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-sw-resize" />
            {/* Bottom-right */}
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-se-resize" />
            
            {/* Edge handles */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-n-resize" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-s-resize" />
            <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-w-resize" />
            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-e-resize" />
          </>
        )}
      </motion.div>

      {/* Hover Controls */}
      <AnimatePresence>
        {(isSelected || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 pointer-events-auto"
            style={{
              left: position.x,
              top: position.y - 45,
            }}
          >
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
              {/* Element type indicator */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
                <ElementIcon className="w-3 h-3 text-gray-600" />
                <span className="text-xs text-gray-600 capitalize">{element.type}</span>
              </div>

              {/* Primary actions */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-blue-50"
                onClick={(e) => handleAction(() => onEdit(element.id), e)}
                title="Edit element"
              >
                <Settings className="w-3 h-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-green-50"
                onClick={(e) => handleAction(() => onDuplicate(element.id), e)}
                title="Duplicate (⌘+D)"
              >
                <Copy className="w-3 h-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-red-50"
                onClick={(e) => handleAction(() => onDelete(element.id), e)}
                title="Delete (Delete key)"
              >
                <Trash2 className="w-3 h-3" />
              </Button>

              {/* Layer controls */}
              <div className="w-px h-4 bg-gray-200 mx-1" />
              
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => handleAction(() => onBringToFront(element.id), e)}
                title="Bring to front"
              >
                <ArrowUp className="w-3 h-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => handleAction(() => onSendToBack(element.id), e)}
                title="Send to back"
              >
                <ArrowDown className="w-3 h-3" />
              </Button>

              {/* Advanced controls toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => handleAction(() => setShowAdvanced(!showAdvanced), e)}
                title="More options"
              >
                <Palette className={cn("w-3 h-3", showAdvanced && "text-blue-600")} />
              </Button>
            </div>

            {/* Advanced controls */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-1 flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1"
                >
                  {/* Rotation */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => handleAction(() => onRotate(element.id, -90), e)}
                    title="Rotate left"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => handleAction(() => onRotate(element.id, 90), e)}
                    title="Rotate right"
                  >
                    <RotateCw className="w-3 h-3" />
                  </Button>

                  <div className="w-px h-4 bg-gray-200 mx-1" />

                  {/* Lock/Unlock */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => handleAction(() => onLock(element.id, !element.locked), e)}
                    title={element.locked ? "Unlock element" : "Lock element"}
                  >
                    {element.locked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  </Button>

                  {/* Show/Hide */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => handleAction(() => onHide(element.id, !element.hidden), e)}
                    title={element.hidden ? "Show element" : "Hide element"}
                  >
                    {element.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move cursor indicator */}
      {isSelected && (
        <motion.div
          className="absolute pointer-events-none z-40"
          style={{
            left: position.x + size.width / 2 - 10,
            top: position.y + size.height / 2 - 10,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center opacity-75">
            <Move className="w-3 h-3 text-white" />
          </div>
        </motion.div>
      )}
    </>
  )
}