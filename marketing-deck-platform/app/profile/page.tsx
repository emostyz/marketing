'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  User, 
  Building2, 
  Target, 
  ArrowLeft,
  Mail,
  Crown,
  Shield,
  Calendar,
  BarChart3,
  Presentation,
  Database,
  Settings,
  Award,
  TrendingUp
} from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [presentations, setPresentations] = useState<any[]>([])
  const [datasets, setDatasets] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Load user's presentations and datasets
    loadUserData()
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      // Load presentations from Supabase
      const { data: userPresentations } = await import('@/lib/supabase/database-helpers').then(m => 
        m.dbHelpers.loadUserPresentations(user.id)
      )
      
      if (userPresentations) {
        setPresentations(userPresentations)
      } else {
        // Fallback to localStorage
        const allPresentations = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('presentation_')) {
            const data = localStorage.getItem(key)
            if (data) {
              const presentation = JSON.parse(data)
              allPresentations.push(presentation)
            }
          }
        }
        setPresentations(allPresentations)
      }

      // Load datasets from Supabase
      const { data: userDatasets } = await import('@/lib/supabase/database-helpers').then(m => 
        m.dbHelpers.loadUserDatasets(user.id)
      )
      
      if (userDatasets) {
        const datasetsWithDisplay = userDatasets.map(d => ({
          name: d.name,
          size: `${Math.round(d.file_size / 1024 / 1024 * 10) / 10} MB`,
          uploaded: d.created_at || d.metadata.uploadedAt,
          rows: d.metadata.rows
        }))
        setDatasets(datasetsWithDisplay)
      } else {
        // Fallback sample data
        setDatasets([
          { name: 'Q4 Sales Data', size: '2.3 MB', uploaded: '2024-01-15', rows: 1250 },
          { name: 'Marketing Analytics', size: '1.8 MB', uploaded: '2024-01-10', rows: 890 },
          { name: 'Customer Survey', size: '0.9 MB', uploaded: '2024-01-05', rows: 456 }
        ])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const getSubscriptionBadge = (status: string) => {
    const badges = {
      free: { icon: User, label: 'Free Plan', color: 'bg-gray-600' },
      pro: { icon: Crown, label: 'Pro Plan', color: 'bg-blue-600' },
      enterprise: { icon: Shield, label: 'Enterprise', color: 'bg-purple-600' }
    }
    
    const badge = badges[status as keyof typeof badges] || badges.free
    const Icon = badge.icon
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </div>
    )
  }

  const getActivityStats = () => {
    return {
      totalPresentations: presentations.length,
      totalDatasets: datasets.length,
      totalSlides: presentations.reduce((sum, p) => sum + (p.slides?.length || 0), 0),
      avgConfidence: presentations.length > 0 
        ? Math.round(presentations.reduce((sum, p) => sum + (p.metadata?.confidence || 0), 0) / presentations.length)
        : 0
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const stats = getActivityStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Profile</h1>
              <p className="text-gray-400">Your account overview and activity summary.</p>
            </div>
            <Button onClick={() => router.push('/settings')} className="bg-blue-600 hover:bg-blue-700">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <div className="text-center">
                <img
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.full_name || 'User')}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-gray-600 mx-auto mb-4"
                />
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  {profile.full_name || 'Your Name'}
                </h3>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{profile.email}</span>
                </div>
                
                <div className="mb-4">
                  {getSubscriptionBadge(profile.subscription_status)}
                </div>
                
                {profile.company && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{profile.company}</span>
                  </div>
                )}
                
                {profile.position && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{profile.position}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>

            {/* Business Goals */}
            {profile.goals && (
              <Card className="p-6 bg-gray-800/50 border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Business Goals
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {profile.goals}
                </p>
              </Card>
            )}
          </div>

          {/* Activity Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gray-800/50 border-gray-700 text-center">
                <Presentation className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.totalPresentations}</div>
                <div className="text-xs text-gray-400">Presentations</div>
              </Card>
              
              <Card className="p-4 bg-gray-800/50 border-gray-700 text-center">
                <Database className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.totalDatasets}</div>
                <div className="text-xs text-gray-400">Datasets</div>
              </Card>
              
              <Card className="p-4 bg-gray-800/50 border-gray-700 text-center">
                <BarChart3 className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.totalSlides}</div>
                <div className="text-xs text-gray-400">Total Slides</div>
              </Card>
              
              <Card className="p-4 bg-gray-800/50 border-gray-700 text-center">
                <Award className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.avgConfidence}%</div>
                <div className="text-xs text-gray-400">Avg Confidence</div>
              </Card>
            </div>

            {/* Recent Presentations */}
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Presentation className="w-4 h-4" />
                Recent Presentations
              </h4>
              
              {presentations.length > 0 ? (
                <div className="space-y-3">
                  {presentations.slice(0, 5).map((presentation, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => router.push(`/deck-builder/${presentation.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Presentation className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">{presentation.title}</h5>
                          <p className="text-gray-400 text-xs">
                            {presentation.slides?.length || 0} slides • 
                            {presentation.metadata?.confidence || 0}% confidence
                          </p>
                        </div>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(presentation.metadata?.generatedAt || '').toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Presentation className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No presentations yet</p>
                  <Button 
                    onClick={() => router.push('/editor/new')}
                    className="mt-3 bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Create Your First Presentation
                  </Button>
                </div>
              )}
            </Card>

            {/* Recent Datasets */}
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Recent Datasets
              </h4>
              
              <div className="space-y-3">
                {datasets.map((dataset, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h5 className="text-white font-medium">{dataset.name}</h5>
                        <p className="text-gray-400 text-xs">
                          {dataset.rows} rows • {dataset.size}
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(dataset.uploaded).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}