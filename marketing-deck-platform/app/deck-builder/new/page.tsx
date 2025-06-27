"use client"

import { Suspense } from 'react'
import { UltimateDeckBuilder } from '@/components/deck-builder/UltimateDeckBuilder'

export default function NewDeckBuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading EasyDecks.ai Deck Builder...</p>
        </div>
      </div>
    }>
      <UltimateDeckBuilder />
    </Suspense>
  )
} 