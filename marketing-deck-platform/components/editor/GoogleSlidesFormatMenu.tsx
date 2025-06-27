'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Type, Palette, 
  Grid3X3, Zap, ArrowUp, ArrowDown,
  RotateCcw, Copy, Scissors, ArrowRight,
  Square, Circle, Triangle, Minus, Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface FormatMenuProps {
  isOpen: boolean
  onClose: () => void
  selectedElements: any[]
  onFormatElements: (formatType: string, value?: any) => void
  position: { x: number; y: number }
}

interface FormatOption {
  id: string
  label: string
  icon: React.ComponentType<any>
  category: 'text' | 'alignment' | 'spacing' | 'borders' | 'arrange'
  hasSubmenu?: boolean
  submenu?: FormatOption[]
  shortcut?: string
  action?: string
}

const formatOptions: FormatOption[] = [
  // Text Formatting
  {
    id: 'text',
    label: 'Text',
    icon: Type,
    category: 'text',
    hasSubmenu: true,
    submenu: [
      { id: 'bold', label: 'Bold', icon: Bold, category: 'text', shortcut: '⌘+B', action: 'toggleBold' },
      { id: 'italic', label: 'Italic', icon: Italic, category: 'text', shortcut: '⌘+I', action: 'toggleItalic' },
      { id: 'underline', label: 'Underline', icon: Underline, category: 'text', shortcut: '⌘+U', action: 'toggleUnderline' },
    ]
  },
  
  // Alignment
  {
    id: 'align-indent',
    label: 'Align & indent',
    icon: AlignLeft,
    category: 'alignment',
    hasSubmenu: true,
    submenu: [
      { id: 'align-left', label: 'Align left', icon: AlignLeft, category: 'alignment', shortcut: '⌘+Shift+L', action: 'alignLeft' },
      { id: 'align-center', label: 'Align center', icon: AlignCenter, category: 'alignment', shortcut: '⌘+Shift+E', action: 'alignCenter' },
      { id: 'align-right', label: 'Align right', icon: AlignRight, category: 'alignment', shortcut: '⌘+Shift+R', action: 'alignRight' },
      { id: 'align-justify', label: 'Justify', icon: AlignJustify, category: 'alignment', action: 'alignJustify' },
    ]
  },

  // Line & Paragraph Spacing
  {
    id: 'line-spacing',
    label: 'Line & paragraph spacing',
    icon: Zap,
    category: 'spacing',
    hasSubmenu: true,
    submenu: [
      { id: 'line-1', label: 'Single', icon: Minus, category: 'spacing', action: 'setLineHeight:1' },
      { id: 'line-1.15', label: '1.15', icon: Minus, category: 'spacing', action: 'setLineHeight:1.15' },
      { id: 'line-1.5', label: '1.5', icon: Minus, category: 'spacing', action: 'setLineHeight:1.5' },
      { id: 'line-2', label: 'Double', icon: Minus, category: 'spacing', action: 'setLineHeight:2' },
    ]
  },

  // Borders & Lines
  {
    id: 'borders',
    label: 'Borders & lines',
    icon: Grid3X3,
    category: 'borders',
    hasSubmenu: true,
    submenu: [
      { id: 'border-all', label: 'All borders', icon: Grid3X3, category: 'borders', action: 'addBorder:all' },
      { id: 'border-top', label: 'Top border', icon: Minus, category: 'borders', action: 'addBorder:top' },
      { id: 'border-bottom', label: 'Bottom border', icon: Minus, category: 'borders', action: 'addBorder:bottom' },
      { id: 'border-left', label: 'Left border', icon: Minus, category: 'borders', action: 'addBorder:left' },
      { id: 'border-right', label: 'Right border', icon: Minus, category: 'borders', action: 'addBorder:right' },
      { id: 'border-none', label: 'No border', icon: Square, category: 'borders', action: 'removeBorder' },
    ]
  },

  // Clear Formatting
  {
    id: 'clear-format',
    label: 'Clear formatting',
    icon: RotateCcw,
    category: 'text',
    shortcut: '⌘+\\',
    action: 'clearFormatting'
  }
]

const colors = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
  '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
  '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
  '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'
]

export default function GoogleSlidesFormatMenu({ 
  isOpen, 
  onClose, 
  selectedElements, 
  onFormatElements, 
  position 
}: FormatMenuProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [activeColorPicker, setActiveColorPicker] = useState<'text' | 'background' | null>(null)

  const handleFormatAction = (action: string, value?: any) => {
    console.log('Format action:', action, 'Value:', value, 'Elements:', selectedElements.length)
    
    if (action.includes(':')) {
      const [actionType, actionValue] = action.split(':')
      onFormatElements(actionType, actionValue)
    } else {
      onFormatElements(action, value)
    }
    
    // Close menu after applying format (except for color picker)
    if (!action.includes('color')) {
      onClose()
    }
  }

  const handleColorChange = (color: string, type: 'text' | 'background') => {
    onFormatElements(type === 'text' ? 'textColor' : 'backgroundColor', color)
    setActiveColorPicker(null)
  }

  if (!isOpen) return null

  const hasSelectedElements = selectedElements.length > 0
  const hasTextElements = selectedElements.some(el => el.type === 'text')

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-80"
        style={{
          left: Math.min(position.x, window.innerWidth - 350),
          top: Math.min(position.y, window.innerHeight - 500)
        }}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Format</span>
            </div>
            <span className="text-xs text-gray-500">
              {hasSelectedElements ? `${selectedElements.length} selected` : 'No selection'}
            </span>
          </div>
        </div>

        {!hasSelectedElements ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 mb-2">
              <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select an element to format</p>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Format Toolbar */}
            {hasTextElements && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleFormatAction('toggleBold')}
                    title="Bold (⌘+B)"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleFormatAction('toggleItalic')}
                    title="Italic (⌘+I)"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleFormatAction('toggleUnderline')}
                    title="Underline (⌘+U)"
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6 mx-2" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleFormatAction('alignLeft')}
                    title="Align left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleFormatAction('alignCenter')}
                    title="Align center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleFormatAction('alignRight')}
                    title="Align right"
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>

                  <Separator orientation="vertical" className="h-6 mx-2" />

                  {/* Color buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => setActiveColorPicker(activeColorPicker === 'text' ? null : 'text')}
                  >
                    <div className="flex items-center gap-1">
                      <Type className="w-4 h-4" />
                      <div className="w-3 h-1 bg-black rounded"></div>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => setActiveColorPicker(activeColorPicker === 'background' ? null : 'background')}
                  >
                    <div className="flex items-center gap-1">
                      <Palette className="w-4 h-4" />
                      <div className="w-3 h-1 bg-yellow-400 rounded"></div>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {/* Color Picker */}
            <AnimatePresence>
              {activeColorPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-gray-100 overflow-hidden"
                >
                  <div className="p-3">
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      {activeColorPicker === 'text' ? 'Text color' : 'Background color'}
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                      {colors.map(color => (
                        <button
                          key={color}
                          className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(color, activeColorPicker)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Format Options */}
            <div className="max-h-80 overflow-y-auto">
              {formatOptions.map(option => {
                // Skip text options if no text elements are selected
                if (option.category === 'text' && !hasTextElements && option.id !== 'clear-format') {
                  return null
                }
                
                const Icon = option.icon
                const isActive = activeSubmenu === option.id
                
                return (
                  <div key={option.id}>
                    <button
                      onClick={() => {
                        if (option.hasSubmenu) {
                          setActiveSubmenu(isActive ? null : option.id)
                        } else {
                          handleFormatAction(option.action || option.id)
                        }
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors",
                        isActive && "bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-900">{option.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {option.shortcut && (
                          <span className="text-xs text-gray-400">{option.shortcut}</span>
                        )}
                        {option.hasSubmenu && (
                          <ArrowRight className={cn(
                            "w-3 h-3 text-gray-400 transition-transform",
                            isActive && "rotate-90"
                          )} />
                        )}
                      </div>
                    </button>

                    {/* Submenu */}
                    <AnimatePresence>
                      {isActive && option.submenu && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="bg-gray-50 overflow-hidden"
                        >
                          {option.submenu.map(subOption => {
                            const SubIcon = subOption.icon
                            return (
                              <button
                                key={subOption.id}
                                onClick={() => handleFormatAction(subOption.action || subOption.id)}
                                className="w-full flex items-center justify-between p-3 pl-10 text-left hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <SubIcon className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm text-gray-900">{subOption.label}</span>
                                </div>
                                {subOption.shortcut && (
                                  <span className="text-xs text-gray-400">{subOption.shortcut}</span>
                                )}
                              </button>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* Element Arrangement */}
            <div className="p-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-700 mb-2">Arrange</div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => handleFormatAction('bringToFront')}
                  title="Bring to front"
                >
                  <ArrowUp className="w-4 h-4 mr-1" />
                  Front
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => handleFormatAction('sendToBack')}
                  title="Send to back"
                >
                  <ArrowDown className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => handleFormatAction('duplicate')}
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-2 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Use keyboard shortcuts for faster formatting</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}