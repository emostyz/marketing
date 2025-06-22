export interface Animation {
  id: string
  name: string
  type: 'entrance' | 'emphasis' | 'exit' | 'motion'
  elementId: string
  duration: number
  delay: number
  easing: string
  properties: Record<string, any>
  trigger: 'click' | 'auto' | 'previous'
  order: number
}

export interface Transition {
  id: string
  name: string
  type: 'fade' | 'slide' | 'push' | 'cover' | 'uncover' | 'split' | 'wipe' | 'flip' | 'zoom' | 'dissolve'
  direction?: 'left' | 'right' | 'up' | 'down' | 'center'
  duration: number
  easing: string
}

export const ANIMATION_PRESETS = {
  entrance: [
    {
      id: 'fade-in',
      name: 'Fade In',
      description: 'Element gradually appears',
      properties: {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      duration: 0.5,
      easing: 'ease-out'
    },
    {
      id: 'slide-in-left',
      name: 'Slide In from Left',
      description: 'Element slides in from the left',
      properties: {
        from: { x: '-100%', opacity: 0 },
        to: { x: '0%', opacity: 1 }
      },
      duration: 0.6,
      easing: 'ease-out'
    },
    {
      id: 'slide-in-right',
      name: 'Slide In from Right',
      description: 'Element slides in from the right',
      properties: {
        from: { x: '100%', opacity: 0 },
        to: { x: '0%', opacity: 1 }
      },
      duration: 0.6,
      easing: 'ease-out'
    },
    {
      id: 'slide-in-up',
      name: 'Slide In from Bottom',
      description: 'Element slides in from the bottom',
      properties: {
        from: { y: '100%', opacity: 0 },
        to: { y: '0%', opacity: 1 }
      },
      duration: 0.6,
      easing: 'ease-out'
    },
    {
      id: 'slide-in-down',
      name: 'Slide In from Top',
      description: 'Element slides in from the top',
      properties: {
        from: { y: '-100%', opacity: 0 },
        to: { y: '0%', opacity: 1 }
      },
      duration: 0.6,
      easing: 'ease-out'
    },
    {
      id: 'zoom-in',
      name: 'Zoom In',
      description: 'Element zooms in from small to normal size',
      properties: {
        from: { scale: 0, opacity: 0 },
        to: { scale: 1, opacity: 1 }
      },
      duration: 0.5,
      easing: 'ease-out'
    },
    {
      id: 'bounce-in',
      name: 'Bounce In',
      description: 'Element bounces in with elastic effect',
      properties: {
        from: { scale: 0, opacity: 0 },
        to: { scale: 1, opacity: 1 }
      },
      duration: 0.8,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    {
      id: 'flip-in-x',
      name: 'Flip In Horizontal',
      description: 'Element flips in horizontally',
      properties: {
        from: { rotateX: '-90deg', opacity: 0 },
        to: { rotateX: '0deg', opacity: 1 }
      },
      duration: 0.6,
      easing: 'ease-out'
    },
    {
      id: 'flip-in-y',
      name: 'Flip In Vertical',
      description: 'Element flips in vertically',
      properties: {
        from: { rotateY: '-90deg', opacity: 0 },
        to: { rotateY: '0deg', opacity: 1 }
      },
      duration: 0.6,
      easing: 'ease-out'
    }
  ],
  emphasis: [
    {
      id: 'pulse',
      name: 'Pulse',
      description: 'Element pulses to draw attention',
      properties: {
        keyframes: [
          { scale: 1 },
          { scale: 1.1 },
          { scale: 1 }
        ]
      },
      duration: 0.6,
      easing: 'ease-in-out'
    },
    {
      id: 'shake',
      name: 'Shake',
      description: 'Element shakes horizontally',
      properties: {
        keyframes: [
          { x: 0 },
          { x: -10 },
          { x: 10 },
          { x: -10 },
          { x: 10 },
          { x: 0 }
        ]
      },
      duration: 0.6,
      easing: 'ease-in-out'
    },
    {
      id: 'glow',
      name: 'Glow',
      description: 'Element glows with a highlight effect',
      properties: {
        keyframes: [
          { boxShadow: '0 0 0 rgba(59, 130, 246, 0)' },
          { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' },
          { boxShadow: '0 0 0 rgba(59, 130, 246, 0)' }
        ]
      },
      duration: 1.0,
      easing: 'ease-in-out'
    },
    {
      id: 'wiggle',
      name: 'Wiggle',
      description: 'Element wiggles with rotation',
      properties: {
        keyframes: [
          { rotate: '0deg' },
          { rotate: '5deg' },
          { rotate: '-5deg' },
          { rotate: '5deg' },
          { rotate: '0deg' }
        ]
      },
      duration: 0.5,
      easing: 'ease-in-out'
    },
    {
      id: 'flash',
      name: 'Flash',
      description: 'Element flashes with opacity changes',
      properties: {
        keyframes: [
          { opacity: 1 },
          { opacity: 0 },
          { opacity: 1 },
          { opacity: 0 },
          { opacity: 1 }
        ]
      },
      duration: 0.6,
      easing: 'linear'
    }
  ],
  exit: [
    {
      id: 'fade-out',
      name: 'Fade Out',
      description: 'Element gradually disappears',
      properties: {
        from: { opacity: 1 },
        to: { opacity: 0 }
      },
      duration: 0.5,
      easing: 'ease-in'
    },
    {
      id: 'slide-out-left',
      name: 'Slide Out to Left',
      description: 'Element slides out to the left',
      properties: {
        from: { x: '0%', opacity: 1 },
        to: { x: '-100%', opacity: 0 }
      },
      duration: 0.6,
      easing: 'ease-in'
    },
    {
      id: 'slide-out-right',
      name: 'Slide Out to Right',
      description: 'Element slides out to the right',
      properties: {
        from: { x: '0%', opacity: 1 },
        to: { x: '100%', opacity: 0 }
      },
      duration: 0.6,
      easing: 'ease-in'
    },
    {
      id: 'zoom-out',
      name: 'Zoom Out',
      description: 'Element zooms out and disappears',
      properties: {
        from: { scale: 1, opacity: 1 },
        to: { scale: 0, opacity: 0 }
      },
      duration: 0.5,
      easing: 'ease-in'
    }
  ]
}

export const TRANSITION_PRESETS = [
  {
    id: 'none',
    name: 'None',
    description: 'No transition',
    type: 'none',
    duration: 0
  },
  {
    id: 'fade',
    name: 'Fade',
    description: 'Fade between slides',
    type: 'fade',
    duration: 0.5,
    easing: 'ease-in-out'
  },
  {
    id: 'slide-left',
    name: 'Slide Left',
    description: 'Slide to the left',
    type: 'slide',
    direction: 'left',
    duration: 0.6,
    easing: 'ease-in-out'
  },
  {
    id: 'slide-right',
    name: 'Slide Right',
    description: 'Slide to the right',
    type: 'slide',
    direction: 'right',
    duration: 0.6,
    easing: 'ease-in-out'
  },
  {
    id: 'slide-up',
    name: 'Slide Up',
    description: 'Slide upward',
    type: 'slide',
    direction: 'up',
    duration: 0.6,
    easing: 'ease-in-out'
  },
  {
    id: 'slide-down',
    name: 'Slide Down',
    description: 'Slide downward',
    type: 'slide',
    direction: 'down',
    duration: 0.6,
    easing: 'ease-in-out'
  },
  {
    id: 'push-left',
    name: 'Push Left',
    description: 'Push slide to the left',
    type: 'push',
    direction: 'left',
    duration: 0.7,
    easing: 'ease-in-out'
  },
  {
    id: 'push-right',
    name: 'Push Right',
    description: 'Push slide to the right',
    type: 'push',
    direction: 'right',
    duration: 0.7,
    easing: 'ease-in-out'
  },
  {
    id: 'cover-left',
    name: 'Cover Left',
    description: 'Cover slide from left',
    type: 'cover',
    direction: 'left',
    duration: 0.7,
    easing: 'ease-in-out'
  },
  {
    id: 'cover-right',
    name: 'Cover Right',
    description: 'Cover slide from right',
    type: 'cover',
    direction: 'right',
    duration: 0.7,
    easing: 'ease-in-out'
  },
  {
    id: 'flip-horizontal',
    name: 'Flip Horizontal',
    description: 'Flip slide horizontally',
    type: 'flip',
    direction: 'horizontal',
    duration: 0.8,
    easing: 'ease-in-out'
  },
  {
    id: 'flip-vertical',
    name: 'Flip Vertical',
    description: 'Flip slide vertically',
    type: 'flip',
    direction: 'vertical',
    duration: 0.8,
    easing: 'ease-in-out'
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    description: 'Zoom into next slide',
    type: 'zoom',
    direction: 'in',
    duration: 0.6,
    easing: 'ease-in-out'
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    description: 'Zoom out to next slide',
    type: 'zoom',
    direction: 'out',
    duration: 0.6,
    easing: 'ease-in-out'
  },
  {
    id: 'dissolve',
    name: 'Dissolve',
    description: 'Dissolve between slides with pixelated effect',
    type: 'dissolve',
    duration: 0.8,
    easing: 'ease-in-out'
  }
]

export class AnimationEngine {
  private animations: Map<string, Animation> = new Map()
  private isPlaying: boolean = false
  private currentAnimationIndex: number = 0

  addAnimation(animation: Animation) {
    this.animations.set(animation.id, animation)
  }

  removeAnimation(animationId: string) {
    this.animations.delete(animationId)
  }

  getAnimations(): Animation[] {
    return Array.from(this.animations.values()).sort((a, b) => a.order - b.order)
  }

  async playSlideAnimations(slideId: string, trigger: 'auto' | 'click' = 'auto') {
    const slideAnimations = this.getAnimations().filter(
      anim => anim.trigger === trigger || anim.trigger === 'auto'
    )

    if (slideAnimations.length === 0) return

    this.isPlaying = true
    this.currentAnimationIndex = 0

    for (const animation of slideAnimations) {
      await this.playAnimation(animation)
    }

    this.isPlaying = false
  }

  private async playAnimation(animation: Animation): Promise<void> {
    return new Promise((resolve) => {
      const element = document.getElementById(animation.elementId)
      if (!element) {
        resolve()
        return
      }

      // Apply animation based on type and properties
      const preset = this.getAnimationPreset(animation.name)
      if (!preset) {
        resolve()
        return
      }

      // Create animation using Web Animations API or CSS animations
      const keyframes = this.createKeyframes(preset.properties)
      const options = {
        duration: animation.duration * 1000,
        delay: animation.delay * 1000,
        easing: animation.easing || preset.easing,
        fill: 'forwards' as FillMode
      }

      const webAnimation = element.animate(keyframes, options)
      
      webAnimation.addEventListener('finish', () => {
        resolve()
      })
    })
  }

  private getAnimationPreset(name: string) {
    for (const category of Object.values(ANIMATION_PRESETS)) {
      const preset = category.find(p => p.name === name)
      if (preset) return preset
    }
    return null
  }

  private createKeyframes(properties: any): Keyframe[] {
    if (properties.keyframes) {
      return properties.keyframes
    }

    const keyframes: Keyframe[] = []
    
    if (properties.from) {
      keyframes.push(properties.from)
    }
    
    if (properties.to) {
      keyframes.push(properties.to)
    }

    return keyframes
  }

  stopCurrentAnimation() {
    this.isPlaying = false
    // Cancel all running animations
    document.getAnimations().forEach(animation => {
      animation.cancel()
    })
  }

  skipToEnd() {
    document.getAnimations().forEach(animation => {
      animation.finish()
    })
  }
}

export class TransitionEngine {
  private currentTransition: Transition | null = null

  async playTransition(
    fromSlide: HTMLElement, 
    toSlide: HTMLElement, 
    transition: Transition
  ): Promise<void> {
    this.currentTransition = transition

    if (transition.type === 'none') {
      fromSlide.style.display = 'none'
      toSlide.style.display = 'block'
      return
    }

    return new Promise((resolve) => {
      const container = fromSlide.parentElement
      if (!container) {
        resolve()
        return
      }

      // Set up initial states
      this.setupTransition(fromSlide, toSlide, transition)

      // Execute transition
      const animation = this.executeTransition(fromSlide, toSlide, transition)
      
      animation.addEventListener('finish', () => {
        this.cleanupTransition(fromSlide, toSlide)
        resolve()
      })
    })
  }

  private setupTransition(fromSlide: HTMLElement, toSlide: HTMLElement, transition: Transition) {
    const container = fromSlide.parentElement!
    
    // Make container relative for absolute positioning
    container.style.position = 'relative'
    container.style.overflow = 'hidden'

    // Position slides
    fromSlide.style.position = 'absolute'
    fromSlide.style.top = '0'
    fromSlide.style.left = '0'
    fromSlide.style.width = '100%'
    fromSlide.style.height = '100%'

    toSlide.style.position = 'absolute'
    toSlide.style.top = '0'
    toSlide.style.left = '0'
    toSlide.style.width = '100%'
    toSlide.style.height = '100%'
    toSlide.style.display = 'block'

    // Set initial positions based on transition type
    this.setInitialPosition(toSlide, transition)
  }

  private setInitialPosition(slide: HTMLElement, transition: Transition) {
    switch (transition.type) {
      case 'slide':
        switch (transition.direction) {
          case 'left':
            slide.style.transform = 'translateX(100%)'
            break
          case 'right':
            slide.style.transform = 'translateX(-100%)'
            break
          case 'up':
            slide.style.transform = 'translateY(100%)'
            break
          case 'down':
            slide.style.transform = 'translateY(-100%)'
            break
        }
        break
      
      case 'fade':
        slide.style.opacity = '0'
        break
      
      case 'zoom':
        if (transition.direction === 'in') {
          slide.style.transform = 'scale(0)'
        } else {
          slide.style.transform = 'scale(2)'
        }
        break
      
      case 'flip':
        if (transition.direction === 'horizontal') {
          slide.style.transform = 'rotateY(-90deg)'
        } else {
          slide.style.transform = 'rotateX(-90deg)'
        }
        break
    }
  }

  private executeTransition(fromSlide: HTMLElement, toSlide: HTMLElement, transition: Transition): Animation {
    const keyframes = this.getTransitionKeyframes(transition)
    const options = {
      duration: transition.duration * 1000,
      easing: transition.easing,
      fill: 'forwards' as FillMode
    }

    // Animate both slides simultaneously
    const fromAnimation = fromSlide.animate(keyframes.from, options)
    const toAnimation = toSlide.animate(keyframes.to, options)

    return toAnimation // Return one animation to track completion
  }

  private getTransitionKeyframes(transition: Transition) {
    const keyframes = {
      from: [] as Keyframe[],
      to: [] as Keyframe[]
    }

    switch (transition.type) {
      case 'fade':
        keyframes.from = [{ opacity: 1 }, { opacity: 0 }]
        keyframes.to = [{ opacity: 0 }, { opacity: 1 }]
        break
      
      case 'slide':
        switch (transition.direction) {
          case 'left':
            keyframes.from = [{ transform: 'translateX(0%)' }, { transform: 'translateX(-100%)' }]
            keyframes.to = [{ transform: 'translateX(100%)' }, { transform: 'translateX(0%)' }]
            break
          case 'right':
            keyframes.from = [{ transform: 'translateX(0%)' }, { transform: 'translateX(100%)' }]
            keyframes.to = [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0%)' }]
            break
          case 'up':
            keyframes.from = [{ transform: 'translateY(0%)' }, { transform: 'translateY(-100%)' }]
            keyframes.to = [{ transform: 'translateY(100%)' }, { transform: 'translateY(0%)' }]
            break
          case 'down':
            keyframes.from = [{ transform: 'translateY(0%)' }, { transform: 'translateY(100%)' }]
            keyframes.to = [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0%)' }]
            break
        }
        break
      
      case 'zoom':
        if (transition.direction === 'in') {
          keyframes.from = [{ transform: 'scale(1)' }, { transform: 'scale(2)', opacity: 0 }]
          keyframes.to = [{ transform: 'scale(0)' }, { transform: 'scale(1)', opacity: 1 }]
        } else {
          keyframes.from = [{ transform: 'scale(1)' }, { transform: 'scale(0)', opacity: 0 }]
          keyframes.to = [{ transform: 'scale(2)' }, { transform: 'scale(1)', opacity: 1 }]
        }
        break
      
      case 'flip':
        if (transition.direction === 'horizontal') {
          keyframes.from = [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(90deg)' }]
          keyframes.to = [{ transform: 'rotateY(-90deg)' }, { transform: 'rotateY(0deg)' }]
        } else {
          keyframes.from = [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(90deg)' }]
          keyframes.to = [{ transform: 'rotateX(-90deg)' }, { transform: 'rotateX(0deg)' }]
        }
        break
    }

    return keyframes
  }

  private cleanupTransition(fromSlide: HTMLElement, toSlide: HTMLElement) {
    // Reset styles
    fromSlide.style.display = 'none'
    fromSlide.style.position = ''
    fromSlide.style.transform = ''
    fromSlide.style.opacity = ''

    toSlide.style.position = ''
    toSlide.style.transform = ''
    toSlide.style.opacity = ''
    
    this.currentTransition = null
  }
}

// Singleton instances
export const animationEngine = new AnimationEngine()
export const transitionEngine = new TransitionEngine()