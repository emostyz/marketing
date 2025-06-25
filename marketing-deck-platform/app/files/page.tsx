'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHotkeys } from 'react-hotkeys-hook'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import UnifiedLayout from '@/components/layout/UnifiedLayout'
import { 
  Grid3X3, List, Search, Filter, ChevronDown, Plus, Upload, 
  Folder, FileText, Clock, Star, Trash2, MoreVertical,
  Download, Share2, Copy, Move, Eye, Info, Check,
  ArrowLeft, Menu, Settings, User, Brain, LogOut
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { Command, CommandDialog, CommandInput, CommandList, CommandItem, CommandGroup } from 'cmdk'
import { toast } from 'sonner'
import { ModernButton } from '@/components/ui/ModernButton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { pageTransitions } from '@/lib/animations/transitions'
import { getPresentations, formatRelativeTime, type Presentation } from '@/lib/services/presentations'

// Use shared Presentation type for consistency
type Deck = Presentation

export default function FilesPage() {
  const { user, signOut, loading } = useAuth()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [decks, setDecks] = useState<Deck[]>([])
  const [isLoadingDecks, setIsLoadingDecks] = useState(true)
  const router = useRouter()

  // Load user presentations on mount
  useEffect(() => {
    const loadDecks = async () => {
      setIsLoadingDecks(true)
      try {
        const presentations = await getPresentations(user?.id)
        setDecks(presentations)
      } catch (error) {
        console.error('Failed to load presentations:', error)
      } finally {
        setIsLoadingDecks(false)
      }
    }

    loadDecks()
  }, [user])
  
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
    <UnifiedLayout requireAuth={true}>
      
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
        {...pageTransitions}
      >
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                  className="border-gray-700 text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white">My Files</h1>
                  <p className="text-gray-400">Manage your presentations and templates</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {user?.demo && (
                  <div className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-medium">
                    Demo Mode
                  </div>
                )}
                <div className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm font-medium capitalize">
                  {(user?.subscription || 'Free')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Search and Actions Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* New Button */}
              <ModernButton 
                variant="primary" 
                size="md" 
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={createNewDeck}
              >
                New Presentation
              </ModernButton>
              
              {/* Search Bar */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-80 h-10 px-4 flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-colors group"
                >
                  <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                  <span className="text-gray-400 group-hover:text-gray-300">Search presentations...</span>
                  <kbd className="ml-auto text-xs bg-gray-700 px-2 py-1 rounded border border-gray-600 text-gray-400">
                    ⌘K
                  </kbd>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Selection info */}
              {selectedItems.size > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-300 bg-blue-900/50 px-3 py-1 rounded-lg border border-blue-800">
                  <span>{selectedItems.size} selected</span>
                  <button 
                    onClick={() => setSelectedItems(new Set())}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Clear
                  </button>
                </div>
              )}
              
              {/* View Toggle */}
              <div className="flex items-center rounded-lg border border-gray-700 bg-gray-800">
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
            </div>
          </div>
          
          {/* Content Area */}
          <div className="min-h-[500px]">
            {view === 'grid' ? (
              <DeckGrid 
                decks={filteredDecks} 
                selectedItems={selectedItems} 
                onSelectionChange={setSelectedItems}
                onDeckOpen={(deckId) => router.push(`/test-editor?deck=${deckId}`)}
              />
            ) : (
              <DeckList 
                decks={filteredDecks} 
                selectedItems={selectedItems} 
                onSelectionChange={setSelectedItems}
                onDeckOpen={(deckId) => router.push(`/test-editor?deck=${deckId}`)}
              />
            )}
          </div>
          
          {/* Empty State */}
          {filteredDecks.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'No presentations found' : 'No presentations yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery 
                  ? `No presentations match "${searchQuery}"`
                  : 'Create your first AI-powered presentation to get started'
                }
              </p>
              {!searchQuery && (
                <ModernButton 
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={createNewDeck}
                >
                  Create Presentation
                </ModernButton>
              )}
            </div>
          )}
          
          {/* Command Palette */}
          <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
            <CommandInput 
              placeholder="Search presentations, templates, or actions..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandGroup heading="Recent">
                {filteredDecks.slice(0, 3).map(deck => (
                  <CommandItem 
                    key={deck.id}
                    onSelect={() => {
                      router.push(`/test-editor?deck=${deck.id}`)
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
                  Create New Presentation
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
        </div>
      </motion.div>
    </UnifiedLayout>
  )
}

function DeckGrid({ decks, selectedItems, onSelectionChange, onDeckOpen }: {
  decks: Deck[]
  selectedItems: Set<string>
  onSelectionChange: (items: Set<string>) => void
  onDeckOpen: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
              ? "border-blue-500 bg-blue-900/20 shadow-lg ring-2 ring-blue-500 ring-opacity-30" 
              : "border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750 hover:shadow-lg"
          )}
          onClick={(e) => {
            if (e.shiftKey || e.metaKey) {
              onSelect(!isSelected)
            } else {
              onOpen()
            }
          }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Thumbnail */}
          <div className="aspect-[16/9] rounded-t-lg bg-gradient-to-br from-gray-700 to-gray-800 p-4 flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          
          {/* Info */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium text-sm text-white truncate">{deck.title}</h3>
              {deck.isStarred && (
                <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-400">
              Modified {formatRelativeTime(deck.updatedAt)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {deck.size} • {deck.owner}
            </p>
          </div>
          
          {/* Selection Checkbox */}
          <div className={cn(
            "absolute top-2 left-2 w-5 h-5 rounded border-2 bg-gray-800 transition-opacity",
            isSelected ? "opacity-100 border-blue-500" : "opacity-0 group-hover:opacity-100 border-gray-500"
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
                className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-gray-900/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-gray-900"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[200px] bg-gray-900 rounded-lg shadow-lg border border-gray-700 p-1 z-50">
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
                  <Eye className="w-4 h-4" />
                  Open
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
                  <Share2 className="w-4 h-4" />
                  Share
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
                  <Download className="w-4 h-4" />
                  Download
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
                  <Copy className="w-4 h-4" />
                  Make a copy
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-gray-700" />
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-red-400">
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
        <ContextMenu.Content className="min-w-[200px] bg-gray-900 rounded-lg shadow-lg border border-gray-700 p-1 z-50">
          <ContextMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
            <Eye className="w-4 h-4" />
            Open
          </ContextMenu.Item>
          <ContextMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
            <Share2 className="w-4 h-4" />
            Share
          </ContextMenu.Item>
          <ContextMenu.Separator className="my-1 h-px bg-gray-700" />
          <ContextMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-red-400">
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
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-gray-700 bg-gray-750 px-4 py-3">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
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
              "grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-700/50 hover:bg-gray-750 cursor-pointer transition-colors",
              selectedItems.has(deck.id) ? "bg-blue-900/20" : ""
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
                    : "border-gray-500 hover:border-gray-400"
                )}
              >
                {selectedItems.has(deck.id) && (
                  <Check className="w-2.5 h-2.5 text-white" />
                )}
              </button>
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="font-medium text-white">{deck.title}</span>
              {deck.isStarred && (
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              )}
            </div>
            <div className="col-span-2 text-sm text-gray-400">{deck.owner}</div>
            <div className="col-span-2 text-sm text-gray-400">
              {formatRelativeTime(deck.updatedAt)}
            </div>
            <div className="col-span-1 text-sm text-gray-400">{deck.size}</div>
            <div className="col-span-1 flex justify-end">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button 
                    className="w-8 h-8 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="min-w-[200px] bg-gray-900 rounded-lg shadow-lg border border-gray-700 p-1 z-50">
                    <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
                      <Share2 className="w-4 h-4" />
                      Share
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-800 cursor-pointer text-white">
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
  )
}