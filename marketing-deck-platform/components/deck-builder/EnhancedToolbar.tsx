'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MousePointer2, Type, Image, BarChart3, Table, Square,
  Circle, Triangle, Video, Mic, Palette, Layers, Grid,
  ZoomIn, ZoomOut, Undo, Redo, Save, Download, Share2,
  Play, Settings, Eye, Lock, Unlock, Copy, Trash2,
  RotateCw, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, ChevronDown, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface EnhancedToolbarProps {
  selectedTool: string
  onToolSelect: (tool: string) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onExport: () => void
  onShare: () => void
  onPreview: () => void
  showGrid: boolean
  onToggleGrid: () => void
  isAutoSaving: boolean
}

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V', category: 'selection' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T', category: 'content' },
  { id: 'image', icon: Image, label: 'Image', shortcut: 'I', category: 'content' },
  { id: 'chart', icon: BarChart3, label: 'Chart', shortcut: 'C', category: 'content', premium: true },
  { id: 'table', icon: Table, label: 'Table', shortcut: 'B', category: 'content' },
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R', category: 'shapes' },
  { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'O', category: 'shapes' },
  { id: 'triangle', icon: Triangle, label: 'Triangle', shortcut: 'P', category: 'shapes' },
  { id: 'video', icon: Video, label: 'Video', shortcut: 'M', category: 'media', premium: true },
  { id: 'audio', icon: Mic, label: 'Audio', shortcut: 'A', category: 'media', premium: true }
]

const zoomLevels = [25, 50, 75, 100, 125, 150, 200, 300, 400]

export function EnhancedToolbar({
  selectedTool,
  onToolSelect,
  zoom,
  onZoomChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onShare,
  onPreview,
  showGrid,
  onToggleGrid,
  isAutoSaving
}: EnhancedToolbarProps) {
  const [showZoomDropdown, setShowZoomDropdown] = useState(false)
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)

  const handleZoomChange = (newZoom: number) => {
    onZoomChange(newZoom)
    setShowZoomDropdown(false)
  }

  const renderToolButton = (tool: typeof tools[0]) => {
    const Icon = tool.icon
    const isSelected = selectedTool === tool.id
    const isHovered = hoveredTool === tool.id

    return (
      <Tooltip key={tool.id}>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative group p-3 rounded-xl transition-all duration-200 flex items-center justify-center
              ${isSelected
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300'
              }
            `}
            onClick={() => onToolSelect(tool.id)}
            onMouseEnter={() => setHoveredTool(tool.id)}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <Icon className="w-5 h-5" />
            
            {/* Premium badge */}
            {tool.premium && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-2 h-2 text-white" />
              </motion.div>
            )}

            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                layoutId="selected-tool"
                className="absolute inset-0 bg-blue-600 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            {/* Hover effect */}
            <AnimatePresence>
              {isHovered && !isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
                />
              )}
            </AnimatePresence>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-gray-900 text-white border-gray-700"
        >
          <div className="text-center">
            <div className="font-medium">{tool.label}</div>
            <div className="text-xs opacity-75 mt-1">
              Press <kbd className="bg-gray-800 px-1 py-0.5 rounded text-xs">{tool.shortcut}</kbd>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Tools */}
        <div className="flex items-center space-x-4">
          {/* Main tools */}
          <div className="flex items-center space-x-2">
            {tools.filter(t => t.category === 'selection').map(renderToolButton)}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Content tools */}
          <div className="flex items-center space-x-2">
            {tools.filter(t => t.category === 'content').map(renderToolButton)}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Shape tools */}
          <div className="flex items-center space-x-2">
            {tools.filter(t => t.category === 'shapes').map(renderToolButton)}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Media tools */}
          <div className="flex items-center space-x-2">
            {tools.filter(t => t.category === 'media').map(renderToolButton)}
          </div>
        </div>

        {/* Center - View controls */}
        <div className="flex items-center space-x-4">
          {/* Zoom controls */}
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoomChange(Math.max(25, zoom - 25))}
                  disabled={zoom <= 25}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowZoomDropdown(!showZoomDropdown)}
                className="min-w-[80px] justify-between"
              >
                {zoom}%
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>

              <AnimatePresence>
                {showZoomDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
                  >
                    {zoomLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() => handleZoomChange(level)}
                        className={`
                          block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors
                          ${zoom === level ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}
                        `}
                      >
                        {level}%
                      </button>
                    ))}
                    <Separator className="my-2" />
                    <button
                      onClick={() => handleZoomChange(100)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      Fit to window
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoomChange(Math.min(400, zoom + 25))}
                  disabled={zoom >= 400}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Grid toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={onToggleGrid}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid</TooltipContent>
          </Tooltip>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Undo/Redo */}
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  <Undo className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Undo <kbd className="ml-1">Ctrl+Z</kbd>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRedo}
                  disabled={!canRedo}
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Redo <kbd className="ml-1">Ctrl+Y</kbd>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Primary actions */}
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onPreview}>
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white relative"
                  disabled={isAutoSaving}
                >
                  {isAutoSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="ml-2">Save</span>
                  
                  {isAutoSaving && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
                    >
                      Auto-saving...
                    </motion.div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Save <kbd className="ml-1">Ctrl+S</kbd>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Bottom toolbar for selected element properties */}
      <AnimatePresence>
        {selectedTool !== 'select' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 bg-gray-50 px-6 py-3"
          >
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {tools.find(t => t.id === selectedTool)?.label} Tool Active
              </span>
              <Badge variant="secondary" className="text-xs">
                Click on canvas to add
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}