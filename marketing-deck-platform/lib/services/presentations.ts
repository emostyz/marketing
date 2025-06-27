// Shared service for loading and managing presentation data across components

export interface Presentation {
  id: string
  title: string
  updatedAt: Date
  createdAt: Date
  thumbnail?: string
  isStarred: boolean
  owner: string
  lastEditor: string
  size: string
  type: 'presentation' | 'template' | 'draft' | 'dataset'
  status?: string
  description?: string
}

// Load drafts from localStorage for the specific user
export const loadUserDrafts = (userId: string): Presentation[] => {
  if (typeof window === 'undefined') return [] // Server-side rendering safety
  
  const drafts: Presentation[] = []
  
  try {
    // Load intake form drafts
    const intakeDraftKey = `easydecks-intake-draft-${userId}`
    const intakeSaved = localStorage.getItem(intakeDraftKey)
    
    if (intakeSaved) {
      const draft = JSON.parse(intakeSaved)
      const draftData = draft.data
      
      drafts.push({
        id: `intake-draft-${userId}`,
        title: draftData.context?.description || draftData.context?.businessContext || 'Intake Form Draft',
        updatedAt: new Date(draft.timestamp),
        createdAt: new Date(draft.timestamp),
        isStarred: false,
        owner: 'You',
        lastEditor: 'You',
        size: `${Math.round(JSON.stringify(draftData).length / 1024)} KB`,
        type: 'draft',
        description: 'In-progress intake form'
      })
    }

    // Load business context drafts
    const contextDraftKey = `business-context-draft-${userId}`
    const contextSaved = localStorage.getItem(contextDraftKey)
    
    if (contextSaved) {
      const draft = JSON.parse(contextSaved)
      
      drafts.push({
        id: `context-draft-${userId}`,
        title: draft.title || 'Business Context Draft',
        updatedAt: new Date(draft.timestamp),
        createdAt: new Date(draft.timestamp),
        isStarred: false,
        owner: 'You',
        lastEditor: 'You',
        size: `${Math.round(JSON.stringify(draft.context).length / 1024)} KB`,
        type: 'draft',
        description: 'In-progress business context form'
      })
    }
    
    return drafts
  } catch (error) {
    console.error('Failed to load drafts:', error)
    return []
  }
}

// Real presentations will be loaded from API
export const loadUserPresentations = async (userId: string): Promise<Presentation[]> => {
  try {
    const response = await fetch('/api/presentations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    
    if (response.ok) {
      const result = await response.json()
      const presentations = result.data || []
      
      return presentations.map((p: any) => ({
        id: p.id,
        title: p.title || 'Untitled Presentation',
        updatedAt: new Date(p.last_edited_at || p.updated_at || p.created_at),
        createdAt: new Date(p.created_at),
        isStarred: p.is_starred || false,
        owner: 'You',
        lastEditor: 'You',
        size: `${Math.round((JSON.stringify(p.slides || []).length / 1024))} KB`,
        type: p.status === 'published' ? 'presentation' : 'draft'
      }))
    }
    return []
  } catch (error) {
    console.error('Failed to load presentations:', error)
    return []
  }
}

// Load user data imports from API
export const loadUserDataImports = async (userId: string): Promise<Presentation[]> => {
  try {
    const response = await fetch('/api/data-imports', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    
    if (response.ok) {
      const result = await response.json()
      const dataImports = result.data || []
      
      return dataImports.map((di: any) => ({
        id: `import-${di.id}`,
        title: di.file_name || 'Untitled Dataset',
        updatedAt: new Date(di.updated_at || di.uploaded_at),
        createdAt: new Date(di.uploaded_at),
        isStarred: false,
        owner: 'You',
        lastEditor: 'You',
        size: `${Math.round(di.file_size / 1024)} KB`,
        type: 'dataset' as any,
        status: di.processing_status,
        description: di.description
      }))
    }
    return []
  } catch (error) {
    console.error('Failed to load data imports:', error)
    return []
  }
}

// Fallback mock data for demonstration - consistent across all components
export const mockPresentations: Presentation[] = [
  {
    id: '1',
    title: 'Q4 Sales Review',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    isStarred: true,
    owner: 'You',
    lastEditor: 'You',
    size: '2.4 MB',
    type: 'presentation'
  },
  {
    id: '2',
    title: 'Product Launch Strategy',
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    isStarred: false,
    owner: 'You',
    lastEditor: 'Sarah Johnson',
    size: '1.8 MB',
    type: 'presentation'
  },
  {
    id: '3',
    title: 'Board Meeting - November',
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    isStarred: true,
    owner: 'You',
    lastEditor: 'Mike Chen',
    size: '3.1 MB',
    type: 'presentation'
  },
  {
    id: '4',
    title: 'Customer Analytics Report',
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    isStarred: false,
    owner: 'You',
    lastEditor: 'Alex Rivera',
    size: '892 KB',
    type: 'presentation'
  }
]

// Combined data loading function with fallback
export const getPresentations = async (userId?: string): Promise<Presentation[]> => {
  if (!userId) {
    return mockPresentations
  }

  try {
    // Load presentations, drafts, and data imports
    const [userPresentations, userDataImports] = await Promise.all([
      loadUserPresentations(userId),
      loadUserDataImports(userId)
    ])
    const userDrafts = loadUserDrafts(userId)
    
    // Combine all items
    const allItems = [...userPresentations, ...userDataImports, ...userDrafts]
    
    if (allItems.length > 0) {
      // Sort by updatedAt date (most recent first)
      return allItems.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    } else {
      // Use mock data if no real presentations or drafts found
      return mockPresentations
    }
  } catch (error) {
    console.error('Failed to load presentations:', error)
    // Still try to load drafts even if API fails
    const userDrafts = loadUserDrafts(userId || '')
    if (userDrafts.length > 0) {
      return userDrafts
    }
    // Fallback to mock data on error
    return mockPresentations
  }
}

// Time formatting utility - consistent across components
export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 7)}w ago`
}