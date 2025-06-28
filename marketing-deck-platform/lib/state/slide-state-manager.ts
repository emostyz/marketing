import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { supabase } from '@/lib/supabase/client'

export interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  content?: string
  style?: any
  isLocked?: boolean
  metadata?: any
  chartData?: any[]
  chartType?: string
  isVisible?: boolean
  aiGenerated?: boolean
  aiContext?: any
}

export interface Slide {
  id: string
  number: number
  title: string
  subtitle?: string
  content?: any
  elements: SlideElement[]
  background: any
  style?: string
  layout?: string
  animation?: any
  customStyles?: any
  charts?: any[]
  keyTakeaways?: string[]
  aiInsights?: any
  notes?: string
  transition?: any
  elementAnimations?: any
  aiGeneratedContent?: {
    originalPrompt?: string
    generatedAt?: string
    model?: string
    insights?: any[]
    dataAnalysis?: any
  }
  isDirty?: boolean
}

export interface PresentationState {
  presentationId: string | null
  title: string
  slides: Slide[]
  currentSlideIndex: number
  selectedElements: string[]
  isDirty: boolean
  lastSaved: Date | null
  version: number
  metadata: {
    createdAt: string
    updatedAt: string
    author?: string
    description?: string
    tags?: string[]
    aiContext?: any
  }
}

interface SlideStateStore extends PresentationState {
  // Actions
  setPresentation: (presentation: Partial<PresentationState>) => void
  addSlide: (slide: Slide, index?: number) => void
  updateSlide: (slideId: string, updates: Partial<Slide>) => void
  deleteSlide: (slideId: string) => void
  reorderSlides: (startIndex: number, endIndex: number) => void
  
  // Element actions
  addElement: (slideId: string, element: SlideElement) => void
  updateElement: (slideId: string, elementId: string, updates: Partial<SlideElement>) => void
  deleteElement: (slideId: string, elementId: string) => void
  selectElements: (elementIds: string[]) => void
  
  // AI content preservation
  preserveAIContent: (slideId: string, content: any) => void
  getAIContent: (slideId: string) => any
  
  // Navigation
  setCurrentSlide: (index: number) => void
  nextSlide: () => void
  previousSlide: () => void
  
  // Save state
  markDirty: () => void
  markClean: () => void
  updateLastSaved: () => void
  
  // Persistence
  saveToDB: () => Promise<boolean>
  loadFromDB: (presentationId: string) => Promise<boolean>
  
  // State management
  reset: () => void
  undo: () => void
  redo: () => void
  
  // History
  history: PresentationState[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
}

const initialState: PresentationState = {
  presentationId: null,
  title: 'Untitled Presentation',
  slides: [],
  currentSlideIndex: 0,
  selectedElements: [],
  isDirty: false,
  lastSaved: null,
  version: 1,
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export const useSlideStore = create<SlideStateStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      history: [initialState],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,

      // Core actions
      setPresentation: (presentation) => set(state => {
        Object.assign(state, presentation)
        state.metadata.updatedAt = new Date().toISOString()
      }),

      addSlide: (slide, index) => set(state => {
        const insertIndex = index ?? state.slides.length
        state.slides.splice(insertIndex, 0, {
          ...slide,
          number: insertIndex + 1,
          isDirty: true
        })
        
        // Renumber subsequent slides
        for (let i = insertIndex + 1; i < state.slides.length; i++) {
          state.slides[i].number = i + 1
        }
        
        state.isDirty = true
        state.metadata.updatedAt = new Date().toISOString()
        
        // Add to history
        get().pushToHistory()
      }),

      updateSlide: (slideId, updates) => set(state => {
        const slideIndex = state.slides.findIndex(s => s.id === slideId)
        if (slideIndex >= 0) {
          Object.assign(state.slides[slideIndex], updates)
          state.slides[slideIndex].isDirty = true
          state.isDirty = true
          state.metadata.updatedAt = new Date().toISOString()
          
          // Add to history
          get().pushToHistory()
        }
      }),

      deleteSlide: (slideId) => set(state => {
        const slideIndex = state.slides.findIndex(s => s.id === slideId)
        if (slideIndex >= 0) {
          state.slides.splice(slideIndex, 1)
          
          // Renumber remaining slides
          state.slides.forEach((slide, index) => {
            slide.number = index + 1
          })
          
          // Adjust current slide index if necessary
          if (state.currentSlideIndex >= state.slides.length && state.slides.length > 0) {
            state.currentSlideIndex = state.slides.length - 1
          }
          
          state.isDirty = true
          state.metadata.updatedAt = new Date().toISOString()
          
          // Add to history
          get().pushToHistory()
        }
      }),

      reorderSlides: (startIndex, endIndex) => set(state => {
        const [removed] = state.slides.splice(startIndex, 1)
        state.slides.splice(endIndex, 0, removed)
        
        // Renumber all slides
        state.slides.forEach((slide, index) => {
          slide.number = index + 1
        })
        
        state.isDirty = true
        state.metadata.updatedAt = new Date().toISOString()
        
        // Add to history
        get().pushToHistory()
      }),

      // Element actions
      addElement: (slideId, element) => set(state => {
        const slide = state.slides.find(s => s.id === slideId)
        if (slide) {
          slide.elements.push(element)
          slide.isDirty = true
          state.isDirty = true
          state.metadata.updatedAt = new Date().toISOString()
          
          // Add to history
          get().pushToHistory()
        }
      }),

      updateElement: (slideId, elementId, updates) => set(state => {
        const slide = state.slides.find(s => s.id === slideId)
        if (slide) {
          const element = slide.elements.find(e => e.id === elementId)
          if (element) {
            Object.assign(element, updates)
            slide.isDirty = true
            state.isDirty = true
            state.metadata.updatedAt = new Date().toISOString()
            
            // Add to history
            get().pushToHistory()
          }
        }
      }),

      deleteElement: (slideId, elementId) => set(state => {
        const slide = state.slides.find(s => s.id === slideId)
        if (slide) {
          slide.elements = slide.elements.filter(e => e.id !== elementId)
          slide.isDirty = true
          state.isDirty = true
          state.metadata.updatedAt = new Date().toISOString()
          
          // Add to history
          get().pushToHistory()
        }
      }),

      selectElements: (elementIds) => set(state => {
        state.selectedElements = elementIds
      }),

      // AI content preservation
      preserveAIContent: (slideId, content) => set(state => {
        const slide = state.slides.find(s => s.id === slideId)
        if (slide) {
          slide.aiGeneratedContent = {
            ...slide.aiGeneratedContent,
            ...content,
            generatedAt: new Date().toISOString()
          }
          slide.isDirty = true
          state.isDirty = true
        }
      }),

      getAIContent: (slideId) => {
        const slide = get().slides.find(s => s.id === slideId)
        return slide?.aiGeneratedContent || null
      },

      // Navigation
      setCurrentSlide: (index) => set(state => {
        if (index >= 0 && index < state.slides.length) {
          state.currentSlideIndex = index
        }
      }),

      nextSlide: () => set(state => {
        if (state.currentSlideIndex < state.slides.length - 1) {
          state.currentSlideIndex++
        }
      }),

      previousSlide: () => set(state => {
        if (state.currentSlideIndex > 0) {
          state.currentSlideIndex--
        }
      }),

      // Save state
      markDirty: () => set(state => {
        state.isDirty = true
      }),

      markClean: () => set(state => {
        state.isDirty = false
        state.slides.forEach(slide => {
          slide.isDirty = false
        })
      }),

      updateLastSaved: () => set(state => {
        state.lastSaved = new Date()
        state.version++
      }),

      // Database persistence
      saveToDB: async () => {
        const state = get()
        if (!state.presentationId) return false

        try {
          const { error } = await supabase
            .from('presentations')
            .update({
              title: state.title,
              slides_data: state.slides,
              metadata: {
                ...state.metadata,
                version: state.version,
                lastSaved: new Date().toISOString()
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', state.presentationId)

          if (error) {
            console.error('Failed to save to database:', error)
            return false
          }

          set(state => {
            state.isDirty = false
            state.lastSaved = new Date()
            state.slides.forEach(slide => {
              slide.isDirty = false
            })
          })

          return true
        } catch (error) {
          console.error('Save to DB error:', error)
          return false
        }
      },

      loadFromDB: async (presentationId) => {
        try {
          const { data, error } = await supabase
            .from('presentations')
            .select('*')
            .eq('id', presentationId)
            .single()

          if (error || !data) {
            console.error('Failed to load from database:', error)
            return false
          }

          set({
            presentationId,
            title: data.title,
            slides: data.slides_data || [],
            currentSlideIndex: 0,
            selectedElements: [],
            isDirty: false,
            lastSaved: data.updated_at ? new Date(data.updated_at) : null,
            version: data.metadata?.version || 1,
            metadata: {
              ...data.metadata,
              createdAt: data.created_at,
              updatedAt: data.updated_at
            }
          })

          return true
        } catch (error) {
          console.error('Load from DB error:', error)
          return false
        }
      },

      // State management
      reset: () => set(() => ({
        ...initialState,
        history: [initialState],
        historyIndex: 0,
        canUndo: false,
        canRedo: false
      })),

      // History management (internal)
      pushToHistory: () => set(state => {
        // Remove any history after current index
        state.history = state.history.slice(0, state.historyIndex + 1)
        
        // Create snapshot of current state
        const snapshot: PresentationState = {
          presentationId: state.presentationId,
          title: state.title,
          slides: JSON.parse(JSON.stringify(state.slides)), // Deep clone
          currentSlideIndex: state.currentSlideIndex,
          selectedElements: [...state.selectedElements],
          isDirty: state.isDirty,
          lastSaved: state.lastSaved,
          version: state.version,
          metadata: { ...state.metadata }
        }
        
        state.history.push(snapshot)
        state.historyIndex++
        
        // Limit history size
        if (state.history.length > 50) {
          state.history = state.history.slice(-50)
          state.historyIndex = state.history.length - 1
        }
        
        state.canUndo = state.historyIndex > 0
        state.canRedo = false
      }),

      undo: () => set(state => {
        if (state.historyIndex > 0) {
          state.historyIndex--
          const snapshot = state.history[state.historyIndex]
          Object.assign(state, snapshot)
          state.canUndo = state.historyIndex > 0
          state.canRedo = true
        }
      }),

      redo: () => set(state => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++
          const snapshot = state.history[state.historyIndex]
          Object.assign(state, snapshot)
          state.canUndo = true
          state.canRedo = state.historyIndex < state.history.length - 1
        }
      })
    })),
    {
      name: 'slide-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        presentationId: state.presentationId,
        title: state.title,
        slides: state.slides,
        currentSlideIndex: state.currentSlideIndex,
        metadata: state.metadata
      })
    }
  )
)