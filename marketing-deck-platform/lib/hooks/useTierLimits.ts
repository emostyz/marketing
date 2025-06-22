"use client"
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { TIER_LIMITS, VALID_USAGE_ACTIONS, type UsageAction, type TierName } from '@/lib/constants/tier-limits'

interface TierLimits {
  presentations: number
  teamMembers: number
  storage: number // MB
  exports: number
  features: string[]
}

interface UsageData {
  presentations_created: number
  data_uploads: number
  ai_analyses: number
  exports_generated: number
  storage_used_mb: number
}

interface SubscriptionInfo {
  plan: 'starter' | 'professional' | 'enterprise'
  presentationsUsed: number
  presentationLimit: number | string
  monthlyResetDate: string
  limits: TierLimits
  usage: UsageData
}

export function useTierLimits() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptionInfo = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch('/api/user/subscription')
      
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
        setError(null)
      } else {
        setError('Failed to fetch subscription info')
      }
    } catch (err) {
      setError('Failed to fetch subscription info')
      console.error('Subscription fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSubscriptionInfo()
  }, [fetchSubscriptionInfo])

  const checkLimit = useCallback(async (limitType: keyof TierLimits): Promise<{
    canPerform: boolean
    currentUsage: number
    limit: number | string
    needsUpgrade: boolean
  }> => {
    if (!user) {
      return { canPerform: false, currentUsage: 0, limit: 0, needsUpgrade: true }
    }

    try {
      const response = await fetch('/api/user/usage-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: limitType })
      })

      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Usage check error:', error)
    }

    // Fallback to local calculation
    if (subscription) {
      const limits = TIER_LIMITS[subscription.plan]
      const limit = limits[limitType]
      
      let currentUsage = 0
      if (limitType === 'presentations') {
        currentUsage = subscription.presentationsUsed
      } else if (limitType === 'exports') {
        currentUsage = subscription.usage.exports_generated
      } else if (limitType === 'storage') {
        currentUsage = subscription.usage.storage_used_mb
      }

      const canPerform = limit === -1 || currentUsage < limit
      
      return {
        canPerform,
        currentUsage,
        limit: limit === -1 ? 'unlimited' : limit,
        needsUpgrade: !canPerform
      }
    }

    return { canPerform: false, currentUsage: 0, limit: 0, needsUpgrade: true }
  }, [user, subscription])

  const incrementUsage = useCallback(async (limitType: keyof TierLimits): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch('/api/user/usage-check', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: limitType })
      })

      if (response.ok) {
        // Refresh subscription info to get updated usage
        await fetchSubscriptionInfo()
        return true
      }
    } catch (error) {
      console.error('Usage increment error:', error)
    }

    return false
  }, [user, fetchSubscriptionInfo])

  const hasFeature = useCallback((feature: string): boolean => {
    if (!subscription) return false
    
    const tierFeatures = TIER_LIMITS[subscription.plan].features
    return tierFeatures.includes(feature as any)
  }, [subscription])

  const upgradePlan = useCallback(async (newPlan: 'professional' | 'enterprise'): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch('/api/user/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlan })
      })

      if (response.ok) {
        await fetchSubscriptionInfo()
        return true
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    }

    return false
  }, [user, fetchSubscriptionInfo])

  const getUsagePercentage = useCallback((limitType: keyof TierLimits): number => {
    if (!subscription) return 0

    const limits = TIER_LIMITS[subscription.plan]
    const limit = limits[limitType]
    
    if (limit === -1) return 0 // Unlimited

    let currentUsage = 0
    if (limitType === 'presentations') {
      currentUsage = subscription.presentationsUsed
    } else if (limitType === 'exports') {
      currentUsage = subscription.usage.exports_generated
    } else if (limitType === 'storage') {
      currentUsage = subscription.usage.storage_used_mb
    }

    return Math.min((currentUsage / limit) * 100, 100)
  }, [subscription])

  const isNearLimit = useCallback((limitType: keyof TierLimits, threshold: number = 80): boolean => {
    return getUsagePercentage(limitType) >= threshold
  }, [getUsagePercentage])

  const rollbackUsage = useCallback(async (limitType: keyof TierLimits, reason: string): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch('/api/user/usage-rollback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: limitType, reason })
      })

      if (response.ok) {
        // Refresh subscription info to get updated usage
        await fetchSubscriptionInfo()
        return true
      }
    } catch (error) {
      console.error('Usage rollback error:', error)
    }

    return false
  }, [user, fetchSubscriptionInfo])

  return {
    subscription,
    loading,
    error,
    checkLimit,
    incrementUsage,
    rollbackUsage,
    hasFeature,
    upgradePlan,
    getUsagePercentage,
    isNearLimit,
    refreshSubscription: fetchSubscriptionInfo,
    tierLimits: subscription ? TIER_LIMITS[subscription.plan] : null
  }
}

export type { TierLimits, UsageData, SubscriptionInfo }