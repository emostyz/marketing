import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { runPipeline } from '@/lib/orchestrator'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Testing Enhanced AI Pipeline Orchestrator...')
    
    // Read test CSV data
    const csvPath = path.join(process.cwd(), 'test_sales_data.csv')
    const csvData = fs.readFileSync(csvPath, 'utf8')
    
    console.log('📊 Test Data Preview:', csvData.split('\n').slice(0, 3).join('\n'))
    
    // Parse CSV data into array format expected by existing orchestrator
    const csvLines = csvData.trim().split('\n')
    const headers = csvLines[0].split(',')
    const rows = csvLines.slice(1).map(line => {
      const values = line.split(',')
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      return row
    })

    // Mock presentation ID and user context in format expected by existing orchestrator
    const testInput = {
      deckId: 'test-presentation-123',
      csvData: rows,
      context: {
        businessGoals: ['performance_analysis', 'regional_comparison', 'product_insights'],
        industry: 'Technology',
        timeframe: '2024 Q1-Q2',
        audience: 'Executive Team',
        presentationType: 'business_review',
        stylePreferences: {
          colorScheme: 'professional',
          chartTypes: ['line', 'bar', 'metrics']
        }
      }
    }
    
    console.log('🎯 Business Context:', testInput.context.businessGoals)
    console.log('⏱️  Starting orchestration...')
    
    const startTime = Date.now()
    const result = await runPipeline(testInput)
    const duration = Date.now() - startTime
    
    console.log(`✅ Orchestration completed in ${duration}ms`)
    console.log('🎯 Result Summary:')
    console.log('- Success:', result.status === 'success')
    console.log('- Total slides:', result.finalDeckJson?.presentation?.slides?.length || 0)
    console.log('- Pipeline steps completed:', result.steps.filter(s => s.status === 'completed').length)
    console.log('- Quality score:', result.metadata?.qualityScore || 'N/A')
    
    if (result.finalDeckJson?.presentation?.slides) {
      console.log('📑 Generated Slides:')
      result.finalDeckJson.presentation.slides.forEach((slide: any, index: number) => {
        console.log(`  ${index + 1}. ${slide.title || 'Untitled'} (${slide.layout || 'default'})`)
      })
    }
    
    if (result.status === 'failed') {
      console.log('⚠️  Pipeline failed')
      const failedSteps = result.steps.filter(s => s.status === 'failed')
      failedSteps.forEach((step, index) => {
        console.log(`  Failed at step ${step.step}: ${step.name} - ${step.error}`)
      })
    }
    
    // Return comprehensive test results
    return NextResponse.json({
      success: true,
      testResults: {
        duration: duration,
        orchestrationSuccess: result.status === 'success',
        totalSlides: result.finalDeckJson?.presentation?.slides?.length || 0,
        pipelineStepsCompleted: result.steps.filter(s => s.status === 'completed').length,
        qualityScore: result.metadata?.qualityScore || 0,
        slideTitles: result.finalDeckJson?.presentation?.slides?.map((s: any) => s.title) || [],
        failedSteps: result.steps.filter(s => s.status === 'failed'),
        fullResult: result
      }
    })
    
  } catch (error) {
    console.error('❌ Orchestration test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}