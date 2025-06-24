'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Square, SkipBack, SkipForward, Plus, Trash2, Clock } from 'lucide-react'
import { useAnimationStore, AnimationKeyframe, ElementAnimation } from '@/lib/animations/animation-engine'

interface AnimationTimelineProps {
  slideId: string
  elements: Array<{ id: string; name: string }>
  onElementUpdate: (elementId: string, properties: any) => void
}

export function AnimationTimeline({ slideId, elements, onElementUpdate }: AnimationTimelineProps) {
  const {
    timelines,
    activeTimelineId,
    isRecording,
    createTimeline,
    addAnimation,
    addKeyframe,
    playTimeline,
    pauseTimeline,
    seekTimeline,
    setRecording
  } = useAnimationStore()

  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null)
  const [playhead, setPlayhead] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)

  const activeTimeline = timelines.find(t => t.id === activeTimelineId)

  useEffect(() => {
    if (!activeTimeline && timelines.length === 0) {
      createTimeline(slideId)
    }
  }, [slideId, activeTimeline, timelines.length, createTimeline])

  const handlePlay = () => {
    if (!activeTimeline) return
    
    if (activeTimeline.isPlaying) {
      pauseTimeline(activeTimeline.id)
    } else {
      playTimeline(activeTimeline.id)
    }
  }

  const handleSeek = (e: React.MouseEvent) => {
    if (!activeTimeline || !timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    const time = (percentage / 100) * activeTimeline.duration

    seekTimeline(activeTimeline.id, time)
    setPlayhead(percentage)
  }

  const addKeyframeAtTime = (animationId: string, time: number) => {
    const animation = activeTimeline?.animations.find(a => a.id === animationId)
    if (!animation) return

    const element = elements.find(e => e.id === animation.elementId)
    if (!element) return

    const keyframe: Omit<AnimationKeyframe, 'id'> = {
      time: (time / activeTimeline!.duration) * 100,
      properties: {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        scale: 1
      },
      easing: 'ease-in-out'
    }

    addKeyframe(animationId, keyframe)
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const centiseconds = Math.floor((ms % 1000) / 10)
    return `${seconds}.${centiseconds.toString().padStart(2, '0')}s`
  }

  return (
    <div className="bg-gray-900 text-white border-t border-gray-700">
      {/* Timeline Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlay}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {activeTimeline?.isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          
          <button
            onClick={() => activeTimeline && seekTimeline(activeTimeline.id, 0)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={() => activeTimeline && seekTimeline(activeTimeline.id, activeTimeline.duration)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <SkipForward size={18} />
          </button>

          <div className="text-sm text-gray-300 flex items-center gap-1">
            <Clock size={14} />
            {activeTimeline ? formatTime(activeTimeline.currentTime) : '0.00s'} / {activeTimeline ? formatTime(activeTimeline.duration) : '5.00s'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRecording(!isRecording)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {isRecording ? 'Recording' : 'Record'}
          </button>

          <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm">
            <option>1x Speed</option>
            <option>0.5x Speed</option>
            <option>2x Speed</option>
          </select>
        </div>
      </div>

      {/* Animation Tracks */}
      <div className="flex h-64">
        {/* Element List */}
        <div className="w-48 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300">Elements</h3>
          </div>
          
          {elements.map(element => {
            const hasAnimation = activeTimeline?.animations.some(a => a.elementId === element.id)
            
            return (
              <div
                key={element.id}
                className="flex items-center justify-between p-3 hover:bg-gray-700 cursor-pointer"
                onClick={() => !hasAnimation && activeTimeline && addAnimation(activeTimeline.id, element.id)}
              >
                <span className="text-sm truncate">{element.name}</span>
                {!hasAnimation && (
                  <Plus size={14} className="text-gray-400" />
                )}
              </div>
            )
          })}
        </div>

        {/* Timeline Canvas */}
        <div className="flex-1 relative">
          {/* Time Ruler */}
          <div className="h-8 bg-gray-800 border-b border-gray-700 relative">
            {Array.from({ length: 11 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full border-l border-gray-600"
                style={{ left: `${i * 10}%` }}
              >
                <span className="absolute top-1 left-1 text-xs text-gray-400">
                  {formatTime((i / 10) * (activeTimeline?.duration || 5000))}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline Tracks */}
          <div
            ref={timelineRef}
            className="relative h-56 overflow-y-auto cursor-crosshair"
            onClick={handleSeek}
          >
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
              style={{ left: `${playhead}%` }}
            />

            {activeTimeline?.animations.map((animation, index) => (
              <AnimationTrack
                key={animation.id}
                animation={animation}
                index={index}
                timelineDuration={activeTimeline.duration}
                onAddKeyframe={(time) => addKeyframeAtTime(animation.id, time)}
                isSelected={selectedAnimation === animation.id}
                onSelect={() => setSelectedAnimation(animation.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedAnimation && (
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <h4 className="text-sm font-semibold mb-3">Animation Properties</h4>
          
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Duration</label>
              <input
                type="number"
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                placeholder="1000ms"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Delay</label>
              <input
                type="number"
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                placeholder="0ms"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Easing</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
                <option value="ease-in-out">Ease In Out</option>
                <option value="linear">Linear</option>
                <option value="ease-in">Ease In</option>
                <option value="ease-out">Ease Out</option>
                <option value="bounce">Bounce</option>
                <option value="elastic">Elastic</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Loop
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface AnimationTrackProps {
  animation: ElementAnimation
  index: number
  timelineDuration: number
  onAddKeyframe: (time: number) => void
  isSelected: boolean
  onSelect: () => void
}

function AnimationTrack({ 
  animation, 
  index, 
  timelineDuration, 
  onAddKeyframe, 
  isSelected, 
  onSelect 
}: AnimationTrackProps) {
  return (
    <div
      className={`h-12 border-b border-gray-700 relative ${
        isSelected ? 'bg-blue-900/30' : 'hover:bg-gray-800'
      }`}
      onClick={onSelect}
    >
      {/* Keyframes */}
      {animation.keyframes.map(keyframe => (
        <div
          key={keyframe.id}
          className="absolute top-2 bottom-2 w-2 bg-blue-500 rounded cursor-pointer hover:bg-blue-400"
          style={{ left: `${keyframe.time}%` }}
          title={`${keyframe.time.toFixed(1)}%`}
        />
      ))}

      {/* Animation Duration Bar */}
      <div
        className="absolute top-4 h-4 bg-green-500/30 border border-green-500 rounded"
        style={{
          left: `${(animation.delay / timelineDuration) * 100}%`,
          width: `${(animation.duration / timelineDuration) * 100}%`
        }}
      />
    </div>
  )
}