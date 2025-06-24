'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Grid3X3, List, FileText, Star, MoreVertical, Eye,
  Share2, Download, Copy, Trash2, Plus
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ModernButton } from '@/components/ui/ModernButton'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { getPresentations, formatRelativeTime, type Presentation } from '@/lib/services/presentations'

// Use shared Presentation type for consistency
type DeckFile = Presentation

export function FileBrowserModule() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [files, setFiles] = useState<DeckFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  // Load presentations on mount
  useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true)
      try {
        const presentations = await getPresentations(user?.id)
        setFiles(presentations)
      } catch (error) {
        console.error('Failed to load presentations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFiles()
  }, [user])

  return (
    <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 border border-gray-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Recent Presentations</h3>
          <p className="text-gray-400 text-sm">Quick access to your latest work</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-gray-600">
            <button
              onClick={() => setView('grid')}
              className={cn(
                "p-2 transition-colors",
                view === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                "p-2 transition-colors",
                view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <ModernButton
            variant="secondary"
            size="sm"
            onClick={() => router.push('/files')}
          >
            View All
          </ModernButton>
        </div>
      </div>

      {/* Files Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.slice(0, 4).map(file => (
            <FileCard key={file.id} file={file} onOpen={() => router.push(`/test-editor?deck=${file.id}`)} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {files.slice(0, 4).map(file => (
            <FileRow key={file.id} file={file} onOpen={() => router.push(`/test-editor?deck=${file.id}`)} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-700/50 flex items-center justify-between">
        <span className="text-gray-400 text-sm">{files.length} presentations total</span>
        <div className="flex gap-2">
          <ModernButton
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => router.push('/deck-builder/new')}
          >
            New Presentation
          </ModernButton>
        </div>
      </div>
    </div>
  )
}

function FileCard({ file, onOpen }: { file: DeckFile; onOpen: () => void }) {
  return (
    <motion.div
      className="group relative rounded-lg border border-gray-600 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-500 transition-all cursor-pointer"
      onClick={onOpen}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Thumbnail */}
      <div className="aspect-[16/9] rounded-t-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-4 flex items-center justify-center">
        <FileText className="w-8 h-8 text-blue-400" />
      </div>
      
      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-white text-sm truncate">{file.title}</h4>
          {file.isStarred && (
            <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-400">
          {formatRelativeTime(file.updatedAt)}
        </p>
      </div>
      
      {/* More Menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button 
            className="absolute top-2 right-2 w-6 h-6 rounded bg-gray-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-3 h-3 text-white" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[160px] bg-gray-900 rounded-lg shadow-lg border border-gray-700 p-1 z-50">
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
              <Eye className="w-3 h-3" />
              Open
            </DropdownMenu.Item>
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
              <Share2 className="w-3 h-3" />
              Share
            </DropdownMenu.Item>
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
              <Download className="w-3 h-3" />
              Download
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </motion.div>
  )
}

function FileRow({ file, onOpen }: { file: DeckFile; onOpen: () => void }) {
  return (
    <div
      className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer border border-transparent hover:border-gray-600"
      onClick={onOpen}
    >
      <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-white text-sm truncate">{file.title}</h4>
          {file.isStarred && (
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
          )}
        </div>
        <p className="text-xs text-gray-400">{formatRelativeTime(file.updatedAt)}</p>
      </div>
      
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button 
            className="w-8 h-8 rounded hover:bg-gray-700 transition-colors flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[160px] bg-gray-900 rounded-lg shadow-lg border border-gray-700 p-1 z-50">
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
              <Eye className="w-3 h-3" />
              Open
            </DropdownMenu.Item>
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
              <Share2 className="w-3 h-3" />
              Share
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}