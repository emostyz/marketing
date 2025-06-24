'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Palette, Check } from 'lucide-react'

interface Theme {
  id: string
  name: string
  description: string
  background: string
  primary: string
  secondary: string
  accent: string
  text: string
  preview: string
}

const themes: Theme[] = [
  {
    id: 'dark',
    name: 'Midnight Professional',
    description: 'Dark theme perfect for executive presentations',
    background: 'from-gray-950 via-gray-900 to-gray-950',
    primary: '#ffffff',
    secondary: '#d1d5db',
    accent: '#3b82f6',
    text: '#ffffff',
    preview: 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
  },
  {
    id: 'blue',
    name: 'Ocean Executive',
    description: 'Professional blue theme for corporate presentations',
    background: 'from-blue-950 via-blue-900 to-blue-950',
    primary: '#ffffff',
    secondary: '#bfdbfe',
    accent: '#60a5fa',
    text: '#ffffff',
    preview: 'bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950'
  },
  {
    id: 'purple',
    name: 'Innovation Purple',
    description: 'Creative purple theme for innovative presentations',
    background: 'from-purple-950 via-purple-900 to-purple-950',
    primary: '#ffffff',
    secondary: '#ddd6fe',
    accent: '#a78bfa',
    text: '#ffffff',
    preview: 'bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950'
  },
  {
    id: 'green',
    name: 'Growth Emerald',
    description: 'Fresh green theme for growth and sustainability',
    background: 'from-emerald-950 via-emerald-900 to-emerald-950',
    primary: '#ffffff',
    secondary: '#a7f3d0',
    accent: '#34d399',
    text: '#ffffff',
    preview: 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950'
  },
  {
    id: 'red',
    name: 'Bold Impact',
    description: 'Strong red theme for high-impact presentations',
    background: 'from-red-950 via-red-900 to-red-950',
    primary: '#ffffff',
    secondary: '#fecaca',
    accent: '#f87171',
    text: '#ffffff',
    preview: 'bg-gradient-to-br from-red-950 via-red-900 to-red-950'
  },
  {
    id: 'orange',
    name: 'Energy Orange',
    description: 'Vibrant orange theme for energetic presentations',
    background: 'from-orange-950 via-orange-900 to-orange-950',
    primary: '#ffffff',
    secondary: '#fed7aa',
    accent: '#fb923c',
    text: '#ffffff',
    preview: 'bg-gradient-to-br from-orange-950 via-orange-900 to-orange-950'
  },
  {
    id: 'teal',
    name: 'Tech Teal',
    description: 'Modern teal theme for technology presentations',
    background: 'from-teal-950 via-teal-900 to-teal-950',
    primary: '#ffffff',
    secondary: '#99f6e4',
    accent: '#2dd4bf',
    text: '#ffffff',
    preview: 'bg-gradient-to-br from-teal-950 via-teal-900 to-teal-950'
  },
  {
    id: 'indigo',
    name: 'Corporate Indigo',
    description: 'Professional indigo theme for corporate settings',
    background: 'from-indigo-950 via-indigo-900 to-indigo-950',
    primary: '#ffffff',
    secondary: '#c7d2fe',
    accent: '#818cf8',
    text: '#ffffff',
    preview: 'bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950'
  }
]

interface ThemeSelectorProps {
  currentTheme: string
  onThemeChange: (themeId: string) => void
  showPreview?: boolean
}

export function ThemeSelector({ currentTheme, onThemeChange, showPreview = true }: ThemeSelectorProps) {
  const [showSelector, setShowSelector] = useState(false)

  const selectedTheme = themes.find(t => t.id === currentTheme) || themes[0]

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setShowSelector(!showSelector)}
        className="flex items-center gap-2"
      >
        <Palette className="w-4 h-4" />
        Theme: {selectedTheme.name}
      </Button>

      {showSelector && (
        <div className="absolute top-12 right-0 z-50 bg-gray-900 border border-gray-700 rounded-lg p-4 w-96 max-h-96 overflow-y-auto shadow-xl">
          <h3 className="text-white font-semibold mb-4">Choose Presentation Theme</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id)
                  setShowSelector(false)
                }}
                className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                  currentTheme === theme.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Theme preview */}
                  <div className={`w-12 h-8 rounded ${theme.preview} border border-gray-600`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium">{theme.name}</h4>
                      {currentTheme === theme.id && (
                        <Check className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{theme.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Themes affect background colors, chart colors, and text styling throughout your presentation.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function ThemePreview({ themeId, className = "" }: { themeId: string, className?: string }) {
  const theme = themes.find(t => t.id === themeId) || themes[0]
  
  return (
    <Card className={`${theme.preview} p-6 ${className}`}>
      <div className="space-y-4">
        <h3 className="text-xl font-bold" style={{ color: theme.primary }}>
          Sample Title
        </h3>
        <p style={{ color: theme.secondary }}>
          This is how your presentation content will look with the {theme.name} theme.
        </p>
        <div className="flex gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.accent }} />
          <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.primary }} />
          <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.secondary }} />
        </div>
      </div>
    </Card>
  )
}

export function getThemeConfig(themeId: string) {
  const theme = themes.find(t => t.id === themeId) || themes[0]
  
  return {
    background: `bg-gradient-to-br ${theme.background}`,
    text: theme.text,
    primary: theme.primary,
    secondary: theme.secondary,
    accent: theme.accent,
    chartColors: getChartColorsForTheme(themeId)
  }
}

function getChartColorsForTheme(themeId: string): string[] {
  const colorSchemes: Record<string, string[]> = {
    dark: ['blue-500', 'green-500', 'purple-500', 'orange-500', 'red-500'],
    blue: ['blue-400', 'blue-600', 'cyan-500', 'indigo-500', 'sky-500'],
    purple: ['purple-400', 'purple-600', 'violet-500', 'fuchsia-500', 'pink-500'],
    green: ['emerald-400', 'emerald-600', 'green-500', 'lime-500', 'teal-500'],
    red: ['red-400', 'red-600', 'rose-500', 'pink-500', 'orange-500'],
    orange: ['orange-400', 'orange-600', 'amber-500', 'yellow-500', 'red-500'],
    teal: ['teal-400', 'teal-600', 'cyan-500', 'blue-500', 'green-500'],
    indigo: ['indigo-400', 'indigo-600', 'blue-500', 'purple-500', 'violet-500']
  }
  
  return colorSchemes[themeId] || colorSchemes.dark
}

export { themes }