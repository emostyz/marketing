'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Edit3, MessageCircle, Sparkles, ArrowRight, ArrowLeft, Brain, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/textarea'

interface NarrativeStep {
  id: string
  title: string
  description: string
  slides: string[]
  rationale: string
  estimatedTime: number
}

interface NarrativeStructure {
  id: string
  title: string
  theme: string
  totalSlides: number
  estimatedDuration: number
  targetAudience: string
  keyMessage: string
  steps: NarrativeStep[]
  callToAction: string
}

interface Props {
  narrative: NarrativeStructure
  onConfirm: (confirmedNarrative: NarrativeStructure, feedback?: string) => void
  onRevise: (feedback: string) => void
  prevStep: () => void
  isLoading?: boolean
}

export const NarrativeConfirmationStep: React.FC<Props> = ({
  narrative,
  onConfirm,
  onRevise,
  prevStep,
  isLoading = false
}) => {
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [customizations, setCustomizations] = useState<{[key: string]: string}>({})

  const handleStepCustomization = (stepId: string, customization: string) => {
    setCustomizations(prev => ({ ...prev, [stepId]: customization }))
  }

  const handleConfirm = () => {
    const customizedNarrative = {
      ...narrative,
      steps: narrative.steps.map(step => ({
        ...step,
        description: customizations[step.id] || step.description
      }))
    }
    onConfirm(customizedNarrative, feedback)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Beautiful Header with Gradient Animation */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="relative inline-block mb-6">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -inset-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-full opacity-20 blur-2xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          </motion.div>
        </div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
        >
          AI-Generated Narrative Structure
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-xl text-gray-300 max-w-2xl mx-auto"
        >
          Our AI has crafted a compelling narrative for your presentation. Review and customize before we create your slides.
        </motion.p>
      </motion.div>

      {/* Narrative Overview Card */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{narrative.totalSlides}</div>
              <div className="text-sm text-gray-400">Total Slides</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{narrative.estimatedDuration}m</div>
              <div className="text-sm text-gray-400">Est. Duration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">{narrative.steps.length}</div>
              <div className="text-sm text-gray-400">Story Sections</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">CEO</div>
              <div className="text-sm text-gray-400">Quality Level</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Core Message</h3>
            <p className="text-gray-300">{narrative.keyMessage}</p>
          </div>
        </Card>
      </motion.div>

      {/* Narrative Steps */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
          Story Structure
        </h2>
        
        <div className="space-y-3">
          {narrative.steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${selectedStep === step.id ? 'ring-2 ring-blue-500' : ''}`}
            >
              <Card 
                className="p-6 bg-gradient-to-r from-gray-900/60 to-gray-800/60 border-gray-700/30 backdrop-blur-sm hover:from-gray-900/80 hover:to-gray-800/80 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4"
                      >
                        {index + 1}
                      </motion.div>
                      <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                      <span className="ml-auto text-sm text-gray-400">{step.slides.length} slides</span>
                    </div>
                    
                    <p className="text-gray-300 mb-3">{customizations[step.id] || step.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {step.slides.map((slide, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm text-blue-300"
                        >
                          {slide}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedStep(step.id)
                      setIsEditing(true)
                    }}
                    className="ml-4 p-2 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </motion.button>
                </div>
                
                <AnimatePresence>
                  {selectedStep === step.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-gray-700"
                    >
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">AI Rationale</h4>
                        <p className="text-gray-300 text-sm mb-3">{step.rationale}</p>
                        
                        <Textarea
                          placeholder="Customize this section (optional)..."
                          value={customizations[step.id] || ''}
                          onChange={(e) => handleStepCustomization(step.id, e.target.value)}
                          className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Global Feedback Section */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700/30">
          <div className="flex items-center mb-4">
            <MessageCircle className="w-6 h-6 text-purple-400 mr-2" />
            <h3 className="text-xl font-semibold text-white">Overall Feedback</h3>
          </div>
          
          <Textarea
            placeholder="Any specific changes you'd like to the overall narrative structure? (e.g., 'Focus more on financial metrics', 'Add a competitive analysis section', 'Make it more technical for engineering audience')"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px] bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
          />
          
          {feedback && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onRevise(feedback)}
              className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Regenerate with Feedback
            </motion.button>
          )}
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-between items-center pt-6"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={prevStep} variant="outline" size="lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Upload
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                />
                Creating Slides...
              </>
            ) : (
              <>
                Create My Slides
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}