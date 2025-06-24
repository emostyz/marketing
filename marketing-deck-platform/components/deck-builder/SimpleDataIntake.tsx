'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface DataContext {
  description: string;
  industry: string;
  targetAudience: string;
  businessContext: string;
  keyMetrics: string;
}

interface SimpleDataIntakeProps {
  dataContext: DataContext;
  setDataContext: React.Dispatch<React.SetStateAction<DataContext>>;
  nextStep: () => void;
}

export const SimpleDataIntake: React.FC<SimpleDataIntakeProps> = ({ dataContext, setDataContext, nextStep }) => {
  const [errors, setErrors] = React.useState<{[key: string]: string}>({})
  const [isSaving, setIsSaving] = React.useState(false)

  console.log('SimpleDataIntake rendered with:', dataContext)

  const handleInputChange = (field: string, value: string) => {
    console.log('Simple input change:', field, value)
    const newContext = { ...dataContext, [field]: value }
    setDataContext(newContext)
    
    // Save to localStorage
    try {
      localStorage.setItem('data_context', JSON.stringify(newContext))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
    
    // Clear error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateAndContinue = async () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!dataContext.description?.trim()) {
      newErrors.description = 'Please describe what your data is about'
    }
    if (!dataContext.industry?.trim()) {
      newErrors.industry = 'Please specify your industry'  
    }
    if (!dataContext.targetAudience?.trim()) {
      newErrors.targetAudience = 'Please specify your target audience'
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      setIsSaving(true)
      console.log('Saving data:', dataContext)
      
      try {
        // Save to session
        const sessionResponse = await fetch('/api/presentations/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'data_intake',
            data: dataContext,
            timestamp: new Date().toISOString()
          })
        })
        
        if (sessionResponse.ok) {
          console.log('Data saved successfully')
          nextStep()
        } else {
          const errorData = await sessionResponse.json()
          if (sessionResponse.status === 401) {
            setErrors({ description: 'You must be logged in to save your data. Please log in and try again.' })
          } else {
            setErrors({ description: errorData.error || 'Failed to save data. Please try again.' })
          }
          console.error('Failed to save data:', errorData)
        }
      } catch (error) {
        console.error('Error saving data:', error)
        setErrors({ description: 'Failed to save data. Please try again.' })
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white">Tell Us About Your Data</h1>
        <p className="text-xl text-gray-300 mt-4">Help our AI understand your context</p>
      </div>

      <Card className="p-12 bg-gray-900 border-gray-700 w-full">
        <div className="space-y-8">
          {/* Description */}
          <div>
            <label className="block text-lg font-medium text-gray-300 mb-3">
              What is the data about? *
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="e.g., Monthly sales figures for our e-commerce store..."
              value={dataContext.description || ''}
              onChange={(e) => {
                console.log('Textarea onChange:', e.target.value)
                handleInputChange('description', e.target.value)
              }}
              className={`min-h-[150px] w-full p-4 rounded-lg bg-gray-800 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${errors.description ? 'border-red-500' : 'border-gray-600'}`}
              style={{ pointerEvents: 'auto' }}
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-2">{errors.description}</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <label className="block text-lg font-medium text-gray-300 mb-3">
              What is your industry? *
            </label>
            <input
              type="text"
              id="industry"
              name="industry"
              placeholder="e.g., SaaS, Retail, Healthcare, Fintech..."
              value={dataContext.industry || ''}
              onChange={(e) => {
                console.log('Industry onChange:', e.target.value)
                handleInputChange('industry', e.target.value)
              }}
              className={`w-full p-4 rounded-lg bg-gray-800 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${errors.industry ? 'border-red-500' : 'border-gray-600'}`}
              style={{ pointerEvents: 'auto' }}
            />
            {errors.industry && (
              <p className="text-red-400 text-sm mt-2">{errors.industry}</p>
            )}
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-lg font-medium text-gray-300 mb-3">
              Who is the target audience for this presentation? *
            </label>
            <input
              type="text"
              id="targetAudience"
              name="targetAudience"
              placeholder="e.g., C-level executives, potential investors..."
              value={dataContext.targetAudience || ''}
              onChange={(e) => {
                console.log('Target audience onChange:', e.target.value)
                handleInputChange('targetAudience', e.target.value)
              }}
              className={`w-full p-4 rounded-lg bg-gray-800 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${errors.targetAudience ? 'border-red-500' : 'border-gray-600'}`}
              style={{ pointerEvents: 'auto' }}
            />
            {errors.targetAudience && (
              <p className="text-red-400 text-sm mt-2">{errors.targetAudience}</p>
            )}
          </div>

          {/* Business Context */}
          <div>
            <label className="block text-lg font-medium text-gray-300 mb-3">
              Business Context (Optional)
            </label>
            <textarea
              id="businessContext"
              name="businessContext"
              placeholder="e.g., We're preparing for Series A funding..."
              value={dataContext.businessContext || ''}
              onChange={(e) => {
                console.log('Business context onChange:', e.target.value)
                handleInputChange('businessContext', e.target.value)
              }}
              className="min-h-[100px] w-full p-4 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              style={{ pointerEvents: 'auto' }}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={validateAndContinue}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg"
        >
          {isSaving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}