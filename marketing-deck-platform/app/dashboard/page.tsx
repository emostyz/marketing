import { Suspense } from 'react'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import Skeleton from '@/components/ui/Skeleton'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default async function DashboardPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient />
      </Suspense>
    </ErrorBoundary>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <Skeleton className="h-12 w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  )
}