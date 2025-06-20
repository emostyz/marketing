interface PresentationData {
  id: string
  title: string
  slides: any[]
  userId: number
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  tags: string[]
  description?: string
  thumbnail?: string
  theme: string
  qaResponses?: any
  originalData?: any[]
}

// Mock database - in production, this would be a real database
class MockPresentationStorage {
  private presentations: Map<string, PresentationData> = new Map()

  constructor() {
    // Add some sample presentations
    this.presentations.set('demo-1', {
      id: 'demo-1',
      title: 'Q1 Sales Performance',
      slides: [
        {
          id: 'slide-1',
          type: 'title',
          title: 'Q1 Sales Performance',
          textBlocks: [
            {
              id: 'text-1',
              text: 'Q1 Sales Performance',
              style: 'title',
              formatting: { bold: true, fontSize: 32, color: '#ffffff', alignment: 'center' },
              position: { x: 100, y: 100, width: 600, height: 60 }
            }
          ]
        }
      ],
      userId: 1,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      isPublic: false,
      tags: ['sales', 'quarterly', 'performance'],
      description: 'Quarterly sales analysis with AI insights',
      theme: 'dark'
    })

    this.presentations.set('demo-2', {
      id: 'demo-2',
      title: 'Marketing ROI Analysis',
      slides: [
        {
          id: 'slide-1',
          type: 'title',
          title: 'Marketing ROI Analysis',
          textBlocks: [
            {
              id: 'text-1',
              text: 'Marketing ROI Analysis',
              style: 'title',
              formatting: { bold: true, fontSize: 32, color: '#ffffff', alignment: 'center' },
              position: { x: 100, y: 100, width: 600, height: 60 }
            }
          ]
        }
      ],
      userId: 1,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      isPublic: true,
      tags: ['marketing', 'roi', 'analytics'],
      description: 'Comprehensive marketing ROI breakdown',
      theme: 'blue'
    })
  }

  async savePresentation(presentation: Omit<PresentationData, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<string> {
    const id = presentation.id || this.generateId()
    const now = new Date()
    
    const existingPresentation = this.presentations.get(id)
    
    const presentationData: PresentationData = {
      ...presentation,
      id,
      createdAt: existingPresentation?.createdAt || now,
      updatedAt: now
    }

    this.presentations.set(id, presentationData)
    return id
  }

  async getPresentation(id: string): Promise<PresentationData | null> {
    return this.presentations.get(id) || null
  }

  async getUserPresentations(userId: number): Promise<PresentationData[]> {
    return Array.from(this.presentations.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  async getPublicPresentations(): Promise<PresentationData[]> {
    return Array.from(this.presentations.values())
      .filter(p => p.isPublic)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  async deletePresentation(id: string, userId: number): Promise<boolean> {
    const presentation = this.presentations.get(id)
    
    if (!presentation || presentation.userId !== userId) {
      return false
    }

    return this.presentations.delete(id)
  }

  async duplicatePresentation(id: string, userId: number, newTitle?: string): Promise<string | null> {
    const original = this.presentations.get(id)
    
    if (!original) {
      return null
    }

    const newId = this.generateId()
    const now = new Date()

    const duplicated: PresentationData = {
      ...original,
      id: newId,
      title: newTitle || `${original.title} (Copy)`,
      userId,
      createdAt: now,
      updatedAt: now,
      isPublic: false
    }

    this.presentations.set(newId, duplicated)
    return newId
  }

  async searchPresentations(query: string, userId?: number): Promise<PresentationData[]> {
    const lowerQuery = query.toLowerCase()
    
    return Array.from(this.presentations.values())
      .filter(p => {
        const matchesUser = !userId || p.userId === userId
        const matchesQuery = 
          p.title.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery) ||
          p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        
        return matchesUser && matchesQuery
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  async updatePresentationMetadata(
    id: string, 
    userId: number, 
    metadata: Partial<Pick<PresentationData, 'title' | 'description' | 'tags' | 'isPublic' | 'theme'>>
  ): Promise<boolean> {
    const presentation = this.presentations.get(id)
    
    if (!presentation || presentation.userId !== userId) {
      return false
    }

    const updated: PresentationData = {
      ...presentation,
      ...metadata,
      updatedAt: new Date()
    }

    this.presentations.set(id, updated)
    return true
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36)
  }
}

// Singleton instance
export const presentationStorage = new MockPresentationStorage()

// Helper functions for easier usage
export async function savePresentation(
  slides: any[], 
  title: string, 
  userId: number, 
  options: {
    id?: string
    description?: string
    tags?: string[]
    isPublic?: boolean
    theme?: string
    qaResponses?: any
    originalData?: any[]
  } = {}
): Promise<string> {
  return await presentationStorage.savePresentation({
    title,
    slides,
    userId,
    isPublic: options.isPublic || false,
    tags: options.tags || [],
    description: options.description,
    theme: options.theme || 'dark',
    qaResponses: options.qaResponses,
    originalData: options.originalData,
    id: options.id
  })
}

export async function getUserPresentations(userId: number): Promise<PresentationData[]> {
  return await presentationStorage.getUserPresentations(userId)
}

export async function getPresentation(id: string): Promise<PresentationData | null> {
  return await presentationStorage.getPresentation(id)
}

export async function deletePresentation(id: string, userId: number): Promise<boolean> {
  return await presentationStorage.deletePresentation(id, userId)
}

export async function duplicatePresentation(id: string, userId: number, newTitle?: string): Promise<string | null> {
  return await presentationStorage.duplicatePresentation(id, userId, newTitle)
}

export type { PresentationData }