"use client"
import { useState, useEffect } from 'react'
import { X, Crown, Zap, Star, ArrowRight, Check, AlertCircle } from 'lucide-react'
import { TIER_INFO, TIER_LIMITS } from '@/lib/constants/tier-limits'

interface UpgradePromptProps {
  currentPlan: 'starter' | 'professional' | 'enterprise'
  limitType: 'presentations' | 'team_members' | 'storage' | 'exports'
  currentUsage: number
  limit: number
  onUpgrade: (plan: 'professional' | 'enterprise') => void
  onClose: () => void
}

const TIER_ICONS = {
  starter: Zap,
  professional: Star,
  enterprise: Crown
}

const LIMIT_MESSAGES = {
  presentations: {
    title: "You've reached your presentation limit",
    description: "Create more amazing presentations by upgrading your plan"
  },
  team_members: {
    title: "Team member limit reached",
    description: "Add more team members by upgrading your plan"
  },
  storage: {
    title: "Storage limit reached",
    description: "Get more storage space by upgrading your plan"
  },
  exports: {
    title: "Export limit reached",
    description: "Export more presentations by upgrading your plan"
  }
}

export default function UpgradePrompt({ 
  currentPlan, 
  limitType, 
  currentUsage, 
  limit, 
  onUpgrade, 
  onClose 
}: UpgradePromptProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'professional' | 'enterprise'>('professional')
  const [error, setError] = useState('')

  const message = LIMIT_MESSAGES[limitType]
  const currentTier = TIER_INFO[currentPlan]

  // Add keyboard event handler for escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Focus management for accessibility
  useEffect(() => {
    const firstFocusableElement = document.querySelector('[data-focus-first]') as HTMLElement
    if (firstFocusableElement) {
      firstFocusableElement.focus()
    }
  }, [])

  const handleUpgrade = async (plan: 'professional' | 'enterprise') => {
    setLoading(true)
    setError('')
    
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })

      if (response.ok) {
        const { url } = await response.json()
        if (url) {
          // Redirect to Stripe checkout
          window.location.href = url
          return
        } else {
          throw new Error('No checkout URL received')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Stripe checkout failed:', error)
      setError(error instanceof Error ? error.message : 'Checkout failed')
      
      try {
        // Fallback to direct upgrade
        await onUpgrade(plan)
      } catch (fallbackError) {
        console.error('Fallback upgrade failed:', fallbackError)
        setError('Unable to process upgrade. Please try again or contact support.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getRecommendedPlan = () => {
    if (currentPlan === 'starter') {
      return currentUsage > 15 ? 'enterprise' : 'professional'
    }
    return 'enterprise'
  }

  const recommendedPlan = getRecommendedPlan()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" aria-labelledby="upgrade-title">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="upgrade-title" className="text-2xl font-bold text-white">{message.title}</h2>
              <p className="text-gray-400">{message.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close upgrade prompt"
            data-focus-first
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Usage */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Current Usage</span>
            <span className="text-white font-semibold">
              {currentUsage}/{limit === -1 ? '∞' : limit}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
              style={{ width: limit === -1 ? '0%' : `${Math.min((currentUsage / limit) * 100, 100)}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">
            You're on the <span className="text-blue-400 font-medium">{currentTier.name}</span> plan
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Upgrade Options */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Choose Your Upgrade</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Professional Plan */}
            {currentPlan !== 'professional' && (
              <div 
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedPlan === 'professional' 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50'
                }`}
                onClick={() => setSelectedPlan('professional')}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Professional</h4>
                    <p className="text-gray-400">$99/month</p>
                  </div>
                  {recommendedPlan === 'professional' && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full ml-auto">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  {TIER_LIMITS.professional.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check className="w-3 h-3 text-green-400" />
                      <span>{feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  ))}
                  {TIER_LIMITS.professional.features.length > 4 && (
                    <p className="text-gray-400 text-sm">+ {TIER_LIMITS.professional.features.length - 4} more features</p>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-2">
                    {limitType === 'presentations' ? '25 presentations/month' : 'Higher limits on everything'}
                  </p>
                  {selectedPlan === 'professional' && (
                    <div className="flex items-center justify-center gap-2 text-purple-400">
                      <ArrowRight className="w-4 h-4" />
                      <span className="text-sm">Selected</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enterprise Plan */}
            <div 
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlan === 'enterprise' 
                  ? 'border-yellow-500 bg-yellow-500/10' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-yellow-500/50'
              }`}
              onClick={() => setSelectedPlan('enterprise')}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Enterprise</h4>
                  <p className="text-gray-400">$299/month</p>
                </div>
                {recommendedPlan === 'enterprise' && (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full ml-auto">
                    Recommended
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-6">
                {TIER_LIMITS.enterprise.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>{feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                ))}
                {TIER_LIMITS.enterprise.features.length > 4 && (
                  <p className="text-gray-400 text-sm">+ {TIER_LIMITS.enterprise.features.length - 4} more features</p>
                )}
              </div>

              <div className="text-center">
                <p className="text-gray-300 text-sm mb-2">
                  Unlimited {limitType.replace('_', ' ')} and everything else
                </p>
                {selectedPlan === 'enterprise' && (
                  <div className="flex items-center justify-center gap-2 text-yellow-400">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-sm">Selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={() => handleUpgrade(selectedPlan)}
            disabled={loading}
            className={`flex-1 py-3 rounded-lg font-medium transition-all disabled:opacity-50 ${
              selectedPlan === 'professional'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {loading ? 'Processing...' : `Upgrade to ${TIER_INFO[selectedPlan].name}`}
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
          >
            Maybe Later
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>30-day money back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Instant upgrade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}