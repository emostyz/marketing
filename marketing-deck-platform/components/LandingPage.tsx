'use client'
import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BarChart3, Clock, Zap, Upload, Brain, Users } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const [email, setEmail] = useState('')

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <section className="w-full max-w-4xl text-center mt-24 mb-16">
        <motion.h1
          className="text-5xl md:text-7xl font-grotesk font-bold mb-6 bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#10B981] text-transparent bg-clip-text animate-gradient"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          AEDRIN: AI-Powered Marketing Decks<br />for Visionary Teams
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-blue-200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          AEDRIN (aedrin.ai) transforms your marketing data into stunning, executive-ready presentations in minutes.
        </motion.p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button>Get Started with AEDRIN</Button>
          <Button variant="outline">See Live Demo</Button>
        </div>
      </section>

      {/* 3D Dashboard Preview Placeholder */}
      <section className="w-full flex justify-center mb-16">
        <div className="w-[420px] h-[260px] bg-white/10 border border-white/20 rounded-2xl shadow-[0_0_30px_#3B82F680] flex items-center justify-center text-blue-300 font-mono text-lg">
          {/* Replace with react-three-fiber 3D preview */}
          [3D AEDRIN Dashboard Preview Coming Soon]
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <Card className="hover:shadow-[0_0_40px_#3B82F6] transition-shadow">
          <h3 className="text-xl font-grotesk mb-2">AI Narrative Generation</h3>
          <p className="text-blue-200">Turn raw data into executive-ready stories with one click.</p>
        </Card>
        <Card className="hover:shadow-[0_0_40px_#8B5CF6] transition-shadow">
          <h3 className="text-xl font-grotesk mb-2">Dynamic Charting</h3>
          <p className="text-blue-200">Auto-detects your data and builds beautiful, interactive charts.</p>
        </Card>
        <Card className="hover:shadow-[0_0_40px_#10B981] transition-shadow">
          <h3 className="text-xl font-grotesk mb-2">1-Click Export</h3>
          <p className="text-blue-200">Export to PowerPoint, Google Slides, or PDF instantly.</p>
        </Card>
      </section>

      {/* Animated Stats */}
      <section className="w-full max-w-4xl flex flex-col md:flex-row justify-center gap-8 mb-20">
        <Card className="flex-1 text-center">
          <span className="text-4xl font-bold text-[#3B82F6]">+1M</span>
          <div className="text-blue-200">Slides Generated</div>
        </Card>
        <Card className="flex-1 text-center">
          <span className="text-4xl font-bold text-[#8B5CF6]">99.9%</span>
          <div className="text-blue-200">Uptime</div>
        </Card>
        <Card className="flex-1 text-center">
          <span className="text-4xl font-bold text-[#10B981]">4.9/5</span>
          <div className="text-blue-200">User Rating</div>
        </Card>
      </section>

      {/* Testimonial Carousel Placeholder */}
      <section className="w-full max-w-3xl mb-24">
        <Card className="text-center py-8">
          <div className="italic text-blue-100 mb-4">“AEDRIN made our marketing data sing. The decks are beautiful, the AI narrative is spot on, and our execs are blown away.”</div>
          <div className="font-grotesk text-lg text-white">— VP Marketing, Global SaaS</div>
        </Card>
      </section>
    </div>
  )
}