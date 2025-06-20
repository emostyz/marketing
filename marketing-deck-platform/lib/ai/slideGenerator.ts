// AI-powered slide generation with intelligent chart recommendations

interface DataPoint {
  [key: string]: string | number
}

interface SlideConfig {
  title: string
  type: 'title' | 'content' | 'chart' | 'summary'
  chartType?: 'area' | 'bar' | 'line'
  content?: any
  data?: DataPoint[]
  insights?: string[]
}

export function analyzeDataForCharts(data: DataPoint[]): {
  chartType: 'area' | 'bar' | 'line'
  reasoning: string
  insights: string[]
} {
  if (!data || data.length === 0) {
    return {
      chartType: 'bar',
      reasoning: 'Default chart type for empty data',
      insights: ['No data available for analysis']
    }
  }

  const keys = Object.keys(data[0])
  const numericKeys = keys.filter(key => 
    data.every(item => typeof item[key] === 'number')
  )
  
  const timeKeys = keys.filter(key =>
    typeof data[0][key] === 'string' && 
    (key.toLowerCase().includes('date') || 
     key.toLowerCase().includes('month') ||
     key.toLowerCase().includes('time') ||
     key.toLowerCase().includes('year'))
  )

  // Calculate insights
  const insights: string[] = []
  
  if (numericKeys.length > 0) {
    const firstNumericKey = numericKeys[0]
    const values = data.map(item => item[firstNumericKey] as number)
    const total = values.reduce((sum, val) => sum + val, 0)
    const average = total / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    insights.push(`Total ${firstNumericKey}: ${total.toLocaleString()}`)
    insights.push(`Average ${firstNumericKey}: ${average.toFixed(0)}`)
    insights.push(`Peak value: ${max.toLocaleString()}`)
    
    // Trend analysis
    if (values.length > 2) {
      const trend = values[values.length - 1] > values[0] ? 'increasing' : 'decreasing'
      const change = ((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(1)
      insights.push(`${trend} trend with ${Math.abs(Number(change))}% change`)
    }
  }

  // Determine best chart type
  if (timeKeys.length > 0 && numericKeys.length > 0) {
    // Time series data - best for line or area charts
    const hasMultipleMetrics = numericKeys.length > 1
    return {
      chartType: hasMultipleMetrics ? 'area' : 'line',
      reasoning: `Time series data with ${numericKeys.length} metric(s) - ideal for trend visualization`,
      insights
    }
  } else if (numericKeys.length >= 2) {
    // Multiple numeric columns - good for bar charts to compare
    return {
      chartType: 'bar',
      reasoning: 'Multiple metrics present - bar chart best for comparison',
      insights
    }
  } else {
    // Single metric - area chart for visual impact
    return {
      chartType: 'area',
      reasoning: 'Single metric data - area chart provides visual impact',
      insights
    }
  }
}

export function generateSlideContent(data: DataPoint[], title: string): SlideConfig[] {
  const analysis = analyzeDataForCharts(data)
  
  const slides: SlideConfig[] = [
    // Title slide
    {
      title: title,
      type: 'title',
      content: {
        title: title,
        subtitle: 'AI-Generated Data Insights'
      }
    },

    // Executive Summary
    {
      title: 'Executive Summary',
      type: 'content',
      content: {
        title: 'Executive Summary',
        body: `This presentation analyzes ${data.length} data points to uncover key insights and trends. Our AI has identified significant patterns that will drive strategic decision-making.`,
        textBlocks: analysis.insights.map((insight, i) => ({
          id: i,
          text: insight,
          style: 'bullet'
        }))
      }
    },

    // Main Chart Slide
    {
      title: 'Data Analysis',
      type: 'chart',
      chartType: analysis.chartType,
      content: {
        title: 'Key Metrics Overview',
        body: analysis.reasoning
      },
      data: data,
      insights: analysis.insights
    },

    // Detailed Insights
    {
      title: 'Key Insights',
      type: 'content',
      content: {
        title: 'Key Insights & Recommendations',
        body: 'Based on our comprehensive data analysis, we have identified the following critical insights:',
        textBlocks: [
          {
            id: 1,
            text: `Strong performance detected with ${analysis.insights[0] || 'positive indicators'}`,
            style: 'bullet'
          },
          {
            id: 2,
            text: `Trend analysis reveals ${analysis.insights[3] || 'stable growth patterns'}`,
            style: 'bullet'
          },
          {
            id: 3,
            text: 'Opportunities for optimization in underperforming areas',
            style: 'bullet'
          },
          {
            id: 4,
            text: 'Strategic recommendations align with data-driven insights',
            style: 'bullet'
          }
        ]
      }
    },

    // Action Items
    {
      title: 'Next Steps',
      type: 'content',
      content: {
        title: 'Recommended Actions',
        body: 'Based on our analysis, we recommend the following strategic actions:',
        textBlocks: [
          {
            id: 1,
            text: 'Implement data-driven optimization strategies',
            style: 'bullet'
          },
          {
            id: 2,
            text: 'Monitor key performance indicators weekly',
            style: 'bullet'
          },
          {
            id: 3,
            text: 'Establish benchmarks for continuous improvement',
            style: 'bullet'
          },
          {
            id: 4,
            text: 'Schedule quarterly review sessions',
            style: 'bullet'
          }
        ]
      }
    }
  ]

  return slides
}

export function generateMultipleChartSlides(data: DataPoint[]): SlideConfig[] {
  const keys = Object.keys(data[0] || {})
  const numericKeys = keys.filter(key => 
    data.every(item => typeof item[key] === 'number')
  )

  if (numericKeys.length < 2) {
    return []
  }

  // Generate different chart views
  const chartSlides: SlideConfig[] = []

  // Bar chart comparison
  chartSlides.push({
    title: 'Comparative Analysis',
    type: 'chart',
    chartType: 'bar',
    content: {
      title: 'Performance Comparison',
      body: 'Side-by-side comparison of key metrics'
    },
    data: data.slice(0, 10), // Limit for readability
    insights: [`Comparing ${numericKeys.length} metrics across ${data.length} data points`]
  })

  // Line chart for trends
  if (data.length > 5) {
    chartSlides.push({
      title: 'Trend Analysis',
      type: 'chart',
      chartType: 'line',
      content: {
        title: 'Trend Over Time',
        body: 'Evolution of key metrics showing growth patterns'
      },
      data: data,
      insights: ['Trend analysis reveals growth opportunities']
    })
  }

  // Area chart for cumulative view
  chartSlides.push({
    title: 'Cumulative Impact',
    type: 'chart',
    chartType: 'area',
    content: {
      title: 'Cumulative Performance',
      body: 'Total impact and contribution analysis'
    },
    data: data,
    insights: ['Area visualization shows cumulative impact']
  })

  return chartSlides
}