'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FontPickerProps {
  value: string
  onChange: (font: string) => void
}

const fonts = [
  { name: 'Inter', family: 'Inter, sans-serif' },
  { name: 'Roboto', family: 'Roboto, sans-serif' },
  { name: 'Open Sans', family: 'Open Sans, sans-serif' },
  { name: 'Lato', family: 'Lato, sans-serif' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { name: 'Source Sans Pro', family: 'Source Sans Pro, sans-serif' },
  { name: 'Raleway', family: 'Raleway, sans-serif' },
  { name: 'Nunito', family: 'Nunito, sans-serif' },
  { name: 'Poppins', family: 'Poppins, sans-serif' },
  { name: 'Playfair Display', family: 'Playfair Display, serif' },
  { name: 'Merriweather', family: 'Merriweather, serif' },
  { name: 'Georgia', family: 'Georgia, serif' },
  { name: 'Times New Roman', family: 'Times New Roman, serif' },
  { name: 'JetBrains Mono', family: 'JetBrains Mono, monospace' },
  { name: 'Fira Code', family: 'Fira Code, monospace' }
]

export function FontPicker({ value, onChange }: FontPickerProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {fonts.map((font) => (
          <SelectItem 
            key={font.name} 
            value={font.name}
            className="font-medium"
            style={{ fontFamily: font.family }}
          >
            {font.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}