import { Suspense } from 'react'
import { UltimateDeckBuilder } from '@/components/deck-builder/UltimateDeckBuilder'
import Skeleton from '@/components/ui/Skeleton'

export default function NewDeckBuilderPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<DeckBuilderSkeleton />}>
        <UltimateDeckBuilder />
      </Suspense>
    </div>
  )
}

function DeckBuilderSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="flex space-x-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
} 