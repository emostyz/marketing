'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Zap, Crown, Building, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for individuals and small teams',
      icon: <Zap className="w-6 h-6" />,
      price: {
        monthly: 0,
        annual: 0
      },
      badge: 'Free Forever',
      features: [
        '5 presentations per month',
        'Basic AI analysis',
        'Standard templates',
        'PDF export',
        'Email support',
        '1 GB storage'
      ],
      limitations: [
        'No PowerPoint export',
        'No custom branding',
        'No team collaboration'
      ],
      cta: 'Start Free',
      href: '/auth/signup',
      popular: false
    },
    {
      name: 'Professional',
      description: 'For growing businesses and teams',
      icon: <Crown className="w-6 h-6" />,
      price: {
        monthly: 29,
        annual: 290
      },
      badge: 'Most Popular',
      features: [
        'Unlimited presentations',
        'Advanced AI insights',
        'Premium templates',
        'PDF & PowerPoint export',
        'Custom branding',
        'Team collaboration (up to 5 users)',
        'Priority support',
        '50 GB storage',
        'Advanced analytics',
        'Integration with Google Drive'
      ],
      limitations: [],
      cta: 'Start 14-day Free Trial',
      href: '/auth/signup?plan=professional',
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'For large organizations with advanced needs',
      icon: <Building className="w-6 h-6" />,
      price: {
        monthly: 99,
        annual: 990
      },
      badge: 'Custom Solutions',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'White-label solution',
        'Custom AI training',
        'SSO integration',
        'Advanced security',
        'Dedicated account manager',
        'Custom integrations',
        'Unlimited storage',
        'SLA guarantee',
        'Phone support',
        'Custom training sessions'
      ],
      limitations: [],
      cta: 'Contact Sales',
      href: '/contact',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Transform your presentations with AI-powered insights. Start free, upgrade when you're ready.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-800/50 border border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Annual
              <span className="ml-2 px-2 py-1 bg-green-600 text-xs rounded">Save 17%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-gray-800/50 border rounded-2xl p-8 ${
                plan.popular
                  ? 'border-blue-500 scale-105 shadow-2xl shadow-blue-500/20'
                  : 'border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                  plan.popular ? 'bg-blue-600/20' : 'bg-gray-700/50'
                }`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.price.monthly === 0 ? (
                    <div className="text-4xl font-bold">Free</div>
                  ) : (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">
                        ${billingCycle === 'monthly' ? plan.price.monthly : Math.round(plan.price.annual / 12)}
                      </span>
                      <span className="text-gray-400">/month</span>
                    </div>
                  )}
                  {billingCycle === 'annual' && plan.price.monthly > 0 && (
                    <div className="text-sm text-green-400">
                      ${plan.price.annual}/year (2 months free!)
                    </div>
                  )}
                </div>

                <Link href={plan.href}>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limitations */}
              {plan.limitations.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-gray-700">
                  {plan.limitations.map((limitation, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <X className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change plans at any time?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing accordingly."
              },
              {
                q: "What happens to my data if I cancel?",
                a: "Your presentations and data remain accessible for 30 days after cancellation. You can export everything during this grace period."
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, we'll refund your payment in full."
              },
              {
                q: "Is there a setup fee?",
                a: "No setup fees ever. You only pay for your subscription, and you can start using all features immediately."
              },
              {
                q: "Can I get a custom plan for my organization?",
                a: "Absolutely! Contact our sales team to discuss custom pricing and features for organizations with special requirements."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
                <h3 className="font-semibold mb-2 text-gray-200">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Join thousands of professionals who are already creating amazing presentations with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}