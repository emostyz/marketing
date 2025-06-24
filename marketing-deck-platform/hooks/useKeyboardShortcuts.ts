'use client'

import { useEffect, useCallback } from 'react'
import { useHistory } from '@/stores/history-store'
import { toast } from 'react-hot-toast'

interface KeyboardShortcutActions {
  // File operations
  save: () => void
  saveAs: () => void
  export: (format?: string) => void
  
  // Edit operations
  copy: () => void
  cut: () => void
  paste: () => void
  duplicate: () => void
  delete: () => void
  selectAll: () => void
  clearSelection: () => void
  
  // Element operations
  group: () => void
  ungroup: () => void
  lock: () => void
  unlock: () => void
  hide: () => void
  show: () => void
  
  // Arrangement
  bringToFront: () => void
  sendToBack: () => void
  bringForward: () => void
  sendBackward: () => void
  
  // Alignment
  alignLeft: () => void
  alignCenter: () => void
  alignRight: () => void
  alignTop: () => void
  alignMiddle: () => void
  alignBottom: () => void
  
  // Movement
  moveUp: (large?: boolean) => void
  moveDown: (large?: boolean) => void
  moveLeft: (large?: boolean) => void
  moveRight: (large?: boolean) => void
  
  // Zoom and view
  zoomIn: () => void
  zoomOut: () => void
  zoomToFit: () => void
  zoomActual: () => void
  toggleGrid: () => void
  toggleSnap: () => void
  
  // Tools
  selectTool: () => void
  textTool: () => void
  shapeTool: () => void
  panTool: () => void
  
  // Element creation
  addText: () => void
  addShape: () => void
  addImage: () => void
  addChart: () => void
}

interface UseKeyboardShortcutsProps {
  actions: Partial<KeyboardShortcutActions>
  disabled?: boolean
  selectedElements?: any[]
  enableDevShortcuts?: boolean
}

type KeyboardShortcut = {
  key: string
  modifiers: ('ctrl' | 'meta' | 'shift' | 'alt')[]
  action: () => void
  description: string
  condition?: () => boolean
}

export function useKeyboardShortcuts({
  actions,
  disabled = false,
  selectedElements = [],
  enableDevShortcuts = process.env.NODE_ENV === 'development'
}: UseKeyboardShortcutsProps) {
  const { undo, redo, canUndo, canRedo } = useHistory()
  
  const hasSelection = selectedElements.length > 0
  const hasMultipleSelection = selectedElements.length > 1
  const anyLocked = selectedElements.some(el => el.isLocked)

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // File operations
    {
      key: 's',
      modifiers: ['meta'],
      action: () => actions.save?.(),
      description: 'Save',
      condition: () => !!actions.save
    },
    {
      key: 's',
      modifiers: ['meta', 'shift'],
      action: () => actions.saveAs?.(),
      description: 'Save As',
      condition: () => !!actions.saveAs
    },
    {
      key: 'e',
      modifiers: ['meta'],
      action: () => actions.export?.(),
      description: 'Export',
      condition: () => !!actions.export
    },

    // Edit operations - Undo/Redo
    {
      key: 'z',
      modifiers: ['meta'],
      action: undo,
      description: 'Undo',
      condition: () => canUndo
    },
    {
      key: 'z',
      modifiers: ['meta', 'shift'],
      action: redo,
      description: 'Redo',
      condition: () => canRedo
    },
    {
      key: 'y',
      modifiers: ['meta'],
      action: redo,
      description: 'Redo',
      condition: () => canRedo
    },

    // Edit operations - Copy/Paste
    {
      key: 'c',
      modifiers: ['meta'],
      action: () => actions.copy?.(),
      description: 'Copy',
      condition: () => hasSelection && !!actions.copy
    },
    {
      key: 'x',
      modifiers: ['meta'],
      action: () => actions.cut?.(),
      description: 'Cut',
      condition: () => hasSelection && !anyLocked && !!actions.cut
    },
    {
      key: 'v',
      modifiers: ['meta'],
      action: () => actions.paste?.(),
      description: 'Paste',
      condition: () => !!actions.paste
    },
    {
      key: 'd',
      modifiers: ['meta'],
      action: () => actions.duplicate?.(),
      description: 'Duplicate',
      condition: () => hasSelection && !!actions.duplicate
    },

    // Selection
    {
      key: 'a',
      modifiers: ['meta'],
      action: () => actions.selectAll?.(),
      description: 'Select All',
      condition: () => !!actions.selectAll
    },
    {
      key: 'Escape',
      modifiers: [],
      action: () => actions.clearSelection?.(),
      description: 'Clear Selection',
      condition: () => hasSelection && !!actions.clearSelection
    },

    // Delete
    {
      key: 'Delete',
      modifiers: [],
      action: () => actions.delete?.(),
      description: 'Delete',
      condition: () => hasSelection && !anyLocked && !!actions.delete
    },
    {
      key: 'Backspace',
      modifiers: [],
      action: () => actions.delete?.(),
      description: 'Delete',
      condition: () => hasSelection && !anyLocked && !!actions.delete
    },

    // Grouping
    {
      key: 'g',
      modifiers: ['meta'],
      action: () => actions.group?.(),
      description: 'Group',
      condition: () => hasMultipleSelection && !!actions.group
    },
    {
      key: 'g',
      modifiers: ['meta', 'shift'],
      action: () => actions.ungroup?.(),
      description: 'Ungroup',
      condition: () => hasSelection && !!actions.ungroup
    },

    // Lock/Hide
    {
      key: 'l',
      modifiers: ['meta'],
      action: () => {
        const allLocked = selectedElements.every(el => el.isLocked)
        if (allLocked) {
          actions.unlock?.()
        } else {
          actions.lock?.()
        }
      },
      description: 'Toggle Lock',
      condition: () => hasSelection && (!!actions.lock || !!actions.unlock)
    },
    {
      key: 'h',
      modifiers: ['meta'],
      action: () => {
        const allHidden = selectedElements.every(el => el.isHidden)
        if (allHidden) {
          actions.show?.()
        } else {
          actions.hide?.()
        }
      },
      description: 'Toggle Visibility',
      condition: () => hasSelection && (!!actions.hide || !!actions.show)
    },

    // Arrangement
    {
      key: ']',
      modifiers: ['meta'],
      action: () => actions.bringForward?.(),
      description: 'Bring Forward',
      condition: () => hasSelection && !!actions.bringForward
    },
    {
      key: '[',
      modifiers: ['meta'],
      action: () => actions.sendBackward?.(),
      description: 'Send Backward',
      condition: () => hasSelection && !!actions.sendBackward
    },
    {
      key: ']',
      modifiers: ['meta', 'shift'],
      action: () => actions.bringToFront?.(),
      description: 'Bring to Front',
      condition: () => hasSelection && !!actions.bringToFront
    },
    {
      key: '[',
      modifiers: ['meta', 'shift'],
      action: () => actions.sendToBack?.(),
      description: 'Send to Back',
      condition: () => hasSelection && !!actions.sendToBack
    },

    // Movement (Arrow keys)
    {
      key: 'ArrowUp',
      modifiers: [],
      action: () => actions.moveUp?.(false),
      description: 'Move Up',
      condition: () => hasSelection && !anyLocked && !!actions.moveUp
    },
    {
      key: 'ArrowDown',
      modifiers: [],
      action: () => actions.moveDown?.(false),
      description: 'Move Down',
      condition: () => hasSelection && !anyLocked && !!actions.moveDown
    },
    {
      key: 'ArrowLeft',
      modifiers: [],
      action: () => actions.moveLeft?.(false),
      description: 'Move Left',
      condition: () => hasSelection && !anyLocked && !!actions.moveLeft
    },
    {
      key: 'ArrowRight',
      modifiers: [],
      action: () => actions.moveRight?.(false),
      description: 'Move Right',
      condition: () => hasSelection && !anyLocked && !!actions.moveRight
    },

    // Large movement (Shift + Arrow keys)
    {
      key: 'ArrowUp',
      modifiers: ['shift'],
      action: () => actions.moveUp?.(true),
      description: 'Move Up (Large)',
      condition: () => hasSelection && !anyLocked && !!actions.moveUp
    },
    {
      key: 'ArrowDown',
      modifiers: ['shift'],
      action: () => actions.moveDown?.(true),
      description: 'Move Down (Large)',
      condition: () => hasSelection && !anyLocked && !!actions.moveDown
    },
    {
      key: 'ArrowLeft',
      modifiers: ['shift'],
      action: () => actions.moveLeft?.(true),
      description: 'Move Left (Large)',
      condition: () => hasSelection && !anyLocked && !!actions.moveLeft
    },
    {
      key: 'ArrowRight',
      modifiers: ['shift'],
      action: () => actions.moveRight?.(true),
      description: 'Move Right (Large)',
      condition: () => hasSelection && !anyLocked && !!actions.moveRight
    },

    // Zoom
    {
      key: '=',
      modifiers: ['meta'],
      action: () => actions.zoomIn?.(),
      description: 'Zoom In',
      condition: () => !!actions.zoomIn
    },
    {
      key: '-',
      modifiers: ['meta'],
      action: () => actions.zoomOut?.(),
      description: 'Zoom Out',
      condition: () => !!actions.zoomOut
    },
    {
      key: '0',
      modifiers: ['meta'],
      action: () => actions.zoomActual?.(),
      description: 'Zoom to 100%',
      condition: () => !!actions.zoomActual
    },
    {
      key: '1',
      modifiers: ['meta'],
      action: () => actions.zoomToFit?.(),
      description: 'Zoom to Fit',
      condition: () => !!actions.zoomToFit
    },

    // Tools (single key shortcuts)
    {
      key: 'v',
      modifiers: [],
      action: () => actions.selectTool?.(),
      description: 'Select Tool',
      condition: () => !!actions.selectTool
    },
    {
      key: 't',
      modifiers: [],
      action: () => actions.textTool?.(),
      description: 'Text Tool',
      condition: () => !!actions.textTool
    },
    {
      key: 'r',
      modifiers: [],
      action: () => actions.shapeTool?.(),
      description: 'Shape Tool',
      condition: () => !!actions.shapeTool
    },
    {
      key: ' ',
      modifiers: [],
      action: () => actions.panTool?.(),
      description: 'Pan Tool (Hold)',
      condition: () => !!actions.panTool
    },

    // Quick element creation
    {
      key: 't',
      modifiers: ['meta'],
      action: () => actions.addText?.(),
      description: 'Add Text',
      condition: () => !!actions.addText
    },
    {
      key: 'r',
      modifiers: ['meta'],
      action: () => actions.addShape?.(),
      description: 'Add Shape',
      condition: () => !!actions.addShape
    },
    {
      key: 'i',
      modifiers: ['meta'],
      action: () => actions.addImage?.(),
      description: 'Add Image',
      condition: () => !!actions.addImage
    },

    // Grid and snap
    {
      key: "'",
      modifiers: ['meta'],
      action: () => actions.toggleGrid?.(),
      description: 'Toggle Grid',
      condition: () => !!actions.toggleGrid
    },
    {
      key: ';',
      modifiers: ['meta'],
      action: () => actions.toggleSnap?.(),
      description: 'Toggle Snap',
      condition: () => !!actions.toggleSnap
    }
  ]

  // Add development shortcuts
  if (enableDevShortcuts) {
    shortcuts.push(
      {
        key: 'k',
        modifiers: ['meta', 'shift'],
        action: () => {
          console.log('🎹 Available Shortcuts:')
          shortcuts
            .filter(s => !s.condition || s.condition())
            .forEach(s => {
              const modifierStr = s.modifiers.map(m => m === 'meta' ? '⌘' : m).join('')
              console.log(`${modifierStr}${s.key}: ${s.description}`)
            })
          toast.success('Shortcuts logged to console')
        },
        description: 'Show All Shortcuts',
        condition: () => true
      }
    )
  }

  // Check if key event matches shortcut
  const matchesShortcut = useCallback((event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    if (event.key !== shortcut.key) return false
    
    const requiredModifiers = new Set(shortcut.modifiers)
    const activeModifiers = new Set()
    
    if (event.ctrlKey || event.metaKey) activeModifiers.add('meta')
    if (event.shiftKey) activeModifiers.add('shift')
    if (event.altKey) activeModifiers.add('alt')
    
    // Check if all required modifiers are present and no extra ones
    return (
      requiredModifiers.size === activeModifiers.size &&
      [...requiredModifiers].every(mod => activeModifiers.has(mod))
    )
  }, [])

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return
    
    // Skip if typing in inputs or contentEditable elements
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      return
    }
    
    // Find matching shortcut
    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        // Check condition if provided
        if (shortcut.condition && !shortcut.condition()) {
          continue
        }
        
        event.preventDefault()
        event.stopPropagation()
        
        try {
          shortcut.action()
        } catch (error) {
          console.error('Error executing shortcut:', error)
          toast.error('Shortcut execution failed')
        }
        
        break
      }
    }
  }, [disabled, shortcuts, matchesShortcut])

  // Handle space key for pan tool (special case)
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (disabled) return
    
    if (event.key === ' ' && actions.selectTool) {
      // Return to select tool when space is released
      actions.selectTool()
    }
  }, [disabled, actions.selectTool])

  // Set up event listeners
  useEffect(() => {
    if (disabled) return
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [disabled, handleKeyDown, handleKeyUp])

  // Get available shortcuts for UI display
  const getAvailableShortcuts = useCallback(() => {
    return shortcuts
      .filter(shortcut => !shortcut.condition || shortcut.condition())
      .map(shortcut => ({
        key: shortcut.key,
        modifiers: shortcut.modifiers,
        description: shortcut.description,
        keyString: [
          ...shortcut.modifiers.map(mod => {
            switch (mod) {
              case 'meta': return '⌘'
              case 'ctrl': return 'Ctrl'
              case 'shift': return '⇧'
              case 'alt': return '⌥'
              default: return mod
            }
          }),
          shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key
        ].join('')
      }))
      .sort((a, b) => a.description.localeCompare(b.description))
  }, [shortcuts])

  return {
    shortcuts: getAvailableShortcuts(),
    
    // Helper functions
    showShortcutHelp: () => {
      const available = getAvailableShortcuts()
      console.group('🎹 Available Keyboard Shortcuts')
      available.forEach(shortcut => {
        console.log(`${shortcut.keyString}: ${shortcut.description}`)
      })
      console.groupEnd()
      toast.success(`${available.length} shortcuts available (see console)`)
    },
    
    isShortcutAvailable: (key: string, modifiers: string[] = []) => {
      return shortcuts.some(shortcut =>
        shortcut.key === key &&
        shortcut.modifiers.length === modifiers.length &&
        shortcut.modifiers.every(mod => modifiers.includes(mod)) &&
        (!shortcut.condition || shortcut.condition())
      )
    }
  }
}

export default useKeyboardShortcuts