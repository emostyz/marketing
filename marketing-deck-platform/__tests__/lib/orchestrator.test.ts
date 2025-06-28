/**
 * @jest-environment node
 */

import { runPipeline, getPipelineStatus, resumePipeline } from '@/lib/orchestrator'

// Mock all agent functions
jest.mock('@/lib/agents/analyze-data-agent', () => ({
  analyzeDataAgent: jest.fn()
}))

jest.mock('@/lib/agents/generate-outline-agent', () => ({
  generateOutlineAgent: jest.fn()
}))

jest.mock('@/lib/agents/style-slides-agent', () => ({
  styleSlidesAgent: jest.fn()
}))

jest.mock('@/lib/agents/generate-charts-agent', () => ({
  generateChartsAgent: jest.fn()
}))

jest.mock('@/lib/agents/qa-deck-agent', () => ({
  qaDeckAgent: jest.fn()
}))

// Mock localStorage for browser environment simulation
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

// Mock window object
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('AI Pipeline Orchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('runPipeline', () => {
    const mockAnalysisResult = {
      insights: [
        {
          id: 'insight_1',
          title: 'Test Insight',
          description: 'Test description',
          confidence: 0.9,
          category: 'trend' as const,
          data: []
        }
      ],
      statistics: {
        totalRows: 10,
        totalColumns: 5,
        dataQuality: 0.95,
        completeness: 0.98
      },
      trends: [],
      recommendations: ['Test recommendation']
    }

    const mockOutlineResult = {
      presentation: {
        title: 'Test Presentation',
        subtitle: 'Test Subtitle',
        totalSlides: 5,
        estimatedDuration: 15
      },
      slides: [
        {
          id: 'slide_1',
          title: 'Test Slide',
          type: 'title',
          content: { headline: 'Test', keyMessage: 'Test message' },
          order: 1
        }
      ],
      flow: {
        narrative: 'Test narrative',
        keyMessages: ['Test message'],
        transitions: ['Test transition']
      }
    }

    const mockStyledResult = {
      styledSlides: [
        {
          id: 'slide_1',
          title: 'Test Slide',
          type: 'title',
          content: {},
          style: {
            background: { type: 'solid', value: '#ffffff' },
            typography: {},
            layout: {},
            colors: {}
          },
          order: 1
        }
      ],
      theme: {
        name: 'modern',
        colors: ['#3B82F6'],
        fonts: ['Inter'],
        style: 'Modern'
      },
      designSystem: {
        spacing: '8px',
        borderRadius: '8px',
        shadows: [],
        animations: []
      }
    }

    const mockChartsResult = {
      slidesWithCharts: [
        {
          id: 'slide_1',
          title: 'Test Slide',
          type: 'title',
          content: {},
          style: {},
          charts: [],
          elements: [],
          order: 1
        }
      ],
      chartSummary: {
        totalCharts: 1,
        chartTypes: ['bar'],
        dataPointsUsed: 10
      },
      visualizations: []
    }

    const mockQAResult = {
      qualityReport: {
        overallScore: 85,
        passed: true,
        issuesFound: 0,
        categories: {
          content: { score: 90, issues: 0 },
          design: { score: 85, issues: 0 },
          data: { score: 80, issues: 0 },
          accessibility: { score: 95, issues: 0 }
        }
      },
      issues: [],
      recommendations: ['Test recommendation'],
      approvedDeck: { slidesWithCharts: mockChartsResult.slidesWithCharts },
      metadata: {
        qaVersion: '1.0.0',
        checkedAt: new Date().toISOString(),
        totalSlides: 1,
        estimatedPresentationTime: 5
      }
    }

    it('should successfully run complete pipeline', async () => {
      const { analyzeDataAgent } = require('@/lib/agents/analyze-data-agent')
      const { generateOutlineAgent } = require('@/lib/agents/generate-outline-agent')
      const { styleSlidesAgent } = require('@/lib/agents/style-slides-agent')
      const { generateChartsAgent } = require('@/lib/agents/generate-charts-agent')
      const { qaDeckAgent } = require('@/lib/agents/qa-deck-agent')

      analyzeDataAgent.mockResolvedValue(mockAnalysisResult)
      generateOutlineAgent.mockResolvedValue(mockOutlineResult)
      styleSlidesAgent.mockResolvedValue(mockStyledResult)
      generateChartsAgent.mockResolvedValue(mockChartsResult)
      qaDeckAgent.mockResolvedValue(mockQAResult)

      const input = {
        deckId: 'test-deck-123',
        csvData: [{ col1: 'value1', col2: 'value2' }],
        context: { industry: 'tech' }
      }

      const result = await runPipeline(input)

      expect(result.status).toBe('success')
      expect(result.deckId).toBe('test-deck-123')
      expect(result.finalDeckJson).toBeTruthy()
      expect(result.steps).toHaveLength(5)
      expect(result.steps.every(step => step.status === 'completed')).toBe(true)
      expect(result.metadata.qualityScore).toBe(85)

      // Verify all agents were called
      expect(analyzeDataAgent).toHaveBeenCalledWith({
        csvData: input.csvData,
        context: input.context
      })
      expect(generateOutlineAgent).toHaveBeenCalledWith({
        analysisData: mockAnalysisResult,
        context: expect.any(Object)
      })
      expect(styleSlidesAgent).toHaveBeenCalledWith({
        slideOutline: mockOutlineResult,
        stylePreferences: undefined
      })
      expect(generateChartsAgent).toHaveBeenCalledWith({
        styledSlides: mockStyledResult.styledSlides,
        csvData: input.csvData
      })
      expect(qaDeckAgent).toHaveBeenCalledWith({
        finalDeck: expect.any(Object)
      })
    })

    it('should handle agent failure and return failed status', async () => {
      const { analyzeDataAgent } = require('@/lib/agents/analyze-data-agent')
      
      analyzeDataAgent.mockRejectedValue(new Error('Analysis failed'))

      const input = {
        deckId: 'test-deck-123',
        csvData: [{ col1: 'value1' }]
      }

      const result = await runPipeline(input)

      expect(result.status).toBe('failed')
      expect(result.finalDeckJson).toBeNull()
      expect(result.steps[0].status).toBe('failed')
      expect(result.steps[0].error).toBe('Analysis failed')
    })

    it('should handle retryable errors', async () => {
      const { analyzeDataAgent } = require('@/lib/agents/analyze-data-agent')
      
      // Mock to fail first time with retryable error, then succeed
      analyzeDataAgent
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce(mockAnalysisResult)

      const { generateOutlineAgent } = require('@/lib/agents/generate-outline-agent')
      const { styleSlidesAgent } = require('@/lib/agents/style-slides-agent')
      const { generateChartsAgent } = require('@/lib/agents/generate-charts-agent')
      const { qaDeckAgent } = require('@/lib/agents/qa-deck-agent')

      generateOutlineAgent.mockResolvedValue(mockOutlineResult)
      styleSlidesAgent.mockResolvedValue(mockStyledResult)
      generateChartsAgent.mockResolvedValue(mockChartsResult)
      qaDeckAgent.mockResolvedValue(mockQAResult)

      const input = {
        deckId: 'test-deck-123',
        csvData: [{ col1: 'value1' }]
      }

      const result = await runPipeline(input)

      expect(result.status).toBe('success')
      expect(analyzeDataAgent).toHaveBeenCalledTimes(2) // Called twice due to retry
    })

    it('should save intermediate results to localStorage', async () => {
      const { analyzeDataAgent } = require('@/lib/agents/analyze-data-agent')
      const { generateOutlineAgent } = require('@/lib/agents/generate-outline-agent')
      const { styleSlidesAgent } = require('@/lib/agents/style-slides-agent')
      const { generateChartsAgent } = require('@/lib/agents/generate-charts-agent')
      const { qaDeckAgent } = require('@/lib/agents/qa-deck-agent')

      analyzeDataAgent.mockResolvedValue(mockAnalysisResult)
      generateOutlineAgent.mockResolvedValue(mockOutlineResult)
      styleSlidesAgent.mockResolvedValue(mockStyledResult)
      generateChartsAgent.mockResolvedValue(mockChartsResult)
      qaDeckAgent.mockResolvedValue(mockQAResult)

      const input = {
        deckId: 'test-deck-123',
        csvData: [{ col1: 'value1' }]
      }

      await runPipeline(input)

      // Verify intermediate results were saved
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pipeline_test-deck-123_analysis',
        expect.stringContaining('"insights"')
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pipeline_test-deck-123_outline',
        expect.stringContaining('"presentation"')
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pipeline_test-deck-123_styled',
        expect.stringContaining('"styledSlides"')
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pipeline_test-deck-123_charts',
        expect.stringContaining('"slidesWithCharts"')
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pipeline_test-deck-123_qa',
        expect.stringContaining('"qualityReport"')
      )
    })
  })

  describe('getPipelineStatus', () => {
    it('should return null when no status exists', async () => {
      const status = await getPipelineStatus('non-existent-deck')
      expect(status).toBeNull()
    })

    it('should return completed status when QA data exists', async () => {
      localStorageMock.setItem('pipeline_test-deck-123_qa', JSON.stringify({
        data: { qualityReport: { overallScore: 90 } },
        timestamp: new Date().toISOString()
      }))

      const status = await getPipelineStatus('test-deck-123')
      
      expect(status).toHaveLength(5)
      expect(status?.every(step => step.status === 'completed')).toBe(true)
    })

    it('should return error status when error data exists', async () => {
      const errorSteps = [
        { step: 1, name: 'Data Analysis', status: 'failed', error: 'Test error' }
      ]

      localStorageMock.setItem('pipeline_test-deck-123_error', JSON.stringify({
        data: { steps: errorSteps },
        timestamp: new Date().toISOString()
      }))

      const status = await getPipelineStatus('test-deck-123')
      
      expect(status).toEqual(errorSteps)
    })
  })

  describe('resumePipeline', () => {
    it('should restart the pipeline', async () => {
      const { analyzeDataAgent } = require('@/lib/agents/analyze-data-agent')
      
      analyzeDataAgent.mockResolvedValue({
        insights: [],
        statistics: { totalRows: 5, totalColumns: 3, dataQuality: 0.95, completeness: 0.98 },
        trends: [],
        recommendations: []
      })

      const input = {
        deckId: 'test-deck-123',
        csvData: [{ col1: 'value1' }]
      }

      const result = await resumePipeline('test-deck-123', input)

      expect(result.deckId).toBe('test-deck-123')
      expect(analyzeDataAgent).toHaveBeenCalled()
    })
  })
})