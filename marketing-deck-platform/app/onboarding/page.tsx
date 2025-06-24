'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ArrowLeft, Building2, User, Target, BarChart3, Palette, Presentation, Brain } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

interface IntakeFormData {
  // Personal Info
  fullName: string
  email: string
  phone: string
  jobTitle: string
  companyName: string
  
  // Business Context
  industry: string
  targetAudience: string
  businessContext: string
  businessGoals: string[]
  keyQuestions: string[]
  
  // Data & Analytics
  keyMetrics: string[]
  datasetTypes: string[]
  usagePlan: string
  
  // Presentation Preferences
  presentationStyle: string
  brandColors: {
    primary: string
    secondary: string
  }
  
  // Additional
  customRequirements: string
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
  'Real Estate', 'Consulting', 'Marketing', 'Non-profit', 'Government', 'Other'
]

const BUSINESS_GOALS = [
  'Increase Revenue', 'Improve Efficiency', 'Market Expansion', 'Customer Acquisition',
  'Brand Awareness', 'Product Launch', 'Investor Relations', 'Team Performance',
  'Cost Reduction', 'Digital Transformation'
]

const KEY_QUESTIONS = [
  'How are we performing vs competitors?', 'What drives our customer behavior?',
  'Which marketing channels are most effective?', 'How efficient are our operations?',
  'What are our growth opportunities?', 'How satisfied are our customers?',
  'What are our biggest cost centers?', 'How productive is our team?'
]

const METRICS = [
  'Revenue', 'Profit Margin', 'Customer Acquisition Cost', 'Customer Lifetime Value',
  'Conversion Rate', 'Churn Rate', 'Market Share', 'Employee Productivity',
  'Customer Satisfaction', 'Website Traffic', 'Social Media Engagement', 'ROI'
]

const DATASET_TYPES = [
  'Sales Data', 'Marketing Analytics', 'Financial Reports', 'Customer Data',
  'Product Analytics', 'Operational Metrics', 'Survey Results', 'Social Media Data',
  'Website Analytics', 'Employee Data', 'Market Research', 'Competitive Analysis'
]

const USAGE_PLANS = [
  'Weekly executive reports', 'Monthly board presentations', 'Quarterly business reviews',
  'Ad-hoc analysis requests', 'Client presentations', 'Team dashboards',
  'Investor updates', 'Strategic planning sessions'
]

const PRESENTATION_STYLES = [
  'Executive/Corporate', 'Creative/Modern', 'Technical/Analytical', 'Sales-Focused',
  'Academic/Educational', 'Startup/Innovative', 'Consulting', 'Minimalist'
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  
  const [formData, setFormData] = useState<IntakeFormData>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    jobTitle: '',
    companyName: '',
    industry: '',
    targetAudience: '',
    businessContext: '',
    businessGoals: [],
    keyQuestions: [],
    keyMetrics: [],
    datasetTypes: [],
    usagePlan: '',
    presentationStyle: '',
    brandColors: {
      primary: '#3b82f6',
      secondary: '#10b981'
    },
    customRequirements: ''
  })

  const totalSteps = 6

  const updateFormData = (field: keyof IntakeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: keyof IntakeFormData, item: string) => {
    const currentArray = formData[field] as string[]
    if (currentArray.includes(item)) {
      updateFormData(field, currentArray.filter(i => i !== item))
    } else {
      updateFormData(field, [...currentArray, item])
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')
    
    try {
      // First, update the profile with onboarding data
      const result = await updateProfile({
        name: formData.fullName,
        jobTitle: formData.jobTitle,
        phone: formData.phone,
        companyName: formData.companyName,
        industry: formData.industry,
        targetAudience: formData.targetAudience,
        businessContext: formData.businessContext,
        masterSystemPrompt: `Business Goals: ${formData.businessGoals.join(', ')}. Key Questions: ${formData.keyQuestions.join(', ')}. Custom Requirements: ${formData.customRequirements}`,
        keyMetrics: formData.keyMetrics,
        brandColors: JSON.stringify(formData.brandColors)
      })
      
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Then mark onboarding as completed
      const onboardingResult = await updateProfile({
        onboardingCompleted: true
      })
      
      if (onboardingResult.error) {
        console.error('Failed to mark onboarding as completed:', onboardingResult.error)
        // Don't fail the whole process if this fails
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding completion error:', error)
      setError('Failed to save profile. Please try again.')
      setLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.companyName
      case 2:
        return formData.industry && formData.jobTitle
      case 3:
        return formData.businessGoals.length > 0
      case 4:
        return formData.keyMetrics.length > 0 && formData.datasetTypes.length > 0
      case 5:
        return formData.presentationStyle && formData.usagePlan
      case 6:
        return true
      default:
        return true
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold mb-2 text-white">Welcome! Let&apos;s get to know you</h2>
              <p className="text-gray-400">Tell us about yourself and your company</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-gray-300">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateFormData('fullName', e.target.value)}
                  placeholder="John Smith"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-300">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="john@company.com"
                  className="bg-gray-800 border-gray-600 text-white"
                  disabled
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="companyName" className="text-gray-300">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  placeholder="Acme Corporation"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold mb-2 text-white">About Your Business</h2>
              <p className="text-gray-400">Help us understand your industry and role</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobTitle" className="text-gray-300">Your Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => updateFormData('jobTitle', e.target.value)}
                  placeholder="CEO, Marketing Director, etc."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="industry" className="text-gray-300">Industry *</Label>
                <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="targetAudience" className="text-gray-300">Target Audience</Label>
              <Textarea
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => updateFormData('targetAudience', e.target.value)}
                placeholder="Describe your primary customers or stakeholders..."
                rows={3}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="businessContext" className="text-gray-300">Business Context</Label>
              <Textarea
                id="businessContext"
                value={formData.businessContext}
                onChange={(e) => updateFormData('businessContext', e.target.value)}
                placeholder="Tell us about your business model, current challenges, or key focus areas..."
                rows={3}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold mb-2 text-white">Your Business Goals</h2>
              <p className="text-gray-400">What are you trying to achieve? (Select all that apply)</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BUSINESS_GOALS.map((goal) => (
                <div
                  key={goal}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.businessGoals.includes(goal)
                      ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                  }`}
                  onClick={() => toggleArrayItem('businessGoals', goal)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.businessGoals.includes(goal)}
                    />
                    <span className="text-sm font-medium">{goal}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <Label className="text-gray-300">Key Questions You Want Answered</Label>
              <p className="text-sm text-gray-500 mb-3">Select the questions most relevant to your needs</p>
              <div className="space-y-2">
                {KEY_QUESTIONS.map((question) => (
                  <div
                    key={question}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.keyQuestions.includes(question)
                        ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                    }`}
                    onClick={() => toggleArrayItem('keyQuestions', question)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.keyQuestions.includes(question)}
                      />
                      <span className="text-sm">{question}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold mb-2 text-white">Data & Analytics</h2>
              <p className="text-gray-400">What metrics and data types are most important to you?</p>
            </div>
            
            <div>
              <Label className="text-gray-300">Key Metrics You Track *</Label>
              <p className="text-sm text-gray-500 mb-3">Select your most important business metrics</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {METRICS.map((metric) => (
                  <div
                    key={metric}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.keyMetrics.includes(metric)
                        ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                    }`}
                    onClick={() => toggleArrayItem('keyMetrics', metric)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.keyMetrics.includes(metric)}
                      />
                      <span className="text-sm font-medium">{metric}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300">Types of Data You Work With *</Label>
              <p className="text-sm text-gray-500 mb-3">What kinds of datasets do you typically analyze?</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DATASET_TYPES.map((type) => (
                  <div
                    key={type}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.datasetTypes.includes(type)
                        ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                    }`}
                    onClick={() => toggleArrayItem('datasetTypes', type)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.datasetTypes.includes(type)}
                      />
                      <span className="text-sm font-medium">{type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Presentation className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold mb-2 text-white">Presentation Preferences</h2>
              <p className="text-gray-400">How do you like your presentations designed?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="presentationStyle" className="text-gray-300">Presentation Style *</Label>
                <Select value={formData.presentationStyle} onValueChange={(value) => updateFormData('presentationStyle', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Choose your preferred style" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESENTATION_STYLES.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="usagePlan" className="text-gray-300">Usage Plan *</Label>
                <Select value={formData.usagePlan} onValueChange={(value) => updateFormData('usagePlan', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="How will you use presentations?" />
                  </SelectTrigger>
                  <SelectContent>
                    {USAGE_PLANS.map((plan) => (
                      <SelectItem key={plan} value={plan}>
                        {plan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300">Brand Colors</Label>
              <p className="text-sm text-gray-500 mb-3">Choose colors that match your brand</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor" className="text-sm text-gray-400">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.brandColors.primary}
                      onChange={(e) => updateFormData('brandColors', { ...formData.brandColors, primary: e.target.value })}
                      className="w-12 h-10 rounded border bg-gray-800"
                    />
                    <Input
                      value={formData.brandColors.primary}
                      onChange={(e) => updateFormData('brandColors', { ...formData.brandColors, primary: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1 bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor" className="text-sm text-gray-400">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.brandColors.secondary}
                      onChange={(e) => updateFormData('brandColors', { ...formData.brandColors, secondary: e.target.value })}
                      className="w-12 h-10 rounded border bg-gray-800"
                    />
                    <Input
                      value={formData.brandColors.secondary}
                      onChange={(e) => updateFormData('brandColors', { ...formData.brandColors, secondary: e.target.value })}
                      placeholder="#10b981"
                      className="flex-1 bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Palette className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold mb-2 text-white">Final Details</h2>
              <p className="text-gray-400">Any additional requirements or preferences?</p>
            </div>
            
            <div>
              <Label htmlFor="customRequirements" className="text-gray-300">Custom Requirements</Label>
              <Textarea
                id="customRequirements"
                value={formData.customRequirements}
                onChange={(e) => updateFormData('customRequirements', e.target.value)}
                placeholder="Any specific requirements, templates you prefer, or additional context..."
                rows={4}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-white">Summary of Your Preferences</h3>
              <div className="space-y-2 text-gray-300">
                <div><strong>Company:</strong> {formData.companyName}</div>
                <div><strong>Industry:</strong> {formData.industry}</div>
                <div><strong>Goals:</strong> 
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.businessGoals.map(goal => (
                      <Badge key={goal} variant="secondary" className="text-xs">{goal}</Badge>
                    ))}
                  </div>
                </div>
                <div><strong>Key Metrics:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.keyMetrics.slice(0, 5).map(metric => (
                      <Badge key={metric} variant="outline" className="text-xs">{metric}</Badge>
                    ))}
                    {formData.keyMetrics.length > 5 && (
                      <Badge variant="outline" className="text-xs">+{formData.keyMetrics.length - 5} more</Badge>
                    )}
                  </div>
                </div>
                <div><strong>Presentation Style:</strong> {formData.presentationStyle}</div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your AEDRIN Profile</h1>
          <p className="text-gray-400">Help us personalize your experience</p>
        </div>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white">Setup Your Profile</CardTitle>
              <div className="text-sm text-gray-400">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
              
              {currentStep === totalSteps ? (
                <Button
                  onClick={handleComplete}
                  disabled={!isStepValid() || loading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <span>{loading ? 'Saving...' : 'Complete Setup'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}