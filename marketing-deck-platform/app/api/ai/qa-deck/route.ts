import { NextRequest, NextResponse } from 'next/server'
import { qaDeckAgent } from '@/lib/agents/qa-deck-agent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.userId || !body.contentData) {
      return NextResponse.json(
        { error: 'userId and contentData are required' },
        { status: 400 }
      )
    }

    // Simulate QA with revisions
    const maxRevisions = body.maxRevisions || 2
    let currentRevision = 0
    
    await new Promise(resolve => setTimeout(resolve, 3000)) // Initial QA pass

    const qaResults = {
      initialQuality: {
        contentScore: 0.78,
        visualScore: 0.82,
        narrativeScore: 0.75,
        dataAccuracy: 0.95,
        overallScore: 0.83
      },
      identifiedIssues: [
        {
          type: "content",
          severity: "medium",
          description: "Slide 3 bullet points could be more action-oriented",
          suggestion: "Rewrite bullets to emphasize impact and outcomes",
          slide: 3
        },
        {
          type: "visual",
          severity: "low", 
          description: "Revenue chart colors could better match brand theme",
          suggestion: "Adjust chart colors to blue gradient for consistency",
          slide: 2
        },
        {
          type: "narrative",
          severity: "medium",
          description: "Transition between slides 4 and 5 needs better flow",
          suggestion: "Add connecting statement about risk mitigation leading to recommendations",
          slide: 4
        }
      ],
      revisions: []
    }

    // Perform revisions if enabled
    if (body.enableRevisions && maxRevisions > 0) {
      for (let i = 0; i < maxRevisions; i++) {
        currentRevision++
        await new Promise(resolve => setTimeout(resolve, 2000)) // Revision processing time

        const revision = {
          revisionNumber: currentRevision,
          changes: [
            {
              slide: 3,
              change: "Rewrote bullet points to be more action-oriented",
              before: "Customer Acquisition Cost decreased 22% to $117",
              after: "Achieved 22% reduction in customer acquisition cost, enabling $28 savings per customer"
            },
            {
              slide: 2,
              change: "Updated chart colors for brand consistency", 
              before: "Default chart colors",
              after: "Blue gradient theme matching brand guidelines"
            }
          ],
          improvedScores: {
            contentScore: 0.78 + (i + 1) * 0.08,
            visualScore: 0.82 + (i + 1) * 0.06,
            narrativeScore: 0.75 + (i + 1) * 0.09,
            dataAccuracy: 0.95,
            overallScore: 0.83 + (i + 1) * 0.07
          },
          processingTime: `${2 + i * 0.5}s`
        }

        qaResults.revisions.push(revision)
      }
    }

    const finalDeck = {
      slides: [
        {
          id: "slide-1",
          title: "Executive Summary",
          content: {
            bullet_points: [
              "Revenue grew 35% this quarter, demonstrating strong market traction",
              "Customer acquisition efficiency improved by 22%, optimizing growth economics", 
              "Identified customer concentration risk requires strategic diversification"
            ],
            layout: { type: "title_and_bullets", theme: "executive" }
          },
          charts: [],
          position: 1
        },
        {
          id: "slide-2",
          title: "Revenue Growth Momentum",
          content: {
            bullet_points: [
              "Monthly recurring revenue increased 73% from $52K to $90K",
              "Growth rate accelerated in Q2 with strong product-market fit signals",
              "Exponential growth pattern (R² = 0.94) indicates scalable business model"
            ],
            layout: { type: "content_and_chart", theme: "data_focus" }
          },
          charts: ["revenue_growth_trend"],
          position: 2
        },
        {
          id: "slide-3", 
          title: "Customer Acquisition Efficiency",
          content: {
            bullet_points: [
              "Achieved 22% reduction in customer acquisition cost, enabling $28 savings per customer",
              "Customer Lifetime Value increased 16% to $520, strengthening unit economics",
              "LTV:CAC ratio improved to 4.4x, exceeding industry benchmark of 3x"
            ],
            layout: { type: "content_and_chart", theme: "performance" }
          },
          charts: ["cac_ltv_evolution"],
          position: 3
        },
        {
          id: "slide-4",
          title: "Customer Concentration Analysis",
          content: {
            bullet_points: [
              "Top 3 customers represent 45% of total revenue, creating dependency risk",
              "Enterprise segment drives high value but requires balanced growth strategy",
              "Channel performance shows referral excellence with lowest CAC and highest conversion"
            ],
            layout: { type: "dual_chart", theme: "analysis" }
          },
          charts: ["revenue_concentration", "channel_performance"],
          position: 4
        },
        {
          id: "slide-5",
          title: "Strategic Growth Recommendations",
          content: {
            bullet_points: [
              "Scale marketing investment to capitalize on proven growth momentum",
              "Implement customer diversification strategy to reduce concentration risk",
              "Optimize channel mix by expanding referral program and improving paid efficiency"
            ],
            layout: { type: "recommendations", theme: "strategic" }
          },
          charts: [],
          position: 5
        },
        {
          id: "slide-6",
          title: "Next Quarter Targets",
          content: {
            bullet_points: [
              "Target: $120K monthly revenue by Q4 end (33% growth)",
              "Goal: Reduce top 3 customer concentration below 35%",
              "Objective: Maintain customer acquisition cost under $120 while scaling"
            ],
            layout: { type: "goals_and_metrics", theme: "forward_looking" }
          },
          charts: [],
          position: 6
        }
      ],
      charts: body.contentData.charts || [],
      metadata: {
        presentationId: body.presentationId,
        userId: body.userId,
        createdAt: new Date().toISOString(),
        qaCompleted: true,
        revisionsPerformed: currentRevision,
        finalQualityScore: qaResults.revisions.length > 0 
          ? qaResults.revisions[qaResults.revisions.length - 1].improvedScores.overallScore 
          : qaResults.initialQuality.overallScore
      },
      editableComponents: {
        textEditable: true,
        chartsEditable: true,
        layoutEditable: true,
        themeEditable: true
      }
    }

    // Support legacy format for backward compatibility
    if (body.finalDeck) {
      const result = await qaDeckAgent({
        ...body,
        userId: body.userId,
        chatContinuity: body.chatContinuity
      })
      return NextResponse.json(result)
    }

    return NextResponse.json({
      success: true,
      qaResults: qaResults,
      finalDeck: finalDeck,
      userId: body.userId,
      presentationId: body.presentationId,
      chatContinuity: body.chatContinuity,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('QA deck error:', error)
    return NextResponse.json(
      { error: 'QA deck failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}