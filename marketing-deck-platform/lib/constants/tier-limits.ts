// Centralized tier limits - used across the entire application
export const TIER_LIMITS = {
  starter: {
    presentations: 5,
    teamMembers: 1,
    storage: 1000, // MB
    exports: 10,
    data_uploads: 10,
    ai_analyses: 5,
    features: ['basic_ai', 'standard_templates', 'pdf_export', 'email_support']
  },
  professional: {
    presentations: 25,
    teamMembers: 5,
    storage: 10000, // 10GB
    exports: 100,
    data_uploads: 100,
    ai_analyses: 25,
    features: ['advanced_ai', 'premium_templates', 'powerpoint_export', 'priority_support', 'custom_branding', 'api_access']
  },
  enterprise: {
    presentations: -1, // unlimited
    teamMembers: -1,
    storage: -1,
    exports: -1,
    data_uploads: -1,
    ai_analyses: -1,
    features: ['custom_ai', 'custom_templates', 'all_exports', 'phone_support', 'sso', 'dedicated_manager', 'sla']
  }
} as const;

export type TierName = keyof typeof TIER_LIMITS;
export type TierFeature = typeof TIER_LIMITS[TierName]['features'][number];

// Valid actions for usage tracking
export const VALID_USAGE_ACTIONS = ['presentations', 'data_uploads', 'ai_analyses', 'exports', 'storage'] as const;
export type UsageAction = typeof VALID_USAGE_ACTIONS[number];

// Tier information for UI display
export const TIER_INFO = {
  starter: {
    name: 'Starter',
    price: '$29/month',
    yearlyPrice: '$290/year',
    color: 'blue',
    description: 'Perfect for individuals and small teams getting started',
    limits: TIER_LIMITS.starter
  },
  professional: {
    name: 'Professional',
    price: '$99/month',
    yearlyPrice: '$990/year',
    color: 'purple',
    description: 'Advanced features for growing businesses and marketing teams',
    limits: TIER_LIMITS.professional
  },
  enterprise: {
    name: 'Enterprise',
    price: '$299/month',
    yearlyPrice: '$2,990/year',
    color: 'gold',
    description: 'Unlimited power with enterprise-grade features and support',
    limits: TIER_LIMITS.enterprise
  }
} as const;

// Helper functions
export function getTierLimit(tier: TierName, action: UsageAction): number {
  return TIER_LIMITS[tier][action];
}

export function canPerformAction(tier: TierName, action: UsageAction, currentUsage: number): boolean {
  const limit = getTierLimit(tier, action);
  return limit === -1 || currentUsage < limit;
}

export function hasFeature(tier: TierName, feature: string): boolean {
  return TIER_LIMITS[tier].features.includes(feature as TierFeature);
}

export function getUsagePercentage(tier: TierName, action: UsageAction, currentUsage: number): number {
  const limit = getTierLimit(tier, action);
  if (limit === -1) return 0; // Unlimited
  return Math.min((currentUsage / limit) * 100, 100);
}

export function isNearLimit(tier: TierName, action: UsageAction, currentUsage: number, threshold: number = 80): boolean {
  return getUsagePercentage(tier, action, currentUsage) >= threshold;
}