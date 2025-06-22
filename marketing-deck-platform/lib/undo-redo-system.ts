interface UndoRedoState {
  slides: any[]
  currentSlideIndex: number
  selectedElements: string[]
}

interface UndoRedoAction {
  type: string
  timestamp: number
  previousState: UndoRedoState
  newState: UndoRedoState
  description: string
}

export class UndoRedoSystem {
  private undoStack: UndoRedoAction[] = []
  private redoStack: UndoRedoAction[] = []
  private maxStackSize = 50
  private currentState: UndoRedoState | null = null

  constructor() {
    this.undoStack = []
    this.redoStack = []
  }

  // Save current state before making changes
  saveState(
    slides: any[], 
    currentSlideIndex: number, 
    selectedElements: string[], 
    actionType: string,
    description: string
  ) {
    if (!this.currentState) {
      this.currentState = {
        slides: JSON.parse(JSON.stringify(slides)),
        currentSlideIndex,
        selectedElements: [...selectedElements]
      }
      return
    }

    const action: UndoRedoAction = {
      type: actionType,
      timestamp: Date.now(),
      previousState: {
        slides: JSON.parse(JSON.stringify(this.currentState.slides)),
        currentSlideIndex: this.currentState.currentSlideIndex,
        selectedElements: [...this.currentState.selectedElements]
      },
      newState: {
        slides: JSON.parse(JSON.stringify(slides)),
        currentSlideIndex,
        selectedElements: [...selectedElements]
      },
      description
    }

    // Add to undo stack
    this.undoStack.push(action)

    // Limit stack size
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift()
    }

    // Clear redo stack when new action is performed
    this.redoStack = []

    // Update current state
    this.currentState = {
      slides: JSON.parse(JSON.stringify(slides)),
      currentSlideIndex,
      selectedElements: [...selectedElements]
    }
  }

  // Undo last action
  undo(): UndoRedoState | null {
    const action = this.undoStack.pop()
    if (!action) return null

    // Add to redo stack
    this.redoStack.push(action)

    // Update current state to previous state
    this.currentState = {
      slides: JSON.parse(JSON.stringify(action.previousState.slides)),
      currentSlideIndex: action.previousState.currentSlideIndex,
      selectedElements: [...action.previousState.selectedElements]
    }

    return this.currentState
  }

  // Redo last undone action
  redo(): UndoRedoState | null {
    const action = this.redoStack.pop()
    if (!action) return null

    // Add back to undo stack
    this.undoStack.push(action)

    // Update current state to new state
    this.currentState = {
      slides: JSON.parse(JSON.stringify(action.newState.slides)),
      currentSlideIndex: action.newState.currentSlideIndex,
      selectedElements: [...action.newState.selectedElements]
    }

    return this.currentState
  }

  // Check if undo is available
  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  // Check if redo is available
  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  // Get last action description for UI
  getLastActionDescription(): string {
    const lastAction = this.undoStack[this.undoStack.length - 1]
    return lastAction ? lastAction.description : ''
  }

  // Get next redo action description for UI
  getNextRedoDescription(): string {
    const nextAction = this.redoStack[this.redoStack.length - 1]
    return nextAction ? nextAction.description : ''
  }

  // Clear all history
  clear() {
    this.undoStack = []
    this.redoStack = []
    this.currentState = null
  }

  // Get stack sizes for debugging
  getStackSizes() {
    return {
      undoStackSize: this.undoStack.length,
      redoStackSize: this.redoStack.length
    }
  }

  // Get action history for debugging
  getActionHistory() {
    return {
      undoActions: this.undoStack.map(action => ({
        type: action.type,
        description: action.description,
        timestamp: new Date(action.timestamp).toISOString()
      })),
      redoActions: this.redoStack.map(action => ({
        type: action.type,
        description: action.description,
        timestamp: new Date(action.timestamp).toISOString()
      }))
    }
  }
}

// Singleton instance
export const undoRedoSystem = new UndoRedoSystem()