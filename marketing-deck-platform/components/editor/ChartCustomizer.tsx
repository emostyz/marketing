'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, LineChart, PieChart, TrendingUp, Palette, Settings,
  Download, RefreshCw, Edit, Copy, Trash2, Play, Pause
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { COLOR_PALETTES, CHART_TEMPLATES } from '@/lib/design/design-system'

interface ChartData {
  id: string
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar'
  title: string
  data: any[]
  config: {
    xAxisKey: string
    yAxisKey: string | string[]
    showAnimation: boolean
    showLegend: boolean
    showGridLines: boolean
    colors: string[]
    strokeWidth?: number
    barSize?: number
    innerRadius?: number
    outerRadius?: number
    valueFormatter?: (value: number) => string
  }
  style: {
    width: number
    height: number
    backgroundColor?: string
    borderRadius?: number
    padding?: number
  }
}

interface ChartCustomizerProps {
  chart: ChartData
  onUpdateChart: (chart: ChartData) => void
  onCloseCustomizer: () => void
}

const CHART_TYPES = [
  { id: 'line', name: 'Line Chart', icon: <LineChart className="w-4 h-4" /> },
  { id: 'bar', name: 'Bar Chart', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'area', name: 'Area Chart', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'pie', name: 'Pie Chart', icon: <PieChart className="w-4 h-4" /> },
  { id: 'scatter', name: 'Scatter Plot', icon: <BarChart3 className="w-4 h-4" /> }
]

const ANIMATION_PRESETS = [
  { id: 'none', name: 'No Animation', duration: 0 },
  { id: 'fast', name: 'Fast', duration: 500 },
  { id: 'normal', name: 'Normal', duration: 1000 },
  { id: 'slow', name: 'Slow', duration: 2000 },
  { id: 'bouncy', name: 'Bouncy', duration: 1500 }
]

export default function ChartCustomizer({ 
  chart, 
  onUpdateChart, 
  onCloseCustomizer 
}: ChartCustomizerProps) {
  const [activeTab, setActiveTab] = useState('data')
  const [isAnimating, setIsAnimating] = useState(false)

  const updateChart = useCallback((updates: Partial<ChartData>) => {
    onUpdateChart({ ...chart, ...updates })
  }, [chart, onUpdateChart])

  const updateConfig = useCallback((configUpdates: Partial<ChartData['config']>) => {
    updateChart({
      config: { ...chart.config, ...configUpdates }
    })
  }, [chart.config, updateChart])

  const updateStyle = useCallback((styleUpdates: Partial<ChartData['style']>) => {
    updateChart({
      style: { ...chart.style, ...styleUpdates }
    })
  }, [chart.style, updateChart])

  const handleColorPaletteChange = useCallback((paletteId: string) => {
    const palette = COLOR_PALETTES.find(p => p.id === paletteId)
    if (palette) {
      updateConfig({ colors: palette.colors })
    }
  }, [updateConfig])

  const handleChartTypeChange = useCallback((newType: string) => {
    const template = CHART_TEMPLATES.find(t => t.type === newType)
    if (template) {
      updateChart({
        type: newType as any,
        config: { ...chart.config, ...template.template.config }
      })
    }
  }, [chart.config, updateChart])

  const handleAnimationTest = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), chart.config.showAnimation ? 2000 : 500)
  }, [chart.config.showAnimation])

  const handleDataPointAdd = useCallback(() => {
    const newDataPoint = {
      name: `Point ${chart.data.length + 1}`,
      value: Math.floor(Math.random() * 100) + 50
    }
    updateChart({
      data: [...chart.data, newDataPoint]
    })
  }, [chart.data, updateChart])

  const handleDataPointRemove = useCallback((index: number) => {
    updateChart({
      data: chart.data.filter((_, i) => i !== index)
    })
  }, [chart.data, updateChart])

  const handleDataPointUpdate = useCallback((index: number, field: string, value: any) => {
    const newData = [...chart.data]
    newData[index] = { ...newData[index], [field]: value }
    updateChart({ data: newData })
  }, [chart.data, updateChart])

  return (
    <div className="w-96 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chart Customizer
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAnimationTest}
              disabled={isAnimating}
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCloseCustomizer}
            >
              ✕
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 m-4 mb-0">
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="data" className="space-y-4 mt-0">
            {/* Chart Type */}
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select value={chart.type} onValueChange={handleChartTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center space-x-2">
                        {type.icon}
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chart Title */}
            <div className="space-y-2">
              <Label>Chart Title</Label>
              <Input
                value={chart.title}
                onChange={(e) => updateChart({ title: e.target.value })}
                placeholder="Enter chart title"
              />
            </div>

            {/* Data Points */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Data Points</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDataPointAdd}
                >
                  Add Point
                </Button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {chart.data.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <Input
                      value={point.name || ''}
                      onChange={(e) => handleDataPointUpdate(index, 'name', e.target.value)}
                      placeholder="Label"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={point.value || ''}
                      onChange={(e) => handleDataPointUpdate(index, 'value', parseFloat(e.target.value) || 0)}
                      placeholder="Value"
                      className="w-20"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDataPointRemove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Axis Configuration */}
            <div className="space-y-2">
              <Label>X-Axis Key</Label>
              <Input
                value={chart.config.xAxisKey}
                onChange={(e) => updateConfig({ xAxisKey: e.target.value })}
                placeholder="X-axis data key"
              />
            </div>

            <div className="space-y-2">
              <Label>Y-Axis Key</Label>
              <Input
                value={typeof chart.config.yAxisKey === 'string' ? chart.config.yAxisKey : chart.config.yAxisKey.join(', ')}
                onChange={(e) => updateConfig({ yAxisKey: e.target.value })}
                placeholder="Y-axis data key"
              />
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-0">
            {/* Chart Dimensions */}
            <div className="space-y-2">
              <Label>Width</Label>
              <Slider
                value={[chart.style.width]}
                onValueChange={([value]) => updateStyle({ width: value })}
                min={200}
                max={800}
                step={10}
                className="w-full"
              />
              <div className="text-sm text-gray-500">{chart.style.width}px</div>
            </div>

            <div className="space-y-2">
              <Label>Height</Label>
              <Slider
                value={[chart.style.height]}
                onValueChange={([value]) => updateStyle({ height: value })}
                min={150}
                max={600}
                step={10}
                className="w-full"
              />
              <div className="text-sm text-gray-500">{chart.style.height}px</div>
            </div>

            {/* Chart-specific styling */}
            {(chart.type === 'line' || chart.type === 'area') && (
              <div className="space-y-2">
                <Label>Stroke Width</Label>
                <Slider
                  value={[chart.config.strokeWidth || 2]}
                  onValueChange={([value]) => updateConfig({ strokeWidth: value })}
                  min={1}
                  max={8}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-gray-500">{chart.config.strokeWidth || 2}px</div>
              </div>
            )}

            {chart.type === 'bar' && (
              <div className="space-y-2">
                <Label>Bar Size</Label>
                <Slider
                  value={[chart.config.barSize || 20]}
                  onValueChange={([value]) => updateConfig({ barSize: value })}
                  min={10}
                  max={50}
                  step={2}
                  className="w-full"
                />
                <div className="text-sm text-gray-500">{chart.config.barSize || 20}px</div>
              </div>
            )}

            {chart.type === 'pie' && (
              <>
                <div className="space-y-2">
                  <Label>Inner Radius</Label>
                  <Slider
                    value={[chart.config.innerRadius || 0]}
                    onValueChange={([value]) => updateConfig({ innerRadius: value })}
                    min={0}
                    max={80}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">{chart.config.innerRadius || 0}%</div>
                </div>

                <div className="space-y-2">
                  <Label>Outer Radius</Label>
                  <Slider
                    value={[chart.config.outerRadius || 80]}
                    onValueChange={([value]) => updateConfig({ outerRadius: value })}
                    min={50}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">{chart.config.outerRadius || 80}%</div>
                </div>
              </>
            )}

            {/* Chart Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Show Legend</Label>
                <Switch
                  checked={chart.config.showLegend}
                  onCheckedChange={(checked) => updateConfig({ showLegend: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Grid Lines</Label>
                <Switch
                  checked={chart.config.showGridLines}
                  onCheckedChange={(checked) => updateConfig({ showGridLines: checked })}
                />
              </div>
            </div>

            {/* Background */}
            <div className="space-y-2">
              <Label>Background Color</Label>
              <Input
                type="color"
                value={chart.style.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="w-full h-10"
              />
            </div>

            {/* Border Radius */}
            <div className="space-y-2">
              <Label>Border Radius</Label>
              <Slider
                value={[chart.style.borderRadius || 0]}
                onValueChange={([value]) => updateStyle({ borderRadius: value })}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-gray-500">{chart.style.borderRadius || 0}px</div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4 mt-0">
            {/* Color Palettes */}
            <div className="space-y-2">
              <Label>Color Palette</Label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PALETTES.map(palette => (
                  <motion.button
                    key={palette.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleColorPaletteChange(palette.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      JSON.stringify(chart.config.colors) === JSON.stringify(palette.colors)
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    )}
                  >
                    <div className="flex space-x-1 mb-2">
                      {palette.colors.slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {palette.name}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-2">
              <Label>Custom Colors</Label>
              <div className="space-y-2">
                {chart.config.colors.map((color, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...chart.config.colors]
                        newColors[index] = e.target.value
                        updateConfig({ colors: newColors })
                      }}
                      className="w-12 h-8"
                    />
                    <Input
                      value={color}
                      onChange={(e) => {
                        const newColors = [...chart.config.colors]
                        newColors[index] = e.target.value
                        updateConfig({ colors: newColors })
                      }}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newColors = chart.config.colors.filter((_, i) => i !== index)
                        updateConfig({ colors: newColors })
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newColors = [...chart.config.colors, '#3b82f6']
                    updateConfig({ colors: newColors })
                  }}
                  className="w-full"
                >
                  Add Color
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="animation" className="space-y-4 mt-0">
            {/* Animation Toggle */}
            <div className="flex items-center justify-between">
              <Label>Enable Animation</Label>
              <Switch
                checked={chart.config.showAnimation}
                onCheckedChange={(checked) => updateConfig({ showAnimation: checked })}
              />
            </div>

            {/* Animation Presets */}
            {chart.config.showAnimation && (
              <div className="space-y-2">
                <Label>Animation Style</Label>
                <div className="grid grid-cols-1 gap-2">
                  {ANIMATION_PRESETS.map(preset => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // This would set animation duration and easing
                        // In a real implementation, you'd have more animation controls
                        handleAnimationTest()
                      }}
                      className="justify-start"
                    >
                      {preset.name}
                      <span className="ml-auto text-xs text-gray-500">
                        {preset.duration}ms
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Test Animation */}
            <Button
              onClick={handleAnimationTest}
              disabled={isAnimating}
              className="w-full"
            >
              {isAnimating ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Animating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Test Animation
                </>
              )}
            </Button>
          </TabsContent>
        </div>
      </Tabs>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Copy chart configuration to clipboard
              navigator.clipboard.writeText(JSON.stringify(chart, null, 2))
            }}
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Export chart as image (would need canvas implementation)
              console.log('Export chart as image')
            }}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}