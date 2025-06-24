import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('🔍 Middleware processing:', request.nextUrl.pathname)
  
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
    request.nextUrl.pathname.startsWith('/templates')
  ) {
    console.log('✅ Allowing access to public page:', request.nextUrl.pathname)
    return NextResponse.next();
  }

  // Check for demo session first
  const demoSession = request.cookies.get('demo-session')?.value;
  if (demoSession) {
    console.log('🎭 Demo session found, allowing access')
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
  
  const hasAuthCookie = cookieNames.some(name => {
    const cookie = request.cookies.get(name)?.value
    if (cookie) {
      console.log('🔑 Found auth cookie:', name)
      return true
    }
    return false
  })
  
  if (hasAuthCookie) {
    console.log('✅ Auth cookies exist, allowing access')
    return NextResponse.next();
  }

  // No valid session, redirect to login
  console.log('🚫 No valid session, redirecting to login')
  return NextResponse.redirect(new URL('/auth/login', request.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};