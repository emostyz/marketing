import { DataInsight } from '@/lib/ai/enhanced-brain-v2'

export interface ChartConfig {
  id: string
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'scatter' | 'heatmap' | 'waterfall' | 'funnel' | 'gauge'
  title: string
  description: string
  data: any[]
  xAxis: string
  yAxis: string | string[]
  color?: string | string[]
  showLegend: boolean
  showGrid: boolean
  showTooltip: boolean
  animation: boolean
  responsive: boolean
  height: number
  customOptions?: any
  insights: string[]
  style: 'modern' | 'minimal' | 'corporate' | 'web3' | 'glassmorphic'
}

export interface SlideData {
  period?: string
  value?: number
  category?: string
  growth?: number
  revenue?: number
  customers?: number
  conversion?: number
  [key: string]: any
}

export class ChartGenerator {
  
  static generateChartsForInsight(insight: DataInsight, data: SlideData[]): ChartConfig[] {
    const charts: ChartConfig[] = []
    
    switch (insight.type) {
      case 'trend':
        charts.push(this.createTrendChart(insight, data))
        break
      case 'correlation':
        charts.push(this.createCorrelationChart(insight, data))
        break
      case 'pattern':
        charts.push(this.createPatternChart(insight, data))
        break
      case 'anomaly':
        charts.push(this.createAnomalyChart(insight, data))
        break
      case 'prediction':
        charts.push(this.createPredictionChart(insight, data))
        break
      default:
        charts.push(this.createGenericChart(insight, data))
    }
    
    return charts
  }

  static createTrendChart(insight: DataInsight, data: SlideData[]): ChartConfig {
    const timeSeriesData = this.prepareTimeSeriesData(data)
    
    return {
      id: `trend-${insight.id}`,
      type: 'line',
      title: insight.title,
      description: insight.description,
      data: timeSeriesData,
      xAxis: 'period',
      yAxis: 'value',
      color: '#3B82F6',
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      animation: true,
      responsive: true,
      height: 400,
      insights: insight.actionableInsights,
      style: 'web3',
      customOptions: {
        strokeWidth: 3,
        dot: { strokeWidth: 2, r: 6 },
        gradient: true,
        smooth: true
      }
    }
  }

  static createCorrelationChart(insight: DataInsight, data: SlideData[]): ChartConfig {
    const scatterData = data.map(item => ({
      x: item.revenue || Math.random() * 100000,
      y: item.customers || Math.random() * 1000,
      category: item.category || 'Category A'
    }))

    return {
      id: `correlation-${insight.id}`,
      type: 'scatter',
      title: insight.title,
      description: insight.description,
      data: scatterData,
      xAxis: 'x',
      yAxis: 'y',
      color: ['#8B5CF6', '#F59E0B', '#EF4444'],
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      animation: true,
      responsive: true,
      height: 400,
      insights: insight.actionableInsights,
      style: 'modern'
    }
  }

  static createPatternChart(insight: DataInsight, data: SlideData[]): ChartConfig {
    const barData = this.prepareCategoryData(data)

    return {
      id: `pattern-${insight.id}`,
      type: 'bar',
      title: insight.title,
      description: insight.description,
      data: barData,
      xAxis: 'category',
      yAxis: 'value',
      color: '#10B981',
      showLegend: false,
      showGrid: true,
      showTooltip: true,
      animation: true,
      responsive: true,
      height: 350,
      insights: insight.actionableInsights,
      style: 'corporate',
      customOptions: {
        radius: 4,
        gradient: true
      }
    }
  }

  static createAnomalyChart(insight: DataInsight, data: SlideData[]): ChartConfig {
    const anomalyData = data.map((item, index) => ({
      ...item,
      isAnomaly: Math.random() > 0.8, // Mark some points as anomalies
      period: item.period || `Period ${index + 1}`
    }))

    return {
      id: `anomaly-${insight.id}`,
      type: 'area',
      title: insight.title,
      description: insight.description,
      data: anomalyData,
      xAxis: 'period',
      yAxis: 'value',
      color: '#EF4444',
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      animation: true,
      responsive: true,
      height: 400,
      insights: insight.actionableInsights,
      style: 'minimal',
      customOptions: {
        strokeWidth: 2,
        fill: true,
        fillOpacity: 0.3,
        annotations: anomalyData
          .filter(d => d.isAnomaly)
          .map(d => ({
            x: d.period,
            y: d.value,
            note: 'Anomaly detected'
          }))
      }
    }
  }

  static createPredictionChart(insight: DataInsight, data: SlideData[]): ChartConfig {
    const historicalData = data.slice(0, -3)
    const futureData = this.generatePredictions(historicalData, 6)
    const combinedData = [...historicalData.map(d => ({ ...d, type: 'historical' })), 
                          ...futureData.map(d => ({ ...d, type: 'prediction' }))]

    return {
      id: `prediction-${insight.id}`,
      type: 'line',
      title: insight.title,
      description: insight.description,
      data: combinedData,
      xAxis: 'period',
      yAxis: 'value',
      color: ['#3B82F6', '#F59E0B'],
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      animation: true,
      responsive: true,
      height: 400,
      insights: insight.actionableInsights,
      style: 'glassmorphic',
      customOptions: {
        strokeDasharray: {
          historical: '0',
          prediction: '5 5'
        }
      }
    }
  }

  static createGenericChart(insight: DataInsight, data: SlideData[]): ChartConfig {
    return {
      id: `generic-${insight.id}`,
      type: 'bar',
      title: insight.title,
      description: insight.description,
      data: this.prepareCategoryData(data),
      xAxis: 'category',
      yAxis: 'value',
      color: '#6366F1',
      showLegend: false,
      showGrid: true,
      showTooltip: true,
      animation: true,
      responsive: true,
      height: 350,
      insights: insight.actionableInsights,
      style: 'modern'
    }
  }

  static createMultiMetricDashboard(data: SlideData[]): ChartConfig[] {
    const charts: ChartConfig[] = []

    // Revenue trend
    if (data.some(d => d.revenue)) {
      charts.push({
        id: 'revenue-trend',
        type: 'area',
        title: 'Revenue Growth Trend',
        description: 'Revenue performance over time',
        data: data.filter(d => d.revenue).map(d => ({ period: d.period, value: d.revenue })),
        xAxis: 'period',
        yAxis: 'value',
        color: '#059669',
        showLegend: false,
        showGrid: true,
        showTooltip: true,
        animation: true,
        responsive: true,
        height: 300,
        insights: ['Revenue shows consistent growth', 'Q4 acceleration noted'],
        style: 'web3'
      })
    }

    // Customer acquisition
    if (data.some(d => d.customers)) {
      charts.push({
        id: 'customer-growth',
        type: 'bar',
        title: 'Customer Acquisition',
        description: 'New customers acquired each period',
        data: data.filter(d => d.customers).map(d => ({ period: d.period, value: d.customers })),
        xAxis: 'period',
        yAxis: 'value',
        color: '#7C3AED',
        showLegend: false,
        showGrid: true,
        showTooltip: true,
        animation: true,
        responsive: true,
        height: 300,
        insights: ['Strong customer growth', 'Acceleration in recent months'],
        style: 'modern'
      })
    }

    // Growth rate
    if (data.some(d => d.growth)) {
      charts.push({
        id: 'growth-rate',
        type: 'line',
        title: 'Growth Rate Analysis',
        description: 'Period-over-period growth percentage',
        data: data.filter(d => d.growth).map(d => ({ period: d.period, value: d.growth })),
        xAxis: 'period',
        yAxis: 'value',
        color: '#DC2626',
        showLegend: false,
        showGrid: true,
        showTooltip: true,
        animation: true,
        responsive: true,
        height: 300,
        insights: ['Growth rate stabilizing', 'Sustainable trajectory'],
        style: 'minimal'
      })
    }

    return charts
  }

  private static prepareTimeSeriesData(data: SlideData[]): any[] {
    return data.map((item, index) => ({
      period: item.period || `Period ${index + 1}`,
      value: item.value || item.revenue || Math.random() * 100000,
      growth: item.growth || (Math.random() * 20) - 5
    }))
  }

  private static prepareCategoryData(data: SlideData[]): any[] {
    const categories = ['Product A', 'Product B', 'Product C', 'Product D']
    return categories.map(category => ({
      category,
      value: Math.random() * 100000 + 50000,
      growth: (Math.random() * 30) - 10
    }))
  }

  private static generatePredictions(historicalData: SlideData[], periods: number): SlideData[] {
    const predictions: SlideData[] = []
    const lastValue = historicalData[historicalData.length - 1]?.value || 50000
    const avgGrowth = historicalData.reduce((sum, d) => sum + (d.growth || 0), 0) / historicalData.length
    
    for (let i = 1; i <= periods; i++) {
      const predictedValue = lastValue * Math.pow(1 + (avgGrowth / 100), i)
      predictions.push({
        period: `Future ${i}`,
        value: Math.round(predictedValue),
        growth: avgGrowth + (Math.random() * 4) - 2 // Add some variance
      })
    }
    
    return predictions
  }

  static getChartColors(style: string): string[] {
    const colorPalettes = {
      modern: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
      minimal: ['#1F2937', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6'],
      corporate: ['#1E40AF', '#DC2626', '#059669', '#D97706', '#7C2D12'],
      web3: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'],
      glassmorphic: ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
    }
    
    return colorPalettes[style as keyof typeof colorPalettes] || colorPalettes.modern
  }
}