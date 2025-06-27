import { createServerSupabaseClient } from '@/lib/supabase/server-client'
import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

export interface AdminUser {
  id: string
  email: string
  full_name: string
  user_role: string
  created_at: string
  last_login: string
}

export class AdminAuth {
  /**
   * Check if the current user is an admin
   */
  static async isAdmin(userId?: string): Promise<boolean> {
    try {
      const supabase = await createServerSupabaseClient()
      
      let targetUserId = userId
      if (!targetUserId) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return false
        targetUserId = session.user.id
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', targetUserId)
        .single()

      if (error || !profile) return false
      return profile.user_role === 'admin'
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  /**
   * Get current admin user details
   */
  static async getCurrentAdmin(): Promise<AdminUser | null> {
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) return null

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .eq('user_role', 'admin')
        .single()

      if (error || !profile) return null

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || profile.email,
        user_role: profile.user_role,
        created_at: profile.created_at,
        last_login: session.user.last_sign_in_at || profile.created_at
      }
    } catch (error) {
      console.error('Error getting current admin:', error)
      return null
    }
  }

  /**
   * Make a user an admin (can only be done by existing admin)
   */
  static async makeAdmin(userId: string, currentAdminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify current user is admin
      const isCurrentUserAdmin = await this.isAdmin(currentAdminId)
      if (!isCurrentUserAdmin) {
        return { success: false, error: 'Unauthorized: Only admins can promote users' }
      }

      const supabase = await createServerSupabaseClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ user_role: 'admin' })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      // Log admin activity
      await this.logAdminActivity(
        currentAdminId,
        'user_promoted_to_admin',
        { target_user_id: userId },
        'user',
        userId
      )

      return { success: true }
    } catch (error) {
      console.error('Error making user admin:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  /**
   * Remove admin privileges from a user
   */
  static async removeAdmin(userId: string, currentAdminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify current user is admin
      const isCurrentUserAdmin = await this.isAdmin(currentAdminId)
      if (!isCurrentUserAdmin) {
        return { success: false, error: 'Unauthorized: Only admins can demote users' }
      }

      // Prevent self-demotion
      if (userId === currentAdminId) {
        return { success: false, error: 'Cannot remove admin privileges from yourself' }
      }

      const supabase = await createServerSupabaseClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ user_role: 'user' })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      // Log admin activity
      await this.logAdminActivity(
        currentAdminId,
        'admin_privileges_removed',
        { target_user_id: userId },
        'user',
        userId
      )

      return { success: true }
    } catch (error) {
      console.error('Error removing admin privileges:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  /**
   * Get all admin users
   */
  static async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { data: admins, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_role', 'admin')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching admins:', error)
        return []
      }

      return admins.map(admin => ({
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name || admin.email,
        user_role: admin.user_role,
        created_at: admin.created_at,
        last_login: admin.last_sign_in_at || admin.created_at
      }))
    } catch (error) {
      console.error('Error getting all admins:', error)
      return []
    }
  }

  /**
   * Log admin activity
   */
  static async logAdminActivity(
    adminId: string,
    actionType: string,
    actionDetails: any,
    targetType?: string,
    targetId?: string,
    request?: NextRequest
  ): Promise<void> {
    try {
      const supabase = await createServerSupabaseClient()
      
      const clientIP = request?.headers.get('x-forwarded-for') || 
                       request?.headers.get('x-real-ip') || 
                       'unknown'
      const userAgent = request?.headers.get('user-agent') || 'unknown'

      await supabase
        .from('admin_activity_log')
        .insert({
          admin_user_id: adminId,
          action_type: actionType,
          action_details: actionDetails,
          target_type: targetType,
          target_id: targetId,
          ip_address: clientIP,
          user_agent: userAgent
        })
    } catch (error) {
      console.error('Error logging admin activity:', error)
    }
  }

  /**
   * Middleware function to check admin access (supports both Supabase and direct admin auth)
   */
  static async requireAdmin(request: NextRequest): Promise<{ isAdmin: boolean; admin?: AdminUser; error?: string }> {
    try {
      // First check for direct admin token (username/password auth)
      const adminToken = request.cookies.get('admin_token')?.value || 
                        request.headers.get('authorization')?.replace('Bearer ', '')

      if (adminToken) {
        try {
          const secret = process.env.NEXTAUTH_SECRET || 'default-secret'
          const decoded = verify(adminToken, secret) as any

          if (decoded.isAdmin && decoded.username) {
            return {
              isAdmin: true,
              admin: {
                id: 'direct-admin',
                email: 'admin@easydecks.ai',
                full_name: 'Platform Administrator',
                user_role: 'admin',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
              }
            }
          }
        } catch (tokenError) {
          console.warn('Invalid admin token:', tokenError)
        }
      }

      // Fallback to Supabase admin check
      const admin = await this.getCurrentAdmin()
      
      if (!admin) {
        return { 
          isAdmin: false, 
          error: 'Admin access required' 
        }
      }

      return { 
        isAdmin: true, 
        admin 
      }
    } catch (error) {
      console.error('Error in admin middleware:', error)
      return { 
        isAdmin: false, 
        error: 'Authentication error' 
      }
    }
  }

  /**
   * Create the first admin user (for setup purposes)
   */
  static async createFirstAdmin(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createServerSupabaseClient()
      
      // Check if any admins exist
      const { data: existingAdmins, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_role', 'admin')
        .limit(1)

      if (checkError) {
        return { success: false, error: checkError.message }
      }

      if (existingAdmins && existingAdmins.length > 0) {
        return { success: false, error: 'Admin users already exist' }
      }

      // Find user by email and make them admin
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single()

      if (userError || !user) {
        return { success: false, error: 'User not found' }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ user_role: 'admin' })
        .eq('id', user.id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }

      // Log the first admin creation
      await this.logAdminActivity(
        user.id,
        'first_admin_created',
        { email: user.email },
        'user',
        user.id
      )

      return { success: true }
    } catch (error) {
      console.error('Error creating first admin:', error)
      return { success: false, error: 'Internal server error' }
    }
  }
}