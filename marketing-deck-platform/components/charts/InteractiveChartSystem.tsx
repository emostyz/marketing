'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp,
  Settings,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel
} from 'recharts'
import { Card, AreaChart as TremorArea, BarChart as TremorBar, DonutChart } from '@tremor/react'
import * as echarts from 'echarts'

interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'funnel' | 'heatmap' | 'donut';
  title: string;
  data: any[];
  config: {
    xAxis: string;
    yAxis: string | string[];
    colors: string[];
    library: 'recharts' | 'tremor' | 'echarts';
    interactive: boolean;
    editable: boolean;
  };
  insights?: string[];
  lastModified: Date;
}

interface InteractiveChartProps {
  chartData: ChartData;
  onDataUpdate: (chartId: string, newData: any[]) => void;
  onConfigUpdate: (chartId: string, newConfig: any) => void;
  onInsightUpdate: (chartId: string, insights: string[]) => void;
  className?: string;
}

// Data Editor Component
const DataEditor: React.FC<{
  data: any[];
  onSave: (newData: any[]) => void;
  onCancel: () => void;
}> = ({ data, onSave, onCancel }) => {
  const [editedData, setEditedData] = useState([...data]);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: string} | null>(null);

  const handleCellChange = (rowIndex: number, column: string, value: string) => {
    const newData = [...editedData];
    newData[rowIndex] = { ...newData[rowIndex], [column]: value };
    setEditedData(newData);
  };

  const addRow = () => {
    const newRow = Object.keys(editedData[0] || {}).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as any);
    setEditedData([...editedData, newRow]);
  };

  const removeRow = (index: number) => {
    const newData = editedData.filter((_, i) => i !== index);
    setEditedData(newData);
  };

  const columns = Object.keys(editedData[0] || {});

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Edit Chart Data</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => onSave(editedData)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={onCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-auto max-h-[70vh]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">#</th>
                  {columns.map(col => (
                    <th key={col} className="border border-gray-300 p-2 text-left font-medium">
                      {col}
                    </th>
                  ))}
                  <th className="border border-gray-300 p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {editedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 text-gray-500">{rowIndex + 1}</td>
                    {columns.map(col => (
                      <td key={`${rowIndex}-${col}`} className="border border-gray-300 p-1">
                        <input
                          type="text"
                          value={row[col] || ''}
                          onChange={(e) => handleCellChange(rowIndex, col, e.target.value)}
                          className={`w-full p-1 border-none outline-none ${
                            selectedCell?.row === rowIndex && selectedCell?.col === col
                              ? 'bg-blue-100 ring-2 ring-blue-500'
                              : 'hover:bg-gray-100'
                          }`}
                          onFocus={() => setSelectedCell({row: rowIndex, col})}
                          onBlur={() => setSelectedCell(null)}
                        />
                      </td>
                    ))}
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={addRow}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Row</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Chart Configuration Panel
const ChartConfigPanel: React.FC<{
  config: ChartData['config'];
  availableColumns: string[];
  onConfigChange: (newConfig: any) => void;
  onClose: () => void;
}> = ({ config, availableColumns, onConfigChange, onClose }) => {
  const [localConfig, setLocalConfig] = useState({ ...config });

  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Chart Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Chart Library */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Library
            </label>
            <select
              value={localConfig.library}
              onChange={(e) => setLocalConfig({ ...localConfig, library: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="tremor">Tremor (Recommended)</option>
              <option value="recharts">Recharts</option>
              <option value="echarts">ECharts</option>
            </select>
          </div>

          {/* X-Axis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X-Axis Column
            </label>
            <select
              value={localConfig.xAxis}
              onChange={(e) => setLocalConfig({ ...localConfig, xAxis: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              {availableColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Y-Axis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Y-Axis Column(s)
            </label>
            {Array.isArray(localConfig.yAxis) ? (
              <div className="space-y-2">
                {localConfig.yAxis.map((axis, index) => (
                  <div key={index} className="flex space-x-2">
                    <select
                      value={axis}
                      onChange={(e) => {
                        const newYAxis = [...localConfig.yAxis as string[]];
                        newYAxis[index] = e.target.value;
                        setLocalConfig({ ...localConfig, yAxis: newYAxis });
                      }}
                      className="flex-1 border border-gray-300 rounded-lg p-2"
                    >
                      {availableColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const newYAxis = (localConfig.yAxis as string[]).filter((_, i) => i !== index);
                        setLocalConfig({ ...localConfig, yAxis: newYAxis });
                      }}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newYAxis = [...(localConfig.yAxis as string[]), availableColumns[0]];
                    setLocalConfig({ ...localConfig, yAxis: newYAxis });
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Series</span>
                </button>
              </div>
            ) : (
              <select
                value={localConfig.yAxis as string}
                onChange={(e) => setLocalConfig({ ...localConfig, yAxis: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                {availableColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            )}
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Scheme
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['blue', 'green', 'purple', 'red', 'orange', 'teal', 'pink', 'gray'].map(color => (
                <button
                  key={color}
                  onClick={() => setLocalConfig({ 
                    ...localConfig, 
                    colors: [color, ...localConfig.colors.slice(1)] 
                  })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    localConfig.colors[0] === color ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Interactive Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localConfig.interactive}
                onChange={(e) => setLocalConfig({ ...localConfig, interactive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Interactive</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localConfig.editable}
                onChange={(e) => setLocalConfig({ ...localConfig, editable: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Editable</span>
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Main Interactive Chart Component
export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  chartData,
  onDataUpdate,
  onConfigUpdate,
  onInsightUpdate,
  className = ''
}) => {
  const [isEditingData, setIsEditingData] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const echartRef = useRef<HTMLDivElement>(null);
  const echartInstance = useRef<echarts.ECharts | null>(null);

  // Initialize ECharts
  useEffect(() => {
    if (chartData.config.library === 'echarts' && echartRef.current && !echartInstance.current) {
      echartInstance.current = echarts.init(echartRef.current);
      
      // Configure ECharts options based on chart type
      const option = getEChartsOption(chartData);
      echartInstance.current.setOption(option);
    }

    return () => {
      if (echartInstance.current) {
        echartInstance.current.dispose();
        echartInstance.current = null;
      }
    };
  }, [chartData.config.library, chartData.type]);

  // Update ECharts when data changes
  useEffect(() => {
    if (echartInstance.current && chartData.config.library === 'echarts') {
      const option = getEChartsOption(chartData);
      echartInstance.current.setOption(option, true);
    }
  }, [chartData.data, chartData.config]);

  const handleDataSave = useCallback((newData: any[]) => {
    onDataUpdate(chartData.id, newData);
    setIsEditingData(false);
  }, [chartData.id, onDataUpdate]);

  const handleConfigSave = useCallback((newConfig: any) => {
    onConfigUpdate(chartData.id, newConfig);
  }, [chartData.id, onConfigUpdate]);

  const availableColumns = chartData.data.length > 0 ? Object.keys(chartData.data[0]) : [];

  const renderChart = () => {
    const { type, data, config } = chartData;

    switch (config.library) {
      case 'tremor':
        return renderTremorChart(type, data, config);
      case 'recharts':
        return renderRechartsChart(type, data, config);
      case 'echarts':
        return <div ref={echartRef} className="w-full h-full min-h-[300px]" />;
      default:
        return renderRechartsChart(type, data, config);
    }
  };

  const renderTremorChart = (type: string, data: any[], config: any) => {
    const commonProps = {
      data,
      index: config.xAxis,
      categories: Array.isArray(config.yAxis) ? config.yAxis : [config.yAxis],
      colors: config.colors,
      showAnimation: true,
      showTooltip: true,
      showLegend: Array.isArray(config.yAxis) && config.yAxis.length > 1,
    };

    switch (type) {
      case 'area':
        return <TremorArea {...commonProps} />;
      case 'bar':
        return <TremorBar {...commonProps} />;
      case 'donut':
      case 'pie':
        return (
          <DonutChart
            data={data}
            category={Array.isArray(config.yAxis) ? config.yAxis[0] : config.yAxis}
            index={config.xAxis}
            colors={config.colors}
            showAnimation={true}
            showTooltip={true}
          />
        );
      default:
        return <TremorBar {...commonProps} />;
    }
  };

  const renderRechartsChart = (type: string, data: any[], config: any) => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-medium text-gray-900">{label}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.value?.toLocaleString()}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={config.xAxis} stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {(Array.isArray(config.yAxis) ? config.yAxis : [config.yAxis]).map((axis: string, index: number) => (
                <Line
                  key={axis}
                  type="monotone"
                  dataKey={axis}
                  stroke={config.colors[index % config.colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={config.xAxis} stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {(Array.isArray(config.yAxis) ? config.yAxis : [config.yAxis]).map((axis: string, index: number) => (
                <Bar
                  key={axis}
                  dataKey={axis}
                  fill={config.colors[index % config.colors.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={config.xAxis} stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {(Array.isArray(config.yAxis) ? config.yAxis : [config.yAxis]).map((axis: string, index: number) => (
                <Area
                  key={axis}
                  type="monotone"
                  dataKey={axis}
                  stackId="1"
                  stroke={config.colors[index % config.colors.length]}
                  fill={config.colors[index % config.colors.length]}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = data.map(item => ({
          name: item[config.xAxis],
          value: item[Array.isArray(config.yAxis) ? config.yAxis[0] : config.yAxis]
        }));

        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={config.colors[index % config.colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={config.xAxis} stroke="#6b7280" />
              <YAxis dataKey={Array.isArray(config.yAxis) ? config.yAxis[0] : config.yAxis} stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                name="Data Points"
                dataKey={Array.isArray(config.yAxis) ? config.yAxis[0] : config.yAxis}
                fill={config.colors[0]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return renderRechartsChart('bar', data, config);
    }
  };

  const getEChartsOption = (chartData: ChartData) => {
    const { type, data, config } = chartData;
    
    const categories = data.map(item => item[config.xAxis]);
    const series = Array.isArray(config.yAxis) ? config.yAxis : [config.yAxis];

    const baseOption = {
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' }
      },
      legend: {
        data: series,
        top: 20
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category' as const,
        boundaryGap: type !== 'line',
        data: categories,
        axisLine: { lineStyle: { color: '#6b7280' } },
        axisTick: { lineStyle: { color: '#6b7280' } },
        axisLabel: { color: '#6b7280' }
      },
      yAxis: {
        type: 'value' as const,
        axisLine: { lineStyle: { color: '#6b7280' } },
        axisTick: { lineStyle: { color: '#6b7280' } },
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#e5e7eb' } }
      }
    };

    switch (type) {
      case 'heatmap':
        return {
          ...baseOption,
          visualMap: {
            min: 0,
            max: 100,
            calculable: true,
            orient: 'horizontal' as const,
            left: 'center',
            bottom: '15%'
          },
          series: [{
            name: 'Heatmap',
            type: 'heatmap',
            data: data.map((item, i) => [
              i,
              0,
              item[Array.isArray(config.yAxis) ? config.yAxis[0] : config.yAxis]
            ]),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        };

      case 'funnel':
        return {
          title: {
            text: chartData.title,
            left: 'center'
          },
          tooltip: {
            trigger: 'item' as const,
            formatter: '{a} <br/>{b} : {c}%'
          },
          series: [{
            name: 'Funnel',
            type: 'funnel',
            left: '10%',
            top: 60,
            width: '80%',
            height: '80%',
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending' as const,
            gap: 2,
            label: {
              show: true,
              position: 'inside' as const
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 1,
                type: 'solid' as const
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            emphasis: {
              label: {
                fontSize: 20
              }
            },
            data: data.map((item, index) => ({
              value: item[Array.isArray(config.yAxis) ? config.yAxis[0] : config.yAxis],
              name: item[config.xAxis],
              itemStyle: { color: config.colors[index % config.colors.length] }
            }))
          }]
        };

      default:
        return {
          ...baseOption,
          series: series.map((seriesName, index) => ({
            name: seriesName,
            type: type === 'area' ? 'line' : type,
            data: data.map(item => item[seriesName]),
            smooth: type === 'line' || type === 'area',
            areaStyle: type === 'area' ? { opacity: 0.3 } : undefined,
            itemStyle: { color: config.colors[index % config.colors.length] }
          }))
        };
    }
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Chart Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{chartData.title}</h3>
          <p className="text-sm text-gray-500">
            {chartData.config.library} • {chartData.type} chart • {chartData.data.length} records
          </p>
        </div>
        
        {/* Chart Controls */}
        <AnimatePresence>
          {(isHovered || isEditingData || isConfigOpen) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex space-x-2"
            >
              {chartData.config.editable && (
                <button
                  onClick={() => setIsEditingData(true)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit data"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={() => setIsConfigOpen(true)}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Chart settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title={showInsights ? "Hide insights" : "Show insights"}
              >
                {showInsights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart Content */}
      <div className="p-4">
        <div className="h-64 mb-4">
          {renderChart()}
        </div>

        {/* AI Insights */}
        <AnimatePresence>
          {showInsights && chartData.insights && chartData.insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-4"
            >
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1 text-blue-500" />
                AI Insights
              </h4>
              <div className="space-y-2">
                {chartData.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isEditingData && (
          <DataEditor
            data={chartData.data}
            onSave={handleDataSave}
            onCancel={() => setIsEditingData(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfigOpen && (
          <ChartConfigPanel
            config={chartData.config}
            availableColumns={availableColumns}
            onConfigChange={handleConfigSave}
            onClose={() => setIsConfigOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Chart Factory for creating new charts
export const ChartFactory = {
  createChart: (
    type: ChartData['type'],
    data: any[],
    title: string,
    xAxis: string,
    yAxis: string | string[],
    library: 'recharts' | 'tremor' | 'echarts' = 'tremor'
  ): ChartData => {
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
    
    return {
      id: `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      data,
      config: {
        xAxis,
        yAxis,
        colors,
        library,
        interactive: true,
        editable: true
      },
      insights: [],
      lastModified: new Date()
    };
  },

  getRecommendedLibrary: (type: ChartData['type']): 'recharts' | 'tremor' | 'echarts' => {
    switch (type) {
      case 'heatmap':
      case 'funnel':
        return 'echarts';
      case 'donut':
        return 'tremor';
      default:
        return 'recharts';
    }
  }
};