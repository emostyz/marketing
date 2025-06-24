'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Crown, Zap, Sparkles, Check, ArrowRight, Star,
  BarChart3, FileDown, Palette, Users, Cloud, Shield,
  Clock, Headphones, Rocket, Gift
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface TierLimitModalProps {
  isOpen: boolean
  onClose: () => void
  currentTier: 'free' | 'pro' | 'enterprise'
  limitType: 'presentations' | 'slides' | 'storage' | 'exports' | 'features'
  currentUsage: number
  maxUsage: number
  onUpgrade: (tier: 'pro' | 'enterprise') => void
}

const tierConfig = {
  free: {
    name: 'Free',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: Zap,
    price: '$0',
    period: 'forever'
  },
  pro: {
    name: 'Pro',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Crown,
    price: '$19',
    period: 'per month'
  },
  enterprise: {
    name: 'Enterprise',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: Rocket,
    price: '$99',
    period: 'per month'
  }
}

const features = {
  free: [
    { name: '3 presentations', included: true },
    { name: '10 slides per presentation', included: true },
    { name: 'Basic templates', included: true },
    { name: 'PDF export', included: true },
    { name: 'Email support', included: true },
    { name: 'Advanced AI analysis', included: false },
    { name: 'Premium templates', included: false },
    { name: 'PowerPoint export', included: false },
    { name: 'Team collaboration', included: false },
    { name: 'Priority support', included: false }
  ],
  pro: [
    { name: 'Unlimited presentations', included: true },
    { name: 'Unlimited slides', included: true },
    { name: 'All premium templates', included: true },
    { name: 'PowerPoint & PDF export', included: true },
    { name: 'Advanced AI analysis', included: true },
    { name: 'Custom branding', included: true },
    { name: 'Priority email support', included: true },
    { name: 'Team collaboration (5 users)', included: true },
    { name: 'Version history', included: true },
    { name: 'API access', included: false }
  ],
  enterprise: [
    { name: 'Everything in Pro', included: true },
    { name: 'Unlimited team members', included: true },
    { name: 'Advanced analytics', included: true },
    { name: 'White-label solution', included: true },
    { name: 'SSO integration', included: true },
    { name: 'Dedicated support', included: true },
    { name: 'Custom integrations', included: true },
    { name: 'SLA guarantee', included: true },
    { name: 'Training & onboarding', included: true },
    { name: 'Full API access', included: true }
  ]
}

export function TierLimitModal({
  isOpen,
  onClose,
  currentTier,
  limitType,
  currentUsage,
  maxUsage,
  onUpgrade
}: TierLimitModalProps) {
  const [selectedTier, setSelectedTier] = useState<'pro' | 'enterprise'>('pro')
  const [isAnimating, setIsAnimating] = useState(false)

  const usagePercent = (currentUsage / maxUsage) * 100

  const limitMessages = {
    presentations: {
      title: 'Presentation Limit Reached',
      description: `You've reached your limit of ${maxUsage} presentations on the ${tierConfig[currentTier].name} plan.`,
      emoji: '📊'
    },
    slides: {
      title: 'Slide Limit Reached', 
      description: `You've reached your limit of ${maxUsage} slides per presentation on the ${tierConfig[currentTier].name} plan.`,
      emoji: '📄'
    },
    storage: {
      title: 'Storage Limit Reached',
      description: `You've used ${currentUsage}MB of your ${maxUsage}MB storage on the ${tierConfig[currentTier].name} plan.`,
      emoji: '💾'
    },
    exports: {
      title: 'Export Limit Reached',
      description: `You've reached your monthly export limit of ${maxUsage} on the ${tierConfig[currentTier].name} plan.`,
      emoji: '📤'
    },
    features: {
      title: 'Premium Feature Required',
      description: `This feature is not available on the ${tierConfig[currentTier].name} plan.`,
      emoji: '✨'
    }
  }

  const currentMessage = limitMessages[limitType]
  const CurrentTierIcon = tierConfig[currentTier].icon

  const handleUpgrade = async (tier: 'pro' | 'enterprise') => {
    setIsAnimating(true)
    
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onUpgrade(tier)
    setIsAnimating(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
              >
                <span className="text-2xl">{currentMessage.emoji}</span>
              </motion.div>
              
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold"
                >
                  {currentMessage.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-blue-100"
                >
                  {currentMessage.description}
                </motion.p>
              </div>
            </div>

            {/* Usage Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <div className="flex justify-between text-sm mb-2">
                <span>Current Usage</span>
                <span>{currentUsage} / {maxUsage}</span>
              </div>
              <Progress value={usagePercent} className="h-2 bg-white bg-opacity-20" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {/* Current Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CurrentTierIcon className={`w-5 h-5 mr-2 ${tierConfig[currentTier].color}`} />
                You're currently on the {tierConfig[currentTier].name} plan
              </h3>
              
              <Card className={`border-2 ${tierConfig[currentTier].bgColor}`}>
                <CardContent className="p-4">
                  <p className="text-gray-700">
                    To continue creating amazing presentations, upgrade to unlock more features and higher limits.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upgrade Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                Choose your upgrade
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Pro Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`relative overflow-hidden border-2 rounded-xl transition-all cursor-pointer ${
                    selectedTier === 'pro' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedTier('pro')}
                >
                  {selectedTier === 'pro' && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Crown className="w-6 h-6 text-blue-600" />
                        <h4 className="text-xl font-bold">Pro</h4>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">Most Popular</Badge>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-blue-600">$19</span>
                      <span className="text-gray-600 ml-2">per month</span>
                    </div>
                    
                    <ul className="space-y-2 mb-6">
                      {features.pro.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature.name}
                        </li>
                      ))}
                      <li className="text-sm text-gray-500">+ 4 more features</li>
                    </ul>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleUpgrade('pro')}
                      disabled={isAnimating}
                    >
                      {isAnimating && selectedTier === 'pro' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          Upgrade to Pro
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>

                {/* Enterprise Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`relative overflow-hidden border-2 rounded-xl transition-all cursor-pointer ${
                    selectedTier === 'enterprise' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedTier('enterprise')}
                >
                  {selectedTier === 'enterprise' && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Rocket className="w-6 h-6 text-purple-600" />
                        <h4 className="text-xl font-bold">Enterprise</h4>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700">Enterprise</Badge>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-purple-600">$99</span>
                      <span className="text-gray-600 ml-2">per month</span>
                    </div>
                    
                    <ul className="space-y-2 mb-6">
                      {features.enterprise.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature.name}
                        </li>
                      ))}
                      <li className="text-sm text-gray-500">+ 5 more features</li>
                    </ul>

                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => handleUpgrade('enterprise')}
                      disabled={isAnimating}
                    >
                      {isAnimating && selectedTier === 'enterprise' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          Upgrade to Enterprise
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 text-center"
            >
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  Secure payments
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Cancel anytime
                </div>
                <div className="flex items-center">
                  <Gift className="w-4 h-4 mr-1" />
                  30-day money back
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}