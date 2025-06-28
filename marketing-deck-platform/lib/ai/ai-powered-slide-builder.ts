// Advanced editor features integration for AI slide building
import { EnhancedAIMethods } from './enhanced-ai-methods'
import { safeOpenAIJSONCall } from './openai-helpers'
interface EditorFeatures {
  positioning: {
    dragDrop: boolean
    smartGuides: boolean
    gridSnap: boolean
    alignment: boolean
  }
  styling: {
    layers: boolean
    grouping: boolean
    gradients: boolean
    shadows: boolean
    animations: boolean
  }
  professional: {
    typography: boolean
    colorTheory: boolean
    layouts: boolean
    templates: boolean
  }
}

interface AISlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape' | 'icon' | 'callout'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  content: string
  style: {
    fontSize?: number
    fontFamily?: string
    fontWeight?: number | string
    color?: string
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    padding?: string
    margin?: string
    textAlign?: 'left' | 'center' | 'right'
    opacity?: number
    boxShadow?: string
    background?: string
    transform?: string
    transition?: string
    zIndex?: number
  }
  animations?: {
    entrance?: string
    exit?: string
    duration?: number
    delay?: number
    easing?: string
  }
  layer?: {
    name: string
    group?: string
    locked?: boolean
    visible?: boolean
    blendMode?: string
  }
  interactivity?: {
    hover?: any
    click?: any
    tooltip?: string
  }
  metadata?: {
    businessContext?: string
    aiReasoning?: string
    designPrinciple?: string
    layoutRole?: string
  }
}

interface AISlideDesign {
  background: {
    type: 'solid' | 'gradient' | 'image' | 'pattern'
    value: string
    gradient?: {
      direction: string
      stops: Array<{ color: string; position: number }>
    }
  }
  layout: {
    type: 'grid' | 'freeform' | 'template'
    columns: number
    rows: number
    gutters: { horizontal: number; vertical: number }
    margins: { top: number; right: number; bottom: number; left: number }
  }
  typography: {
    primary: { family: string; size: number; weight: number; lineHeight: number }
    secondary: { family: string; size: number; weight: number; lineHeight: number }
    body: { family: string; size: number; weight: number; lineHeight: number }
  }
  colorScheme: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    subtle: string
  }
  animations: {
    slideEntry: { type: string; duration: number; easing: string }
    elementSequence: boolean
    interactionEffects: boolean
  }
}

export class AIPoweredSlideBuilder {
  private editorFeatures: EditorFeatures

  constructor() {
    this.editorFeatures = {
      positioning: {
        dragDrop: true,
        smartGuides: true,
        gridSnap: true,
        alignment: true
      },
      styling: {
        layers: true,
        grouping: true,
        gradients: true,
        shadows: true,
        animations: true
      },
      professional: {
        typography: true,
        colorTheory: true,
        layouts: true,
        templates: true
      }
    }
  }

  async buildSlideWithAdvancedFeatures(slideData: {
    title: string
    content: any
    businessContext: string
    audienceLevel: string
    designGoal: string
    dataVisualizations?: any[]
    enhancedInsights?: any[]
    slideType?: string
    keyMessage?: string
  }): Promise<{
    elements: AISlideElement[]
    design: AISlideDesign
    layers: Array<{ name: string; elements: string[] }>
    groups: Array<{ name: string; elements: string[] }>
    animations: any[]
    reasoning: string
  }> {
    
    console.log('🎨 AI building slide with advanced editor features...')

    // Generate AI-powered design using OpenAI
    console.log('🎨 Creating slide with AI-powered design...')
    
    let aiDesign: any
    
    try {
      // Validate API key first
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
      }
      
      // Create the enhanced design prompt for OpenAI
      const prompt = EnhancedAIMethods.createEnhancedDesignPrompt(slideData)
      
      // Initialize OpenAI with proper error handling
      const OpenAI = await import('openai')
      const openai = new OpenAI.default({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 30000, // 30 second timeout
        maxRetries: 2
      })
      
      console.log('🤖 Calling OpenAI for advanced slide design...')
      
      // Call OpenAI to generate the slide design with retry logic and timeout
      console.log('🔄 Starting OpenAI call with 30-second timeout...')
      
      const aiResponse = await Promise.race([
        safeOpenAIJSONCall(openai, {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert presentation designer and business analyst specializing in Fortune 500 executive presentations. 

CRITICAL REQUIREMENTS:
1. Generate REAL, ACTIONABLE business content - not placeholders  
2. Use actual data provided to create meaningful insights
3. Create professional slide layouts with substantial content
4. Focus on executive-level strategic analysis
5. Include specific recommendations and action items
6. Use data to support all claims and insights

You MUST respond with valid JSON format only. Your slides should be indistinguishable from those created by top consulting firms (but with better coffee and more personality).`
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          temperature: 0.1, // Lower temperature for more consistent, professional output
          max_tokens: 4000, // Increased for more detailed content
          timeout: 30000
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('OpenAI call timed out after 30 seconds')), 30000)
        )
      ])
      console.log('📄 AI response received, parsing...', aiResponse?.substring(0, 100))
      
      if (aiResponse) {
        try {
          // aiResponse is already a JSON string from safeOpenAIJSONCall
          aiDesign = JSON.parse(aiResponse)
          
          // Validate AI response structure
          if (!aiDesign.elements || !Array.isArray(aiDesign.elements)) {
            throw new Error('Invalid AI response structure - missing elements array')
          }
          
          // Enhance content quality
          aiDesign = EnhancedAIMethods.enhanceAIContent(aiDesign, slideData)
          console.log('✅ AI design parsed and enhanced successfully')
        } catch (parseError) {
          console.error('❌ Failed to parse AI response:', parseError)
          throw new Error('Invalid JSON response from OpenAI')
        }
      } else {
        throw new Error('Empty AI response')
      }
      
    } catch (error) {
      console.error('❌ OpenAI API error:', error)
      
      // Check if this is a timeout error
      if (error.message?.includes('timed out')) {
        console.log('⏰ OpenAI call timed out, using enhanced fallback immediately')
      } else {
        console.log('⚠️ OpenAI failed, falling back to enhanced professional design template')
      }
      
      // Enhanced fallback with real content generation
      try {
        aiDesign = EnhancedAIMethods.createEnhancedProfessionalDesign(slideData)
        console.log('✅ Fallback design created successfully')
      } catch (fallbackError) {
        console.error('❌ Fallback design creation failed:', fallbackError)
        // Create minimal working design
        aiDesign = this.createMinimalWorkingDesign(slideData)
        console.log('✅ Minimal working design created as last resort')
      }
    }
    
    // Process AI design into advanced editor format
    const processedDesign = this.processAIDesignWithEditorFeatures(aiDesign, slideData)
    
    console.log('✨ AI slide built with advanced features:', {
      elements: processedDesign.elements.length,
      layers: processedDesign.layers.length,
      groups: processedDesign.groups.length,
      animations: processedDesign.animations.length,
      aiGenerated: !!aiDesign.elements
    })

    return processedDesign
  }

  private createMinimalWorkingDesign(slideData: any): any {
    // Create a simple but functional design as last resort
    return {
      elements: [
        {
          id: 'title',
          type: 'text',
          position: { x: 80, y: 80 },
          size: { width: 800, height: 60 },
          content: slideData.title || 'Business Analysis',
          style: {
            fontSize: 32,
            fontFamily: 'Inter',
            fontWeight: 700,
            color: '#1a365d'
          }
        },
        {
          id: 'content',
          type: 'text',
          position: { x: 80, y: 180 },
          size: { width: 800, height: 300 },
          content: typeof slideData.content === 'string' 
            ? slideData.content 
            : 'Strategic analysis and recommendations based on business context and data insights.',
          style: {
            fontSize: 18,
            fontFamily: 'Inter',
            fontWeight: 400,
            color: '#2d3748',
            lineHeight: 1.6
          }
        }
      ],
      design: {
        background: { type: 'solid', value: '#ffffff' },
        layout: { type: 'simple', columns: 1 },
        colorScheme: { primary: '#1a365d', text: '#2d3748' }
      },
      reasoning: 'Minimal functional design created as fallback'
    }
  }

  private createProfessionalDesign(slideData: any): any {
    // Create sophisticated design based on business context
    const isExecutiveAudience = slideData.audienceLevel === 'executive' || slideData.audienceLevel === 'executives'
    const isDataFocused = slideData.dataVisualizations && slideData.dataVisualizations.length > 0
    
    return {
      title: slideData.title || 'Strategic Presentation',
      layout: {
        type: isExecutiveAudience ? 'executive-focus' : 'professional',
        grid: { columns: 12, rows: 8 },
        margins: { top: 60, right: 80, bottom: 60, left: 80 }
      },
      elements: [
        {
          id: 'title-element',
          type: 'text',
          content: slideData.title || 'Strategic Insights',
          role: 'primary-heading',
          layer: 'content',
          positioning: { 
            strategy: 'smart-guide',
            coordinates: { x: 80, y: 80 },
            alignment: 'left'
          },
          typography: {
            family: 'Inter',
            weight: 700,
            size: isExecutiveAudience ? 36 : 32,
            color: '#1a365d',
            lineHeight: 1.2
          }
        },
        {
          id: 'content-container',
          type: 'text',
          content: Array.isArray(slideData.content) ? slideData.content.join('\n') : slideData.content,
          role: 'supporting-content',
          layer: 'content',
          positioning: {
            strategy: 'grid-snap',
            coordinates: { x: 80, y: 160 },
            alignment: 'left'
          },
          typography: {
            family: 'Inter',
            weight: 400,
            size: 18,
            color: '#2d3748',
            lineHeight: 1.6
          }
        }
      ],
      styling: {
        colorScheme: isExecutiveAudience ? 'executive' : 'professional',
        gradients: true,
        shadows: 'subtle',
        animations: 'elegant'
      },
      reasoning: `Professional ${isExecutiveAudience ? 'executive' : 'business'} design with clean typography and strategic layout for ${slideData.audienceLevel} audience`
    }
  }

  private createDesignPrompt(slideData: any): string {
    return `Design a professional slide using advanced editor features:

SLIDE CONTENT:
- Title: ${slideData.title}
- Content: ${typeof slideData.content === 'string' ? slideData.content : JSON.stringify(slideData.content)}
- Business Context: ${slideData.businessContext}
- Audience: ${slideData.audienceLevel}
- Design Goal: ${slideData.designGoal}
${slideData.dataVisualizations ? `- Data Visualizations: ${JSON.stringify(slideData.dataVisualizations)}` : ''}

ADVANCED EDITOR FEATURES TO USE:
1. SMART POSITIONING:
   - Use 12-column grid system with smart guides
   - Snap elements to 8px grid for consistency
   - Apply rule of thirds for visual balance
   - Use golden ratio for element sizing

2. PROFESSIONAL LAYERING:
   - Background layer (gradients, patterns)
   - Content layer (text, images)
   - Decoration layer (shapes, icons)
   - Overlay layer (callouts, highlights)
   - Interaction layer (buttons, links)

3. SOPHISTICATED GROUPING:
   - Group related elements logically
   - Create section groups (header, body, footer)
   - Bundle chart elements together
   - Group decorative elements

4. ADVANCED STYLING:
   - Use executive typography hierarchy
   - Apply professional color theory
   - Add subtle shadows and gradients
   - Implement micro-animations
   - Use consistent spacing system

5. LAYOUT INTELLIGENCE:
   - Follow F-pattern or Z-pattern reading flow
   - Use whitespace strategically
   - Balance visual weight
   - Create focal points with contrast

IMPORTANT: Generate REAL, MEANINGFUL CONTENT based on the provided slide data. DO NOT use placeholder text.
- If content includes bullet points, create separate text elements for each
- If data visualizations are provided, create actual chart elements with the data
- Use the business context to inform the content quality and tone

RETURN JSON:
{
  "elements": [
    {
      "id": "unique_id",
      "type": "text|image|chart|shape|icon|callout",
      "position": {"x": number, "y": number},
      "size": {"width": number, "height": number},
      "rotation": 0,
      "content": "ACTUAL MEANINGFUL CONTENT - NOT PLACEHOLDERS",
      "style": {
        "fontSize": 24,
        "fontFamily": "Inter",
        "fontWeight": 600,
        "color": "#153e75",
        "backgroundColor": "#ffffff",
        "borderRadius": 8,
        "boxShadow": "0 4px 12px rgba(0,0,0,0.15)",
        "background": "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        "padding": "24px",
        "transform": "translateY(0px)",
        "transition": "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "zIndex": 10
      },
      "animations": {
        "entrance": "fadeInUp",
        "duration": 600,
        "delay": 200,
        "easing": "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      },
      "layer": {
        "name": "content",
        "group": "main-content",
        "locked": false,
        "visible": true
      },
      "interactivity": {
        "hover": {"transform": "scale(1.02)", "boxShadow": "0 8px 24px rgba(0,0,0,0.25)"},
        "tooltip": "Additional information"
      },
      "metadata": {
        "businessContext": "Primary value proposition",
        "aiReasoning": "Positioned using golden ratio for maximum impact",
        "designPrinciple": "Visual hierarchy with contrast",
        "layoutRole": "focal-point"
      }
    }
  ],
  "design": {
    "background": {
      "type": "gradient",
      "value": "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      "gradient": {
        "direction": "135deg",
        "stops": [
          {"color": "#ffffff", "position": 0},
          {"color": "#f8fafc", "position": 100}
        ]
      }
    },
    "layout": {
      "type": "grid",
      "columns": 12,
      "rows": 8,
      "gutters": {"horizontal": 24, "vertical": 24},
      "margins": {"top": 80, "right": 80, "bottom": 80, "left": 80}
    },
    "typography": {
      "primary": {"family": "Inter", "size": 48, "weight": 700, "lineHeight": 1.2},
      "secondary": {"family": "Inter", "size": 28, "weight": 500, "lineHeight": 1.4},
      "body": {"family": "Inter", "size": 18, "weight": 400, "lineHeight": 1.6}
    },
    "colorScheme": {
      "primary": "#153e75",
      "secondary": "#2a69ac",
      "accent": "#3b82f6",
      "background": "#ffffff",
      "text": "#1a365d",
      "subtle": "#64748b"
    },
    "animations": {
      "slideEntry": {"type": "fadeInUp", "duration": 800, "easing": "cubic-bezier(0.25, 0.46, 0.45, 0.94)"},
      "elementSequence": true,
      "interactionEffects": true
    }
  },
  "layers": [
    {"name": "background", "elements": ["bg_element_ids"]},
    {"name": "content", "elements": ["content_element_ids"]},
    {"name": "decoration", "elements": ["decoration_element_ids"]},
    {"name": "overlay", "elements": ["overlay_element_ids"]}
  ],
  "groups": [
    {"name": "header-section", "elements": ["title", "subtitle"]},
    {"name": "main-content", "elements": ["body_elements"]},
    {"name": "data-visualization", "elements": ["chart_elements"]},
    {"name": "call-to-action", "elements": ["cta_elements"]}
  ],
  "animations": [
    {
      "name": "slide-entrance",
      "sequence": [
        {"element": "background", "type": "fadeIn", "delay": 0},
        {"element": "title", "type": "slideInFromTop", "delay": 200},
        {"element": "content", "type": "fadeInUp", "delay": 400},
        {"element": "chart", "type": "drawPath", "delay": 600}
      ]
    }
  ],
  "reasoning": "Detailed explanation of design decisions and how advanced editor features were leveraged for maximum business impact and visual excellence."
}`
  }

  private processAIDesignWithEditorFeatures(aiDesign: any, slideData: any): any {
    // Enhanced processing that leverages our advanced editor features
    const elements = (aiDesign.elements || []).map((element: any, index: number) => {
      // Apply smart positioning using grid system
      const gridPosition = this.applySmartGridPositioning(element.position, aiDesign.design?.layout)
      
      // Enhance styling with professional design patterns
      const enhancedStyle = this.applyProfessionalStyling(element.style, aiDesign.design?.colorScheme)
      
      // Add sophisticated animations
      const advancedAnimations = this.createAdvancedAnimations(element.animations, index)
      
      // Apply layering logic
      const layerInfo = this.determineOptimalLayer(element.type, element.metadata?.layoutRole)
      
      return {
        id: element.id || `ai_element_${Date.now()}_${index}`,
        type: element.type,
        position: gridPosition,
        size: this.optimizeElementSize(element.size, aiDesign.design?.layout),
        rotation: element.rotation || 0,
        content: element.content,
        style: enhancedStyle,
        animations: advancedAnimations,
        layer: layerInfo,
        interactivity: this.enhanceInteractivity(element.interactivity),
        metadata: {
          ...element.metadata,
          aiGenerated: true,
          designPrinciples: this.identifyDesignPrinciples(element),
          editorFeatures: this.identifyUsedFeatures(element)
        }
      }
    })

    // Create intelligent layer organization
    const smartLayers = this.createSmartLayerSystem(elements)
    
    // Generate logical groupings
    const intelligentGroups = this.createIntelligentGroups(elements, slideData)
    
    // Enhanced animation sequences
    const animationSequences = this.createAnimationSequences(elements, aiDesign.animations)
    
    // Apply advanced design system
    const enhancedDesign = this.enhanceDesignSystem(aiDesign.design, slideData)

    return {
      elements,
      design: enhancedDesign,
      layers: smartLayers,
      groups: intelligentGroups,
      animations: animationSequences,
      reasoning: aiDesign.reasoning || "AI-generated slide using advanced editor features for professional presentation design."
    }
  }

  private applySmartGridPositioning(position: any, layout: any): { x: number; y: number } {
    if (!layout || !position) return position || { x: 100, y: 100 }
    
    const gridSize = 8 // 8px grid system
    const columnWidth = (layout.maxWidth || 1200) / (layout.columns || 12)
    
    // Snap to grid
    const snappedX = Math.round(position.x / gridSize) * gridSize
    const snappedY = Math.round(position.y / gridSize) * gridSize
    
    // Ensure column alignment
    const alignedX = Math.round(snappedX / columnWidth) * columnWidth
    
    return {
      x: Math.max(layout.margins?.left || 80, alignedX),
      y: Math.max(layout.margins?.top || 80, snappedY)
    }
  }

  private applyProfessionalStyling(style: any, colorScheme: any): any {
    const baseStyle = style || {}
    const colors = colorScheme || {}
    
    return {
      ...baseStyle,
      fontFamily: baseStyle.fontFamily || '"Inter", system-ui, sans-serif',
      color: baseStyle.color || colors.text || '#1a365d',
      backgroundColor: baseStyle.backgroundColor || colors.background || '#ffffff',
      borderRadius: baseStyle.borderRadius || 8,
      boxShadow: baseStyle.boxShadow || '0 4px 12px rgba(0,0,0,0.1)',
      transition: baseStyle.transition || 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      // Professional micro-interactions
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }
    }
  }

  private createAdvancedAnimations(animations: any, index: number): any {
    return {
      entrance: animations?.entrance || 'fadeInUp',
      duration: animations?.duration || 600,
      delay: animations?.delay || (index * 150), // Staggered animation
      easing: animations?.easing || 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      // Advanced animation properties
      springPreset: 'gentle',
      gestureResponse: true,
      performanceOptimized: true
    }
  }

  private determineOptimalLayer(elementType: string, layoutRole: string): any {
    const layerMapping = {
      'background': { name: 'background', zIndex: 1 },
      'shape': { name: 'decoration', zIndex: 5 },
      'text': { name: 'content', zIndex: 10 },
      'image': { name: 'content', zIndex: 8 },
      'chart': { name: 'content', zIndex: 12 },
      'callout': { name: 'overlay', zIndex: 15 },
      'icon': { name: 'decoration', zIndex: 7 }
    }
    
    const baseLayer = layerMapping[elementType] || { name: 'content', zIndex: 10 }
    
    return {
      ...baseLayer,
      group: this.determineLayerGroup(layoutRole),
      locked: false,
      visible: true,
      blendMode: 'normal'
    }
  }

  private determineLayerGroup(layoutRole: string): string {
    const groupMapping = {
      'focal-point': 'primary-content',
      'supporting': 'secondary-content', 
      'decoration': 'visual-enhancement',
      'navigation': 'interface-elements',
      'data': 'data-visualization'
    }
    
    return groupMapping[layoutRole] || 'general-content'
  }

  private enhanceInteractivity(interactivity: any): any {
    return {
      hover: {
        scale: 1.02,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        transition: 'all 0.2s ease-out',
        ...interactivity?.hover
      },
      click: {
        scale: 0.98,
        transition: 'all 0.1s ease-out',
        ...interactivity?.click
      },
      focus: {
        outline: '2px solid #3b82f6',
        outlineOffset: '2px'
      },
      tooltip: interactivity?.tooltip,
      // Advanced interaction features
      gesture: {
        swipe: false,
        pinch: false,
        rotate: false
      },
      accessibility: {
        ariaLabel: true,
        keyboardNav: true,
        screenReader: true
      }
    }
  }

  private createSmartLayerSystem(elements: AISlideElement[]): Array<{ name: string; elements: string[] }> {
    const layers = {
      background: [],
      decoration: [],
      content: [],
      overlay: [],
      interaction: []
    }
    
    elements.forEach(element => {
      const layerName = element.layer?.name || 'content'
      if (layers[layerName]) {
        layers[layerName].push(element.id)
      }
    })
    
    return Object.entries(layers)
      .filter(([_, elementIds]) => elementIds.length > 0)
      .map(([name, elementIds]) => ({ name, elements: elementIds }))
  }

  private createIntelligentGroups(elements: AISlideElement[], slideData: any): Array<{ name: string; elements: string[] }> {
    const groups = []
    
    // Header group
    const headerElements = elements.filter(el => 
      el.position.y < 200 && (el.type === 'text' || el.metadata?.layoutRole === 'title')
    )
    if (headerElements.length > 0) {
      groups.push({
        name: 'header-section',
        elements: headerElements.map(el => el.id)
      })
    }
    
    // Main content group
    const contentElements = elements.filter(el => 
      el.position.y >= 200 && el.position.y < 500 && el.type === 'text'
    )
    if (contentElements.length > 0) {
      groups.push({
        name: 'main-content',
        elements: contentElements.map(el => el.id)
      })
    }
    
    // Data visualization group
    const chartElements = elements.filter(el => el.type === 'chart')
    if (chartElements.length > 0) {
      groups.push({
        name: 'data-visualization',
        elements: chartElements.map(el => el.id)
      })
    }
    
    // Decorative elements group
    const decorativeElements = elements.filter(el => 
      el.type === 'shape' || el.type === 'icon' || el.layer?.name === 'decoration'
    )
    if (decorativeElements.length > 0) {
      groups.push({
        name: 'visual-enhancements',
        elements: decorativeElements.map(el => el.id)
      })
    }
    
    return groups
  }

  private createAnimationSequences(elements: AISlideElement[], animationConfig: any): any[] {
    const sequences = []
    
    // Main entrance sequence
    const entranceSequence = {
      name: 'slide-entrance',
      sequence: elements.map((element, index) => ({
        elementId: element.id,
        type: element.animations?.entrance || 'fadeInUp',
        delay: (element.animations?.delay || 0) + (index * 150),
        duration: element.animations?.duration || 600,
        easing: element.animations?.easing || 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }))
    }
    sequences.push(entranceSequence)
    
    // Chart-specific animations
    const chartElements = elements.filter(el => el.type === 'chart')
    if (chartElements.length > 0) {
      sequences.push({
        name: 'data-reveal',
        sequence: chartElements.map(element => ({
          elementId: element.id,
          type: 'drawPath',
          delay: 800,
          duration: 1200,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }))
      })
    }
    
    // Hover interactions
    sequences.push({
      name: 'hover-interactions',
      sequence: elements
        .filter(el => el.interactivity?.hover)
        .map(element => ({
          elementId: element.id,
          trigger: 'hover',
          type: 'scale',
          properties: element.interactivity.hover
        }))
    })
    
    return sequences
  }

  private enhanceDesignSystem(design: any, slideData: any): AISlideDesign {
    return {
      background: {
        type: design?.background?.type || 'gradient',
        value: design?.background?.value || 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        gradient: design?.background?.gradient || {
          direction: '135deg',
          stops: [
            { color: '#ffffff', position: 0 },
            { color: '#f8fafc', position: 100 }
          ]
        }
      },
      layout: {
        type: 'grid',
        columns: 12,
        rows: 8,
        gutters: { horizontal: 24, vertical: 24 },
        margins: { top: 80, right: 80, bottom: 80, left: 80 },
        ...design?.layout
      },
      typography: {
        primary: { family: 'Inter', size: 48, weight: 700, lineHeight: 1.2 },
        secondary: { family: 'Inter', size: 28, weight: 500, lineHeight: 1.4 },
        body: { family: 'Inter', size: 18, weight: 400, lineHeight: 1.6 },
        ...design?.typography
      },
      colorScheme: {
        primary: '#153e75',
        secondary: '#2a69ac',
        accent: '#3b82f6',
        background: '#ffffff',
        text: '#1a365d',
        subtle: '#64748b',
        ...design?.colorScheme
      },
      animations: {
        slideEntry: { type: 'fadeInUp', duration: 800, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
        elementSequence: true,
        interactionEffects: true,
        ...design?.animations
      }
    }
  }

  private optimizeElementSize(size: any, layout: any): { width: number; height: number } {
    if (!size) return { width: 200, height: 60 }
    
    const maxWidth = (layout?.maxWidth || 1200) - ((layout?.margins?.left || 80) + (layout?.margins?.right || 80))
    
    return {
      width: Math.min(size.width || 200, maxWidth),
      height: size.height || 60
    }
  }

  private identifyDesignPrinciples(element: any): string[] {
    const principles = []
    
    if (element.style?.fontSize > 32) principles.push('hierarchy')
    if (element.style?.boxShadow) principles.push('depth')
    if (element.style?.background?.includes('gradient')) principles.push('visual-interest')
    if (element.animations) principles.push('motion-design')
    if (element.position) principles.push('grid-alignment')
    
    return principles
  }

  private identifyUsedFeatures(element: any): string[] {
    const features = []
    
    if (element.position) features.push('smart-positioning')
    if (element.layer) features.push('layer-management')
    if (element.animations) features.push('advanced-animations')
    if (element.style?.transform || element.style?.transition) features.push('micro-interactions')
    if (element.interactivity) features.push('interactive-design')
    
    return features
  }

  // Public method to generate slides with full editor integration
  async generatePresentationWithEditorFeatures(request: {
    slides: Array<{
      title: string
      content: any
      businessContext: string
      dataVisualizations?: any[]
    }>
    overallContext: {
      audienceLevel: string
      designGoal: string
      brandGuidelines?: any
    }
  }): Promise<{
    slides: any[]
    designSystem: any
    editorInstructions: any
  }> {
    console.log('🚀 Generating presentation with full editor integration...')
    
    const generatedSlides = []
    let overallDesignSystem = null
    
    for (const [index, slideData] of request.slides.entries()) {
      const slideResult = await this.buildSlideWithAdvancedFeatures({
        ...slideData,
        audienceLevel: request.overallContext.audienceLevel,
        designGoal: request.overallContext.designGoal
      })
      
      generatedSlides.push({
        id: `ai_slide_${index + 1}`,
        number: index + 1,
        title: slideData.title,
        elements: slideResult.elements,
        design: slideResult.design,
        layers: slideResult.layers,
        groups: slideResult.groups,
        animations: slideResult.animations,
        metadata: {
          aiGenerated: true,
          reasoning: slideResult.reasoning,
          editorFeaturesUsed: Object.keys(this.editorFeatures).filter(feature => this.editorFeatures[feature])
        }
      })
      
      if (index === 0) {
        overallDesignSystem = slideResult.design
      }
    }
    
    console.log('✅ Presentation generated with advanced editor integration')
    
    return {
      slides: generatedSlides,
      designSystem: overallDesignSystem,
      editorInstructions: {
        features: this.editorFeatures,
        instructions: [
          'Use drag-drop to position elements precisely',
          'Leverage smart guides for perfect alignment',
          'Organize elements in logical layers',
          'Group related elements for easy management',
          'Apply consistent styling using the design system',
          'Test interactions and animations',
          'Use keyboard shortcuts for efficiency'
        ]
      }
    }
  }
}