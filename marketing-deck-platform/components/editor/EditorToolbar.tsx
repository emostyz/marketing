'use client'

import React, { useState, useCallback } from 'react'
import {
  Undo2, Redo2, Copy, Clipboard, Trash2, RotateCcw,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Move, Square, Circle, Triangle, Type, Image, BarChart3,
  Lock, Unlock, Eye, EyeOff, Layers, Group, Ungroup,
  BringToFront, SendToBack, Plus, Grid, Palette,
  Save, Download, Settings, ZoomIn, ZoomOut, Hand,
  MousePointer, ArrowUp, ArrowDown, FlipHorizontal, FlipVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Toggle } from '@/components/ui/toggle'
import { Badge } from '@/components/ui/badge'
import { useHistory } from '@/stores/history-store'
import { toast } from 'react-hot-toast'

interface EditorToolbarProps {
  selectedElements: any[]
  onUpdateElements: (updates: any) => void
  onDeleteElements: (elementIds: string[]) => void
  onDuplicateElements: (elementIds: string[]) => void
  onGroupElements: (elementIds: string[]) => void
  onUngroupElements: (groupId: string) => void
  onAddElement: (type: string, position?: { x: number; y: number }) => void
  onSave: () => void
  onExport: (format: string) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  tool: string
  onToolChange: (tool: string) => void
  snapToGrid: boolean
  onSnapToGridChange: (enabled: boolean) => void
  showGrid: boolean
  onShowGridChange: (show: boolean) => void
  className?: string
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  disabled?: boolean
  active?: boolean
  tooltip: string
  size?: 'sm' | 'default'
  variant?: 'default' | 'outline' | 'ghost'
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon: Icon,
  onClick,
  disabled = false,
  active = false,
  tooltip,
  size = 'sm',
  variant = 'ghost'
}) => (
  <Button
    variant={active ? 'default' : variant}
    size={size}
    onClick={onClick}
    disabled={disabled}
    className={`w-8 h-8 p-0 ${active ? 'bg-blue-100 text-blue-700' : ''}`}
    title={tooltip}
  >
    <Icon className="w-4 h-4" />
  </Button>
)

const ToolbarGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`flex items-center gap-1 ${className}`}>
    {children}
  </div>
)

export function EditorToolbar({
  selectedElements,
  onUpdateElements,
  onDeleteElements,
  onDuplicateElements,
  onGroupElements,
  onUngroupElements,
  onAddElement,
  onSave,
  onExport,
  zoom,
  onZoomChange,
  tool,
  onToolChange,
  snapToGrid,
  onSnapToGridChange,
  showGrid,
  onShowGridChange,
  className = ''
}: EditorToolbarProps) {
  const { undo, redo, canUndo, canRedo } = useHistory()
  const [showColorPicker, setShowColorPicker] = useState(false)
  
  const hasSelection = selectedElements.length > 0
  const hasMultipleSelection = selectedElements.length > 1
  const allLocked = hasSelection && selectedElements.every(el => el.isLocked)
  const anyLocked = hasSelection && selectedElements.some(el => el.isLocked)

  // Action handlers
  const handleCopy = useCallback(() => {
    if (!hasSelection) return
    
    const serializedElements = JSON.stringify(selectedElements)
    navigator.clipboard.writeText(serializedElements)
    toast.success(`Copied ${selectedElements.length} element(s)`)
  }, [selectedElements, hasSelection])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      const elements = JSON.parse(text)
      
      if (Array.isArray(elements)) {
        // Add elements with offset
        elements.forEach((element, index) => {
          onAddElement(element.type, {
            x: element.position.x + 20,
            y: element.position.y + 20
          })
        })
        toast.success(`Pasted ${elements.length} element(s)`)
      }
    } catch (error) {
      toast.error('Failed to paste elements')
    }
  }, [onAddElement])

  const handleDelete = useCallback(() => {
    if (!hasSelection || anyLocked) return
    
    const elementIds = selectedElements.filter(el => !el.isLocked).map(el => el.id)
    onDeleteElements(elementIds)
    toast.success(`Deleted ${elementIds.length} element(s)`)
  }, [selectedElements, hasSelection, anyLocked, onDeleteElements])

  const handleDuplicate = useCallback(() => {
    if (!hasSelection) return
    
    const elementIds = selectedElements.map(el => el.id)
    onDuplicateElements(elementIds)
    toast.success(`Duplicated ${elementIds.length} element(s)`)
  }, [selectedElements, hasSelection, onDuplicateElements])

  const handleLock = useCallback(() => {
    if (!hasSelection) return
    
    const newLockState = !allLocked
    onUpdateElements({
      elementIds: selectedElements.map(el => el.id),
      updates: { isLocked: newLockState }
    })
    
    toast.success(`${newLockState ? 'Locked' : 'Unlocked'} ${selectedElements.length} element(s)`)
  }, [selectedElements, hasSelection, allLocked, onUpdateElements])

  const handleVisibility = useCallback(() => {
    if (!hasSelection) return
    
    const allVisible = selectedElements.every(el => !el.isHidden)
    onUpdateElements({
      elementIds: selectedElements.map(el => el.id),
      updates: { isHidden: allVisible }
    })
    
    toast.success(`${allVisible ? 'Hidden' : 'Shown'} ${selectedElements.length} element(s)`)
  }, [selectedElements, hasSelection, onUpdateElements])

  const handleAlignment = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!hasMultipleSelection) return
    
    const bounds = selectedElements.reduce((acc, el) => ({
      left: Math.min(acc.left, el.position.x),
      right: Math.max(acc.right, el.position.x + el.size.width),
      top: Math.min(acc.top, el.position.y),
      bottom: Math.max(acc.bottom, el.position.y + el.size.height)
    }), {
      left: Infinity, right: -Infinity,
      top: Infinity, bottom: -Infinity
    })

    const updates = selectedElements.map(el => {
      let newPosition = { ...el.position }
      
      switch (alignment) {
        case 'left':
          newPosition.x = bounds.left
          break
        case 'center':
          newPosition.x = bounds.left + (bounds.right - bounds.left) / 2 - el.size.width / 2
          break
        case 'right':
          newPosition.x = bounds.right - el.size.width
          break
        case 'top':
          newPosition.y = bounds.top
          break
        case 'middle':
          newPosition.y = bounds.top + (bounds.bottom - bounds.top) / 2 - el.size.height / 2
          break
        case 'bottom':
          newPosition.y = bounds.bottom - el.size.height
          break
      }
      
      return { elementId: el.id, updates: { position: newPosition } }
    })

    updates.forEach(update => {
      onUpdateElements({ 
        elementIds: [update.elementId], 
        updates: update.updates 
      })
    })

    toast.success(`Aligned ${selectedElements.length} elements`)
  }, [selectedElements, hasMultipleSelection, onUpdateElements])

  const handleArrange = useCallback((arrangement: 'front' | 'back' | 'forward' | 'backward') => {
    if (!hasSelection) return
    
    const updates = selectedElements.map(el => {
      let newZIndex = el.zIndex || 1
      
      switch (arrangement) {
        case 'front':
          newZIndex = 1000
          break
        case 'back':
          newZIndex = 1
          break
        case 'forward':
          newZIndex += 1
          break
        case 'backward':
          newZIndex = Math.max(1, newZIndex - 1)
          break
      }
      
      return { elementId: el.id, updates: { zIndex: newZIndex } }
    })

    updates.forEach(update => {
      onUpdateElements({ 
        elementIds: [update.elementId], 
        updates: update.updates 
      })
    })

    toast.success(`Moved ${selectedElements.length} element(s) ${arrangement}`)
  }, [selectedElements, hasSelection, onUpdateElements])

  const handleGroup = useCallback(() => {
    if (!hasMultipleSelection) return
    
    const elementIds = selectedElements.map(el => el.id)
    onGroupElements(elementIds)
    toast.success(`Grouped ${elementIds.length} elements`)
  }, [selectedElements, hasMultipleSelection, onGroupElements])

  const handleZoom = useCallback((direction: 'in' | 'out' | 'fit' | 'actual') => {
    let newZoom = zoom
    
    switch (direction) {
      case 'in':
        newZoom = Math.min(5, zoom * 1.2)
        break
      case 'out':
        newZoom = Math.max(0.1, zoom / 1.2)
        break
      case 'fit':
        newZoom = 1
        break
      case 'actual':
        newZoom = 1
        break
    }
    
    onZoomChange(newZoom)
  }, [zoom, onZoomChange])

  const predefinedColors = [
    '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
    '#ff0000', '#ff6600', '#ffcc00', '#66ff00', '#00ff66', '#00ffcc',
    '#0066ff', '#6600ff', '#cc00ff', '#ff0066'
  ]

  return (
    <div className={`
      fixed top-4 left-1/2 -translate-x-1/2 z-50 
      bg-white rounded-lg shadow-lg border border-gray-200 p-2 
      flex items-center gap-2 max-w-full overflow-x-auto
      ${className}
    `}>
      {/* File Operations */}
      <ToolbarGroup>
        <ToolbarButton
          icon={Save}
          onClick={onSave}
          tooltip="Save (⌘S)"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" title="Export">
              <Download className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => onExport('pdf')}
              >
                Export as PDF
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => onExport('png')}
              >
                Export as PNG
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => onExport('pptx')}
              >
                Export as PPTX
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </ToolbarGroup>

      <Separator orientation="vertical" className="h-6" />

      {/* Undo/Redo */}
      <ToolbarGroup>
        <ToolbarButton
          icon={Undo2}
          onClick={undo}
          disabled={!canUndo}
          tooltip="Undo (⌘Z)"
        />
        <ToolbarButton
          icon={Redo2}
          onClick={redo}
          disabled={!canRedo}
          tooltip="Redo (⌘⇧Z)"
        />
      </ToolbarGroup>

      <Separator orientation="vertical" className="h-6" />

      {/* Tools */}
      <ToolbarGroup>
        <ToolbarButton
          icon={MousePointer}
          onClick={() => onToolChange('select')}
          active={tool === 'select'}
          tooltip="Select Tool (V)"
        />
        <ToolbarButton
          icon={Hand}
          onClick={() => onToolChange('pan')}
          active={tool === 'pan'}
          tooltip="Pan Tool (Space)"
        />
      </ToolbarGroup>

      <Separator orientation="vertical" className="h-6" />

      {/* Add Elements */}
      <ToolbarGroup>
        <ToolbarButton
          icon={Type}
          onClick={() => onAddElement('text')}
          tooltip="Add Text (T)"
        />
        <ToolbarButton
          icon={Square}
          onClick={() => onAddElement('shape')}
          tooltip="Add Shape (R)"
        />
        <ToolbarButton
          icon={Image}
          onClick={() => onAddElement('image')}
          tooltip="Add Image (I)"
        />
        <ToolbarButton
          icon={BarChart3}
          onClick={() => onAddElement('chart')}
          tooltip="Add Chart (C)"
        />
      </ToolbarGroup>

      <Separator orientation="vertical" className="h-6" />

      {/* Element Actions */}
      <ToolbarGroup>
        <ToolbarButton
          icon={Copy}
          onClick={handleCopy}
          disabled={!hasSelection}
          tooltip="Copy (⌘C)"
        />
        <ToolbarButton
          icon={Clipboard}
          onClick={handlePaste}
          tooltip="Paste (⌘V)"
        />
        <ToolbarButton
          icon={Trash2}
          onClick={handleDelete}
          disabled={!hasSelection || anyLocked}
          tooltip="Delete (Delete)"
        />
      </ToolbarGroup>

      <Separator orientation="vertical" className="h-6" />

      {/* Alignment */}
      {hasMultipleSelection && (
        <>
          <ToolbarGroup>
            <ToolbarButton
              icon={AlignLeft}
              onClick={() => handleAlignment('left')}
              tooltip="Align Left"
            />
            <ToolbarButton
              icon={AlignCenter}
              onClick={() => handleAlignment('center')}
              tooltip="Align Center"
            />
            <ToolbarButton
              icon={AlignRight}
              onClick={() => handleAlignment('right')}
              tooltip="Align Right"
            />
          </ToolbarGroup>
          
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Arrange */}
      {hasSelection && (
        <>
          <ToolbarGroup>
            <ToolbarButton
              icon={BringToFront}
              onClick={() => handleArrange('front')}
              tooltip="Bring to Front"
            />
            <ToolbarButton
              icon={SendToBack}
              onClick={() => handleArrange('back')}
              tooltip="Send to Back"
            />
          </ToolbarGroup>
          
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Lock/Visibility */}
      {hasSelection && (
        <>
          <ToolbarGroup>
            <ToolbarButton
              icon={allLocked ? Unlock : Lock}
              onClick={handleLock}
              active={allLocked}
              tooltip={allLocked ? 'Unlock' : 'Lock'}
            />
            <ToolbarButton
              icon={selectedElements.every(el => !el.isHidden) ? EyeOff : Eye}
              onClick={handleVisibility}
              tooltip="Toggle Visibility"
            />
          </ToolbarGroup>
          
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Group/Ungroup */}
      {hasMultipleSelection && (
        <>
          <ToolbarGroup>
            <ToolbarButton
              icon={Group}
              onClick={handleGroup}
              tooltip="Group (⌘G)"
            />
            <ToolbarButton
              icon={Ungroup}
              onClick={() => {/* Handle ungroup */}}
              disabled={true}
              tooltip="Ungroup (⌘⇧G)"
            />
          </ToolbarGroup>
          
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* View Options */}
      <ToolbarGroup>
        <Toggle
          pressed={snapToGrid}
          onPressedChange={onSnapToGridChange}
          aria-label="Snap to Grid"
          className="w-8 h-8 p-0"
          title="Snap to Grid"
        >
          <Grid className="w-4 h-4" />
        </Toggle>
        
        <Toggle
          pressed={showGrid}
          onPressedChange={onShowGridChange}
          aria-label="Show Grid"
          className="w-8 h-8 p-0"
          title="Show Grid"
        >
          <Grid className="w-4 h-4" />
        </Toggle>
      </ToolbarGroup>

      <Separator orientation="vertical" className="h-6" />

      {/* Zoom */}
      <ToolbarGroup>
        <ToolbarButton
          icon={ZoomOut}
          onClick={() => handleZoom('out')}
          disabled={zoom <= 0.1}
          tooltip="Zoom Out (-)"
        />
        
        <Select
          value={Math.round(zoom * 100).toString()}
          onValueChange={(value) => onZoomChange(parseInt(value) / 100)}
        >
          <SelectTrigger className="w-20 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25%</SelectItem>
            <SelectItem value="50">50%</SelectItem>
            <SelectItem value="75">75%</SelectItem>
            <SelectItem value="100">100%</SelectItem>
            <SelectItem value="125">125%</SelectItem>
            <SelectItem value="150">150%</SelectItem>
            <SelectItem value="200">200%</SelectItem>
          </SelectContent>
        </Select>
        
        <ToolbarButton
          icon={ZoomIn}
          onClick={() => handleZoom('in')}
          disabled={zoom >= 5}
          tooltip="Zoom In (+)"
        />
      </ToolbarGroup>

      {/* Selection Counter */}
      {hasSelection && (
        <Badge variant="secondary" className="ml-2">
          {selectedElements.length} selected
        </Badge>
      )}
    </div>
  )
}

export default EditorToolbar