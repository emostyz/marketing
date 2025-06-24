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
  type: 'presentation' | 'template'
}

// Real presentations will be loaded from API
export const loadUserPresentations = async (userId: string): Promise<Presentation[]> => {
  try {
    const response = await fetch(`/api/presentations?userId=${userId}`)
    if (response.ok) {
      const presentations = await response.json()
      return presentations.map((p: any) => ({
        id: p.id,
        title: p.title || 'Untitled Presentation',
        updatedAt: new Date(p.updatedAt || p.createdAt),
        createdAt: new Date(p.createdAt),
        isStarred: p.isStarred || false,
        owner: 'You',
        lastEditor: 'You',
        size: `${Math.round((JSON.stringify(p.slides || []).length / 1024))} KB`,
        type: p.status === 'published' ? 'presentation' : 'presentation'
      }))
    }
    return []
  } catch (error) {
    console.error('Failed to load presentations:', error)
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
    const userPresentations = await loadUserPresentations(userId)
    if (userPresentations.length > 0) {
      return userPresentations
    } else {
      // Use mock data if no real presentations found
      return mockPresentations
    }
  } catch (error) {
    console.error('Failed to load presentations:', error)
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