'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TemplateLibrary } from '@/components/templates/TemplateLibrary'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

// TODO: Move this to a central types file
export interface Template {
  id: string
  name: string
  description: string
  category: 'business' | 'marketing' | 'financial' | 'technical' | 'creative' | 'educational'
  type: 'executive' | 'investor' | 'sales' | 'training' | 'report' | 'pitch'
  tags: string[]
  slides: number
  colors: string[]
  fonts: string[]
  features: string[]
  preview: string
  license: 'MIT' | 'Apache' | 'GPL' | 'CC0' | 'Custom'
  author: string
  downloads: number
  rating: number
  reviews: number
  lastUpdated: string
  compatibility: 'tremor' | 'custom' | 'both'
  dataTypes: string[]
  chartTypes: string[]
}

type TemplateStepProps = {
  onTemplateSelect: (template: Template) => void
  nextStep: () => void
  prevStep: () => void
}

export const TemplateStep = ({ onTemplateSelect, nextStep, prevStep }: TemplateStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Select a Presentation Template</h2>
        <p className="text-gray-400 mt-2">Choose a style that best fits your data and narrative.</p>
      </div>

      <TemplateLibrary
        onTemplateSelect={(template) => {
          onTemplateSelect(template)
          nextStep()
        }}
        onTemplatePreview={() => {}}
      />

      <div className="flex justify-between mt-8">
        <Button onClick={prevStep} variant="outline" size="lg">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>
    </motion.div>
  )
} 