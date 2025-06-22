"use client"
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Brain, ArrowRight, ArrowLeft, Building2, User, Target } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface SignupFormData {
  // Basic Info
  name: string
  email: string
  password: string
  company: string
  jobTitle: string
  industry: string
  
  // Goals & Purpose
  primaryGoal: string
  presentationFrequency: string
  targetAudience: string
  businessChallenges: string[]
  
  // Data & Preferences
  dataTypes: string[]
  presentationStyle: string
  currentTools: string[]
  keyMetrics: string[]
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
  'Real Estate', 'Consulting', 'Marketing', 'Non-profit', 'Government', 'Other'
]

const PRIMARY_GOALS = [
  'Create executive presentations', 'Quarterly business reviews', 'Client proposals',
  'Marketing presentations', 'Sales pitches', 'Board meetings', 'Team reports', 'Other'
]

const PRESENTATION_FREQUENCIES = [
  'Daily', 'Weekly', 'Monthly', 'Quarterly', 'As needed'
]

const BUSINESS_CHALLENGES = [
  'Data analysis takes too long', 'Creating compelling visuals', 'Telling a clear story',
  'Keeping stakeholders engaged', 'Meeting tight deadlines', 'Ensuring brand consistency',
  'Collaborating with teams', 'Getting buy-in from leadership'
]

const DATA_TYPES = [
  'Sales data', 'Marketing analytics', 'Financial reports', 'Customer data',
  'Product metrics', 'Operational data', 'Survey results', 'Market research', 'Other'
]

const PRESENTATION_STYLES = [
  'Executive/Corporate', 'Creative/Modern', 'Technical/Analytical', 'Sales-focused',
  'Academic/Educational', 'Startup/Innovative', 'Consulting', 'Minimalist'
]

const CURRENT_TOOLS = [
  'PowerPoint', 'Google Slides', 'Keynote', 'Canva', 'Prezi', 'Figma', 'Excel/Sheets', 'Tableau', 'Other'
]

const KEY_METRICS = [
  'Revenue', 'Growth rate', 'Customer acquisition', 'Conversion rates', 'Market share',
  'Customer satisfaction', 'ROI', 'Operational efficiency', 'Team performance', 'Other'
]

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    company: '',
    jobTitle: '',
    industry: '',
    primaryGoal: '',
    presentationFrequency: '',
    targetAudience: '',
    businessChallenges: [],
    dataTypes: [],
    presentationStyle: '',
    currentTools: [],
    keyMetrics: []
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const router = useRouter()
  const { signUp, signInWithOAuth } = useAuth()

  const totalSteps = 4

  const updateFormData = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: keyof SignupFormData, item: string) => {
    const currentArray = formData[field] as string[]
    if (currentArray.includes(item)) {
      updateFormData(field, currentArray.filter(i => i !== item))
    } else {
      updateFormData(field, [...currentArray, item])
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.email && formData.password && formData.company && formData.jobTitle
      case 2:
        return formData.industry && formData.primaryGoal && formData.presentationFrequency
      case 3:
        return formData.businessChallenges.length > 0 && formData.dataTypes.length > 0
      case 4:
        return formData.presentationStyle && formData.currentTools.length > 0
      default:
        return true
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await signUp(formData.name, formData.email, formData.password, formData)
      
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        router.push('/welcome')
      }
    } catch (err) {
      setError('Network error occurred')
      setLoading(false)
    }
  }

  const handleOAuthSignup = async (provider: 'google' | 'github' | 'microsoft') => {
    setOauthLoading(provider)
    setError('')
    
    try {
      const result = await signInWithOAuth(provider)
      
      if (result.error) {
        setError(result.error)
        setOauthLoading(null)
      }
    } catch (error: any) {
      setError(error.message || 'OAuth signup failed')
      setOauthLoading(null)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold mb-2 text-white">Let's get started</h2>
              <p className="text-gray-400">Tell us about yourself and your company</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-300">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="john@company.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company" className="text-gray-300">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Acme Corporation"
                />
              </div>
              <div>
                <Label htmlFor="jobTitle" className="text-gray-300">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => updateFormData('jobTitle', e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="CEO, Marketing Director, etc."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                required
                minLength={6}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Create a password (min 6 characters)"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold mb-2 text-white">About Your Business</h2>
              <p className="text-gray-400">Help us understand your industry and goals</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Industry *</Label>
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
              <div>
                <Label className="text-gray-300">Primary Goal *</Label>
                <Select value={formData.primaryGoal} onValueChange={(value) => updateFormData('primaryGoal', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="What's your main use case?" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIMARY_GOALS.map((goal) => (
                      <SelectItem key={goal} value={goal}>
                        {goal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300">Presentation Frequency *</Label>
              <Select value={formData.presentationFrequency} onValueChange={(value) => updateFormData('presentationFrequency', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="How often do you create presentations?" />
                </SelectTrigger>
                <SelectContent>
                  {PRESENTATION_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {freq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-gray-300">Target Audience</Label>
              <Textarea
                value={formData.targetAudience}
                onChange={(e) => updateFormData('targetAudience', e.target.value)}
                placeholder="Who do you typically present to? (executives, clients, team members, etc.)"
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
              <h2 className="text-2xl font-bold mb-2 text-white">Challenges & Data</h2>
              <p className="text-gray-400">What challenges do you face and what data do you work with?</p>
            </div>
            
            <div>
              <Label className="text-gray-300">Business Challenges *</Label>
              <p className="text-sm text-gray-500 mb-3">Select the challenges you face (choose all that apply)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BUSINESS_CHALLENGES.map((challenge) => (
                  <div
                    key={challenge}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.businessChallenges.includes(challenge)
                        ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                    }`}
                    onClick={() => toggleArrayItem('businessChallenges', challenge)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.businessChallenges.includes(challenge)}
                        readOnly
                      />
                      <span className="text-sm">{challenge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300">Types of Data You Work With *</Label>
              <p className="text-sm text-gray-500 mb-3">Select all data types you typically analyze</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DATA_TYPES.map((type) => (
                  <div
                    key={type}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.dataTypes.includes(type)
                        ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                    }`}
                    onClick={() => toggleArrayItem('dataTypes', type)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.dataTypes.includes(type)}
                        readOnly
                      />
                      <span className="text-sm font-medium">{type}</span>
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
              <Brain className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold mb-2 text-white">Preferences & Tools</h2>
              <p className="text-gray-400">Tell us about your current workflow and preferences</p>
            </div>
            
            <div>
              <Label className="text-gray-300">Presentation Style *</Label>
              <Select value={formData.presentationStyle} onValueChange={(value) => updateFormData('presentationStyle', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="What style do you prefer?" />
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
              <Label className="text-gray-300">Current Tools *</Label>
              <p className="text-sm text-gray-500 mb-3">What tools do you currently use?</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CURRENT_TOOLS.map((tool) => (
                  <div
                    key={tool}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.currentTools.includes(tool)
                        ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                    }`}
                    onClick={() => toggleArrayItem('currentTools', tool)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.currentTools.includes(tool)}
                        readOnly
                      />
                      <span className="text-sm font-medium">{tool}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300">Key Metrics You Track</Label>
              <p className="text-sm text-gray-500 mb-3">Select the metrics most important to your role</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {KEY_METRICS.map((metric) => (
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
                        readOnly
                      />
                      <span className="text-sm font-medium">{metric}</span>
                    </div>
                  </div>
                ))}
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
      <div className="w-full max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-3xl font-bold text-white mb-2">Join AEDRIN</h1>
          <p className="text-gray-400">Create your account and tell us about your needs</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-400">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={currentStep === totalSteps ? handleSignup : (e) => { e.preventDefault(); nextStep(); }}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
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
                  type="submit"
                  disabled={!isStepValid() || loading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isStepValid()}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>

          {/* OAuth Options (only on first step) */}
          {currentStep === 1 && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleOAuthSignup('google')}
                  disabled={loading || oauthLoading !== null}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 rounded-lg py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {oauthLoading === 'google' ? (
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    '🔍'
                  )}
                  {oauthLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthSignup('github')}
                  disabled={loading || oauthLoading !== null}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {oauthLoading === 'github' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    '🐙'
                  )}
                  {oauthLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}