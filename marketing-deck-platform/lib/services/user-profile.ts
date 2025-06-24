/**
 * User Profile Management System
 * Handles email changes, password updates, company settings, and profile management
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  timezone?: string;
  language?: string;
  companyName?: string;
  companySize?: string;
  industry?: string;
  jobTitle?: string;
  department?: string;
  businessContext?: string;
  preferences: UserPreferences;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    inApp: boolean;
    marketing: boolean;
    teamUpdates: boolean;
    billingAlerts: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
  };
  privacy: {
    profileVisibility: 'public' | 'team' | 'private';
    showEmail: boolean;
    showActivity: boolean;
  };
  ai: {
    defaultModel: string;
    creativityLevel: number; // 0-100
    includeDataContext: boolean;
    savePromptHistory: boolean;
  };
}

export interface EmailChangeRequest {
  id: string;
  userId: string;
  currentEmail: string;
  newEmail: string;
  verificationToken: string;
  expiresAt: Date;
  status: 'pending' | 'verified' | 'expired';
  requestedAt: Date;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class UserProfileService {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select(`
          *,
          user_preferences(*),
          user_company_settings(*)
        `)
        .eq('id', userId)
        .single();

      if (error || !user) {
        return null;
      }

      const id = (user.id as string) || '';
      const email = (user.email as string) || '';
      const firstName = (user.first_name as string) || '';
      const lastName = (user.last_name as string) || '';
      const avatarUrl = (user.avatar_url as string) || '';
      const phoneNumber = (user.phone_number as string) || '';
      const timezone = (user.timezone as string) || '';
      const language = (user.language as string) || '';
      const companyName = (user.user_company_settings?.company_name as string) || '';
      const companySize = (user.user_company_settings?.company_size as string) || '';
      const industry = (user.user_company_settings?.industry as string) || '';
      const jobTitle = (user.user_company_settings?.job_title as string) || '';
      const department = (user.user_company_settings?.department as string) || '';
      const businessContext = (user.user_company_settings?.business_context as string) || '';
      const twoFactorEnabled = (user.two_factor_enabled as boolean) || false;
      const lastLoginAt = user.last_login_at ? new Date(user.last_login_at as string) : undefined;
      const createdAt = new Date(user.created_at as string);
      const updatedAt = new Date(user.updated_at as string);

      return {
        id,
        email,
        firstName,
        lastName,
        avatarUrl,
        phoneNumber,
        timezone,
        language,
        companyName,
        companySize,
        industry,
        jobTitle,
        department,
        businessContext,
        preferences: this.parseUserPreferences(user.user_preferences),
        twoFactorEnabled,
        lastLoginAt,
        createdAt,
        updatedAt
      };

    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update main user table
      const userUpdates: any = {};
      if (updates.firstName !== undefined) userUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) userUpdates.last_name = updates.lastName;
      if (updates.phoneNumber !== undefined) userUpdates.phone_number = updates.phoneNumber;
      if (updates.timezone !== undefined) userUpdates.timezone = updates.timezone;
      if (updates.language !== undefined) userUpdates.language = updates.language;
      if (updates.avatarUrl !== undefined) userUpdates.avatar_url = updates.avatarUrl;

      if (Object.keys(userUpdates).length > 0) {
        userUpdates.updated_at = new Date().toISOString();
        
        const { error: userError } = await this.supabase
          .from('users')
          .update(userUpdates)
          .eq('id', userId);

        if (userError) {
          throw new Error(`Failed to update user: ${userError.message}`);
        }
      }

      // Update company settings
      const companyUpdates: any = {};
      if (updates.companyName !== undefined) companyUpdates.company_name = updates.companyName;
      if (updates.companySize !== undefined) companyUpdates.company_size = updates.companySize;
      if (updates.industry !== undefined) companyUpdates.industry = updates.industry;
      if (updates.jobTitle !== undefined) companyUpdates.job_title = updates.jobTitle;
      if (updates.department !== undefined) companyUpdates.department = updates.department;
      if (updates.businessContext !== undefined) companyUpdates.business_context = updates.businessContext;

      if (Object.keys(companyUpdates).length > 0) {
        companyUpdates.updated_at = new Date().toISOString();
        
        const { error: companyError } = await this.supabase
          .from('user_company_settings')
          .upsert({
            user_id: userId,
            ...companyUpdates
          });

        if (companyError) {
          throw new Error(`Failed to update company settings: ${companyError.message}`);
        }
      }

      // Update preferences
      if (updates.preferences) {
        const { error: prefsError } = await this.supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            ...this.serializePreferences(updates.preferences),
            updated_at: new Date().toISOString()
          });

        if (prefsError) {
          throw new Error(`Failed to update preferences: ${prefsError.message}`);
        }
      }

      // Log profile update
      await this.logUserEvent(userId, 'profile_updated', {
        updated_fields: Object.keys({ ...userUpdates, ...companyUpdates })
      });

      return { success: true };

    } catch (error) {
      console.error('Update user profile error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Request email change
   */
  async requestEmailChange(
    userId: string,
    newEmail: string,
    currentPassword: string
  ): Promise<{ success: boolean; verificationId?: string; error?: string }> {
    try {
      // Verify current password
      const passwordValid = await this.verifyCurrentPassword(userId, currentPassword);
      if (!passwordValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Check if new email is already in use
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', newEmail.toLowerCase())
        .single();

      if (existingUser) {
        return { success: false, error: 'Email address is already in use' };
      }

      // Get current email
      const { data: currentUser } = await this.supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (!currentUser) {
        return { success: false, error: 'User not found' };
      }

      // Create email change request
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

      const { data: changeRequest, error } = await this.supabase
        .from('email_change_requests')
        .insert({
          user_id: userId,
          current_email: currentUser.email,
          new_email: newEmail.toLowerCase(),
          verification_token: verificationToken,
          expires_at: expiresAt.toISOString(),
          status: 'pending',
          requested_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create email change request: ${error.message}`);
      }

      // Send verification email
      await this.sendEmailChangeVerification(newEmail, verificationToken);

      // Log the request
      await this.logUserEvent(userId, 'email_change_requested', {
        new_email: newEmail,
        request_id: changeRequest.id
      });

      return { 
        success: true, 
        verificationId: changeRequest.id 
      };

    } catch (error) {
      console.error('Request email change error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Verify email change
   */
  async verifyEmailChange(verificationToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get email change request
      const { data: request, error: requestError } = await this.supabase
        .from('email_change_requests')
        .select('*')
        .eq('verification_token', verificationToken)
        .eq('status', 'pending')
        .single();

      if (requestError || !request) {
        return { success: false, error: 'Invalid or expired verification token' };
      }

      // Check if request has expired
      if (new Date(request.expires_at) < new Date()) {
        await this.supabase
          .from('email_change_requests')
          .update({ status: 'expired' })
          .eq('id', request.id);

        return { success: false, error: 'Verification token has expired' };
      }

      // Update user email
      const { error: updateError } = await this.supabase
        .from('users')
        .update({
          email: request.new_email,
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.user_id);

      if (updateError) {
        throw new Error(`Failed to update email: ${updateError.message}`);
      }

      // Mark request as verified
      await this.supabase
        .from('email_change_requests')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', request.id);

      // Log the verification
      await this.logUserEvent(request.user_id, 'email_changed', {
        old_email: request.current_email,
        new_email: request.new_email
      });

      return { success: true };

    } catch (error) {
      console.error('Verify email change error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    passwordChange: PasswordChangeRequest
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate password confirmation
      if (passwordChange.newPassword !== passwordChange.confirmPassword) {
        return { success: false, error: 'New passwords do not match' };
      }

      // Validate password strength
      const strengthCheck = this.validatePasswordStrength(passwordChange.newPassword);
      if (!strengthCheck.isValid) {
        return { success: false, error: strengthCheck.message };
      }

      // Verify current password
      const passwordValid = await this.verifyCurrentPassword(userId, passwordChange.oldPassword);
      if (!passwordValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(passwordChange.newPassword, saltRounds);

      // Update password
      const { error } = await this.supabase
        .from('users')
        .update({
          password_hash: hashedPassword,
          password_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw new Error(`Failed to update password: ${error.message}`);
      }

      // Invalidate all existing sessions except current one
      await this.invalidateUserSessions(userId, true);

      // Log password change
      await this.logUserEvent(userId, 'password_changed', {
        changed_at: new Date().toISOString()
      });

      return { success: true };

    } catch (error) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(
    userId: string,
    file: Buffer,
    filename: string,
    mimeType: string
  ): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(mimeType)) {
        return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.length > maxSize) {
        return { success: false, error: 'File size too large. Maximum 5MB allowed.' };
      }

      // Generate unique filename
      const fileExtension = filename.split('.').pop() || 'jpg';
      const uniqueFilename = `avatars/${userId}_${Date.now()}.${fileExtension}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('user-assets')
        .upload(uniqueFilename, file, {
          contentType: mimeType,
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Failed to upload avatar: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('user-assets')
        .getPublicUrl(uniqueFilename);

      const avatarUrl = urlData.publicUrl;

      // Update user profile
      const { error: updateError } = await this.supabase
        .from('users')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      // Log avatar upload
      await this.logUserEvent(userId, 'avatar_uploaded', {
        filename: uniqueFilename,
        size: file.length
      });

      return { 
        success: true, 
        avatarUrl 
      };

    } catch (error) {
      console.error('Upload avatar error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Enable/disable two-factor authentication
   */
  async toggleTwoFactor(
    userId: string,
    enable: boolean,
    password: string
  ): Promise<{ success: boolean; secret?: string; qrCode?: string; error?: string }> {
    try {
      // Verify password
      const passwordValid = await this.verifyCurrentPassword(userId, password);
      if (!passwordValid) {
        return { success: false, error: 'Password is incorrect' };
      }

      if (enable) {
        // Generate 2FA secret
        const secret = crypto.randomBytes(20).toString('base32');
        
        // Update user with 2FA secret (not enabled yet until verified)
        const { error } = await this.supabase
          .from('users')
          .update({
            two_factor_secret: secret,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          throw new Error(`Failed to set 2FA secret: ${error.message}`);
        }

        // Generate QR code URL (you'd use a library like qrcode)
        const qrCodeUrl = `otpauth://totp/MarketingDeck:${userId}?secret=${secret}&issuer=MarketingDeck`;

        return { 
          success: true, 
          secret,
          qrCode: qrCodeUrl
        };

      } else {
        // Disable 2FA
        const { error } = await this.supabase
          .from('users')
          .update({
            two_factor_enabled: false,
            two_factor_secret: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          throw new Error(`Failed to disable 2FA: ${error.message}`);
        }

        // Log 2FA disabled
        await this.logUserEvent(userId, 'two_factor_disabled', {});

        return { success: true };
      }

    } catch (error) {
      console.error('Toggle two factor error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(
    userId: string,
    password: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify password
      const passwordValid = await this.verifyCurrentPassword(userId, password);
      if (!passwordValid) {
        return { success: false, error: 'Password is incorrect' };
      }

      // Check if user is organization owner
      const { data: ownedOrgs } = await this.supabase
        .from('team_members')
        .select('organization_id')
        .eq('user_id', userId)
        .eq('role', 'owner');

      if (ownedOrgs && ownedOrgs.length > 0) {
        return { 
          success: false, 
          error: 'Cannot delete account while owning organizations. Transfer ownership first.' 
        };
      }

      // Begin account deletion process
      const { error: deleteError } = await this.supabase
        .from('users')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          deletion_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (deleteError) {
        throw new Error(`Failed to delete account: ${deleteError.message}`);
      }

      // Log account deletion
      await this.logUserEvent(userId, 'account_deleted', {
        reason,
        deleted_at: new Date().toISOString()
      });

      // Schedule data cleanup (would be handled by a background job)
      await this.scheduleDataCleanup(userId);

      return { success: true };

    } catch (error) {
      console.error('Delete account error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Private helper methods
   */
  private async verifyCurrentPassword(userId: string, password: string): Promise<boolean> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (!user?.password_hash) {
        return false;
      }

      return await bcrypt.compare(password, user.password_hash);

    } catch (error) {
      console.error('Verify password error:', error);
      return false;
    }
  }

  private validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }

    return { isValid: true };
  }

  private parseUserPreferences(prefsData: any): UserPreferences {
    const defaultPrefs: UserPreferences = {
      notifications: {
        email: true,
        inApp: true,
        marketing: false,
        teamUpdates: true,
        billingAlerts: true
      },
      display: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY'
      },
      privacy: {
        profileVisibility: 'team',
        showEmail: false,
        showActivity: true
      },
      ai: {
        defaultModel: 'gpt-4',
        creativityLevel: 70,
        includeDataContext: true,
        savePromptHistory: true
      }
    };

    if (!prefsData) {
      return defaultPrefs;
    }

    return {
      notifications: { ...defaultPrefs.notifications, ...prefsData.notifications },
      display: { ...defaultPrefs.display, ...prefsData.display },
      privacy: { ...defaultPrefs.privacy, ...prefsData.privacy },
      ai: { ...defaultPrefs.ai, ...prefsData.ai }
    };
  }

  private serializePreferences(prefs: UserPreferences): any {
    return {
      notifications: prefs.notifications,
      display: prefs.display,
      privacy: prefs.privacy,
      ai: prefs.ai
    };
  }

  private async sendEmailChangeVerification(email: string, token: string): Promise<void> {
    // This would integrate with your email service
    console.log('Email change verification:', {
      to: email,
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email-change/${token}`
    });
  }

  private async invalidateUserSessions(userId: string, keepCurrent: boolean = false): Promise<void> {
    // This would invalidate user sessions in your session store
    console.log('Invalidating user sessions:', { userId, keepCurrent });
  }

  private async scheduleDataCleanup(userId: string): Promise<void> {
    // Schedule background job to clean up user data after grace period
    await this.supabase
      .from('data_cleanup_jobs')
      .insert({
        user_id: userId,
        job_type: 'user_deletion',
        scheduled_for: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        created_at: new Date().toISOString()
      });
  }

  private async logUserEvent(userId: string, eventType: string, eventData: any): Promise<void> {
    await this.supabase
      .from('user_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      });
  }
}

export default UserProfileService;