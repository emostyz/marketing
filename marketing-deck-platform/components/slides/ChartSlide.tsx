'use client'

import { useState } from 'react'
import { AreaChart, BarChart, LineChart, Card } from '@tremor/react'
import { Button } from '@/components/ui/Button'
import { Edit, Settings, Download, Palette } from 'lucide-react'

interface ChartSlideProps {
  slide: {
    id: string
    title: string
    chartType: 'area' | 'bar' | 'line'
    data: any[]
    colors?: string[]
    categories?: string[]
    index?: string
  }
  onUpdate: (slide: any) => void
  editable?: boolean
}

export function ChartSlide({ slide, onUpdate, editable = true }: ChartSlideProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(slide.title)
  const [chartConfig, setChartConfig] = useState({
    type: slide.chartType || 'area',
    colors: slide.colors || ['blue', 'green', 'purple'],
    showLegend: true,
    showGrid: true,
    showGradient: false
  })

  const handleSave = () => {
    onUpdate({
      ...slide,
      title: editTitle,
      chartType: chartConfig.type,
      colors: chartConfig.colors
    })
    setIsEditing(false)
  }

  const valueFormatter = (number: number) =>
    `${Intl.NumberFormat('us').format(number).toString()}`

  const renderChart = () => {
    const commonProps = {
      data: slide.data,
      index: slide.index || 'name',
      categories: slide.categories || Object.keys(slide.data[0] || {}).filter(key => key !== (slide.index || 'name')),
      colors: chartConfig.colors,
      valueFormatter,
      showLegend: chartConfig.showLegend,
      showGradient: chartConfig.showGradient,
      className: "h-80"
    }

    switch (chartConfig.type) {
      case 'bar':
        return <BarChart {...commonProps} />
      case 'line':
        return <LineChart {...commonProps} />
      default:
        return <AreaChart {...commonProps} />
    }
  }

  return (
    <Card className="p-8 bg-gray-900/50 border-gray-700 text-white">
      <div className="flex justify-between items-start mb-6">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-3xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-white"
            autoFocus
          />
        ) : (
          <h2 className="text-3xl font-bold text-white">{slide.title}</h2>
        )}
        
        {editable && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Chart Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Chart Type</label>
              <select
                value={chartConfig.type}
                onChange={(e) => setChartConfig({...chartConfig, type: e.target.value as any})}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="area">Area Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color Scheme</label>
              <select
                value={chartConfig.colors.join(',')}
                onChange={(e) => setChartConfig({...chartConfig, colors: e.target.value.split(',')})}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="blue,green,purple">Blue/Green/Purple</option>
                <option value="red,orange,yellow">Red/Orange/Yellow</option>
                <option value="indigo,violet,pink">Indigo/Violet/Pink</option>
                <option value="emerald,teal,cyan">Emerald/Teal/Cyan</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={chartConfig.showLegend}
                  onChange={(e) => setChartConfig({...chartConfig, showLegend: e.target.checked})}
                  className="mr-2"
                />
                Show Legend
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={chartConfig.showGradient}
                  onChange={(e) => setChartConfig({...chartConfig, showGradient: e.target.checked})}
                  className="mr-2"
                />
                Show Gradient
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/5 rounded-lg p-6">
        {renderChart()}
      </div>

      {/* Data Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {slide.data.slice(0, 3).map((item, index) => (
          <div key={index} className="bg-gray-800/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {Object.values(item)[1] as number}
            </div>
            <div className="text-sm text-gray-300">
              {Object.values(item)[0] as string}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}