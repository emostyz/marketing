'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('Editor error:', error)
  
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Editor Error</h1>
        <p className="text-gray-400 mb-6">
          Error: {error.message}
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Stack: {error.stack?.slice(0, 500)}...
        </p>
        <button
          onClick={reset}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}