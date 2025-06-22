'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [status, setStatus] = useState('Loading...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testAuth() {
      try {
        setStatus('Testing auth endpoint...')
        
        // Test the auth endpoint
        const response = await fetch('/api/auth/test')
        const data = await response.json()
        
        setStatus(`Auth test result: ${JSON.stringify(data, null, 2)}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('Error occurred')
      }
    }

    testAuth()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      <div className="mt-4">
        <a href="/dashboard" className="text-blue-500 hover:underline">
          Try Dashboard
        </a>
      </div>
    </div>
  )
}