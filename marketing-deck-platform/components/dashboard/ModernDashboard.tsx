'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHotkeys } from 'react-hotkeys-hook'
import { useRouter } from 'next/navigation'
import { 
  Grid3X3, List, Search, Filter, ChevronDown, Plus, Upload, 
  Folder, FileText, Clock, Star, Trash2, MoreVertical,
  Download, Share2, Copy, Move, Eye, Info, Check,
  ArrowLeft, Menu, Settings, User
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { Command, CommandDialog, CommandInput, CommandList, CommandItem, CommandGroup } from 'cmdk'
import { toast } from 'sonner'
import { ModernButton } from '@/components/ui/ModernButton'
import { cn } from '@/lib/utils'
import { pageTransitions } from '@/lib/animations/transitions'

interface Deck {
  id: string
  title: string
  updatedAt: Date
  createdAt: Date
  thumbnail?: string
  isStarred: boolean
  owner: string
  lastEditor: string
  size: string
  type: 'presentation' | 'template'
}

// Mock data for demonstration
const mockDecks: Deck[] = [
  {
    id: '1',
    title: 'Q4 Sales Review Presentation',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    isStarred: true,
    owner: 'You',
    lastEditor: 'You',
    size: '2.4 MB',
    type: 'presentation'
  },
  {
    id: '2',
    title: 'Product Launch Strategy',
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    isStarred: false,
    owner: 'You',
    lastEditor: 'Sarah Johnson',
    size: '1.8 MB',
    type: 'presentation'
  },
  {
    id: '3',
    title: 'Board Meeting - November',
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    isStarred: true,
    owner: 'You',
    lastEditor: 'Mike Chen',
    size: '3.1 MB',
    type: 'presentation'
  },
  {
    id: '4',
    title: 'Company Template - Blue',
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    isStarred: false,
    owner: 'Design Team',
    lastEditor: 'Alex Rivera',
    size: '892 KB',
    type: 'template'
  }
]

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export function ModernDashboard() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [decks, setDecks] = useState<Deck[]>(mockDecks)
  const router = useRouter()
  
  // Hotkeys
  useHotkeys('cmd+k', (e) => {
    e.preventDefault()
    setSearchOpen(true)
  })
  useHotkeys('cmd+a', (e) => {
    e.preventDefault()
    selectAll()
  })
  useHotkeys('delete', () => deleteSelected())
  useHotkeys('escape', () => setSelectedItems(new Set()))
  
  const selectAll = useCallback(() => {
    const allIds = new Set(decks.map(deck => deck.id))
    setSelectedItems(allIds)
  }, [decks])
  
  const deleteSelected = useCallback(() => {
    if (selectedItems.size === 0) return
    
    const newDecks = decks.filter(deck => !selectedItems.has(deck.id))
    setDecks(newDecks)
    setSelectedItems(new Set())
    toast.success(`Moved ${selectedItems.size} item(s) to trash`)
  }, [decks, selectedItems])
  
  const createNewDeck = useCallback(() => {
    router.push('/deck-builder/new')
  }, [router])
  
  const filteredDecks = useMemo(() => {
    return decks.filter(deck => 
      deck.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [decks, searchQuery])

  return (
    <motion.div 
      className="h-screen flex flex-col bg-white"
      {...pageTransitions}
    >
      {/* Header */}
      <header className="h-16 border-b border-gray-200 bg-white">
        <div className="h-full px-6 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-medium text-gray-900">AEDRIN</span>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full h-10 px-4 flex items-center gap-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors group"
            >
              <Search className="w-4 h-4 text-gray-500 group-hover:text-gray-600" />
              <span className="text-gray-600 group-hover:text-gray-700">Search decks</span>
              <kbd className="ml-auto text-xs bg-white px-2 py-1 rounded border border-gray-300 text-gray-500">
                ⌘K
              </kbd>
            </button>
          </div>
          
          {/* User Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                <User className="w-4 h-4 text-white" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50">
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>
      
      {/* Toolbar */}
      <div className="h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* New Button */}
          <ModernButton 
            variant="primary" 
            size="sm" 
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={createNewDeck}
          >
            New
          </ModernButton>
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">My Drive</span>
            <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
            <span className="text-gray-900 font-medium">Presentations</span>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Selection info */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-lg">
              <span>{selectedItems.size} selected</span>
              <button 
                onClick={() => setSelectedItems(new Set())}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear
              </button>
            </div>
          )}
          
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-gray-300">
            <button
              onClick={() => setView('grid')}
              className={cn(
                "p-2 transition-colors",
                view === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                "p-2 transition-colors",
                view === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {view === 'grid' ? (
          <DeckGrid 
            decks={filteredDecks} 
            selectedItems={selectedItems} 
            onSelectionChange={setSelectedItems}
            onDeckOpen={(deckId) => router.push(`/deck-builder/${deckId}`)}
          />
        ) : (
          <DeckList 
            decks={filteredDecks} 
            selectedItems={selectedItems} 
            onSelectionChange={setSelectedItems}
            onDeckOpen={(deckId) => router.push(`/deck-builder/${deckId}`)}
          />
        )}
      </div>
      
      {/* Command Palette */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput 
          placeholder="Search decks, templates, or actions..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandGroup heading="Recent">
            {filteredDecks.slice(0, 3).map(deck => (
              <CommandItem 
                key={deck.id}
                onSelect={() => {
                  router.push(`/deck-builder/${deck.id}`)
                  setSearchOpen(false)
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                {deck.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => {
              createNewDeck()
              setSearchOpen(false)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Deck
            </CommandItem>
            <CommandItem onSelect={() => {
              router.push('/upload')
              setSearchOpen(false)
            }}>
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </motion.div>
  )
}

function DeckGrid({ decks, selectedItems, onSelectionChange, onDeckOpen }: {
  decks: Deck[]
  selectedItems: Set<string>
  onSelectionChange: (items: Set<string>) => void
  onDeckOpen: (id: string) => void
}) {
  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {decks.map(deck => (
        <DeckCard
          key={deck.id}
          deck={deck}
          isSelected={selectedItems.has(deck.id)}
          onSelect={(selected) => {
            const newSelection = new Set(selectedItems)
            if (selected) {
              newSelection.add(deck.id)
            } else {
              newSelection.delete(deck.id)
            }
            onSelectionChange(newSelection)
          }}
          onOpen={() => onDeckOpen(deck.id)}
        />
      ))}
    </div>
  )
}

function DeckCard({ deck, isSelected, onSelect, onOpen }: {
  deck: Deck
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onOpen: () => void
}) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <motion.div
          layoutId={deck.id}
          className={cn(
            "group relative rounded-lg border transition-all cursor-pointer",
            isSelected 
              ? "border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-500 ring-opacity-20" 
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
          )}
          onClick={(e) => {
            if (e.shiftKey || e.metaKey) {
              onSelect(!isSelected)
            } else {
              onOpen()
            }
          }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Thumbnail */}
          <div className="aspect-[16/9] rounded-t-lg bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
            <FileText className="w-12 h-12 text-blue-400" />
          </div>
          
          {/* Info */}
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm truncate text-gray-900">{deck.title}</h3>
              {deck.isStarred && (
                <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Modified {formatRelativeTime(deck.updatedAt)}
            </p>
          </div>
          
          {/* Selection Checkbox */}
          <div className={cn(
            "absolute top-2 left-2 w-5 h-5 rounded border-2 bg-white transition-opacity",
            isSelected ? "opacity-100 border-blue-500" : "opacity-0 group-hover:opacity-100 border-gray-300"
          )}>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-full h-full bg-blue-500 rounded-sm flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>
          
          {/* More Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button 
                className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50">
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
                  <Eye className="w-4 h-4" />
                  Open
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
                  <Share2 className="w-4 h-4" />
                  Share
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
                  <Download className="w-4 h-4" />
                  Download
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
                  <Copy className="w-4 h-4" />
                  Make a copy
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer text-red-600">
                  <Trash2 className="w-4 h-4" />
                  Move to trash
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </motion.div>
      </ContextMenu.Trigger>
      
      {/* Context Menu */}
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50">
          <ContextMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
            <Eye className="w-4 h-4" />
            Open
          </ContextMenu.Item>
          <ContextMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
            Share2
          </ContextMenu.Item>
          <ContextMenu.Separator className="my-1 h-px bg-gray-200" />
          <ContextMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer text-red-600">
            <Trash2 className="w-4 h-4" />
            Move to trash
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}

function DeckList({ decks, selectedItems, onSelectionChange, onDeckOpen }: {
  decks: Deck[]
  selectedItems: Set<string>
  onSelectionChange: (items: Set<string>) => void
  onDeckOpen: (id: string) => void
}) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-2">Last modified</div>
            <div className="col-span-1">Size</div>
            <div className="col-span-1"></div>
          </div>
        </div>
        
        {/* Table Body */}
        <div>
          {decks.map((deck, index) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors",
                isSelected ? "bg-blue-50" : ""
              )}
              onClick={() => onDeckOpen(deck.id)}
            >
              <div className="col-span-6 flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const newSelection = new Set(selectedItems)
                    if (selectedItems.has(deck.id)) {
                      newSelection.delete(deck.id)
                    } else {
                      newSelection.add(deck.id)
                    }
                    onSelectionChange(newSelection)
                  }}
                  className={cn(
                    "w-4 h-4 rounded border-2 transition-colors",
                    selectedItems.has(deck.id) 
                      ? "border-blue-500 bg-blue-500" 
                      : "border-gray-300 hover:border-gray-400"
                  )}
                >
                  {selectedItems.has(deck.id) && (
                    <Check className="w-2.5 h-2.5 text-white" />
                  )}
                </button>
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-900">{deck.title}</span>
                {deck.isStarred && (
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                )}
              </div>
              <div className="col-span-2 text-sm text-gray-600">{deck.owner}</div>
              <div className="col-span-2 text-sm text-gray-600">
                {formatRelativeTime(deck.updatedAt)}
              </div>
              <div className="col-span-1 text-sm text-gray-600">{deck.size}</div>
              <div className="col-span-1 flex justify-end">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button 
                      className="w-8 h-8 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50">
                      <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
                        <Share2 className="w-4 h-4" />
                        Share
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
                        <Download className="w-4 h-4" />
                        Download
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}