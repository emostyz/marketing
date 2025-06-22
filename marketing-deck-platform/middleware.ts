import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

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

  // Allow access to auth pages
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/pricing') ||
    request.nextUrl.pathname.startsWith('/contact') ||
    request.nextUrl.pathname.startsWith('/about') ||
    request.nextUrl.pathname.startsWith('/enterprise')
  ) {
    return NextResponse.next();
  }

  // Check for authentication
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Get the session from the request cookies
  const authCookie = request.cookies.get('sb-access-token')?.value;
  const refreshCookie = request.cookies.get('sb-refresh-token')?.value;

  if (!authCookie && !refreshCookie) {
    // No auth cookies, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Verify the session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      // Invalid session, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Valid session, allow access
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth error:', error);
    // Error occurred, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};