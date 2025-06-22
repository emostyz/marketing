"use client"
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { DeckPersistence, DeckDraft, DeckSlide } from '@/lib/deck-persistence'
import { Brain, Save, Plus, Trash2, Download, Eye, Settings, BarChart3, FileText, Image, TrendingUp } from 'lucide-react'

interface PersistentDeckBuilderProps {
  draftId?: string
  initialData?: Partial<DeckDraft>
}

export default function PersistentDeckBuilder({ draftId, initialData }: PersistentDeckBuilderProps) {
  const { user } = useAuth()
  const router = useRouter()
  
  const [draft, setDraft] = useState<DeckDraft | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [showChartGenerator, setShowChartGenerator] = useState(false)
  const [chartGenerationData, setChartGenerationData] = useState<any>(null)

  // Load draft on mount
  useEffect(() => {
    loadDraft()
  }, [draftId])

  // Set up auto-save
  useEffect(() => {
    if (!autoSaveEnabled || !draft) return

    const cleanup = DeckPersistence.setupAutoSave(draft.id, () => draft)
    return cleanup
  }, [draft, autoSaveEnabled])

  const loadDraft = async () => {
    try {
      setLoading(true)
      setError('')

      if (draftId) {
        // Load existing draft
        const loadedDraft = await DeckPersistence.loadDraft(draftId)
        if (loadedDraft) {
          setDraft(loadedDraft)
        } else {
          setError('Draft not found')
        }
      } else if (initialData) {
        // Create new draft from initial data
        const newDraft = await DeckPersistence.saveDraft(initialData)
        if (newDraft) {
          setDraft(newDraft)
          router.push(`/deck-builder/${newDraft.id}`)
        } else {
          setError('Failed to create draft')
        }
      } else {
        // Create empty draft
        const emptyDraft = await DeckPersistence.saveDraft({
          title: 'Untitled Presentation',
          slides: [
            {
              id: crypto.randomUUID(),
              type: 'title',
              title: 'Title Slide',
              content: 'Your Presentation Title',
              order: 0
            }
          ]
        })
        if (emptyDraft) {
          setDraft(emptyDraft)
          router.push(`/deck-builder/${emptyDraft.id}`)
        } else {
          setError('Failed to create draft')
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error)
      setError('Failed to load draft')
    } finally {
      setLoading(false)
    }
  }

  const saveDraft = async (draftData?: Partial<DeckDraft>) => {
    if (!draft) return

    try {
      setSaving(true)
      const dataToSave = draftData || draft
      const savedDraft = await DeckPersistence.saveDraft({
        ...dataToSave,
        lastEditedAt: new Date()
      })

      if (savedDraft) {
        setDraft(savedDraft)
        // Track save activity
        await DeckPersistence.trackUserActivity('draft_saved', {
          draftId: savedDraft.id,
          title: savedDraft.title
        })
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      setError('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const addSlide = async (type: DeckSlide['type'] = 'content') => {
    if (!draft) return

    const newSlide: DeckSlide = {
      id: crypto.randomUUID(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Slide`,
      content: '',
      order: draft.slides.length
    }

    const updatedDraft = {
      ...draft,
      slides: [...draft.slides, newSlide]
    }

    setDraft(updatedDraft)
    setSelectedSlideIndex(updatedDraft.slides.length - 1)
    await saveDraft(updatedDraft)
  }

  const updateSlide = async (slideId: string, updates: Partial<DeckSlide>) => {
    if (!draft) return

    const updatedSlides = draft.slides.map(slide =>
      slide.id === slideId ? { ...slide, ...updates } : slide
    )

    const updatedDraft = {
      ...draft,
      slides: updatedSlides
    }

    setDraft(updatedDraft)
    await saveDraft(updatedDraft)
  }

  const deleteSlide = async (slideId: string) => {
    if (!draft || draft.slides.length <= 1) return

    const updatedSlides = draft.slides
      .filter(slide => slide.id !== slideId)
      .map((slide, index) => ({ ...slide, order: index }))

    const updatedDraft = {
      ...draft,
      slides: updatedSlides
    }

    setDraft(updatedDraft)
    if (selectedSlideIndex >= updatedSlides.length) {
      setSelectedSlideIndex(updatedSlides.length - 1)
    }
    await saveDraft(updatedDraft)
  }

  const generateChart = async (slideId: string, chartData: any) => {
    if (!draft || !user?.profile) return

    try {
      const response = await DeckPersistence.generateChart({
        slideId,
        dataType: chartData.dataType,
        chartType: chartData.chartType,
        data: chartData.data,
        userPreferences: user.profile.dataPreferences || {
          chartStyles: ['modern', 'clean'],
          colorSchemes: ['blue', 'green'],
          narrativeStyle: 'professional'
        },
        businessContext: user.profile.businessContext || ''
      })

      if (response.success && response.chartData) {
        // Update the slide with generated chart
        await updateSlide(slideId, {
          chartData: response.chartData,
          chartConfig: response.chartConfig,
          content: response.narrative || '',
          type: 'chart'
        })

        // Track chart generation
        await DeckPersistence.trackUserActivity('chart_generated', {
          slideId,
          chartType: chartData.chartType,
          success: true
        })
      } else {
        setError(response.error || 'Failed to generate chart')
      }
    } catch (error) {
      console.error('Error generating chart:', error)
      setError('Failed to generate chart')
    }
  }

  const getAIFeedback = async () => {
    if (!draft) return

    try {
      const feedback = await DeckPersistence.getDeckFeedback(draft)
      if (feedback.success) {
        // Update draft with AI feedback
        const updatedDraft = {
          ...draft,
          aiFeedback: feedback.feedback
        }
        setDraft(updatedDraft)
        await saveDraft(updatedDraft)
      }
    } catch (error) {
      console.error('Error getting AI feedback:', error)
      setError('Failed to get AI feedback')
    }
  }

  const exportDeck = async (format: 'pdf' | 'pptx' | 'html') => {
    if (!draft) return

    try {
      const result = await DeckPersistence.exportDeck(draft.id, format)
      if (result?.success && result.downloadUrl) {
        window.open(result.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error)
      setError(`Failed to export to ${format}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading deck builder...</p>
        </div>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Failed to load draft'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const selectedSlide = draft.slides[selectedSlideIndex]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Brain className="w-8 h-8 text-blue-400" />
            <input
              type="text"
              value={draft.title}
              onChange={(e) => {
                const updatedDraft = { ...draft, title: e.target.value }
                setDraft(updatedDraft)
                saveDraft(updatedDraft)
              }}
              className="bg-transparent text-xl font-bold border-none outline-none focus:ring-0"
              placeholder="Untitled Presentation"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`px-3 py-1 rounded text-sm ${
                autoSaveEnabled ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              {autoSaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}
            </button>
            
            <button
              onClick={() => saveDraft()}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={() => getAIFeedback()}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              AI Feedback
            </button>

            <button
              onClick={() => exportDeck('pdf')}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Slide Navigator */}
        <div className="w-64 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Slides</h3>
            <button
              onClick={() => addSlide()}
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {draft.slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => setSelectedSlideIndex(index)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  index === selectedSlideIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {slide.type === 'chart' && <BarChart3 className="w-4 h-4" />}
                    {slide.type === 'content' && <FileText className="w-4 h-4" />}
                    {slide.type === 'title' && <Image className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {slide.title || `Slide ${index + 1}`}
                    </span>
                  </div>
                  {draft.slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSlide(slide.id)
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h4 className="font-semibold mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => addSlide('chart')}
                className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded text-sm flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Add Chart
              </button>
              <button
                onClick={() => addSlide('content')}
                className="w-full bg-green-600 hover:bg-green-700 p-2 rounded text-sm flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Add Content
              </button>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {selectedSlide && (
            <div className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                {/* Slide Editor */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {selectedSlide.type.charAt(0).toUpperCase() + selectedSlide.type.slice(1)} Slide
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowChartGenerator(!showChartGenerator)}
                        className={`px-3 py-1 rounded text-sm ${
                          showChartGenerator ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        Chart Generator
                      </button>
                    </div>
                  </div>

                  {/* Title Input */}
                  <input
                    type="text"
                    value={selectedSlide.title}
                    onChange={(e) => updateSlide(selectedSlide.id, { title: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 mb-4 text-white"
                    placeholder="Slide title"
                  />

                  {/* Content Editor */}
                  <textarea
                    value={selectedSlide.content}
                    onChange={(e) => updateSlide(selectedSlide.id, { content: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 h-32 resize-none text-white"
                    placeholder="Slide content..."
                  />

                  {/* Chart Generator */}
                  {showChartGenerator && selectedSlide.type === 'chart' && (
                    <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                      <h4 className="font-semibold mb-3">AI Chart Generator</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Chart Type</label>
                          <select
                            value={chartGenerationData?.chartType || 'bar'}
                            onChange={(e) => setChartGenerationData({
                              ...chartGenerationData,
                              chartType: e.target.value
                            })}
                            className="w-full bg-gray-600 border border-gray-500 rounded p-2"
                          >
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="pie">Pie Chart</option>
                            <option value="scatter">Scatter Plot</option>
                            <option value="area">Area Chart</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Data Type</label>
                          <select
                            value={chartGenerationData?.dataType || 'sales'}
                            onChange={(e) => setChartGenerationData({
                              ...chartGenerationData,
                              dataType: e.target.value
                            })}
                            className="w-full bg-gray-600 border border-gray-500 rounded p-2"
                          >
                            <option value="sales">Sales Data</option>
                            <option value="marketing">Marketing Data</option>
                            <option value="financial">Financial Data</option>
                            <option value="user">User Data</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => generateChart(selectedSlide.id, chartGenerationData)}
                        className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
                      >
                        Generate Chart with AI
                      </button>
                    </div>
                  )}

                  {/* Chart Display */}
                  {selectedSlide.chartData && (
                    <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                      <h4 className="font-semibold mb-3">Generated Chart</h4>
                      <div className="bg-white rounded p-4 text-gray-900">
                        <p className="text-sm text-gray-600">Chart visualization would appear here</p>
                        <p className="text-xs mt-2">Chart Type: {selectedSlide.chartType}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Feedback Display */}
                {draft.aiFeedback && draft.aiFeedback.suggestions.length > 0 && (
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">AI Suggestions</h4>
                    <ul className="space-y-1">
                      {draft.aiFeedback.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-blue-200 text-sm">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-900/90 border border-red-700 text-red-200 px-4 py-3 rounded-lg max-w-md">
          <p>{error}</p>
          <button
            onClick={() => setError('')}
            className="text-red-300 hover:text-red-100 text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
} 