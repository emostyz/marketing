'use client'
import { Button } from '../components/ui/Button'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0B] text-white">
      <h1 className="text-3xl font-grotesk mb-4">Something went wrong</h1>
      <p className="mb-6 text-blue-300">An unexpected error occurred. Please try again.</p>
      <Button variant="default" onClick={reset}>Retry</Button>
    </div>
  )
} 