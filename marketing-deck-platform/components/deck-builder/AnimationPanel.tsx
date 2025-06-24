'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, Plus, Trash2, Edit, Clock, Zap, Eye,
  ChevronDown, ChevronRight, MoreVertical, Copy, Move
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Animation, 
  Transition, 
  ANIMATION_PRESETS, 
  TRANSITION_PRESETS,
  animationEngine,
  transitionEngine
} from '@/lib/animations-system'

interface AnimationPanelProps {
  selectedElements: string[]
  slideId: string
  animations: Animation[]
  slideTransition?: Transition
  onAddAnimation: (animation: Omit<Animation, 'id'>) => void
  onUpdateAnimation: (animationId: string, updates: Partial<Animation>) => void
  onDeleteAnimation: (animationId: string) => void
  onUpdateTransition: (transition: Transition) => void
  onPreviewAnimations: () => void
}

export function AnimationPanel({
  selectedElements,
  slideId,
  animations,
  slideTransition,
  onAddAnimation,
  onUpdateAnimation,
  onDeleteAnimation,
  onUpdateTransition,
  onPreviewAnimations
}: AnimationPanelProps) {
  const [activeTab, setActiveTab] = useState<'animations' | 'transitions'>('animations')
  const [selectedAnimationType, setSelectedAnimationType] = useState<'entrance' | 'emphasis' | 'exit'>('entrance')
  const [expandedAnimation, setExpandedAnimation] = useState<string | null>(null)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)

  const elementAnimations = animations.filter(anim => 
    selectedElements.length === 0 || selectedElements.includes(anim.elementId)
  )

  const handleAddAnimation = (presetId: string) => {
    if (selectedElements.length === 0) return

    const allPresets = [
      ...ANIMATION_PRESETS.entrance,
      ...ANIMATION_PRESETS.emphasis,
      ...ANIMATION_PRESETS.exit
    ]
    
    const preset = allPresets.find(p => p.id === presetId)
    if (!preset) return

    const newAnimation: Omit<Animation, 'id'> = {
      name: preset.name,
      type: selectedAnimationType,
      elementId: selectedElements[0], // Apply to first selected element
      duration: preset.duration,
      delay: 0,
      easing: preset.easing,
      properties: preset.properties,
      trigger: 'auto',
      order: animations.length + 1
    }

    onAddAnimation(newAnimation)
  }

  const handlePreviewAnimation = async (animationId: string) => {
    const animation = animations.find(a => a.id === animationId)
    if (!animation) return

    setIsPreviewPlaying(true)
    
    // Create temporary animation for preview
    const tempAnimation = { ...animation }
    animationEngine.addAnimation(tempAnimation)
    
    try {
      await animationEngine.playSlideAnimations(slideId, 'auto')
    } catch (error) {
      console.error('Animation preview error:', error)
    }
    
    animationEngine.removeAnimation(tempAnimation.id)
    setIsPreviewPlaying(false)
  }

  const handlePreviewAllAnimations = async () => {
    setIsPreviewPlaying(true)
    
    try {
      // Add all animations to engine
      animations.forEach(anim => animationEngine.addAnimation(anim))
      await animationEngine.playSlideAnimations(slideId, 'auto')
      
      // Clean up
      animations.forEach(anim => animationEngine.removeAnimation(anim.id))
    } catch (error) {
      console.error('Animation preview error:', error)
    }
    
    setIsPreviewPlaying(false)
  }

  const renderAnimationsList = () => (
    <div className="space-y-2">
      {elementAnimations.map((animation, index) => (
        <Card key={animation.id} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-center">
                  <Badge variant="outline" className="text-xs mb-1">
                    {index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setExpandedAnimation(
                      expandedAnimation === animation.id ? null : animation.id
                    )}
                  >
                    {expandedAnimation === animation.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{animation.name}</span>
                    <Badge 
                      variant={animation.type === 'entrance' ? 'default' : 
                              animation.type === 'emphasis' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {animation.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {animation.duration}s delay: {animation.delay}s
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePreviewAnimation(animation.id)}
                  disabled={isPreviewPlaying}
                >
                  <Play className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onDeleteAnimation(animation.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {expandedAnimation === animation.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 pt-3 border-t border-gray-200"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Duration (seconds)</Label>
                      <div className="mt-1">
                        <Slider
                          value={[animation.duration]}
                          onValueChange={(value) => 
                            onUpdateAnimation(animation.id, { duration: value[0] })
                          }
                          min={0.1}
                          max={3}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {animation.duration}s
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Delay (seconds)</Label>
                      <div className="mt-1">
                        <Slider
                          value={[animation.delay]}
                          onValueChange={(value) => 
                            onUpdateAnimation(animation.id, { delay: value[0] })
                          }
                          min={0}
                          max={2}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {animation.delay}s
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Label className="text-xs">Trigger</Label>
                    <Select 
                      value={animation.trigger} 
                      onValueChange={(value: any) => 
                        onUpdateAnimation(animation.id, { trigger: value })
                      }
                    >
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automatic</SelectItem>
                        <SelectItem value="click">On Click</SelectItem>
                        <SelectItem value="previous">With Previous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      ))}
      
      {elementAnimations.length === 0 && (
        <div className="text-center py-8">
          <Zap className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">
            {selectedElements.length === 0 
              ? 'Select an element to add animations'
              : 'No animations added yet'
            }
          </p>
        </div>
      )}
    </div>
  )

  const renderAnimationPresets = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Animation Type</Label>
        <Tabs value={selectedAnimationType} onValueChange={(value: any) => setSelectedAnimationType(value)} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entrance" className="text-xs">Entrance</TabsTrigger>
            <TabsTrigger value="emphasis" className="text-xs">Emphasis</TabsTrigger>
            <TabsTrigger value="exit" className="text-xs">Exit</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <Label className="text-sm font-medium">Available Animations</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {ANIMATION_PRESETS[selectedAnimationType].map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              className="h-auto p-3 flex flex-col items-start space-y-1"
              onClick={() => handleAddAnimation(preset.id)}
              disabled={selectedElements.length === 0}
            >
              <span className="font-medium text-xs">{preset.name}</span>
              <span className="text-xs text-gray-500 text-left">
                {preset.description}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTransitionsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Slide Transition</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Preview transition
            console.log('Preview transition')
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>

      <div>
        <Label className="text-xs">Transition Effect</Label>
        <Select 
          value={slideTransition?.id || 'none'} 
          onValueChange={(value) => {
            const transition = TRANSITION_PRESETS.find(t => t.id === value)
            if (transition) {
              onUpdateTransition({
                id: transition.id,
                name: transition.name,
                type: transition.type as any,
                direction: transition.direction as any,
                duration: transition.duration || 0.5,
                easing: transition.easing || 'ease-in-out'
              })
            }
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSITION_PRESETS.map((transition) => (
              <SelectItem key={transition.id} value={transition.id}>
                {transition.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {slideTransition && slideTransition.id !== 'none' && (
          <p className="text-xs text-gray-500 mt-1">
            {TRANSITION_PRESETS.find(t => t.id === slideTransition.id)?.description}
          </p>
        )}
      </div>

      {slideTransition && slideTransition.id !== 'none' && (
        <div>
          <Label className="text-xs">Duration (seconds)</Label>
          <div className="mt-1">
            <Slider
              value={[slideTransition.duration]}
              onValueChange={(value) => 
                onUpdateTransition({ ...slideTransition, duration: value[0] })
              }
              min={0.1}
              max={2}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              {slideTransition.duration}s
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Transition Preview</h4>
        <div className="grid grid-cols-3 gap-2">
          {TRANSITION_PRESETS.slice(1, 7).map((transition) => (
            <Button
              key={transition.id}
              variant={slideTransition?.id === transition.id ? 'default' : 'outline'}
              size="sm"
              className="h-auto p-2 text-xs"
              onClick={() => onUpdateTransition({
                id: transition.id,
                name: transition.name,
                type: transition.type as any,
                direction: transition.direction as any,
                duration: transition.duration || 0.5,
                easing: transition.easing || 'ease-in-out'
              })}
            >
              {transition.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Animations</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviewAllAnimations}
            disabled={isPreviewPlaying || animations.length === 0}
          >
            {isPreviewPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviewAnimations}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 m-4">
          <TabsTrigger value="animations">Element Animations</TabsTrigger>
          <TabsTrigger value="transitions">Slide Transitions</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="animations" className="h-full p-4 pt-0">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Current Animations</Label>
                    <Badge variant="secondary" className="text-xs">
                      {elementAnimations.length}
                    </Badge>
                  </div>
                  {renderAnimationsList()}
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium mb-3 block">Add New Animation</Label>
                  {renderAnimationPresets()}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="transitions" className="h-full p-4 pt-0">
            <ScrollArea className="h-full">
              {renderTransitionsTab()}
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}