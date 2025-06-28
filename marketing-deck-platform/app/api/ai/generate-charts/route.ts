import { NextRequest, NextResponse } from 'next/server'
import { generateChartsAgent } from '@/lib/agents/generate-charts-agent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.userId || !body.analysisResults) {
      return NextResponse.json(
        { error: 'userId and analysisResults are required' },
        { status: 400 }
      )
    }

    // Simulate chart generation with Tremor components
    await new Promise(resolve => setTimeout(resolve, 4000)) // 4 second delay for chart processing

    const tremorCharts = {
      charts: [
        {
          id: "revenue_growth_trend",
          type: "LineChart",
          title: "Revenue Growth Trajectory",
          framework: "tremor",
          data: [
            { month: "Jan", revenue: 52000, target: 50000 },
            { month: "Feb", revenue: 58000, target: 55000 },
            { month: "Mar", revenue: 67000, target: 60000 },
            { month: "Apr", revenue: 95000, target: 65000 },
            { month: "May", revenue: 78000, target: 70000 },
            { month: "Jun", revenue: 90000, target: 75000 }
          ],
          config: {
            index: "month",
            categories: ["revenue", "target"],
            colors: ["blue", "gray"],
            yAxisWidth: 60,
            showLegend: true,
            showGridLines: true,
            valueFormatter: "(value) => `$${(value / 1000).toFixed(0)}K`"
          },
          insights: ["Revenue consistently exceeds targets", "Strong upward trend with 12.7% monthly growth"],
          position: { slide: 2, x: 50, y: 200, width: 600, height: 300 }
        },
        {
          id: "cac_ltv_evolution",
          type: "LineChart", 
          title: "Customer Acquisition Cost vs Lifetime Value",
          framework: "tremor",
          data: [
            { month: "Jan", cac: 150, ltv: 450 },
            { month: "Feb", cac: 145, ltv: 465 },
            { month: "Mar", cac: 135, ltv: 485 },
            { month: "Apr", cac: 125, ltv: 500 },
            { month: "May", cac: 120, ltv: 510 },
            { month: "Jun", cac: 117, ltv: 520 }
          ],
          config: {
            index: "month",
            categories: ["cac", "ltv"],
            colors: ["red", "green"],
            yAxisWidth: 60,
            showLegend: true,
            valueFormatter: "(value) => `$${value}`"
          },
          insights: ["CAC decreasing while LTV increasing", "Improving unit economics trend"],
          position: { slide: 3, x: 50, y: 200, width: 600, height: 300 }
        },
        {
          id: "channel_performance",
          type: "BarChart",
          title: "Acquisition Channel Performance",
          framework: "tremor",
          data: [
            { channel: "Direct", cac: 95, conversion: 12, volume: 150 },
            { channel: "Referral", cac: 45, conversion: 24, volume: 89 },
            { channel: "Paid", cac: 145, conversion: 8, volume: 201 },
            { channel: "Organic", cac: 25, conversion: 18, volume: 67 }
          ],
          config: {
            index: "channel",
            categories: ["cac"],
            colors: ["blue"],
            yAxisWidth: 60,
            showLegend: false,
            valueFormatter: "(value) => `$${value}`"
          },
          insights: ["Referral has best CAC and conversion", "Paid has highest volume but needs optimization"],
          position: { slide: 4, x: 50, y: 200, width: 600, height: 300 }
        },
        {
          id: "revenue_concentration",
          type: "DonutChart",
          title: "Revenue by Customer Segment",
          framework: "tremor",
          data: [
            { segment: "Enterprise", revenue: 45, customers: 12 },
            { segment: "Mid-Market", revenue: 35, customers: 28 },
            { segment: "SMB", revenue: 20, customers: 60 }
          ],
          config: {
            category: "revenue",
            index: "segment",
            colors: ["blue", "cyan", "indigo"],
            showTooltip: true,
            valueFormatter: "(value) => `${value}%`"
          },
          insights: ["Enterprise drives 45% of revenue with only 12% of customers", "Concentration risk in top segment"],
          position: { slide: 4, x: 700, y: 200, width: 300, height: 300 }
        }
      ],
      chartComponents: {
        imports: [
          "import { LineChart, BarChart, DonutChart } from '@tremor/react';"
        ],
        styleImports: [
          "import '@tremor/react/dist/esm/tremor.css';"
        ]
      },
      generationMetadata: {
        framework: body.framework || "tremor",
        totalCharts: 4,
        chartTypes: ["LineChart", "BarChart", "DonutChart"],
        dataPoints: 24,
        processingTime: "4.1s"
      }
    }

    // Support legacy format for backward compatibility
    if (body.styledSlides) {
      const result = await generateChartsAgent({
        ...body,
        userId: body.userId,
        chatContinuity: body.chatContinuity
      })
      return NextResponse.json(result)
    }

    return NextResponse.json({
      success: true,
      ...tremorCharts,
      userId: body.userId,
      presentationId: body.presentationId,
      chatContinuity: body.chatContinuity,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chart generation error:', error)
    return NextResponse.json(
      { error: 'Chart generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}