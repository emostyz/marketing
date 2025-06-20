import { Suspense } from 'react'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import Skeleton from '@/components/ui/Skeleton'

export default async function DashboardPage() {
  // The DashboardClient will handle loading user-specific presentations
  // using the AuthContext to get the current user
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
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