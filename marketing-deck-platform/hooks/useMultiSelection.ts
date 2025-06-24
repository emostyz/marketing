'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

interface Point {
  x: number
  y: number
}

interface SelectionBoxState {
  isSelecting: boolean
  startPoint: Point | null
  currentPoint: Point | null
  box: Rectangle | null
}

interface UseMultiSelectionProps {
  elements: any[]
  containerRef: React.RefObject<HTMLElement>
  onSelectionChange: (selectedIds: string[]) => void
  disabled?: boolean
  multiSelectKey?: 'shift' | 'ctrl' | 'meta'
}

export function useMultiSelection({
  elements,
  containerRef,
  onSelectionChange,
  disabled = false,
  multiSelectKey = 'shift'
}: UseMultiSelectionProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectionBox, setSelectionBox] = useState<SelectionBoxState>({
    isSelecting: false,
    startPoint: null,
    currentPoint: null,
    box: null
  })
  
  const isMouseDownRef = useRef(false)
  const startSelectionRef = useRef<Point | null>(null)

  // Update parent when selection changes
  useEffect(() => {
    onSelectionChange(Array.from(selectedIds))
  }, [selectedIds, onSelectionChange])

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((clientX: number, clientY: number): Point => {
    if (!containerRef.current) return { x: clientX, y: clientY }
    
    const rect = containerRef.current.getBoundingClientRect()
    const scrollLeft = containerRef.current.scrollLeft
    const scrollTop = containerRef.current.scrollTop
    
    return {
      x: clientX - rect.left + scrollLeft,
      y: clientY - rect.top + scrollTop
    }
  }, [containerRef])

  // Check if a point is inside a rectangle
  const pointInRect = useCallback((point: Point, rect: Rectangle): boolean => {
    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height
  }, [])

  // Check if two rectangles intersect
  const rectsIntersect = useCallback((rect1: Rectangle, rect2: Rectangle): boolean => {
    return !(rect1.x + rect1.width < rect2.x ||
             rect2.x + rect2.width < rect1.x ||
             rect1.y + rect1.height < rect2.y ||
             rect2.y + rect2.height < rect1.y)
  }, [])

  // Get element rectangle
  const getElementRect = useCallback((element: any): Rectangle => {
    return {
      x: element.position.x,
      y: element.position.y,
      width: element.size.width,
      height: element.size.height
    }
  }, [])

  // Find elements within selection box
  const findElementsInBox = useCallback((box: Rectangle): string[] => {
    return elements
      .filter(element => {
        const elementRect = getElementRect(element)
        return rectsIntersect(box, elementRect)
      })
      .map(element => element.id)
  }, [elements, getElementRect, rectsIntersect])

  // Handle mouse down on canvas
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (disabled || e.button !== 0) return // Only left mouse button
    
    const target = e.target as HTMLElement
    
    // Check if clicking on an element or the canvas
    const elementId = target.closest('[data-element-id]')?.getAttribute('data-element-id')
    const isCanvasClick = !elementId && (
      target === containerRef.current ||
      target.closest('.slide-canvas') === containerRef.current
    )
    
    if (elementId) {
      // Clicking on an element
      handleElementClick(elementId, e)
    } else if (isCanvasClick) {
      // Clicking on canvas - start selection box
      const canvasPoint = screenToCanvas(e.clientX, e.clientY)
      
      // Clear selection if not holding multi-select key
      if (!e[`${multiSelectKey}Key`] && !e.ctrlKey && !e.metaKey) {
        setSelectedIds(new Set())
      }
      
      isMouseDownRef.current = true
      startSelectionRef.current = canvasPoint
      
      setSelectionBox({
        isSelecting: true,
        startPoint: canvasPoint,
        currentPoint: canvasPoint,
        box: { x: canvasPoint.x, y: canvasPoint.y, width: 0, height: 0 }
      })
    }
  }, [disabled, containerRef, multiSelectKey, screenToCanvas])

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseDownRef.current || !startSelectionRef.current || disabled) return
    
    const currentPoint = screenToCanvas(e.clientX, e.clientY)
    const startPoint = startSelectionRef.current
    
    // Calculate selection box
    const box: Rectangle = {
      x: Math.min(startPoint.x, currentPoint.x),
      y: Math.min(startPoint.y, currentPoint.y),
      width: Math.abs(currentPoint.x - startPoint.x),
      height: Math.abs(currentPoint.y - startPoint.y)
    }
    
    setSelectionBox(prev => ({
      ...prev,
      currentPoint,
      box
    }))
    
    // Update selection in real-time
    if (box.width > 5 || box.height > 5) { // Minimum box size to avoid accidental selections
      const elementsInBox = findElementsInBox(box)
      
      // Merge with existing selection if holding multi-select key
      setSelectedIds(prev => {
        if (e[`${multiSelectKey}Key`] || e.ctrlKey || e.metaKey) {
          const newSelection = new Set(prev)
          elementsInBox.forEach(id => newSelection.add(id))
          return newSelection
        } else {
          return new Set(elementsInBox)
        }
      })
    }
  }, [disabled, screenToCanvas, findElementsInBox, multiSelectKey])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (!isMouseDownRef.current) return
    
    isMouseDownRef.current = false
    startSelectionRef.current = null
    
    setSelectionBox({
      isSelecting: false,
      startPoint: null,
      currentPoint: null,
      box: null
    })
  }, [])

  // Handle element click
  const handleElementClick = useCallback((elementId: string, e: MouseEvent) => {
    if (disabled) return
    
    e.stopPropagation()
    
    const isMultiSelect = e[`${multiSelectKey}Key`] || e.ctrlKey || e.metaKey
    
    setSelectedIds(prev => {
      const newSelection = new Set(prev)
      
      if (isMultiSelect) {
        // Toggle selection
        if (newSelection.has(elementId)) {
          newSelection.delete(elementId)
        } else {
          newSelection.add(elementId)
        }
      } else {
        // Single selection
        if (newSelection.has(elementId) && newSelection.size === 1) {
          // Already selected and is only selection - keep it
          return newSelection
        } else {
          // Select only this element
          newSelection.clear()
          newSelection.add(elementId)
        }
      }
      
      return newSelection
    })
  }, [disabled, multiSelectKey])

  // Select all elements
  const selectAll = useCallback(() => {
    if (disabled) return
    
    const allIds = elements.map(element => element.id)
    setSelectedIds(new Set(allIds))
  }, [disabled, elements])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // Select specific elements
  const selectElements = useCallback((elementIds: string[]) => {
    setSelectedIds(new Set(elementIds))
  }, [])

  // Add elements to selection
  const addToSelection = useCallback((elementIds: string[]) => {
    setSelectedIds(prev => {
      const newSelection = new Set(prev)
      elementIds.forEach(id => newSelection.add(id))
      return newSelection
    })
  }, [])

  // Remove elements from selection
  const removeFromSelection = useCallback((elementIds: string[]) => {
    setSelectedIds(prev => {
      const newSelection = new Set(prev)
      elementIds.forEach(id => newSelection.delete(id))
      return newSelection
    })
  }, [])

  // Toggle element selection
  const toggleSelection = useCallback((elementId: string) => {
    setSelectedIds(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(elementId)) {
        newSelection.delete(elementId)
      } else {
        newSelection.add(elementId)
      }
      return newSelection
    })
  }, [])

  // Get selected elements
  const getSelectedElements = useCallback(() => {
    return elements.filter(element => selectedIds.has(element.id))
  }, [elements, selectedIds])

  // Check if element is selected
  const isSelected = useCallback((elementId: string) => {
    return selectedIds.has(elementId)
  }, [selectedIds])

  // Set up event listeners
  useEffect(() => {
    if (disabled) return
    
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [disabled, handleMouseDown, handleMouseMove, handleMouseUp])

  // Keyboard shortcuts
  useEffect(() => {
    if (disabled) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        selectAll()
      } else if (e.key === 'Escape') {
        clearSelection()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, selectAll, clearSelection])

  return {
    // State
    selectedIds: Array.from(selectedIds),
    selectedElements: getSelectedElements(),
    selectionCount: selectedIds.size,
    hasSelection: selectedIds.size > 0,
    hasMultipleSelection: selectedIds.size > 1,
    selectionBox: selectionBox.box,
    isSelecting: selectionBox.isSelecting,
    
    // Actions
    selectAll,
    clearSelection,
    selectElements,
    addToSelection,
    removeFromSelection,
    toggleSelection,
    handleElementClick,
    isSelected,
    
    // Utilities
    getSelectedElements,
    getBoundingBox: () => {
      const selected = getSelectedElements()
      if (selected.length === 0) return null
      
      const rects = selected.map(getElementRect)
      return {
        x: Math.min(...rects.map(r => r.x)),
        y: Math.min(...rects.map(r => r.y)),
        width: Math.max(...rects.map(r => r.x + r.width)) - Math.min(...rects.map(r => r.x)),
        height: Math.max(...rects.map(r => r.y + r.height)) - Math.min(...rects.map(r => r.y))
      }
    }
  }
}

export default useMultiSelection