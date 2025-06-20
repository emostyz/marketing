import { cookies } from 'next/headers'

export interface User {
  id: number
  email: string
  name: string
  avatar?: string
  subscription: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  lastLoginAt: Date
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: Date
}

// Mock user database - in production, this would be a real database
const mockUsers: User[] = [
  {
    id: 1,
    email: 'demo@aedrin.com',
    name: 'Demo User',
    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=ffffff',
    subscription: 'pro',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date()
  },
  {
    id: 2,
    email: 'admin@aedrin.com',
    name: 'Admin User',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=10b981&color=ffffff',
    subscription: 'enterprise',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date()
  }
]

// Mock sessions storage
const activeSessions = new Map<string, AuthSession>()

export class AuthSystem {
  static async authenticate(email: string, password: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    // Simple authentication - in production, use proper password hashing
    const user = mockUsers.find(u => u.email === email)
    
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Mock password validation (accept any password for demo)
    if (!password || password.length < 4) {
      return { success: false, error: 'Invalid password' }
    }

    // Create session
    const session: AuthSession = {
      user: { ...user, lastLoginAt: new Date() },
      token: this.generateToken(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }

    // Store session
    activeSessions.set(session.token, session)

    return { success: true, session }
  }

  static async register(email: string, password: string, name: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    // Check if user already exists
    if (mockUsers.find(u => u.email === email)) {
      return { success: false, error: 'User already exists' }
    }

    // Validate input
    if (!email || !password || !name) {
      return { success: false, error: 'All fields are required' }
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' }
    }

    // Create new user
    const newUser: User = {
      id: mockUsers.length + 1,
      email,
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff`,
      subscription: 'free',
      createdAt: new Date(),
      lastLoginAt: new Date()
    }

    mockUsers.push(newUser)

    // Create session
    const session: AuthSession = {
      user: newUser,
      token: this.generateToken(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }

    activeSessions.set(session.token, session)

    return { success: true, session }
  }

  static async getSession(token: string): Promise<AuthSession | null> {
    const session = activeSessions.get(token)
    
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        activeSessions.delete(token)
      }
      return null
    }

    return session
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get('auth-token')?.value
      
      if (!token) {
        // Check for demo user
        const demoUser = cookieStore.get('demo-user')?.value
        if (demoUser === 'true') {
          return mockUsers[0] // Return demo user
        }
        return null
      }

      const session = await this.getSession(token)
      return session?.user || null
    } catch {
      return null
    }
  }

  static async logout(token: string): Promise<boolean> {
    const deleted = activeSessions.delete(token)
    return deleted
  }

  static async setAuthCookie(session: AuthSession): Promise<void> {
    const cookieStore = await cookies()
    
    // Set auth token cookie
    cookieStore.set('auth-token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    // Set user info cookie for client-side access
    cookieStore.set('user-info', JSON.stringify({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      subscription: session.user.subscription
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60
    })
  }

  static async clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies()
    
    cookieStore.delete('auth-token')
    cookieStore.delete('user-info')
    cookieStore.delete('demo-user')
  }

  static async setDemoMode(): Promise<void> {
    const cookieStore = await cookies()
    
    cookieStore.set('demo-user', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60
    })

    // Set demo user info
    cookieStore.set('user-info', JSON.stringify({
      id: 1,
      name: 'Demo User',
      email: 'demo@aedrin.com',
      subscription: 'pro'
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60
    })
  }

  private static generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36)
  }

  static async requireAuth(): Promise<User> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('Authentication required')
    }
    return user
  }

  static async requireSubscription(minLevel: 'free' | 'pro' | 'enterprise' = 'free'): Promise<User> {
    const user = await this.requireAuth()
    
    const levels = { free: 0, pro: 1, enterprise: 2 }
    const userLevel = levels[user.subscription]
    const requiredLevel = levels[minLevel]
    
    if (userLevel < requiredLevel) {
      throw new Error(`${minLevel} subscription required`)
    }
    
    return user
  }
}