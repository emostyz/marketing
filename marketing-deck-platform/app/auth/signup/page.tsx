"use client"
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react'

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    role: '',
    goals: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
        setError('Please fill in all required fields')
        return
      }
    }
    if (step === 2) {
      if (!formData.company.trim() || !formData.role.trim()) {
        setError('Please fill in all required fields')
        return
      }
    }
    setError('')
    setStep(step + 1)
  }

  const handleSubmit = () => {
    if (!formData.goals.trim()) {
      setError('Please tell us about your goals')
      return
    }
    
    // For demo purposes, set cookie and redirect
    setLoading(true)
    setError('')
    document.cookie = 'demo-user=true; path=/; max-age=604800' // 1 week
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
    
    // Simulate signup process
    setTimeout(() => {
      setLoading(false)
      router.push('/dashboard')
    }, 1500)
  }

  const handleDemoSignup = () => {
    setLoading(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
      <div className="w-full max-w-lg mx-auto rounded-2xl p-8 bg-gray-900/50 border border-gray-700 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <Brain className="w-12 h-12 text-blue-400 mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-white">Join AEDRIN</h2>
          <p className="text-gray-400 text-center">Create stunning presentations with AI</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= i ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {i}
              </div>
              {i < 3 && <div className={`w-8 h-1 mx-2 ${step > i ? 'bg-blue-600' : 'bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Account Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
                required
              />
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition-all flex items-center justify-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Company Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Company Name *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your company name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select your role</option>
                <option value="ceo">CEO/Founder</option>
                <option value="cmo">CMO</option>
                <option value="marketing">Marketing Manager</option>
                <option value="sales">Sales Manager</option>
                <option value="analyst">Data Analyst</option>
                <option value="consultant">Consultant</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-3 font-semibold transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition-all flex items-center justify-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Your Goals</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">What do you want to achieve with AEDRIN? *</label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                rows={4}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Create executive presentations, analyze marketing data, automate reporting..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-3 font-semibold transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={handleDemoSignup}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            🚀 Skip & Try Demo
          </button>
          <div className="text-center">
            <span className="text-gray-400">Already have an account? </span>
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}