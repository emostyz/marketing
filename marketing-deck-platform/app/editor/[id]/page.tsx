'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { FunctionalEditor } from '@/components/editor/FunctionalEditor'
import { Toaster } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import PublicNavigation from '@/components/navigation/PublicNavigation'
import PublicFooter from '@/components/navigation/PublicFooter'

export default function EditorPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PublicNavigation />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/files')}
                  className="border-gray-700 text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Files
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-white">Presentation Editor</h1>
                  <p className="text-gray-400 text-sm">Drag, drop, and customize your presentation</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {user?.demo && (
                  <div className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-medium">
                    Demo Mode
                  </div>
                )}
                <Button 
                  variant="default" 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="h-[calc(100vh-160px)]">
          <FunctionalEditor />
        </div>
        
        <Toaster position="bottom-right" richColors />
      </div>
      
      <PublicFooter />
    </>
  )
}