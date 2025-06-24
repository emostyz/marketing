'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  trigger?: React.ReactNode
  presets?: string[]
}

const defaultPresets = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#991b1b', '#92400e', '#a16207', '#a3a3a3', '#525252'
]

export function ColorPicker({ 
  value, 
  onChange, 
  trigger, 
  presets = defaultPresets 
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(value)

  const handleColorChange = (color: string) => {
    onChange(color)
    setCustomColor(color)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-12 h-8 p-0 border-2">
            <div 
              className="w-full h-full rounded" 
              style={{ backgroundColor: value }}
            />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Color Presets</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {presets.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    value === color ? 'border-blue-500 scale-110' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="custom-color" className="text-sm font-medium">Custom Color</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                id="custom-color"
                type="color"
                value={customColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-16 h-8 p-0 border-0"
              />
              <Input
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                onBlur={() => handleColorChange(customColor)}
                onKeyPress={(e) => e.key === 'Enter' && handleColorChange(customColor)}
                placeholder="#000000"
                className="flex-1 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}