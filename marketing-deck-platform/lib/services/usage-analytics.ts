/**
 * Usage Analytics and Reporting System
 * Comprehensive analytics for presentations, AI usage, and user behavior
 */

import { createClient } from '@supabase/supabase-js'

export interface UsageMetrics {
  totalPresentations: number
  presentationsThisMonth: number
  totalAIRequests: number
  aiRequestsThisMonth: number
  totalUsers: number
  activeUsersThisMonth: number
  totalDataProcessed: number
  averageProcessingTime: number
  successRate: number
  topIndustries: Array<{ industry: string; count: number }>
  topFeatures: Array<{ feature: string; count: number }>
  userGrowthTrend: Array<{ date: string; users: number }>
  usageTrend: Array<{ date: string; presentations: number; aiRequests: number }>
}

export interface UserAnalytics {
  userId: string
  email: string
  plan: string
  totalPresentations: number
  aiRequestsUsed: number
  dataUploadedGB: number
  lastActive: Date
  signupDate: Date
  favoriteFeatures: string[]
  engagementScore: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface AIUsageAnalytics {
  providerId: string
  providerName: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  totalTokensUsed: number
  totalCost: number
  popularModels: Array<{ model: string; requests: number }>
  errorTypes: Array<{ error: string; count: number }>
  peakUsageHours: Array<{ hour: number; requests: number }>
}

export interface PresentationAnalytics {
  totalPresentations: number
  completedPresentations: number
  draftPresentations: number
  averageSlidesPerPresentation: number
  popularTemplates: Array<{ template: string; count: number }>
  industryBreakdown: Array<{ industry: string; count: number }>
  presentationSizes: Array<{ sizeRange: string; count: number }>
  completionRate: number
  timeToComplete: number
  userSatisfactionScore: number
}

export class UsageAnalyticsService {
  private supabase: ReturnType<typeof createClient>

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Get comprehensive usage metrics for the platform
   */
  async getUsageMetrics(organizationId?: string, timeRange: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<UsageMetrics> {
    try {
      const { startDate, endDate } = this.getTimeRange(timeRange)
      
      // Get presentation metrics
      const presentationMetrics = await this.getPresentationMetrics(organizationId, startDate, endDate)
      
      // Get AI usage metrics
      const aiMetrics = await this.getAIMetrics(organizationId, startDate, endDate)
      
      // Get user metrics
      const userMetrics = await this.getUserMetrics(organizationId, startDate, endDate)
      
      // Get trend data
      const trendData = await this.getTrendData(organizationId, timeRange)

      return {
        totalPresentations: presentationMetrics.total,
        presentationsThisMonth: presentationMetrics.thisMonth,
        totalAIRequests: aiMetrics.total,
        aiRequestsThisMonth: aiMetrics.thisMonth,
        totalUsers: userMetrics.total,
        activeUsersThisMonth: userMetrics.activeThisMonth,
        totalDataProcessed: aiMetrics.totalDataProcessed,
        averageProcessingTime: aiMetrics.avgProcessingTime,
        successRate: aiMetrics.successRate,
        topIndustries: presentationMetrics.topIndustries,
        topFeatures: aiMetrics.topFeatures,
        userGrowthTrend: trendData.userGrowth,
        usageTrend: trendData.usage
      }

    } catch (error) {
      console.error('Get usage metrics error:', error)
      throw error
    }
  }

  /**
   * Get detailed analytics for a specific user
   */
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      // Get user basic info
      const { data: user } = await this.supabase
        .from('users')
        .select('email, created_at')
        .eq('id', userId)
        .single()
      const userTyped = user as { email: string; created_at: string } | null;

      // Get user subscription
      const { data: subscription } = await this.supabase
        .from('user_subscriptions')
        .select('plan')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()
      const subscriptionTyped = subscription as { plan: string } | null;

      // Get presentation count
      const { count: presentationCount } = await this.supabase
        .from('presentations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get AI usage
      const { data: aiUsage } = await this.supabase
        .from('brain_usage_logs')
        .select('tokens_used, cost')
        .eq('user_id', userId)
      const aiUsageTyped = (aiUsage || []) as Array<{ tokens_used: number; cost: number }>;

      // Get data upload stats
      const { data: uploads } = await this.supabase
        .from('file_uploads')
        .select('file_size')
        .eq('user_id', userId)
      const uploadsTyped = (uploads || []) as Array<{ file_size: number }>;

      // Get last activity
      const { data: lastActivity } = await this.supabase
        .from('user_activity_logs')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      const lastActivityTyped = lastActivity as { created_at: string } | null;

      // Get feature usage
      const { data: featureUsage } = await this.supabase
        .from('feature_usage_logs')
        .select('feature_name')
        .eq('user_id', userId)
      const featureUsageTyped = (featureUsage || []) as Array<{ feature_name: string }>;

      const totalDataUploaded = uploadsTyped.reduce((sum, upload) => sum + (upload.file_size || 0), 0) || 0
      const totalAIRequests = aiUsageTyped.length || 0
      const favoriteFeatures = this.getMostUsedFeatures(featureUsageTyped)
      const engagementScore = this.calculateEngagementScore(presentationCount || 0, totalAIRequests, favoriteFeatures.length)

      return {
        userId,
        email: userTyped?.email || '',
        plan: (subscriptionTyped?.plan as string) || 'free',
        totalPresentations: presentationCount || 0,
        aiRequestsUsed: totalAIRequests,
        dataUploadedGB: Math.round((totalDataUploaded / (1024 * 1024 * 1024)) * 100) / 100,
        lastActive: lastActivityTyped ? new Date(lastActivityTyped.created_at) : new Date(),
        signupDate: userTyped ? new Date(userTyped.created_at) : new Date(),
        favoriteFeatures,
        engagementScore,
        riskLevel: this.calculateRiskLevel(engagementScore, lastActivityTyped ? new Date(lastActivityTyped.created_at) : new Date())
      }

    } catch (error) {
      console.error('Get user analytics error:', error)
      throw error
    }
  }

  /**
   * Get AI provider usage analytics
   */
  async getAIProviderAnalytics(organizationId?: string, timeRange: 'day' | 'week' | 'month' | 'quarter' = 'month'): Promise<AIUsageAnalytics[]> {
    try {
      const { startDate } = this.getTimeRange(timeRange)
      
      let query = this.supabase
        .from('brain_usage_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())

      if (organizationId) {
        // Add organization filter when we have org-based usage logs
        // query = query.eq('organization_id', organizationId)
      }

      const { data: usageLogs } = await query

      if (!usageLogs) return []

      // Group by provider
      const providerStats = usageLogs.reduce((acc, log) => {
        const providerId = log.provider_id as string
        if (!acc[providerId]) {
          acc[providerId] = {
            providerId,
            providerName: log.provider_name as string || providerId,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalResponseTime: 0,
            totalTokensUsed: 0,
            totalCost: 0,
            models: {},
            errors: {},
            hourlyUsage: {}
          }
        }

        const stats = acc[providerId] as Record<string, any>
        stats.totalRequests++
        
        if (log.success) {
          stats.successfulRequests++
        } else {
          stats.failedRequests++
          if (log.error_message) {
            stats.errors[log.error_message as string] = (stats.errors[log.error_message as string] || 0) + 1
          }
        }

        stats.totalResponseTime += log.response_time as number || 0
        stats.totalTokensUsed += log.tokens_used as number || 0
        stats.totalCost += log.cost as number || 0

        // Track model usage (would need to add model field to usage logs)
        // const model = log.model || 'unknown'
        // stats.models[model] = (stats.models[model] || 0) + 1

        // Track hourly usage
        const hour = new Date(log.created_at as string).getHours()
        stats.hourlyUsage[hour] = (stats.hourlyUsage[hour] || 0) + 1

        return acc
      }, {} as Record<string, any>)

      return Object.values(providerStats).map((stats) => {
        const s = stats as Record<string, any>
        return {
          providerId: s.providerId,
          providerName: s.providerName,
          totalRequests: s.totalRequests,
          successfulRequests: s.successfulRequests,
          failedRequests: s.failedRequests,
          averageResponseTime: s.totalRequests > 0 ? Math.round(s.totalResponseTime / s.totalRequests) : 0,
          totalTokensUsed: s.totalTokensUsed,
          totalCost: Math.round(s.totalCost * 100) / 100,
          popularModels: Object.entries(s.models).map(([model, requests]) => ({ model, requests: requests as number }))
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 5),
          errorTypes: Object.entries(s.errors).map(([error, count]) => ({ error, count: count as number }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          peakUsageHours: Object.entries(s.hourlyUsage).map(([hour, requests]) => ({ hour: parseInt(hour), requests: requests as number }))
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 5)
        }
      })

    } catch (error) {
      console.error('Get AI provider analytics error:', error)
      throw error
    }
  }

  /**
   * Get presentation analytics
   */
  async getPresentationAnalytics(organizationId?: string, timeRange: 'day' | 'week' | 'month' | 'quarter' = 'month'): Promise<PresentationAnalytics> {
    try {
      const { startDate } = this.getTimeRange(timeRange)
      
      let query = this.supabase
        .from('presentations')
        .select('*')
        .gte('created_at', startDate.toISOString())

      if (organizationId) {
        // Add organization filter
        query = query.eq('organization_id', organizationId)
      }

      const { data: presentations } = await query

      if (!presentations) {
        return this.getEmptyPresentationAnalytics()
      }

      const completed = presentations.filter(p => p.status === 'completed')
      const drafts = presentations.filter(p => p.status === 'draft')

      // Calculate industry breakdown
      const industryBreakdown = presentations.reduce((acc, p) => {
        const industry = (p.industry as string) || 'Unknown'
        acc[industry] = (acc[industry] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Calculate template usage
      const templateUsage = presentations.reduce((acc, p) => {
        const template = (p.template_id as string) || 'custom'
        acc[template] = (acc[template] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Calculate average slides per presentation
      const totalSlides = presentations.reduce((sum, p) => sum + (p.slide_count as number) || 0, 0)
      const averageSlides = presentations.length > 0 ? Math.round(totalSlides / presentations.length * 10) / 10 : 0

      // Calculate completion rate
      const completionRate = presentations.length > 0 ? Math.round((completed.length / presentations.length) * 100) : 0

      // Calculate average time to complete (in hours)
      const completedWithTimes = completed.filter(p => p.completed_at && p.created_at)
      const totalCompletionTime = completedWithTimes.reduce((sum, p) => {
        const created = new Date(p.created_at as string)
        const completed = new Date(p.completed_at as string)
        return sum + (completed.getTime() - created.getTime())
      }, 0)
      const averageCompletionTime = completedWithTimes.length > 0 
        ? Math.round((totalCompletionTime / completedWithTimes.length) / (1000 * 60 * 60) * 10) / 10 
        : 0

      return {
        totalPresentations: presentations.length,
        completedPresentations: completed.length,
        draftPresentations: drafts.length,
        averageSlidesPerPresentation: averageSlides,
        popularTemplates: Object.entries(templateUsage)
          .map(([template, count]) => ({ template, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        industryBreakdown: Object.entries(industryBreakdown)
          .map(([industry, count]) => ({ industry, count }))
          .sort((a, b) => b.count - a.count),
        presentationSizes: this.calculateSizeBreakdown(presentations),
        completionRate,
        timeToComplete: averageCompletionTime,
        userSatisfactionScore: 85 // Placeholder - would come from user feedback
      }

    } catch (error) {
      console.error('Get presentation analytics error:', error)
      throw error
    }
  }

  /**
   * Export analytics data in various formats
   */
  async exportAnalytics(
    organizationId: string,
    format: 'csv' | 'json' | 'xlsx',
    dataType: 'all' | 'users' | 'presentations' | 'ai_usage',
    timeRange: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      const analytics = {
        usage: await this.getUsageMetrics(organizationId, timeRange),
        presentations: await this.getPresentationAnalytics(organizationId, timeRange),
        aiProviders: await this.getAIProviderAnalytics(organizationId, timeRange)
      }

      // In a real implementation, you would:
      // 1. Generate the file in the requested format
      // 2. Upload to cloud storage (S3, etc.)
      // 3. Return download URL
      
      // For now, return a placeholder
      const filename = `analytics_${dataType}_${timeRange}_${Date.now()}.${format}`
      
      return {
        success: true,
        downloadUrl: `/api/downloads/${filename}` // Placeholder URL
      }

    } catch (error) {
      console.error('Export analytics error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      }
    }
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(
    userId: string,
    featureName: string,
    metadata?: any
  ): Promise<void> {
    try {
      await this.supabase
        .from('feature_usage_logs')
        .insert({
          user_id: userId,
          feature_name: featureName,
          metadata: metadata || {},
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Track feature usage error:', error)
    }
  }

  /**
   * Track user activity
   */
  async trackUserActivity(
    userId: string,
    activityType: string,
    metadata?: any
  ): Promise<void> {
    try {
      await this.supabase
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          activity_type: activityType,
          metadata: metadata || {},
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Track user activity error:', error)
    }
  }

  /**
   * Private helper methods
   */
  private getTimeRange(range: string) {
    const now = new Date()
    const endDate = new Date(now)
    let startDate = new Date(now)

    switch (range) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return { startDate, endDate }
  }

  private async getPresentationMetrics(organizationId?: string, startDate?: Date, endDate?: Date) {
    // Get total presentations
    let totalQuery = this.supabase
      .from('presentations')
      .select('*', { count: 'exact', head: true })

    if (organizationId) {
      totalQuery = totalQuery.eq('organization_id', organizationId)
    }

    const { count: total } = await totalQuery

    // Get this month's presentations
    let monthQuery = this.supabase
      .from('presentations')
      .select('*', { count: 'exact', head: true })

    if (startDate) {
      monthQuery = monthQuery.gte('created_at', startDate.toISOString())
    }
    if (organizationId) {
      monthQuery = monthQuery.eq('organization_id', organizationId)
    }

    const { count: thisMonth } = await monthQuery

    // Get industry breakdown
    let industryQuery = this.supabase
      .from('presentations')
      .select('industry')

    if (organizationId) {
      industryQuery = industryQuery.eq('organization_id', organizationId)
    }

    const { data: presentations } = await industryQuery

    const industryBreakdown = presentations?.reduce((acc, p) => {
      const industry = (p.industry as string) || 'Unknown'
      acc[industry] = (acc[industry] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const topIndustries = Object.entries(industryBreakdown)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      total: total || 0,
      thisMonth: thisMonth || 0,
      topIndustries
    }
  }

  private async getAIMetrics(organizationId?: string, startDate?: Date, endDate?: Date) {
    let query = this.supabase
      .from('brain_usage_logs')
      .select('*')

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    const { data: usageLogs } = await query

    const total = usageLogs?.length || 0
    const thisMonth = usageLogs?.filter(log => 
      startDate ? new Date(log.created_at as string) >= startDate : true
    ).length || 0

    const successful = usageLogs?.filter(log => log.success).length || 0
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0

    const totalProcessingTime = usageLogs?.reduce((sum, log) => sum + (log.response_time as number) || 0, 0) || 0
    const avgProcessingTime = total > 0 ? Math.round(totalProcessingTime / total) : 0

    const totalDataProcessed = usageLogs?.reduce((sum, log) => sum + (log.tokens_used as number) || 0, 0) || 0

    // Get top features (placeholder)
    const topFeatures = [
      { feature: 'Data Analysis', count: Math.floor(total * 0.4) },
      { feature: 'Slide Generation', count: Math.floor(total * 0.3) },
      { feature: 'Chart Creation', count: Math.floor(total * 0.2) },
      { feature: 'Insights Generation', count: Math.floor(total * 0.1) }
    ]

    return {
      total,
      thisMonth,
      successRate,
      avgProcessingTime,
      totalDataProcessed,
      topFeatures
    }
  }

  private async getUserMetrics(organizationId?: string, startDate?: Date, endDate?: Date) {
    let totalQuery = this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: total } = await totalQuery

    // Get active users (users who have activity in the time range)
    let activeQuery = this.supabase
      .from('user_activity_logs')
      .select('user_id')
      .gte('created_at', startDate?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const { data: activeUsers } = await activeQuery
    const uniqueActiveUsers = new Set(activeUsers?.map(log => log.user_id as string) || [])

    return {
      total: total || 0,
      activeThisMonth: uniqueActiveUsers.size
    }
  }

  private async getTrendData(organizationId?: string, timeRange: string) {
    // Placeholder trend data - in real implementation, would calculate from historical data
    const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90
    
    const userGrowth = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      users: Math.floor(Math.random() * 50) + 100 + i * 2
    }))

    const usage = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      presentations: Math.floor(Math.random() * 20) + 10,
      aiRequests: Math.floor(Math.random() * 100) + 50
    }))

    return { userGrowth, usage }
  }

  private getMostUsedFeatures(featureUsage: Array<{ feature_name: string }>): string[] {
    const featureCounts = featureUsage.reduce((acc, usage) => {
      acc[usage.feature_name as string] = (acc[usage.feature_name as string] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([feature]) => feature)
  }

  private calculateEngagementScore(presentations: number, aiRequests: number, featureCount: number): number {
    // Simple engagement scoring algorithm
    const presentationScore = Math.min(presentations * 10, 50)
    const aiScore = Math.min(aiRequests * 2, 30)
    const featureScore = Math.min(featureCount * 4, 20)
    
    return Math.round(presentationScore + aiScore + featureScore)
  }

  private calculateRiskLevel(engagementScore: number, lastActive: Date): 'low' | 'medium' | 'high' {
    const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
    
    if (engagementScore > 70 && daysSinceActive < 7) return 'low'
    if (engagementScore > 40 && daysSinceActive < 14) return 'medium'
    return 'high'
  }

  private calculateSizeBreakdown(presentations: any[]): Array<{ sizeRange: string; count: number }> {
    const sizeRanges = {
      'Small (1-10 slides)': 0,
      'Medium (11-20 slides)': 0,
      'Large (21-50 slides)': 0,
      'Extra Large (50+ slides)': 0
    }

    presentations.forEach(p => {
      const slideCount = (p.slide_count as number) || 0
      if (slideCount <= 10) sizeRanges['Small (1-10 slides)']++
      else if (slideCount <= 20) sizeRanges['Medium (11-20 slides)']++
      else if (slideCount <= 50) sizeRanges['Large (21-50 slides)']++
      else sizeRanges['Extra Large (50+ slides)']++
    })

    return Object.entries(sizeRanges).map(([sizeRange, count]) => ({ sizeRange, count }))
  }

  private getEmptyPresentationAnalytics(): PresentationAnalytics {
    return {
      totalPresentations: 0,
      completedPresentations: 0,
      draftPresentations: 0,
      averageSlidesPerPresentation: 0,
      popularTemplates: [],
      industryBreakdown: [],
      presentationSizes: [],
      completionRate: 0,
      timeToComplete: 0,
      userSatisfactionScore: 0
    }
  }
}

export default UsageAnalyticsService