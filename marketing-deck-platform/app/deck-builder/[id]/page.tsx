'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import FunctionalDeckBuilder from '@/components/deck-builder/FunctionalDeckBuilder'
import { Loader2 } from 'lucide-react'

export default function DeckBuilderPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [presentationId, setPresentationId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Set presentation ID from params
    if (id && typeof id === 'string') {
      setPresentationId(id === 'new' ? undefined : id)
    }
    
    setLoading(false)
  }, [id, user, authLoading, router])

  const handleSave = async (presentation: any) => {
    try {
      const response = await fetch('/api/presentations', {
        method: presentation.id.startsWith('new-') ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: presentation.id.startsWith('new-') ? undefined : presentation.id,
          ...presentation
        })
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('Presentation saved successfully')
        // If it's a new presentation, update the URL
        if (presentation.id.startsWith('new-')) {
          router.replace(`/deck-builder/${data.presentation.id}`)
        }
      } else {
        console.error('Failed to save presentation:', data.error)
      }
    } catch (error) {
      console.error('Error saving presentation:', error)
    }
  }

  const handleExport = async (format: string) => {
    try {
      const response = await fetch(`/api/presentations/${presentationId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `presentation.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Export failed')
      }
    } catch (error) {
      console.error('Error exporting presentation:', error)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading deck builder...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="h-screen overflow-hidden">
      <FunctionalDeckBuilder
        presentationId={presentationId}
        onSave={handleSave}
        onExport={handleExport}
      />
    </div>
  )
}