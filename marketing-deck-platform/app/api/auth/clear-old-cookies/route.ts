import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Clearing old Supabase cookies...')
    
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    // Find all old Supabase cookies (not matching current project)
    const currentProjectId = 'waddrfstpqkvdfwbxvfw'
    const oldCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('sb-') && 
      !cookie.name.includes(currentProjectId)
    )
    
    console.log('🗑️ Found old cookies to clear:', oldCookies.map(c => c.name))
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'Old cookies cleared',
      clearedCookies: oldCookies.map(c => c.name)
    })
    
    // Clear each old cookie
    oldCookies.forEach(cookie => {
      response.cookies.delete(cookie.name)
      console.log(`🗑️ Cleared cookie: ${cookie.name}`)
    })
    
    // Also clear any demo cookies
    response.cookies.delete('demo-session')
    response.cookies.delete('sb-demo-auth-token')
    
    return response
  } catch (error) {
    console.error('❌ Error clearing cookies:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear cookies' 
    }, { status: 500 })
  }
}