import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Allow access to auth pages, admin pages, and public pages
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/pricing') ||
    request.nextUrl.pathname.startsWith('/contact') ||
    request.nextUrl.pathname.startsWith('/about') ||
    request.nextUrl.pathname.startsWith('/enterprise') ||
    request.nextUrl.pathname.startsWith('/upload') ||
    request.nextUrl.pathname.startsWith('/demo') ||
    request.nextUrl.pathname.startsWith('/templates') ||
    request.nextUrl.pathname.startsWith('/internal-test') ||
    request.nextUrl.pathname.startsWith('/test-editor') ||
    request.nextUrl.pathname.startsWith('/files') ||
    request.nextUrl.pathname.startsWith('/test-world-class') ||
    request.nextUrl.pathname.startsWith('/test-final-qa')
  ) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/settings', '/deck-builder', '/presentations']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route) && 
    !request.nextUrl.pathname.includes('/deck-builder/demo-deck-')
  )
  
  if (!isProtectedRoute) {
    return NextResponse.next()
  }


  // Check for demo session first
  const demoSession = request.cookies.get('demo-session')?.value;
  const demoAuthToken = request.cookies.get('sb-demo-auth-token')?.value;
  
  if (demoSession === 'active' || demoAuthToken === 'demo-token') {
    console.log('✅ Demo session found, allowing access')
    return NextResponse.next();
  }

  // Check for Supabase authentication cookies with dynamic detection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://waddrfstpqkvdfwbxvfw.supabase.co'
  const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'waddrfstpqkvdfwbxvfw'
  
  // Check for various Supabase cookie patterns
  const cookieNames = [
    `sb-${projectRef}-auth-token`,
    `sb-${projectRef}-auth-token.0`,
    `sb-${projectRef}-auth-token.1`,
    'supabase-auth-token',
    'supabase.auth.token'
  ]
  
  const allCookies = request.cookies.getAll()
  console.log('🔍 All cookies in middleware:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value, length: c.value?.length })))
  
  // Check for old Supabase cookies that need to be cleared
  const oldSupabaseCookies = allCookies.filter(cookie => 
    cookie.name.startsWith('sb-') && 
    !cookie.name.includes(projectRef) &&
    cookie.name.includes('auth-token')
  )
  
  const hasAuthCookie = cookieNames.some(name => {
    const cookie = request.cookies.get(name)?.value
    const isValid = cookie && cookie.length > 20 && cookie.includes('.')
    if (cookie) {
      console.log(`🔍 Checking cookie ${name}: length=${cookie.length}, hasValue=${!!cookie}, isValid=${isValid}`)
    }
    return isValid
  })
  
  if (hasAuthCookie) {
    console.log('✅ Valid auth cookie found, allowing access')
    return NextResponse.next();
  }
  
  // Don't auto-clear cookies, just log them for debugging
  if (oldSupabaseCookies.length > 0) {
    console.log('🔍 Found old Supabase cookies (not clearing automatically):', oldSupabaseCookies.map(c => c.name))
  }
  
  console.log('❌ No valid auth cookie found, redirecting to login');

  // No valid session, redirect to login with return URL
  const loginUrl = new URL('/auth/login', request.url)
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};