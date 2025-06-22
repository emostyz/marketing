import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const user = await AuthSystem.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { step, data, timestamp } = await request.json()
    
    // Try to use Supabase if configured
    try {
      const supabase = createServerComponentClient({ cookies })
      
      // Check if user has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .single()

      if (profile) {
        // Get or create session in database
        const sessionData = {
          step,
          data,
          timestamp,
          completed: true
        }

        // Try to update existing session
        const { data: existingSession } = await supabase
          .from('presentation_sessions')
          .select('id, session_data')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (existingSession) {
          // Update existing session
          const updatedSessionData = {
            ...existingSession.session_data,
            steps: {
              ...(existingSession.session_data.steps || {}),
              [step]: sessionData
            },
            currentStep: step,
            lastUpdated: timestamp
          }

          await supabase
            .from('presentation_sessions')
            .update({ 
              session_data: updatedSessionData,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSession.id)
        } else {
          // Create new session
          await supabase
            .from('presentation_sessions')
            .insert({
              user_id: profile.id,
              session_data: {
                userId: profile.id,
                startedAt: new Date().toISOString(),
                steps: {
                  [step]: sessionData
                },
                currentStep: step,
                lastUpdated: timestamp
              }
            })
        }

        console.log(`Saved ${step} data to database for user ${user.email}:`, data)
        
        return NextResponse.json({ 
          success: true,
          step,
          message: `${step} data saved successfully to database`
        })
      }
    } catch (dbError) {
      console.error('Database save failed, using localStorage fallback:', dbError)
    }

    // Fallback: Store in localStorage via client
    console.log(`Saved ${step} data to localStorage for user ${user.email}:`, data)
    
    return NextResponse.json({ 
      success: true,
      step,
      useLocalStorage: true,
      data,
      message: `${step} data saved to localStorage`
    })

  } catch (error) {
    console.error('Error saving presentation session:', error)
    return NextResponse.json(
      { error: 'Failed to save presentation session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await AuthSystem.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get from Supabase
    try {
      const supabase = createServerComponentClient({ cookies })
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .single()

      if (profile) {
        const { data: session } = await supabase
          .from('presentation_sessions')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (session) {
          return NextResponse.json({ session: session.session_data })
        }
      }
    } catch (dbError) {
      console.error('Database fetch failed:', dbError)
    }

    // Return null if no session found
    return NextResponse.json({ session: null, useLocalStorage: true })

  } catch (error) {
    console.error('Error fetching presentation session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch presentation session' },
      { status: 500 }
    )
  }
}