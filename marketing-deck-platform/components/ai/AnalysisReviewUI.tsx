'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  TrendingUp, 
  Target, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  DollarSign
} from 'lucide-react'
import { type FirstPassAnalysis } from '@/lib/ai/openai-first-pass-analysis'

interface AnalysisReviewUIProps {
  analysis: FirstPassAnalysis
  datasetInfo: {
    filename: string
    rows: number
    columns: number
    uploadedAt: string
  }
  metadata?: {
    processingTime: number
    confidence: number
    modelUsed: string
  }
  onFeedback: (feedback: {
    approved: boolean
    findingsFeedback: Record<string, { approved: boolean; comment?: string }>
    recommendationsFeedback: Record<string, { approved: boolean; comment?: string }>
    overallComment?: string
    suggestedChanges?: string[]
  }) => void
  onProceed: () => void
  isSubmitting?: boolean
}

interface FindingFeedback {
  approved: boolean
  comment?: string
}

export default function AnalysisReviewUI({
  analysis,
  datasetInfo,
  metadata,
  onFeedback,
  onProceed,
  isSubmitting = false
}: AnalysisReviewUIProps) {
  const [findingsFeedback, setFindingsFeedback] = useState<Record<string, FindingFeedback>>({})
  const [recommendationsFeedback, setRecommendationsFeedback] = useState<Record<string, FindingFeedback>>({})
  const [overallApproved, setOverallApproved] = useState<boolean | null>(null)
  const [overallComment, setOverallComment] = useState('')
  const [suggestedChanges, setSuggestedChanges] = useState('')

  // Calculate approval status
  const findingsApprovalCount = Object.values(findingsFeedback).filter(f => f.approved).length
  const recommendationsApprovalCount = Object.values(recommendationsFeedback).filter(r => r.approved).length
  const totalFindings = analysis.keyFindings.length
  const totalRecommendations = analysis.recommendations.length

  const canProceed = overallApproved === true && 
    findingsApprovalCount >= Math.ceil(totalFindings * 0.6) && // At least 60% of findings approved
    recommendationsApprovalCount >= Math.ceil(totalRecommendations * 0.5) // At least 50% of recommendations approved

  const handleFindingFeedback = useCallback((findingIndex: number, approved: boolean, comment?: string) => {
    setFindingsFeedback(prev => ({
      ...prev,
      [findingIndex]: { approved, comment }
    }))
  }, [])

  const handleRecommendationFeedback = useCallback((recIndex: number, approved: boolean, comment?: string) => {
    setRecommendationsFeedback(prev => ({
      ...prev,
      [recIndex]: { approved, comment }
    }))
  }, [])

  const handleSubmitFeedback = useCallback(() => {
    const changes = suggestedChanges.split('\n').filter(c => c.trim().length > 0)
    
    onFeedback({
      approved: overallApproved === true,
      findingsFeedback,
      recommendationsFeedback,
      overallComment: overallComment.trim() || undefined,
      suggestedChanges: changes.length > 0 ? changes : undefined
    })
  }, [overallApproved, findingsFeedback, recommendationsFeedback, overallComment, suggestedChanges, onFeedback])

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'immediate': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'short_term': return <Clock className="h-4 w-4 text-orange-500" />
      case 'long_term': return <Target className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'medium': return <BarChart3 className="h-4 w-4 text-yellow-500" />
      case 'low': return <Users className="h-4 w-4 text-gray-500" />
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analysis Review</h1>
          <p className="text-gray-600 mt-1">
            Review and approve the AI-generated insights before proceeding to slide generation
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Dataset: {datasetInfo.filename}</div>
          <div className="text-sm text-gray-500">
            {datasetInfo.rows.toLocaleString()} rows × {datasetInfo.columns} columns
          </div>
          {metadata && (
            <div className="text-sm text-gray-500">
              Confidence: {Math.round(metadata.confidence * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* Overall Approval */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Overall Analysis Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Executive Summary</h3>
              <p className="text-blue-800">{analysis.executiveSummary}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-medium">Do you approve this overall analysis?</span>
              <div className="flex gap-2">
                <Button
                  variant={overallApproved === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOverallApproved(true)}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant={overallApproved === false ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setOverallApproved(false)}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Overall Comments (Optional)</label>
              <Textarea
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                placeholder="Any general feedback about the analysis..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Findings Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Findings ({findingsApprovalCount}/{totalFindings} approved)
            </span>
            <Badge variant={findingsApprovalCount >= Math.ceil(totalFindings * 0.6) ? "default" : "secondary"}>
              {findingsApprovalCount >= Math.ceil(totalFindings * 0.6) ? "Sufficient" : "More approvals needed"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              {analysis.keyFindings.map((finding, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{finding.title}</h4>
                      <p className="text-gray-700 mt-1">{finding.insight}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          {getImpactIcon(finding.businessImpact)}
                          {finding.businessImpact} impact
                        </span>
                        <span>Confidence: {Math.round(finding.confidence * 100)}%</span>
                        <span>Evidence: {finding.dataEvidence}</span>
                      </div>
                      {finding.relatedMetrics.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {finding.relatedMetrics.map((metric, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={findingsFeedback[index]?.approved === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFindingFeedback(index, true)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={findingsFeedback[index]?.approved === false ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleFindingFeedback(index, false)}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    {findingsFeedback[index] && (
                      <Textarea
                        placeholder="Optional comment..."
                        value={findingsFeedback[index]?.comment || ''}
                        onChange={(e) => handleFindingFeedback(index, findingsFeedback[index].approved, e.target.value)}
                        className="flex-1 h-8 text-sm"
                        rows={1}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recommendations Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recommendations ({recommendationsApprovalCount}/{totalRecommendations} approved)
            </span>
            <Badge variant={recommendationsApprovalCount >= Math.ceil(totalRecommendations * 0.5) ? "default" : "secondary"}>
              {recommendationsApprovalCount >= Math.ceil(totalRecommendations * 0.5) ? "Sufficient" : "More approvals needed"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      {getPriorityIcon(rec.priority)}
                      {rec.title}
                    </h4>
                    <p className="text-gray-700 mt-1">{rec.action}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        {getImpactIcon(rec.expectedImpact)}
                        {rec.expectedImpact} impact
                      </span>
                      <span className="capitalize">{rec.feasibility} feasibility</span>
                      <span className="capitalize">{rec.priority} priority</span>
                    </div>
                    {rec.successMetrics.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-600">Success Metrics: </span>
                        <span className="text-sm text-gray-600">{rec.successMetrics.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={recommendationsFeedback[index]?.approved === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRecommendationFeedback(index, true)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={recommendationsFeedback[index]?.approved === false ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleRecommendationFeedback(index, false)}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    {recommendationsFeedback[index] && (
                      <Textarea
                        placeholder="Optional comment..."
                        value={recommendationsFeedback[index]?.comment || ''}
                        onChange={(e) => handleRecommendationFeedback(index, recommendationsFeedback[index].approved, e.target.value)}
                        className="flex-1 h-8 text-sm"
                        rows={1}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Suggested Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Suggested Changes (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={suggestedChanges}
            onChange={(e) => setSuggestedChanges(e.target.value)}
            placeholder="List any specific changes you'd like to see (one per line)..."
            rows={4}
          />
          <p className="text-sm text-gray-500 mt-2">
            These suggestions will be used to refine the analysis in the next iteration.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {canProceed ? (
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Ready to proceed to slide generation
            </span>
          ) : (
            <span className="text-orange-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Please approve the overall analysis and sufficient findings/recommendations
            </span>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleSubmitFeedback}
            disabled={isSubmitting || overallApproved === null}
          >
            Submit Feedback
          </Button>
          <Button 
            onClick={onProceed}
            disabled={!canProceed || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Proceed to Slide Generation'}
          </Button>
        </div>
      </div>

      {/* Data Quality Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Quality Assessment</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Completeness:</span> {Math.round(analysis.dataQuality.completeness * 100)}%
            </div>
            <div>
              <span className="font-medium">Reliability:</span> {analysis.dataQuality.reliability}
            </div>
            <div>
              <span className="font-medium">Limitations:</span> {analysis.dataQuality.limitations.length} identified
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}