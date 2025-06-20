import { Suspense } from 'react'
import { SimpleEditor } from '@/components/editor/SimpleEditor'
// import { AdvancedPresentationEditor } from '@/components/editor/AdvancedPresentationEditor'
import Skeleton from '@/components/ui/Skeleton'

export default function NewEditorPage() {
  // Temporarily using SimpleEditor to test
  return (
    <div className="min-h-screen">
      <Suspense fallback={<EditorSkeleton />}>
        <SimpleEditor />
        {/* <AdvancedPresentationEditor 
          userId={1}
          mode="new"
        /> */}
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