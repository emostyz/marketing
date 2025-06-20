import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface DataSchema {
  [column: string]: {
    type: 'string' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean';
    nullable: boolean;
    unique: boolean;
    cardinality: number;
    sample: any[];
    format?: string;
    distribution?: {
      min?: number;
      max?: number;
      mean?: number;
      median?: number;
      std?: number;
    };
  };
}

export interface Insight {
  id: string;
  type: 'statistic' | 'trend' | 'correlation' | 'outlier' | 'summary';
  title: string;
  description: string;
  importance: number; // 0-1 scale
  visualization?: {
    type: 'metric' | 'line' | 'bar' | 'pie' | 'scatter';
    data: any;
  };
}

export interface AnalysisResult {
  data: any[];
  schema: DataSchema;
  insights: Insight[];
  visualizations: any[];
  summary: string;
}

export class DataAnalyzer {
  private data: any[] = [];
  private schema: DataSchema = {};
  
  async analyzeFile(file: File): Promise<AnalysisResult> {
    // Step 1: Parse file
    this.data = await this.parseFile(file);
    
    // Step 2: Detect schema (from code-interpreter patterns)
    this.schema = this.detectSchema(this.data);
    
    // Step 3: Generate insights
    const insights = await this.generateInsights();
    
    // Step 4: Recommend visualizations
    const visualizations = this.recommendVisualizations();
    
    return {
      data: this.data,
      schema: this.schema,
      insights,
      visualizations,
      summary: this.generateSummary()
    };
  }
  
  private async parseFile(file: File): Promise<any[]> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    switch (fileExtension) {
      case 'csv':
        return this.parseCSV(file);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(file);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }
  
  private parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          resolve(results.data);
        },
        error: (err) => reject(err),
      });
    });
  }
  
  private async parseExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Convert to objects with headers
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          const result = rows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  }
  
  private detectSchema(data: any[]): DataSchema {
    if (!data || data.length === 0) return {};
    
    const schema: DataSchema = {};
    const sample = data.slice(0, Math.min(100, data.length));
    
    Object.keys(data[0] || {}).forEach(column => {
      const values = sample.map(row => row[column]).filter(v => v != null);
      const allValues = data.map(row => row[column]);
      
      schema[column] = {
        type: this.detectColumnType(values),
        nullable: allValues.some(v => v == null),
        unique: new Set(allValues).size === allValues.length,
        cardinality: new Set(allValues).size,
        sample: values.slice(0, 5)
      };
      
      // Enhanced type detection
      if (this.isDateColumn(values)) {
        schema[column].type = 'date';
        schema[column].format = this.detectDateFormat(values);
      } else if (this.isCurrencyColumn(values)) {
        schema[column].type = 'currency';
      } else if (this.isPercentageColumn(values)) {
        schema[column].type = 'percentage';
      }
      
      // Calculate distribution for numeric columns
      if (schema[column].type === 'number' || schema[column].type === 'currency') {
        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (numericValues.length > 0) {
          schema[column].distribution = this.calculateDistribution(numericValues);
        }
      }
    });
    
    return schema;
  }
  
  private detectColumnType(values: any[]): DataSchema[string]['type'] {
    if (values.length === 0) return 'string';
    
    const numericCount = values.filter(v => !isNaN(parseFloat(v))).length;
    const booleanCount = values.filter(v => typeof v === 'boolean' || 
      (typeof v === 'string' && ['true', 'false', 'yes', 'no', '1', '0'].includes(v.toLowerCase()))).length;
    
    const numericRatio = numericCount / values.length;
    const booleanRatio = booleanCount / values.length;
    
    if (booleanRatio > 0.8) return 'boolean';
    if (numericRatio > 0.8) return 'number';
    
    return 'string';
  }
  
  private isDateColumn(values: any[]): boolean {
    const dateCount = values.filter(v => {
      if (typeof v === 'string') {
        const date = new Date(v);
        return !isNaN(date.getTime()) && v.length > 4; // Avoid single numbers
      }
      return false;
    }).length;
    
    return dateCount / values.length > 0.7;
  }
  
  private detectDateFormat(values: any[]): string {
    const sample = values[0];
    if (typeof sample === 'string') {
      if (sample.includes('/')) return 'MM/DD/YYYY';
      if (sample.includes('-')) return 'YYYY-MM-DD';
      if (sample.includes('.')) return 'DD.MM.YYYY';
    }
    return 'unknown';
  }
  
  private isCurrencyColumn(values: any[]): boolean {
    const currencyCount = values.filter(v => 
      typeof v === 'string' && /^[\$€£¥]/.test(v)
    ).length;
    return currencyCount / values.length > 0.5;
  }
  
  private isPercentageColumn(values: any[]): boolean {
    const percentageCount = values.filter(v => 
      (typeof v === 'string' && v.includes('%')) ||
      (typeof v === 'number' && v <= 1 && v >= 0)
    ).length;
    return percentageCount / values.length > 0.5;
  }
  
  private calculateDistribution(values: number[]) {
    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    
    // Calculate standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      mean,
      median: sorted[Math.floor(sorted.length / 2)],
      std
    };
  }
  
  private async generateInsights(): Promise<Insight[]> {
    const insights: Insight[] = [];
    
    // Statistical insights for numeric columns
    Object.entries(this.schema).forEach(([column, config]) => {
      if ((config.type === 'number' || config.type === 'currency') && config.distribution) {
        const values = this.data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
        
        insights.push({
          id: `stat-${column}`,
          type: 'statistic',
          title: `${column} Analysis`,
          description: `Average: ${config.distribution.mean?.toLocaleString()}, Range: ${config.distribution.min?.toLocaleString()} - ${config.distribution.max?.toLocaleString()}`,
          importance: 0.7,
          visualization: {
            type: 'metric',
            data: {
              value: config.distribution.mean,
              trend: this.calculateTrend(values)
            }
          }
        });
        
        // Detect outliers
        const outliers = this.detectOutliers(values);
        if (outliers.length > 0) {
          insights.push({
            id: `outlier-${column}`,
            type: 'outlier',
            title: `${column} Outliers Detected`,
            description: `Found ${outliers.length} outliers in ${column}`,
            importance: 0.6,
            visualization: {
              type: 'scatter',
              data: values.map((v, i) => ({ x: i, y: v, isOutlier: outliers.includes(v) }))
            }
          });
        }
      }
    });
    
    // Time series insights
    const timeColumn = this.findTimeColumn();
    if (timeColumn) {
      const metricColumns = this.findMetricColumns();
      
      metricColumns.forEach(metric => {
        const timeSeries = this.createTimeSeries(timeColumn, metric);
        const trend = this.analyzeTrend(timeSeries);
        
        insights.push({
          id: `trend-${metric}`,
          type: 'trend',
          title: `${metric} Trend Analysis`,
          description: `${metric} shows ${trend.direction} trend with ${trend.percentage}% change`,
          importance: 0.9,
          visualization: {
            type: 'line',
            data: timeSeries
          }
        });
      });
    }
    
    // Correlation insights
    const correlations = this.findCorrelations();
    correlations.forEach(corr => {
      if (Math.abs(corr.value) > 0.7) {
        insights.push({
          id: `corr-${corr.col1}-${corr.col2}`,
          type: 'correlation',
          title: `${corr.col1} vs ${corr.col2}`,
          description: `Strong ${corr.value > 0 ? 'positive' : 'negative'} correlation (${corr.value.toFixed(2)})`,
          importance: 0.8,
          visualization: {
            type: 'scatter',
            data: this.createScatterData(corr.col1, corr.col2)
          }
        });
      }
    });
    
    return insights.sort((a, b) => b.importance - a.importance);
  }
  
  private calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  }
  
  private detectOutliers(values: number[]): number[] {
    const sorted = values.sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(v => v < lowerBound || v > upperBound);
  }
  
  private findTimeColumn(): string | null {
    return Object.entries(this.schema).find(([_, config]) => 
      config.type === 'date'
    )?.[0] || null;
  }
  
  private findMetricColumns(): string[] {
    return Object.entries(this.schema)
      .filter(([_, config]) => config.type === 'number' || config.type === 'currency')
      .map(([column]) => column);
  }
  
  private createTimeSeries(timeColumn: string, metricColumn: string): any[] {
    return this.data
      .map(row => ({
        date: new Date(row[timeColumn]).getTime(),
        value: parseFloat(row[metricColumn]) || 0
      }))
      .filter(item => !isNaN(item.date))
      .sort((a, b) => a.date - b.date);
  }
  
  private analyzeTrend(timeSeries: any[]): { direction: string; percentage: number } {
    if (timeSeries.length < 2) return { direction: 'stable', percentage: 0 };
    
    const firstValue = timeSeries[0].value;
    const lastValue = timeSeries[timeSeries.length - 1].value;
    const percentage = ((lastValue - firstValue) / firstValue) * 100;
    
    return {
      direction: percentage > 5 ? 'upward' : percentage < -5 ? 'downward' : 'stable',
      percentage: Math.abs(percentage)
    };
  }
  
  private findCorrelations(): Array<{ col1: string; col2: string; value: number }> {
    const numericColumns = this.findMetricColumns();
    const correlations: Array<{ col1: string; col2: string; value: number }> = [];
    
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        
        const values1 = this.data.map(row => parseFloat(row[col1])).filter(v => !isNaN(v));
        const values2 = this.data.map(row => parseFloat(row[col2])).filter(v => !isNaN(v));
        
        if (values1.length === values2.length && values1.length > 1) {
          const correlation = this.calculateCorrelation(values1, values2);
          correlations.push({ col1, col2, value: correlation });
        }
      }
    }
    
    return correlations;
  }
  
  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);
    
    const correlation = (n * sumXY - sumX * sumY) /
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      
    return isNaN(correlation) ? 0 : correlation;
  }
  
  private createScatterData(col1: string, col2: string): any[] {
    return this.data.map(row => ({
      x: parseFloat(row[col1]) || 0,
      y: parseFloat(row[col2]) || 0
    })).filter(point => !isNaN(point.x) && !isNaN(point.y));
  }
  
  private recommendVisualizations(): any[] {
    const visualizations: any[] = [];
    
    // Time series visualizations
    const timeColumn = this.findTimeColumn();
    if (timeColumn) {
      const metricColumns = this.findMetricColumns();
      metricColumns.forEach(metric => {
        visualizations.push({
          type: 'line',
          title: `${metric} Over Time`,
          config: {
            xAxis: timeColumn,
            yAxis: [metric],
            chartType: 'line'
          }
        });
      });
    }
    
    // Distribution visualizations for numeric columns
    this.findMetricColumns().forEach(column => {
      visualizations.push({
        type: 'bar',
        title: `${column} Distribution`,
        config: {
          xAxis: column,
          yAxis: ['Count'],
          chartType: 'bar'
        }
      });
    });
    
    // Categorical breakdowns
    Object.entries(this.schema).forEach(([column, config]) => {
      if (config.type === 'string' && config.cardinality < 10) {
        const metricColumns = this.findMetricColumns();
        if (metricColumns.length > 0) {
          visualizations.push({
            type: 'pie',
            title: `${metricColumns[0]} by ${column}`,
            config: {
              category: column,
              value: metricColumns[0],
              chartType: 'pie'
            }
          });
        }
      }
    });
    
    return visualizations;
  }
  
  private generateSummary(): string {
    const rowCount = this.data.length;
    const columnCount = Object.keys(this.schema).length;
    const numericColumns = this.findMetricColumns().length;
    const timeColumn = this.findTimeColumn();
    
    let summary = `Dataset contains ${rowCount.toLocaleString()} rows and ${columnCount} columns. `;
    summary += `${numericColumns} numeric columns identified for analysis. `;
    
    if (timeColumn) {
      summary += `Time series data detected with ${timeColumn} as the time dimension. `;
    }
    
    return summary;
  }
}