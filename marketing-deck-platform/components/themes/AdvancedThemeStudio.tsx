'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card as UICard } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  Palette, Eye, EyeOff, Settings, Download, Upload, RotateCcw,
  Type, Layout, Layers, Brush, Sparkles, Wand2, Target, Zap,
  ChevronDown, ChevronUp, Plus, Minus, Copy, Edit3, Save,
  Palette as PaletteIcon, Grid3X3, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Link, Image, Table, Database, FileText
} from 'lucide-react'

export interface ThemeConfig {
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  textSecondary: string
  borderColor: string
  shadowColor: string
  fontFamily: string
  fontSizes: {
    title: number
    subtitle: number
    body: number
    caption: number
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  borderRadius: {
    sm: number
    md: number
    lg: number
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
  animations: {
    duration: number
    easing: string
  }
  layout: {
    maxWidth: number
    padding: number
    margin: number
  }
}

// Professional Theme Presets
const THEME_PRESETS: Record<string, ThemeConfig> = {
  corporate: {
    name: 'Corporate Professional',
    primaryColor: '#1f77b4',
    secondaryColor: '#ff7f0e',
    accentColor: '#2ca02c',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8f9fa',
    textColor: '#1f2937',
    textSecondary: '#6b7280',
    borderColor: '#e5e7eb',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizes: { title: 32, subtitle: 24, body: 16, caption: 12 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    borderRadius: { sm: 4, md: 8, lg: 12 },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    animations: { duration: 300, easing: 'ease-in-out' },
    layout: { maxWidth: 1200, padding: 20, margin: 10 }
  },
  modern: {
    name: 'Modern Minimal',
    primaryColor: '#6366f1',
    secondaryColor: '#14b8a6',
    accentColor: '#f97316',
    backgroundColor: '#ffffff',
    surfaceColor: '#fafafa',
    textColor: '#0f172a',
    textSecondary: '#64748b',
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizes: { title: 28, subtitle: 20, body: 14, caption: 11 },
    spacing: { xs: 6, sm: 12, md: 20, lg: 28, xl: 36 },
    borderRadius: { sm: 6, md: 10, lg: 16 },
    shadows: {
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    animations: { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    layout: { maxWidth: 1000, padding: 24, margin: 12 }
  },
  elegant: {
    name: 'Elegant Classic',
    primaryColor: '#4f46e5',
    secondaryColor: '#059669',
    accentColor: '#dc2626',
    backgroundColor: '#ffffff',
    surfaceColor: '#f9fafb',
    textColor: '#111827',
    textSecondary: '#6b7280',
    borderColor: '#d1d5db',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    fontFamily: 'Georgia, serif',
    fontSizes: { title: 36, subtitle: 28, body: 18, caption: 14 },
    spacing: { xs: 8, sm: 16, md: 24, lg: 32, xl: 40 },
    borderRadius: { sm: 8, md: 12, lg: 16 },
    shadows: {
      sm: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      md: '0 8px 16px -4px rgba(0, 0, 0, 0.1)',
      lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    animations: { duration: 400, easing: 'ease-out' },
    layout: { maxWidth: 1400, padding: 32, margin: 16 }
  },
  vibrant: {
    name: 'Vibrant Creative',
    primaryColor: '#2563eb',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    surfaceColor: '#f0f9ff',
    textColor: '#1e293b',
    textSecondary: '#475569',
    borderColor: '#cbd5e1',
    shadowColor: 'rgba(59, 130, 246, 0.1)',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizes: { title: 30, subtitle: 22, body: 16, caption: 13 },
    spacing: { xs: 6, sm: 12, md: 18, lg: 24, xl: 30 },
    borderRadius: { sm: 8, md: 12, lg: 20 },
    shadows: {
      sm: '0 2px 8px 0 rgba(59, 130, 246, 0.1)',
      md: '0 8px 25px -3px rgba(59, 130, 246, 0.15)',
      lg: '0 25px 50px -12px rgba(59, 130, 246, 0.25)'
    },
    animations: { duration: 250, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
    layout: { maxWidth: 1100, padding: 20, margin: 10 }
  },
  dark: {
    name: 'Dark Professional',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b',
    backgroundColor: '#0f172a',
    surfaceColor: '#1e293b',
    textColor: '#f8fafc',
    textSecondary: '#cbd5e1',
    borderColor: '#334155',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizes: { title: 32, subtitle: 24, body: 16, caption: 12 },
    spacing: { xs: 6, sm: 12, md: 20, lg: 28, xl: 36 },
    borderRadius: { sm: 6, md: 10, lg: 16 },
    shadows: {
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
    },
    animations: { duration: 300, easing: 'ease-in-out' },
    layout: { maxWidth: 1200, padding: 24, margin: 12 }
  }
}

// Font Options
const FONT_OPTIONS = [
  { name: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' }
]

interface AdvancedThemeStudioProps {
  initialTheme?: Partial<ThemeConfig>
  onThemeChange?: (theme: ThemeConfig) => void
  onExport?: (theme: ThemeConfig) => void
  onImport?: (theme: ThemeConfig) => void
  className?: string
}

export function AdvancedThemeStudio({
  initialTheme,
  onThemeChange,
  onExport,
  onImport,
  className = ''
}: AdvancedThemeStudioProps) {
  const [theme, setTheme] = useState<ThemeConfig>({
    ...THEME_PRESETS.corporate,
    ...initialTheme
  })

  const [activeTab, setActiveTab] = useState('colors')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Apply preset theme
  const applyPreset = useCallback((presetName: string) => {
    const preset = THEME_PRESETS[presetName]
    if (preset) {
      setTheme(preset)
      onThemeChange?.(preset)
      toast.success(`Applied ${preset.name} theme`)
    }
  }, [onThemeChange])

  // Export theme
  const exportTheme = useCallback(() => {
    const themeData = JSON.stringify(theme, null, 2)
    const blob = new Blob([themeData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${theme.name.replace(/\s+/g, '_').toLowerCase()}_theme.json`
    a.click()
    URL.revokeObjectURL(url)
    onExport?.(theme)
    toast.success('Theme exported successfully')
  }, [theme, onExport])

  // Import theme
  const importTheme = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedTheme = JSON.parse(e.target?.result as string)
          setTheme(importedTheme)
          onThemeChange?.(importedTheme)
          onImport?.(importedTheme)
          toast.success('Theme imported successfully')
        } catch (error) {
          toast.error('Invalid theme file')
        }
      }
      reader.readAsText(file)
    }
  }, [onThemeChange, onImport])

  // Theme preview component
  const ThemePreview = useMemo(() => (
    <div 
      className="p-6 rounded-lg border"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        borderRadius: theme.borderRadius.md,
        boxShadow: theme.shadows.md,
        borderColor: theme.borderColor
      }}
    >
      <h3 style={{ fontSize: theme.fontSizes.title, color: theme.primaryColor }}>
        Theme Preview
      </h3>
      <p style={{ fontSize: theme.fontSizes.body, color: theme.textSecondary }}>
        This is how your theme will look in presentations
      </p>
      <div className="mt-4 space-y-2">
        <div 
          className="p-3 rounded"
          style={{ backgroundColor: theme.surfaceColor, borderColor: theme.borderColor }}
        >
          <span style={{ color: theme.secondaryColor }}>Secondary Color</span>
        </div>
        <div 
          className="p-3 rounded"
          style={{ backgroundColor: theme.accentColor, color: 'white' }}
        >
          Accent Color
        </div>
      </div>
    </div>
  ), [theme])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Advanced Theme Studio</h2>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Hide' : 'Preview'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="w-4 h-4" />
              {showAdvanced ? 'Basic' : 'Advanced'}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".json"
            onChange={importTheme}
            className="hidden"
            id="theme-import"
          />
          <label htmlFor="theme-import">
            <Button size="sm" variant="outline">
              <span>
                <Upload className="w-4 h-4 mr-1" />
                Import
              </span>
            </Button>
          </label>
          <Button size="sm" variant="outline" onClick={exportTheme}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Theme Presets */}
      <div>
        <h3 className="text-lg font-medium mb-3">Theme Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(THEME_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`p-4 rounded-lg border transition-all ${
                theme.name === preset.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex space-x-1 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.primaryColor }}
                />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.secondaryColor }}
                />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.accentColor }}
                />
              </div>
              <div className="text-sm font-medium">{preset.name}</div>
              <div className="text-xs text-gray-500">{preset.fontFamily.split(',')[0]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {previewMode && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {ThemePreview}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Advanced Customization */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Color Customization */}
            <div>
              <h3 className="text-lg font-medium mb-4">Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Primary Color</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => {
                        const newTheme = { ...theme, primaryColor: e.target.value }
                        setTheme(newTheme)
                        onThemeChange?.(newTheme)
                      }}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={theme.primaryColor}
                      onChange={(e) => {
                        const newTheme = { ...theme, primaryColor: e.target.value }
                        setTheme(newTheme)
                        onThemeChange?.(newTheme)
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Secondary Color</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => {
                        const newTheme = { ...theme, secondaryColor: e.target.value }
                        setTheme(newTheme)
                        onThemeChange?.(newTheme)
                      }}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={theme.secondaryColor}
                      onChange={(e) => {
                        const newTheme = { ...theme, secondaryColor: e.target.value }
                        setTheme(newTheme)
                        onThemeChange?.(newTheme)
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Accent Color</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => {
                        const newTheme = { ...theme, accentColor: e.target.value }
                        setTheme(newTheme)
                        onThemeChange?.(newTheme)
                      }}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={theme.accentColor}
                      onChange={(e) => {
                        const newTheme = { ...theme, accentColor: e.target.value }
                        setTheme(newTheme)
                        onThemeChange?.(newTheme)
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Background Color</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={theme.backgroundColor}
                      onChange={(e) => {
                        const newTheme = { ...theme, backgroundColor: e.target.value }
                        setTheme(newTheme)
                        onThemeChange?.(newTheme)
                      }}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={theme.backgroundColor}
                      onChange={(e) => {
                        const newTheme = { ...theme, backgroundColor: e.target.value }
                        setTheme(newTheme)
                        onThemeChange?.(newTheme)
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Text Color</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={theme.textColor}
                      onChange={(e) => {
                        const newTheme = { ...theme, textColor: e.target.value }
                        setTheme(newTheme)
                        onThemeChange?.(newTheme)
                      }}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={theme.textColor}
                      onChange={(e) => {
                        const newTheme = { ...theme, textColor: e.target.value }
                        setTheme(newTheme)
                        onThemeChange?.(newTheme)
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Border Color</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={theme.borderColor}
                      onChange={(e) => {
                        const newTheme = { ...theme, borderColor: e.target.value }
                        setTheme(newTheme)
                        onThemeChange?.(newTheme)
                      }}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={theme.borderColor}
                      onChange={(e) => {
                        const newTheme = { ...theme, borderColor: e.target.value }
                        setTheme(newTheme)
                        onThemeChange?.(newTheme)
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <h3 className="text-lg font-medium mb-4">Typography</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Font Family</label>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => {
                      const newTheme = { ...theme, fontFamily: e.target.value }
                      setTheme(newTheme)
                      onThemeChange?.(newTheme)
                    }}
                    className="w-full p-2 border border-gray-300 rounded bg-white"
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.value} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Title Size: {theme.fontSizes.title}px</label>
                  <input
                    type="range"
                    min="20"
                    max="48"
                    value={theme.fontSizes.title}
                    onChange={(e) => {
                      const newTheme = {
                        ...theme,
                        fontSizes: { ...theme.fontSizes, title: parseInt(e.target.value) }
                      }
                      setTheme(newTheme)
                      onThemeChange?.(newTheme)
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Subtitle Size: {theme.fontSizes.subtitle}px</label>
                  <input
                    type="range"
                    min="16"
                    max="36"
                    value={theme.fontSizes.subtitle}
                    onChange={(e) => {
                      const newTheme = {
                        ...theme,
                        fontSizes: { ...theme.fontSizes, subtitle: parseInt(e.target.value) }
                      }
                      setTheme(newTheme)
                      onThemeChange?.(newTheme)
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Body Size: {theme.fontSizes.body}px</label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={theme.fontSizes.body}
                    onChange={(e) => {
                      const newTheme = {
                        ...theme,
                        fontSizes: { ...theme.fontSizes, body: parseInt(e.target.value) }
                      }
                      setTheme(newTheme)
                      onThemeChange?.(newTheme)
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Spacing & Layout */}
            <div>
              <h3 className="text-lg font-medium mb-4">Spacing & Layout</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Border Radius: {theme.borderRadius.md}px</label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={theme.borderRadius.md}
                    onChange={(e) => {
                      const newTheme = {
                        ...theme,
                        borderRadius: { ...theme.borderRadius, md: parseInt(e.target.value) }
                      }
                      setTheme(newTheme)
                      onThemeChange?.(newTheme)
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Animation Duration: {theme.animations.duration}ms</label>
                  <input
                    type="range"
                    min="100"
                    max="800"
                    step="50"
                    value={theme.animations.duration}
                    onChange={(e) => {
                      const newTheme = {
                        ...theme,
                        animations: { ...theme.animations, duration: parseInt(e.target.value) }
                      }
                      setTheme(newTheme)
                      onThemeChange?.(newTheme)
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 