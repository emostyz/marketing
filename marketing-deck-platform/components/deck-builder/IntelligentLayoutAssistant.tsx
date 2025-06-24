'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Wand2, Layout, AlignCenter, Grid3X3, Layers, 
  Zap, Target, Lightbulb, CheckCircle, RefreshCw, 
  ArrowRight, Star, TrendingUp, Eye, Shuffle,
  MoreHorizontal, ChevronDown, Settings, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'react-hot-toast'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape' | 'video' | 'audio' | 'table' | 'icon' | 'line' | 'group'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  opacity: number
  zIndex: number
  locked: boolean
  visible: boolean
  content: any
  style: any
  animation?: any
  interactions?: any
}

interface LayoutSuggestion {
  id: string
  name: string
  description: string
  confidence: number
  preview: string
  category: 'balance' | 'hierarchy' | 'alignment' | 'spacing' | 'composition'
  elements: Partial<SlideElement>[]
  reasoning: string[]
  designPrinciples: string[]
}

interface IntelligentLayoutAssistantProps {
  elements: SlideElement[]
  canvasSize: { width: number; height: number }
  onApplyLayout: (elements: SlideElement[]) => void
  onSuggestionGenerated?: (suggestions: LayoutSuggestion[]) => void
  className?: string
}

// Layout templates based on design principles
const LAYOUT_TEMPLATES = {
  hero: {
    name: 'Hero Layout',
    description: 'Perfect for title slides with dominant visual',
    principles: ['Visual hierarchy', 'Focus point', 'Whitespace'],
    grid: { cols: 12, rows: 8 }
  },
  twoColumn: {
    name: 'Two Column',
    description: 'Balanced content presentation',
    principles: ['Balance', 'Comparison', 'Clear division'],
    grid: { cols: 12, rows: 8 }
  },
  dashboard: {
    name: 'Dashboard',
    description: 'Data-heavy layouts with multiple charts',
    principles: ['Information density', 'Scanability', 'Grouping'],
    grid: { cols: 12, rows: 8 }
  },
  storytelling: {
    name: 'Storytelling',
    description: 'Narrative flow with visual progression',
    principles: ['Flow', 'Progression', 'Emotional engagement'],
    grid: { cols: 12, rows: 8 }
  },
  minimal: {
    name: 'Minimal',
    description: 'Clean, focused design with lots of whitespace',
    principles: ['Simplicity', 'Focus', 'Breathing room'],
    grid: { cols: 12, rows: 8 }
  }
}

// Golden ratio and rule of thirds guides
const GOLDEN_RATIO = 1.618
const RULE_OF_THIRDS = [1/3, 2/3]

export function IntelligentLayoutAssistant({
  elements,
  canvasSize,
  onApplyLayout,
  onSuggestionGenerated,
  className = ''
}: IntelligentLayoutAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<LayoutSuggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'auto' | 'guided' | 'manual'>('auto')
  const [designGoal, setDesignGoal] = useState<'presentation' | 'dashboard' | 'story' | 'minimal'>('presentation')
  const [analysisScore, setAnalysisScore] = useState<{
    balance: number
    hierarchy: number
    alignment: number
    spacing: number
    overall: number
  } | null>(null)

  // Analyze current layout quality
  const analyzeLayout = useCallback(() => {
    const balance = calculateBalance(elements, canvasSize)
    const hierarchy = calculateHierarchy(elements)
    const alignment = calculateAlignment(elements)
    const spacing = calculateSpacing(elements, canvasSize)
    const overall = (balance + hierarchy + alignment + spacing) / 4

    return { balance, hierarchy, alignment, spacing, overall }
  }, [elements, canvasSize])

  // Generate intelligent layout suggestions
  const generateSuggestions = useCallback(async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI analysis with sophisticated algorithms
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newSuggestions: LayoutSuggestion[] = []
      
      // Analyze element types and content
      const hasText = elements.some(el => el.type === 'text')
      const hasCharts = elements.some(el => el.type === 'chart')
      const hasImages = elements.some(el => el.type === 'image')
      const elementCount = elements.length

      // Generate contextual suggestions
      if (elementCount === 0) {
        newSuggestions.push(createEmptyLayoutSuggestion())
      } else {
        // Balance suggestion
        if (analyzeLayout().balance < 70) {
          newSuggestions.push(createBalanceSuggestion(elements, canvasSize))
        }
        
        // Hierarchy suggestion
        if (hasText && analyzeLayout().hierarchy < 70) {
          newSuggestions.push(createHierarchySuggestion(elements, canvasSize))
        }
        
        // Golden ratio suggestion
        newSuggestions.push(createGoldenRatioSuggestion(elements, canvasSize))
        
        // Rule of thirds suggestion
        if (hasImages || hasCharts) {
          newSuggestions.push(createRuleOfThirdsSuggestion(elements, canvasSize))
        }
        
        // Template-based suggestions
        if (designGoal === 'dashboard' && hasCharts) {
          newSuggestions.push(createDashboardSuggestion(elements, canvasSize))
        }
        
        if (designGoal === 'presentation' && hasText) {
          newSuggestions.push(createPresentationSuggestion(elements, canvasSize))
        }
      }
      
      // Sort by confidence score
      newSuggestions.sort((a, b) => b.confidence - a.confidence)
      
      setSuggestions(newSuggestions.slice(0, 6)) // Show top 6 suggestions
      onSuggestionGenerated?.(newSuggestions)
      
      toast.success(`Generated ${newSuggestions.length} layout suggestions`)
    } catch (error) {
      toast.error('Failed to generate suggestions')
    } finally {
      setIsAnalyzing(false)
    }
  }, [elements, canvasSize, designGoal, analyzeLayout, onSuggestionGenerated])

  // Apply suggested layout
  const applySuggestion = useCallback((suggestion: LayoutSuggestion) => {
    const updatedElements = elements.map(element => {
      const suggestedElement = suggestion.elements.find(se => se.id === element.id)
      return suggestedElement ? { ...element, ...suggestedElement } : element
    })
    
    onApplyLayout(updatedElements)
    setSelectedSuggestion(suggestion.id)
    
    toast.success(`Applied ${suggestion.name} layout`)
  }, [elements, onApplyLayout])

  // Auto-generate suggestions when elements change
  useEffect(() => {
    if (elements.length > 0 && layoutMode === 'auto') {
      const timer = setTimeout(generateSuggestions, 1000)
      return () => clearTimeout(timer)
    }
  }, [elements, layoutMode, generateSuggestions])

  // Update analysis score
  useEffect(() => {
    const score = analyzeLayout()
    setAnalysisScore(score)
  }, [analyzeLayout])

  const currentScore = analysisScore?.overall || 0

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Layout Assistant</h3>
              <p className="text-sm text-gray-500">Intelligent design suggestions powered by AI</p>
            </div>
          </div>
          
          {/* Layout Score */}
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">Layout Score</div>
              <div className={`text-lg font-bold ${
                currentScore >= 80 ? 'text-green-600' :
                currentScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(currentScore)}%
              </div>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="4"
                  fill="transparent"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={currentScore >= 80 ? '#10b981' : currentScore >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - currentScore / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <select
              value={designGoal}
              onChange={(e) => setDesignGoal(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="presentation">Presentation</option>
              <option value="dashboard">Dashboard</option>
              <option value="story">Storytelling</option>
              <option value="minimal">Minimal</option>
            </select>

            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="auto">Auto Suggestions</option>
              <option value="guided">Guided Mode</option>
              <option value="manual">Manual Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={generateSuggestions}
              disabled={isAnalyzing}
              size="sm"
              className="bg-purple-500 hover:bg-purple-600"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Generate Ideas
            </Button>

            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </div>
        </div>
      </div>

      {/* Analysis Breakdown */}
      {analysisScore && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Layout Analysis</h4>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(analysisScore).filter(([key]) => key !== 'overall').map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-xs text-gray-500 mb-1 capitalize">{key}</div>
                <div className={`text-lg font-semibold ${
                  value >= 80 ? 'text-green-600' :
                  value >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(value)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <motion.div
                    className={`h-1.5 rounded-full ${
                      value >= 80 ? 'bg-green-500' :
                      value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions Grid */}
      <div className="p-4">
        {isAnalyzing ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-4 border-4 border-purple-200 border-t-purple-500 rounded-full"
            />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Layout</h4>
            <p className="text-sm text-gray-500">AI is evaluating design principles and generating suggestions...</p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Suggestions ({suggestions.length})</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  isSelected={selectedSuggestion === suggestion.id}
                  onApply={() => applySuggestion(suggestion)}
                  onPreview={() => setSelectedSuggestion(suggestion.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Layout className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Layout Analysis Yet</h4>
            <p className="text-sm text-gray-500 mb-4">
              Add some elements to your slide or click "Generate Ideas" to get started
            </p>
            <Button
              onClick={generateSuggestions}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Analyze Layout
            </Button>
          </div>
        )}
      </div>

      {/* Advanced Options */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 bg-gray-50"
          >
            <div className="p-4 space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Advanced Settings</h4>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => applyQuickFix('alignment')}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start"
                >
                  <AlignCenter className="w-4 h-4 mr-2" />
                  Auto-Align Elements
                </Button>
                
                <Button
                  onClick={() => applyQuickFix('spacing')}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Fix Spacing
                </Button>
                
                <Button
                  onClick={() => applyQuickFix('hierarchy')}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Improve Hierarchy
                </Button>
                
                <Button
                  onClick={() => applyQuickFix('balance')}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Balance Layout
                </Button>
              </div>

              {/* Layout Templates */}
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">Apply Template</h5>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(LAYOUT_TEMPLATES).map(([key, template]) => (
                    <Button
                      key={key}
                      onClick={() => applyTemplate(key)}
                      variant="outline"
                      size="sm"
                      className="text-xs p-2 h-auto flex-col"
                    >
                      <span className="font-medium">{template.name}</span>
                      <span className="text-gray-500 text-xs">{template.description}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  // Quick fix functions
  function applyQuickFix(type: 'alignment' | 'spacing' | 'hierarchy' | 'balance') {
    let updatedElements = [...elements]
    
    switch (type) {
      case 'alignment':
        updatedElements = autoAlignElements(updatedElements, canvasSize)
        break
      case 'spacing':
        updatedElements = improveSpacing(updatedElements, canvasSize)
        break
      case 'hierarchy':
        updatedElements = improveHierarchy(updatedElements)
        break
      case 'balance':
        updatedElements = balanceLayout(updatedElements, canvasSize)
        break
    }
    
    onApplyLayout(updatedElements)
    toast.success(`Applied ${type} improvements`)
  }

  function applyTemplate(templateKey: string) {
    const template = LAYOUT_TEMPLATES[templateKey as keyof typeof LAYOUT_TEMPLATES]
    const updatedElements = applyLayoutTemplate(elements, template, canvasSize)
    onApplyLayout(updatedElements)
    toast.success(`Applied ${template.name} template`)
  }
}

// Suggestion Card Component
interface SuggestionCardProps {
  suggestion: LayoutSuggestion
  isSelected: boolean
  onApply: () => void
  onPreview: () => void
}

function SuggestionCard({ suggestion, isSelected, onApply, onPreview }: SuggestionCardProps) {
  const categoryIcons = {
    balance: Target,
    hierarchy: Layers,
    alignment: AlignCenter,
    spacing: Grid3X3,
    composition: Layout
  }

  const CategoryIcon = categoryIcons[suggestion.category]

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected 
          ? 'border-purple-500 bg-purple-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={onPreview}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isSelected ? 'bg-purple-500' : 'bg-gray-100'
          }`}>
            <CategoryIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{suggestion.name}</h4>
            <p className="text-xs text-gray-500">{suggestion.description}</p>
          </div>
        </div>
        
        {/* Confidence Score */}
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-500" />
          <span className="text-xs font-medium text-gray-700">
            {Math.round(suggestion.confidence)}%
          </span>
        </div>
      </div>

      {/* Design Principles */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {suggestion.designPrinciples.slice(0, 2).map((principle, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
            >
              {principle}
            </span>
          ))}
          {suggestion.designPrinciples.length > 2 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{suggestion.designPrinciples.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Reasoning Preview */}
      <div className="mb-4">
        <p className="text-xs text-gray-600 line-clamp-2">
          {suggestion.reasoning[0]}
        </p>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onApply()
          }}
          size="sm"
          className="flex-1 bg-purple-500 hover:bg-purple-600"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Apply
        </Button>
        
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onPreview()
          }}
          variant="outline"
          size="sm"
        >
          <Eye className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  )
}

// Layout Analysis Functions
function calculateBalance(elements: SlideElement[], canvasSize: { width: number; height: number }): number {
  if (elements.length === 0) return 100

  const centerX = canvasSize.width / 2
  const centerY = canvasSize.height / 2
  
  let totalWeight = 0
  let weightedX = 0
  let weightedY = 0
  
  elements.forEach(element => {
    const weight = element.size.width * element.size.height
    const elementCenterX = element.position.x + element.size.width / 2
    const elementCenterY = element.position.y + element.size.height / 2
    
    totalWeight += weight
    weightedX += elementCenterX * weight
    weightedY += elementCenterY * weight
  })
  
  if (totalWeight === 0) return 100
  
  const balanceCenterX = weightedX / totalWeight
  const balanceCenterY = weightedY / totalWeight
  
  const deviationX = Math.abs(balanceCenterX - centerX) / centerX
  const deviationY = Math.abs(balanceCenterY - centerY) / centerY
  
  const balanceScore = Math.max(0, 100 - (deviationX + deviationY) * 100)
  
  return balanceScore
}

function calculateHierarchy(elements: SlideElement[]): number {
  if (elements.length === 0) return 100
  
  const textElements = elements.filter(el => el.type === 'text')
  if (textElements.length === 0) return 100
  
  // Check for clear size hierarchy
  const fontSizes = textElements.map(el => el.style.fontSize || 16).sort((a, b) => b - a)
  const hasGoodHierarchy = fontSizes.every((size, index) => 
    index === 0 || size < fontSizes[index - 1] * 0.9
  )
  
  // Check for z-index hierarchy
  const zIndices = elements.map(el => el.zIndex).sort((a, b) => b - a)
  const hasGoodLayering = zIndices.every((z, index) => 
    index === 0 || z <= zIndices[index - 1]
  )
  
  return (hasGoodHierarchy ? 50 : 0) + (hasGoodLayering ? 50 : 0)
}

function calculateAlignment(elements: SlideElement[]): number {
  if (elements.length <= 1) return 100
  
  let alignedPairs = 0
  let totalPairs = 0
  
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      totalPairs++
      
      const el1 = elements[i]
      const el2 = elements[j]
      
      // Check horizontal alignment
      const topAligned = Math.abs(el1.position.y - el2.position.y) < 5
      const centerAligned = Math.abs(
        (el1.position.y + el1.size.height / 2) - 
        (el2.position.y + el2.size.height / 2)
      ) < 5
      const bottomAligned = Math.abs(
        (el1.position.y + el1.size.height) - 
        (el2.position.y + el2.size.height)
      ) < 5
      
      // Check vertical alignment
      const leftAligned = Math.abs(el1.position.x - el2.position.x) < 5
      const verticalCenterAligned = Math.abs(
        (el1.position.x + el1.size.width / 2) - 
        (el2.position.x + el2.size.width / 2)
      ) < 5
      const rightAligned = Math.abs(
        (el1.position.x + el1.size.width) - 
        (el2.position.x + el2.size.width)
      ) < 5
      
      if (topAligned || centerAligned || bottomAligned || 
          leftAligned || verticalCenterAligned || rightAligned) {
        alignedPairs++
      }
    }
  }
  
  return totalPairs > 0 ? (alignedPairs / totalPairs) * 100 : 100
}

function calculateSpacing(elements: SlideElement[], canvasSize: { width: number; height: number }): number {
  if (elements.length <= 1) return 100
  
  const margins = {
    top: Math.min(...elements.map(el => el.position.y)),
    bottom: canvasSize.height - Math.max(...elements.map(el => el.position.y + el.size.height)),
    left: Math.min(...elements.map(el => el.position.x)),
    right: canvasSize.width - Math.max(...elements.map(el => el.position.x + el.size.width))
  }
  
  const minMargin = Math.min(...Object.values(margins))
  const maxMargin = Math.max(...Object.values(margins))
  
  // Good spacing has consistent margins and adequate breathing room
  const marginConsistency = 100 - Math.abs(maxMargin - minMargin) / canvasSize.width * 100
  const adequateMargins = Math.min(100, (minMargin / (canvasSize.width * 0.05)) * 100)
  
  return (marginConsistency + adequateMargins) / 2
}

// Layout Suggestion Generators
function createEmptyLayoutSuggestion(): LayoutSuggestion {
  return {
    id: 'empty-hero',
    name: 'Hero Layout',
    description: 'Perfect starting point for impactful presentations',
    confidence: 90,
    preview: '',
    category: 'composition',
    elements: [],
    reasoning: [
      'Empty canvas detected - suggesting a strong hero layout',
      'Hero layouts create immediate visual impact',
      'Perfect for title slides and key messages'
    ],
    designPrinciples: ['Visual Hierarchy', 'Focus Point', 'Whitespace']
  }
}

function createBalanceSuggestion(elements: SlideElement[], canvasSize: { width: number; height: number }): LayoutSuggestion {
  const centerX = canvasSize.width / 2
  const centerY = canvasSize.height / 2
  
  // Reposition elements for better balance
  const balancedElements = elements.map((element, index) => {
    const isEvenIndex = index % 2 === 0
    const offsetX = isEvenIndex ? -canvasSize.width * 0.15 : canvasSize.width * 0.15
    const offsetY = (index - elements.length / 2) * 60
    
    return {
      id: element.id,
      position: {
        x: centerX + offsetX - element.size.width / 2,
        y: centerY + offsetY - element.size.height / 2
      }
    }
  })
  
  return {
    id: 'balance-improvement',
    name: 'Balanced Composition',
    description: 'Redistribute elements for visual balance',
    confidence: 85,
    preview: '',
    category: 'balance',
    elements: balancedElements,
    reasoning: [
      'Current layout is unbalanced',
      'Redistributing elements around the visual center',
      'Creating symmetrical weight distribution'
    ],
    designPrinciples: ['Visual Balance', 'Symmetry', 'Proportion']
  }
}

function createHierarchySuggestion(elements: SlideElement[], canvasSize: { width: number; height: number }): LayoutSuggestion {
  const textElements = elements.filter(el => el.type === 'text')
  
  const hierarchyElements = textElements.map((element, index) => {
    const hierarchyLevel = index + 1
    const fontSize = Math.max(12, 32 - (hierarchyLevel - 1) * 6)
    const yPosition = canvasSize.height * 0.2 + index * 80
    
    return {
      id: element.id,
      position: {
        x: canvasSize.width * 0.1,
        y: yPosition
      },
      style: {
        ...element.style,
        fontSize,
        fontWeight: hierarchyLevel === 1 ? '700' : hierarchyLevel === 2 ? '600' : '400'
      }
    }
  })
  
  return {
    id: 'hierarchy-improvement',
    name: 'Clear Hierarchy',
    description: 'Establish clear information hierarchy',
    confidence: 80,
    preview: '',
    category: 'hierarchy',
    elements: hierarchyElements,
    reasoning: [
      'Text elements lack clear hierarchy',
      'Implementing size-based hierarchy',
      'Following typography best practices'
    ],
    designPrinciples: ['Typography Hierarchy', 'Information Order', 'Readability']
  }
}

function createGoldenRatioSuggestion(elements: SlideElement[], canvasSize: { width: number; height: number }): LayoutSuggestion {
  const goldenX = canvasSize.width / GOLDEN_RATIO
  const goldenY = canvasSize.height / GOLDEN_RATIO
  
  const goldenElements = elements.map((element, index) => {
    if (index === 0) {
      // Primary element at golden ratio point
      return {
        id: element.id,
        position: {
          x: goldenX - element.size.width / 2,
          y: goldenY - element.size.height / 2
        }
      }
    } else {
      // Secondary elements in supporting positions
      const angle = (index - 1) * (2 * Math.PI / (elements.length - 1))
      const radius = Math.min(canvasSize.width, canvasSize.height) * 0.2
      
      return {
        id: element.id,
        position: {
          x: goldenX + Math.cos(angle) * radius - element.size.width / 2,
          y: goldenY + Math.sin(angle) * radius - element.size.height / 2
        }
      }
    }
  })
  
  return {
    id: 'golden-ratio',
    name: 'Golden Ratio Layout',
    description: 'Apply golden ratio proportions for natural harmony',
    confidence: 75,
    preview: '',
    category: 'composition',
    elements: goldenElements,
    reasoning: [
      'Golden ratio creates natural visual harmony',
      'Positioning primary element at golden point',
      'Mathematical perfection in composition'
    ],
    designPrinciples: ['Golden Ratio', 'Natural Harmony', 'Mathematical Beauty']
  }
}

function createRuleOfThirdsSuggestion(elements: SlideElement[], canvasSize: { width: number; height: number }): LayoutSuggestion {
  const thirds = RULE_OF_THIRDS
  const intersectionPoints = [
    { x: canvasSize.width * thirds[0], y: canvasSize.height * thirds[0] },
    { x: canvasSize.width * thirds[1], y: canvasSize.height * thirds[0] },
    { x: canvasSize.width * thirds[0], y: canvasSize.height * thirds[1] },
    { x: canvasSize.width * thirds[1], y: canvasSize.height * thirds[1] }
  ]
  
  const ruleOfThirdsElements = elements.slice(0, 4).map((element, index) => {
    const point = intersectionPoints[index]
    return {
      id: element.id,
      position: {
        x: point.x - element.size.width / 2,
        y: point.y - element.size.height / 2
      }
    }
  })
  
  return {
    id: 'rule-of-thirds',
    name: 'Rule of Thirds',
    description: 'Position elements at rule of thirds intersections',
    confidence: 82,
    preview: '',
    category: 'composition',
    elements: ruleOfThirdsElements,
    reasoning: [
      'Rule of thirds creates dynamic composition',
      'Positioning elements at power points',
      'Professional photography principles applied'
    ],
    designPrinciples: ['Rule of Thirds', 'Dynamic Composition', 'Visual Interest']
  }
}

function createDashboardSuggestion(elements: SlideElement[], canvasSize: { width: number; height: number }): LayoutSuggestion {
  const charts = elements.filter(el => el.type === 'chart')
  const texts = elements.filter(el => el.type === 'text')
  
  const dashboardElements = []
  
  // Grid layout for charts
  const cols = Math.ceil(Math.sqrt(charts.length))
  const rows = Math.ceil(charts.length / cols)
  const chartWidth = (canvasSize.width * 0.8) / cols
  const chartHeight = (canvasSize.height * 0.7) / rows
  
  charts.forEach((chart, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    
    dashboardElements.push({
      id: chart.id,
      position: {
        x: canvasSize.width * 0.1 + col * chartWidth,
        y: canvasSize.height * 0.2 + row * chartHeight
      },
      size: {
        width: chartWidth * 0.9,
        height: chartHeight * 0.9
      }
    })
  })
  
  // Title at top
  if (texts.length > 0) {
    dashboardElements.push({
      id: texts[0].id,
      position: {
        x: canvasSize.width * 0.1,
        y: canvasSize.height * 0.05
      },
      style: {
        fontSize: 24,
        fontWeight: '700'
      }
    })
  }
  
  return {
    id: 'dashboard-layout',
    name: 'Dashboard Grid',
    description: 'Organize charts in a professional dashboard layout',
    confidence: 88,
    preview: '',
    category: 'composition',
    elements: dashboardElements,
    reasoning: [
      'Multiple charts detected',
      'Grid layout improves scanability',
      'Dashboard format for data presentation'
    ],
    designPrinciples: ['Information Design', 'Grid System', 'Data Visualization']
  }
}

function createPresentationSuggestion(elements: SlideElement[], canvasSize: { width: number; height: number }): LayoutSuggestion {
  const texts = elements.filter(el => el.type === 'text')
  const others = elements.filter(el => el.type !== 'text')
  
  const presentationElements = []
  
  // Title area
  if (texts.length > 0) {
    presentationElements.push({
      id: texts[0].id,
      position: {
        x: canvasSize.width * 0.1,
        y: canvasSize.height * 0.1
      },
      style: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'left'
      }
    })
  }
  
  // Content area
  if (texts.length > 1) {
    texts.slice(1).forEach((text, index) => {
      presentationElements.push({
        id: text.id,
        position: {
          x: canvasSize.width * 0.1,
          y: canvasSize.height * 0.3 + index * 60
        },
        style: {
          fontSize: 18,
          fontWeight: '400'
        }
      })
    })
  }
  
  // Supporting visuals on the right
  others.forEach((element, index) => {
    presentationElements.push({
      id: element.id,
      position: {
        x: canvasSize.width * 0.6,
        y: canvasSize.height * 0.2 + index * 100
      }
    })
  })
  
  return {
    id: 'presentation-layout',
    name: 'Presentation Format',
    description: 'Classic presentation layout with text and visuals',
    confidence: 85,
    preview: '',
    category: 'composition',
    elements: presentationElements,
    reasoning: [
      'Text and visual elements detected',
      'Left-aligned text for readability',
      'Supporting visuals positioned right'
    ],
    designPrinciples: ['Presentation Design', 'Text Hierarchy', 'Visual Support']
  }
}

// Helper functions for quick fixes
function autoAlignElements(elements: SlideElement[], canvasSize: { width: number; height: number }): SlideElement[] {
  // Simple center alignment
  return elements.map(element => ({
    ...element,
    position: {
      x: canvasSize.width / 2 - element.size.width / 2,
      y: element.position.y
    }
  }))
}

function improveSpacing(elements: SlideElement[], canvasSize: { width: number; height: number }): SlideElement[] {
  if (elements.length <= 1) return elements
  
  const sortedElements = [...elements].sort((a, b) => a.position.y - b.position.y)
  const spacing = canvasSize.height / (sortedElements.length + 1)
  
  return elements.map(element => {
    const index = sortedElements.findIndex(el => el.id === element.id)
    return {
      ...element,
      position: {
        x: element.position.x,
        y: spacing * (index + 1) - element.size.height / 2
      }
    }
  })
}

function improveHierarchy(elements: SlideElement[]): SlideElement[] {
  const textElements = elements.filter(el => el.type === 'text')
  const baseFontSize = 16
  
  return elements.map(element => {
    if (element.type === 'text') {
      const index = textElements.findIndex(el => el.id === element.id)
      const fontSize = baseFontSize + (textElements.length - index - 1) * 6
      
      return {
        ...element,
        style: {
          ...element.style,
          fontSize,
          fontWeight: index === 0 ? '700' : index === 1 ? '600' : '400'
        }
      }
    }
    return element
  })
}

function balanceLayout(elements: SlideElement[], canvasSize: { width: number; height: number }): SlideElement[] {
  const centerX = canvasSize.width / 2
  const centerY = canvasSize.height / 2
  
  return elements.map((element, index) => {
    const angle = (index / elements.length) * 2 * Math.PI
    const radius = Math.min(canvasSize.width, canvasSize.height) * 0.2
    
    return {
      ...element,
      position: {
        x: centerX + Math.cos(angle) * radius - element.size.width / 2,
        y: centerY + Math.sin(angle) * radius - element.size.height / 2
      }
    }
  })
}

function applyLayoutTemplate(elements: SlideElement[], template: any, canvasSize: { width: number; height: number }): SlideElement[] {
  // This would apply specific template layouts
  // For now, return elements as-is
  return elements
}