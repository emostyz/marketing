'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Command interface for undo/redo operations
interface Command {
  id: string
  type: 'create' | 'update' | 'delete' | 'move' | 'resize' | 'rotate' | 'style' | 'reorder' | 'group' | 'ungroup'
  timestamp: number
  description: string
  target: {
    slideId: string
    elementId?: string
    elementIds?: string[]
  }
  data: {
    before: any
    after: any
  }
  execute: () => void
  undo: () => void
  redo: () => void
}

// History state interface
interface HistoryState {
  past: Command[]
  future: Command[]
  maxHistorySize: number
  isUndoing: boolean
  isRedoing: boolean
  
  // Actions
  executeCommand: (command: Omit<Command, 'execute' | 'undo' | 'redo'>) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  clear: () => void
  
  // Batch operations
  startBatch: () => void
  endBatch: (description?: string) => void
  isBatching: boolean
  batchCommands: Command[]
  
  // History navigation
  getHistory: () => { past: Command[]; future: Command[] }
  jumpToCommand: (commandId: string) => void
}

// Command factory functions
export const createCommand = {
  createElement: (slideId: string, element: any): Omit<Command, 'execute' | 'undo' | 'redo'> => ({
    id: `create_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'create',
    timestamp: Date.now(),
    description: `Create ${element.type} element`,
    target: { slideId, elementId: element.id },
    data: { before: null, after: element }
  }),

  updateElement: (slideId: string, elementId: string, before: any, after: any): Omit<Command, 'execute' | 'undo' | 'redo'> => ({
    id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'update',
    timestamp: Date.now(),
    description: `Update element`,
    target: { slideId, elementId },
    data: { before, after }
  }),

  deleteElement: (slideId: string, element: any): Omit<Command, 'execute' | 'undo' | 'redo'> => ({
    id: `delete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'delete',
    timestamp: Date.now(),
    description: `Delete ${element.type} element`,
    target: { slideId, elementId: element.id },
    data: { before: element, after: null }
  }),

  moveElement: (slideId: string, elementId: string, fromPosition: any, toPosition: any): Omit<Command, 'execute' | 'undo' | 'redo'> => ({
    id: `move_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'move',
    timestamp: Date.now(),
    description: `Move element`,
    target: { slideId, elementId },
    data: { before: { position: fromPosition }, after: { position: toPosition } }
  }),

  resizeElement: (slideId: string, elementId: string, fromSize: any, toSize: any): Omit<Command, 'execute' | 'undo' | 'redo'> => ({
    id: `resize_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'resize',
    timestamp: Date.now(),
    description: `Resize element`,
    target: { slideId, elementId },
    data: { before: { size: fromSize }, after: { size: toSize } }
  }),

  groupElements: (slideId: string, elementIds: string[], groupData: any): Omit<Command, 'execute' | 'undo' | 'redo'> => ({
    id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'group',
    timestamp: Date.now(),
    description: `Group ${elementIds.length} elements`,
    target: { slideId, elementIds },
    data: { before: { elementIds, grouped: false }, after: { groupData, grouped: true } }
  })
}

// Global references to store functions (set by the editor)
let updateSlideElement: ((slideId: string, elementId: string, updates: any) => void) | null = null
let deleteSlideElement: ((slideId: string, elementId: string) => void) | null = null
let addSlideElement: ((slideId: string, element: any) => void) | null = null
let updateSlide: ((slideId: string, updates: any) => void) | null = null

export const setStoreReferences = (refs: {
  updateElement: (slideId: string, elementId: string, updates: any) => void
  deleteElement: (slideId: string, elementId: string) => void
  addElement: (slideId: string, element: any) => void
  updateSlide: (slideId: string, updates: any) => void
}) => {
  updateSlideElement = refs.updateElement
  deleteSlideElement = refs.deleteElement
  addSlideElement = refs.addElement
  updateSlide = refs.updateSlide
}

export const useHistoryStore = create<HistoryState>()(
  devtools(
    (set, get) => ({
      past: [],
      future: [],
      maxHistorySize: 100,
      isUndoing: false,
      isRedoing: false,
      isBatching: false,
      batchCommands: [],

      executeCommand: (commandData) => {
        const { past, future, maxHistorySize, isBatching, batchCommands } = get()

        // Create full command with execute/undo/redo functions
        const command: Command = {
          ...commandData,
          execute: () => executeCommandFunction(commandData),
          undo: () => undoCommandFunction(commandData),
          redo: () => redoCommandFunction(commandData)
        }

        // Execute the command
        command.execute()

        if (isBatching) {
          // Add to batch instead of history
          set({ batchCommands: [...batchCommands, command] })
        } else {
          // Add to history
          const newPast = [...past.slice(-maxHistorySize + 1), command]
          set({
            past: newPast,
            future: [] // Clear future when new command is executed
          })
        }
      },

      undo: () => {
        const { past, future, isUndoing } = get()
        if (past.length === 0 || isUndoing) return

        const command = past[past.length - 1]
        
        set({ isUndoing: true })
        
        try {
          command.undo()
          
          set({
            past: past.slice(0, -1),
            future: [command, ...future],
            isUndoing: false
          })
        } catch (error) {
          console.error('Error during undo:', error)
          set({ isUndoing: false })
        }
      },

      redo: () => {
        const { past, future, isRedoing } = get()
        if (future.length === 0 || isRedoing) return

        const command = future[0]
        
        set({ isRedoing: true })
        
        try {
          command.redo()
          
          set({
            past: [...past, command],
            future: future.slice(1),
            isRedoing: false
          })
        } catch (error) {
          console.error('Error during redo:', error)
          set({ isRedoing: false })
        }
      },

      canUndo: () => {
        const { past, isUndoing } = get()
        return past.length > 0 && !isUndoing
      },

      canRedo: () => {
        const { future, isRedoing } = get()
        return future.length > 0 && !isRedoing
      },

      clear: () => {
        set({
          past: [],
          future: [],
          isUndoing: false,
          isRedoing: false,
          isBatching: false,
          batchCommands: []
        })
      },

      startBatch: () => {
        set({ isBatching: true, batchCommands: [] })
      },

      endBatch: (description = 'Batch operation') => {
        const { batchCommands, past, maxHistorySize } = get()
        
        if (batchCommands.length === 0) {
          set({ isBatching: false })
          return
        }

        // Create a composite command for the batch
        const batchCommand: Command = {
          id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'update',
          timestamp: Date.now(),
          description,
          target: { slideId: '', elementIds: [] },
          data: { before: null, after: null },
          execute: () => {
            batchCommands.forEach(cmd => cmd.execute())
          },
          undo: () => {
            // Undo in reverse order
            [...batchCommands].reverse().forEach(cmd => cmd.undo())
          },
          redo: () => {
            batchCommands.forEach(cmd => cmd.redo())
          }
        }

        const newPast = [...past.slice(-maxHistorySize + 1), batchCommand]
        
        set({
          past: newPast,
          future: [],
          isBatching: false,
          batchCommands: []
        })
      },

      getHistory: () => {
        const { past, future } = get()
        return { past: [...past], future: [...future] }
      },

      jumpToCommand: (commandId: string) => {
        const { past, future } = get()
        
        // Find command in past or future
        const pastIndex = past.findIndex(cmd => cmd.id === commandId)
        const futureIndex = future.findIndex(cmd => cmd.id === commandId)
        
        if (pastIndex !== -1) {
          // Command is in past, redo up to this point
          const commandsToRedo = past.slice(pastIndex + 1)
          commandsToRedo.reverse().forEach(cmd => cmd.undo())
          
          set({
            past: past.slice(0, pastIndex + 1),
            future: [...commandsToRedo.reverse(), ...future]
          })
        } else if (futureIndex !== -1) {
          // Command is in future, undo up to this point
          const commandsToUndo = future.slice(0, futureIndex + 1)
          commandsToUndo.forEach(cmd => cmd.redo())
          
          set({
            past: [...past, ...commandsToUndo],
            future: future.slice(futureIndex + 1)
          })
        }
      }
    }),
    {
      name: 'history-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// Command execution functions
function executeCommandFunction(command: Omit<Command, 'execute' | 'undo' | 'redo'>) {
  const { type, target, data } = command

  switch (type) {
    case 'create':
      if (addSlideElement) {
        addSlideElement(target.slideId, data.after)
      }
      break

    case 'update':
      if (updateSlideElement && target.elementId) {
        updateSlideElement(target.slideId, target.elementId, data.after)
      }
      break

    case 'delete':
      if (deleteSlideElement && target.elementId) {
        deleteSlideElement(target.slideId, target.elementId)
      }
      break

    case 'move':
    case 'resize':
    case 'rotate':
      if (updateSlideElement && target.elementId) {
        updateSlideElement(target.slideId, target.elementId, data.after)
      }
      break

    default:
      console.warn('Unknown command type:', type)
  }
}

function undoCommandFunction(command: Omit<Command, 'execute' | 'undo' | 'redo'>) {
  const { type, target, data } = command

  switch (type) {
    case 'create':
      if (deleteSlideElement && target.elementId) {
        deleteSlideElement(target.slideId, target.elementId)
      }
      break

    case 'update':
    case 'move':
    case 'resize':
    case 'rotate':
      if (updateSlideElement && target.elementId) {
        updateSlideElement(target.slideId, target.elementId, data.before)
      }
      break

    case 'delete':
      if (addSlideElement) {
        addSlideElement(target.slideId, data.before)
      }
      break

    default:
      console.warn('Unknown command type for undo:', type)
  }
}

function redoCommandFunction(command: Omit<Command, 'execute' | 'undo' | 'redo'>) {
  // Redo is the same as execute
  executeCommandFunction(command)
}

// Keyboard shortcut handler
export const setupKeyboardShortcuts = () => {
  const handleKeydown = (e: KeyboardEvent) => {
    const { undo, redo, canUndo, canRedo } = useHistoryStore.getState()

    // Prevent shortcuts when typing in inputs
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      if (canUndo()) {
        undo()
      }
    } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault()
      if (canRedo()) {
        redo()
      }
    }
  }

  window.addEventListener('keydown', handleKeydown)
  return () => window.removeEventListener('keydown', handleKeydown)
}

// Hook for easier usage in components
export const useHistory = () => {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    executeCommand,
    startBatch,
    endBatch,
    getHistory,
    clear
  } = useHistoryStore()

  return {
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    executeCommand,
    startBatch,
    endBatch,
    getHistory,
    clear,
    
    // Helper functions for common operations
    recordElementUpdate: (slideId: string, elementId: string, before: any, after: any) => {
      executeCommand(createCommand.updateElement(slideId, elementId, before, after))
    },
    
    recordElementCreate: (slideId: string, element: any) => {
      executeCommand(createCommand.createElement(slideId, element))
    },
    
    recordElementDelete: (slideId: string, element: any) => {
      executeCommand(createCommand.deleteElement(slideId, element))
    },
    
    recordElementMove: (slideId: string, elementId: string, fromPos: any, toPos: any) => {
      executeCommand(createCommand.moveElement(slideId, elementId, fromPos, toPos))
    }
  }
}

export default useHistoryStore