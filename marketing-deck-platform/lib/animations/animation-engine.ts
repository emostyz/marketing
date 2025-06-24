import { create } from 'zustand'

export interface AnimationKeyframe {
  id: string
  time: number // 0-100 percentage of timeline
  properties: {
    x?: number
    y?: number
    width?: number
    height?: number
    rotation?: number
    opacity?: number
    scale?: number
    [key: string]: any
  }
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic'
}

export interface ElementAnimation {
  id: string
  elementId: string
  keyframes: AnimationKeyframe[]
  duration: number // in milliseconds
  delay: number
  loop: boolean
  autoplay: boolean
}

export interface AnimationTimeline {
  id: string
  duration: number
  animations: ElementAnimation[]
  isPlaying: boolean
  currentTime: number
  playbackRate: number
}

interface AnimationState {
  timelines: AnimationTimeline[]
  activeTimelineId: string | null
  isRecording: boolean
  
  // Actions
  createTimeline: (slideId: string) => void
  addAnimation: (timelineId: string, elementId: string) => void
  addKeyframe: (animationId: string, keyframe: Omit<AnimationKeyframe, 'id'>) => void
  updateKeyframe: (keyframeId: string, updates: Partial<AnimationKeyframe>) => void
  deleteKeyframe: (keyframeId: string) => void
  playTimeline: (timelineId: string) => void
  pauseTimeline: (timelineId: string) => void
  seekTimeline: (timelineId: string, time: number) => void
  setRecording: (recording: boolean) => void
}

export const useAnimationStore = create<AnimationState>((set, get) => ({
  timelines: [],
  activeTimelineId: null,
  isRecording: false,

  createTimeline: (slideId: string) => {
    const timeline: AnimationTimeline = {
      id: `timeline-${slideId}-${Date.now()}`,
      duration: 5000, // 5 seconds default
      animations: [],
      isPlaying: false,
      currentTime: 0,
      playbackRate: 1
    }
    
    set(state => ({
      timelines: [...state.timelines, timeline],
      activeTimelineId: timeline.id
    }))
  },

  addAnimation: (timelineId: string, elementId: string) => {
    const animation: ElementAnimation = {
      id: `anim-${elementId}-${Date.now()}`,
      elementId,
      keyframes: [],
      duration: 1000,
      delay: 0,
      loop: false,
      autoplay: true
    }

    set(state => ({
      timelines: state.timelines.map(timeline =>
        timeline.id === timelineId
          ? { ...timeline, animations: [...timeline.animations, animation] }
          : timeline
      )
    }))
  },

  addKeyframe: (animationId: string, keyframe: Omit<AnimationKeyframe, 'id'>) => {
    const newKeyframe: AnimationKeyframe = {
      ...keyframe,
      id: `keyframe-${Date.now()}`
    }

    set(state => ({
      timelines: state.timelines.map(timeline => ({
        ...timeline,
        animations: timeline.animations.map(animation =>
          animation.id === animationId
            ? { ...animation, keyframes: [...animation.keyframes, newKeyframe] }
            : animation
        )
      }))
    }))
  },

  updateKeyframe: (keyframeId: string, updates: Partial<AnimationKeyframe>) => {
    set(state => ({
      timelines: state.timelines.map(timeline => ({
        ...timeline,
        animations: timeline.animations.map(animation => ({
          ...animation,
          keyframes: animation.keyframes.map(keyframe =>
            keyframe.id === keyframeId
              ? { ...keyframe, ...updates }
              : keyframe
          )
        }))
      }))
    }))
  },

  deleteKeyframe: (keyframeId: string) => {
    set(state => ({
      timelines: state.timelines.map(timeline => ({
        ...timeline,
        animations: timeline.animations.map(animation => ({
          ...animation,
          keyframes: animation.keyframes.filter(k => k.id !== keyframeId)
        }))
      }))
    }))
  },

  playTimeline: (timelineId: string) => {
    set(state => ({
      timelines: state.timelines.map(timeline =>
        timeline.id === timelineId
          ? { ...timeline, isPlaying: true }
          : timeline
      )
    }))
  },

  pauseTimeline: (timelineId: string) => {
    set(state => ({
      timelines: state.timelines.map(timeline =>
        timeline.id === timelineId
          ? { ...timeline, isPlaying: false }
          : timeline
      )
    }))
  },

  seekTimeline: (timelineId: string, time: number) => {
    set(state => ({
      timelines: state.timelines.map(timeline =>
        timeline.id === timelineId
          ? { ...timeline, currentTime: Math.max(0, Math.min(time, timeline.duration)) }
          : timeline
      )
    }))
  },

  setRecording: (recording: boolean) => {
    set({ isRecording: recording })
  }
}))

export class AnimationEngine {
  private rafId: number | null = null
  private startTime: number | null = null

  playAnimation(timeline: AnimationTimeline, onUpdate: (time: number) => void) {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }

    this.startTime = performance.now() - timeline.currentTime
    
    const animate = (currentTime: number) => {
      if (!this.startTime) return

      const elapsed = (currentTime - this.startTime) * timeline.playbackRate
      const progress = Math.min(elapsed / timeline.duration, 1)

      onUpdate(elapsed)

      if (progress < 1 && timeline.isPlaying) {
        this.rafId = requestAnimationFrame(animate)
      }
    }

    this.rafId = requestAnimationFrame(animate)
  }

  stopAnimation() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.startTime = null
  }

  interpolateValue(
    startValue: number,
    endValue: number,
    progress: number,
    easing: AnimationKeyframe['easing']
  ): number {
    const easedProgress = this.applyEasing(progress, easing)
    return startValue + (endValue - startValue) * easedProgress
  }

  private applyEasing(t: number, easing: AnimationKeyframe['easing']): number {
    switch (easing) {
      case 'linear':
        return t
      case 'ease-in':
        return t * t
      case 'ease-out':
        return 1 - (1 - t) * (1 - t)
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      case 'bounce':
        const n1 = 7.5625
        const d1 = 2.75
        if (t < 1 / d1) {
          return n1 * t * t
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375
        }
      case 'elastic':
        const c4 = (2 * Math.PI) / 3
        return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
      default:
        return t
    }
  }
}