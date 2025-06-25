"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Star, Zap, Crown, Users, BarChart3, Shield, Globe, ArrowRight, TrendingUp, Brain, Award, Clock, Sparkles, Rocket, Target, Infinity, Lock, Headphones, Palette, Code, Database, Cloud, Smartphone, Monitor, Users2 } from 'lucide-react'
import UnifiedLayout from '@/components/layout/UnifiedLayout'

const pricingTiers = [
  {
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Perfect for individuals and small teams getting started',
    icon: Zap,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      '📊 5 presentations per month',
      '🤖 Basic AI insights & analysis',
      '📋 20+ professional templates',
      '📁 CSV/Excel data upload',
      '📄 PDF export',
      '📧 Email support',
      '📈 Basic analytics dashboard',
      '👥 1 team member'
    ],
    limitations: [
      'No advanced AI features',
      'No custom branding',
      'No priority support',
      'No API access'
    ],
    stripePriceId: 'price_starter_monthly',
    popular: false,
    savings: null
  },
  {
    name: 'Professional',
    price: 99,
    period: 'month',
    description: 'For growing teams and businesses that need more power',
    icon: Star,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    features: [
      '📊 25 presentations per month',
      '🧠 Advanced AI insights & predictions',
      '📋 50+ premium templates',
      '📁 All file formats supported',
      '📄 PowerPoint & Keynote export',
      '💬 Priority email & chat support',
      '📈 Advanced analytics & reporting',
      '👥 5 team members',
      '🎨 Custom branding & themes',
      '📊 Advanced charts & visualizations',
      '🤝 Real-time collaboration',
      '🔌 API access'
    ],
    limitations: [
      'No enterprise security features',
      'No dedicated account manager',
      'No SSO integration'
    ],
    stripePriceId: 'price_professional_monthly',
    popular: true,
    savings: 'Most Popular'
  },
  {
    name: 'Enterprise',
    price: 299,
    period: 'month',
    description: 'For large organizations with advanced security needs',
    icon: Crown,
    color: 'gold',
    gradient: 'from-yellow-500 to-orange-500',
    features: [
      '♾️ Unlimited presentations',
      '🧠 Custom AI models & training',
      '🎨 Custom template creation',
      '🔌 All integrations & APIs',
      '📄 All export formats',
      '📞 24/7 phone & priority support',
      '📊 Advanced analytics & BI',
      '👥 Unlimited team members',
      '🎨 Full custom branding',
      '🔒 Advanced security & compliance',
      '🤝 Real-time collaboration',
      '👨‍💼 Dedicated account manager'
    ],
    limitations: [],
    stripePriceId: 'price_enterprise_monthly',
    popular: false,
    savings: 'Best Value'
  }
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'VP of Marketing',
    company: 'TechFlow Inc.',
    content: 'AEDRIN has transformed how we create quarterly presentations. What used to take days now takes hours, and the quality is consistently better.',
    rating: 5,
    avatar: '👩‍💼'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CEO',
    company: 'StartupXYZ',
    content: 'The AI insights are incredible. It\'s like having a data scientist on our team. Our investors are always impressed with our presentations.',
    rating: 5,
    avatar: '👨‍💼'
  },
  {
    name: 'Emily Watson',
    role: 'Product Manager',
    company: 'InnovateCorp',
    content: 'The collaboration features are game-changing. Our entire team can work on presentations simultaneously, and the real-time updates are seamless.',
    rating: 5,
    avatar: '👩‍💻'
  }
]

const faqs = [
  {
    question: 'Can I change my plan at any time?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing adjustments.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with AEDRIN, we\'ll refund your subscription no questions asked.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans. All payments are processed securely through Stripe.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade encryption, SOC 2 compliance, and regular security audits. Your data is never shared with third parties.'
  },
  {
    question: 'Do you offer custom pricing?',
    answer: 'Yes! For Enterprise customers with specific needs, we offer custom pricing and features. Contact our sales team for a personalized quote.'
  },
  {
    question: 'Can I export my presentations?',
    answer: 'Yes! You can export to PowerPoint, PDF, Keynote, and more. Enterprise users also get access to custom export formats.'
  }
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month')
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('Professional')

  const getPrice = (tier: typeof pricingTiers[0]) => {
    if (billingPeriod === 'year') {
      return Math.round(tier.price * 10) // 2 months free for annual
    }
    return tier.price
  }

  const handleSubscribe = async (tier: typeof pricingTiers[0]) => {
    setLoading(tier.name)
    
    try {
      // Create different Stripe checkout URLs for each plan
      const stripeUrls = {
        'Starter': 'https://buy.stripe.com/starter-plan',
        'Professional': 'https://buy.stripe.com/professional-plan', 
        'Enterprise': 'https://buy.stripe.com/enterprise-plan'
      }
      
      // Redirect directly to the specific Stripe page for this plan
      window.open(stripeUrls[tier.name as keyof typeof stripeUrls], '_blank')
    } catch (error) {
      console.error('Error redirecting to checkout:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <UnifiedLayout>

      {/* Header */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-full text-blue-300 text-sm mb-6">
            <Award className="w-4 h-4 mr-2" />
            Trusted by 10,000+ professionals
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Simple, Transparent
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Pricing</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Choose the plan that's right for your business. All plans include our core AI features 
            with no hidden fees or surprises.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-lg ${billingPeriod === 'month' ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'month' ? 'year' : 'month')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'year' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${billingPeriod === 'year' ? 'text-white' : 'text-gray-400'}`}>
              Annual
              <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => {
              const IconComponent = tier.icon
              const isSelected = selectedPlan === tier.name
              
              return (
                <div
                  key={tier.name}
                  className={`relative pt-10 p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-gradient-to-br from-purple-900 to-blue-900 shadow-2xl'
                      : 'border-gray-700 bg-gray-900/80'
                  } ${tier.popular ? 'scale-105 z-10' : 'opacity-90'} hover:border-purple-400 hover:shadow-xl`}
                  onClick={() => setSelectedPlan(tier.name)}
                  style={{ minHeight: 420 }}
                >
                  {tier.popular && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg z-20">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${tier.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-gray-400 mb-6">{tier.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">${getPrice(tier)}</span>
                      <span className="text-gray-400">/{billingPeriod}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {tier.limitations.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">Not included:</h4>
                      <div className="space-y-2">
                        {tier.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <span className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0">×</span>
                            <span className="text-gray-500 text-sm">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleSubscribe(tier)}
                    disabled={loading === tier.name}
                    className={`w-full py-4 text-lg font-semibold transition-colors duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {loading === tier.name ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        🚀 Get Started
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="px-6 py-12 overflow-x-auto">
        <div className="min-w-[700px] max-w-5xl mx-auto">
          <div className="bg-gray-900/50 rounded-2xl border border-gray-700 overflow-hidden">
            {/* Table Header with Icons */}
            <div className="bg-gray-800/60 px-6 py-6">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="text-left text-gray-400 text-sm font-semibold">
                  Feature Comparison
                </div>
                {pricingTiers.map((tier) => {
                  const IconComponent = tier.icon
                  return (
                    <div key={tier.name} className="text-center">
                      <div className={`w-12 h-12 bg-gradient-to-r ${tier.gradient} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-gray-200 text-base font-semibold">{tier.name}</div>
                      <div className="text-gray-400 text-xs">${getPrice(tier)}/{billingPeriod}</div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Table Body - Shortened with categories */}
            <div className="divide-y divide-gray-700">
              {/* Presentations */}
              <div className="grid grid-cols-4 gap-4 items-center px-6 py-4 bg-gray-800/20">
                <div className="text-gray-300 text-sm font-medium">📊 Presentations</div>
                <div className="text-center text-gray-300">5/month</div>
                <div className="text-center text-gray-300">25/month</div>
                <div className="text-center text-gray-300">♾️ Unlimited</div>
              </div>
              
              {/* AI Features */}
              <div className="grid grid-cols-4 gap-4 items-center px-6 py-4">
                <div className="text-gray-300 text-sm font-medium">🤖 AI Features</div>
                <div className="text-center text-gray-300">Basic</div>
                <div className="text-center text-gray-300">Advanced</div>
                <div className="text-center text-gray-300">Custom</div>
              </div>
              
              {/* Templates */}
              <div className="grid grid-cols-4 gap-4 items-center px-6 py-4 bg-gray-800/20">
                <div className="text-gray-300 text-sm font-medium">📋 Templates</div>
                <div className="text-center text-gray-300">20+</div>
                <div className="text-center text-gray-300">50+</div>
                <div className="text-center text-gray-300">🎨 Custom</div>
              </div>
              
              {/* Team Members */}
              <div className="grid grid-cols-4 gap-4 items-center px-6 py-4">
                <div className="text-gray-300 text-sm font-medium">👥 Team Members</div>
                <div className="text-center text-gray-300">1</div>
                <div className="text-center text-gray-300">5</div>
                <div className="text-center text-gray-300">♾️ Unlimited</div>
              </div>
              
              {/* Support */}
              <div className="grid grid-cols-4 gap-4 items-center px-6 py-4 bg-gray-800/20">
                <div className="text-gray-300 text-sm font-medium">💬 Support</div>
                <div className="text-center text-gray-300">📧 Email</div>
                <div className="text-center text-gray-300">💬 Priority</div>
                <div className="text-center text-gray-300">📞 24/7 Phone</div>
              </div>
              
              {/* Security */}
              <div className="grid grid-cols-4 gap-4 items-center px-6 py-4">
                <div className="text-gray-300 text-sm font-medium">🔒 Security</div>
                <div className="text-center text-gray-300">Standard</div>
                <div className="text-center text-gray-300">Enhanced</div>
                <div className="text-center text-gray-300">🔒 Enterprise</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Loved by Teams Worldwide</h2>
            <p className="text-xl text-gray-300">See what our customers are saying</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300">Everything you need to know about AEDRIN pricing</p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Presentations?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals who are already creating stunning presentations with AEDRIN
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 px-8 py-4 text-lg font-semibold">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </UnifiedLayout>
  )
}

