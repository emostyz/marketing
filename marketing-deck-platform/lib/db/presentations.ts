import { supabase, getCurrentUser } from '../supabase'

export interface StageData {
  [key: string]: any
}

export interface PresentationStageUpdate {
  insights_json?: StageData | null
  outline_json?: StageData | null
  styled_slides_json?: StageData | null
  chart_data_json?: StageData | null
  final_deck_json?: StageData | null
}

export interface PresentationRow {
  id: string
  user_id: string
  title: string
  description?: string | null
  status: string
  template_id?: string | null
  data: any
  settings: any
  insights_json?: StageData | null
  outline_json?: StageData | null
  styled_slides_json?: StageData | null
  chart_data_json?: StageData | null
  final_deck_json?: StageData | null
  stage_progress?: any
  stages_metadata?: any
  created_at: string
  updated_at: string
}

export async function saveInsights(deckId: string, insights: StageData): Promise<void> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('presentations')
    .update({ 
      insights_json: insights,
      updated_at: new Date().toISOString()
    })
    .eq('id', deckId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to save insights: ${error.message}`)
  }
}

export async function getInsights(deckId: string): Promise<StageData | null> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('presentations')
    .select('insights_json')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get insights: ${error.message}`)
  }

  return data?.insights_json || null
}

export async function saveOutline(deckId: string, outline: StageData): Promise<void> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('presentations')
    .update({ 
      outline_json: outline,
      updated_at: new Date().toISOString()
    })
    .eq('id', deckId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to save outline: ${error.message}`)
  }
}

export async function getOutline(deckId: string): Promise<StageData | null> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('presentations')
    .select('outline_json')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get outline: ${error.message}`)
  }

  return data?.outline_json || null
}

export async function saveStyledSlides(deckId: string, styledSlides: StageData): Promise<void> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('presentations')
    .update({ 
      styled_slides_json: styledSlides,
      updated_at: new Date().toISOString()
    })
    .eq('id', deckId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to save styled slides: ${error.message}`)
  }
}

export async function getStyledSlides(deckId: string): Promise<StageData | null> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('presentations')
    .select('styled_slides_json')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get styled slides: ${error.message}`)
  }

  return data?.styled_slides_json || null
}

export async function saveChartData(deckId: string, chartData: StageData): Promise<void> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('presentations')
    .update({ 
      chart_data_json: chartData,
      updated_at: new Date().toISOString()
    })
    .eq('id', deckId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to save chart data: ${error.message}`)
  }
}

export async function getChartData(deckId: string): Promise<StageData | null> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('presentations')
    .select('chart_data_json')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get chart data: ${error.message}`)
  }

  return data?.chart_data_json || null
}

export async function saveFinalDeck(deckId: string, finalDeck: StageData): Promise<void> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('presentations')
    .update({ 
      final_deck_json: finalDeck,
      updated_at: new Date().toISOString()
    })
    .eq('id', deckId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to save final deck: ${error.message}`)
  }
}

export async function getFinalDeck(deckId: string): Promise<StageData | null> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('presentations')
    .select('final_deck_json')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get final deck: ${error.message}`)
  }

  return data?.final_deck_json || null
}

export async function getAllStages(deckId: string): Promise<{
  insights: StageData | null
  outline: StageData | null
  styledSlides: StageData | null
  chartData: StageData | null
  finalDeck: StageData | null
  stageProgress?: any
  stagesMetadata?: any
}> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('presentations')
    .select(`
      insights_json,
      outline_json,
      styled_slides_json,
      chart_data_json,
      final_deck_json,
      stage_progress,
      stages_metadata
    `)
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        insights: null,
        outline: null,
        styledSlides: null,
        chartData: null,
        finalDeck: null
      }
    }
    throw new Error(`Failed to get all stages: ${error.message}`)
  }

  return {
    insights: data?.insights_json || null,
    outline: data?.outline_json || null,
    styledSlides: data?.styled_slides_json || null,
    chartData: data?.chart_data_json || null,
    finalDeck: data?.final_deck_json || null,
    stageProgress: data?.stage_progress,
    stagesMetadata: data?.stages_metadata
  }
}

export async function saveMultipleStages(deckId: string, stages: PresentationStageUpdate): Promise<void> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const updateData = {
    ...stages,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('presentations')
    .update(updateData)
    .eq('id', deckId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to save multiple stages: ${error.message}`)
  }
}

export async function getStageProgress(deckId: string): Promise<any> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('presentations')
    .select('stage_progress')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get stage progress: ${error.message}`)
  }

  return data?.stage_progress || null
}

export async function clearStageData(deckId: string, stage: 'insights' | 'outline' | 'styled_slides' | 'chart_data' | 'final_deck'): Promise<void> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const updateData = {
    [`${stage}_json`]: null,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('presentations')
    .update(updateData)
    .eq('id', deckId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to clear ${stage} data: ${error.message}`)
  }
}

export async function clearAllStages(deckId: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('presentations')
    .update({
      insights_json: null,
      outline_json: null,
      styled_slides_json: null,
      chart_data_json: null,
      final_deck_json: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', deckId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to clear all stages: ${error.message}`)
  }
}

export async function getUserStageCompletionSummary(): Promise<any> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .rpc('get_user_stage_completion_summary', { user_uuid: user.id })

  if (error) {
    throw new Error(`Failed to get stage completion summary: ${error.message}`)
  }

  return data
}

export async function ensurePresentationExists(deckId: string, title: string = 'Untitled Presentation'): Promise<PresentationRow> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: existing, error: fetchError } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Failed to check presentation existence: ${fetchError.message}`)
  }

  if (existing) {
    return existing as PresentationRow
  }

  const { data: newPresentation, error: createError } = await supabase
    .from('presentations')
    .insert({
      id: deckId,
      user_id: user.id,
      title,
      status: 'draft',
      data: {},
      settings: {}
    })
    .select()
    .single()

  if (createError) {
    throw new Error(`Failed to create presentation: ${createError.message}`)
  }

  return newPresentation as PresentationRow
}