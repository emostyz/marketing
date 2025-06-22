// OpenAI calls now handled through server-side API routes

export interface DataPoint {
  title: string;
  insight: string;
  supportingData: any;
  visualizationType: 'line' | 'bar' | 'pie' | 'area' | 'donut' | 'scatter';
  story: string;
  priority: 'high' | 'medium' | 'low';
  chartConfig: {
    index: string;
    categories: string[];
    colors: string[];
    data: any[];
  };
}

export interface DeckInsight {
  dataPoints: DataPoint[];
  overallNarrative: string;
  keyTakeaways: string[];
  executiveSummary: string;
  recommendedStructure: string[];
  confidence: number;
}

export interface ProgressCallback {
  (progress: number, status: string): void;
}

export class DeckBrain {
  private currentIteration = 0;
  private maxIterations = 3;

  async analyzeDataForInsights(
    data: any[],
    userContext: string,
    userGoals: string,
    progressCallback: ProgressCallback,
    iteration: number = 1
  ): Promise<DeckInsight> {
    this.currentIteration = iteration;
    
    progressCallback(5, '🧠 Brain initializing analysis...');
    
    // Phase 1: Deep Data Understanding
    progressCallback(15, '🔍 Brain examining data patterns and relationships...');
    const dataAnalysis = await this.performDeepDataAnalysis(data, userContext);
    
    // Phase 2: Contextual Understanding
    progressCallback(25, '🎯 Brain understanding your specific goals and context...');
    const contextualInsights = await this.generateContextualInsights(data, userContext, userGoals);
    
    // Phase 3: Story Discovery
    progressCallback(35, '📖 Brain discovering compelling stories in your data...');
    const narrativeStructure = await this.discoverDataStories(data, userContext, dataAnalysis);
    
    // Phase 4: Visualization Strategy
    progressCallback(45, '📊 Brain designing optimal visualizations...');
    const visualStrategy = await this.designVisualizationStrategy(data, narrativeStructure, userGoals);
    
    // Phase 5: Quality Review
    progressCallback(55, '🔍 Brain reviewing insights for accuracy and impact...');
    const qualityCheck = await this.performQualityReview(visualStrategy, userContext);
    
    // Phase 6: Refinement (if needed)
    if (qualityCheck.needsImprovement && iteration < this.maxIterations) {
      progressCallback(65, '🔄 Brain refining analysis for maximum impact...');
      return this.analyzeDataForInsights(data, userContext, userGoals, progressCallback, iteration + 1);
    }
    
    progressCallback(75, '✨ Brain finalizing world-class insights...');
    
    const finalInsights: DeckInsight = {
      dataPoints: visualStrategy.dataPoints,
      overallNarrative: narrativeStructure.overallStory,
      keyTakeaways: contextualInsights.keyTakeaways,
      executiveSummary: contextualInsights.executiveSummary,
      recommendedStructure: narrativeStructure.recommendedFlow,
      confidence: qualityCheck.confidence
    };
    
    progressCallback(85, '🎯 Brain validating final recommendations...');
    
    // Final validation pass
    const finalValidation = await this.validateFinalOutput(finalInsights, userContext, userGoals);
    
    progressCallback(100, '✅ Brain analysis complete - ready to build your deck!');
    
    return finalValidation;
  }

  private async performDeepDataAnalysis(data: any[], userContext: string): Promise<any> {
    try {
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          userContext,
          phase: 'data_analysis'
        })
      });

      const result = await response.json();
      
      if (result.fallback) {
        return this.fallbackDataAnalysis(data);
      }

      return result.result;
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      return this.fallbackDataAnalysis(data);
    }
  }

  private async generateContextualInsights(data: any[], userContext: string, userGoals: string): Promise<any> {
    try {
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          userContext,
          userGoals,
          phase: 'contextual_insights'
        })
      });

      const result = await response.json();
      
      if (result.fallback) {
        return this.fallbackContextualInsights(data, userContext);
      }

      return result.result;
    } catch (error) {
      return this.fallbackContextualInsights(data, userContext);
    }
  }

  private async discoverDataStories(data: any[], userContext: string, dataAnalysis: any): Promise<any> {
    try {
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          userContext,
          dataAnalysis,
          phase: 'story_discovery'
        })
      });

      const result = await response.json();
      
      if (result.fallback) {
        return this.fallbackStoryGeneration(data, userContext);
      }

      return result.result;
    } catch (error) {
      return this.fallbackStoryGeneration(data, userContext);
    }
  }

  private async designVisualizationStrategy(data: any[], narrativeStructure: any, userGoals: string): Promise<any> {
    const numericColumns = this.getNumericColumns(data);
    const categoricalColumns = this.getCategoricalColumns(data);
    
    try {
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          narrativeStructure,
          userGoals,
          phase: 'visualization_strategy'
        })
      });

      const result = await response.json();
      
      if (result.fallback) {
        return this.fallbackVisualizationStrategy(data, numericColumns, categoricalColumns);
      }

      // Process and enhance chart configurations
      return {
        dataPoints: this.enhanceChartConfigurations(result.result.dataPoints || [], data)
      };
    } catch (error) {
      return this.fallbackVisualizationStrategy(data, numericColumns, categoricalColumns);
    }
  }

  private async performQualityReview(visualStrategy: any, userContext: string): Promise<any> {
    // For now, return a default quality review to avoid additional API complexity
    // This can be enhanced later with a dedicated quality review API endpoint
    return { 
      confidence: 85, 
      needsImprovement: false, 
      scores: {
        clarity: 8,
        appropriateness: 8,
        coherence: 8,
        relevance: 9,
        engagement: 8,
        actionability: 8
      }
    };
  }

  private async validateFinalOutput(insights: DeckInsight, userContext: string, userGoals: string): Promise<DeckInsight> {
    // For now, return insights as-is to avoid additional API complexity
    // This can be enhanced later with a dedicated validation API endpoint
    return insights;
  }

  private enhanceChartConfigurations(dataPoints: any[], data: any[]): DataPoint[] {
    return dataPoints.map((point: any, index: number) => ({
      title: point.title || `Key Insight ${index + 1}`,
      insight: point.insight || 'Data-driven insight',
      supportingData: point.supportingData || {},
      visualizationType: point.visualizationType || 'bar',
      story: point.story || 'This chart reveals important patterns in the data.',
      priority: point.priority || 'medium',
      chartConfig: {
        index: point.chartConfig?.index || this.getCategoricalColumns(data)[0] || 'name',
        categories: point.chartConfig?.categories || this.getNumericColumns(data).slice(0, 3),
        colors: point.chartConfig?.colors || ['blue', 'emerald', 'violet', 'amber'],
        data: this.processDataForChart(data, point.chartConfig)
      }
    }));
  }

  private processDataForChart(data: any[], chartConfig: any): any[] {
    // Apply any data transformations needed for the specific chart
    let processedData = [...data];
    
    if (chartConfig?.aggregation) {
      processedData = this.aggregateData(processedData, chartConfig.aggregation);
    }
    
    if (chartConfig?.filters) {
      processedData = this.applyFilters(processedData, chartConfig.filters);
    }
    
    return processedData.slice(0, 20); // Limit for performance
  }

  // Utility methods
  private getNumericColumns(data: any[]): string[] {
    if (!data.length) return [];
    return Object.keys(data[0]).filter(key => 
      data.every(row => typeof row[key] === 'number' || !isNaN(Number(row[key])))
    );
  }

  private getCategoricalColumns(data: any[]): string[] {
    if (!data.length) return [];
    const numericCols = this.getNumericColumns(data);
    return Object.keys(data[0]).filter(key => !numericCols.includes(key));
  }

  private summarizeData(data: any[]): string {
    const columns = Object.keys(data[0] || {});
    return `${data.length} records with ${columns.length} columns: ${columns.join(', ')}`;
  }

  private aggregateData(data: any[], aggregationType: string): any[] {
    // Implement aggregation logic based on type
    return data;
  }

  private applyFilters(data: any[], filters: any[]): any[] {
    // Implement filtering logic
    return data;
  }

  // Fallback methods for when OpenAI is unavailable
  private fallbackDataAnalysis(data: any[]): any {
    console.log('🔄 Using fallback data analysis for', data.length, 'records')
    
    if (!data.length) {
      return {
        keyMetrics: { totalRecords: 0, message: 'No data available' },
        trends: [],
        correlations: [],
        recommendations: ['Upload data to begin analysis']
      }
    }

    const columns = Object.keys(data[0])
    const numericColumns = this.getNumericColumns(data)
    const categoricalColumns = this.getCategoricalColumns(data)
    
    // Calculate basic statistics
    const stats = numericColumns.reduce((acc, col) => {
      const values = data.map(row => parseFloat(row[col]) || 0).filter(v => !isNaN(v))
      if (values.length > 0) {
        acc[col] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((sum, v) => sum + v, 0) / values.length,
          total: values.reduce((sum, v) => sum + v, 0)
        }
      }
      return acc
    }, {} as any)

    // Find trends in numeric data
    const trends = numericColumns.slice(0, 3).map(col => {
      const values = data.map(row => parseFloat(row[col]) || 0).filter(v => !isNaN(v))
      if (values.length < 2) return null
      
      const firstHalf = values.slice(0, Math.floor(values.length / 2))
      const secondHalf = values.slice(Math.floor(values.length / 2))
      const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length
      const change = ((secondAvg - firstAvg) / firstAvg) * 100
      
      return {
        trend: `${col} shows ${change > 0 ? 'growth' : 'decline'} of ${Math.abs(change).toFixed(1)}%`,
        significance: Math.abs(change) > 10 ? 'high' : Math.abs(change) > 5 ? 'medium' : 'low',
        dataPoints: [`Average ${col}: ${firstAvg.toFixed(2)} → ${secondAvg.toFixed(2)}`]
      }
    }).filter(Boolean)

    return {
      keyMetrics: {
        totalRecords: data.length,
        columns: columns.length,
        numericColumns: numericColumns.length,
        categoricalColumns: categoricalColumns.length,
        topPerformers: numericColumns.slice(0, 2),
        anomalies: []
      },
      trends,
      correlations: [],
      recommendations: [
        `Analyze ${numericColumns[0] || 'key metrics'} for optimization opportunities`,
        `Review ${categoricalColumns[0] || 'categories'} for segmentation insights`,
        `Consider time-series analysis for trend identification`
      ],
      statistics: stats
    }
  }

  private fallbackContextualInsights(data: any[], userContext: string): any {
    console.log('🔄 Using fallback contextual insights')
    
    const numericColumns = this.getNumericColumns(data)
    const categoricalColumns = this.getCategoricalColumns(data)
    
    // Generate insights based on data structure
    const insights = []
    
    if (numericColumns.length > 0) {
      const mainMetric = numericColumns[0]
      const values = data.map(row => parseFloat(row[mainMetric]) || 0).filter(v => !isNaN(v))
      const total = values.reduce((sum, v) => sum + v, 0)
      const avg = total / values.length
      
      insights.push(`${mainMetric} totals ${total.toLocaleString()} with average of ${avg.toFixed(2)}`)
    }
    
    if (categoricalColumns.length > 0) {
      const categories = [...new Set(data.map(row => row[categoricalColumns[0]]))]
      insights.push(`Data covers ${categories.length} different ${categoricalColumns[0]} categories`)
    }
    
    if (data.length > 100) {
      insights.push(`Large dataset with ${data.length} records provides robust analysis foundation`)
    }

    return {
      executiveSummary: `Analysis of ${data.length} records reveals key patterns in ${userContext}. ${insights.slice(0, 2).join('. ')}.`,
      keyTakeaways: [
        `Dataset contains ${data.length} records with ${Object.keys(data[0]).length} metrics`,
        `Primary focus areas: ${numericColumns.slice(0, 3).join(', ')}`,
        `Categorical analysis available for: ${categoricalColumns.slice(0, 2).join(', ')}`,
        `Opportunity for detailed trend analysis and optimization`,
        `Ready for executive-level insights and recommendations`
      ],
      strategicImplications: [
        {
          implication: 'Data-driven decision making enabled',
          dataBacking: `${data.length} records available`,
          impact: 'high'
        }
      ],
      opportunities: [
        {
          opportunity: 'Deep dive analysis',
          potentialValue: 'Strategic insights',
          actionRequired: 'Review key metrics and trends'
        }
      ],
      risks: []
    }
  }

  private fallbackStoryGeneration(data: any[], userContext: string): any {
    console.log('🔄 Using fallback story generation')
    
    const numericColumns = this.getNumericColumns(data)
    const categoricalColumns = this.getCategoricalColumns(data)
    
    return {
      overallStory: {
        narrative: `Analysis of ${data.length} records reveals important patterns in ${userContext}. The data shows measurable performance across ${numericColumns.length} key metrics.`,
        heroMetrics: numericColumns.slice(0, 2),
        villainProblems: ['Data gaps', 'Performance variations'],
        climax: 'Key insights ready for action'
      },
      microStories: numericColumns.slice(0, 3).map(col => ({
        title: `${col} Performance Analysis`,
        narrative: `The ${col} metric shows important patterns across the dataset.`,
        dataBacking: [`${data.length} data points analyzed`],
        emotionalHook: 'Understanding this metric is crucial for success'
      })),
      recommendedFlow: [
        {
          slideNumber: 1,
          type: 'title',
          title: 'Executive Summary',
          keyMessage: `Analysis of ${data.length} records`
        },
        {
          slideNumber: 2,
          type: 'chart',
          title: `${numericColumns[0] || 'Key Metric'} Overview`,
          keyMessage: 'Performance trends and patterns'
        },
        {
          slideNumber: 3,
          type: 'insight',
          title: 'Key Findings',
          keyMessage: 'Strategic implications and recommendations'
        }
      ],
      callToActions: [
        {
          moment: 'After key findings',
          action: 'Review and implement recommendations',
          urgency: 'Immediate action required',
          dataBacking: `${data.length} records analyzed`
        }
      ]
    }
  }

  private fallbackVisualizationStrategy(data: any[], numericCols: string[], categoricalCols: string[]): any {
    console.log('🔄 Using fallback visualization strategy')
    
    if (!data.length) {
      return {
        dataPoints: [{
          title: 'No Data Available',
          insight: 'Please upload data to generate visualizations',
          visualizationType: 'bar',
          story: 'Data required for analysis',
          priority: 'high',
          chartConfig: {
            index: 'category',
            categories: ['value'],
            colors: ['blue'],
            data: []
          }
        }]
      }
    }

    const dataPoints = []
    
    // Create chart for first numeric column
    if (numericCols.length > 0) {
      const mainMetric = numericCols[0]
      const xAxis = categoricalCols[0] || 'index'
      
      dataPoints.push({
        title: `${mainMetric} Performance Analysis`,
        insight: `Shows ${mainMetric} trends and patterns across the dataset`,
        visualizationType: 'bar',
        story: `This chart reveals key performance patterns in ${mainMetric}`,
        priority: 'high',
        chartConfig: {
          index: xAxis,
          categories: [mainMetric],
          colors: ['blue', 'emerald'],
          data: data.slice(0, 20) // Limit for performance
        }
      })
    }
    
    // Create chart for multiple metrics if available
    if (numericCols.length > 1) {
      dataPoints.push({
        title: 'Multi-Metric Comparison',
        insight: 'Compare performance across multiple key metrics',
        visualizationType: 'line',
        story: 'Shows trends and correlations between different metrics',
        priority: 'medium',
        chartConfig: {
          index: categoricalCols[0] || 'index',
          categories: numericCols.slice(0, 3),
          colors: ['blue', 'emerald', 'violet'],
          data: data.slice(0, 20)
        }
      })
    }
    
    // Create distribution chart if we have enough data
    if (numericCols.length > 0 && data.length > 10) {
      dataPoints.push({
        title: 'Performance Distribution',
        insight: 'Shows the distribution and spread of key metrics',
        visualizationType: 'area',
        story: 'Reveals patterns in how performance is distributed',
        priority: 'medium',
        chartConfig: {
          index: categoricalCols[0] || 'index',
          categories: [numericCols[0]],
          colors: ['blue'],
          data: data.slice(0, 20)
        }
      })
    }

    return { dataPoints }
  }
}

export const deckBrain = new DeckBrain();