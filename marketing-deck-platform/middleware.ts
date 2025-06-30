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
  const protectedRoutes = ['/dashboard', '/settings', '/presentations', '/deck-builder']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route) && 
    !request.nextUrl.pathname.includes('/deck-builder/demo-deck-')
  )
  
  if (!isProtectedRoute) {
    return NextResponse.next()
  }
  
  // Check for Supabase auth cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'waddrfstpqkvdfwbxvfw'
  
  // Check multiple possible cookie names for compatibility
  const cookieNames = [
    `sb-${projectRef}-auth-token`,
    'sb-qezexjgyvzwanfrgqaio-auth-token',
    'sb-waddrfstpqkvdfwbxvfw-auth-token'
  ]
  
  const hasValidCookie = cookieNames.some(name => {
    const cookie = request.cookies.get(name)
    return cookie && cookie.value && cookie.value.length > 20
  })
  
  if (hasValidCookie) {
    // User appears to be authenticated
    return NextResponse.next()
  }

  // No valid session, redirect to login with return URL
  const loginUrl = new URL('/auth/login', request.url)
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};