import { supabase } from '@/lib/supabase/client'
import { ClientAuth } from '@/lib/auth/client-auth'
import { authRefreshManager } from '@/lib/auth/auth-refresh-manager'

export interface AutoSaveConfig {
  debounceMs: number
  maxRetries: number
  saveOnVisibilityChange: boolean
  saveOnBeforeUnload: boolean
  enableVersionHistory: boolean
}

export interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'offline'
  lastSaved: Date | null
  lastError: string | null
  retryCount: number
  hasUnsavedChanges: boolean
}

export interface PresentationDraft {
  id: string
  presentationId: string
  userId: string
  title: string
  slides: any[]
  metadata: any
  version: number
  createdAt: string
  updatedAt: string
  isAutoSave: boolean
  changesSummary: string[]
}

export class EnhancedAutoSave {
  private config: AutoSaveConfig
  private state: AutoSaveState
  private debounceTimer: NodeJS.Timeout | null = null
  private savePromise: Promise<void> | null = null
  private onStateChange: ((state: AutoSaveState) => void) | null = null
  private presentationId: string | null = null
  private lastSavedContent: string = ''
  private changesSinceLastSave: string[] = []

  constructor(config: Partial<AutoSaveConfig> = {}) {
    this.config = {
      debounceMs: 3000, // 3 seconds
      maxRetries: 3,
      saveOnVisibilityChange: true,
      saveOnBeforeUnload: true,
      enableVersionHistory: true,
      ...config
    }

    this.state = {
      status: 'idle',
      lastSaved: null,
      lastError: null,
      retryCount: 0,
      hasUnsavedChanges: false
    }

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return

    // Save on visibility change (tab switch, minimize)
    if (this.config.saveOnVisibilityChange) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && this.state.hasUnsavedChanges) {
          this.saveImmediate()
        }
      })
    }

    // Save before page unload
    if (this.config.saveOnBeforeUnload) {
      window.addEventListener('beforeunload', (e) => {
        if (this.state.hasUnsavedChanges) {
          this.saveImmediate()
          e.preventDefault()
          e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
          return e.returnValue
        }
      })
    }

    // Save on network reconnection
    window.addEventListener('online', () => {
      if (this.state.status === 'offline' && this.state.hasUnsavedChanges) {
        this.saveDebounced()
      }
    })

    // Handle network disconnection
    window.addEventListener('offline', () => {
      this.updateState({ status: 'offline' })
    })
  }

  public initialize(presentationId: string, onStateChange?: (state: AutoSaveState) => void) {
    this.presentationId = presentationId
    this.onStateChange = onStateChange || null
    console.log('🔄 Enhanced AutoSave initialized for presentation:', presentationId)
  }

  public registerChange(changeType: string, presentationData: any) {
    if (!this.presentationId) {
      console.warn('AutoSave not initialized - call initialize() first')
      return
    }

    const currentContent = JSON.stringify(presentationData)
    
    // Only register if content actually changed
    if (currentContent === this.lastSavedContent) {
      return
    }

    this.changesSinceLastSave.push(`${new Date().toISOString()}: ${changeType}`)
    this.updateState({ hasUnsavedChanges: true })
    
    console.log(`📝 Change registered: ${changeType}`)
    this.saveDebounced(presentationData)
  }

  private saveDebounced(presentationData?: any) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      this.save(presentationData)
    }, this.config.debounceMs)
  }

  public async saveImmediate(presentationData?: any): Promise<boolean> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    
    return this.save(presentationData)
  }

  private async save(presentationData?: any): Promise<boolean> {
    if (!this.presentationId || !this.state.hasUnsavedChanges) {
      return true
    }

    // Prevent concurrent saves
    if (this.savePromise) {
      await this.savePromise
      return true
    }

    this.updateState({ status: 'saving', lastError: null })

    this.savePromise = this.performSave(presentationData)
    
    try {
      await this.savePromise
      this.updateState({ 
        status: 'saved', 
        lastSaved: new Date(), 
        hasUnsavedChanges: false,
        retryCount: 0 
      })
      
      this.lastSavedContent = JSON.stringify(presentationData)
      this.changesSinceLastSave = []
      
      console.log('✅ Auto-save successful at', new Date().toLocaleTimeString())
      
      // Save to local storage as backup
      this.saveToLocalStorage(presentationData)
      
      return true
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Auto-save failed:', errorMessage)
      
      // Save to local storage as fallback
      this.saveToLocalStorage(presentationData)
      
      this.updateState({ 
        status: 'error', 
        lastError: errorMessage,
        retryCount: this.state.retryCount + 1
      })

      // Smart retry logic based on error type
      if (this.shouldRetry(error, this.state.retryCount)) {
        const delay = this.calculateRetryDelay(this.state.retryCount)
        console.log(`🔄 Retrying auto-save (${this.state.retryCount}/${this.config.maxRetries}) in ${delay}ms`)
        setTimeout(() => this.save(presentationData), delay)
      } else {
        console.error('❌ Max retries reached or non-retryable error, giving up')
      }
      
      return false
    } finally {
      this.savePromise = null
    }
  }

  private async performSave(presentationData: any): Promise<void> {
    // Ensure auth token is valid for the save operation
    const tokenValid = await authRefreshManager.ensureValidTokenForOperation(30000) // 30 seconds
    if (!tokenValid) {
      throw new Error('Failed to ensure valid authentication token')
    }

    const user = await ClientAuth.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    if (!presentationData) {
      throw new Error('No presentation data to save')
    }

    // Additional validation for presentation data
    if (!presentationData.slides || !Array.isArray(presentationData.slides)) {
      throw new Error('Invalid presentation data: slides must be an array')
    }

    // Save to main presentations table
    const mainSaveData = {
      id: this.presentationId,
      user_id: user.id,
      title: presentationData.title || 'Untitled Presentation',
      slides_data: presentationData.slides || [],
      metadata: {
        ...presentationData.metadata,
        updatedAt: new Date().toISOString(),
        version: (presentationData.metadata?.version || 0) + 1,
        autoSaved: true,
        lastChangesSummary: this.changesSinceLastSave.slice(-5) // Keep last 5 changes
      },
      updated_at: new Date().toISOString()
    }

    const { error: mainError } = await supabase
      .from('presentations')
      .upsert(mainSaveData)

    if (mainError) {
      throw new Error(`Failed to save presentation: ${mainError.message}`)
    }

    // Save to drafts/auto-saves table for version history
    if (this.config.enableVersionHistory) {
      const draftData = {
        presentation_id: this.presentationId!,
        user_id: user.id,
        title: presentationData.title || 'Untitled Presentation',
        slides: presentationData.slides || [],
        metadata: presentationData.metadata || {},
        version: mainSaveData.metadata.version,
        is_auto_save: true,
        changes_summary: [...this.changesSinceLastSave]
      }

      const { error: draftError } = await supabase
        .from('presentation_drafts')
        .insert(draftData)

      if (draftError) {
        console.warn('Failed to save draft version:', draftError.message)
        // Don't throw - main save succeeded
      }

      // Clean up old drafts (keep last 10 auto-saves)
      await this.cleanupOldDrafts(this.presentationId!, user.id)
    }
  }

  private async cleanupOldDrafts(presentationId: string, userId: string) {
    try {
      // Get drafts ordered by creation date, skip the 10 most recent
      const { data: oldDrafts, error } = await supabase
        .from('presentation_drafts')
        .select('id')
        .eq('presentation_id', presentationId)
        .eq('user_id', userId)
        .eq('is_auto_save', true)
        .order('created_at', { ascending: false })
        .range(10, 1000) // Skip first 10, get the rest

      if (error || !oldDrafts?.length) return

      const idsToDelete = oldDrafts.map(draft => draft.id)
      
      await supabase
        .from('presentation_drafts')
        .delete()
        .in('id', idsToDelete)

      console.log(`🧹 Cleaned up ${idsToDelete.length} old auto-save drafts`)
    } catch (error) {
      console.warn('Failed to cleanup old drafts:', error)
    }
  }

  public async loadLatestDraft(presentationId: string): Promise<PresentationDraft | null> {
    try {
      const user = await ClientAuth.getCurrentUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('presentation_drafts')
        .select('*')
        .eq('presentation_id', presentationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) return null

      return {
        id: data.id,
        presentationId: data.presentation_id,
        userId: data.user_id,
        title: data.title,
        slides: data.slides,
        metadata: data.metadata,
        version: data.version,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isAutoSave: data.is_auto_save,
        changesSummary: data.changes_summary || []
      }
    } catch (error) {
      console.error('Failed to load latest draft:', error)
      return null
    }
  }

  public async getDraftHistory(presentationId: string, limit: number = 10): Promise<PresentationDraft[]> {
    try {
      const user = await ClientAuth.getCurrentUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('presentation_drafts')
        .select('*')
        .eq('presentation_id', presentationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error || !data) return []

      return data.map(item => ({
        id: item.id,
        presentationId: item.presentation_id,
        userId: item.user_id,
        title: item.title,
        slides: item.slides,
        metadata: item.metadata,
        version: item.version,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        isAutoSave: item.is_auto_save,
        changesSummary: item.changes_summary || []
      }))
    } catch (error) {
      console.error('Failed to get draft history:', error)
      return []
    }
  }

  private updateState(updates: Partial<AutoSaveState>) {
    this.state = { ...this.state, ...updates }
    if (this.onStateChange) {
      this.onStateChange(this.state)
    }
  }

  public getState(): AutoSaveState {
    return { ...this.state }
  }

  /**
   * Save to local storage as backup/fallback
   */
  private saveToLocalStorage(presentationData: any) {
    if (typeof window === 'undefined') return

    try {
      const backupData = {
        presentationId: this.presentationId,
        data: presentationData,
        timestamp: new Date().toISOString(),
        changes: [...this.changesSinceLastSave]
      }
      
      localStorage.setItem(`presentation_backup_${this.presentationId}`, JSON.stringify(backupData))
      console.log('💾 Saved backup to local storage')
    } catch (error) {
      console.warn('Failed to save to local storage:', error)
    }
  }

  /**
   * Load from local storage backup
   */
  public loadFromLocalStorage(): any | null {
    if (typeof window === 'undefined' || !this.presentationId) return null

    try {
      const backupData = localStorage.getItem(`presentation_backup_${this.presentationId}`)
      if (backupData) {
        const parsed = JSON.parse(backupData)
        console.log('💾 Found local storage backup from:', parsed.timestamp)
        return parsed
      }
    } catch (error) {
      console.warn('Failed to load from local storage:', error)
    }
    return null
  }

  /**
   * Clear local storage backup
   */
  public clearLocalStorageBackup() {
    if (typeof window === 'undefined' || !this.presentationId) return

    try {
      localStorage.removeItem(`presentation_backup_${this.presentationId}`)
      console.log('💾 Cleared local storage backup')
    } catch (error) {
      console.warn('Failed to clear local storage backup:', error)
    }
  }

  /**
   * Determine if we should retry based on error type and attempt count
   */
  private shouldRetry(error: any, retryCount: number): boolean {
    if (retryCount >= this.config.maxRetries) {
      return false
    }

    const errorMessage = error instanceof Error ? error.message : String(error)

    // Don't retry on authentication errors
    if (errorMessage.includes('not authenticated') || 
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')) {
      return false
    }

    // Don't retry on validation errors
    if (errorMessage.includes('Invalid presentation data') ||
        errorMessage.includes('validation')) {
      return false
    }

    // Don't retry on quota/billing errors
    if (errorMessage.includes('quota') || 
        errorMessage.includes('billing') ||
        errorMessage.includes('subscription')) {
      return false
    }

    // Retry on network errors, timeouts, and temporary failures
    return true
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = 2000 // 2 seconds
    const maxDelay = 30000 // 30 seconds
    
    // Exponential backoff
    let delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay)
    
    // Add jitter (±25%)
    const jitter = delay * 0.25 * (Math.random() - 0.5)
    delay += jitter
    
    return Math.max(1000, Math.round(delay)) // Minimum 1 second
  }

  /**
   * Recovery method to attempt saving after failures
   */
  public async recoverAndSave(presentationData?: any): Promise<boolean> {
    console.log('🔄 Attempting recovery save...')
    
    // Reset retry count for recovery attempt
    this.updateState({ retryCount: 0, lastError: null })
    
    // Ensure auth is refreshed
    try {
      await authRefreshManager.refreshToken()
    } catch (error) {
      console.error('Failed to refresh token during recovery:', error)
    }
    
    return this.saveImmediate(presentationData)
  }

  /**
   * Get backup status and information
   */
  public getBackupInfo(): { hasBackup: boolean; backupTimestamp?: string; backupChanges?: string[] } {
    const backup = this.loadFromLocalStorage()
    
    return {
      hasBackup: !!backup,
      backupTimestamp: backup?.timestamp,
      backupChanges: backup?.changes
    }
  }

  public destroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    
    // Save any pending changes before destroying
    if (this.state.hasUnsavedChanges) {
      this.saveImmediate()
    }
    
    console.log('🔄 Enhanced AutoSave destroyed')
  }
}