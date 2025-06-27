'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, Layers, Magic, Zap, Sparkles, Wand2, Brain, 
  Target, Settings, MoreHorizontal, ChevronDown, ChevronRight,
  Paintbrush, Grid, Ruler, AlignCenter, Move, RotateCcw,
  Eye, EyeOff, Lock, Unlock, Copy, Trash2, ArrowUp, ArrowDown,
  MousePointer, Hand, Type, Image, BarChart3, Shapes,
  Lightbulb, Star, Heart, Bookmark, Flag, Award, Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface PerfectAdvancedFeaturesProps {
  selectedElement?: string | null
  selectedElements?: string[]
  currentSlide?: any
  slides?: any[]
  onAddElement?: (type: string, position?: { x: number; y: number }) => void
  onUpdateElement?: (elementId: string, updates: any) => void
  onGenerateContent?: (type: 'text' | 'chart' | 'layout') => void
  onApplyTemplate?: (templateId: string) => void
  onSmartAlign?: (type: 'horizontal' | 'vertical' | 'distribute') => void
  onAutoLayout?: () => void
  onMagicResize?: () => void
  className?: string
}

export default function PerfectAdvancedFeatures({
  selectedElement,
  selectedElements = [],
  currentSlide,
  slides = [],
  onAddElement,
  onUpdateElement,
  onGenerateContent,
  onApplyTemplate,
  onSmartAlign,
  onAutoLayout,
  onMagicResize,
  className
}: PerfectAdvancedFeaturesProps) {
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [smartMode, setSmartMode] = useState(true)
  const [magicWandActive, setMagicWandActive] = useState(false)

  // AI-Powered Smart Features
  const smartFeatures = [
    {
      id: 'auto-design',
      name: 'Auto Design',
      description: 'AI automatically improves slide design',
      icon: Magic,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/30',
      action: () => onAutoLayout?.()
    },
    {
      id: 'smart-content',
      name: 'Smart Content',
      description: 'Generate intelligent text and insights',
      icon: Brain,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/30',
      action: () => onGenerateContent?.('text')
    },
    {
      id: 'chart-wizard',
      name: 'Chart Wizard',
      description: 'AI recommends perfect chart types',
      icon: BarChart3,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30',
      action: () => onGenerateContent?.('chart')
    },
    {
      id: 'layout-magic',
      name: 'Layout Magic',
      description: 'Perfect element positioning',
      icon: Sparkles,
      color: 'text-amber-400',
      bgColor: 'bg-amber-900/20',
      borderColor: 'border-amber-500/30',
      action: () => onGenerateContent?.('layout')
    }
  ]

  // Professional Tools
  const professionalTools = [
    {
      id: 'smart-align',
      name: 'Smart Align',
      description: 'Perfectly align selected elements',
      icon: AlignCenter,
      disabled: selectedElements.length < 2,
      action: () => onSmartAlign?.('horizontal')
    },
    {
      id: 'magic-resize',
      name: 'Magic Resize',
      description: 'Optimal sizing for elements',
      icon: Move,
      disabled: !selectedElement,
      action: () => onMagicResize?.()
    },
    {
      id: 'auto-spacing',
      name: 'Auto Spacing',
      description: 'Perfect spacing distribution',
      icon: Grid,
      disabled: selectedElements.length < 3,
      action: () => onSmartAlign?.('distribute')
    }
  ]

  // Style Presets
  const stylePresets = [
    {
      id: 'executive',
      name: 'Executive',
      description: 'Clean, professional styling',
      preview: 'bg-gradient-to-r from-slate-900 to-slate-700',
      styles: {
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
        fontSize: '18px',
        fontWeight: '500'
      }
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Bold, modern design',
      preview: 'bg-gradient-to-r from-purple-900 to-blue-900',
      styles: {
        backgroundColor: '#7c3aed',
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '20px',
        fontWeight: '600'
      }
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple, clean aesthetics',
      preview: 'bg-gradient-to-r from-gray-50 to-gray-100',
      styles: {
        backgroundColor: '#ffffff',
        color: '#374151',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        fontWeight: '400'
      }
    },
    {
      id: 'tech',
      name: 'Tech',
      description: 'Modern, futuristic look',
      preview: 'bg-gradient-to-r from-cyan-900 to-teal-900',
      styles: {
        backgroundColor: '#0f172a',
        color: '#06b6d4',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '14px',
        fontWeight: '500'
      }
    }
  ]

  // Quick Actions
  const quickActions = [
    {
      id: 'add-text',
      name: 'Add Text',
      icon: Type,
      shortcut: 'T',
      action: () => onAddElement?.('text')
    },
    {
      id: 'add-image',
      name: 'Add Image',
      icon: Image,
      shortcut: 'I',
      action: () => onAddElement?.('image')
    },
    {
      id: 'add-chart',
      name: 'Add Chart',
      icon: BarChart3,
      shortcut: 'C',
      action: () => onAddElement?.('chart')
    },
    {
      id: 'add-shape',
      name: 'Add Shape',
      icon: Shapes,
      shortcut: 'S',
      action: () => onAddElement?.('shape')
    }
  ]

  const handlePanelToggle = (panelId: string) => {
    setActivePanel(activePanel === panelId ? null : panelId)
  }

  const handleStylePresetApply = (preset: any) => {
    if (selectedElement) {
      onUpdateElement?.(selectedElement, { style: preset.styles })
    }
  }

  const handleMagicWand = () => {
    setMagicWandActive(true)
    // Simulate AI magic
    setTimeout(() => {
      setMagicWandActive(false)
      onAutoLayout?.()
    }, 2000)
  }

  return (
    <TooltipProvider>
      <Card className={cn("w-80 bg-gray-900/95 border-gray-700 shadow-xl", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              Perfect Tools
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs text-purple-400 border-purple-500/30">
                AI-Powered
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMagicWand}
                disabled={magicWandActive}
                className={cn(
                  "h-7 w-7 p-0 transition-all duration-300",
                  magicWandActive 
                    ? "text-purple-400 animate-pulse" 
                    : "text-gray-400 hover:text-purple-400"
                )}
              >
                <Sparkles className={cn("w-4 h-4", magicWandActive && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Smart Features Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-400" />
                AI Features
              </h3>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  smartMode ? "bg-green-400 animate-pulse" : "bg-gray-600"
                )} />
                <span className="text-xs text-gray-400">
                  {smartMode ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {smartFeatures.map((feature) => (
                <Tooltip key={feature.id} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={feature.action}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        feature.bgColor,
                        feature.borderColor,
                        "hover:border-opacity-60 hover:bg-opacity-80"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <feature.icon className={cn("w-4 h-4", feature.color)} />
                        <span className="text-xs font-medium text-white">
                          {feature.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-tight">
                        {feature.description}
                      </p>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Click to activate {feature.name}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Quick Actions
            </h3>

            <div className="flex gap-2">
              {quickActions.map((action) => (
                <Tooltip key={action.id} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 h-auto py-2",
                        "border-gray-600 text-gray-300 hover:border-blue-500/50 hover:text-blue-400",
                        "hover:bg-blue-900/20 transition-all duration-200"
                      )}
                    >
                      <action.icon className="w-4 h-4" />
                      <span className="text-xs">{action.shortcut}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {action.name} (Press {action.shortcut})
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Professional Tools */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Pro Tools
            </h3>

            <div className="space-y-2">
              {professionalTools.map((tool) => (
                <Button
                  key={tool.id}
                  variant="outline"
                  size="sm"
                  onClick={tool.action}
                  disabled={tool.disabled}
                  className={cn(
                    "w-full justify-between border-gray-600 text-gray-300",
                    "hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-900/20",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <tool.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{tool.name}</span>
                  </div>
                  {tool.disabled && (
                    <Badge variant="secondary" className="text-xs px-1">
                      {selectedElements.length < 2 ? 'Select 2+' : 'Select 1+'}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Style Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" />
                Style Presets
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePanelToggle('styles')}
                className="h-6 w-6 p-0 text-gray-400 hover:text-pink-400"
              >
                {activePanel === 'styles' ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>

            <AnimatePresence>
              {activePanel === 'styles' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    {stylePresets.map((preset) => (
                      <motion.div
                        key={preset.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleStylePresetApply(preset)}
                        className="flex items-center gap-3 p-2 rounded-lg border border-gray-700 cursor-pointer hover:border-pink-500/50 hover:bg-pink-900/10 transition-all duration-200"
                      >
                        <div className={cn(
                          "w-8 h-8 rounded border border-gray-600",
                          preset.preview
                        )} />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-white">
                            {preset.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {preset.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status & Info */}
          <div className="pt-2 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>AI Ready</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{currentSlide?.elements?.length || 0} elements</span>
                {selectedElements.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{selectedElements.length} selected</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}