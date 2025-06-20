import { OpenAIAnalyzer } from './openai-integration'

interface DataPoint {
  [key: string]: any
}

interface QAResponses {
  datasetDescription: string
  businessGoals: string
  dataType: 'financial' | 'sales' | 'marketing' | 'strategy' | 'client' | 'other'
  keyProblems: string
  analysisType: 'performance' | 'trends' | 'comparison' | 'insights' | 'routine_check'
  targetAudience: string
  presentationStyle: 'executive' | 'detailed' | 'casual' | 'technical'
}

interface SlideConfig {
  id: string
  title: string
  type: 'title' | 'content' | 'chart' | 'summary'
  chartType?: 'area' | 'bar' | 'line' | 'donut' | 'scatter'
  content?: any
  data?: DataPoint[]
  insights?: string[]
  tremorConfig?: any
  qaContext?: Partial<QAResponses>
  categories?: string[]
  index?: string
  textBlocks?: any[]
}

export async function generateEnhancedSlideContent(
  data: DataPoint[], 
  title: string = 'AI-Generated Presentation',
  qaResponses?: QAResponses
): Promise<SlideConfig[]> {
  if (qaResponses) {
    // Use advanced AI analysis with Q&A context
    const analyzer = new OpenAIAnalyzer()
    const analysis = await analyzer.analyzeDataWithQA(data, qaResponses)
    
    return generateSlidesFromAnalysis(analysis, data, title, qaResponses)
  } else {
    // Fallback to basic generation
    return generateBasicSlides(data, title)
  }
}

function generateSlidesFromAnalysis(analysis: any, data: DataPoint[], title: string, qaResponses: QAResponses): SlideConfig[] {
  const slides: SlideConfig[] = []
  
  // Title slide with business context
  slides.push({
    id: 'title-slide',
    type: 'title',
    title: title,
    content: {
      title: title,
      subtitle: `${qaResponses.dataType.charAt(0).toUpperCase() + qaResponses.dataType.slice(1)} Analysis • ${new Date().toLocaleDateString()}`,
      description: qaResponses.businessGoals,
      context: qaResponses.analysisType,
      style: qaResponses.presentationStyle
    },
    qaContext: qaResponses
  })

  // Executive summary with AI insights
  slides.push({
    id: 'executive-summary',
    type: 'content',
    title: 'Executive Summary',
    content: {
      title: 'Executive Summary',
      body: analysis.executiveSummary,
      textBlocks: analysis.keyFindings.map((finding: string, index: number) => ({ 
        id: index,
        text: finding,
        style: 'bullet',
        impact: 'high'
      })),
      style: qaResponses.presentationStyle,
      dataContext: qaResponses.dataType
    },
    qaContext: qaResponses
  })

  // Generate comprehensive chart slides with McKinsey-style analysis
  const chartSlideRecommendations = analysis.slideRecommendations?.filter((rec: any) => rec.type === 'chart') || []
  
  // If no chart recommendations from analysis, create default chart slides
  if (chartSlideRecommendations.length === 0) {
    const primaryChartSlide = createDefaultChartSlide(data, qaResponses, analysis, 0)
    slides.push(primaryChartSlide)
  } else {
    // Create chart slides from AI recommendations
    chartSlideRecommendations.forEach((chartRec: any, index: number) => {
      const tremorConfig = getTremorConfig(qaResponses.dataType, chartRec.chartRecommendation?.type || 'bar', qaResponses.presentationStyle)
      
      slides.push({
        id: `chart-slide-${index}`,
        type: 'chart',
        title: chartRec.title,
        chartType: chartRec.chartRecommendation?.type || 'bar',
        data: data,
        categories: chartRec.chartRecommendation?.yAxis || Object.keys(data[0] || {}).slice(1),
        index: chartRec.chartRecommendation?.xAxis || Object.keys(data[0] || {})[0],
        content: {
          title: chartRec.title,
          subtitle: chartRec.content?.subtitle || 'Performance Analysis',
          description: chartRec.content?.description || chartRec.chartRecommendation?.reasoning || 'Data visualization and analysis',
          narrative: chartRec.content?.narrative || [
            `Analysis reveals key patterns in ${qaResponses.dataType} performance`,
            `Data-driven insights support strategic decision making`,
            `Recommendations focus on highest-impact opportunities`
          ],
          insights: analysis.insights
            ?.filter((i: any) => i.type === 'trend' || i.type === 'correlation' || i.type === 'opportunity')
            ?.slice(0, 3)
            ?.map((i: any) => i.description) || [],
          analysisType: qaResponses.analysisType
        },
        tremorConfig,
        qaContext: qaResponses,
        textBlocks: [
          {
            id: `chart-title-${index}`,
            text: chartRec.title,
            style: 'title',
            formatting: {
              bold: true,
              italic: false,
              underline: false,
              alignment: 'center',
              fontSize: 28,
              color: '#ffffff'
            },
            position: { x: 50, y: 20, width: 700, height: 50 }
          },
          {
            id: `chart-narrative-${index}`,
            text: Array.isArray(chartRec.content?.narrative) ? chartRec.content.narrative.join(' ') : (chartRec.content?.description || 'Comprehensive analysis of key performance indicators'),
            style: 'body',
            formatting: {
              bold: false,
              italic: false,
              underline: false,
              alignment: 'left',
              fontSize: 14,
              color: '#d1d5db'
            },
            position: { x: 50, y: 460, width: 700, height: 60 }
          }
        ]
      })
    })
  }

  // Strategic insights slide with McKinsey-style content
  if (analysis.insights && analysis.insights.length > 0) {
    const insightsSlideContent = analysis.slideRecommendations?.find((rec: any) => rec.type === 'insights')?.content || {}
    
    slides.push({
      id: 'insights-slide',
      type: 'content',
      title: 'Strategic Insights & Analysis',
      content: {
        title: 'Strategic Insights & Analysis',
        subtitle: insightsSlideContent.subtitle || `${analysis.insights.filter((i: any) => i.impact === 'high').length} High-Impact Findings`,
        body: insightsSlideContent.narrative || 'Comprehensive analysis reveals critical insights addressing key business challenges and strategic opportunities.',
        textBlocks: analysis.insights.slice(0, 4).map((insight: any, index: number) => ({
          id: index,
          text: `${insight.title}: ${insight.description.split('.')[0]}.`,
          impact: insight.impact,
          style: 'bullet',
          type: insight.type
        })),
        bulletPoints: insightsSlideContent.bulletPoints || analysis.insights.slice(0, 4).map((i: any) => i.title),
        insights: analysis.insights,
        businessGoals: qaResponses.businessGoals,
        methodology: insightsSlideContent.methodology || `McKinsey-style analysis with ${qaResponses.dataType} domain expertise`
      },
      qaContext: qaResponses,
      textBlocks: [
        {
          id: 'insights-title',
          text: 'Strategic Insights & Analysis',
          style: 'title',
          formatting: { bold: true, fontSize: 24, color: '#ffffff', alignment: 'center' },
          position: { x: 50, y: 30, width: 700, height: 40 }
        },
        {
          id: 'insights-narrative',
          text: insightsSlideContent.narrative || 'Data-driven insights reveal key patterns and strategic opportunities for optimization.',
          style: 'body',
          formatting: { bold: false, fontSize: 16, color: '#d1d5db', alignment: 'left' },
          position: { x: 50, y: 80, width: 700, height: 60 }
        },
        ...analysis.insights.slice(0, 4).map((insight: any, index: number) => ({
          id: `insight-${index}`,
          text: `• ${insight.title}: ${insight.description.split('.')[0]}.`,
          style: 'bullet',
          formatting: { bold: false, fontSize: 14, color: '#ffffff', alignment: 'left' },
          position: { x: 70, y: 160 + (index * 35), width: 650, height: 30 }
        }))
      ]
    })
  }

  // Problem-focused slide
  if (qaResponses.keyProblems) {
    const problemInsights = analysis.insights.filter((i: any) => i.type === 'risk' || i.type === 'opportunity')
    
    slides.push({
      id: 'challenges-slide',
      type: 'content',
      title: 'Addressing Key Challenges',
      content: {
        title: 'Addressing Key Challenges',
        body: qaResponses.keyProblems,
        textBlocks: problemInsights.slice(0, 3).map((insight: any, index: number) => ({ 
          id: index,
          text: insight.recommendation,
          impact: insight.impact,
          style: 'solution'
        })),
        context: 'problem-solving',
        dataType: qaResponses.dataType
      },
      qaContext: qaResponses
    })
  }

  // Strategic recommendations and action plan slides
  const recommendationsContent = analysis.slideRecommendations?.find((rec: any) => rec.type === 'recommendations')?.content || {}
  const actionItemsContent = analysis.slideRecommendations?.find((rec: any) => rec.type === 'action_items')?.content || {}
  
  slides.push({
    id: 'recommendations-slide',
    type: 'content',
    title: 'Strategic Recommendations & Action Plan',
    content: {
      title: 'Strategic Recommendations & Action Plan',
      subtitle: recommendationsContent.subtitle || 'Prioritized Initiatives for Maximum Impact',
      body: recommendationsContent.narrative || 'Data-driven recommendations focusing on highest-impact opportunities for immediate and long-term success.',
      textBlocks: (recommendationsContent.recommendations || analysis.insights
        ?.filter((i: any) => i.impact === 'high')
        ?.slice(0, 4)
        ?.map((insight: any) => insight.recommendation.split(':')[0]) || []
      ).map((rec: any, index: number) => ({ 
        id: index,
        text: typeof rec === 'string' ? rec : rec.action || rec.title,
        priority: rec.impact || 'high',
        style: 'action'
      })),
      bulletPoints: recommendationsContent.bulletPoints || [
        'Focus on highest-impact initiatives first',
        'Implement quick wins to build momentum', 
        'Track progress with clear success metrics',
        'Ensure cross-functional alignment and accountability'
      ],
      priority: 'high',
      businessGoals: qaResponses.businessGoals,
      implementation: recommendationsContent.implementation
    },
    qaContext: qaResponses,
    textBlocks: [
      {
        id: 'recommendations-title',
        text: 'Strategic Recommendations & Action Plan',
        style: 'title',
        formatting: { bold: true, fontSize: 24, color: '#ffffff', alignment: 'center' },
        position: { x: 50, y: 30, width: 700, height: 40 }
      },
      {
        id: 'recommendations-narrative',
        text: recommendationsContent.narrative || 'Prioritized action plan addressing key findings and business objectives.',
        style: 'body',
        formatting: { bold: false, fontSize: 16, color: '#d1d5db', alignment: 'left' },
        position: { x: 50, y: 80, width: 700, height: 60 }
      }
    ]
  })

  return slides
}

// Helper function to create default chart slide when no AI recommendations
function createDefaultChartSlide(data: DataPoint[], qaResponses: QAResponses, analysis: any, index: number): SlideConfig {
  const numericColumns = Object.keys(data[0] || {}).filter(key => 
    data.every(row => typeof row[key] === 'number' || !isNaN(Number(row[key])))
  )
  const categoryColumn = Object.keys(data[0] || {})[0]
  
  const chartType = qaResponses.analysisType === 'trends' ? 'line' : 
                   qaResponses.analysisType === 'comparison' ? 'bar' : 'area'
  
  const tremorConfig = getTremorConfig(qaResponses.dataType, chartType, qaResponses.presentationStyle)
  
  return {
    id: `default-chart-slide-${index}`,
    type: 'chart',
    title: `${qaResponses.dataType.charAt(0).toUpperCase() + qaResponses.dataType.slice(1)} Performance Analysis`,
    chartType,
    data: data,
    categories: numericColumns.slice(0, 3),
    index: categoryColumn,
    content: {
      title: `${qaResponses.dataType.charAt(0).toUpperCase() + qaResponses.dataType.slice(1)} Performance Analysis`,
      subtitle: 'Key Performance Indicators',
      description: `Comprehensive analysis of ${qaResponses.dataType} performance indicators`,
      narrative: [
        `Analysis of ${data.length} data points reveals key performance patterns`,
        `Strategic insights focus on ${qaResponses.analysisType} optimization`,
        `Recommendations align with business objectives: ${qaResponses.businessGoals.slice(0, 100)}...`
      ],
      insights: analysis.insights?.slice(0, 3)?.map((i: any) => i.description) || [],
      analysisType: qaResponses.analysisType
    },
    tremorConfig,
    qaContext: qaResponses,
    textBlocks: [
      {
        id: `default-chart-title-${index}`,
        text: `${qaResponses.dataType.charAt(0).toUpperCase() + qaResponses.dataType.slice(1)} Performance Analysis`,
        style: 'title',
        formatting: {
          bold: true,
          italic: false,
          underline: false,
          alignment: 'center',
          fontSize: 24,
          color: '#ffffff'
        },
        position: { x: 50, y: 20, width: 700, height: 40 }
      },
      {
        id: `default-chart-insights-${index}`,
        text: `Key insights: ${analysis.insights?.slice(0, 2)?.map((i: any) => i.title).join(', ') || 'Performance patterns identified'}`,
        style: 'body',
        formatting: {
          bold: false,
          italic: false,
          underline: false,
          alignment: 'center',
          fontSize: 14,
          color: '#d1d5db'
        },
        position: { x: 50, y: 460, width: 700, height: 40 }
      }
    ]
  }
}

function getTremorConfig(dataType: string, chartType: string, presentationStyle: string) {
  const baseConfig = {
    showLegend: true,
    showGrid: true,
    animation: true,
    height: presentationStyle === 'executive' ? 72 : 80,
    showTooltip: true
  }

  const colorSchemes = {
    financial: ['emerald-500', 'blue-500', 'orange-500', 'purple-500'],
    sales: ['blue-500', 'purple-500', 'green-500', 'orange-500'],
    marketing: ['orange-500', 'red-500', 'pink-500', 'purple-500'],
    strategy: ['purple-500', 'blue-500', 'teal-500', 'green-500'],
    client: ['teal-500', 'blue-500', 'green-500', 'purple-500'],
    other: ['blue-500', 'green-500', 'purple-500', 'orange-500']
  }

  return {
    ...baseConfig,
    colors: colorSchemes[dataType as keyof typeof colorSchemes] || colorSchemes.other,
    showGradient: chartType === 'area',
    type: chartType
  }
}

function generateBasicSlides(data: DataPoint[], title: string): SlideConfig[] {
  // Fallback basic slide generation
  const analysis = analyzeDataBasic(data)
  
  return [
    {
      id: 'title-basic',
      type: 'title',
      title: title,
      content: {
        title: title,
        subtitle: 'Data Analysis Presentation'
      }
    },
    {
      id: 'chart-basic',
      type: 'chart',
      title: 'Data Overview',
      chartType: analysis.chartType as 'area' | 'bar' | 'line',
      data: data,
      content: {
        title: 'Data Overview',
        description: analysis.reasoning
      },
      tremorConfig: {
        colors: ['blue-500', 'green-500', 'purple-500'],
        showLegend: true,
        showGrid: true,
        animation: true,
        height: 80
      }
    }
  ]
}

function analyzeDataBasic(data: DataPoint[]) {
  const keys = Object.keys(data[0] || {})
  const numericKeys = keys.filter(key => 
    data.every(item => typeof item[key] === 'number')
  )
  
  const timeKeys = keys.filter(key =>
    typeof data[0][key] === 'string' && 
    (key.toLowerCase().includes('date') || 
     key.toLowerCase().includes('month') ||
     key.toLowerCase().includes('time'))
  )

  if (timeKeys.length > 0) {
    return { chartType: 'line', reasoning: 'Time series data detected' }
  } else if (numericKeys.length >= 2) {
    return { chartType: 'bar', reasoning: 'Multiple metrics for comparison' }
  } else {
    return { chartType: 'area', reasoning: 'Single metric visualization' }
  }
}

// Enhanced chart analysis with Tremor-specific recommendations
export function analyzeDataForTremorCharts(data: DataPoint[], qaResponses?: QAResponses) {
  if (!data || data.length === 0) {
    return {
      chartType: 'bar',
      reasoning: 'Default chart type for empty data',
      insights: ['No data available for analysis'],
      tremorConfig: getTremorConfig('other', 'bar', 'executive')
    }
  }

  const keys = Object.keys(data[0])
  const numericKeys = keys.filter(key => 
    data.every(item => typeof item[key] === 'number' || !isNaN(Number(item[key])))
  )
  
  const timeKeys = keys.filter(key =>
    typeof data[0][key] === 'string' && 
    (key.toLowerCase().includes('date') || 
     key.toLowerCase().includes('month') ||
     key.toLowerCase().includes('time') ||
     key.toLowerCase().includes('year') ||
     key.toLowerCase().includes('quarter'))
  )

  // Enhanced chart type determination
  let chartType: 'area' | 'bar' | 'line' | 'donut' | 'scatter' = 'bar'
  let reasoning = ''

  if (qaResponses?.analysisType === 'trends' && timeKeys.length > 0) {
    chartType = 'line'
    reasoning = 'Trend analysis over time requires line chart visualization'
  } else if (qaResponses?.analysisType === 'comparison' && numericKeys.length >= 2) {
    chartType = 'bar'
    reasoning = 'Comparative analysis best shown with bar charts'
  } else if (qaResponses?.dataType === 'financial' && timeKeys.length > 0) {
    chartType = 'area'
    reasoning = 'Financial data over time shows cumulative impact with area charts'
  } else if (data.length <= 10 && numericKeys.length === 1) {
    chartType = 'donut'
    reasoning = 'Small dataset with single metric ideal for donut chart'
  } else if (numericKeys.length >= 3) {
    chartType = 'scatter'
    reasoning = 'Multiple metrics suggest correlation analysis with scatter plot'
  }

  const insights = generateDataInsights(data, numericKeys, qaResponses)
  const tremorConfig = getTremorConfig(
    qaResponses?.dataType || 'other', 
    chartType, 
    qaResponses?.presentationStyle || 'executive'
  )

  return {
    chartType,
    reasoning,
    insights,
    tremorConfig
  }
}

function generateDataInsights(data: DataPoint[], numericKeys: string[], qaResponses?: QAResponses): string[] {
  const insights: string[] = []
  
  if (numericKeys.length > 0) {
    const firstKey = numericKeys[0]
    const values = data.map(item => Number(item[firstKey]))
    const total = values.reduce((sum, val) => sum + val, 0)
    const average = total / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    // Context-aware insights based on Q&A
    if (qaResponses?.dataType === 'financial') {
      insights.push(`Total ${firstKey}: $${total.toLocaleString()}`)
      insights.push(`Average ${firstKey}: $${Math.round(average).toLocaleString()}`)
      insights.push(`Peak performance: $${max.toLocaleString()}`)
    } else if (qaResponses?.dataType === 'sales') {
      insights.push(`Total ${firstKey}: ${total.toLocaleString()} units`)
      insights.push(`Average ${firstKey}: ${Math.round(average).toLocaleString()} per period`)
      insights.push(`Best performance: ${max.toLocaleString()} units`)
    } else {
      insights.push(`Total ${firstKey}: ${total.toLocaleString()}`)
      insights.push(`Average ${firstKey}: ${Math.round(average).toLocaleString()}`)
      insights.push(`Peak value: ${max.toLocaleString()}`)
    }
    
    // Trend analysis
    if (values.length > 2) {
      const trend = values[values.length - 1] > values[0] ? 'increasing' : 'decreasing'
      const change = ((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(1)
      insights.push(`${trend} trend with ${Math.abs(Number(change))}% change`)
    }
  }

  // Business-context insights
  if (qaResponses?.businessGoals) {
    insights.push(`Analysis aligns with goal: ${qaResponses.businessGoals.slice(0, 50)}...`)
  }

  return insights.slice(0, 4) // Limit to 4 key insights
}