import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import TeamManagementService from '@/lib/services/team-management'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { action, organizationId, userId, ...params } = await request.json()
    
    // Verify user authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize team service
    const teamService = new TeamManagementService()

    switch (action) {
      case 'invite':
        const inviteResult = await teamService.inviteTeamMember(
          organizationId,
          userId,
          params.email,
          params.role,
          params.customMessage
        )
        return NextResponse.json(inviteResult)

      case 'remove':
        const removeResult = await teamService.removeTeamMember(
          organizationId,
          params.memberUserId,
          userId,
          params.reason
        )
        return NextResponse.json(removeResult)

      case 'update_role':
        const roleResult = await teamService.updateMemberRole(
          organizationId,
          params.memberUserId,
          params.newRole,
          userId
        )
        return NextResponse.json(roleResult)

      case 'accept_invitation':
        const acceptResult = await teamService.acceptInvitation(
          params.inviteToken,
          userId
        )
        return NextResponse.json(acceptResult)

      case 'get_roles':
        const roles = teamService.getAvailableRoles()
        return NextResponse.json({ success: true, roles })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Team API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const teamService = new TeamManagementService()
    const teamMembers = await teamService.getTeamMembers(organizationId)

    return NextResponse.json({
      success: true,
      teamMembers
    })

  } catch (error) {
    console.error('Get team members error:', error)
    return NextResponse.json({ 
      error: 'Failed to get team members',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}