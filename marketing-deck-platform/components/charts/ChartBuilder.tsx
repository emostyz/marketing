'use client';

import { useState, useMemo } from 'react';
import { Line, Bar, Pie, Doughnut, Scatter, Radar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { CHART_CONFIGS, CHART_THEMES, ChartType, ChartTheme } from '@/lib/charts/chart-config';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ChartBuilderProps {
  data: any[];
  onChartUpdate?: (chartConfig: ChartConfiguration) => void;
}

interface ChartConfiguration {
  type: ChartType;
  xAxis: string;
  yAxis: string[];
  theme: ChartTheme;
  title: string;
  showLegend: boolean;
  showDataLabels: boolean;
}

interface DataMapping {
  x: string;
  y: string[];
  category?: string;
}

export function ChartBuilder({ data, onChartUpdate }: ChartBuilderProps) {
  const [chartConfig, setChartConfig] = useState<ChartConfiguration>({
    type: 'line',
    xAxis: '',
    yAxis: [],
    theme: 'modern',
    title: 'Untitled Chart',
    showLegend: true,
    showDataLabels: false
  });

  // Get column information from data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const numericColumns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return columns.filter(col => {
      const values = data.slice(0, 10).map(row => row[col]);
      return values.some(val => !isNaN(parseFloat(val)));
    });
  }, [columns, data]);

  const categoricalColumns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return columns.filter(col => {
      const uniqueValues = new Set(data.map(row => row[col]));
      return uniqueValues.size < data.length * 0.1 && uniqueValues.size > 1;
    });
  }, [columns, data]);

  // Transform data for Chart.js
  const chartData = useMemo(() => {
    if (!data || !chartConfig.xAxis || chartConfig.yAxis.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = data.map(row => row[chartConfig.xAxis]);
    const theme = CHART_THEMES[chartConfig.theme];

    if (chartConfig.type === 'pie' || chartConfig.type === 'doughnut') {
      // For pie/doughnut charts, aggregate data by category
      const aggregated = data.reduce((acc, row) => {
        const category = row[chartConfig.xAxis];
        const value = parseFloat(row[chartConfig.yAxis[0]]) || 0;
        acc[category] = (acc[category] || 0) + value;
        return acc;
      }, {} as Record<string, number>);

      return {
        labels: Object.keys(aggregated),
        datasets: [{
          data: Object.values(aggregated),
          backgroundColor: theme.primary,
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      };
    }

    // For other chart types
    const datasets = chartConfig.yAxis.map((yCol, index) => ({
      label: yCol,
      data: data.map(row => parseFloat(row[yCol]) || 0),
      borderColor: theme.primary[index % theme.primary.length],
      backgroundColor: chartConfig.type === 'line' 
        ? theme.primary[index % theme.primary.length] + '20'
        : theme.primary[index % theme.primary.length],
      borderWidth: 2,
      tension: chartConfig.type === 'line' ? 0.4 : undefined,
      fill: chartConfig.type === 'line' ? false : undefined
    }));

    return {
      labels,
      datasets
    };
  }, [data, chartConfig]);

  // Get chart options
  const chartOptions = useMemo(() => {
    const baseOptions = CHART_CONFIGS[chartConfig.type] || CHART_CONFIGS.line;
    
    return {
      ...baseOptions,
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins?.legend,
          display: chartConfig.showLegend
        },
        datalabels: {
          ...(baseOptions.plugins && 'datalabels' in baseOptions.plugins ? baseOptions.plugins.datalabels : {}),
          display: chartConfig.showDataLabels
        },
        title: {
          display: true,
          text: chartConfig.title,
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        }
      }
    } as ChartOptions;
  }, [chartConfig]);

  // Render appropriate chart component
  const renderChart = () => {
    const props = {
      data: chartData as any,
      options: chartOptions as any
    };

    switch (chartConfig.type) {
      case 'line':
        return <Line {...props} />;
      case 'bar':
        return <Bar {...props} />;
      case 'pie':
        return <Pie {...props} />;
      case 'doughnut':
        return <Doughnut {...props} />;
      case 'scatter':
        return <Scatter {...props} />;
      case 'radar':
        return <Radar {...props} />;
      default:
        return <Line {...props} />;
    }
  };

  const updateConfig = (updates: Partial<ChartConfiguration>) => {
    const newConfig = { ...chartConfig, ...updates };
    setChartConfig(newConfig);
    onChartUpdate?.(newConfig);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Configuration Panel */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-6">Chart Configuration</h3>
        
        {/* Chart Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Chart Type</label>
          <select
            value={chartConfig.type}
            onChange={(e) => updateConfig({ type: e.target.value as ChartType })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="doughnut">Doughnut Chart</option>
            <option value="scatter">Scatter Plot</option>
            <option value="radar">Radar Chart</option>
          </select>
        </div>

        {/* Chart Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={chartConfig.title}
            onChange={(e) => updateConfig({ title: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* X-Axis */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            {chartConfig.type === 'pie' || chartConfig.type === 'doughnut' ? 'Category' : 'X-Axis'}
          </label>
          <select
            value={chartConfig.xAxis}
            onChange={(e) => updateConfig({ xAxis: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select column...</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        {/* Y-Axis */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            {chartConfig.type === 'pie' || chartConfig.type === 'doughnut' ? 'Value' : 'Y-Axis'}
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {numericColumns.map(col => (
              <label key={col} className="flex items-center">
                <input
                  type={chartConfig.type === 'pie' || chartConfig.type === 'doughnut' ? 'radio' : 'checkbox'}
                  name="yAxis"
                  checked={chartConfig.yAxis.includes(col)}
                  onChange={(e) => {
                    if (chartConfig.type === 'pie' || chartConfig.type === 'doughnut') {
                      updateConfig({ yAxis: e.target.checked ? [col] : [] });
                    } else {
                      const newYAxis = e.target.checked
                        ? [...chartConfig.yAxis, col]
                        : chartConfig.yAxis.filter(y => y !== col);
                      updateConfig({ yAxis: newYAxis });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{col}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Color Theme</label>
          <select
            value={chartConfig.theme}
            onChange={(e) => updateConfig({ theme: e.target.value as ChartTheme })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="modern">Modern</option>
            <option value="corporate">Corporate</option>
            <option value="vibrant">Vibrant</option>
          </select>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={chartConfig.showLegend}
              onChange={(e) => updateConfig({ showLegend: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm">Show Legend</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={chartConfig.showDataLabels}
              onChange={(e) => updateConfig({ showDataLabels: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm">Show Data Labels</span>
          </label>
        </div>

        {/* Smart Suggestions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Smart Suggestions</h4>
          <div className="space-y-2">
            {categoricalColumns.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  updateConfig({
                    type: 'pie',
                    xAxis: categoricalColumns[0],
                    yAxis: numericColumns.slice(0, 1)
                  });
                }}
                className="w-full justify-start text-blue-700"
              >
                📊 Show {categoricalColumns[0]} breakdown
              </Button>
            )}
            
            {columns.some(col => col.toLowerCase().includes('date') || col.toLowerCase().includes('time')) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const timeCol = columns.find(col => 
                    col.toLowerCase().includes('date') || col.toLowerCase().includes('time')
                  );
                  updateConfig({
                    type: 'line',
                    xAxis: timeCol || '',
                    yAxis: numericColumns.slice(0, 1)
                  });
                }}
                className="w-full justify-start text-blue-700"
              >
                📈 Show trend over time
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chart Preview */}
      <div className="flex-1 p-8">
        <Card className="h-full p-6">
          {data && data.length > 0 && chartConfig.xAxis && chartConfig.yAxis.length > 0 ? (
            <div className="h-full">
              {renderChart()}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg mb-2">Configure your chart</p>
                <p className="text-sm">Select columns and chart type to see preview</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}