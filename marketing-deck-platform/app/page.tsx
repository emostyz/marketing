"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Zap, Shield, Users, BarChart3, CheckCircle, ArrowRight, Star, Play, Globe, Award, TrendingUp, Mail, User, Building } from 'lucide-react'
import PublicPageLayout from '@/components/layout/PublicPageLayout'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          company,
          source: 'homepage'
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setEmail('')
        setName('')
        setCompany('')
      } else {
        setError(result.error || 'Something went wrong')
      }
    } catch (error) {
      setError('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <PublicPageLayout className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="flex items-center justify-center min-h-screen py-20">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Thank You!</h1>
            <p className="text-gray-300 mb-8">
              We've received your information and will be in touch soon with early access to AEDRIN.
            </p>
            <div className="space-y-4">
              <Link href="/">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Return to Homepage
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </PublicPageLayout>
    )
  }

  return (
    <PublicPageLayout showComingSoonBar={true}>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-full text-blue-300 text-sm mb-6">
              <Star className="w-4 h-4 mr-2" />
              AI-Powered Marketing Presentations
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Your Data Into
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Stunning Presentations</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Create professional marketing presentations in minutes with AI. Upload your data, 
              and watch as AEDRIN generates compelling slides with charts, insights, and narratives.
            </p>
          </div>

          {/* Lead Capture Form */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleLeadSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12 px-8 py-3 text-lg font-semibold rounded-xl transition-colors"
              >
                {loading ? 'Submitting...' : 'Get Early Access'}
              </Button>
              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">{error}</div>
              )}
            </form>
            
            <div className="text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-950 text-gray-400">or</span>
                </div>
              </div>
              <Link href="/demo" passHref legacyBehavior>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white">
                  🚀 Try Demo (No Account Required)
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10,000+</div>
              <div className="text-gray-400">Presentations Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-400">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-400">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">4.9/5</div>
              <div className="text-gray-400">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose AEDRIN?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The most advanced AI-powered presentation platform designed for modern businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Insights</h3>
              <p className="text-gray-300">
                Our AI analyzes your data and automatically generates compelling insights, 
                trends, and recommendations for your presentations.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-300">
                Create professional presentations in minutes, not hours. 
                Upload your data and get results instantly.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Charts</h3>
              <p className="text-gray-300">
                Automatically generate the perfect charts and visualizations 
                for your data with intelligent chart selection.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Enterprise Security</h3>
              <p className="text-gray-300">
                Bank-level security with end-to-end encryption, 
                SOC 2 compliance, and enterprise-grade data protection.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Team Collaboration</h3>
              <p className="text-gray-300">
                Work together seamlessly with real-time collaboration, 
                comments, and version control for your presentations.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Export Anywhere</h3>
              <p className="text-gray-300">
                Export to PowerPoint, PDF, or share directly. 
                Present anywhere with our cloud-based platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300">
              Three simple steps to create stunning presentations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Upload Your Data</h3>
              <p className="text-gray-300">
                Upload Excel, CSV, or connect to your data sources. 
                Our AI will analyze and understand your data structure.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Generates Content</h3>
              <p className="text-gray-300">
                Our AI creates compelling narratives, charts, and insights 
                tailored to your audience and business context.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Present & Share</h3>
              <p className="text-gray-300">
                Export your presentation or present directly from our platform. 
                Share with your team and stakeholders instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Presentations?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who are already creating stunning presentations with AEDRIN
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <Button className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 text-lg font-semibold transition-colors">
                🚀 Get Started
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold transition-colors">
                🎯 Try Demo
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold transition-colors">
                💰 View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Admin Link */}
      <footer className="px-6 py-4 border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © 2024 AEDRIN. All rights reserved. | 
            <Link href="/admin/login" className="text-gray-400 hover:text-gray-300 ml-2">Admin</Link>
          </p>
        </div>
      </footer>

    </PublicPageLayout>
  )
}
