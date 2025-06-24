'use client'

import { FunctionalEditor } from '@/components/editor/FunctionalEditor'
import { Toaster } from 'sonner'
import { useSearchParams } from 'next/navigation'

export default function TestEditorPage() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deck') || undefined;
  return (
    <>
      <FunctionalEditor deckId={deckId} />
      <Toaster 
        position="bottom-right"
        richColors
        expand={true}
        duration={4000}
      />
    </>
  )
}