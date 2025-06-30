/**
 * Chart Builder Service
 * Enhances existing slide generation with better chart configurations
 * Works with your existing successful AI pipeline
 */

import OpenAI from 'openai'
import { SlideOutline } from './slidePlanner'
import { publishProgress, trackAIInteraction } from './bridge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export interface ChartConfig {
  id: string
  slideId: string
  chartType: 'bar' | 'line' | 'area' | 'donut' | 'scatter' | 'metrics'
  title: string
  subtitle?: string
  data: Array<Record<string, any>>
  metadata: {
    xAxis: string
    yAxis: string
    xAxisLabel?: string
    yAxisLabel?: string
    colors?: string[]
    showGrid?: boolean
    showLegend?: boolean
    insight?: string
    dataCallout?: string
  }
  tremorProps: {
    consultingStyle: 'mckinsey' | 'bcg' | 'bain'
    showAnimation: boolean
    className: string
  }
}

const CHART_BUILDER_SYSTEM_PROMPT = `You are a data visualization expert specializing in business chart design for executive presentations. Your role is to enhance slide content with appropriate chart configurations that work with TremorChartRenderer.

CHART TYPE GUIDELINES:
- "bar" - Comparisons, rankings, categories (use for revenue by region, product performance)
- "line" - Trends over time, growth patterns (use for time series data)
- "area" - Volume/magnitude over time, cumulative metrics
- "donut" - Composition, market share, percentages (better than pie for consulting style)
- "scatter" - Correlations, relationships between two variables
- "metrics" - KPI cards for key numbers (revenue, growth %, conversion rate)

TREMOR STYLING:
- Use consulting color palette: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']
- Enable animations for engagement
- Use mckinsey consulting style by default
- Include insights and data callouts for key findings

DATA REQUIREMENTS:
- Generate realistic sample data that supports the slide narrative
- Include 5-12 data points for most charts (optimal for executive presentations)
- Ensure data tells a clear story and supports key insights
- Use business-relevant labels and realistic numbers

You must respond with valid JSON only.`

const CHART_BUILDER_FUNCTION_SCHEMA = {
  name: "create_chart_configs",
  description: "Create chart configurations for presentation slides",
  parameters: {
    type: "object",
    properties: {
      charts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique chart identifier"
            },
            slideId: {
              type: "string", 
              description: "Associated slide ID"
            },
            chartType: {
              type: "string",
              enum: ["bar", "line", "area", "donut", "scatter", "metrics"],
              description: "Chart type matching slide requirements"
            },
            title: {
              type: "string",
              description: "Chart title (max 50 characters)"
            },
            subtitle: {
              type: "string",
              description: "Optional subtitle (max 80 characters)"
            },
            data: {
              type: "array",
              items: {
                type: "object"
              },
              description: "Chart data array with appropriate structure for chart type"
            },
            metadata: {
              type: "object",
              properties: {
                xAxis: {
                  type: "string",
                  description: "X-axis data key"
                },
                yAxis: {
                  type: "string", 
                  description: "Y-axis data key"
                },
                xAxisLabel: {
                  type: "string",
                  description: "X-axis label"
                },
                yAxisLabel: {
                  type: "string",
                  description: "Y-axis label"
                },
                colors: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  description: "Color palette array"
                },
                showGrid: {
                  type: "boolean",
                  description: "Show grid lines"
                },
                showLegend: {
                  type: "boolean",
                  description: "Show legend"
                },
                insight: {
                  type: "string",
                  description: "Key insight from this chart (max 150 characters)"
                },
                dataCallout: {
                  type: "string",
                  description: "Specific data point to highlight (max 100 characters)"
                }
              },
              required: ["xAxis", "yAxis", "insight"]
            },
            tremorProps: {
              type: "object",
              properties: {
                consultingStyle: {
                  type: "string",
                  enum: ["mckinsey", "bcg", "bain"],
                  description: "Consulting style for chart"
                },
                showAnimation: {
                  type: "boolean",
                  description: "Enable chart animations"
                },
                className: {
                  type: "string",
                  description: "CSS class names"
                }
              },
              required: ["consultingStyle", "showAnimation", "className"]
            }
          },
          required: ["id", "slideId", "chartType", "title", "data", "metadata", "tremorProps"]
        }
      }
    },
    required: ["charts"]
  }
}

export async function enhanceWithCharts(
  slideOutlines: SlideOutline[],
  datasetId: string,
  deckId?: string
): Promise<ChartConfig[]> {
  const startTime = Date.now()
  
  try {
    if (deckId) {
      await publishProgress(deckId, 'chart_building', 'Creating chart configurations for slides')
    }

    // Filter slides that need charts
    const chartSlides = slideOutlines.filter(slide => 
      slide.placeholderChartType !== 'metrics' || 
      slide.layout.includes('chart') ||
      slide.priority === 'high'
    )

    if (chartSlides.length === 0) {
      console.log('No slides require charts, skipping chart builder')
      return []
    }

    // Prepare input for OpenAI
    const chartBuilderInput = {
      slides: chartSlides.map(slide => ({
        id: slide.id,
        title: slide.title,
        bullets: slide.bullets,
        chartType: slide.placeholderChartType,
        layout: slide.layout,
        priority: slide.priority,
        context: slide.speakerNotes || slide.title
      })),
      datasetId,
      requirements: {
        totalCharts: Math.min(chartSlides.length, 4), // Max 4 charts for performance
        consultingStyle: 'mckinsey',
        colorPalette: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
        animationsEnabled: true
      }
    }

    const userPrompt = `Create chart configurations for the following presentation slides. Generate realistic business data that supports each slide's narrative and key insights.

SLIDES REQUIRING CHARTS:
${chartSlides.map((slide, i) => `
${i + 1}. SLIDE: "${slide.title}"
   - Chart Type: ${slide.placeholderChartType}
   - Layout: ${slide.layout}  
   - Key Points: ${slide.bullets.join(', ')}
   - Priority: ${slide.priority}
`).join('')}

REQUIREMENTS:
- Generate realistic sample data appropriate for each chart type
- Ensure data supports the slide narrative and bullet points
- Use business-relevant labels and realistic numbers
- Include meaningful insights and data callouts
- Follow consulting presentation best practices
- Use Tremor-compatible data structures

For each chart, create compelling data that executives would find credible and actionable.`

    if (deckId) {
      await publishProgress(deckId, 'chart_building', 'Generating chart data with AI')
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CHART_BUILDER_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      functions: [CHART_BUILDER_FUNCTION_SCHEMA],
      function_call: { name: 'create_chart_configs' },
      temperature: 0.4,
      max_tokens: 3000
    })

    const functionCall = completion.choices[0]?.message?.function_call
    if (!functionCall || !functionCall.arguments) {
      throw new Error('OpenAI did not return valid chart configurations')
    }

    const result = JSON.parse(functionCall.arguments)
    const charts: ChartConfig[] = result.charts

    // Validate and enhance chart configs
    const validatedCharts = charts.map((chart, index) => {
      validateChartConfig(chart, index)
      return enhanceChartConfig(chart)
    })

    const executionTime = Date.now() - startTime

    // Track AI interaction
    if (deckId) {
      await trackAIInteraction(
        deckId,
        'chart_builder',
        completion.usage?.prompt_tokens || 0,
        completion.usage?.completion_tokens || 0,
        'gpt-4o-mini',
        true,
        undefined,
        executionTime
      )

      await publishProgress(deckId, 'chart_building', `Generated ${validatedCharts.length} chart configurations`, {
        chartCount: validatedCharts.length,
        chartTypes: validatedCharts.map(c => c.chartType)
      })
    }

    console.log(`✅ Chart building completed: ${validatedCharts.length} charts generated`)
    
    return validatedCharts

  } catch (error) {
    const executionTime = Date.now() - startTime
    
    if (deckId) {
      await trackAIInteraction(
        deckId,
        'chart_builder',
        0,
        0,
        'gpt-4o-mini',
        false,
        error.message,
        executionTime
      )
      
      await publishProgress(deckId, 'error', `Chart building failed: ${error.message}`)
    }

    throw new Error(`Chart building failed: ${error.message}`)
  }
}

function validateChartConfig(chart: ChartConfig, index: number): void {
  if (!chart.id || !chart.slideId) {
    throw new Error(`Chart ${index + 1} missing required IDs`)
  }

  if (!chart.title || chart.title.length > 50) {
    throw new Error(`Chart ${index + 1} has invalid title`)
  }

  if (!chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
    throw new Error(`Chart ${index + 1} has invalid data array`)
  }

  if (!chart.metadata || !chart.metadata.xAxis || !chart.metadata.yAxis) {
    throw new Error(`Chart ${index + 1} missing required metadata`)
  }

  if (!['bar', 'line', 'area', 'donut', 'scatter', 'metrics'].includes(chart.chartType)) {
    throw new Error(`Chart ${index + 1} has invalid chart type: ${chart.chartType}`)
  }

  // Validate data structure based on chart type
  const firstDataPoint = chart.data[0]
  if (!firstDataPoint.hasOwnProperty(chart.metadata.xAxis)) {
    throw new Error(`Chart ${index + 1} data missing xAxis field: ${chart.metadata.xAxis}`)
  }

  if (chart.chartType !== 'metrics' && !firstDataPoint.hasOwnProperty(chart.metadata.yAxis)) {
    throw new Error(`Chart ${index + 1} data missing yAxis field: ${chart.metadata.yAxis}`)
  }
}

function enhanceChartConfig(chart: ChartConfig): ChartConfig {
  // Set default values and enhancements
  return {
    ...chart,
    metadata: {
      colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
      showGrid: true,
      showLegend: chart.data.length > 1,
      ...chart.metadata
    },
    tremorProps: {
      consultingStyle: 'mckinsey',
      showAnimation: true,
      className: 'w-full h-full',
      ...chart.tremorProps
    }
  }
}

// Helper function to convert chart config to slide element format
export function chartConfigToSlideElement(
  chart: ChartConfig, 
  position: { x: number; y: number },
  size: { width: number; height: number }
) {
  return {
    id: chart.id,
    type: 'chart' as const,
    position,
    size,
    rotation: 0,
    content: chart.title,
    chartData: chart.data,
    chartType: chart.chartType,
    metadata: {
      ...chart.metadata,
      title: chart.title,
      subtitle: chart.subtitle
    },
    style: {
      colors: chart.metadata.colors
    },
    isVisible: true,
    isLocked: false
  }
}