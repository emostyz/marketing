import { Suspense } from 'react'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import Skeleton from '@/components/ui/Skeleton'

export default async function DashboardPage() {
  // Demo presentations - no authentication needed
  const mockPresentations = [
    {
      id: 1,
      title: 'Q4 Sales Report',
      status: 'completed',
      userId: 1,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      type: 'deck' as const
    },
    {
      id: 2,
      title: 'Marketing Strategy 2024',
      status: 'draft',
      userId: 1,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-14'),
      type: 'draft' as const
    },
    {
      id: 3,
      title: 'Product Launch Deck',
      status: 'completed',
      userId: 1,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-12'),
      type: 'deck' as const
    }
  ]
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient 
        initialPresentations={mockPresentations}
        userId={1}
      />
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