import { Suspense } from 'react'
import { Viewport } from 'next'
import { UltimateDeckBuilder } from '@/components/deck-builder/UltimateDeckBuilder'
import { AuthSystem } from '@/lib/auth/auth-system'
import { redirect } from 'next/navigation'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default async function NewDeckBuilderPage() {
  // Check authentication
  const user = await AuthSystem.getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Creating new deck...</p>
        </div>
      </div>
    }>
      <UltimateDeckBuilder />
    </Suspense>
  )
} 