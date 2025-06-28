'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import WorldClassPresentationEditor from '@/components/editor/WorldClassPresentationEditor'
import { Toaster } from 'sonner'
import UnifiedLayout from '@/components/layout/UnifiedLayout'

export default function EditorPage() {
  const { loading } = useAuth()
  const params = useParams()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <WorldClassPresentationEditor 
        presentationId={params.id as string}
        onSave={(slides) => {
          console.log('Saving presentation:', slides)
        }}
        onExport={(format) => {
          console.log('Exporting as:', format)
        }}
      />
      <Toaster position="bottom-right" richColors />
    </div>
  )
}