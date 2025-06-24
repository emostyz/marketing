'use client'

import React, { useState } from 'react'
import { Calendar, TrendingUp, ArrowLeft, ArrowRight, Clock, BarChart3, Zap, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface TimeFrameData {
  start: string;
  end: string;
  dataFrequency: string;
  comparisons: string[];
  focusPeriods: string[];
  analysisType: string;
  granularity: string;
}

interface TimePeriodAnalysisStepProps {
  timeFrameData: TimeFrameData;
  setTimeFrameData: (data: TimeFrameData) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const comparisonTypes = [
  { 
    id: 'qq', 
    label: 'Quarter over Quarter (Q/Q)', 
    description: 'Compare performance between quarters',
    example: 'Q4 2024 vs Q3 2024',
    icon: <BarChart3 className="w-4 h-4" />
  },
  { 
    id: 'mm', 
    label: 'Month over Month (M/M)', 
    description: 'Track monthly changes and trends',
    example: 'December vs November',
    icon: <Calendar className="w-4 h-4" />
  },
  { 
    id: 'yy', 
    label: 'Year over Year (Y/Y)', 
    description: 'Compare same periods across years',
    example: 'Q4 2024 vs Q4 2023',
    icon: <TrendingUp className="w-4 h-4" />
  },
  { 
    id: 'ww', 
    label: 'Week over Week (W/W)', 
    description: 'Track short-term performance changes',
    example: 'Week 50 vs Week 49',
    icon: <Clock className="w-4 h-4" />
  }
];

const analysisTypes = [
  { id: 'trend', label: 'Trend Analysis', description: 'Track patterns over time', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'comparison', label: 'Comparative Analysis', description: 'Compare different periods', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'seasonal', label: 'Seasonal Analysis', description: 'Identify seasonal patterns', icon: <Calendar className="w-4 h-4" /> },
  { id: 'cohort', label: 'Cohort Analysis', description: 'Track groups over time', icon: <Target className="w-4 h-4" /> }
];

const granularityOptions = [
  { id: 'daily', label: 'Daily', description: 'Day-by-day analysis' },
  { id: 'weekly', label: 'Weekly', description: 'Week-by-week analysis' },
  { id: 'monthly', label: 'Monthly', description: 'Month-by-month analysis' },
  { id: 'quarterly', label: 'Quarterly', description: 'Quarter-by-quarter analysis' },
  { id: 'yearly', label: 'Yearly', description: 'Year-by-year analysis' }
];

export function TimePeriodAnalysisStep({ 
  timeFrameData, 
  setTimeFrameData, 
  nextStep, 
  prevStep 
}: TimePeriodAnalysisStepProps) {
  const [selectedComparisons, setSelectedComparisons] = useState<string[]>(
    timeFrameData.comparisons || []
  );
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(
    timeFrameData.analysisType || 'trend'
  );
  const [selectedGranularity, setSelectedGranularity] = useState(
    timeFrameData.granularity || 'monthly'
  );
  const [startDate, setStartDate] = useState(timeFrameData.start || '');
  const [endDate, setEndDate] = useState(timeFrameData.end || '');

  const handleComparisonToggle = (comparisonId: string) => {
    const updated = selectedComparisons.includes(comparisonId)
      ? selectedComparisons.filter(id => id !== comparisonId)
      : [...selectedComparisons, comparisonId];
    
    setSelectedComparisons(updated);
    updateTimeFrameData({ comparisons: updated });
  };

  const updateTimeFrameData = (updates: Partial<TimeFrameData>) => {
    const updatedData = {
      ...timeFrameData,
      ...updates,
      comparisons: selectedComparisons,
      analysisType: selectedAnalysisType,
      granularity: selectedGranularity,
      start: startDate,
      end: endDate
    };
    setTimeFrameData(updatedData);
  };

  const validateAndContinue = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    if (selectedComparisons.length === 0) {
      alert('Please select at least one comparison type (Q/Q, M/M, Y/Y, or W/W)');
      return;
    }

    // Final update before proceeding
    updateTimeFrameData({
      start: startDate,
      end: endDate,
      comparisons: selectedComparisons,
      analysisType: selectedAnalysisType,
      granularity: selectedGranularity
    });

    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Time Period Analysis</h2>
        <p className="text-gray-400 text-lg">Define how you want to analyze your data over time</p>
      </div>

      {/* Date Range Selection */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-3 text-blue-400" />
          Data Time Range
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Comparison Types Selection */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-3 text-blue-400" />
          Time Period Comparisons
        </h3>
        <p className="text-gray-400 mb-6">Select the time period comparisons you want to include (you can choose multiple)</p>
        <div className="grid md:grid-cols-2 gap-4">
          {comparisonTypes.map((comparison) => (
            <div
              key={comparison.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedComparisons.includes(comparison.id)
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
              onClick={() => handleComparisonToggle(comparison.id)}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedComparisons.includes(comparison.id) ? 'bg-blue-600' : 'bg-gray-700'
                }`}>
                  {comparison.icon}
                </div>
                <div>
                  <h4 className="font-medium text-white">{comparison.label}</h4>
                  <p className="text-sm text-gray-400">{comparison.description}</p>
                  <p className="text-xs text-blue-400 mt-1">Example: {comparison.example}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Analysis Type Selection */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-3 text-blue-400" />
          Analysis Type
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {analysisTypes.map((type) => (
            <div
              key={type.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedAnalysisType === type.id
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
              onClick={() => {
                setSelectedAnalysisType(type.id);
                updateTimeFrameData({ analysisType: type.id });
              }}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedAnalysisType === type.id ? 'bg-blue-600' : 'bg-gray-700'
                }`}>
                  {type.icon}
                </div>
                <div>
                  <h4 className="font-medium text-white">{type.label}</h4>
                  <p className="text-sm text-gray-400">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Granularity Selection */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-3 text-blue-400" />
          Data Granularity
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {granularityOptions.map((option) => (
            <button
              key={option.id}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                selectedGranularity === option.id
                  ? 'border-blue-500 bg-blue-950/30 text-blue-300'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600 text-gray-300'
              }`}
              onClick={() => {
                setSelectedGranularity(option.id);
                updateTimeFrameData({ granularity: option.id });
              }}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-400 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Summary */}
      {selectedComparisons.length > 0 && (
        <Card className="p-6 bg-gray-900 border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-3">Analysis Summary</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">
              <span className="text-blue-400">Period:</span> {startDate || 'Not set'} to {endDate || 'Not set'}
            </p>
            <p className="text-gray-300">
              <span className="text-blue-400">Comparisons:</span> {selectedComparisons.map(id => 
                comparisonTypes.find(c => c.id === id)?.label
              ).join(', ')}
            </p>
            <p className="text-gray-300">
              <span className="text-blue-400">Analysis Type:</span> {analysisTypes.find(t => t.id === selectedAnalysisType)?.label}
            </p>
            <p className="text-gray-300">
              <span className="text-blue-400">Granularity:</span> {granularityOptions.find(g => g.id === selectedGranularity)?.label}
            </p>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button onClick={prevStep} variant="outline" size="lg" className="flex items-center">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button onClick={validateAndContinue} size="lg" className="bg-blue-600 hover:bg-blue-700">
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};