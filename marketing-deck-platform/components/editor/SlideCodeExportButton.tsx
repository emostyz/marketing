'use client'

import React, { useState } from 'react'
import { 
  Code, 
  Download, 
  Copy, 
  FileText, 
  Settings, 
  Palette,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  exportSlideToCode, 
  exportToFormat, 
  exportChartCode 
} from '@/lib/slide-code/slide-exporter'
import { SlideCode } from '@/lib/slide-code/slide-schema'

interface SlideCodeExportButtonProps {
  slide: any
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const SlideCodeExportButton: React.FC<SlideCodeExportButtonProps> = ({
  slide,
  position = 'top-right',
  size = 'sm',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'elements' | 'styling' | 'charts'>('overview')
  const [exportFormat, setExportFormat] = useState<'json' | 'typescript' | 'python'>('json')
  const [copied, setCopied] = useState(false)

  // Generate slide code
  const slideCode: SlideCode = exportSlideToCode(slide)

  // Position classes
  const positionClasses = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2', 
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2'
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFormattedCode = () => {
    switch (exportFormat) {
      case 'json':
        return JSON.stringify(slideCode, null, 2)
      case 'typescript':
        return exportToFormat(slide, 'typescript')
      case 'python':
        return exportToFormat(slide, 'python')
      default:
        return JSON.stringify(slideCode, null, 2)
    }
  }

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {slideCode.elements.length}
          </div>
          <div className="text-xs text-blue-700">Elements</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {slideCode.elements.filter(e => e.type === 'chart').length}
          </div>
          <div className="text-xs text-green-700">Charts</div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Slide Properties</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Title:</span>
            <span className="font-medium">{slideCode.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Layout:</span>
            <span className="font-medium">{slideCode.layout.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Theme:</span>
            <span className="font-medium">{slideCode.theme.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Background:</span>
            <span className="font-medium">{slideCode.background.type}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Element Types</h4>
        <div className="flex flex-wrap gap-1">
          {Array.from(new Set(slideCode.elements.map(e => e.type))).map(type => (
            <Badge key={type} variant="secondary" className="text-xs">
              {type}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  const renderElements = () => (
    <div className="space-y-3 max-h-60 overflow-y-auto">
      {slideCode.elements.map((element, index) => (
        <div key={element.id} className="p-3 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {element.type}
              </Badge>
              <span className="text-sm font-medium">
                Element {index + 1}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(JSON.stringify(element, null, 2))}
              className="h-6 w-6 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            <div>Position: ({element.position.x}, {element.position.y})</div>
            <div>Size: {element.size.width} × {element.size.height}</div>
            {element.style.fontSize && (
              <div>Font: {element.style.fontSize}px {element.style.fontFamily}</div>
            )}
            {element.style.color && (
              <div className="flex items-center space-x-1">
                <span>Color:</span>
                <div 
                  className="w-3 h-3 rounded border"
                  style={{ backgroundColor: element.style.color }}
                />
                <span>{element.style.color}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderStyling = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <Palette className="w-4 h-4 mr-1" />
          Theme Colors
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(slideCode.theme.colors).map(([name, color]) => (
            <div key={name} className="text-center">
              <div 
                className="w-8 h-8 rounded mx-auto mb-1 border"
                style={{ backgroundColor: color }}
              />
              <div className="text-xs text-gray-600">{name}</div>
              <div className="text-xs font-mono">{color}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Typography</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Font Family:</span>
            <span className="font-medium">{slideCode.theme.typography.fontFamily}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Base Size:</span>
            <span className="font-medium">{slideCode.theme.typography.sizes.base}px</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Spacing & Effects</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-600">Border Radius:</span>
            <div className="font-mono">{slideCode.theme.borderRadius.md}px</div>
          </div>
          <div>
            <span className="text-gray-600">Shadow:</span>
            <div className="font-mono text-xs">{slideCode.theme.shadows.md}</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCharts = () => {
    const chartElements = slideCode.elements.filter(e => e.type === 'chart')
    
    if (chartElements.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No charts in this slide</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {chartElements.map((element, index) => (
          <div key={element.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Chart {index + 1}</h4>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(exportChartCode(element.chartConfig))}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(
                    exportChartCode(element.chartConfig),
                    `chart-${index + 1}-config.json`
                  )}
                  className="h-6 w-6 p-0"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {element.chartConfig && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="outline">{element.chartConfig.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Points:</span>
                  <span className="font-medium">{element.chartConfig.data?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">X-Axis:</span>
                  <span className="font-medium">{element.chartConfig.xAxisKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Y-Axis:</span>
                  <span className="font-medium">{element.chartConfig.yAxisKey}</span>
                </div>
                {element.chartConfig.businessMetric && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business Metric:</span>
                    <span className="font-medium">{element.chartConfig.businessMetric}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (!isOpen) {
    return (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className={`
          absolute ${positionClasses[position]} ${sizeClasses[size]} p-1
          bg-white/90 hover:bg-white shadow-md border backdrop-blur-sm
          ${className}
        `}
        title="Export slide code"
      >
        <Code className="w-full h-full" />
      </Button>
    )
  }

  return (
    <div className={`absolute ${positionClasses[position]} z-50`}>
      <Card className="w-96 max-h-[500px] overflow-hidden shadow-xl border">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <h3 className="font-semibold text-gray-900">Slide Code</h3>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(getFormattedCode())}
                className="h-8 w-8 p-0"
                title={copied ? 'Copied!' : 'Copy all code'}
              >
                {copied ? (
                  <span className="text-green-600 text-xs">✓</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDownload(
                  getFormattedCode(),
                  `slide-${slideCode.slideNumber}-code.${exportFormat}`
                )}
                className="h-8 w-8 p-0"
                title="Download code file"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Format selector */}
          <div className="flex space-x-1 mt-3">
            {(['json', 'typescript', 'python'] as const).map(format => (
              <Button
                key={format}
                size="sm"
                variant={exportFormat === format ? 'default' : 'ghost'}
                onClick={() => setExportFormat(format)}
                className="h-7 px-2 text-xs"
              >
                {format.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {([
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'elements', label: 'Elements', icon: Settings },
            { id: 'styling', label: 'Styling', icon: Palette },
            { id: 'charts', label: 'Charts', icon: BarChart3 }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-medium
                ${activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <tab.icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'elements' && renderElements()}
          {activeTab === 'styling' && renderStyling()}
          {activeTab === 'charts' && renderCharts()}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <span>Generated: {new Date().toLocaleTimeString()}</span>
            <span>v{slideCode.version}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SlideCodeExportButton