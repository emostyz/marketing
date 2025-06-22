'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Users, 
  Zap, 
  BarChart3, 
  Lock, 
  Headphones, 
  GitBranch, 
  Database,
  CheckCircle,
  ArrowRight,
  Building,
  Globe,
  Target,
  Brain
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function EnterprisePage() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    useCase: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle enterprise contact form submission
    console.log('Enterprise contact:', contactForm)
  }

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Enterprise Security',
      description: 'SOC 2 Type II compliance, SSO integration, and advanced security controls.',
      details: ['SOC 2 Type II certified', 'SAML/OIDC SSO', 'Data encryption at rest and in transit', 'Audit logs and compliance reporting']
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Unlimited Team Access',
      description: 'No limits on team size. Organize users with roles and permissions.',
      details: ['Unlimited team members', 'Role-based access control', 'Department organization', 'User activity monitoring']
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Custom AI Training',
      description: 'Train our AI on your company data and presentation styles.',
      details: ['Custom AI models', 'Company-specific insights', 'Brand voice training', 'Industry-specific analysis']
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: 'Data Integration',
      description: 'Connect to your existing data sources and business intelligence tools.',
      details: ['CRM integration', 'Database connectors', 'API access', 'Real-time data sync']
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'On-Premise Deployment',
      description: 'Deploy AEDRIN within your infrastructure for maximum control.',
      details: ['Private cloud deployment', 'On-premise installation', 'Hybrid configurations', 'Air-gapped environments']
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: 'Dedicated Support',
      description: '24/7 dedicated support team with guaranteed response times.',
      details: ['Dedicated account manager', '24/7 phone support', 'SLA guarantees', 'Priority bug fixes']
    }
  ]

  const useCases = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Executive Reporting',
      description: 'Transform complex data into executive-ready presentations automatically.',
      companies: 'Used by Fortune 500 C-suites'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Sales Enablement',
      description: 'Create compelling sales decks with real-time customer data integration.',
      companies: 'Boosting sales team productivity by 40%'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Investor Relations',
      description: 'Generate investor updates and board presentations with consistent branding.',
      companies: 'Trusted by public companies'
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: 'Consulting Firms',
      description: 'Scale presentation creation across multiple client engagements.',
      companies: 'McKinsey-quality presentations at scale'
    }
  ]

  const testimonials = [
    {
      quote: "AEDRIN transformed how our executive team communicates insights. What used to take our analysts days now happens in minutes.",
      author: "Sarah Chen",
      role: "Chief Data Officer",
      company: "Fortune 100 Technology Company"
    },
    {
      quote: "The AI understands our industry context better than most humans. It's like having a McKinsey consultant on every project.",
      author: "Michael Rodriguez",
      role: "Managing Partner",
      company: "Global Consulting Firm"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Enterprise AI Presentations
          </h1>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Scale world-class presentation creation across your entire organization with enterprise-grade security and custom AI training.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
                Request Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="text-lg px-8 py-3">
                View Pricing
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-4 gap-8 mb-20"
        >
          {[
            { number: '500+', label: 'Enterprise Customers' },
            { number: '95%', label: 'Time Savings' },
            { number: '99.9%', label: 'Uptime SLA' },
            { number: '24/7', label: 'Dedicated Support' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">{stat.number}</div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6">Enterprise Features</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything your organization needs to scale AI-powered presentations securely and efficiently.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIdx) => (
                      <li key={detailIdx} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-gray-900/50 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Enterprise Use Cases</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See how leading organizations use AEDRIN to transform their presentation workflows.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    {useCase.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                    <p className="text-gray-300 mb-3">{useCase.description}</p>
                    <p className="text-purple-400 text-sm font-medium">{useCase.companies}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6">What Enterprise Customers Say</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8"
            >
              <blockquote className="text-lg text-gray-300 mb-6">
                "{testimonial.quote}"
              </blockquote>
              <div>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-gray-400">{testimonial.role}</div>
                <div className="text-blue-400 text-sm">{testimonial.company}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gray-900/50 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300">
                Schedule a demo to see how AEDRIN can transform your organization's presentations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.company}
                      onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Team Size *
                    </label>
                    <select
                      required
                      value={contactForm.teamSize}
                      onChange={(e) => setContactForm(prev => ({ ...prev, teamSize: e.target.value }))}
                      className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select team size</option>
                      <option value="1-10">1-10 people</option>
                      <option value="11-50">11-50 people</option>
                      <option value="51-200">51-200 people</option>
                      <option value="201-1000">201-1000 people</option>
                      <option value="1000+">1000+ people</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Use Case *
                  </label>
                  <select
                    required
                    value={contactForm.useCase}
                    onChange={(e) => setContactForm(prev => ({ ...prev, useCase: e.target.value }))}
                    className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select primary use case</option>
                    <option value="executive-reporting">Executive Reporting</option>
                    <option value="sales-enablement">Sales Enablement</option>
                    <option value="investor-relations">Investor Relations</option>
                    <option value="consulting">Consulting</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Tell us about your presentation needs, timeline, or any specific requirements..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                >
                  Request Enterprise Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}