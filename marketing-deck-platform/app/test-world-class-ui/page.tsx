'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Grid3X3, List, Search, Plus, Upload, FileText, 
  Play, Settings, Star, Download, Share2, Eye,
  ArrowRight, Sparkles, Zap, Layers
} from 'lucide-react'
import { ModernButton } from '@/components/ui/ModernButton'
import { toast, Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { pageTransitions } from '@/lib/animations/transitions'

const features = [
  {
    title: "Google Drive-Style Dashboard",
    description: "File browser with grid/list views, multi-select, context menus, and smooth animations",
    icon: Grid3X3,
    color: "blue",
    href: "/test-dashboard"
  },
  {
    title: "Modern Presentation Editor", 
    description: "Drag-and-drop editor with real-time collaboration, auto-save, and keyboard shortcuts",
    icon: Play,
    color: "green", 
    href: "/test-editor"
  },
  {
    title: "Smart File Upload",
    description: "Enhanced CSV analysis with McKinsey-level insights and strategic recommendations",
    icon: Upload,
    color: "purple",
    href: "/internal-test"
  }
]

const demos = [
  {
    title: "Command Palette (⌘K)",
    description: "Search anything, anywhere",
    action: () => toast.info("Try ⌘K on any page!")
  },
  {
    title: "Keyboard Shortcuts",
    description: "⌘Z undo, ⌘S save, ⌘A select all",
    action: () => toast.success("All shortcuts work!")
  },
  {
    title: "Auto-save",
    description: "Like Google Docs - never lose work",
    action: () => toast.success("Auto-save active!")
  },
  {
    title: "Context Menus",
    description: "Right-click anywhere for actions",
    action: () => toast.info("Right-click on any file!")
  }
]

export default function WorldClassUIDemo() {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)
  const router = useRouter()

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
      {...pageTransitions}
    >
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Modern UI Overhaul Complete
          </motion.div>
          
          <motion.h1 
            className="text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            AEDRIN: Now <span className="text-blue-600">World-Class</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            From hackathon project to Google Workspace quality. 
            Every interaction is smooth, every feature works perfectly.
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ModernButton 
              size="lg"
              leftIcon={<Play className="w-5 h-5" />}
              onClick={() => router.push('/test-dashboard')}
            >
              Try the Dashboard
            </ModernButton>
            <ModernButton 
              variant="secondary"
              size="lg"
              leftIcon={<Eye className="w-5 h-5" />}
              onClick={() => router.push('/test-editor')}
            >
              Open Editor
            </ModernButton>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group"
            >
              <div 
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full"
                onClick={() => router.push(feature.href)}
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                  feature.color === 'blue' && "bg-blue-100",
                  feature.color === 'green' && "bg-green-100", 
                  feature.color === 'purple' && "bg-purple-100"
                )}>
                  <feature.icon className={cn(
                    "w-6 h-6",
                    feature.color === 'blue' && "text-blue-600",
                    feature.color === 'green' && "text-green-600",
                    feature.color === 'purple' && "text-purple-600"
                  )} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                  Try it now
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Demos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Interactive Features
            </h2>
            <p className="text-gray-600">
              Click to test these Google Workspace-quality features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {demos.map((demo, index) => (
              <motion.button
                key={demo.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                onClick={demo.action}
                className="p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 mb-1">
                  {demo.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {demo.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quality Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-16 grid md:grid-cols-4 gap-6"
        >
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Optimized animations" },
            { icon: Layers, title: "Design System", desc: "Consistent tokens" },
            { icon: Settings, title: "Keyboard First", desc: "Power user ready" },
            { icon: Star, title: "Enterprise Grade", desc: "Production ready" }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16 text-center text-gray-500"
        >
          <p>
            Built with Framer Motion, Radix UI, and modern React patterns.
            <br />
            Every component follows Google Workspace design principles.
          </p>
        </motion.div>
      </div>

      <Toaster 
        position="bottom-right"
        richColors
        expand={true}
        duration={4000}
      />
    </motion.div>
  )
}