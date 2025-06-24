import { NextRequest, NextResponse } from 'next/server'
import { AdminAuth } from '@/lib/auth/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, admin, error } = await AdminAuth.requireAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { isAdmin: false, error: error || 'Admin access required' },
        { status: 403 }
      )
    }

    // Log admin dashboard access
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'admin_dashboard_accessed',
        { timestamp: new Date().toISOString() },
        undefined,
        undefined,
        request
      )
    }

    return NextResponse.json({
      isAdmin: true,
      admin: {
        id: admin?.id,
        email: admin?.email,
        full_name: admin?.full_name,
        last_login: admin?.last_login
      }
    })
  } catch (error) {
    console.error('Admin auth check error:', error)
    return NextResponse.json(
      { isAdmin: false, error: 'Authentication error' },
      { status: 500 }
    )
  }
}