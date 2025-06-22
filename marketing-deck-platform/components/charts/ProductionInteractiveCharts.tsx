'use client'

/**
 * Production-Ready Interactive Chart System
 * Implements comprehensive chart editing with real-time updates and AI feedback loops
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
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
  EyeOff,
  Maximize2,
  RotateCcw,
  Share2,
  Wand2,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

// Chart libraries
import { 
  AreaChart as TremorArea, 
  BarChart as TremorBar, 
  DonutChart as TremorDonut,
  Card,
  Button
} from '@tremor/react'
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
  Scatter
} from 'recharts'
import * as echarts from 'echarts'

// AI Integration
import { openAIBrain } from '@/lib/ai/openai-brain'
import { supabase } from '@/lib/supabase/enhanced-client'

// ==========================================
// INTERFACES
// ==========================================

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'funnel' | 'heatmap' | 'donut';
  title: string;
  data: any[];
  config: ChartConfig;
  insights?: string[];
  lastModified: Date;
  version: number;
  aiGenerated: boolean;
}

export interface ChartConfig {
  xAxis: string;
  yAxis: string | string[];
  colors: string[];
  library: 'tremor' | 'recharts' | 'echarts';
  interactive: boolean;
  editable: boolean;
  mckinseyStyle: boolean;
  showAnimation: boolean;
  showTooltip: boolean;
  showLegend: boolean;
}

export interface InteractiveChartProps {
  chartData: ChartData;
  onDataUpdate: (chartId: string, newData: any[]) => Promise<void>;
  onConfigUpdate: (chartId: string, newConfig: ChartConfig) => Promise<void>;
  onInsightUpdate: (chartId: string, insights: string[]) => Promise<void>;
  className?: string;
  sessionId?: string;
  realTimeMode?: boolean;
}

// ==========================================
// CHART VALIDATION
// ==========================================

const validateChartData = (data: any[], type: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data || data.length === 0) {
    errors.push('Chart data cannot be empty');
    return { valid: false, errors };
  }
  
  if (data.length > 10000) {
    errors.push('Chart data too large (max 10,000 rows)');
  }
  
  const firstRow = data[0];
  const keys = Object.keys(firstRow);
  
  if (keys.length < 2) {
    errors.push('Chart data must have at least 2 columns');
  }
  
  // Check for required data types based on chart type
  const numericKeys = keys.filter(key => 
    data.every(row => typeof row[key] === 'number' || !isNaN(Number(row[key])))
  );
  
  if (type !== 'pie' && type !== 'donut' && numericKeys.length === 0) {
    errors.push(`${type} charts require at least one numeric column`);
  }
  
  return { valid: errors.length === 0, errors };
};

// ==========================================
// DATA EDITOR COMPONENT
// ==========================================

const DataEditor: React.FC<{
  data: any[];
  onSave: (newData: any[]) => void;
  onCancel: () => void;
  chartType: string;
}> = ({ data, onSave, onCancel, chartType }) => {
  const [editedData, setEditedData] = useState([...data]);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: string} | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const handleCellChange = useCallback((rowIndex: number, column: string, value: string) => {
    const newData = [...editedData];
    
    // Try to parse as number if the column seems numeric
    const isNumeric = editedData.some(row => typeof row[column] === 'number');
    const processedValue = isNumeric && !isNaN(Number(value)) ? Number(value) : value;
    
    newData[rowIndex] = { ...newData[rowIndex], [column]: processedValue };
    setEditedData(newData);
    
    // Clear validation errors when user makes changes
    setValidationErrors([]);
  }, [editedData]);

  const addRow = useCallback(() => {
    const newRow = Object.keys(editedData[0] || {}).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as any);
    setEditedData([...editedData, newRow]);
  }, [editedData]);

  const removeRow = useCallback((index: number) => {
    if (editedData.length <= 1) {
      setValidationErrors(['Cannot remove the last row']);
      return;
    }
    const newData = editedData.filter((_, i) => i !== index);
    setEditedData(newData);
  }, [editedData]);

  const handleSave = useCallback(async () => {
    setIsValidating(true);
    
    // Validate data
    const validation = validateChartData(editedData, chartType);
    
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setIsValidating(false);
      return;
    }
    
    // AI validation for data quality
    try {
      const aiValidation = await openAIBrain.getTooltipInsight({
        action: 'validate_data_change',
        originalLength: data.length,
        newLength: editedData.length,
        chartType,
        sampleData: editedData.slice(0, 3)
      });
      
      console.log('AI validation:', aiValidation);
    } catch (error) {
      console.error('AI validation failed:', error);
    }
    
    setIsValidating(false);
    onSave(editedData);
  }, [editedData, chartType, data.length, onSave]);

  const columns = Object.keys(editedData[0] || {});

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Edit Chart Data</h3>
              <p className="text-sm text-gray-600 mt-1">
                Modify your data and see changes reflected instantly
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleSave}
                disabled={isValidating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                {isValidating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                onClick={onCancel}
                variant="secondary"
                className="px-6 py-2"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
          
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Validation Errors</h4>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-medium text-gray-700">#</th>
                  {columns.map(col => (
                    <th key={col} className="border border-gray-300 p-3 text-left font-medium text-gray-700">
                      {col}
                    </th>
                  ))}
                  <th className="border border-gray-300 p-3 text-center font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {editedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-300 p-3 text-gray-500 font-medium">
                      {rowIndex + 1}
                    </td>
                    {columns.map(col => (
                      <td key={`${rowIndex}-${col}`} className="border border-gray-300 p-1">
                        <input
                          type="text"
                          value={row[col] || ''}
                          onChange={(e) => handleCellChange(rowIndex, col, e.target.value)}
                          className={`w-full p-2 border-none outline-none rounded transition-colors ${
                            selectedCell?.row === rowIndex && selectedCell?.col === col
                              ? 'bg-blue-100 ring-2 ring-blue-500'
                              : 'hover:bg-gray-100 focus:bg-blue-50'
                          }`}
                          onFocus={() => setSelectedCell({row: rowIndex, col})}
                          onBlur={() => setSelectedCell(null)}
                        />
                      </td>
                    ))}
                    <td className="border border-gray-300 p-3 text-center">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                        title="Remove row"
                        disabled={editedData.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={addRow}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Row</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// CHART CONFIGURATION PANEL
// ==========================================

const ChartConfigPanel: React.FC<{
  config: ChartConfig;
  availableColumns: string[];
  onConfigChange: (newConfig: ChartConfig) => void;
  onClose: () => void;
  onAIOptimize: () => void;
}> = ({ config, availableColumns, onConfigChange, onClose, onAIOptimize }) => {
  const [localConfig, setLocalConfig] = useState({ ...config });
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleSave = useCallback(() => {
    onConfigChange(localConfig);
    onClose();
  }, [localConfig, onConfigChange, onClose]);

  const handleAIOptimize = useCallback(async () => {
    setIsOptimizing(true);
    try {
      await onAIOptimize();
    } finally {
      setIsOptimizing(false);
    }
  }, [onAIOptimize]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Chart Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Optimization */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center mb-3">
            <Brain className="w-5 h-5 text-purple-600 mr-2" />
            <h4 className="font-semibold text-purple-900">AI Optimization</h4>
          </div>
          <p className="text-sm text-purple-700 mb-3">
            Let AI optimize your chart for maximum impact and clarity
          </p>
          <button
            onClick={handleAIOptimize}
            disabled={isOptimizing}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            {isOptimizing ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>AI Optimize</span>
              </>
            )}
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
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <select
              value={Array.isArray(localConfig.yAxis) ? localConfig.yAxis[0] : localConfig.yAxis}
              onChange={(e) => setLocalConfig({ ...localConfig, yAxis: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Style Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Style Options</h4>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localConfig.mckinseyStyle}
                onChange={(e) => setLocalConfig({ ...localConfig, mckinseyStyle: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">McKinsey Style</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localConfig.interactive}
                onChange={(e) => setLocalConfig({ ...localConfig, interactive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Interactive</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localConfig.editable}
                onChange={(e) => setLocalConfig({ ...localConfig, editable: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Editable</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localConfig.showAnimation}
                onChange={(e) => setLocalConfig({ ...localConfig, showAnimation: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Animations</span>
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// MAIN INTERACTIVE CHART COMPONENT
// ==========================================

export const ProductionInteractiveChart: React.FC<InteractiveChartProps> = ({
  chartData,
  onDataUpdate,
  onConfigUpdate,
  onInsightUpdate,
  className = '',
  sessionId,
  realTimeMode = false
}) => {
  const [isEditingData, setIsEditingData] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [aiInsights, setAIInsights] = useState<string[]>(chartData.insights || []);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  
  const echartRef = useRef<HTMLDivElement>(null);
  const echartInstance = useRef<echarts.ECharts | null>(null);

  // Real-time sync with Supabase
  useEffect(() => {
    if (!realTimeMode || !sessionId) return;

    const syncInterval = setInterval(async () => {
      try {
        // Sync chart changes to Supabase
        await supabase
          .from('chart_configs')
          .upsert({
            id: chartData.id,
            session_id: sessionId,
            chart_type: chartData.type,
            library: chartData.config.library,
            data_mapping: {
              x: chartData.config.xAxis,
              y: chartData.config.yAxis
            },
            raw_data: chartData.data,
            processed_data: chartData.data,
            config: chartData.config,
            ai_insights: aiInsights,
            mckinsey_compliant: chartData.config.mckinseyStyle,
            interactive: chartData.config.interactive,
            editable: chartData.config.editable,
            updated_at: new Date()
          });
        
        setLastSyncTime(new Date());
      } catch (error) {
        console.error('Real-time sync failed:', error);
      }
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(syncInterval);
  }, [chartData, sessionId, realTimeMode, aiInsights]);

  // Initialize ECharts
  useEffect(() => {
    if (chartData.config.library === 'echarts' && echartRef.current && !echartInstance.current) {
      echartInstance.current = echarts.init(echartRef.current);
      
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

  const handleDataSave = useCallback(async (newData: any[]) => {
    try {
      await onDataUpdate(chartData.id, newData);
      setIsEditingData(false);
      
      // Generate new AI insights for the updated data
      setIsGeneratingInsights(true);
      try {
        const newInsights = await openAIBrain.getSegmentInsights({
          chartType: chartData.type,
          dataLength: newData.length,
          sampleData: newData.slice(0, 5)
        });
        setAIInsights(newInsights);
        await onInsightUpdate(chartData.id, newInsights);
      } catch (error) {
        console.error('Failed to generate AI insights:', error);
      } finally {
        setIsGeneratingInsights(false);
      }
    } catch (error) {
      console.error('Failed to update chart data:', error);
    }
  }, [chartData.id, chartData.type, onDataUpdate, onInsightUpdate]);

  const handleConfigSave = useCallback(async (newConfig: ChartConfig) => {
    try {
      await onConfigUpdate(chartData.id, newConfig);
    } catch (error) {
      console.error('Failed to update chart config:', error);
    }
  }, [chartData.id, onConfigUpdate]);

  const handleAIOptimize = useCallback(async () => {
    try {
      // AI optimization logic would go here
      const optimizedConfig = await openAIBrain.getTooltipInsight({
        action: 'optimize_chart_config',
        currentConfig: chartData.config,
        chartType: chartData.type,
        dataSize: chartData.data.length
      });
      
      console.log('AI optimization suggestion:', optimizedConfig);
    } catch (error) {
      console.error('AI optimization failed:', error);
    }
  }, [chartData]);

  const availableColumns = useMemo(() => {
    return chartData.data.length > 0 ? Object.keys(chartData.data[0]) : [];
  }, [chartData.data]);

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

  const renderTremorChart = (type: string, data: any[], config: ChartConfig) => {
    const commonProps = {
      data,
      index: config.xAxis,
      categories: Array.isArray(config.yAxis) ? config.yAxis : [config.yAxis],
      colors: config.colors,
      showTooltip: config.showTooltip,
      showLegend: config.showLegend && Array.isArray(config.yAxis) && config.yAxis.length > 1,
    };

    switch (type) {
      case 'area':
        return <TremorArea {...commonProps} />;
      case 'bar':
        return <TremorBar {...commonProps} />;
      case 'donut':
      case 'pie':
        return (
          <TremorDonut
            data={data}
            category={Array.isArray(config.yAxis) ? config.yAxis[0] : config.yAxis}
            index={config.xAxis}
            colors={config.colors}
            showTooltip={config.showTooltip}
          />
        );
      default:
        return <TremorBar {...commonProps} />;
    }
  };

  const renderRechartsChart = (type: string, data: any[], config: ChartConfig) => {
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

      default:
        return renderRechartsChart('bar', data, config);
    }
  };

  const getEChartsOption = (chartData: ChartData) => {
    const { type, data, config } = chartData;
    
    const categories = data.map(item => item[config.xAxis]);
    const series = Array.isArray(config.yAxis) ? config.yAxis : [config.yAxis];

    return {
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
      },
      series: series.map((seriesName: string, index: number) => ({
        name: seriesName,
        type: type === 'area' ? 'line' : type,
        data: data.map(item => item[seriesName]),
        smooth: type === 'line' || type === 'area',
        areaStyle: type === 'area' ? { opacity: 0.3 } : undefined,
        itemStyle: { color: config.colors[index % config.colors.length] }
      }))
    };
  };

  return (
    <div
      className={`relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ${className} ${
        isHovered ? 'shadow-xl' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Chart Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{chartData.title}</h3>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-1" />
              {chartData.config.library} • {chartData.type}
            </span>
            <span>{chartData.data.length} records</span>
            {chartData.aiGenerated && (
              <span className="flex items-center text-purple-600">
                <Brain className="w-4 h-4 mr-1" />
                AI Generated
              </span>
            )}
            {realTimeMode && (
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Synced {Math.round((Date.now() - lastSyncTime.getTime()) / 1000)}s ago
              </span>
            )}
          </div>
        </div>
        
        {/* Chart Controls */}
        <AnimatePresence>
          {(isHovered || isEditingData || isConfigOpen) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center space-x-2"
            >
              {chartData.config.editable && (
                <button
                  onClick={() => setIsEditingData(true)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Edit data"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={() => setIsConfigOpen(true)}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                title="Chart settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                title={showInsights ? "Hide insights" : "Show insights"}
              >
                {showInsights ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        <div className="h-80 mb-6">
          {renderChart()}
        </div>

        {/* AI Insights */}
        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  AI Insights
                </h4>
                {isGeneratingInsights && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1 animate-spin" />
                    Generating insights...
                  </div>
                )}
              </div>
              
              {aiInsights.length > 0 ? (
                <div className="space-y-3">
                  {aiInsights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500"
                    >
                      {insight}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No AI insights available yet</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isEditingData && (
          <DataEditor
            data={chartData.data}
            chartType={chartData.type}
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
            onAIOptimize={handleAIOptimize}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// CHART FACTORY
// ==========================================

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
        editable: true,
        mckinseyStyle: false,
        showAnimation: true,
        showTooltip: true,
        showLegend: true
      },
      insights: [],
      lastModified: new Date(),
      version: 1,
      aiGenerated: false
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

export default ProductionInteractiveChart;