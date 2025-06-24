'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check, Sparkles, Zap, Globe, Layers, ArrowRight, ArrowLeft, Eye, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface DesignTemplate {
  id: string
  name: string
  category: 'executive' | 'creative' | 'tech' | 'minimal' | 'corporate' | 'startup'
  description: string
  preview: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  typography: {
    heading: string
    body: string
    accent: string
  }
  features: string[]
  popularity: number
  web3Style: boolean
  animations: string[]
  previewSlides: Array<{
    title: string
    elements: Array<{
      type: 'text' | 'shape' | 'gradient'
      content?: string
      style: any
    }>
  }>
}

const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'web3-gradient',
    name: 'Web3 Gradient',
    category: 'tech',
    description: 'Stunning gradient backgrounds with modern Web3 aesthetics',
    preview: '/templates/web3-gradient.jpg',
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#06B6D4',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
      text: '#F8FAFC'
    },
    typography: {
      heading: 'Inter',
      body: 'Inter',
      accent: 'JetBrains Mono'
    },
    features: ['Animated gradients', 'Glass morphism', '3D elements', 'Dynamic backgrounds'],
    popularity: 95,
    web3Style: true,
    animations: ['gradient-shift', 'float', 'glow', 'parallax'],
    previewSlides: [
      {
        title: 'Executive Summary',
        elements: [
          {
            type: 'gradient',
            style: {
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
              borderRadius: '20px',
              opacity: 0.8
            }
          }
        ]
      }
    ]
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    category: 'tech',
    description: 'Futuristic neon aesthetics with cyberpunk-inspired design',
    preview: '/templates/cyber-neon.jpg',
    colors: {
      primary: '#00F5FF',
      secondary: '#FF0080',
      accent: '#39FF14',
      background: '#0A0A0A',
      text: '#FFFFFF'
    },
    typography: {
      heading: 'Orbitron',
      body: 'Roboto',
      accent: 'Source Code Pro'
    },
    features: ['Neon glow effects', 'Grid overlays', 'Holographic elements', 'Scan lines'],
    popularity: 88,
    web3Style: true,
    animations: ['neon-pulse', 'scan', 'glitch', 'matrix'],
    previewSlides: []
  },
  {
    id: 'glass-morphism',
    name: 'Glass Morphism',
    category: 'minimal',
    description: 'Clean glass-like surfaces with frosted glass effects',
    preview: '/templates/glass-morphism.jpg',
    colors: {
      primary: '#667EEA',
      secondary: '#764BA2',
      accent: '#F093FB',
      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      text: '#FFFFFF'
    },
    typography: {
      heading: 'SF Pro Display',
      body: 'SF Pro Text',
      accent: 'SF Mono'
    },
    features: ['Frosted glass', 'Blur effects', 'Translucent layers', 'Subtle shadows'],
    popularity: 92,
    web3Style: true,
    animations: ['blur-shift', 'glass-break', 'refraction', 'float'],
    previewSlides: []
  },
  {
    id: 'executive-pro',
    name: 'Executive Pro',
    category: 'executive',
    description: 'Professional corporate design for C-level presentations',
    preview: '/templates/executive-pro.jpg',
    colors: {
      primary: '#1E40AF',
      secondary: '#7C3AED',
      accent: '#059669',
      background: '#FFFFFF',
      text: '#1F2937'
    },
    typography: {
      heading: 'Helvetica Neue',
      body: 'Helvetica Neue',
      accent: 'Arial'
    },
    features: ['Clean layouts', 'Data visualization', 'Corporate branding', 'Professional icons'],
    popularity: 89,
    web3Style: false,
    animations: ['slide-in', 'fade', 'scale', 'data-reveal'],
    previewSlides: []
  },
  {
    id: 'startup-dynamic',
    name: 'Startup Dynamic',
    category: 'startup',
    description: 'Energetic design perfect for pitch decks and funding rounds',
    preview: '/templates/startup-dynamic.jpg',
    colors: {
      primary: '#F59E0B',
      secondary: '#EF4444',
      accent: '#10B981',
      background: '#F9FAFB',
      text: '#111827'
    },
    typography: {
      heading: 'Montserrat',
      body: 'Open Sans',
      accent: 'Space Grotesk'
    },
    features: ['Bold typography', 'Vibrant colors', 'Growth charts', 'Impact metrics'],
    popularity: 85,
    web3Style: false,
    animations: ['bounce', 'grow', 'pulse', 'rocket'],
    previewSlides: []
  },
  {
    id: 'minimal-zen',
    name: 'Minimal Zen',
    category: 'minimal',
    description: 'Ultra-clean minimalist design focusing on content',
    preview: '/templates/minimal-zen.jpg',
    colors: {
      primary: '#374151',
      secondary: '#6B7280',
      accent: '#3B82F6',
      background: '#FFFFFF',
      text: '#111827'
    },
    typography: {
      heading: 'Inter',
      body: 'Inter',
      accent: 'IBM Plex Mono'
    },
    features: ['White space', 'Typography focus', 'Subtle accents', 'Clean lines'],
    popularity: 78,
    web3Style: false,
    animations: ['fade-in', 'type-writer', 'subtle-scale', 'line-draw'],
    previewSlides: []
  }
]

interface Props {
  selectedTemplate?: DesignTemplate
  onSelectTemplate: (template: DesignTemplate) => void
  nextStep: () => void
  prevStep: () => void
}

export const DesignTemplateStep: React.FC<Props> = ({
  selectedTemplate,
  onSelectTemplate,
  nextStep,
  prevStep
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<string | null>(null)

  const categories = [
    { id: 'all', name: 'All Templates', icon: <Layers /> },
    { id: 'tech', name: 'Tech & Web3', icon: <Zap /> },
    { id: 'executive', name: 'Executive', icon: <Star /> },
    { id: 'startup', name: 'Startup', icon: <Globe /> },
    { id: 'minimal', name: 'Minimal', icon: <Sparkles /> }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? DESIGN_TEMPLATES 
    : DESIGN_TEMPLATES.filter(t => t.category === selectedCategory)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="relative inline-block mb-6">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -inset-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-full opacity-20 blur-xl"
          />
          <Palette className="relative w-12 h-12 text-purple-400 mx-auto" />
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Choose Your Design Aesthetic
        </h1>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Select a stunning visual design that matches your brand and audience
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
              }`}
            >
              {React.cloneElement(category.icon as React.ReactElement<any>, { 
                className: 'w-4 h-4' 
              })}
              {category.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Templates Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setHoveredTemplate(template.id)}
              onHoverEnd={() => setHoveredTemplate(null)}
              className="relative group"
            >
              <Card 
                className={`relative overflow-hidden cursor-pointer transition-all duration-500 ${
                  selectedTemplate?.id === template.id 
                    ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-900/50 to-blue-900/50' 
                    : 'bg-gray-900/60 hover:bg-gray-800/60'
                } border-gray-700/50 backdrop-blur-sm`}
                onClick={() => onSelectTemplate(template)}
              >
                {/* Template Preview */}
                <div 
                  className="h-48 relative overflow-hidden"
                  style={{
                    background: template.colors.background.startsWith('linear-gradient') 
                      ? template.colors.background 
                      : template.colors.background
                  }}
                >
                  {/* Preview Content */}
                  <div className="absolute inset-4 space-y-3">
                    <div 
                      className="h-8 rounded"
                      style={{ 
                        background: `linear-gradient(90deg, ${template.colors.primary}, ${template.colors.secondary})`,
                        opacity: 0.9
                      }}
                    />
                    <div className="grid grid-cols-3 gap-2 h-20">
                      <div 
                        className="rounded"
                        style={{ 
                          backgroundColor: template.colors.accent,
                          opacity: 0.7
                        }}
                      />
                      <div 
                        className="col-span-2 rounded"
                        style={{ 
                          backgroundColor: template.colors.primary,
                          opacity: 0.5
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="flex-1 h-4 rounded"
                        style={{ 
                          backgroundColor: template.colors.secondary,
                          opacity: 0.6
                        }}
                      />
                      <div 
                        className="w-16 h-4 rounded"
                        style={{ 
                          backgroundColor: template.colors.accent,
                          opacity: 0.8
                        }}
                      />
                    </div>
                  </div>

                  {/* Web3 Badge */}
                  {template.web3Style && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full"
                    >
                      WEB3
                    </motion.div>
                  )}

                  {/* Popularity Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-full text-xs text-white">
                    <Star className="w-3 h-3 text-yellow-400" />
                    {template.popularity}%
                  </div>

                  {/* Hover Overlay */}
                  <AnimatePresence>
                    {hoveredTemplate === template.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center"
                      >
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewMode(template.id)
                          }}
                          className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium flex items-center gap-2 hover:bg-white/30 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Selection Indicator */}
                  {selectedTemplate?.id === template.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{template.name}</h3>
                    <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full">
                      {template.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-4">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.features.slice(0, 2).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                    {template.features.length > 2 && (
                      <span className="px-2 py-1 bg-gray-600/20 border border-gray-500/30 rounded text-gray-400 text-xs">
                        +{template.features.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Color Palette */}
                  <div className="flex gap-2">
                    {Object.entries(template.colors).slice(0, 4).map(([key, color]) => (
                      <div
                        key={key}
                        className="w-6 h-6 rounded-full border-2 border-gray-600"
                        style={{ 
                          backgroundColor: color.startsWith('linear-gradient') ? template.colors.primary : color 
                        }}
                        title={key}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-between items-center pt-6"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={prevStep} variant="outline" size="lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={nextStep}
            disabled={!selectedTemplate}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
          >
            Continue with {selectedTemplate?.name || 'Template'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewMode(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {DESIGN_TEMPLATES.find(t => t.id === previewMode)?.name} Preview
                </h3>
                <button
                  onClick={() => setPreviewMode(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Full preview would go here */}
              <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                Full template preview coming soon...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}