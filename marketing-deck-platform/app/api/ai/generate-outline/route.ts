import { NextRequest, NextResponse } from 'next/server'
import { generateOutlineAgent } from '@/lib/agents/generate-outline-agent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support structure proposal generation with feedback
    if (body.requestType === 'structure_proposal') {
      // Generate slide structure based on insights and feedback
      const mockSlides = [
        {
          id: 'slide-1',
          title: 'Executive Summary',
          description: 'High-level overview of key performance metrics and strategic insights',
          type: 'intro',
          order: 1,
          content: {
            bullet_points: [
              'Revenue grew 35% this quarter, exceeding targets',
              'Customer acquisition efficiency improved significantly', 
              'Key risk identified in customer concentration'
            ]
          }
        },
        {
          id: 'slide-2', 
          title: 'Revenue Growth Momentum',
          description: 'Deep dive into accelerating revenue trends and contributing factors',
          type: 'key_insight',
          order: 2,
          content: {
            bullet_points: [
              'Monthly recurring revenue increased from $50K to $90K',
              'Growth rate accelerated in the last two months',
              'Product-market fit indicators are strong'
            ],
            chart_type: 'line',
            data_focus: 'monthly_revenue_trend'
          }
        },
        {
          id: 'slide-3',
          title: 'Customer Acquisition Efficiency',
          description: 'Analysis of improving unit economics and customer acquisition metrics',
          type: 'data_analysis',
          order: 3,
          content: {
            bullet_points: [
              'Customer Acquisition Cost decreased 22% to $117',
              'Customer Lifetime Value increased to $520',
              'LTV:CAC ratio improved to 4.4x'
            ],
            chart_type: 'bar',
            data_focus: 'cac_ltv_metrics'
          }
        },
        {
          id: 'slide-4',
          title: 'Customer Concentration Risk',
          description: 'Risk assessment of revenue dependency on key accounts',
          type: 'key_insight',
          order: 4,
          content: {
            bullet_points: [
              'Top 3 customers represent 45% of total revenue',
              'Creates vulnerability to customer churn',
              'Diversification strategy needed'
            ],
            chart_type: 'pie',
            data_focus: 'revenue_concentration'
          }
        },
        {
          id: 'slide-5',
          title: 'Strategic Recommendations',
          description: 'Action items and next steps based on data insights',
          type: 'recommendation',
          order: 5,
          content: {
            bullet_points: [
              'Increase marketing spend to capitalize on momentum',
              'Implement customer diversification strategy',
              'Scale customer success team to maintain quality'
            ]
          }
        },
        {
          id: 'slide-6',
          title: 'Next Quarter Outlook',
          description: 'Forward-looking projections and key metrics to track',
          type: 'conclusion',
          order: 6,
          content: {
            bullet_points: [
              'Target: $120K monthly revenue by Q4',
              'Goal: Reduce top 3 customer concentration to <35%',
              'Focus: Maintain sub-$120 CAC while scaling'
            ]
          }
        }
      ]

      return NextResponse.json({
        success: true,
        slides: mockSlides,
        userId: body.userId,
        requestType: body.requestType,
        feedbackApplied: Object.keys(body.feedback || {}).length
      })
    }

    // For regular outline generation, require analysisData
    if (!body.analysisData) {
      return NextResponse.json(
        { error: 'analysisData is required for outline generation' },
        { status: 400 }
      )
    }

    const result = await generateOutlineAgent({
      ...body,
      userId: body.userId,
      chatContinuity: body.chatContinuity
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Outline generation error:', error)
    return NextResponse.json(
      { error: 'Outline generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}