"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UltimateDeckBuilder } from '@/components/deck-builder/UltimateDeckBuilder'
import { useAuth } from '@/lib/auth/auth-context'
import UnifiedLayout from '@/components/layout/UnifiedLayout'

export default function NewDeckBuilderPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)

  return (
    <UnifiedLayout requireAuth={false} className="bg-gray-950 text-white">
      <main className="flex-1 flex flex-col justify-center mt-8 mb-8">
        <Suspense fallback={
          <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading deck builder...</p>
            </div>
          </div>
        }>
          <UltimateDeckBuilder />
        </Suspense>
      </main>
    </UnifiedLayout>
  )
} 