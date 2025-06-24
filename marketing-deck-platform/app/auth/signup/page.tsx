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
      const result = await signUp(formData.name, formData.email, formData.password)
      
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
                <Label htmlFor="email" className="text-gray-300">Email *</Label>
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
            
            <div>
              <Label htmlFor="password" className="text-gray-300">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                required
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Create a strong password"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company" className="text-gray-300">Company *</Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Your Company"
                />
              </div>
              <div>
                <Label htmlFor="jobTitle" className="text-gray-300">Job Title *</Label>
                <Input
                  id="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => updateFormData('jobTitle', e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Marketing Manager"
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
              <h2 className="text-2xl font-bold mb-2 text-white">Your Business Context</h2>
              <p className="text-gray-400">Help us understand your industry and goals</p>
            </div>
            
            <div>
              <Label htmlFor="industry" className="text-gray-300">Industry *</Label>
              <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry} className="text-white">
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="primaryGoal" className="text-gray-300">Primary Goal *</Label>
              <Select value={formData.primaryGoal} onValueChange={(value) => updateFormData('primaryGoal', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="What's your main objective?" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {PRIMARY_GOALS.map((goal) => (
                    <SelectItem key={goal} value={goal} className="text-white">
                      {goal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="presentationFrequency" className="text-gray-300">Presentation Frequency *</Label>
              <Select value={formData.presentationFrequency} onValueChange={(value) => updateFormData('presentationFrequency', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="How often do you present?" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {PRESENTATION_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq} value={freq} className="text-white">
                      {freq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="targetAudience" className="text-gray-300">Target Audience</Label>
              <Textarea
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => updateFormData('targetAudience', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Who are your typical presentation audiences? (e.g., executives, clients, team members)"
                rows={3}
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
              <Label className="text-gray-300 mb-3 block">Business Challenges * (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BUSINESS_CHALLENGES.map((challenge) => (
                  <div key={challenge} className="flex items-center space-x-2">
                    <Checkbox
                      id={`challenge-${challenge}`}
                      checked={formData.businessChallenges.includes(challenge)}
                      onCheckedChange={() => toggleArrayItem('businessChallenges', challenge)}
                      className="border-gray-600"
                    />
                    <Label htmlFor={`challenge-${challenge}`} className="text-gray-300 text-sm">
                      {challenge}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300 mb-3 block">Data Types You Work With * (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DATA_TYPES.map((dataType) => (
                  <div key={dataType} className="flex items-center space-x-2">
                    <Checkbox
                      id={`data-${dataType}`}
                      checked={formData.dataTypes.includes(dataType)}
                      onCheckedChange={() => toggleArrayItem('dataTypes', dataType)}
                      className="border-gray-600"
                    />
                    <Label htmlFor={`data-${dataType}`} className="text-gray-300 text-sm">
                      {dataType}
                    </Label>
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
              <p className="text-gray-400">Help us customize your experience</p>
            </div>
            
            <div>
              <Label htmlFor="presentationStyle" className="text-gray-300">Preferred Presentation Style *</Label>
              <Select value={formData.presentationStyle} onValueChange={(value) => updateFormData('presentationStyle', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Choose your preferred style" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {PRESENTATION_STYLES.map((style) => (
                    <SelectItem key={style} value={style} className="text-white">
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-gray-300 mb-3 block">Current Tools You Use * (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CURRENT_TOOLS.map((tool) => (
                  <div key={tool} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tool-${tool}`}
                      checked={formData.currentTools.includes(tool)}
                      onCheckedChange={() => toggleArrayItem('currentTools', tool)}
                      className="border-gray-600"
                    />
                    <Label htmlFor={`tool-${tool}`} className="text-gray-300 text-sm">
                      {tool}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300 mb-3 block">Key Metrics You Track (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {KEY_METRICS.map((metric) => (
                  <div key={metric} className="flex items-center space-x-2">
                    <Checkbox
                      id={`metric-${metric}`}
                      checked={formData.keyMetrics.includes(metric)}
                      onCheckedChange={() => toggleArrayItem('keyMetrics', metric)}
                      className="border-gray-600"
                    />
                    <Label htmlFor={`metric-${metric}`} className="text-gray-300 text-sm">
                      {metric}
                    </Label>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
      <div className="w-full max-w-2xl mx-auto rounded-2xl p-8 bg-gray-900/50 border border-gray-700 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <Brain className="w-12 h-12 text-blue-400 mb-4" />
          <h1 className="text-3xl font-bold mb-2 text-white">Join AEDRIN</h1>
          <p className="text-gray-400 text-center">Create your account and start building amazing presentations</p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <form onSubmit={handleSignup}>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || !isStepValid()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            )}
          </div>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900/50 text-gray-400">or continue with</span>
          </div>
        </div>
        
        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignup('google')}
            disabled={loading || oauthLoading !== null}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
          >
            {oauthLoading === 'google' ? (
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              '🔍'
            )}
            {oauthLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignup('github')}
            disabled={loading || oauthLoading !== null}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
          >
            {oauthLoading === 'github' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              '🐙'
            )}
            {oauthLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignup('microsoft')}
            disabled={loading || oauthLoading !== null}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            {oauthLoading === 'microsoft' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              '🏢'
            )}
            {oauthLoading === 'microsoft' ? 'Connecting...' : 'Continue with Microsoft'}
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}