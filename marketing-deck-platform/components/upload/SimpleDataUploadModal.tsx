'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Upload, X } from 'lucide-react'

interface DataUploadModalProps {
  onClose: () => void
  onUpload: (data: any) => void
}

export function DataUploadModal({ onClose, onUpload }: DataUploadModalProps) {
  const [step, setStep] = useState(1)
  const [presentationName, setPresentationName] = useState('')

  const handleContinue = () => {
    if (!presentationName.trim()) {
      alert('Please enter a presentation name')
      return
    }
    
    // For demo, just call onUpload with sample data
    onUpload({
      title: presentationName,
      data: [
        { Month: 'Jan', Revenue: 45000, Leads: 1200 },
        { Month: 'Feb', Revenue: 52000, Leads: 1350 },
        { Month: 'Mar', Revenue: 48000, Leads: 1180 },
        { Month: 'Apr', Revenue: 61000, Leads: 1500 }
      ]
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Create AI Presentation</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Presentation Name</label>
            <input
              type="text"
              value={presentationName}
              onChange={(e) => setPresentationName(e.target.value)}
              placeholder="e.g., Q1 Sales Review"
              className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Upload Data (Optional)</label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 font-semibold mb-2">Drag & drop your files here</p>
              <p className="text-sm text-gray-400 mb-4">Supports CSV, Excel, and JSON files</p>
              <Button variant="secondary">Browse Files</Button>
            </div>
            <p className="text-sm text-blue-400 mt-2">💡 Skip this step to use sample data and see AI in action!</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleContinue}>
              Generate with AI
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}