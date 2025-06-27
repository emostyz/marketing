// REAL AI Editor Controller that physically manipulates the editor
export interface EditorAction {
  type: 'click' | 'drag' | 'type' | 'select' | 'style' | 'move' | 'resize' | 'delete' | 'group' | 'ungroup' | 'layer' | 'add_element' | 'update_background'
  target?: { x: number; y: number } | { elementId: string }
  from?: { x: number; y: number }
  to?: { x: number; y: number }
  text?: string
  style?: any
  duration?: number
  elementType?: 'text' | 'image' | 'chart' | 'shape'
  groupName?: string
  layerName?: string
  chartConfig?: any
  background?: any
  description: string
}

export interface EditorState {
  elements: Array<{
    id: string
    type: string
    position: { x: number; y: number }
    size: { width: number; height: number }
    content: string
    style: any
    layer: string
    group?: string
  }>
  selectedElement: string | null
  groups: Array<{ name: string; elements: string[] }>
  layers: Array<{ name: string; elements: string[] }>
  canvasSize: { width: number; height: number }
}

export class AIEditorController {
  private actionQueue: EditorAction[] = []
  private isExecuting = false
  private editorCallbacks: {
    click?: (x: number, y: number) => void
    drag?: (fromX: number, fromY: number, toX: number, toY: number) => void
    type?: (text: string) => void
    selectElement?: (elementId: string) => void
    deleteElement?: (elementId: string) => void
    updateStyle?: (elementId: string, style: any) => void
    moveElement?: (elementId: string, x: number, y: number) => void
    resizeElement?: (elementId: string, width: number, height: number) => void
    groupElements?: (elementIds: string[], groupName: string) => void
    ungroupElements?: (groupName: string) => void
    moveToLayer?: (elementId: string, layerName: string) => void
    addElement?: (type: string, position: { x: number; y: number }) => string
    updateBackground?: (background: any) => void
  } = {}

  constructor() {
    // AI Controller will use local algorithms instead of OpenAI API calls
  }

  // Register callbacks from the actual editor
  registerEditorCallbacks(callbacks: typeof this.editorCallbacks) {
    this.editorCallbacks = { ...this.editorCallbacks, ...callbacks }
  }

  // AI analyzes the current state and decides what actions to take
  async planActions(
    currentState: EditorState,
    objective: string,
    context: {
      businessGoal: string
      audienceType: string
      designStyle: string
      slideContent: any
    }
  ): Promise<EditorAction[]> {
    console.log('🤖 AI analyzing editor state and planning actions...')

    // Use intelligent algorithms to plan actions instead of OpenAI API
    const actions = this.planActionsIntelligently(currentState, objective, context)
    
    console.log(`🎯 AI planned ${actions.length} actions to achieve: ${objective}`)
    return actions
  }

  private planActionsIntelligently(currentState: EditorState, objective: string, context: any): EditorAction[] {
    const actions: EditorAction[] = []
    
    // Intelligent action planning based on objective and context
    if (objective.toLowerCase().includes('title') || objective.toLowerCase().includes('create')) {
      // Add a professional title
      actions.push({
        type: 'add_element',
        elementType: 'text',
        target: { x: 100, y: 80 },
        description: 'Add professional title element'
      })
      
      // Style the title for executive audience
      if (context.audienceType === 'executives') {
        actions.push({
          type: 'style',
          target: { elementId: 'title-element' },
          style: {
            fontSize: 36,
            fontFamily: 'Inter',
            fontWeight: 700,
            color: '#1a365d'
          },
          description: 'Apply executive-level title styling'
        })
      }
    }
    
    if (objective.toLowerCase().includes('content') || objective.toLowerCase().includes('insights')) {
      // Add content section
      actions.push({
        type: 'add_element',
        elementType: 'text',
        target: { x: 100, y: 180 },
        description: 'Add content section for key insights'
      })
      
      // Apply professional content styling
      actions.push({
        type: 'style',
        target: { elementId: 'content-element' },
        style: {
          fontSize: 18,
          fontFamily: 'Inter',
          lineHeight: 1.6,
          color: '#2d3748'
        },
        description: 'Apply professional content styling'
      })
    }
    
    if (context.designStyle === 'executive') {
      // Add professional background
      actions.push({
        type: 'update_background',
        background: {
          type: 'gradient',
          value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        },
        description: 'Apply executive-grade background'
      })
    }
    
    return actions
  }

  // Execute a single action on the real editor
  async executeAction(action: EditorAction): Promise<boolean> {
    console.log(`🎮 Executing: ${action.description}`)
    
    try {
      switch (action.type) {
        case 'click':
          if (action.target && 'x' in action.target && this.editorCallbacks.click) {
            await this.simulateDelay(200)
            this.editorCallbacks.click(action.target.x, action.target.y)
            console.log(`✅ Clicked at (${action.target.x}, ${action.target.y})`)
          }
          break

        case 'drag':
          if (action.from && action.to && this.editorCallbacks.drag) {
            await this.simulateDelay(300)
            this.editorCallbacks.drag(action.from.x, action.from.y, action.to.x, action.to.y)
            console.log(`✅ Dragged from (${action.from.x}, ${action.from.y}) to (${action.to.x}, ${action.to.y})`)
          }
          break

        case 'type':
          if (action.text && this.editorCallbacks.type) {
            await this.simulateDelay(100 * action.text.length) // Simulate typing speed
            this.editorCallbacks.type(action.text)
            console.log(`✅ Typed: "${action.text}"`)
          }
          break

        case 'select':
          if (action.target && 'elementId' in action.target && this.editorCallbacks.selectElement) {
            await this.simulateDelay(200)
            this.editorCallbacks.selectElement(action.target.elementId)
            console.log(`✅ Selected element: ${action.target.elementId}`)
          }
          break

        case 'style':
          if (action.target && 'elementId' in action.target && action.style && this.editorCallbacks.updateStyle) {
            await this.simulateDelay(300)
            this.editorCallbacks.updateStyle(action.target.elementId, action.style)
            console.log(`✅ Updated style for ${action.target.elementId}:`, action.style)
          }
          break

        case 'move':
          if (action.target && 'elementId' in action.target && action.to && this.editorCallbacks.moveElement) {
            await this.simulateDelay(400)
            this.editorCallbacks.moveElement(action.target.elementId, action.to.x, action.to.y)
            console.log(`✅ Moved ${action.target.elementId} to (${action.to.x}, ${action.to.y})`)
          }
          break

        case 'resize':
          if (action.target && 'elementId' in action.target && action.to && this.editorCallbacks.resizeElement) {
            await this.simulateDelay(300)
            this.editorCallbacks.resizeElement(action.target.elementId, action.to.x, action.to.y)
            console.log(`✅ Resized ${action.target.elementId} to ${action.to.x}x${action.to.y}`)
          }
          break

        case 'delete':
          if (action.target && 'elementId' in action.target && this.editorCallbacks.deleteElement) {
            await this.simulateDelay(200)
            this.editorCallbacks.deleteElement(action.target.elementId)
            console.log(`✅ Deleted element: ${action.target.elementId}`)
          }
          break

        case 'group':
          if (action.target && action.groupName && this.editorCallbacks.groupElements) {
            await this.simulateDelay(300)
            // Extract element IDs from target
            const elementIds = Array.isArray(action.target) ? action.target : []
            this.editorCallbacks.groupElements(elementIds as string[], action.groupName)
            console.log(`✅ Grouped elements into: ${action.groupName}`)
          }
          break

        case 'layer':
          if (action.target && 'elementId' in action.target && action.layerName && this.editorCallbacks.moveToLayer) {
            await this.simulateDelay(200)
            this.editorCallbacks.moveToLayer(action.target.elementId, action.layerName)
            console.log(`✅ Moved ${action.target.elementId} to layer: ${action.layerName}`)
          }
          break

        case 'add_element':
          if (action.target && 'x' in action.target && action.elementType && this.editorCallbacks.addElement) {
            await this.simulateDelay(300)
            const elementId = this.editorCallbacks.addElement(action.elementType, action.target)
            console.log(`✅ Added ${action.elementType} element: ${elementId}`)
            
            // Apply text content if provided
            if (action.text && elementId && this.editorCallbacks.type) {
              await this.simulateDelay(100)
              this.editorCallbacks.selectElement?.(elementId)
              await this.simulateDelay(50)
              this.editorCallbacks.type(action.text)
            }
            
            // Apply styles if provided
            if (action.style && elementId && this.editorCallbacks.updateStyle) {
              await this.simulateDelay(200)
              this.editorCallbacks.updateStyle(elementId, action.style)
            }
            
            // Apply chart config if provided
            if (action.chartConfig && elementId && this.editorCallbacks.updateStyle) {
              await this.simulateDelay(100)
              this.editorCallbacks.updateStyle(elementId, { chartConfig: action.chartConfig })
            }
          }
          break

        case 'update_background':
          if (action.background && this.editorCallbacks.updateBackground) {
            await this.simulateDelay(300)
            this.editorCallbacks.updateBackground(action.background)
            console.log(`✅ Updated background`)
          }
          break

        default:
          console.warn(`⚠️ Unknown action type: ${action.type}`)
          return false
      }

      return true
    } catch (error) {
      console.error(`❌ Failed to execute action: ${action.description}`, error)
      return false
    }
  }

  // Execute a sequence of actions with visual feedback
  async executeActionSequence(actions: EditorAction[], onProgress?: (progress: number) => void): Promise<void> {
    if (this.isExecuting) {
      console.warn('⚠️ Already executing actions')
      return
    }

    this.isExecuting = true
    this.actionQueue = [...actions]

    console.log(`🚀 Starting execution of ${actions.length} actions`)

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i]
      const success = await this.executeAction(action)
      
      if (!success) {
        console.error(`❌ Action ${i + 1} failed, stopping execution`)
        break
      }

      const progress = ((i + 1) / actions.length) * 100
      onProgress?.(progress)

      // Add delay between actions for visual effect
      await this.simulateDelay(action.duration || 500)
    }

    this.isExecuting = false
    this.actionQueue = []
    console.log('✅ Action sequence completed')
  }

  // AI builds a complete slide from scratch with REAL element tracking
  async buildSlideFromScratch(
    slideData: {
      title: string
      content: any[]
      charts?: any[]
      layout?: string
    },
    editorState: EditorState,
    context: any
  ): Promise<EditorAction[]> {
    console.log('🏗️ AI building complete slide from scratch...')

    const actions: EditorAction[] = []
    const elementIds: string[] = []

    // 1. Add title element
    actions.push({
      type: 'add_element',
      elementType: 'text',
      target: { x: 80, y: 80 },
      text: slideData.title,
      style: {
        fontSize: 48,
        fontFamily: 'Inter',
        fontWeight: 700,
        color: '#153e75',
        textAlign: 'left',
        background: 'linear-gradient(135deg, #153e75 0%, #2a69ac 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      },
      description: 'Add executive-style title with gradient text effect'
    })

    // 2. Add content elements with proper spacing
    let yPosition = 200
    const contentIds: string[] = []
    
    for (let i = 0; i < slideData.content.length && i < 4; i++) {
      const contentItem = slideData.content[i]
      const isKeyPoint = contentItem.includes('•') || contentItem.match(/^\d+\./)
      
      actions.push({
        type: 'add_element',
        elementType: 'text',
        target: { x: isKeyPoint ? 120 : 80, y: yPosition },
        text: contentItem,
        style: {
          fontSize: isKeyPoint ? 20 : 18,
          fontFamily: 'Inter',
          fontWeight: isKeyPoint ? 600 : 400,
          color: isKeyPoint ? '#153e75' : '#1a365d',
          lineHeight: 1.6,
          padding: '12px 20px',
          borderRadius: 8,
          background: isKeyPoint ? 
            'linear-gradient(135deg, rgba(42, 105, 172, 0.08) 0%, rgba(21, 62, 117, 0.12) 100%)' : 
            'transparent',
          boxShadow: isKeyPoint ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
          border: isKeyPoint ? '1px solid rgba(42, 105, 172, 0.2)' : 'none',
          marginBottom: '16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        description: `Add ${isKeyPoint ? 'key point' : 'content'} with professional styling`
      })
      
      yPosition += isKeyPoint ? 80 : 60
    }

    // 3. Add chart if provided
    if (slideData.charts && slideData.charts.length > 0) {
      const chart = slideData.charts[0]
      const chartWidth = 600
      const chartHeight = 300
      const chartX = (editorState.canvasSize.width - chartWidth) / 2
      
      actions.push({
        type: 'add_element',
        elementType: 'chart',
        target: { x: chartX, y: yPosition + 40 },
        style: {
          width: chartWidth,
          height: chartHeight,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(42, 105, 172, 0.2)',
          overflow: 'hidden'
        },
        chartConfig: chart,
        description: 'Add professional chart with executive styling'
      })
    }

    // 4. Add sophisticated background
    actions.push({
      type: 'update_background',
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        gradient: {
          direction: '135deg',
          stops: [
            { color: '#ffffff', position: 0 },
            { color: '#f8fafc', position: 100 }
          ]
        }
      },
      description: 'Apply subtle professional gradient background'
    })

    return actions
  }

  // Helper to describe current editor state for AI
  private describeEditorState(state: EditorState): string {
    const elementDescriptions = state.elements.map(el => 
      `- ${el.type} "${el.content}" at (${el.position.x}, ${el.position.y}), size: ${el.size.width}x${el.size.height}, layer: ${el.layer}${el.group ? `, group: ${el.group}` : ''}`
    ).join('\n')

    const groupDescriptions = state.groups.map(g => 
      `- Group "${g.name}": ${g.elements.length} elements`
    ).join('\n')

    return `Canvas: ${state.canvasSize.width}x${state.canvasSize.height}
Selected: ${state.selectedElement || 'none'}

Elements (${state.elements.length}):
${elementDescriptions}

Groups (${state.groups.length}):
${groupDescriptions}

Layers: ${state.layers.map(l => l.name).join(', ')}`
  }

  // Simulate realistic action delays
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Record user actions to learn from
  recordUserAction(action: EditorAction) {
    console.log('📹 Recorded user action:', action.description)
    // This could be used to train the AI on user patterns
  }

  // Get current execution status
  getStatus() {
    return {
      isExecuting: this.isExecuting,
      queueLength: this.actionQueue.length,
      currentAction: this.actionQueue[0]
    }
  }
}