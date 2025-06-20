'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function loginDemo() {
  // Create a demo session cookie
  const cookieStore = await cookies()
  
  // Set a simple demo session cookie
  cookieStore.set('demo-user', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })
  
  redirect('/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('demo-user')
  redirect('/auth/login')
}