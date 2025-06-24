'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Check, ArrowLeft, Lock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSendResetEmail: (email: string) => Promise<boolean>
}

type Step = 'email' | 'sent' | 'error'

export function ForgotPasswordModal({
  isOpen,
  onClose,
  onSendResetEmail
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [currentStep, setCurrentStep] = useState<Step>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendReset = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const success = await onSendResetEmail(email)
      if (success) {
        setCurrentStep('sent')
      } else {
        setCurrentStep('error')
        setError('Failed to send reset email. Please try again.')
      }
    } catch (err) {
      setCurrentStep('error')
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleClose = () => {
    setEmail('')
    setCurrentStep('email')
    setError('')
    setIsLoading(false)
    onClose()
  }

  const handleBackToEmail = () => {
    setCurrentStep('email')
    setError('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4"
            >
              {currentStep === 'email' && <Lock className="w-6 h-6" />}
              {currentStep === 'sent' && <Check className="w-6 h-6" />}
              {currentStep === 'error' && <Mail className="w-6 h-6" />}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold mb-1"
            >
              {currentStep === 'email' && 'Reset Your Password'}
              {currentStep === 'sent' && 'Check Your Email'}
              {currentStep === 'error' && 'Try Again'}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-blue-100 text-sm"
            >
              {currentStep === 'email' && 'Enter your email and we\'ll send you a reset link'}
              {currentStep === 'sent' && 'We\'ve sent a password reset link to your email'}
              {currentStep === 'error' && 'Something went wrong, please try again'}
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {currentStep === 'email' && (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="mt-1 relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className={`pl-10 ${error ? 'border-red-500' : ''}`}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendReset()}
                        disabled={isLoading}
                      />
                    </div>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {error}
                      </motion.p>
                    )}
                  </div>

                  <Button
                    onClick={handleSendReset}
                    disabled={isLoading || !email}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      onClick={handleClose}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'sent' && (
                <motion.div
                  key="sent-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Check className="w-8 h-8 text-green-600" />
                  </motion.div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Email Sent!</h3>
                    <p className="text-gray-600 text-sm">
                      We've sent a password reset link to{' '}
                      <span className="font-medium text-gray-900">{email}</span>
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <Shield className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Security tip:</p>
                        <p>The reset link will expire in 1 hour for your security.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">
                      Didn't receive the email? Check your spam folder.
                    </p>
                    <button
                      onClick={handleBackToEmail}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Try a different email address
                    </button>
                  </div>

                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="w-full"
                  >
                    Close
                  </Button>
                </motion.div>
              )}

              {currentStep === 'error' && (
                <motion.div
                  key="error-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <X className="w-8 h-8 text-red-600" />
                  </motion.div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Something Went Wrong</h3>
                    <p className="text-gray-600 text-sm">{error}</p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleBackToEmail}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>

                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}