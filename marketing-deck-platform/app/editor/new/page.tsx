import { Suspense } from 'react'
import { WorldClassEditor } from '@/components/editor/WorldClassEditor'
import Skeleton from '@/components/ui/Skeleton'

export default function NewEditorPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<EditorSkeleton />}>
        <WorldClassEditor />
      </Suspense>
    </div>
  )
}

function EditorSkeleton() {
  return (
    <div className="p-6">
      <Skeleton width="24rem" height="3rem" className="mb-4" />
      <div className="flex gap-4">
        <Skeleton width="12.5rem" height="37.5rem" />
        <Skeleton height="37.5rem" className="flex-1" />
      </div>
    </div>
  )
}