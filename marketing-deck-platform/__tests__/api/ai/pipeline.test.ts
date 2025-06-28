/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'

// Mock the orchestrator functions
jest.mock('@/lib/orchestrator', () => ({
  runPipeline: jest.fn(),
  getPipelineStatus: jest.fn(),
  resumePipeline: jest.fn()
}))

// Mock agent functions
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

describe('AI Pipeline API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('/api/ai/run-pipeline', () => {
    const { POST, GET, PUT } = require('@/app/api/ai/run-pipeline/route')
    const { runPipeline, getPipelineStatus, resumePipeline } = require('@/lib/orchestrator')

    describe('POST /api/ai/run-pipeline', () => {
      it('should start pipeline with valid input', async () => {
        const mockResult = {
          deckId: 'test-deck-123',
          status: 'success',
          finalDeckJson: { slides: [] },
          steps: [],
          metadata: {
            startTime: new Date(),
            endTime: new Date(),
            totalDuration: 5000,
            dataRows: 10,
            slidesGenerated: 5,
            qualityScore: 85
          }
        }

        runPipeline.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/ai/run-pipeline', {
          method: 'POST',
          body: JSON.stringify({
            deckId: 'test-deck-123',
            csvData: [{ col1: 'value1', col2: 'value2' }],
            context: { industry: 'tech' }
          })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.status).toBe('ok')
        expect(data.finalDeckJson).toBeTruthy()
        expect(runPipeline).toHaveBeenCalledWith({
          deckId: 'test-deck-123',
          csvData: [{ col1: 'value1', col2: 'value2' }],
          context: { industry: 'tech' }
        })
      })

      it('should return 400 for missing deckId', async () => {
        const request = new NextRequest('http://localhost:3000/api/ai/run-pipeline', {
          method: 'POST',
          body: JSON.stringify({
            csvData: [{ col1: 'value1' }]
          })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('deckId and csvData are required')
      })

      it('should return 400 for empty csvData', async () => {
        const request = new NextRequest('http://localhost:3000/api/ai/run-pipeline', {
          method: 'POST',
          body: JSON.stringify({
            deckId: 'test-deck-123',
            csvData: []
          })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('csvData must be a non-empty array')
      })

      it('should handle pipeline failure', async () => {
        const mockResult = {
          deckId: 'test-deck-123',
          status: 'failed',
          finalDeckJson: null,
          steps: [{ step: 1, name: 'Data Analysis', status: 'failed', error: 'Test error' }],
          metadata: {
            startTime: new Date(),
            endTime: new Date(),
            totalDuration: 1000,
            dataRows: 10,
            slidesGenerated: 0,
            qualityScore: 0
          }
        }

        runPipeline.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/ai/run-pipeline', {
          method: 'POST',
          body: JSON.stringify({
            deckId: 'test-deck-123',
            csvData: [{ col1: 'value1' }]
          })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.status).toBe('failed')
        expect(data.error).toBe('Pipeline execution failed')
      })
    })

    describe('GET /api/ai/run-pipeline', () => {
      it('should return pipeline status', async () => {
        const mockStatus = [
          { step: 1, name: 'Data Analysis', status: 'completed' },
          { step: 2, name: 'Outline Generation', status: 'running' }
        ]

        getPipelineStatus.mockResolvedValue(mockStatus)

        const request = new NextRequest('http://localhost:3000/api/ai/run-pipeline?deckId=test-deck-123')

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.deckId).toBe('test-deck-123')
        expect(data.steps).toEqual(mockStatus)
        expect(getPipelineStatus).toHaveBeenCalledWith('test-deck-123')
      })

      it('should return 400 for missing deckId', async () => {
        const request = new NextRequest('http://localhost:3000/api/ai/run-pipeline')

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('deckId parameter is required')
      })

      it('should return 404 for non-existent pipeline', async () => {
        getPipelineStatus.mockResolvedValue(null)

        const request = new NextRequest('http://localhost:3000/api/ai/run-pipeline?deckId=non-existent')

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.error).toBe('Pipeline status not found')
      })
    })

    describe('PUT /api/ai/run-pipeline', () => {
      it('should resume pipeline', async () => {
        const mockResult = {
          deckId: 'test-deck-123',
          status: 'success',
          finalDeckJson: { slides: [] },
          steps: [],
          metadata: {
            startTime: new Date(),
            endTime: new Date(),
            totalDuration: 3000,
            dataRows: 10,
            slidesGenerated: 5,
            qualityScore: 90
          }
        }

        resumePipeline.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/ai/run-pipeline', {
          method: 'PUT',
          body: JSON.stringify({
            deckId: 'test-deck-123',
            csvData: [{ col1: 'value1' }]
          })
        })

        const response = await PUT(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.status).toBe('ok')
        expect(data.resumed).toBe(true)
        expect(resumePipeline).toHaveBeenCalledWith('test-deck-123', expect.any(Object))
      })
    })
  })

  describe('Individual Agent Routes', () => {
    describe('/api/ai/analyze-data', () => {
      const { POST } = require('@/app/api/ai/analyze-data/route')
      const { analyzeDataAgent } = require('@/lib/agents/analyze-data-agent')

      it('should call analyze data agent', async () => {
        const mockResult = {
          insights: [],
          statistics: { totalRows: 5, totalColumns: 3, dataQuality: 0.95, completeness: 0.98 },
          trends: [],
          recommendations: []
        }

        analyzeDataAgent.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/ai/analyze-data', {
          method: 'POST',
          body: JSON.stringify({
            csvData: [{ col1: 'value1' }]
          })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toEqual(mockResult)
        expect(analyzeDataAgent).toHaveBeenCalledWith({
          csvData: [{ col1: 'value1' }]
        })
      })

      it('should return 400 for missing csvData', async () => {
        const request = new NextRequest('http://localhost:3000/api/ai/analyze-data', {
          method: 'POST',
          body: JSON.stringify({})
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('csvData array is required')
      })
    })

    describe('/api/ai/generate-outline', () => {
      const { POST } = require('@/app/api/ai/generate-outline/route')
      const { generateOutlineAgent } = require('@/lib/agents/generate-outline-agent')

      it('should call generate outline agent', async () => {
        const mockResult = {
          presentation: { title: 'Test', subtitle: 'Test', totalSlides: 3, estimatedDuration: 10 },
          slides: [],
          flow: { narrative: '', keyMessages: [], transitions: [] }
        }

        generateOutlineAgent.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/ai/generate-outline', {
          method: 'POST',
          body: JSON.stringify({
            analysisData: { insights: [], trends: [], recommendations: [] }
          })
        })

        const response = await POST(request)
        expect(response.status).toBe(200)
        expect(generateOutlineAgent).toHaveBeenCalled()
      })
    })
  })
})