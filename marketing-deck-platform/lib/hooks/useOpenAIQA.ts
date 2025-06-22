import { useState, useEffect } from 'react'

interface QAResult {
  verdict: 'KEEP' | 'KILL'
  scores: {
    helpful: number
    useful: number
    insightful: number
    beautiful: number
    overall: number
    [key: string]: number
  }
  reasoning: string
  improvements: string[]
  killReasons?: string[]
}

interface QAState {
  isLoading: boolean
  result: QAResult | null
  error: string | null
}

export function useChartQA(chartData: any[], chartType: string, chartConfig: any, businessContext: string) {
  const [qaState, setQaState] = useState<QAState>({
    isLoading: false,
    result: null,
    error: null
  })

  const runQA = async () => {
    if (!chartData || !chartType) return

    setQaState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('🧠 Running OpenAI Chart QA...')
      
      const response = await fetch('/api/openai/chart-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartData,
          chartType,
          chartConfig,
          businessContext
        })
      })

      if (!response.ok) {
        throw new Error(`QA failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setQaState(prev => ({ 
          ...prev, 
          isLoading: false, 
          result: data.qa,
          error: null
        }))

        // Log the result
        if (data.qa.verdict === 'KILL') {
          console.log('❌ CHART KILLED by OpenAI QA:', data.qa.killReasons)
        } else {
          console.log('✅ Chart approved by OpenAI QA:', data.qa.scores.overall)
        }
      } else {
        throw new Error(data.error || 'QA failed')
      }
    } catch (error) {
      console.error('Chart QA failed:', error)
      setQaState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'QA failed'
      }))
    }
  }

  return {
    ...qaState,
    runQA
  }
}

export function useSlideQA(slideContent: any, slideType: string, targetAudience: string, businessContext: string) {
  const [qaState, setQaState] = useState<QAState>({
    isLoading: false,
    result: null,
    error: null
  })

  const runQA = async () => {
    if (!slideContent || !slideType) return

    setQaState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('🧠 Running OpenAI Slide QA...')
      
      const response = await fetch('/api/openai/slide-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideContent,
          slideType,
          targetAudience,
          businessContext
        })
      })

      if (!response.ok) {
        throw new Error(`QA failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setQaState(prev => ({ 
          ...prev, 
          isLoading: false, 
          result: data.qa,
          error: null
        }))

        // Log the result
        if (data.qa.verdict === 'KILL') {
          console.log('❌ SLIDE KILLED by OpenAI QA:', data.qa.killReasons)
        } else {
          console.log('✅ Slide approved by OpenAI QA:', data.qa.scores.overall)
        }
      } else {
        throw new Error(data.error || 'QA failed')
      }
    } catch (error) {
      console.error('Slide QA failed:', error)
      setQaState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'QA failed'
      }))
    }
  }

  return {
    ...qaState,
    runQA
  }
}

export function useInsightQA(insight: any, dataEvidence: any[], businessContext: string, industry: string) {
  const [qaState, setQaState] = useState<QAState>({
    isLoading: false,
    result: null,
    error: null
  })

  const runQA = async () => {
    if (!insight) return

    setQaState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('🧠 Running OpenAI Insight QA...')
      
      const response = await fetch('/api/openai/insight-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insight,
          dataEvidence,
          businessContext,
          industry
        })
      })

      if (!response.ok) {
        throw new Error(`QA failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setQaState(prev => ({ 
          ...prev, 
          isLoading: false, 
          result: data.qa,
          error: null
        }))

        // Log the result
        if (data.qa.verdict === 'KILL') {
          console.log('❌ INSIGHT KILLED by OpenAI QA:', data.qa.killReasons)
        } else {
          console.log('✅ Insight approved by OpenAI QA:', data.qa.scores.overall)
        }
      } else {
        throw new Error(data.error || 'QA failed')
      }
    } catch (error) {
      console.error('Insight QA failed:', error)
      setQaState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'QA failed'
      }))
    }
  }

  return {
    ...qaState,
    runQA
  }
}