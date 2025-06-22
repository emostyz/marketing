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

  // Allow access to auth pages and public pages
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/pricing') ||
    request.nextUrl.pathname.startsWith('/contact') ||
    request.nextUrl.pathname.startsWith('/about') ||
    request.nextUrl.pathname.startsWith('/enterprise') ||
    request.nextUrl.pathname.startsWith('/upload') ||
    request.nextUrl.pathname.startsWith('/demo') ||
    request.nextUrl.pathname.startsWith('/templates')
  ) {
    return NextResponse.next();
  }

  // Check for demo session first
  const demoSession = request.cookies.get('demo-session')?.value;
  if (demoSession) {
    // Demo session exists, allow access
    return NextResponse.next();
  }

  // Check for Supabase authentication cookies
  const authCookie = request.cookies.get('sb-waddrfstpqkvdfwbxvfw-auth-token')?.value;
  const refreshCookie = request.cookies.get('sb-waddrfstpqkvdfwbxvfw-auth-token.0')?.value;

  if (authCookie || refreshCookie) {
    // Auth cookies exist, allow access
    return NextResponse.next();
  }

  // No valid session, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};