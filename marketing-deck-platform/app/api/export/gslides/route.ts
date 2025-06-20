import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Google Slides export requires Google OAuth setup. Contact support to enable this feature.' }, { status: 501 })
} 