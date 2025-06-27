'use client'

import { Suspense } from 'react'
import WorldClassPresentationEditor from '@/components/editor/WorldClassPresentationEditor'
import { Toaster } from 'sonner'
import { useSearchParams } from 'next/navigation'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

function TestEditorContent() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deck') || undefined;
  
  // Mock AI context for testing
  const mockAIContext = {
    businessGoals: ['increase revenue', 'market expansion'],
    timeframe: '3-6 months',
    decisionMakers: ['executives', 'board members'],
    originalData: [
      { Date: '2024-01', Revenue: 45000, Units: 120 },
      { Date: '2024-02', Revenue: 48000, Units: 130 },
      { Date: '2024-03', Revenue: 52000, Units: 140 }
    ]
  }
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-950">
        <WorldClassPresentationEditor 
          presentationId={deckId}
          aiContext={mockAIContext}
        />
        <Toaster 
          position="bottom-right"
          richColors
          expand={true}
          duration={4000}
        />
      </div>
    </ErrorBoundary>
  )
}

export default function TestEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading editor...</p>
        </div>
      </div>
    }>
      <TestEditorContent />
    </Suspense>
  )
}