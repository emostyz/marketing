'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, FileText, Building, Users, ArrowRight, LucideProps } from 'lucide-react'
import { Button } from '@/components/ui/button'
// Use native HTML inputs to ensure they work properly
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

interface FormFieldProps {
  icon: React.ReactElement<LucideProps>;
  label: string;
  children: React.ReactNode;
}

// A single input field with a label and icon
const FormField: React.FC<FormFieldProps> = ({ icon, label, children }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
      {React.cloneElement(icon, { className: "w-5 h-5 text-blue-400" })}
    </div>
    <div className="flex-grow">
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      {children}
    </div>
  </div>
)

interface DataContext {
  description: string;
  industry: string;
  targetAudience: string;
  businessContext: string;
  keyMetrics: string;
}

interface DescribeDataStepProps {
  dataContext: DataContext;
  setDataContext: React.Dispatch<React.SetStateAction<DataContext>>;
  nextStep: () => void;
}

export const DescribeDataStep: React.FC<DescribeDataStepProps> = ({ dataContext, setDataContext, nextStep }) => {
  const [errors, setErrors] = React.useState<{[key: string]: string}>({})
  const [isSaving, setIsSaving] = React.useState(false)
  
  // Debug log the current dataContext
  React.useEffect(() => {
    console.log('DataContext updated:', dataContext)
  }, [dataContext])

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const savedContext = localStorage.getItem('data_context')
      if (savedContext && !dataContext.description) {
        const parsed = JSON.parse(savedContext)
        setDataContext(parsed)
      }
    } catch (error) {
      console.error('Failed to load saved context:', error)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (field: string, value: string) => {
    console.log('Input change:', field, value) // Debug log
    const newContext = { ...dataContext, [field]: value }
    setDataContext(newContext)
    
    // Also save to localStorage immediately for persistence
    try {
      localStorage.setItem('data_context', JSON.stringify(newContext))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
    
    // Clear error when user starts typing
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
      // Save to user profile and presentation history
      let saveSuccessful = false
      
      try {
        // Save to profile
        const profileResponse = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            industry: dataContext.industry,
            targetAudience: dataContext.targetAudience,
            businessContext: dataContext.businessContext,
            keyMetrics: dataContext.keyMetrics,
            dataDescription: dataContext.description,
            lastUpdated: new Date().toISOString()
          })
        })
        
        if (!profileResponse.ok) {
          console.error('Profile save failed:', await profileResponse.text())
        }
        
        // Save presentation session
        const sessionResponse = await fetch('/api/presentations/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'data_intake',
            data: dataContext,
            timestamp: new Date().toISOString()
          })
        })
        
        const sessionResult = await sessionResponse.json()
        
        if (sessionResponse.ok) {
          saveSuccessful = true
          
          // If using localStorage fallback, save there too
          if (sessionResult.useLocalStorage) {
            const sessionData = {
              step: 'data_intake',
              data: dataContext,
              timestamp: new Date().toISOString()
            }
            
            // Get existing session or create new
            const existingSession = localStorage.getItem('presentation_session')
            const session = existingSession ? JSON.parse(existingSession) : {
              startedAt: new Date().toISOString(),
              steps: {}
            }
            
            session.steps.data_intake = sessionData
            session.lastUpdated = new Date().toISOString()
            session.currentStep = 'data_intake'
            
            localStorage.setItem('presentation_session', JSON.stringify(session))
            localStorage.setItem('data_context', JSON.stringify(dataContext))
          }
        } else {
          // Error handling: show specific error for 401 (not logged in), log all errors for debugging
          if (sessionResponse.status === 401) {
            setErrors({ description: 'You must be logged in to save your data. Please log in and try again.' })
          } else {
            setErrors({ description: sessionResult.error || 'Failed to save data. Please try again.' })
          }
          console.error('Failed to save data:', sessionResult)
        }
      } catch (error) {
        console.error('Failed to save data:', error)
        
        // Fallback to localStorage
        try {
          const sessionData = {
            step: 'data_intake',
            data: dataContext,
            timestamp: new Date().toISOString()
          }
          
          const existingSession = localStorage.getItem('presentation_session')
          const session = existingSession ? JSON.parse(existingSession) : {
            startedAt: new Date().toISOString(),
            steps: {}
          }
          
          session.steps.data_intake = sessionData
          session.lastUpdated = new Date().toISOString()
          session.currentStep = 'data_intake'
          
          localStorage.setItem('presentation_session', JSON.stringify(session))
          localStorage.setItem('data_context', JSON.stringify(dataContext))
          saveSuccessful = true
        } catch (localError) {
          console.error('localStorage save also failed:', localError)
        }
      }
      
      if (saveSuccessful) {
        nextStep()
      } else {
        setErrors({ description: 'Failed to save data. Please try again.' })
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-8"
    >
      {/* Beautiful gradient header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="relative inline-block">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full opacity-20 blur-xl"
          />
          <h1 className="relative text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Tell Us About Your Data
          </h1>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-300 mt-4"
        >
          Help our AI understand your context to create stunning insights
        </motion.p>
      </motion.div>

      <Card className="p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50 backdrop-blur-xl relative z-10">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <FormField icon={<FileText />} label="What is the data about? *">
              <textarea
                id="description-input"
                name="description"
                placeholder="e.g., Monthly sales figures for our e-commerce store, customer satisfaction scores, website traffic analytics..."
                value={dataContext.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  console.log('Textarea onChange triggered:', e.target.value)
                  handleInputChange('description', e.target.value)
                }}
                onFocus={() => console.log('Textarea focused')}
                className={`min-h-[120px] w-full p-3 rounded-lg bg-gray-800 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? 'border-red-500' : 'border-gray-600'}`}
                style={{ pointerEvents: 'auto', zIndex: 1 }}
                autoComplete="off"
              />
              {errors.description && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
                >
                  {errors.description}
                </motion.p>
              )}
            </FormField>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <FormField icon={<Building />} label="What is your industry? *">
              <input
                type="text"
                id="industry-input"
                name="industry"
                placeholder="e.g., SaaS, Retail, Healthcare, Fintech..."
                value={dataContext.industry || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  console.log('Industry onChange triggered:', e.target.value)
                  handleInputChange('industry', e.target.value)
                }}
                onFocus={() => console.log('Industry input focused')}
                className={`w-full p-3 rounded-lg bg-gray-800 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.industry ? 'border-red-500' : 'border-gray-600'}`}
                style={{ pointerEvents: 'auto', zIndex: 1 }}
                autoComplete="off"
              />
              {errors.industry && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
                >
                  {errors.industry}
                </motion.p>
              )}
            </FormField>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <FormField icon={<Users />} label="Who is the target audience for this presentation? *">
              <input
                type="text"
                id="target-audience-input"
                name="targetAudience"
                placeholder="e.g., C-level executives, potential investors, marketing team..."
                value={dataContext.targetAudience || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  console.log('Target audience onChange triggered:', e.target.value)
                  handleInputChange('targetAudience', e.target.value)
                }}
                onFocus={() => console.log('Target audience input focused')}
                className={`w-full p-3 rounded-lg bg-gray-800 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.targetAudience ? 'border-red-500' : 'border-gray-600'}`}
                style={{ pointerEvents: 'auto', zIndex: 1 }}
                autoComplete="off"
              />
              {errors.targetAudience && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
                >
                  {errors.targetAudience}
                </motion.p>
              )}
            </FormField>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <FormField icon={<Lightbulb />} label="Business Context (Optional)">
              <textarea
                id="business-context-input"
                name="businessContext"
                placeholder="e.g., We're preparing for Series A funding, looking to expand into new markets, or presenting quarterly results..."
                value={dataContext.businessContext || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  console.log('Business context onChange triggered:', e.target.value)
                  handleInputChange('businessContext', e.target.value)
                }}
                onFocus={() => console.log('Business context focused')}
                className="min-h-[80px] w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ pointerEvents: 'auto', zIndex: 1 }}
                autoComplete="off"
              />
            </FormField>
          </motion.div>
        </div>
      </Card>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex justify-end"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={async () => {
              setIsSaving(true)
              await validateAndContinue()
              setIsSaving(false)
            }} 
            disabled={isSaving}
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? 'Saving...' : 'Continue'}
            {!isSaving && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
} 