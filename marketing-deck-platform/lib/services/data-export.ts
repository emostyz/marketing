/**
 * Data Export and Backup System
 * Handles exporting user data, presentations, and creating backups
 */

import { createClient } from '@supabase/supabase-js';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import archiver from 'archiver';
import path from 'path';

export interface ExportOptions {
  userId?: string;
  organizationId?: string;
  includeData: {
    presentations: boolean;
    userProfile: boolean;
    teamData: boolean;
    uploadedFiles: boolean;
    analytics: boolean;
    aiUsage: boolean;
    billingHistory: boolean;
  };
  format: 'json' | 'csv' | 'pdf' | 'zip';
  dateRange?: {
    from: Date;
    to: Date;
  };
  compressionLevel?: number;
}

export interface ExportResult {
  success: boolean;
  exportId: string;
  downloadUrl?: string;
  fileSize?: number;
  expiresAt?: Date;
  error?: string;
}

export interface BackupOptions {
  organizationId: string;
  includeFiles: boolean;
  retentionDays: number;
  encryption: boolean;
  compressionLevel: number;
}

export interface BackupResult {
  success: boolean;
  backupId: string;
  backupSize: number;
  backupLocation: string;
  createdAt: Date;
  retentionUntil: Date;
  error?: string;
}

export class DataExportService {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Export user data in specified format
   */
  async exportUserData(
    userId: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create export record
      await this.supabase
        .from('data_exports')
        .insert({
          id: exportId,
          user_id: userId,
          organization_id: options.organizationId,
          options: options,
          status: 'processing',
          created_at: new Date().toISOString()
        });

      // Collect data based on options
      const exportData = await this.collectExportData(userId, options);

      // Generate export file
      const exportFile = await this.generateExportFile(exportId, exportData, options);

      // Upload to storage
      const downloadUrl = await this.uploadExportFile(exportId, exportFile, options.format);

      // Calculate expiration (30 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Update export record
      await this.supabase
        .from('data_exports')
        .update({
          status: 'completed',
          download_url: downloadUrl,
          file_size: exportFile.size,
          expires_at: expiresAt.toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', exportId);

      // Log export
      await this.logExportEvent(userId, 'data_exported', {
        export_id: exportId,
        format: options.format,
        size: exportFile.size,
        includes: Object.keys(options.includeData).filter(k => options.includeData[k as keyof typeof options.includeData])
      });

      return {
        success: true,
        exportId,
        downloadUrl,
        fileSize: exportFile.size,
        expiresAt
      };

    } catch (error) {
      console.error('Export user data error:', error);
      
      // Update export record with error
      await this.supabase
        .from('data_exports')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', exportId);

      return {
        success: false,
        exportId: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Export organization data
   */
  async exportOrganizationData(
    organizationId: string,
    requestedBy: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // Check permissions
      const hasPermission = await this.checkExportPermission(requestedBy, organizationId);
      if (!hasPermission) {
        return {
          success: false,
          exportId: '',
          error: 'Insufficient permissions to export organization data'
        };
      }

      const exportId = `org_export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create export record
      await this.supabase
        .from('organization_exports')
        .insert({
          id: exportId,
          organization_id: organizationId,
          requested_by: requestedBy,
          options: options,
          status: 'processing',
          created_at: new Date().toISOString()
        });

      // Collect organization data
      const exportData = await this.collectOrganizationData(organizationId, options);

      // Generate export file
      const exportFile = await this.generateExportFile(exportId, exportData, options);

      // Upload to storage
      const downloadUrl = await this.uploadExportFile(exportId, exportFile, options.format);

      // Calculate expiration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Org exports expire in 7 days

      // Update export record
      await this.supabase
        .from('organization_exports')
        .update({
          status: 'completed',
          download_url: downloadUrl,
          file_size: exportFile.size,
          expires_at: expiresAt.toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', exportId);

      return {
        success: true,
        exportId,
        downloadUrl,
        fileSize: exportFile.size,
        expiresAt
      };

    } catch (error) {
      console.error('Export organization data error:', error);
      return {
        success: false,
        exportId: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create automated backup
   */
  async createBackup(
    options: BackupOptions,
    triggeredBy?: string
  ): Promise<BackupResult> {
    try {
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create backup record
      await this.supabase
        .from('organization_backups')
        .insert({
          id: backupId,
          organization_id: options.organizationId,
          triggered_by: triggeredBy,
          options: options,
          status: 'processing',
          created_at: new Date().toISOString()
        });

      // Collect all organization data
      const backupData = await this.collectCompleteOrganizationData(options.organizationId, options);

      // Create backup archive
      const backupFile = await this.createBackupArchive(backupId, backupData, options);

      // Store backup in secure location
      const backupLocation = await this.storeBackup(backupId, backupFile, options);

      // Calculate retention date
      const retentionUntil = new Date();
      retentionUntil.setDate(retentionUntil.getDate() + options.retentionDays);

      // Update backup record
      await this.supabase
        .from('organization_backups')
        .update({
          status: 'completed',
          backup_location: backupLocation,
          backup_size: backupFile.size,
          retention_until: retentionUntil.toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', backupId);

      // Log backup creation
      await this.logBackupEvent(options.organizationId, 'backup_created', {
        backup_id: backupId,
        size: backupFile.size,
        retention_days: options.retentionDays
      });

      return {
        success: true,
        backupId,
        backupSize: backupFile.size,
        backupLocation,
        createdAt: new Date(),
        retentionUntil
      };

    } catch (error) {
      console.error('Create backup error:', error);
      
      // Update backup record with error
      await this.supabase
        .from('organization_backups')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', backupId);

      return {
        success: false,
        backupId: '',
        backupSize: 0,
        backupLocation: '',
        createdAt: new Date(),
        retentionUntil: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(
    backupId: string,
    organizationId: string,
    requestedBy: string,
    options: {
      overwriteExisting: boolean;
      selectiveRestore: string[];
      createRestorePoint: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify backup exists and belongs to organization
      const { data: backup } = await this.supabase
        .from('organization_backups')
        .select('*')
        .eq('id', backupId)
        .eq('organization_id', organizationId)
        .eq('status', 'completed')
        .single();

      if (!backup) {
        return { success: false, error: 'Backup not found or invalid' };
      }

      // Check if backup is still within retention period
      if (new Date(backup.retention_until) < new Date()) {
        return { success: false, error: 'Backup has expired and is no longer available' };
      }

      // Create restore point if requested
      if (options.createRestorePoint) {
        await this.createBackup({
          organizationId,
          includeFiles: true,
          retentionDays: 30,
          encryption: true,
          compressionLevel: 9
        }, requestedBy);
      }

      // Download and extract backup
      const backupData = await this.downloadAndExtractBackup(backup.backup_location);

      // Perform selective or full restore
      await this.performRestore(organizationId, backupData, options);

      // Log restore operation
      await this.logBackupEvent(organizationId, 'backup_restored', {
        backup_id: backupId,
        restored_by: requestedBy,
        selective: options.selectiveRestore.length > 0,
        items: options.selectiveRestore
      });

      return { success: true };

    } catch (error) {
      console.error('Restore backup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clean up expired exports and backups
   */
  async cleanupExpiredData(): Promise<{
    cleanedExports: number;
    cleanedBackups: number;
    freedSpace: number;
  }> {
    try {
      let freedSpace = 0;
      
      // Clean up expired exports
      const { data: expiredExports } = await this.supabase
        .from('data_exports')
        .select('id, download_url, file_size')
        .lt('expires_at', new Date().toISOString())
        .eq('status', 'completed');

      for (const exportRecord of expiredExports || []) {
        await this.deleteExportFile(exportRecord.download_url);
        freedSpace += exportRecord.file_size || 0;
      }

      const { count: cleanedExports } = await this.supabase
        .from('data_exports')
        .delete()
        .lt('expires_at', new Date().toISOString());

      // Clean up expired backups
      const { data: expiredBackups } = await this.supabase
        .from('organization_backups')
        .select('id, backup_location, backup_size')
        .lt('retention_until', new Date().toISOString())
        .eq('status', 'completed');

      for (const backupRecord of expiredBackups || []) {
        await this.deleteBackupFile(backupRecord.backup_location);
        freedSpace += backupRecord.backup_size || 0;
      }

      const { count: cleanedBackups } = await this.supabase
        .from('organization_backups')
        .delete()
        .lt('retention_until', new Date().toISOString());

      return {
        cleanedExports: cleanedExports || 0,
        cleanedBackups: cleanedBackups || 0,
        freedSpace
      };

    } catch (error) {
      console.error('Cleanup expired data error:', error);
      return { cleanedExports: 0, cleanedBackups: 0, freedSpace: 0 };
    }
  }

  /**
   * Private helper methods
   */
  private async collectExportData(userId: string, options: ExportOptions): Promise<any> {
    const data: any = {};

    if (options.includeData.userProfile) {
      const { data: profile } = await this.supabase
        .from('users')
        .select(`
          *,
          user_preferences(*),
          user_company_settings(*)
        `)
        .eq('id', userId)
        .single();
      data.userProfile = profile;
    }

    if (options.includeData.presentations) {
      let query = this.supabase
        .from('presentations')
        .select('*')
        .eq('user_id', userId);

      if (options.dateRange) {
        query = query
          .gte('created_at', options.dateRange.from.toISOString())
          .lte('created_at', options.dateRange.to.toISOString());
      }

      const { data: presentations } = await query;
      data.presentations = presentations;
    }

    if (options.includeData.uploadedFiles) {
      const { data: files } = await this.supabase
        .from('uploaded_files')
        .select('*')
        .eq('user_id', userId);
      data.uploadedFiles = files;
    }

    if (options.includeData.analytics) {
      const { data: analytics } = await this.supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId);
      data.analytics = analytics;
    }

    if (options.includeData.aiUsage) {
      const { data: aiUsage } = await this.supabase
        .from('ai_usage_logs')
        .select('*')
        .eq('user_id', userId);
      data.aiUsage = aiUsage;
    }

    return data;
  }

  private async collectOrganizationData(organizationId: string, options: ExportOptions): Promise<any> {
    const data: any = {};

    if (options.includeData.teamData) {
      const { data: teamMembers } = await this.supabase
        .from('team_members')
        .select('*')
        .eq('organization_id', organizationId);
      data.teamMembers = teamMembers;
    }

    if (options.includeData.presentations) {
      const { data: presentations } = await this.supabase
        .from('presentations')
        .select('*')
        .eq('organization_id', organizationId);
      data.presentations = presentations;
    }

    if (options.includeData.analytics) {
      const { data: analytics } = await this.supabase
        .from('organization_analytics')
        .select('*')
        .eq('organization_id', organizationId);
      data.analytics = analytics;
    }

    if (options.includeData.billingHistory) {
      const { data: billing } = await this.supabase
        .from('billing_history')
        .select('*')
        .eq('organization_id', organizationId);
      data.billingHistory = billing;
    }

    return data;
  }

  private async collectCompleteOrganizationData(organizationId: string, options: BackupOptions): Promise<any> {
    // Collect all organization data for backup
    const data: any = {
      organization: null,
      teamMembers: [],
      presentations: [],
      uploadedFiles: [],
      settings: {},
      analytics: [],
      backupMetadata: {
        createdAt: new Date().toISOString(),
        version: '1.0',
        organizationId
      }
    };

    // Get organization details
    const { data: org } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();
    data.organization = org;

    // Get all team members
    const { data: members } = await this.supabase
      .from('team_members')
      .select('*')
      .eq('organization_id', organizationId);
    data.teamMembers = members;

    // Get all presentations
    const { data: presentations } = await this.supabase
      .from('presentations')
      .select('*')
      .eq('organization_id', organizationId);
    data.presentations = presentations;

    // Include files if requested
    if (options.includeFiles) {
      const { data: files } = await this.supabase
        .from('uploaded_files')
        .select('*')
        .eq('organization_id', organizationId);
      data.uploadedFiles = files;
    }

    return data;
  }

  private async generateExportFile(exportId: string, data: any, options: ExportOptions): Promise<{ size: number; buffer: Buffer }> {
    let buffer: Buffer;

    switch (options.format) {
      case 'json':
        buffer = Buffer.from(JSON.stringify(data, null, 2));
        break;
      case 'csv':
        buffer = await this.generateCSVExport(data);
        break;
      case 'pdf':
        buffer = await this.generatePDFExport(data);
        break;
      case 'zip':
        buffer = await this.generateZipExport(data, options.compressionLevel || 6);
        break;
      default:
        throw new Error('Unsupported export format');
    }

    return { size: buffer.length, buffer };
  }

  private async generateCSVExport(data: any): Promise<Buffer> {
    // Convert JSON data to CSV format
    const csvLines: string[] = [];
    
    // Helper function to flatten objects for CSV
    const flattenObject = (obj: any, prefix = ''): any => {
      const flattened: any = {};
      for (const key in obj) {
        if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}.`));
        } else {
          flattened[`${prefix}${key}`] = obj[key];
        }
      }
      return flattened;
    };

    // Process each data type
    for (const [dataType, records] of Object.entries(data)) {
      if (Array.isArray(records) && records.length > 0) {
        csvLines.push(`\n# ${dataType.toUpperCase()}`);
        
        const flattened = records.map(record => flattenObject(record));
        const headers = Object.keys(flattened[0]);
        
        csvLines.push(headers.join(','));
        
        flattened.forEach(record => {
          const values = headers.map(header => {
            const value = record[header];
            return value !== null && value !== undefined ? `"${String(value).replace(/"/g, '""')}"` : '';
          });
          csvLines.push(values.join(','));
        });
      }
    }

    return Buffer.from(csvLines.join('\n'));
  }

  private async generatePDFExport(data: any): Promise<Buffer> {
    // This would use a PDF library like puppeteer or jsPDF
    // For now, return a simple text-based PDF content
    const content = JSON.stringify(data, null, 2);
    return Buffer.from(content);
  }

  private async generateZipExport(data: any, compressionLevel: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const archive = archiver('zip', { zlib: { level: compressionLevel } });

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      // Add JSON files for each data type
      for (const [dataType, records] of Object.entries(data)) {
        archive.append(JSON.stringify(records, null, 2), { name: `${dataType}.json` });
      }

      archive.finalize();
    });
  }

  private async createBackupArchive(backupId: string, data: any, options: BackupOptions): Promise<{ size: number; buffer: Buffer }> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const archive = archiver('zip', { zlib: { level: options.compressionLevel } });

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({ size: buffer.length, buffer });
      });
      archive.on('error', reject);

      // Add metadata file
      archive.append(JSON.stringify({
        backupId,
        createdAt: new Date().toISOString(),
        options,
        version: '1.0'
      }, null, 2), { name: 'backup_metadata.json' });

      // Add data files
      for (const [dataType, records] of Object.entries(data)) {
        archive.append(JSON.stringify(records, null, 2), { name: `${dataType}.json` });
      }

      archive.finalize();
    });
  }

  private async uploadExportFile(exportId: string, file: { size: number; buffer: Buffer }, format: string): Promise<string> {
    const filename = `exports/${exportId}.${format}`;
    
    const { data, error } = await this.supabase.storage
      .from('data-exports')
      .upload(filename, file.buffer, {
        contentType: this.getContentType(format),
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to upload export file: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from('data-exports')
      .getPublicUrl(filename);

    return urlData.publicUrl;
  }

  private async storeBackup(backupId: string, file: { size: number; buffer: Buffer }, options: BackupOptions): Promise<string> {
    const filename = `backups/${options.organizationId}/${backupId}.zip`;
    
    const { data, error } = await this.supabase.storage
      .from('organization-backups')
      .upload(filename, file.buffer, {
        contentType: 'application/zip',
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to store backup: ${error.message}`);
    }

    return filename;
  }

  private getContentType(format: string): string {
    const types: Record<string, string> = {
      'json': 'application/json',
      'csv': 'text/csv',
      'pdf': 'application/pdf',
      'zip': 'application/zip'
    };
    return types[format] || 'application/octet-stream';
  }

  private async checkExportPermission(userId: string, organizationId: string): Promise<boolean> {
    // Check if user has admin permissions for the organization
    const { data: member } = await this.supabase
      .from('team_members')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    return member?.role === 'admin' || member?.role === 'owner';
  }

  private async downloadAndExtractBackup(backupLocation: string): Promise<any> {
    // Download and extract backup file
    // This would implement actual file download and extraction logic
    return {};
  }

  private async performRestore(organizationId: string, backupData: any, options: any): Promise<void> {
    // Implement restore logic based on backup data and options
    console.log('Performing restore for organization:', organizationId);
  }

  private async deleteExportFile(downloadUrl: string): Promise<void> {
    // Extract filename from URL and delete from storage
    const filename = downloadUrl.split('/').pop();
    if (filename) {
      await this.supabase.storage
        .from('data-exports')
        .remove([`exports/${filename}`]);
    }
  }

  private async deleteBackupFile(backupLocation: string): Promise<void> {
    await this.supabase.storage
      .from('organization-backups')
      .remove([backupLocation]);
  }

  private async logExportEvent(userId: string, eventType: string, eventData: any): Promise<void> {
    await this.supabase
      .from('export_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      });
  }

  private async logBackupEvent(organizationId: string, eventType: string, eventData: any): Promise<void> {
    await this.supabase
      .from('backup_events')
      .insert({
        organization_id: organizationId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      });
  }
}

export default DataExportService;