'use client'

/**
 * Enhanced Data Intake Form with Working Text Inputs
 * Ensures all text boxes, factors, and form inputs work properly
 */

import React, { useState, useCallback, useEffect } from 'react'
import { Card, Button } from '@tremor/react'
import { TextInput, Textarea, Select, SelectItem, Toggle } from '@/components/ui/tremor-compat'
import { Upload, FileText, Target, Users, TrendingUp, Lightbulb, Save, ArrowRight, Plus, X, Edit3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ==========================================
// INTERFACES
// ==========================================

export interface DataIntakeFormData {
  // Basic Information
  projectName: string
  projectDescription: string
  targetAudience: string
  
  // Business Context
  businessGoals: string[]
  keyQuestions: string[]
  factors: Factor[]
  
  // Presentation Preferences  
  presentationStyle: 'executive' | 'technical' | 'creative' | 'academic'
  slideCount: number
  timeframe: string
  
  // Data Context
  dataDescription: string
  expectedInsights: string[]
  customRequirements: string
  
  // Advanced Options
  includeExecutiveSummary: boolean
  includeAppendix: boolean
  includeDataSources: boolean
  templatePreference: string
}

export interface Factor {
  id: string
  name: string
  description: string
  weight: number
  category: 'internal' | 'external' | 'market' | 'operational'
}

// ==========================================
// MAIN COMPONENT
// ==========================================

interface EnhancedDataIntakeProps {
  onFormSubmit: (data: DataIntakeFormData) => void
  onDataUpload: (files: File[]) => void
  initialData?: Partial<DataIntakeFormData>
  className?: string
}

export const EnhancedDataIntake: React.FC<EnhancedDataIntakeProps> = ({
  onFormSubmit,
  onDataUpload,
  initialData,
  className = ''
}) => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  const [formData, setFormData] = useState<DataIntakeFormData>({
    projectName: '',
    projectDescription: '',
    targetAudience: '',
    businessGoals: [''],
    keyQuestions: [''],
    factors: [],
    presentationStyle: 'executive',
    slideCount: 10,
    timeframe: '30 days',
    dataDescription: '',
    expectedInsights: [''],
    customRequirements: '',
    includeExecutiveSummary: true,
    includeAppendix: false,
    includeDataSources: true,
    templatePreference: 'mckinsey',
    ...initialData
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // ==========================================
  // FORM HANDLERS
  // ==========================================

  const updateFormData = useCallback((field: keyof DataIntakeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const updateArrayField = useCallback((field: 'businessGoals' | 'keyQuestions' | 'expectedInsights', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }, [])

  const addArrayItem = useCallback((field: 'businessGoals' | 'keyQuestions' | 'expectedInsights') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }, [])

  const removeArrayItem = useCallback((field: 'businessGoals' | 'keyQuestions' | 'expectedInsights', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }, [])

  // ==========================================
  // FACTORS MANAGEMENT
  // ==========================================

  const addFactor = useCallback(() => {
    const newFactor: Factor = {
      id: `factor-${Date.now()}`,
      name: '',
      description: '',
      weight: 5,
      category: 'internal'
    }
    setFormData(prev => ({
      ...prev,
      factors: [...prev.factors, newFactor]
    }))
  }, [])

  const updateFactor = useCallback((factorId: string, field: keyof Factor, value: any) => {
    console.log(`Updating factor ${factorId}, field ${field}, value:`, value)
    setFormData(prev => {
      const updatedFactors = prev.factors.map(factor => 
        factor.id === factorId 
          ? { ...factor, [field]: value }
          : factor
      )
      console.log('Updated factors:', updatedFactors)
      return {
        ...prev,
        factors: updatedFactors
      }
    })
    
    // Clear any errors for this factor
    if (errors[`factor_${factorId}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`factor_${factorId}_${field}`]
        return newErrors
      })
    }
  }, [errors])

  const removeFactor = useCallback((factorId: string) => {
    setFormData(prev => ({
      ...prev,
      factors: prev.factors.filter(factor => factor.id !== factorId)
    }))
  }, [])

  // ==========================================
  // FILE UPLOAD HANDLING
  // ==========================================

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return
    
    const fileArray = Array.from(files)
    
    // Process each file
    fileArray.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          console.log(`Processing file: ${file.name}`)
          
          // Add to uploaded files list
          setUploadedFiles(prev => [...prev, file])
          
          // Parse the file content
          let parsedData: any[] = []
          
          if (file.name.toLowerCase().endsWith('.csv')) {
            // Enhanced CSV parser
            const lines = text.split('\n').filter(line => line.trim().length > 0)
            if (lines.length === 0) {
              throw new Error('File appears to be empty')
            }
            
            // Parse headers
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
            
            // Parse data rows
            parsedData = lines.slice(1).map((line, lineIndex) => {
              try {
                const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
                const row: Record<string, any> = {}
                
                headers.forEach((header, colIndex) => {
                  const value = values[colIndex] || ''
                  
                  // Try to parse as number, but keep original if it fails
                  if (value === '') {
                    row[header] = null
                  } else {
                    const numValue = parseFloat(value)
                    row[header] = !isNaN(numValue) && isFinite(numValue) ? numValue : value
                  }
                })
                
                return row
              } catch (rowError) {
                console.warn(`Error parsing row ${lineIndex + 1}:`, rowError)
                return null
              }
            }).filter(row => row !== null)
            
          } else if (file.name.toLowerCase().endsWith('.json')) {
            try {
              const jsonData = JSON.parse(text)
              parsedData = Array.isArray(jsonData) ? jsonData : [jsonData]
            } catch (jsonError) {
              throw new Error('Invalid JSON format')
            }
          } else {
            throw new Error('Unsupported file format. Please use CSV or JSON files.')
          }
          
          console.log(`Successfully parsed ${parsedData.length} rows from ${file.name}`)
          
          // Call the parent component's upload handler
          onDataUpload([file])
          
        } catch (error) {
          console.error(`File parsing error for ${file.name}:`, error)
          alert(`Error parsing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      reader.onerror = () => {
        console.error(`Error reading file: ${file.name}`)
        alert(`Error reading file: ${file.name}`)
      }
      
      reader.readAsText(file)
    })
  }, [onDataUpload])

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  // ==========================================
  // VALIDATION
  // ==========================================

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.projectName.trim()) {
          newErrors.projectName = 'Project name is required'
        }
        if (!formData.projectDescription.trim()) {
          newErrors.projectDescription = 'Project description is required'
        }
        if (!formData.targetAudience.trim()) {
          newErrors.targetAudience = 'Target audience is required'
        }
        break

      case 2:
        if (formData.businessGoals.every(goal => !goal.trim())) {
          newErrors.businessGoals = 'At least one business goal is required'
        }
        if (formData.keyQuestions.every(question => !question.trim())) {
          newErrors.keyQuestions = 'At least one key question is required'
        }
        break

      case 3:
        if (!formData.dataDescription.trim()) {
          newErrors.dataDescription = 'Data description is required'
        }
        if (uploadedFiles.length === 0) {
          newErrors.files = 'Please upload at least one data file'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, uploadedFiles.length])

  const handleNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }, [currentStep, validateStep])

  const handlePrevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      await onFormSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [currentStep, validateStep, formData, onFormSubmit])

  // ==========================================
  // RENDER METHODS
  // ==========================================

  const renderStep1 = () => (
    <Card>
      <h2 className="text-xl font-bold mb-6">Project Information</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Project Name *</label>
          <TextInput
            placeholder="Enter your project name"
            value={formData.projectName}
            onValueChange={(value) => updateFormData('projectName', value)}
            error={!!errors.projectName}
            errorMessage={errors.projectName}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Project Description *</label>
          <Textarea
            placeholder="Describe your project, its objectives, and what you hope to achieve"
            value={formData.projectDescription}
            onValueChange={(value) => updateFormData('projectDescription', value)}
            rows={4}
            className="w-full"
          />
          {errors.projectDescription && (
            <p className="text-red-500 text-sm mt-1">{errors.projectDescription}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Audience *</label>
          <TextInput
            placeholder="e.g., Executive team, Board of directors, Department heads"
            value={formData.targetAudience}
            onValueChange={(value) => updateFormData('targetAudience', value)}
            error={!!errors.targetAudience}
            errorMessage={errors.targetAudience}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Presentation Style</label>
            <Select
              value={formData.presentationStyle}
              onValueChange={(value) => updateFormData('presentationStyle', value)}
            >
              <SelectItem value="executive">Executive / McKinsey Style</SelectItem>
              <SelectItem value="technical">Technical / Detailed</SelectItem>
              <SelectItem value="creative">Creative / Visual</SelectItem>
              <SelectItem value="academic">Academic / Research</SelectItem>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estimated Slide Count</label>
            <TextInput
              type="number"
              placeholder="10"
              value={formData.slideCount.toString()}
              onValueChange={(value) => updateFormData('slideCount', parseInt(value) || 10)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </Card>
  )

  const renderStep2 = () => (
    <Card>
      <h2 className="text-xl font-bold mb-6">Business Context & Objectives</h2>
      
      <div className="space-y-8">
        {/* Business Goals */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium">Business Goals *</label>
            <Button 
              size="xs" 
              variant="secondary"
              onClick={() => addArrayItem('businessGoals')}
              icon={Plus}
            >
              Add Goal
            </Button>
          </div>
          
          <div className="space-y-3">
            {formData.businessGoals.map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
              >
                <TextInput
                  placeholder={`Business goal ${index + 1}`}
                  value={goal}
                  onValueChange={(value) => updateArrayField('businessGoals', index, value)}
                  className="flex-1"
                />
                {formData.businessGoals.length > 1 && (
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => removeArrayItem('businessGoals', index)}
                    icon={X}
                  />
                )}
              </motion.div>
            ))}
          </div>
          {errors.businessGoals && (
            <p className="text-red-500 text-sm mt-1">{errors.businessGoals}</p>
          )}
        </div>

        {/* Key Questions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium">Key Questions to Answer *</label>
            <Button 
              size="xs" 
              variant="secondary"
              onClick={() => addArrayItem('keyQuestions')}
              icon={Plus}
            >
              Add Question
            </Button>
          </div>
          
          <div className="space-y-3">
            {formData.keyQuestions.map((question, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
              >
                <TextInput
                  placeholder={`Key question ${index + 1}`}
                  value={question}
                  onValueChange={(value) => updateArrayField('keyQuestions', index, value)}
                  className="flex-1"
                />
                {formData.keyQuestions.length > 1 && (
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => removeArrayItem('keyQuestions', index)}
                    icon={X}
                  />
                )}
              </motion.div>
            ))}
          </div>
          {errors.keyQuestions && (
            <p className="text-red-500 text-sm mt-1">{errors.keyQuestions}</p>
          )}
        </div>

        {/* Factors */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium">Key Factors to Consider</label>
            <Button 
              size="xs" 
              variant="secondary"
              onClick={addFactor}
              icon={Plus}
            >
              Add Factor
            </Button>
          </div>
          
          <div className="space-y-4">
            {formData.factors.map((factor) => (
              <motion.div
                key={factor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Factor Name
                    </label>
                    <TextInput
                      placeholder="Enter factor name"
                      value={factor.name || ''}
                      onValueChange={(value) => {
                        console.log(`Factor ${factor.id} name changing to:`, value)
                        updateFactor(factor.id, 'name', value)
                      }}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <Select
                      value={factor.category || 'internal'}
                      onValueChange={(value) => {
                        console.log(`Factor ${factor.id} category changing to:`, value)
                        updateFactor(factor.id, 'category', value)
                      }}
                    >
                      <SelectItem value="internal">Internal Factor</SelectItem>
                      <SelectItem value="external">External Factor</SelectItem>
                      <SelectItem value="market">Market Factor</SelectItem>
                      <SelectItem value="operational">Operational Factor</SelectItem>
                    </Select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    placeholder="Describe this factor and its importance to your analysis"
                    value={factor.description || ''}
                    onValueChange={(value) => {
                      console.log(`Factor ${factor.id} description changing to:`, value)
                      updateFactor(factor.id, 'description', value)
                    }}
                    rows={2}
                    className="w-full"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Importance (1-10):</label>
                    <TextInput
                      type="number"
                      min="1"
                      max="10"
                      value={(factor.weight || 5).toString()}
                      onValueChange={(value) => {
                        const numValue = parseInt(value) || 5
                        console.log(`Factor ${factor.id} weight changing to:`, numValue)
                        updateFactor(factor.id, 'weight', Math.min(Math.max(numValue, 1), 10))
                      }}
                      className="w-20"
                    />
                  </div>
                  
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => removeFactor(factor.id)}
                    icon={X}
                  >
                    Remove
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )

  const renderStep3 = () => (
    <Card>
      <h2 className="text-xl font-bold mb-6">Data Upload & Context</h2>
      
      <div className="space-y-6">
        {/* Data Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Data Description *</label>
          <Textarea
            placeholder="Describe your data: what it contains, time period, source, etc."
            value={formData.dataDescription}
            onValueChange={(value) => updateFormData('dataDescription', value)}
            rows={4}
            className="w-full"
          />
          {errors.dataDescription && (
            <p className="text-red-500 text-sm mt-1">{errors.dataDescription}</p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Upload Data Files *</label>
          <FileUploadZone
            onFilesUploaded={handleFileUpload}
            uploadedFiles={uploadedFiles}
            onRemoveFile={removeFile}
          />
          {errors.files && (
            <p className="text-red-500 text-sm mt-1">{errors.files}</p>
          )}
        </div>

        {/* Expected Insights */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium">Expected Insights</label>
            <Button 
              size="xs" 
              variant="secondary"
              onClick={() => addArrayItem('expectedInsights')}
              icon={Plus}
            >
              Add Insight
            </Button>
          </div>
          
          <div className="space-y-3">
            {formData.expectedInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
              >
                <TextInput
                  placeholder={`Expected insight ${index + 1}`}
                  value={insight}
                  onValueChange={(value) => updateArrayField('expectedInsights', index, value)}
                  className="flex-1"
                />
                {formData.expectedInsights.length > 1 && (
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => removeArrayItem('expectedInsights', index)}
                    icon={X}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Custom Requirements */}
        <div>
          <label className="block text-sm font-medium mb-2">Custom Requirements</label>
          <Textarea
            placeholder="Any specific requirements, constraints, or preferences for the analysis"
            value={formData.customRequirements}
            onValueChange={(value) => updateFormData('customRequirements', value)}
            rows={3}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  )

  const renderStep4 = () => (
    <Card>
      <h2 className="text-xl font-bold mb-6">Final Preferences</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Template Preference</label>
            <Select
              value={formData.templatePreference}
              onValueChange={(value) => updateFormData('templatePreference', value)}
            >
              <SelectItem value="mckinsey">McKinsey Style</SelectItem>
              <SelectItem value="bcg">BCG Style</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="modern">Modern</SelectItem>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Project Timeframe</label>
            <Select
              value={formData.timeframe}
              onValueChange={(value) => updateFormData('timeframe', value)}
            >
              <SelectItem value="7 days">7 days</SelectItem>
              <SelectItem value="30 days">30 days</SelectItem>
              <SelectItem value="90 days">90 days</SelectItem>
              <SelectItem value="6 months">6 months</SelectItem>
              <SelectItem value="1 year">1 year</SelectItem>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Include Executive Summary</label>
              <p className="text-xs text-gray-500">Add a high-level summary slide</p>
            </div>
            <Toggle
              checked={formData.includeExecutiveSummary}
              onChange={(checked) => updateFormData('includeExecutiveSummary', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Include Appendix</label>
              <p className="text-xs text-gray-500">Add detailed data and methodology</p>
            </div>
            <Toggle
              checked={formData.includeAppendix}
              onChange={(checked) => updateFormData('includeAppendix', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Include Data Sources</label>
              <p className="text-xs text-gray-500">Reference data sources and methodology</p>
            </div>
            <Toggle
              checked={formData.includeDataSources}
              onChange={(checked) => updateFormData('includeDataSources', checked)}
            />
          </div>
        </div>
      </div>
    </Card>
  )

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Progress Indicator */}
      <Card>
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  step <= currentStep
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div className={`flex-1 h-0.5 mx-4 ${step < currentStep ? 'bg-blue-500' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex justify-between mt-4 text-sm">
          <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Project Info
          </span>
          <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Objectives
          </span>
          <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Data Upload
          </span>
          <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Preferences
          </span>
        </div>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <Card>
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={handleNextStep}
              icon={ArrowRight}
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              icon={isSubmitting ? undefined : Save}
            >
              {isSubmitting ? 'Creating Presentation...' : 'Create Presentation'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

// ==========================================
// FILE UPLOAD COMPONENT
// ==========================================

interface FileUploadZoneProps {
  onFilesUploaded: (files: FileList) => void
  uploadedFiles: File[]
  onRemoveFile: (index: number) => void
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ 
  onFilesUploaded, 
  uploadedFiles, 
  onRemoveFile 
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      onFilesUploaded(e.dataTransfer.files)
    }
  }, [onFilesUploaded])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesUploaded(e.target.files)
    }
  }, [onFilesUploaded])

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700 mb-1">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Supports CSV, JSON, Excel files
        </p>
        <input
          type="file"
          multiple
          accept=".csv,.json,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 cursor-pointer"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </label>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Files:</p>
          {uploadedFiles.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                size="xs"
                variant="secondary"
                onClick={() => onRemoveFile(index)}
                icon={X}
              >
                Remove
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EnhancedDataIntake