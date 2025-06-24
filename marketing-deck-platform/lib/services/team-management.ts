/**
 * Team Member Management and Role-Based Access Control
 * Handles team invitations, role management, and permissions
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface TeamMember {
  id: string;
  userId: string;
  organizationId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: TeamRole;
  status: 'active' | 'invited' | 'suspended';
  invitedAt?: Date;
  joinedAt?: Date;
  lastActiveAt?: Date;
  permissions: Permission[];
}

export interface TeamRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  organizationId?: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
}

export interface TeamInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  invitedBy: string;
  inviteToken: string;
  expiresAt: Date;
  acceptedAt?: Date;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
}

export class TeamManagementService {
  private supabase: ReturnType<typeof createClient>;

  // System-defined roles and permissions
  private static readonly SYSTEM_PERMISSIONS: Permission[] = [
    // Presentation permissions
    { id: 'presentations.create', resource: 'presentations', action: 'create', description: 'Create new presentations' },
    { id: 'presentations.read', resource: 'presentations', action: 'read', description: 'View presentations' },
    { id: 'presentations.update', resource: 'presentations', action: 'update', description: 'Edit presentations' },
    { id: 'presentations.delete', resource: 'presentations', action: 'delete', description: 'Delete presentations' },
    { id: 'presentations.share', resource: 'presentations', action: 'share', description: 'Share presentations' },
    { id: 'presentations.export', resource: 'presentations', action: 'export', description: 'Export presentations' },
    
    // Team permissions
    { id: 'team.invite', resource: 'team', action: 'invite', description: 'Invite new team members' },
    { id: 'team.remove', resource: 'team', action: 'remove', description: 'Remove team members' },
    { id: 'team.manage_roles', resource: 'team', action: 'manage_roles', description: 'Manage team member roles' },
    { id: 'team.view', resource: 'team', action: 'view', description: 'View team members' },
    
    // Organization permissions
    { id: 'organization.manage', resource: 'organization', action: 'manage', description: 'Manage organization settings' },
    { id: 'organization.billing', resource: 'organization', action: 'billing', description: 'Manage billing and subscriptions' },
    { id: 'organization.analytics', resource: 'organization', action: 'analytics', description: 'View organization analytics' },
    
    // Data permissions
    { id: 'data.upload', resource: 'data', action: 'upload', description: 'Upload data files' },
    { id: 'data.manage', resource: 'data', action: 'manage', description: 'Manage uploaded data' },
    
    // AI permissions
    { id: 'ai.configure', resource: 'ai', action: 'configure', description: 'Configure AI settings' },
    { id: 'ai.advanced', resource: 'ai', action: 'advanced', description: 'Use advanced AI features' }
  ];

  private static readonly SYSTEM_ROLES: TeamRole[] = [
    {
      id: 'owner',
      name: 'owner',
      displayName: 'Owner',
      description: 'Full access to all organization features and settings',
      isSystemRole: true,
      permissions: TeamManagementService.SYSTEM_PERMISSIONS // All permissions
    },
    {
      id: 'admin',
      name: 'admin',
      displayName: 'Administrator',
      description: 'Manage team and organization settings, but cannot delete organization',
      isSystemRole: true,
      permissions: TeamManagementService.SYSTEM_PERMISSIONS.filter(p => 
        !p.id.includes('organization.delete')
      )
    },
    {
      id: 'editor',
      name: 'editor',
      displayName: 'Editor',
      description: 'Create and edit presentations, manage own data',
      isSystemRole: true,
      permissions: [
        ...TeamManagementService.SYSTEM_PERMISSIONS.filter(p => 
          p.resource === 'presentations' || 
          p.resource === 'data' ||
          (p.resource === 'team' && p.action === 'view')
        )
      ]
    },
    {
      id: 'viewer',
      name: 'viewer',
      displayName: 'Viewer',
      description: 'View presentations and basic team information',
      isSystemRole: true,
      permissions: [
        ...TeamManagementService.SYSTEM_PERMISSIONS.filter(p => 
          (p.resource === 'presentations' && ['read', 'export'].includes(p.action)) ||
          (p.resource === 'team' && p.action === 'view')
        )
      ]
    },
    {
      id: 'analyst',
      name: 'analyst',
      displayName: 'Data Analyst',
      description: 'Upload and analyze data, create presentations from analysis',
      isSystemRole: true,
      permissions: [
        ...TeamManagementService.SYSTEM_PERMISSIONS.filter(p => 
          p.resource === 'presentations' || 
          p.resource === 'data' ||
          (p.resource === 'team' && p.action === 'view') ||
          (p.resource === 'organization' && p.action === 'analytics')
        )
      ]
    }
  ];

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Invite a new team member
   */
  async inviteTeamMember(
    organizationId: string,
    inviterUserId: string,
    email: string,
    roleId: string,
    customMessage?: string
  ): Promise<{ success: boolean; invitationId?: string; error?: string }> {
    try {
      // Check if inviter has permission
      const hasPermission = await this.checkPermission(inviterUserId, 'team.invite');
      if (!hasPermission) {
        return { success: false, error: 'Insufficient permissions to invite team members' };
      }

      // Check if user is already a team member
      const { data: existingMember } = await this.supabase
        .from('team_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('email', email.toLowerCase())
        .single();

      if (existingMember) {
        return { success: false, error: 'User is already a team member' };
      }

      // Check if there's already a pending invitation
      const { data: pendingInvite } = await this.supabase
        .from('team_invitations')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('email', email.toLowerCase())
        .eq('status', 'pending')
        .single();

      if (pendingInvite) {
        return { success: false, error: 'Invitation already sent to this email' };
      }

      // Validate role exists
      const role = await this.getRole(roleId);
      if (!role) {
        return { success: false, error: 'Invalid role specified' };
      }

      // Check team member limits
      const limitsCheck = await this.checkTeamMemberLimits(organizationId);
      if (!limitsCheck.canAdd) {
        return { success: false, error: limitsCheck.reason };
      }

      // Generate invitation token
      const inviteToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Create invitation record
      const { data: invitation, error } = await this.supabase
        .from('team_invitations')
        .insert({
          organization_id: organizationId,
          email: email.toLowerCase(),
          role: roleId,
          invited_by: inviterUserId,
          invite_token: inviteToken,
          expires_at: expiresAt.toISOString(),
          status: 'pending',
          custom_message: customMessage,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create invitation: ${error.message}`);
      }

      // Send invitation email
      await this.sendInvitationEmail(email, inviteToken, organizationId, role, customMessage);

      // Log the invitation
      await this.logTeamEvent(organizationId, inviterUserId, 'member_invited', {
        invited_email: email,
        role: roleId,
        invitation_id: (invitation.id as string) || ''
      });

      return { 
        success: true, 
        invitationId: (invitation.id as string) || '' 
      };

    } catch (error) {
      console.error('Invite team member error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Accept team invitation
   */
  async acceptInvitation(
    inviteToken: string,
    userId: string
  ): Promise<{ success: boolean; teamMemberId?: string; error?: string }> {
    try {
      // Get invitation
      const { data: invitation, error: inviteError } = await this.supabase
        .from('team_invitations')
        .select('*')
        .eq('invite_token', inviteToken)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invitation) {
        return { success: false, error: 'Invalid or expired invitation' };
      }

      // Check if invitation has expired
      if (new Date(invitation.expires_at) < new Date()) {
        await this.supabase
          .from('team_invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id);

        return { success: false, error: 'Invitation has expired' };
      }

      // Get user information
      const { data: user } = await this.supabase
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', userId)
        .single();

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify email matches invitation
      if ((user.email as string).toLowerCase() !== (invitation.email as string).toLowerCase()) {
        return { success: false, error: 'Invitation email does not match user email' };
      }

      // Add user as team member
      const { data: teamMember, error: memberError } = await this.supabase
        .from('team_members')
        .insert({
          user_id: userId,
          organization_id: (invitation.organization_id as string) || '',
          email: (user.email as string).toLowerCase(),
          first_name: (user.first_name as string) || '',
          last_name: (user.last_name as string) || '',
          role: (invitation.role as string) || '',
          status: 'active',
          joined_at: new Date().toISOString(),
          last_active_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (memberError) {
        throw new Error(`Failed to add team member: ${memberError.message}`);
      }

      // Update invitation status
      await this.supabase
        .from('team_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // Set user's current organization
      await this.supabase
        .from('users')
        .update({
          current_organization_id: (invitation.organization_id as string) || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Log the acceptance
      await this.logTeamEvent(
        (invitation.organization_id as string) || '',
        userId,
        'member_joined',
        {
          invitation_id: (invitation.id as string) || '',
          role: (invitation.role as string) || ''
        }
      );

      return { 
        success: true, 
        teamMemberId: (teamMember.id as string) || '' 
      };

    } catch (error) {
      console.error('Accept invitation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Remove team member
   */
  async removeTeamMember(
    organizationId: string,
    memberUserId: string,
    removedByUserId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check permissions
      const hasPermission = await this.checkPermission(removedByUserId, 'team.remove');
      if (!hasPermission) {
        return { success: false, error: 'Insufficient permissions to remove team members' };
      }

      // Prevent removing organization owner
      const { data: member } = await this.supabase
        .from('team_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', memberUserId)
        .single();

      if (member?.role === 'owner') {
        return { success: false, error: 'Cannot remove organization owner' };
      }

      // Remove team member
      const { error } = await this.supabase
        .from('team_members')
        .delete()
        .eq('organization_id', organizationId)
        .eq('user_id', memberUserId);

      if (error) {
        throw new Error(`Failed to remove team member: ${error.message}`);
      }

      // Log the removal
      await this.logTeamEvent(organizationId, removedByUserId, 'member_removed', {
        removed_user_id: memberUserId,
        reason: reason
      });

      // Notify removed user
      await this.notifyMemberRemoval(memberUserId, organizationId, reason);

      return { success: true };

    } catch (error) {
      console.error('Remove team member error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update team member role
   */
  async updateMemberRole(
    organizationId: string,
    memberUserId: string,
    newRoleId: string,
    updatedByUserId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check permissions
      const hasPermission = await this.checkPermission(updatedByUserId, 'team.manage_roles');
      if (!hasPermission) {
        return { success: false, error: 'Insufficient permissions to manage roles' };
      }

      // Get current member info
      const { data: member } = await this.supabase
        .from('team_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', memberUserId)
        .single();

      if (!member) {
        return { success: false, error: 'Team member not found' };
      }

      // Prevent changing owner role
      if (member.role === 'owner' || newRoleId === 'owner') {
        return { success: false, error: 'Cannot change owner role' };
      }

      // Validate new role exists
      const newRole = await this.getRole(newRoleId);
      if (!newRole) {
        return { success: false, error: 'Invalid role specified' };
      }

      // Update member role
      const { error } = await this.supabase
        .from('team_members')
        .update({
          role: newRoleId,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId)
        .eq('user_id', memberUserId);

      if (error) {
        throw new Error(`Failed to update member role: ${error.message}`);
      }

      // Log the role change
      await this.logTeamEvent(organizationId, updatedByUserId, 'member_role_changed', {
        member_user_id: memberUserId,
        old_role: member.role,
        new_role: newRoleId
      });

      // Notify member of role change
      await this.notifyRoleChange(memberUserId, organizationId, member.role, newRoleId);

      return { success: true };

    } catch (error) {
      console.error('Update member role error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get team members for organization
   */
  async getTeamMembers(organizationId: string): Promise<TeamMember[]> {
    try {
      const { data: members, error } = await this.supabase
        .from('team_members')
        .select(`
          *,
          users(first_name, last_name, avatar_url, email)
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      if (error) {
        throw new Error(`Failed to get team members: ${error.message}`);
      }

      return members.map(member => ({
        id: member.id,
        userId: member.user_id,
        organizationId: member.organization_id,
        email: member.email,
        firstName: member.users?.first_name,
        lastName: member.users?.last_name,
        role: this.getSystemRole(member.role),
        status: member.status,
        joinedAt: new Date(member.joined_at),
        lastActiveAt: member.last_active_at ? new Date(member.last_active_at) : undefined,
        permissions: this.getSystemRole(member.role)?.permissions || []
      }));

    } catch (error) {
      console.error('Get team members error:', error);
      return [];
    }
  }

  /**
   * Check if user has specific permission
   */
  async checkPermission(userId: string, permissionId: string): Promise<boolean> {
    try {
      // Get user's current organization and role
      const { data: user } = await this.supabase
        .from('users')
        .select('current_organization_id')
        .eq('id', userId)
        .single();

      if (!user?.current_organization_id) {
        return false;
      }

      const { data: member } = await this.supabase
        .from('team_members')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', user.current_organization_id)
        .eq('status', 'active')
        .single();

      if (!member) {
        return false;
      }

      // Get role permissions
      const role = this.getSystemRole(member.role);
      if (!role) {
        return false;
      }

      // Check if role has the required permission
      return role.permissions.some(p => p.id === permissionId);

    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  }

  /**
   * Get all available roles
   */
  getAvailableRoles(): TeamRole[] {
    return TeamManagementService.SYSTEM_ROLES;
  }

  /**
   * Get role by ID
   */
  private async getRole(roleId: string): Promise<TeamRole | null> {
    return this.getSystemRole(roleId);
  }

  private getSystemRole(roleId: string): TeamRole | null {
    return TeamManagementService.SYSTEM_ROLES.find(r => r.id === roleId) || null;
  }

  /**
   * Private helper methods
   */
  private async checkTeamMemberLimits(organizationId: string): Promise<{
    canAdd: boolean;
    reason?: string;
  }> {
    try {
      // Get organization's subscription plan
      const { data: subscription } = await this.supabase
        .from('organization_subscriptions')
        .select('plan')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        return { canAdd: false, reason: 'No active subscription found' };
      }

      // Get current team member count
      const { count } = await this.supabase
        .from('team_members')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      // Get plan limits (this would come from your subscription manager)
      const planLimits = this.getPlanLimits(subscription.plan);
      
      if (planLimits.teamMembers !== -1 && (count || 0) >= planLimits.teamMembers) {
        return { 
          canAdd: false, 
          reason: `Team member limit reached (${count}/${planLimits.teamMembers})` 
        };
      }

      return { canAdd: true };

    } catch (error) {
      console.error('Check team member limits error:', error);
      return { canAdd: false, reason: 'Unable to verify limits' };
    }
  }

  private getPlanLimits(plan: string): { teamMembers: number } {
    const limits: Record<string, { teamMembers: number }> = {
      'starter': { teamMembers: 1 },
      'professional': { teamMembers: 5 },
      'enterprise': { teamMembers: -1 } // unlimited
    };

    return limits[plan] || { teamMembers: 1 };
  }

  private async sendInvitationEmail(
    email: string,
    inviteToken: string,
    organizationId: string,
    role: TeamRole,
    customMessage?: string
  ): Promise<void> {
    // This would integrate with your email service
    // For now, we'll just log the invitation details
    console.log('Team invitation email:', {
      to: email,
      inviteToken,
      organizationId,
      role: role.displayName,
      customMessage,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`
    });
  }

  private async notifyMemberRemoval(
    userId: string,
    organizationId: string,
    reason?: string
  ): Promise<void> {
    // This would send a notification to the removed user
    console.log('Member removal notification:', {
      userId,
      organizationId,
      reason
    });
  }

  private async notifyRoleChange(
    userId: string,
    organizationId: string,
    oldRole: string,
    newRole: string
  ): Promise<void> {
    // This would send a notification about role change
    console.log('Role change notification:', {
      userId,
      organizationId,
      oldRole,
      newRole
    });
  }

  private async logTeamEvent(
    organizationId: string,
    userId: string,
    eventType: string,
    eventData: any
  ): Promise<void> {
    await this.supabase
      .from('team_events')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      });
  }
}

export default TeamManagementService;