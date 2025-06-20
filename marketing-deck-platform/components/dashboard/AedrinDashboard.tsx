'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  SparklesIcon,
  CloudArrowUpIcon,
  CogIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface DashboardData {
  presentations: number;
  insights: number;
  charts: number;
  totalDataPoints: number;
  recentActivity: Array<{
    name: string;
    value: number;
    change: number;
  }>;
  chartPerformance: Array<{
    name: string;
    Engagement: number;
    Clarity: number;
  }>;
}

export function AedrinDashboard() {
  const [data, setData] = useState<DashboardData>({
    presentations: 24,
    insights: 142,
    charts: 89,
    totalDataPoints: 15420,
    recentActivity: [
      { name: 'Jan', value: 12, change: 15 },
      { name: 'Feb', value: 18, change: 50 },
      { name: 'Mar', value: 25, change: 39 },
      { name: 'Apr', value: 32, change: 28 },
      { name: 'May', value: 28, change: -12 },
      { name: 'Jun', value: 35, change: 25 }
    ],
    chartPerformance: [
      { name: 'Line Charts', Engagement: 92, Clarity: 88 },
      { name: 'Bar Charts', Engagement: 87, Clarity: 94 },
      { name: 'Pie Charts', Engagement: 78, Clarity: 85 },
      { name: 'Scatter Plots', Engagement: 82, Clarity: 79 },
      { name: 'Area Charts', Engagement: 85, Clarity: 82 }
    ]
  });

  const [showUploadZone, setShowUploadZone] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <motion.header 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AEDRIN Dashboard</h1>
            <p className="text-slate-400 text-lg">Transform data into stunning presentations</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="text-slate-300 border-slate-600 hover:bg-slate-800"
              onClick={() => setShowUploadZone(true)}
            >
              <CloudArrowUpIcon className="w-5 h-5 mr-2" />
              Upload Data
            </Button>
            <Button 
              variant="default" 
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              New Presentation
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Key Metrics */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-400">Presentations</p>
                <p className="text-white text-3xl font-bold">{data.presentations}</p>
                <p className="text-emerald-400 text-sm mt-1">↗ 12% from last month</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-400">AI Insights Generated</p>
                <p className="text-white text-3xl font-bold">{data.insights}</p>
                <p className="text-emerald-400 text-sm mt-1">↗ 28% from last month</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-400">Charts Created</p>
                <p className="text-white text-3xl font-bold">{data.charts}</p>
                <p className="text-emerald-400 text-sm mt-1">↗ 15% from last month</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-400">Data Points Analyzed</p>
                <p className="text-white text-3xl font-bold">{data.totalDataPoints.toLocaleString()}</p>
                <p className="text-emerald-400 text-sm mt-1">↗ 42% from last month</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-cyan-500" />
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-slate-900 border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Presentation Activity</h3>
            <div className="h-72 flex items-center justify-center bg-slate-800 rounded-lg">
              <p className="text-slate-400">Chart will be rendered here</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-slate-900 border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Chart Performance</h3>
            <div className="h-72 flex items-center justify-center bg-slate-800 rounded-lg">
              <p className="text-slate-400">Chart will be rendered here</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Upload Zone */}
      {showUploadZone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <UploadZone onClose={() => setShowUploadZone(false)} />
        </motion.div>
      )}

      {/* Recent Presentations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Presentations</h3>
          <div className="space-y-3">
            {[
              { name: 'Q4 Sales Performance', date: '2 hours ago', status: 'Draft' },
              { name: 'Marketing ROI Analysis', date: '1 day ago', status: 'Published' },
              { name: 'Customer Segmentation', date: '3 days ago', status: 'Published' },
              { name: 'Product Launch Metrics', date: '1 week ago', status: 'Archived' }
            ].map((presentation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">{presentation.name}</p>
                  <p className="text-slate-400 text-sm">{presentation.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    presentation.status === 'Draft' ? 'bg-yellow-500/20 text-yellow-400' :
                    presentation.status === 'Published' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {presentation.status}
                  </span>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <CogIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// Upload Zone Component
function UploadZone({ onClose }: { onClose: () => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setTimeout(onClose, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // TODO: Replace with actual upload logic
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Analysis result:', result);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800 mb-8 p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Upload Your Data</h3>
        <Button variant="ghost" onClick={onClose} className="text-slate-400">
          ×
        </Button>
      </div>

      {uploading ? (
        <div className="text-center py-12">
          <SparklesIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
          <p className="text-white mb-4">Analyzing your data with AI...</p>
          <div className="max-w-md mx-auto bg-slate-700 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-slate-400 text-sm mt-2">{progress}% complete</p>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragOver 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : 'border-slate-600 bg-slate-800/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <CloudArrowUpIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-white mb-2">
            Drop your data files here
          </h4>
          <p className="text-slate-400 mb-6">
            Supports CSV, Excel (.xlsx), and JSON files up to 10MB
          </p>
          
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700">
              Choose File
            </Button>
          </label>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-slate-800 rounded-lg">
          <ChartBarIcon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-white font-medium">Instant Analysis</p>
          <p className="text-slate-400 text-sm">Get insights in seconds</p>
        </div>
        <div className="text-center p-4 bg-slate-800 rounded-lg">
          <SparklesIcon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
          <p className="text-white font-medium">AI-Powered</p>
          <p className="text-slate-400 text-sm">Smart visualizations</p>
        </div>
        <div className="text-center p-4 bg-slate-800 rounded-lg">
          <DocumentTextIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-white font-medium">Export Ready</p>
          <p className="text-slate-400 text-sm">PowerPoint & Google Slides</p>
        </div>
      </div>
    </Card>
  );
}