'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle, XCircle, AlertCircle, ExternalLink,
  Grid3X3, Type, Shapes, BarChart3, Image, Play,
  Download, Share2, Save, Undo2, Redo2, Palette,
  MousePointer, PaintBucket, Settings
} from 'lucide-react'
import { ModernButton } from '@/components/ui/ModernButton'
import { toast, Toaster } from 'sonner'
import { cn } from '@/lib/utils'

type TestStatus = 'pending' | 'testing' | 'passed' | 'failed'

interface QATest {
  id: string
  category: string
  name: string
  description: string
  testUrl?: string
  instructions: string[]
  expectedResult: string
  status: TestStatus
  notes?: string
}

const qaTests: QATest[] = [
  // Dashboard Tests
  {
    id: 'dashboard-view',
    category: 'Dashboard',
    name: 'File Browser View Toggle',
    description: 'Grid/List view switching works smoothly',
    testUrl: '/test-dashboard',
    instructions: [
      'Click grid/list toggle buttons',
      'Verify smooth transitions',
      'Check files display correctly in both views'
    ],
    expectedResult: 'View changes instantly with smooth animations',
    status: 'pending'
  },
  {
    id: 'dashboard-search',
    category: 'Dashboard', 
    name: 'Command Palette (⌘K)',
    description: 'Search and navigation works',
    testUrl: '/test-dashboard',
    instructions: [
      'Press Cmd+K (Mac) or Ctrl+K (Windows)',
      'Type to search files',
      'Select a result to navigate'
    ],
    expectedResult: 'Command palette opens, search works, navigation occurs',
    status: 'pending'
  },
  {
    id: 'dashboard-multiselect',
    category: 'Dashboard',
    name: 'Multi-select Files',
    description: 'Select multiple files with keyboard shortcuts',
    testUrl: '/test-dashboard',
    instructions: [
      'Shift+click to select multiple files',
      'Cmd+A to select all',
      'Verify selection count shows'
    ],
    expectedResult: 'Multiple files selected, count displayed, clear button works',
    status: 'pending'
  },
  {
    id: 'dashboard-context',
    category: 'Dashboard',
    name: 'Context Menus',
    description: 'Right-click menus work on files',
    testUrl: '/test-dashboard',
    instructions: [
      'Right-click on any file',
      'Try context menu options',
      'Verify actions work'
    ],
    expectedResult: 'Context menu appears with Share, Download, Delete options',
    status: 'pending'
  },

  // Editor Tests
  {
    id: 'editor-text',
    category: 'Editor',
    name: 'Text Editing',
    description: 'Add, edit, and format text elements',
    testUrl: '/test-editor',
    instructions: [
      'Click text tool or press T key',
      'Click on canvas to add text',
      'Double-click text to edit',
      'Use Bold/Italic buttons',
      'Change text color'
    ],
    expectedResult: 'Text elements created, editable, formattable with colors and styles',
    status: 'pending'
  },
  {
    id: 'editor-drag',
    category: 'Editor',
    name: 'Drag & Drop',
    description: 'Elements can be dragged around canvas',
    testUrl: '/test-editor',
    instructions: [
      'Add any element to canvas',
      'Click and drag element',
      'Verify it moves smoothly',
      'Release to place'
    ],
    expectedResult: 'Elements drag smoothly and stay where dropped',
    status: 'pending'
  },
  {
    id: 'editor-resize',
    category: 'Editor',
    name: 'Resize Elements',
    description: 'Elements can be resized with handles',
    testUrl: '/test-editor',
    instructions: [
      'Select any element',
      'Drag corner/edge handles',
      'Verify element resizes',
      'Check properties panel updates'
    ],
    expectedResult: 'Elements resize with handles, properties update in real-time',
    status: 'pending'
  },
  {
    id: 'editor-shapes',
    category: 'Editor',
    name: 'Shape Creation',
    description: 'Add and customize shapes',
    testUrl: '/test-editor',
    instructions: [
      'Click shapes dropdown',
      'Select rectangle/circle/etc',
      'Click canvas to add shape',
      'Change fill/stroke colors',
      'Adjust stroke width'
    ],
    expectedResult: 'Shapes added, colors changeable, stroke customizable',
    status: 'pending'
  },
  {
    id: 'editor-charts',
    category: 'Editor',
    name: 'Chart Insertion',
    description: 'Add charts to slides',
    testUrl: '/test-editor',
    instructions: [
      'Click charts dropdown',
      'Select chart type',
      'Click canvas to add',
      'Verify chart placeholder appears'
    ],
    expectedResult: 'Chart placeholders created with type indicators',
    status: 'pending'
  },
  {
    id: 'editor-background',
    category: 'Editor',
    name: 'Background Color',
    description: 'Change slide background colors',
    testUrl: '/test-editor',
    instructions: [
      'Click background color tool',
      'Select different colors',
      'Verify slide background changes',
      'Try color picker and presets'
    ],
    expectedResult: 'Slide background changes color instantly',
    status: 'pending'
  },
  {
    id: 'editor-slides',
    category: 'Editor',
    name: 'Slide Management',
    description: 'Add, delete, reorder slides',
    testUrl: '/test-editor',
    instructions: [
      'Click + button to add slide',
      'Switch between slides',
      'Verify slide thumbnails update',
      'Check slide numbering'
    ],
    expectedResult: 'New slides created, thumbnails show content, navigation works',
    status: 'pending'
  },
  {
    id: 'editor-undo',
    category: 'Editor',
    name: 'Undo/Redo',
    description: 'History management works',
    testUrl: '/test-editor',
    instructions: [
      'Make several changes',
      'Press Cmd+Z to undo',
      'Press Cmd+Shift+Z to redo',
      'Verify changes reverse/restore'
    ],
    expectedResult: 'Actions undo/redo correctly, buttons disable when no history',
    status: 'pending'
  },
  {
    id: 'editor-properties',
    category: 'Editor',
    name: 'Properties Panel',
    description: 'Element properties are editable',
    testUrl: '/test-editor',
    instructions: [
      'Select any element',
      'Check properties panel appears',
      'Change position/size values',
      'Verify element updates'
    ],
    expectedResult: 'Properties panel shows, edits apply to element immediately',
    status: 'pending'
  },
  {
    id: 'editor-presentation',
    category: 'Editor',
    name: 'Presentation Mode',
    description: 'Full-screen presentation works',
    testUrl: '/test-editor',
    instructions: [
      'Click Present button',
      'Navigate with arrow keys',
      'Press Escape to exit',
      'Verify all slides display'
    ],
    expectedResult: 'Full-screen mode works, navigation smooth, exit clean',
    status: 'pending'
  },

  // World-Class Generation Test
  {
    id: 'world-class-generation',
    category: 'World-Class AI',
    name: 'Real Deck Generation',
    description: 'Test world-class deck generation with actual data',
    instructions: [
      'Go to deck builder (/deck-builder)',
      'Upload a CSV file or use demo data',
      'Complete the context steps',
      'Generate deck and verify quality score shows',
      'Check generated deck has real insights'
    ],
    expectedResult: 'Deck generated with quality score, real data insights, professional slides',
    status: 'pending'
  },

  // Integration Tests
  {
    id: 'nav-integration',
    category: 'Integration',
    name: 'Navigation Integration',
    description: 'My Files link in main nav works',
    testUrl: '/dashboard',
    instructions: [
      'Check main navigation header',
      'Click "My Files" link',
      'Verify goes to file browser'
    ],
    expectedResult: 'My Files link visible for logged in users, navigation works',
    status: 'pending'
  },
  {
    id: 'dashboard-module',
    category: 'Integration',
    name: 'Dashboard File Module',
    description: 'File browser module on dashboard works',
    testUrl: '/dashboard',
    instructions: [
      'Scroll to bottom of dashboard',
      'Find "Recent Presentations" module',
      'Click files to open',
      'Test view toggle'
    ],
    expectedResult: 'File module visible, files clickable, view toggle works',
    status: 'pending'
  },
  {
    id: 'responsive',
    category: 'Integration',
    name: 'Responsive Design',
    description: 'UI works on different screen sizes',
    testUrl: '/test-dashboard',
    instructions: [
      'Resize browser window',
      'Test mobile/tablet sizes',
      'Verify layout adapts',
      'Check touch interactions'
    ],
    expectedResult: 'Layout responsive, mobile-friendly, touch works',
    status: 'pending'
  }
]

export default function FinalQAPage() {
  const [tests, setTests] = useState<QATest[]>(qaTests)
  const [currentTest, setCurrentTest] = useState<QATest | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'passed' | 'failed'>('all')
  const router = useRouter()

  const updateTestStatus = (testId: string, status: TestStatus, notes?: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status, notes } : test
    ))
    if (status === 'passed') {
      toast.success(`✅ ${tests.find(t => t.id === testId)?.name} passed!`)
    } else if (status === 'failed') {
      toast.error(`❌ ${tests.find(t => t.id === testId)?.name} failed`)
    }
  }

  const runTest = async (test: QATest) => {
    setCurrentTest(test)
    updateTestStatus(test.id, 'testing')
    
    if (test.testUrl) {
      // Open test URL in new tab
      window.open(test.testUrl, '_blank')
    }
  }

  const filteredTests = tests.filter(test => 
    filter === 'all' || test.status === filter
  )

  const stats = {
    total: tests.length,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    pending: tests.filter(t => t.status === 'pending').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔧 Final QA Testing Suite
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Comprehensive testing of all editor and dashboard functionality
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
              <div className="text-sm text-green-700">Passed</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <div className="text-sm text-blue-700">Pending</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          {(['all', 'pending', 'passed', 'failed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Test Grid */}
        <div className="grid gap-6">
          {Object.entries(
            filteredTests.reduce((acc, test) => {
              if (!acc[test.category]) acc[test.category] = []
              acc[test.category].push(test)
              return acc
            }, {} as Record<string, QATest[]>)
          ).map(([category, categoryTests]) => (
            <div key={category} className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                {category === 'Dashboard' && <Grid3X3 className="w-5 h-5" />}
                {category === 'Editor' && <Type className="w-5 h-5" />}
                {category === 'Integration' && <Settings className="w-5 h-5" />}
                {category}
              </h2>
              
              <div className="grid gap-4">
                {categoryTests.map(test => (
                  <TestCard
                    key={test.id}
                    test={test}
                    onRun={() => runTest(test)}
                    onUpdateStatus={(status, notes) => updateTestStatus(test.id, status, notes)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-900 text-white rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Quick Test Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ModernButton
              variant="secondary"
              onClick={() => window.open('/test-dashboard', '_blank')}
              leftIcon={<Grid3X3 className="w-4 h-4" />}
            >
              File Browser
            </ModernButton>
            <ModernButton
              variant="secondary"
              onClick={() => window.open('/test-editor', '_blank')}
              leftIcon={<Type className="w-4 h-4" />}
            >
              Editor
            </ModernButton>
            <ModernButton
              variant="secondary"
              onClick={() => window.open('/dashboard', '_blank')}
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Dashboard
            </ModernButton>
            <ModernButton
              variant="secondary"
              onClick={() => window.open('/test-world-class-ui', '_blank')}
              leftIcon={<ExternalLink className="w-4 h-4" />}
            >
              Demo Page
            </ModernButton>
          </div>
        </div>
      </div>

      <Toaster position="bottom-right" richColors expand={true} duration={4000} />
    </div>
  )
}

function TestCard({ test, onRun, onUpdateStatus }: {
  test: QATest
  onRun: () => void
  onUpdateStatus: (status: TestStatus, notes?: string) => void
}) {
  const [notes, setNotes] = useState(test.notes || '')

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />
      case 'testing': return <AlertCircle className="w-5 h-5 text-yellow-600 animate-pulse" />
      default: return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
    }
  }

  return (
    <motion.div
      className={cn(
        "border rounded-lg p-4 transition-all",
        test.status === 'passed' && "border-green-200 bg-green-50",
        test.status === 'failed' && "border-red-200 bg-red-50",
        test.status === 'testing' && "border-yellow-200 bg-yellow-50",
        test.status === 'pending' && "border-gray-200 bg-white"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(test.status)}
            <h3 className="font-medium text-gray-900">{test.name}</h3>
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{test.description}</p>
          
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 mb-1">Instructions:</h4>
            <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
              {test.instructions.map((instruction, idx) => (
                <li key={idx}>{instruction}</li>
              ))}
            </ol>
          </div>
          
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 mb-1">Expected Result:</h4>
            <p className="text-xs text-gray-600">{test.expectedResult}</p>
          </div>

          {test.status === 'testing' && (
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Test Notes:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 text-xs border border-gray-300 rounded resize-none"
                rows={2}
                placeholder="Any issues or observations..."
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {test.status === 'pending' && (
            <ModernButton
              variant="primary"
              size="sm"
              onClick={onRun}
              leftIcon={<ExternalLink className="w-3 h-3" />}
            >
              Test
            </ModernButton>
          )}
          
          {test.status === 'testing' && (
            <>
              <ModernButton
                variant="primary"
                size="sm"
                onClick={() => onUpdateStatus('passed', notes)}
              >
                ✅ Pass
              </ModernButton>
              <ModernButton
                variant="danger"
                size="sm"
                onClick={() => onUpdateStatus('failed', notes)}
              >
                ❌ Fail
              </ModernButton>
            </>
          )}

          {(test.status === 'passed' || test.status === 'failed') && (
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={() => onUpdateStatus('pending')}
            >
              Reset
            </ModernButton>
          )}
        </div>
      </div>
    </motion.div>
  )
}