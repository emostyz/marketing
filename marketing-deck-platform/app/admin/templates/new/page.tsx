'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Layout, 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Move, 
  Settings,
  Eye,
  Type,
  BarChart3,
  Image as ImageIcon,
  List
} from 'lucide-react'

interface SlideElement {
  id: string
  type: 'title' | 'subtitle' | 'text' | 'chart' | 'image' | 'list'
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  style?: any
}

interface Slide {
  id: string
  title: string
  layout: string
  elements: SlideElement[]
}

export default function NewTemplatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    category: 'business',
    template_type: 'presentation'
  })
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 'slide-1',
      title: 'Title Slide',
      layout: 'title',
      elements: [
        {
          id: 'title-1',
          type: 'title',
          content: 'Presentation Title',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 20 }
        },
        {
          id: 'subtitle-1',
          type: 'subtitle',
          content: 'Subtitle or Date',
          position: { x: 0, y: 25 },
          size: { width: 100, height: 10 }
        }
      ]
    }
  ])
  const [activeSlide, setActiveSlide] = useState(0)
  const [designSettings, setDesignSettings] = useState({
    theme: 'professional',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    fontFamily: 'Inter',
    backgroundColor: '#FFFFFF'
  })

  const handleSaveTemplate = async () => {
    if (!template.name.trim()) {
      alert('Template name is required')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...template,
          slide_structure: slides,
          design_settings: designSettings
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/templates/${data.template.id}`)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save template')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${slides.length + 1}`,
      title: `Slide ${slides.length + 1}`,
      layout: 'content',
      elements: [
        {
          id: `title-${slides.length + 1}`,
          type: 'title',
          content: 'Slide Title',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 15 }
        },
        {
          id: `content-${slides.length + 1}`,
          type: 'text',
          content: 'Slide content goes here...',
          position: { x: 0, y: 20 },
          size: { width: 100, height: 60 }
        }
      ]
    }
    setSlides([...slides, newSlide])
    setActiveSlide(slides.length)
  }

  const removeSlide = (index: number) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index)
      setSlides(newSlides)
      if (activeSlide >= newSlides.length) {
        setActiveSlide(newSlides.length - 1)
      }
    }
  }

  const addElement = (type: SlideElement['type']) => {
    const newElement: SlideElement = {
      id: `element-${Date.now()}`,
      type,
      content: type === 'title' ? 'New Title' : 
               type === 'subtitle' ? 'New Subtitle' :
               type === 'text' ? 'New text content' :
               type === 'list' ? '• List item 1\n• List item 2' :
               type === 'chart' ? 'Chart placeholder' : 'Element content',
      position: { x: 10, y: 40 + (slides[activeSlide]?.elements.length || 0) * 15 },
      size: { 
        width: type === 'title' ? 80 : type === 'chart' ? 60 : 70, 
        height: type === 'title' ? 12 : type === 'chart' ? 40 : type === 'list' ? 25 : 10 
      }
    }

    const updatedSlides = [...slides]
    updatedSlides[activeSlide].elements.push(newElement)
    setSlides(updatedSlides)
  }

  const updateElement = (elementId: string, field: string, value: any) => {
    const updatedSlides = [...slides]
    const element = updatedSlides[activeSlide].elements.find(el => el.id === elementId)
    if (element) {
      (element as any)[field] = value
      setSlides(updatedSlides)
    }
  }

  const removeElement = (elementId: string) => {
    const updatedSlides = [...slides]
    updatedSlides[activeSlide].elements = updatedSlides[activeSlide].elements.filter(el => el.id !== elementId)
    setSlides(updatedSlides)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/templates')}
                className="border-gray-600 text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Templates
              </Button>
              <div className="flex items-center space-x-4">
                <Layout className="w-8 h-8 text-purple-500" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Create New Template</h1>
                  <p className="text-gray-400">Design a new presentation template</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={handleSaveTemplate}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Template Settings */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Template Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Name</Label>
                  <Input
                    id="name"
                    value={template.name}
                    onChange={(e) => setTemplate({...template, name: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Template name"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={template.description}
                    onChange={(e) => setTemplate({...template, description: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Template description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-gray-300">Category</Label>
                  <select
                    id="category"
                    value={template.category}
                    onChange={(e) => setTemplate({...template, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Design Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Theme</Label>
                  <select
                    value={designSettings.theme}
                    onChange={(e) => setDesignSettings({...designSettings, theme: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="professional">Professional</option>
                    <option value="modern">Modern</option>
                    <option value="minimal">Minimal</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Primary Color</Label>
                  <Input
                    type="color"
                    value={designSettings.primaryColor}
                    onChange={(e) => setDesignSettings({...designSettings, primaryColor: e.target.value})}
                    className="w-full h-10"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Secondary Color</Label>
                  <Input
                    type="color"
                    value={designSettings.secondaryColor}
                    onChange={(e) => setDesignSettings({...designSettings, secondaryColor: e.target.value})}
                    className="w-full h-10"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Slide Editor */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Slide Editor</CardTitle>
                <CardDescription>Design your template slides</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Slide Preview */}
                <div className="bg-white rounded-lg p-8 mb-6 aspect-video relative border">
                  <div className="text-black">
                    {slides[activeSlide]?.elements.map((element) => (
                      <div
                        key={element.id}
                        className="absolute cursor-pointer border border-blue-300 hover:border-blue-500"
                        style={{
                          left: `${element.position.x}%`,
                          top: `${element.position.y}%`,
                          width: `${element.size.width}%`,
                          height: `${element.size.height}%`,
                          fontSize: element.type === 'title' ? '1.5rem' : 
                                   element.type === 'subtitle' ? '1.2rem' : '1rem',
                          fontWeight: element.type === 'title' ? 'bold' : 
                                     element.type === 'subtitle' ? '600' : 'normal'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {element.type === 'chart' ? (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center border rounded">
                            <BarChart3 className="w-8 h-8 text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500">Chart</span>
                          </div>
                        ) : element.type === 'image' ? (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center border rounded">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500">Image</span>
                          </div>
                        ) : (
                          <div className="w-full h-full p-2 whitespace-pre-wrap">
                            {element.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Element Tools */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    size="sm"
                    onClick={() => addElement('title')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Type className="w-3 h-3 mr-1" />
                    Title
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addElement('subtitle')}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Type className="w-3 h-3 mr-1" />
                    Subtitle
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addElement('text')}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    <Type className="w-3 h-3 mr-1" />
                    Text
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addElement('list')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <List className="w-3 h-3 mr-1" />
                    List
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addElement('chart')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Chart
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addElement('image')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Image
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Slides Panel & Element Properties */}
          <div className="lg:col-span-1 space-y-6">
            {/* Slides List */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Slides</span>
                  <Button
                    size="sm"
                    onClick={addSlide}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`p-3 rounded border cursor-pointer flex items-center justify-between ${
                      activeSlide === index 
                        ? 'bg-purple-600/20 border-purple-500' 
                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setActiveSlide(index)}
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{slide.title}</p>
                      <p className="text-gray-400 text-xs">{slide.elements.length} elements</p>
                    </div>
                    {slides.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeSlide(index)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Element Properties */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {slides[activeSlide]?.elements.map((element) => (
                  <div
                    key={element.id}
                    className="p-3 bg-gray-700/50 rounded border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium capitalize">
                        {element.type}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => removeElement(element.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <Textarea
                      value={element.content}
                      onChange={(e) => updateElement(element.id, 'content', e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white text-xs"
                      rows={2}
                    />
                  </div>
                ))}
                {slides[activeSlide]?.elements.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    No elements on this slide. Add some elements using the tools above.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}