'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Brain, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Download,
  Play,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import UnifiedLayout from '@/components/layout/UnifiedLayout'

interface PipelineRun {
  id: string
  presentationId: string
  status: 'running' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  errorMessage?: string
  duration?: number
  steps: {
    dataUpload: { status: 'pending' | 'running' | 'completed' | 'failed', timestamp?: string, error?: string }
    insights: { status: 'pending' | 'running' | 'completed' | 'failed', timestamp?: string, error?: string }
    narrative: { status: 'pending' | 'running' | 'completed' | 'failed', timestamp?: string, error?: string }
    structure: { status: 'pending' | 'running' | 'completed' | 'failed', timestamp?: string, error?: string }
    finalDeck: { status: 'pending' | 'running' | 'completed' | 'failed', timestamp?: string, error?: string }
  }
  outputs: {
    insights_json?: any
    narrative_json?: any
    structure_json?: any
    final_deck_json?: any
  }
}

// Mock data for demonstration
const mockPipelineRuns: PipelineRun[] = [
  {
    id: 'run-1',
    presentationId: 'pres-1',
    status: 'completed',
    startedAt: '2024-06-28T10:30:00Z',
    completedAt: '2024-06-28T10:35:00Z',
    duration: 300,
    steps: {
      dataUpload: { status: 'completed', timestamp: '2024-06-28T10:30:15Z' },
      insights: { status: 'completed', timestamp: '2024-06-28T10:31:45Z' },
      narrative: { status: 'completed', timestamp: '2024-06-28T10:33:20Z' },
      structure: { status: 'completed', timestamp: '2024-06-28T10:34:30Z' },
      finalDeck: { status: 'completed', timestamp: '2024-06-28T10:35:00Z' }
    },
    outputs: {
      insights_json: {
        insights: [
          { title: 'Revenue Growth', confidence: 0.85, description: 'Strong Q2 performance' },
          { title: 'Market Expansion', confidence: 0.72, description: 'New geographic markets' }
        ]
      },
      narrative_json: {
        theme: 'Growth Story',
        keyMessages: ['Revenue up 25%', 'Market expansion successful'],
        narrative: 'Strong quarterly performance driven by strategic expansion'
      },
      structure_json: {
        slides: [
          { title: 'Executive Summary', type: 'overview' },
          { title: 'Revenue Analysis', type: 'chart' },
          { title: 'Market Expansion', type: 'analysis' }
        ]
      },
      final_deck_json: {
        metadata: { slideCount: 3, totalCharts: 2 },
        slides: [
          { id: 'slide-1', title: 'Executive Summary', elements: { title: 'Q2 Results', bullets: ['Revenue up 25%', 'New markets'] } }
        ]
      }
    }
  },
  {
    id: 'run-2',
    presentationId: 'pres-2',
    status: 'failed',
    startedAt: '2024-06-28T11:00:00Z',
    completedAt: '2024-06-28T11:02:30Z',
    duration: 150,
    errorMessage: 'Schema validation failed in Agent3: Missing required field "confidence" in insights array',
    steps: {
      dataUpload: { status: 'completed', timestamp: '2024-06-28T11:00:20Z' },
      insights: { status: 'completed', timestamp: '2024-06-28T11:01:45Z' },
      narrative: { status: 'completed', timestamp: '2024-06-28T11:02:10Z' },
      structure: { status: 'failed', timestamp: '2024-06-28T11:02:30Z', error: 'Schema validation failed: Missing required field "confidence"' },
      finalDeck: { status: 'pending' }
    },
    outputs: {
      insights_json: {
        insights: [
          { title: 'Cost Analysis', description: 'Operating costs increased' } // Missing confidence field
        ]
      },
      narrative_json: {
        theme: 'Cost Management',
        keyMessages: ['Costs under review'],
        narrative: 'Quarterly cost analysis reveals optimization opportunities'
      }
    }
  },
  {
    id: 'run-3',
    presentationId: 'pres-1',
    status: 'running',
    startedAt: '2024-06-28T12:00:00Z',
    duration: 45,
    steps: {
      dataUpload: { status: 'completed', timestamp: '2024-06-28T12:00:15Z' },
      insights: { status: 'completed', timestamp: '2024-06-28T12:01:30Z' },
      narrative: { status: 'running', timestamp: '2024-06-28T12:02:00Z' },
      structure: { status: 'pending' },
      finalDeck: { status: 'pending' }
    },
    outputs: {
      insights_json: {
        insights: [
          { title: 'Customer Satisfaction', confidence: 0.91, description: 'High NPS scores' }
        ]
      }
    }
  }
]

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'failed':
      return <AlertCircle className="w-5 h-5 text-red-500" />
    case 'running':
      return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
    default:
      return <Clock className="w-5 h-5 text-gray-500" />
  }
}

function JSONViewer({ data, title }: { data: any, title: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border border-gray-700 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-800/50 transition-colors rounded-t-lg"
      >
        <span className="font-medium text-white">{title}</span>
        <div className="flex items-center space-x-2">
          {data && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard.writeText(JSON.stringify(data, null, 2))
                toast.success('Copied to clipboard')
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      {isExpanded && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          className="overflow-hidden"
        >
          <div className="p-4 bg-gray-900 border-t border-gray-700 rounded-b-lg">
            {data ? (
              <pre className="text-sm text-gray-300 overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 italic">No data available</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function PipelineRunCard({ run, onRetry }: { run: PipelineRun, onRetry: (runId: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card className="p-6 bg-gray-900 border-gray-800" data-cy="pipeline-run-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <StatusIcon status={run.status} />
          <div>
            <h3 className="text-lg font-semibold text-white">
              Pipeline Run {run.id}
            </h3>
            <p className="text-gray-400 text-sm">
              Presentation: {run.presentationId} • Started: {formatTimestamp(run.startedAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {run.duration && (
            <span className="text-gray-400 text-sm">
              {formatDuration(run.duration)}
            </span>
          )}
          {run.status === 'failed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRetry(run.id)}
              className="text-blue-400 border-blue-500/50 hover:bg-blue-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        {Object.entries(run.steps).map(([stepName, step]) => (
          <div key={stepName} className="text-center">
            <div className="flex items-center justify-center mb-2">
              <StatusIcon status={step.status} />
            </div>
            <p className="text-xs text-gray-400 capitalize">
              {stepName.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            {step.timestamp && (
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(step.timestamp)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {run.errorMessage && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium mb-1">Pipeline Failed</p>
              <p className="text-red-300 text-sm">{run.errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed View */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 border-t border-gray-700 pt-4"
        >
          <h4 className="text-white font-medium">Pipeline Outputs</h4>
          
          <div className="space-y-3">
            <JSONViewer data={run.outputs.insights_json} title="Insights JSON" />
            <JSONViewer data={run.outputs.narrative_json} title="Narrative JSON" />
            <JSONViewer data={run.outputs.structure_json} title="Structure JSON" />
            <JSONViewer data={run.outputs.final_deck_json} title="Final Deck JSON" />
          </div>

          {/* Step Details */}
          <div className="mt-6">
            <h4 className="text-white font-medium mb-3">Step Details</h4>
            <div className="space-y-2">
              {Object.entries(run.steps).map(([stepName, step]) => (
                <div key={stepName} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <div className="flex items-center space-x-3">
                    <StatusIcon status={step.status} />
                    <span className="text-gray-300 capitalize">
                      {stepName.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <div className="text-right">
                    {step.timestamp && (
                      <p className="text-xs text-gray-400">{formatTimestamp(step.timestamp)}</p>
                    )}
                    {step.error && (
                      <p className="text-xs text-red-400 mt-1">{step.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-4 border-t border-gray-700">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`/deck-builder/${run.presentationId}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Presentation
            </Button>
            {run.status === 'completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`/deck-builder/${run.presentationId}?generated=true`, '_blank')}
              >
                <Play className="w-4 h-4 mr-2" />
                Open in Deck Builder
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </Card>
  )
}

export default function QADashboard() {
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>(mockPipelineRuns)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all')

  const fetchPipelineRuns = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch from your API
      // const response = await fetch('/api/ai/pipeline-runs')
      // const data = await response.json()
      // setPipelineRuns(data)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Fetched pipeline runs')
    } catch (error) {
      console.error('Failed to fetch pipeline runs:', error)
      toast.error('Failed to fetch pipeline runs')
    } finally {
      setIsLoading(false)
    }
  }

  const retryPipeline = async (runId: string) => {
    try {
      const run = pipelineRuns.find(r => r.id === runId)
      if (!run) return

      toast.loading('Retrying pipeline...', { id: 'retry' })
      
      // In a real app, this would call your retry API
      // const response = await fetch('/api/ai/retry-pipeline', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ runId, presentationId: run.presentationId })
      // })

      // Simulate retry by creating a new running pipeline
      const newRun: PipelineRun = {
        ...run,
        id: `run-${Date.now()}`,
        status: 'running',
        startedAt: new Date().toISOString(),
        completedAt: undefined,
        errorMessage: undefined,
        duration: 0,
        steps: {
          dataUpload: { status: 'running' },
          insights: { status: 'pending' },
          narrative: { status: 'pending' },
          structure: { status: 'pending' },
          finalDeck: { status: 'pending' }
        },
        outputs: {}
      }

      setPipelineRuns(prev => [newRun, ...prev])
      toast.success('Pipeline retry started', { id: 'retry' })
    } catch (error) {
      console.error('Failed to retry pipeline:', error)
      toast.error('Failed to retry pipeline', { id: 'retry' })
    }
  }

  const filteredRuns = pipelineRuns.filter(run => 
    filter === 'all' || run.status === filter
  )

  const runStats = {
    total: pipelineRuns.length,
    running: pipelineRuns.filter(r => r.status === 'running').length,
    completed: pipelineRuns.filter(r => r.status === 'completed').length,
    failed: pipelineRuns.filter(r => r.status === 'failed').length
  }

  return (
    <UnifiedLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-950 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">QA Dashboard</h1>
              <p className="text-gray-400">Monitor AI pipeline runs and debug issues</p>
            </div>
            <Button onClick={fetchPipelineRuns} disabled={isLoading} data-cy="refresh-button">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-gray-900 border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Runs</p>
                  <p className="text-2xl font-bold text-white" data-cy="stats-total">{runStats.total}</p>
                </div>
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
            </Card>
            <Card className="p-4 bg-gray-900 border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Running</p>
                  <p className="text-2xl font-bold text-blue-400" data-cy="stats-running">{runStats.running}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </Card>
            <Card className="p-4 bg-gray-900 border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-green-400" data-cy="stats-completed">{runStats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </Card>
            <Card className="p-4 bg-gray-900 border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-red-400" data-cy="stats-failed">{runStats.failed}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-gray-400 text-sm">Filter:</span>
            {(['all', 'running', 'completed', 'failed'] as const).map(status => (
              <Button
                key={status}
                size="sm"
                variant={filter === status ? 'default' : 'outline'}
                onClick={() => setFilter(status)}
                className="capitalize"
                data-cy={`filter-${status}`}
              >
                {status}
              </Button>
            ))}
          </div>

          {/* Pipeline Runs */}
          <div className="space-y-4">
            {filteredRuns.length === 0 ? (
              <Card className="p-8 text-center bg-gray-900 border-gray-800">
                <Brain className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No Pipeline Runs</h3>
                <p className="text-gray-400">No pipeline runs match the current filter.</p>
              </Card>
            ) : (
              filteredRuns.map(run => (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PipelineRunCard run={run} onRetry={retryPipeline} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </UnifiedLayout>
  )
}