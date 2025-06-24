'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useEffect, useState } from 'react'

export default function AuthDebugPage() {
  const { user, loading } = useAuth()
  const [cookies, setCookies] = useState<string[]>([])
  const [localStorage, setLocalStorage] = useState<any>({})

  useEffect(() => {
    // Get all cookies
    const allCookies = document.cookie.split(';').map(cookie => cookie.trim())
    setCookies(allCookies)

    // Get localStorage items
    const localStorageItems: any = {}
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key) {
        try {
          const value = window.localStorage.getItem(key)
          localStorageItems[key] = value ? JSON.parse(value) : value
        } catch {
          localStorageItems[key] = window.localStorage.getItem(key)
        }
      }
    }
    setLocalStorage(localStorageItems)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Information</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User State</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
              <p><strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
              {user && (
                <div className="ml-4 space-y-1">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Subscription:</strong> {user.subscription}</p>
                  <p><strong>Demo:</strong> {user.demo ? 'true' : 'false'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Cookies</h2>
            <div className="space-y-1 text-sm max-h-64 overflow-y-auto">
              {cookies.length > 0 ? (
                cookies.map((cookie, index) => (
                  <div key={index} className="border-b pb-1">
                    {cookie}
                  </div>
                ))
              ) : (
                <p>No cookies found</p>
              )}
            </div>
          </div>

          {/* LocalStorage */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Local Storage</h2>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(localStorage, null, 2)}
            </pre>
          </div>
        </div>

        {/* Current URL */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Current URL</h2>
          <p className="text-sm">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}