"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Users, Award, Globe, Zap, Shield, Star, CheckCircle, ArrowRight, Rocket, Target, Heart, Lightbulb, TrendingUp, Clock, Users2, Code, Database, Cloud, Smartphone, Monitor, BarChart3, Lock, Headphones, Palette } from 'lucide-react'
import PublicPageLayout from '@/components/layout/PublicPageLayout'

const team = [
  {
    name: 'Dr. Sarah Chen',
    role: 'CEO & Co-Founder',
    bio: 'Performance product marketing manager at a FAANG company. Built this platform to solve the pain of creating data-driven presentations that actually convert.',
    avatar: '👩‍💼',
    linkedin: '#',
    twitter: '#'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO & Co-Founder',
    bio: 'Ex-engineering lead at Microsoft. Built scalable systems for millions of users. Loves turning complex data into beautiful, actionable insights.',
    avatar: '👨‍💼',
    linkedin: '#',
    twitter: '#'
  },
  {
    name: 'Emily Watson',
    role: 'Head of Product',
    bio: 'Former product manager at Google. Passionate about user experience and making complex tools feel simple and intuitive.',
    avatar: '👩‍💻',
    linkedin: '#',
    twitter: '#'
  },
  {
    name: 'David Kim',
    role: 'Head of Engineering',
    bio: 'Full-stack expert with deep AI/ML experience. Led engineering teams at Uber and Airbnb.',
    avatar: '👨‍🔬',
    linkedin: '#',
    twitter: '#'
  },
  {
    name: 'Lisa Thompson',
    role: 'Head of Design',
    bio: 'Design leader from Apple and Pinterest. Creates experiences that users love and remember.',
    avatar: '👩‍🎨',
    linkedin: '#',
    twitter: '#'
  },
  {
    name: 'Alex Johnson',
    role: 'Head of Sales',
    bio: 'Enterprise sales expert who helped scale companies from startup to unicorn. Knows what businesses really need.',
    avatar: '👨‍💼',
    linkedin: '#',
    twitter: '#'
  }
]

const timeline = [
  {
    year: '2022',
    title: 'The Beginning',
    description: 'Founded by AI researchers frustrated with manual presentation creation. Started with a simple idea: what if AI could do this?',
    icon: Lightbulb
  },
  {
    year: '2023',
    title: 'First Prototype',
    description: 'Built the first working prototype. Generated 100+ presentations in testing. Users were amazed by the quality and speed.',
    icon: Rocket
  },
  {
    year: '2024',
    title: 'Product Launch',
    description: 'Launched AEDRIN to the public. 10,000+ users in the first month. Featured in TechCrunch and Forbes.',
    icon: Star
  },
  {
    year: '2025',
    title: 'Global Expansion',
    description: 'Expanding to serve enterprise customers worldwide. Building the future of AI-powered business communication.',
    icon: Globe
  }
]

const stats = [
  { number: '10,000+', label: 'Presentations Created', icon: BarChart3 },
  { number: '500+', label: 'Happy Customers', icon: Users },
  { number: '95%', label: 'Time Saved', icon: Clock },
  { number: '4.9/5', label: 'Customer Rating', icon: Star }
]

const values = [
  {
    title: 'Innovation First',
    description: 'We constantly push the boundaries of what\'s possible with AI and technology to deliver cutting-edge solutions.',
    icon: Lightbulb,
    color: 'blue'
  },
  {
    title: 'Customer Obsessed',
    description: 'Every feature we build is designed with our customers in mind. We listen, learn, and iterate based on real user feedback.',
    icon: Heart,
    color: 'red'
  },
  {
    title: 'Trust & Security',
    description: 'We take data security seriously. Your information is protected with enterprise-grade security measures.',
    icon: Shield,
    color: 'green'
  },
  {
    title: 'Accessibility',
    description: 'We believe powerful tools should be accessible to everyone, regardless of their technical expertise or budget.',
    icon: Globe,
    color: 'purple'
  },
  {
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, from our product quality to our customer support.',
    icon: Award,
    color: 'yellow'
  },
  {
    title: 'Impact',
    description: 'We measure our success by the positive impact we have on our customers\' productivity and success.',
    icon: TrendingUp,
    color: 'orange'
  }
]

const whySection = {
  title: "Why We Built AEDRIN",
  subtitle: "The story behind the platform that's changing how businesses present data",
  story: [
    {
      title: "The Problem We Lived",
      content: "As a performance product marketing manager at a FAANG company, I spent countless hours creating quarterly business reviews, board presentations, and investor decks. Every month, I'd stare at spreadsheets full of data, knowing the insights were there, but struggling to turn them into compelling narratives that would drive decisions.",
      icon: Target
    },
    {
      title: "The Breaking Point",
      content: "It was 2 AM before a crucial board meeting. I had spent 12 hours manually creating charts, writing bullet points, and trying to make the data tell a story. The presentation looked good, but I knew it could be so much better. That's when I realized: there had to be a better way.",
      icon: Clock
    },
    {
      title: "The Vision",
      content: "What if we could combine the analytical rigor of a data scientist with the storytelling skills of a marketer? What if AI could understand your data, identify the key insights, and automatically create presentations that not only look professional but actually drive action?",
      icon: Brain
    },
    {
      title: "The Solution",
      content: "AEDRIN was born from this vision. We built it to be the platform that transforms raw data into compelling narratives, automates the tedious parts of presentation creation, and helps teams focus on what matters most: making decisions that drive business growth.",
      icon: Rocket
    }
  ]
}

export default function AboutPage() {
  return (
    <PublicPageLayout>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-full text-blue-300 text-sm mb-6">
            <Rocket className="w-4 h-4 mr-2" />
            Revolutionizing Business Presentations
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            About
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> AEDRIN</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            We\'re revolutionizing how businesses create and deliver presentations with the power of artificial intelligence.
          </p>
        </div>
      </section>

      {/* Why We Built AEDRIN Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-gray-900/50 to-blue-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{whySection.title}</h2>
            <p className="text-xl text-gray-300">{whySection.subtitle}</p>
          </div>
          
          <div className="space-y-12">
            {whySection.story.map((story, index) => {
              const IconComponent = story.icon
              const isEven = index % 2 === 0
              
              return (
                <div key={index} className={`flex items-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="flex-1">
                    <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mr-6">
                          <IconComponent className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{story.title}</h3>
                      </div>
                      <p className="text-lg text-gray-300 leading-relaxed">{story.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="w-full h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-gray-700 flex items-center justify-center">
                      <IconComponent className="w-24 h-24 text-blue-400/50" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                At AEDRIN, we believe that every business deserves access to world-class presentation tools. 
                Our mission is to democratize the creation of compelling, data-driven presentations through 
                the power of artificial intelligence.
              </p>
              <p className="text-lg text-gray-300 mb-8">
                We\'re building the future of business communication, where insights are automatically 
                discovered, stories are intelligently crafted, and presentations are created in minutes, 
                not hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button className="bg-blue-600 text-white px-8 py-3 transition-colors">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 px-8 py-3">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-gray-700 flex items-center justify-center">
                <Brain className="w-32 h-32 text-blue-400" />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-gray-700 flex items-center justify-center">
                <Target className="w-12 h-12 text-purple-400" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full border border-gray-700 flex items-center justify-center">
                <Zap className="w-10 h-10 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="px-6 py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Journey</h2>
            <p className="text-xl text-gray-300">From idea to global platform</p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            <div className="space-y-12">
              {timeline.map((item, index) => {
                const IconComponent = item.icon
                const isEven = index % 2 === 0
                
                return (
                  <div key={index} className={`flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${isEven ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                            <IconComponent className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-400">{item.year}</div>
                            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                          </div>
                        </div>
                        <p className="text-gray-300">{item.description}</p>
                      </div>
                    </div>
                    
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-gray-900 relative z-10"></div>
                    
                    <div className="w-1/2"></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-300">The principles that guide everything we do</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              const colorClasses = {
                blue: 'bg-blue-500/20 text-blue-400',
                red: 'bg-red-500/20 text-red-400',
                green: 'bg-green-500/20 text-green-400',
                purple: 'bg-purple-500/20 text-purple-400',
                yellow: 'bg-yellow-500/20 text-yellow-400',
                orange: 'bg-orange-500/20 text-orange-400'
              }
              
              return (
                <div key={index} className="text-center p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className={`w-16 h-16 ${colorClasses[value.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                  <p className="text-gray-300">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-6 py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-300">
              We\'re a passionate team of engineers, designers, and business professionals dedicated to 
              transforming how the world creates presentations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">{member.avatar}</div>
                  <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                  <p className="text-blue-400 font-medium">{member.role}</p>
                </div>
                <p className="text-gray-300 text-sm mb-4">{member.bio}</p>
                <div className="flex justify-center space-x-3">
                  <a href={member.linkedin} className="text-gray-400 hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href={member.twitter} className="text-gray-400 hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join Us in Shaping the Future</h2>
          <p className="text-xl text-gray-300 mb-8">
            Ready to transform how your business creates presentations? Start your journey with AEDRIN today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-lg font-semibold transition-colors">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 px-8 py-4 text-lg font-semibold">
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </PublicPageLayout>
  )
} 