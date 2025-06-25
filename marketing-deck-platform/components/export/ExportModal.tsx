'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, Presentation, Palette, Monitor, Smartphone, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  presentationId: string
  presentationTitle: string
}

interface ExportOptions {
  format: 'pptx' | 'pdf'
  size: '16:9' | '4:3' | 'A4'
  theme: Theme
}

interface Theme {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
}

const THEMES: Theme[] = [
  { 
    id: 'executive', 
    name: 'Executive Blue', 
    primaryColor: '#1E40AF', 
    secondaryColor: '#7C3AED',
    backgroundColor: '#FFFFFF'
  },
  { 
    id: 'modern', 
    name: 'Modern Purple', 
    primaryColor: '#7C3AED', 
    secondaryColor: '#EC4899',
    backgroundColor: '#FFFFFF'
  },
  { 
    id: 'corporate', 
    name: 'Corporate Green', 
    primaryColor: '#059669', 
    secondaryColor: '#0891B2',
    backgroundColor: '#FFFFFF'
  },
  { 
    id: 'creative', 
    name: 'Creative Orange', 
    primaryColor: '#EA580C', 
    secondaryColor: '#DC2626',
    backgroundColor: '#FFFFFF'
  }
]

const SIZES = [
  { 
    id: '16:9', 
    name: 'Widescreen (16:9)', 
    description: 'Modern presentations',
    icon: <Monitor className="w-5 h-5" />,
    dimensions: '1920×1080'
  },
  { 
    id: '4:3', 
    name: 'Standard (4:3)', 
    description: 'Classic format',
    icon: <Presentation className="w-5 h-5" />,
    dimensions: '1024×768'
  },
  { 
    id: 'A4', 
    name: 'A4 Portrait', 
    description: 'Print friendly',
    icon: <Printer className="w-5 h-5" />,
    dimensions: '794×1123'
  }
]

export function ExportModal({ isOpen, onClose, presentationId, presentationTitle }: ExportModalProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pptx',
    size: '16:9',
    theme: THEMES[0]
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (isExporting) return

    setIsExporting(true)
    const toastId = toast.loading('Preparing your presentation...')

    try {
      const response = await fetch(`/api/presentations/${presentationId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: exportOptions.format,
          size: exportOptions.size,
          theme: {
            primaryColor: exportOptions.theme.primaryColor,
            secondaryColor: exportOptions.theme.secondaryColor,
            backgroundColor: exportOptions.theme.backgroundColor,
            headingFont: 'Arial',
            bodyFont: 'Arial'
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      // Get the file blob
      const blob = await response.blob()
      const fileExt = exportOptions.format
      const fileName = `${presentationTitle}_${exportOptions.size}.${fileExt}`

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Presentation exported successfully!', { id: toastId })
      onClose()

    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.message || 'Failed to export presentation', { id: toastId })
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Export Presentation</h2>
              <p className="text-gray-400 mt-1">Download your presentation as PowerPoint or PDF</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Export Format</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExportOptions(prev => ({ ...prev, format: 'pptx' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    exportOptions.format === 'pptx'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Presentation className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">PowerPoint</div>
                  <div className="text-xs opacity-70">Editable PPTX file</div>
                </button>
                <button
                  onClick={() => setExportOptions(prev => ({ ...prev, format: 'pdf' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    exportOptions.format === 'pdf'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">PDF</div>
                  <div className="text-xs opacity-70">Print-ready document</div>
                </button>
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Presentation Size</h3>
              <div className="space-y-2">
                {SIZES.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setExportOptions(prev => ({ ...prev, size: size.id as any }))}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      exportOptions.size === size.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${
                          exportOptions.size === size.id ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                          {size.icon}
                        </div>
                        <div>
                          <div className={`font-medium ${
                            exportOptions.size === size.id ? 'text-blue-400' : 'text-white'
                          }`}>
                            {size.name}
                          </div>
                          <div className="text-sm text-gray-400">{size.description}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{size.dimensions}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Color Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setExportOptions(prev => ({ ...prev, theme }))}
                    className={`p-3 rounded-lg border transition-all ${
                      exportOptions.theme.id === theme.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.secondaryColor }}
                        />
                      </div>
                      <div className={`text-sm font-medium ${
                        exportOptions.theme.id === theme.id ? 'text-blue-400' : 'text-white'
                      }`}>
                        {theme.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              File: {presentationTitle}_{exportOptions.size}.{exportOptions.format}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isExporting}>
                Cancel
              </Button>
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}