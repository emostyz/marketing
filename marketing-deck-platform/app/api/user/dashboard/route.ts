import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import UserDataService from '@/lib/services/user-data-service'
import { AuthSystem } from '@/lib/auth/auth-system'

export async function GET(request: NextRequest) {
  try {
    // Try to get current user (works for both Supabase and demo users)
    const currentUser = await AuthSystem.getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Handle demo users with mock data
    if (currentUser.id === 1 && currentUser.email === 'demo@aedrin.com') {
      const demoDashboardData = {
        profile: {
          id: 1,
          name: 'Demo User',
          email: 'demo@aedrin.com',
          companyName: 'Demo Company',
          industry: 'Technology',
          subscription: 'pro'
        },
        recent_presentations: [
          { id: 1, title: 'Q4 Sales Analysis', created_at: new Date().toISOString(), status: 'completed' },
          { id: 2, title: 'Marketing Performance', created_at: new Date().toISOString(), status: 'draft' }
        ],
        recent_data_imports: [
          { id: 1, file_name: 'sales_data.csv', uploaded_at: new Date().toISOString(), status: 'processed' }
        ],
        analytics: {
          presentations_created: 15,
          data_uploads: 8,
          total_slides: 120,
          avg_presentation_time: 12
        },
        subscription: {
          plan: 'pro',
          status: 'active',
          presentations_used: 5,
          presentations_limit: 100
        }
      }

      return NextResponse.json({
        success: true,
        data: demoDashboardData
      })
    }

    // For real users, continue with Supabase
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Track API usage
    await UserDataService.trackApiUsage(user.id, '/api/user/dashboard', 'GET')

    // Get comprehensive dashboard data
    const dashboardData = await UserDataService.getUserDashboardData(user.id)

    // Track activity
    await UserDataService.trackUserActivity(user.id, {
      activity_type: 'dashboard_viewed',
      metadata: { 
        timestamp: new Date().toISOString(),
        data_retrieved: Object.keys(dashboardData).length
      }
    })

    return NextResponse.json({
      success: true,
      data: dashboardData
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, data } = body

    // Track API usage
    await UserDataService.trackApiUsage(user.id, '/api/user/dashboard', 'POST')

    switch (action) {
      case 'update_analytics':
        await UserDataService.updateUserAnalytics(user.id, data)
        break
      
      case 'update_preferences':
        await UserDataService.setUserPreference(user.id, data.key, data.value, data.category)
        break
      
      case 'submit_feedback':
        await UserDataService.submitUserFeedback(user.id, data)
        break
      
      case 'search_data':
        const searchResults = await UserDataService.searchUserData(user.id, data.query)
        return NextResponse.json({
          success: true,
          data: searchResults
        })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Track activity
    await UserDataService.trackUserActivity(user.id, {
      activity_type: 'dashboard_action',
      activity_subtype: action,
      metadata: { action, data }
    })

    return NextResponse.json({
      success: true,
      message: 'Action completed successfully'
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 