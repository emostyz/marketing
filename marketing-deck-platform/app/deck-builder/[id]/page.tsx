import { Suspense } from 'react'
import PersistentDeckBuilder from '@/components/deck-builder/PersistentDeckBuilder'
import { AuthSystem } from '@/lib/auth/auth-system'
import { redirect } from 'next/navigation'

interface DeckBuilderPageProps {
  params: Promise<{ id: string }>
}

export default async function DeckBuilderPage({ params }: DeckBuilderPageProps) {
  // Check authentication
  const user = await AuthSystem.getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { id } = await params

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading deck...</p>
        </div>
      </div>
    }>
      <PersistentDeckBuilder draftId={id} />
    </Suspense>
  )
}