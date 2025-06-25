// Smart Chart Recommendation Engine
// Recommends optimal visualizations based on data characteristics

import { AIReadyData } from './data-preparation'

export interface ChartRecommendation {
  id: string
  chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'histogram' | 'heatmap' | 'bubble' | 'radar' | 'waterfall' | 'treemap' | 'sankey' | 'sunburst' | 'parallel' | 'network' | 'candlestick' | 'gauge' | 'wordcloud' | 'funnel' | 'timeline'
  title: string
  description: string
  xAxis?: string
  yAxis?: string
  data: string | string[]
  reason: string
  priority: 'high' | 'medium' | 'low'
  confidence: number // 0-100
  configuration: ChartConfiguration
  businessValue: string
  insights: string[]
  visualInnovation?: {
    noveltyScore: number // 0-100, how innovative this visualization is
    designElements: string[] // Advanced design features
    interactivity: string[] // Interactive capabilities
    storytelling: string // How this chart tells a story
  }
}

export interface ChartConfiguration {
  colorScheme: string[]
  showLegend: boolean
  showTooltips: boolean
  animations: boolean
  responsive: boolean
  aggregation?: 'sum' | 'average' | 'count' | 'max' | 'min'
  groupBy?: string
  filters?: { column: string; value: any }[]
  sorting?: { column: string; direction: 'asc' | 'desc' }
  customOptions?: Record<string, any>
  advancedStyling?: {
    gradients: boolean
    shadows: boolean
    borderRadius: number
    transparency: number
    textureOverlay?: string
    thematicElements?: string[]
  }
  interactivity?: {
    hover: string[] // hover effects
    click: string[] // click actions
    zoom: boolean
    filter: boolean
    drill: boolean
  }
  storytelling?: {
    narrative: string
    keyMessage: string
    callToAction?: string
    emotionalTone: 'urgent' | 'confident' | 'optimistic' | 'analytical' | 'inspiring'
  }
}

export interface ChartRecommendationResult {
  recommendations: ChartRecommendation[]
  summary: string
  optimalCharts: ChartRecommendation[]
  metadata: {
    totalRecommendations: number
    highPriorityCount: number
    dataCompatibilityScore: number
  }
}

export class ChartRecommendationEngine {

  /**
   * Generate chart recommendations based on data analysis
   */
  static generateRecommendations(data: AIReadyData): ChartRecommendationResult {
    console.log('🎨 Generating stunning & innovative chart recommendations...', {
      columns: data.summary.columns.length,
      numericalColumns: data.summary.columns.filter(c => c.type === 'numeric').length,
      hasTimeData: !!data.summary.timeRange
    })

    const recommendations: ChartRecommendation[] = []
    let recommendationId = 0

    // Innovative Visualization Recommendations (NEW)
    recommendations.push(...this.generateInnovativeVisualizations(data, recommendationId))
    recommendationId += 20

    // Storytelling-Focused Charts (NEW)
    recommendations.push(...this.generateStorytellingCharts(data, recommendationId))
    recommendationId += 20

    // Time Series Charts (Enhanced)
    if (data.summary.timeRange) {
      recommendations.push(...this.generateTimeSeriesRecommendations(data, recommendationId))
      recommendationId += 10
    }

    // Distribution Charts
    recommendations.push(...this.generateDistributionRecommendations(data, recommendationId))
    recommendationId += 10

    // Comparison Charts
    recommendations.push(...this.generateComparisonRecommendations(data, recommendationId))
    recommendationId += 10

    // Correlation Charts
    recommendations.push(...this.generateCorrelationRecommendations(data, recommendationId))
    recommendationId += 10

    // Composition Charts
    recommendations.push(...this.generateCompositionRecommendations(data, recommendationId))
    recommendationId += 10

    // Advanced Analytics Charts
    recommendations.push(...this.generateAdvancedRecommendations(data, recommendationId))

    // Rank and filter recommendations with innovation scoring
    const rankedRecommendations = this.rankRecommendations(recommendations, data)
    const optimalCharts = rankedRecommendations.filter(r => r.priority === 'high').slice(0, 8) // More charts for richer presentations

    const summary = this.generateSummary(rankedRecommendations, data)

    return {
      recommendations: rankedRecommendations,
      summary,
      optimalCharts,
      metadata: {
        totalRecommendations: rankedRecommendations.length,
        highPriorityCount: optimalCharts.length,
        dataCompatibilityScore: this.calculateCompatibilityScore(data)
      }
    }
  }

  /**
   * Generate time series chart recommendations
   */
  private static generateTimeSeriesRecommendations(data: AIReadyData, startId: number): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = []
    
    if (!data.summary.timeRange) return recommendations

    const dateColumns = data.summary.columns.filter(c => c.type === 'date')
    const numericColumns = data.summary.columns.filter(c => c.type === 'numeric')
    
    if (dateColumns.length === 0 || numericColumns.length === 0) return recommendations

    const dateColumn = dateColumns[0]

    numericColumns.forEach((numCol, index) => {
      const trend = data.summary.numericalSummary.trends.find(t => t.column === numCol.name)
      
      // Line chart for trends
      recommendations.push({
        id: `timeseries_line_${startId + index}`,
        chartType: 'line',
        title: `${numCol.name} Trend Over Time`,
        description: `Track ${numCol.name} performance across ${data.summary.timeRange?.frequency || 'time periods'}`,
        xAxis: dateColumn.name,
        yAxis: numCol.name,
        data: [dateColumn.name, numCol.name],
        reason: `Time series data is optimally visualized with line charts to show trends and patterns`,
        priority: trend?.trend === 'increasing' || trend?.trend === 'decreasing' ? 'high' : 'medium',
        confidence: 90,
        configuration: {
          colorScheme: ['#3b82f6', '#06b6d4', '#10b981'],
          showLegend: true,
          showTooltips: true,
          animations: true,
          responsive: true,
          customOptions: {
            smooth: true,
            showPoints: data.summary.totalRows <= 50,
            zoomEnabled: data.summary.totalRows > 100
          }
        },
        businessValue: trend ? `Identify ${trend.trend} trends for strategic planning` : 'Monitor performance over time',
        insights: [
          `${data.summary.timeRange?.frequency?.charAt(0).toUpperCase() + (data.summary.timeRange?.frequency?.slice(1) ?? '')} data pattern`,
          trend ? `Currently ${trend.trend}` : 'Trend analysis available',
          `${data.summary.totalRows} data points for analysis`
        ]
      })

      // Area chart for cumulative metrics
      if (numCol.name.toLowerCase().includes('revenue') || 
          numCol.name.toLowerCase().includes('sales') ||
          numCol.name.toLowerCase().includes('volume')) {
        
        recommendations.push({
          id: `timeseries_area_${startId + index + 100}`,
          chartType: 'area',
          title: `Cumulative ${numCol.name} Over Time`,
          description: `Visualize cumulative growth and volume patterns in ${numCol.name}`,
          xAxis: dateColumn.name,
          yAxis: numCol.name,
          data: [dateColumn.name, numCol.name],
          reason: 'Area charts effectively show cumulative values and volume trends',
          priority: 'medium',
          confidence: 85,
          configuration: {
            colorScheme: ['#8b5cf6', '#a855f7'],
            showLegend: true,
            showTooltips: true,
            animations: true,
            responsive: true,
            customOptions: {
              fillOpacity: 0.6,
              gradient: true
            }
          },
          businessValue: 'Understand cumulative impact and growth patterns',
          insights: [
            'Shows both trend and magnitude',
            'Ideal for revenue and volume metrics',
            'Highlights periods of acceleration or deceleration'
          ]
        })
      }
    })

    return recommendations
  }

  /**
   * Generate distribution chart recommendations
   */
  private static generateDistributionRecommendations(data: AIReadyData, startId: number): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = []
    const numericColumns = data.summary.columns.filter(c => c.type === 'numeric')

    numericColumns.forEach((col, index) => {
      if (!col.stats || col.uniqueValues < 5) return

      // Histogram for continuous data distribution
      if (col.uniqueValues > 10) {
        recommendations.push({
          id: `distribution_histogram_${startId + index}`,
          chartType: 'histogram',
          title: `Distribution of ${col.name}`,
          description: `Analyze the frequency distribution and identify patterns in ${col.name} values`,
          data: col.name,
          reason: 'Histograms reveal data distribution patterns, outliers, and central tendencies',
          priority: col.uniqueValues > 50 ? 'high' : 'medium',
          confidence: 85,
          configuration: {
            colorScheme: ['#f59e0b', '#d97706'],
            showLegend: false,
            showTooltips: true,
            animations: true,
            responsive: true,
            customOptions: {
              bins: Math.min(20, Math.floor(Math.sqrt(data.summary.totalRows))),
              showMean: true,
              showMedian: true
            }
          },
          businessValue: 'Identify data distribution patterns and outliers for quality assessment',
          insights: [
            `Range: ${col.stats.min?.toFixed(2)} to ${col.stats.max?.toFixed(2)}`,
            `Mean: ${col.stats.mean?.toFixed(2)}`,
            `Standard deviation: ${col.stats.stdDev?.toFixed(2)}`
          ]
        })
      }
    })

    return recommendations
  }

  /**
   * Generate comparison chart recommendations
   */
  private static generateComparisonRecommendations(data: AIReadyData, startId: number): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = []
    const categoricalColumns = data.summary.columns.filter(c => c.type === 'string' && c.uniqueValues <= 20)
    const numericColumns = data.summary.columns.filter(c => c.type === 'numeric')

    categoricalColumns.forEach((catCol, catIndex) => {
      numericColumns.forEach((numCol, numIndex) => {
        const categoryInfo = data.summary.categories.find(c => c.column === catCol.name)
        if (!categoryInfo || categoryInfo.categories.length < 2) return

        // Bar chart for categorical comparisons
        recommendations.push({
          id: `comparison_bar_${startId + catIndex * 10 + numIndex}`,
          chartType: 'bar',
          title: `${numCol.name} by ${catCol.name}`,
          description: `Compare ${numCol.name} performance across different ${catCol.name} categories`,
          xAxis: catCol.name,
          yAxis: numCol.name,
          data: [catCol.name, numCol.name],
          reason: 'Bar charts excel at comparing values across discrete categories',
          priority: categoryInfo.categories.length <= 10 ? 'high' : 'medium',
          confidence: 90,
          configuration: {
            colorScheme: ['#10b981', '#059669', '#047857', '#065f46'],
            showLegend: false,
            showTooltips: true,
            animations: true,
            responsive: true,
            aggregation: 'average',
            groupBy: catCol.name,
            sorting: { column: numCol.name, direction: 'desc' }
          },
          businessValue: `Identify top-performing ${catCol.name} categories and optimization opportunities`,
          insights: [
            `${categoryInfo.categories.length} categories to compare`,
            `Top performer: ${categoryInfo.dominantCategory}`,
            'Enables clear performance ranking'
          ]
        })

        // Pie chart for composition (if suitable)
        if (categoryInfo.categories.length <= 8 && 
            (numCol.name.toLowerCase().includes('total') ||
             numCol.name.toLowerCase().includes('sum') ||
             numCol.name.toLowerCase().includes('count'))) {
          
          recommendations.push({
            id: `comparison_pie_${startId + catIndex * 10 + numIndex + 50}`,
            chartType: 'pie',
            title: `${numCol.name} Composition by ${catCol.name}`,
            description: `Show the relative contribution of each ${catCol.name} to total ${numCol.name}`,
            data: [catCol.name, numCol.name],
            reason: 'Pie charts effectively show part-to-whole relationships',
            priority: 'medium',
            confidence: 80,
            configuration: {
              colorScheme: ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#06b6d4'],
              showLegend: true,
              showTooltips: true,
              animations: true,
              responsive: true,
              aggregation: 'sum',
              customOptions: {
                showPercentages: true,
                innerRadius: 40
              }
            },
            businessValue: 'Understand market share or contribution distribution',
            insights: [
              'Shows relative proportions clearly',
              'Identifies dominant segments',
              'Useful for portfolio analysis'
            ]
          })
        }
      })
    })

    return recommendations
  }

  /**
   * Generate correlation chart recommendations
   */
  private static generateCorrelationRecommendations(data: AIReadyData, startId: number): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = []

    data.summary.numericalSummary.correlations.forEach((corr, index) => {
      const strength = Math.abs(corr.correlation)
      
      if (strength < 0.3) return // Skip weak correlations

      // Scatter plot for correlations
      recommendations.push({
        id: `correlation_scatter_${startId + index}`,
        chartType: 'scatter',
        title: `${corr.col1} vs ${corr.col2} Relationship`,
        description: `Explore the ${corr.correlation > 0 ? 'positive' : 'negative'} correlation between ${corr.col1} and ${corr.col2}`,
        xAxis: corr.col1,
        yAxis: corr.col2,
        data: [corr.col1, corr.col2],
        reason: `Strong ${strength > 0.6 ? 'strong' : 'moderate'} correlation (${(corr.correlation * 100).toFixed(0)}%) warrants investigation`,
        priority: strength > 0.6 ? 'high' : 'medium',
        confidence: Math.round(strength * 100),
        configuration: {
          colorScheme: corr.correlation > 0 ? ['#10b981'] : ['#ef4444'],
          showLegend: false,
          showTooltips: true,
          animations: true,
          responsive: true,
          customOptions: {
            showTrendLine: true,
            pointSize: 6,
            opacity: 0.7,
            correlationCoefficient: corr.correlation
          }
        },
        businessValue: corr.correlation > 0 
          ? `Leverage positive relationship to optimize both metrics`
          : `Understand inverse relationship for balanced decisions`,
        insights: [
          `Correlation: ${(corr.correlation * 100).toFixed(1)}%`,
          `Relationship: ${corr.correlation > 0 ? 'Positive' : 'Negative'}`,
          `Strength: ${strength > 0.8 ? 'Very Strong' : strength > 0.6 ? 'Strong' : 'Moderate'}`
        ]
      })
    })

    return recommendations
  }

  /**
   * Generate composition chart recommendations
   */
  private static generateCompositionRecommendations(data: AIReadyData, startId: number): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = []
    
    // Look for stackable data patterns
    const categoricalColumns = data.summary.columns.filter(c => c.type === 'string' && c.uniqueValues <= 10)
    const numericColumns = data.summary.columns.filter(c => c.type === 'numeric')

    if (categoricalColumns.length >= 2 && numericColumns.length >= 1) {
      const primaryCat = categoricalColumns[0]
      const secondaryCat = categoricalColumns[1]
      const metric = numericColumns[0]

      // Stacked bar chart
      recommendations.push({
        id: `composition_stacked_${startId}`,
        chartType: 'bar',
        title: `${metric.name} by ${primaryCat.name} and ${secondaryCat.name}`,
        description: `Multi-dimensional analysis showing ${metric.name} across ${primaryCat.name} categories, segmented by ${secondaryCat.name}`,
        xAxis: primaryCat.name,
        yAxis: metric.name,
        data: [primaryCat.name, secondaryCat.name, metric.name],
        reason: 'Multi-dimensional categorical data benefits from stacked visualization',
        priority: 'medium',
        confidence: 75,
        configuration: {
          colorScheme: ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981'],
          showLegend: true,
          showTooltips: true,
          animations: true,
          responsive: true,
          customOptions: {
            stacked: true,
            groupBy: secondaryCat.name
          }
        },
        businessValue: 'Understand multi-dimensional performance patterns and segment contributions',
        insights: [
          'Shows both total and component values',
          'Reveals segment performance within categories',
          'Enables comprehensive comparative analysis'
        ]
      })
    }

    return recommendations
  }

  /**
   * Generate advanced analytics chart recommendations
   */
  private static generateAdvancedRecommendations(data: AIReadyData, startId: number): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = []
    
    // Bubble chart for three-dimensional analysis
    const numericColumns = data.summary.columns.filter(c => c.type === 'numeric')
    const categoricalColumns = data.summary.columns.filter(c => c.type === 'string' && c.uniqueValues <= 15)

    if (numericColumns.length >= 3 && categoricalColumns.length >= 1) {
      recommendations.push({
        id: `advanced_bubble_${startId}`,
        chartType: 'bubble',
        title: `Multi-Dimensional Analysis: ${numericColumns[0].name}, ${numericColumns[1].name}, and ${numericColumns[2].name}`,
        description: `Explore relationships between three key metrics across ${categoricalColumns[0].name} categories`,
        xAxis: numericColumns[0].name,
        yAxis: numericColumns[1].name,
        data: [numericColumns[0].name, numericColumns[1].name, numericColumns[2].name, categoricalColumns[0].name],
        reason: 'Three numeric dimensions with categorical grouping ideal for bubble charts',
        priority: 'medium',
        confidence: 70,
        configuration: {
          colorScheme: ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#06b6d4'],
          showLegend: true,
          showTooltips: true,
          animations: true,
          responsive: true,
          customOptions: {
            bubbleSize: numericColumns[2].name,
            groupBy: categoricalColumns[0].name,
            minBubbleSize: 5,
            maxBubbleSize: 30
          }
        },
        businessValue: 'Identify optimal performance quadrants and outlier opportunities',
        insights: [
          'Reveals complex multi-dimensional patterns',
          'Identifies performance clusters',
          'Enables strategic positioning analysis'
        ]
      })
    }

    // Heatmap for correlation matrix
    if (numericColumns.length >= 4) {
      recommendations.push({
        id: `advanced_heatmap_${startId + 1}`,
        chartType: 'heatmap',
        title: 'Correlation Matrix Heatmap',
        description: 'Visualize correlation strengths between all numeric variables',
        data: numericColumns.map(c => c.name),
        reason: 'Multiple numeric variables benefit from correlation heatmap analysis',
        priority: 'low',
        confidence: 80,
        configuration: {
          colorScheme: ['#ef4444', '#ffffff', '#10b981'],
          showLegend: true,
          showTooltips: true,
          animations: false,
          responsive: true,
          customOptions: {
            symmetric: true,
            showValues: true,
            cellSize: 40
          }
        },
        businessValue: 'Identify hidden relationships and redundant metrics',
        insights: [
          'Comprehensive correlation overview',
          'Identifies metric redundancies',
          'Reveals unexpected relationships'
        ]
      })
    }

    return recommendations
  }

  /**
   * Generate innovative and novel visualization recommendations
   */
  private static generateInnovativeVisualizations(data: AIReadyData, startId: number): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = []
    const numericColumns = data.summary.columns.filter(c => c.type === 'numeric')
    const categoricalColumns = data.summary.columns.filter(c => c.type === 'string' && c.uniqueValues <= 15)

    // Treemap for hierarchical data visualization
    if (categoricalColumns.length >= 1 && numericColumns.length >= 1) {
      const catCol = categoricalColumns[0]
      const numCol = numericColumns[0]
      
      recommendations.push({
        id: `innovative_treemap_${startId}`,
        chartType: 'treemap',
        title: `Interactive Treemap: ${numCol.name} by ${catCol.name}`,
        description: `Stunning hierarchical visualization showing ${numCol.name} proportions across ${catCol.name} categories with rich interactivity`,
        data: [catCol.name, numCol.name],
        reason: 'Treemaps provide exceptional visual impact for categorical proportions with space-efficient design',
        priority: 'high',
        confidence: 85,
        configuration: {
          colorScheme: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
          showLegend: true,
          showTooltips: true,
          animations: true,
          responsive: true,
          advancedStyling: {
            gradients: true,
            shadows: true,
            borderRadius: 4,
            transparency: 0.9,
            thematicElements: ['hover-glow', 'smooth-transitions']
          },
          interactivity: {
            hover: ['highlight-sector', 'show-details', 'dim-others'],
            click: ['drill-down', 'focus-view'],
            zoom: true,
            filter: true,
            drill: true
          },
          storytelling: {
            narrative: 'Visual hierarchy reveals dominant market segments at a glance',
            keyMessage: `${catCol.name} composition with immediate visual impact`,
            emotionalTone: 'confident'
          }
        },
        businessValue: 'Immediately communicate market share and category dominance with stunning visual hierarchy',
        insights: [
          'Space-efficient representation of all categories',
          'Intuitive size-based comparison',
          'Interactive exploration capabilities'
        ],
        visualInnovation: {
          noveltyScore: 90,
          designElements: ['hierarchical-rectangles', 'proportional-sizing', 'gradient-fills'],
          interactivity: ['hover-animations', 'drill-down-navigation', 'contextual-tooltips'],
          storytelling: 'Reveals market landscape structure through spatial metaphor'
        }
      })
    }

    // Sunburst chart for multi-level categorical data
    if (categoricalColumns.length >= 2 && numericColumns.length >= 1) {
      recommendations.push({
        id: `innovative_sunburst_${startId + 1}`,
        chartType: 'sunburst',
        title: `Multi-Level Sunburst Analysis`,
        description: `Revolutionary circular visualization showing nested relationships between ${categoricalColumns[0].name} and ${categoricalColumns[1].name}`,
        data: [categoricalColumns[0].name, categoricalColumns[1].name, numericColumns[0].name],
        reason: 'Sunburst charts provide breathtaking visualization of hierarchical data with exceptional aesthetic appeal',
        priority: 'high',
        confidence: 88,
        configuration: {
          colorScheme: ['#ff9a9e', '#fecfef', '#fecfef', '#fad0c4', '#ffd1ff'],
          showLegend: true,
          showTooltips: true,
          animations: true,
          responsive: true,
          advancedStyling: {
            gradients: true,
            shadows: true,
            borderRadius: 0,
            transparency: 0.95,
            thematicElements: ['radial-glow', 'pulsing-animations']
          },
          interactivity: {
            hover: ['segment-highlight', 'path-illumination'],
            click: ['zoom-to-segment', 'isolate-branch'],
            zoom: true,
            filter: true,
            drill: true
          },
          storytelling: {
            narrative: 'Journey from outer categories to inner insights through interactive exploration',
            keyMessage: 'Multi-dimensional categorical relationships revealed',
            emotionalTone: 'inspiring'
          }
        },
        businessValue: 'Stunning visualization that impresses stakeholders while revealing complex categorical relationships',
        insights: [
          'Multi-level hierarchy in single view',
          'Radial design maximizes visual impact',
          'Interactive path exploration'
        ],
        visualInnovation: {
          noveltyScore: 95,
          designElements: ['concentric-arcs', 'radial-hierarchy', 'gradient-transitions'],
          interactivity: ['zoom-navigation', 'path-highlighting', 'segment-filtering'],
          storytelling: 'Guides viewers on journey from overview to detail through circular narrative'
        }
      })
    }

    // Gauge chart for KPI visualization
    if (numericColumns.length >= 1) {
      const numCol = numericColumns[0]
      const maxValue = numCol.stats?.max || 100
      
      recommendations.push({
        id: `innovative_gauge_${startId + 2}`,
        chartType: 'gauge',
        title: `Executive KPI Gauge: ${numCol.name}`,
        description: `Professional speedometer-style visualization showing ${numCol.name} performance against targets`,
        data: numCol.name,
        reason: 'Gauge charts provide immediate executive-level understanding of performance vs targets',
        priority: 'high',
        confidence: 82,
        configuration: {
          colorScheme: ['#ff4757', '#ffa502', '#2ed573', '#1e90ff'],
          showLegend: false,
          showTooltips: true,
          animations: true,
          responsive: true,
          customOptions: {
            target: maxValue * 0.8,
            thresholds: [maxValue * 0.3, maxValue * 0.6, maxValue * 0.8],
            needle: true,
            range: [0, maxValue]
          },
          advancedStyling: {
            gradients: true,
            shadows: true,
            borderRadius: 50,
            transparency: 0.9,
            thematicElements: ['metallic-finish', 'needle-shadow']
          },
          interactivity: {
            hover: ['value-highlight', 'threshold-display'],
            click: ['detail-drill'],
            zoom: false,
            filter: false,
            drill: true
          },
          storytelling: {
            narrative: 'Performance dashboard that executives can read at a glance',
            keyMessage: `${numCol.name} performance status immediately clear`,
            emotionalTone: 'confident'
          }
        },
        businessValue: 'Executive-friendly KPI visualization that communicates performance status instantly',
        insights: [
          'Instant performance assessment',
          'Target achievement visualization',
          'Color-coded performance zones'
        ],
        visualInnovation: {
          noveltyScore: 85,
          designElements: ['arc-based-scale', 'needle-indicator', 'color-zones'],
          interactivity: ['needle-animation', 'threshold-indicators'],
          storytelling: 'Mimics familiar speedometer metaphor for instant comprehension'
        }
      })
    }

    return recommendations
  }

  /**
   * Generate storytelling-focused chart recommendations
   */
  private static generateStorytellingCharts(data: AIReadyData, startId: number): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = []
    const numericColumns = data.summary.columns.filter(c => c.type === 'numeric')
    const hasTimeData = !!data.summary.timeRange

    // Timeline chart for story progression
    if (hasTimeData && numericColumns.length >= 1) {
      const dateColumns = data.summary.columns.filter(c => c.type === 'date')
      const numCol = numericColumns[0]
      
      recommendations.push({
        id: `storytelling_timeline_${startId}`,
        chartType: 'timeline',
        title: `Business Journey Timeline: ${numCol.name} Evolution`,
        description: `Compelling narrative visualization showing the story of ${numCol.name} development over time with key milestones`,
        xAxis: dateColumns[0].name,
        yAxis: numCol.name,
        data: [dateColumns[0].name, numCol.name],
        reason: 'Timeline charts excel at telling the story of business evolution with dramatic visual narrative',
        priority: 'high',
        confidence: 90,
        configuration: {
          colorScheme: ['#667eea', '#764ba2', '#f093fb'],
          showLegend: true,
          showTooltips: true,
          animations: true,
          responsive: true,
          customOptions: {
            milestones: true,
            annotations: true,
            storyPoints: true
          },
          advancedStyling: {
            gradients: true,
            shadows: true,
            borderRadius: 8,
            transparency: 0.9,
            thematicElements: ['story-markers', 'journey-path']
          },
          interactivity: {
            hover: ['milestone-details', 'period-highlight'],
            click: ['story-zoom', 'detail-view'],
            zoom: true,
            filter: true,
            drill: true
          },
          storytelling: {
            narrative: 'Journey of transformation with clear beginning, middle, and anticipated future',
            keyMessage: 'Business evolution story with dramatic turning points',
            callToAction: 'Identify patterns for future strategic planning',
            emotionalTone: 'inspiring'
          }
        },
        businessValue: 'Transform data into compelling business narrative that inspires action and decision-making',
        insights: [
          'Clear story arc with turning points',
          'Visual journey metaphor',
          'Milestone-based narrative structure'
        ],
        visualInnovation: {
          noveltyScore: 88,
          designElements: ['journey-path', 'milestone-markers', 'story-annotations'],
          interactivity: ['story-progression', 'milestone-exploration'],
          storytelling: 'Transforms data into compelling business journey with clear narrative arc'
        }
      })
    }

    // Funnel chart for process visualization
    if (numericColumns.length >= 1) {
      const numCol = numericColumns[0]
      
      recommendations.push({
        id: `storytelling_funnel_${startId + 1}`,
        chartType: 'funnel',
        title: `Process Flow Analysis: ${numCol.name} Funnel`,
        description: `Dramatic funnel visualization showing the flow and conversion process for ${numCol.name}`,
        data: numCol.name,
        reason: 'Funnel charts create compelling narrative about process efficiency and conversion rates',
        priority: 'medium',
        confidence: 78,
        configuration: {
          colorScheme: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
          showLegend: true,
          showTooltips: true,
          animations: true,
          responsive: true,
          advancedStyling: {
            gradients: true,
            shadows: true,
            borderRadius: 4,
            transparency: 0.95,
            thematicElements: ['flow-arrows', 'conversion-highlights']
          },
          interactivity: {
            hover: ['stage-highlight', 'conversion-rate'],
            click: ['stage-drill', 'optimization-focus'],
            zoom: false,
            filter: true,
            drill: true
          },
          storytelling: {
            narrative: 'Process efficiency story with clear conversion stages and optimization opportunities',
            keyMessage: 'Conversion flow with actionable improvement areas',
            callToAction: 'Focus on biggest conversion opportunities',
            emotionalTone: 'analytical'
          }
        },
        businessValue: 'Visualize process efficiency and identify conversion optimization opportunities',
        insights: [
          'Process bottleneck identification',
          'Conversion rate visualization',
          'Optimization opportunity highlighting'
        ],
        visualInnovation: {
          noveltyScore: 75,
          designElements: ['tapering-sections', 'flow-metaphor', 'conversion-indicators'],
          interactivity: ['stage-exploration', 'bottleneck-analysis'],
          storytelling: 'Uses familiar funnel metaphor to communicate process efficiency story'
        }
      })
    }

    return recommendations
  }

  /**
   * Rank recommendations by relevance and impact
   */
  private static rankRecommendations(recommendations: ChartRecommendation[], data: AIReadyData): ChartRecommendation[] {
    return recommendations
      .filter(rec => rec.confidence >= 60)
      .sort((a, b) => {
        // Primary sort: innovation score (if available)
        const aInnovation = a.visualInnovation?.noveltyScore || 0
        const bInnovation = b.visualInnovation?.noveltyScore || 0
        if (aInnovation !== bInnovation) {
          return bInnovation - aInnovation
        }
        
        // Secondary sort: priority
        const priorityScore = { high: 3, medium: 2, low: 1 }
        if (priorityScore[a.priority] !== priorityScore[b.priority]) {
          return priorityScore[b.priority] - priorityScore[a.priority]
        }
        
        // Tertiary sort: confidence
        return b.confidence - a.confidence
      })
      .slice(0, 20) // More recommendations for richer visualization options
  }

  /**
   * Generate summary of recommendations
   */
  private static generateSummary(recommendations: ChartRecommendation[], data: AIReadyData): string {
    const highPriority = recommendations.filter(r => r.priority === 'high').length
    const chartTypes = new Set(recommendations.map(r => r.chartType))
    const hasTimeData = !!data.summary.timeRange
    
    return `Generated ${recommendations.length} chart recommendations based on ${data.summary.totalColumns} data columns. ` +
           `${highPriority} high-priority visualizations identified, covering ${chartTypes.size} chart types. ` +
           `${hasTimeData ? 'Time series analysis available. ' : ''}` +
           `Data compatibility score: ${this.calculateCompatibilityScore(data)}/100.`
  }

  /**
   * Calculate data compatibility score for visualization
   */
  private static calculateCompatibilityScore(data: AIReadyData): number {
    let score = 60 // Base score

    // Data size
    if (data.summary.totalRows >= 100) score += 10
    if (data.summary.totalRows >= 1000) score += 5

    // Column variety
    const numericCount = data.summary.columns.filter(c => c.type === 'numeric').length
    const categoricalCount = data.summary.columns.filter(c => c.type === 'string').length
    
    score += Math.min(numericCount * 5, 15)
    score += Math.min(categoricalCount * 3, 10)

    // Time data
    if (data.summary.timeRange) score += 10

    // Correlations
    if (data.summary.numericalSummary.correlations.length > 0) score += 5

    // Data quality
    score += (data.summary.dataQuality.score - 50) * 0.2

    return Math.max(0, Math.min(100, Math.round(score)))
  }
}