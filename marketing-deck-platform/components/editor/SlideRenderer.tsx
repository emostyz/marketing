'use client'
import React, { useState } from 'react'
import { Card } from '../ui/Card'
import EditableChart from './EditableChart'
import EditableTable from './EditableTable'

// Dynamically require chart components to avoid build errors if not installed
let Bar: React.ComponentType<any> | undefined, Line: React.ComponentType<any> | undefined, Pie: React.ComponentType<any> | undefined, Doughnut: React.ComponentType<any> | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ Bar, Line, Pie, Doughnut } = require('react-chartjs-2'));
} catch {}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

// Helper to auto-detect chart type
function suggestChartType(data: Record<string, unknown>[]): 'bar' | 'line' | 'pie' | 'doughnut' {
  if (!data || data.length === 0) return 'bar'
  const keys = Object.keys(data[0] || {})
  if (keys.length === 2 && typeof data[0][keys[1]] === 'number') return 'line'
  if (keys.length === 2 && typeof data[0][keys[1]] === 'string') return 'pie'
  if (keys.length > 2) return 'bar'
  return 'bar'
}

// Helper to format data for chart.js
function formatChartData(data: Record<string, unknown>[], chartType: string) {
  const keys = Object.keys(data[0] || {})
  if (chartType === 'pie' || chartType === 'doughnut') {
    return {
      labels: data.map((row) => String(row[keys[0]])),
      datasets: [
        {
          data: data.map((row) => Number(row[keys[1]])),
          backgroundColor: [
            '#3B82F6', '#8B5CF6', '#10B981', '#A855F7', '#0EA5E9', '#F59E42', '#F43F5E',
          ],
        },
      ],
    }
  }
  // Default: bar/line
  return {
    labels: data.map((row) => String(row[keys[0]])),
    datasets: [
      {
        label: keys[1],
        data: data.map((row) => Number(row[keys[1]])),
        backgroundColor: '#3B82F6',
        borderColor: '#8B5CF6',
        borderWidth: 2,
      },
    ],
  }
}

interface SlideRendererProps {
  slide: { title?: string; chartType?: string; table?: boolean; avgRating?: number };
  data: Record<string, unknown>[];
  onChange?: (newData: any) => void;
  onRate?: (score: number, comment: string) => void;
}

export default function SlideRenderer({ slide, data, onChange, onRate }: SlideRendererProps) {
  if (!slide || !data || data.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center h-64 text-blue-200">
        No data available for this slide.
      </Card>
    );
  }

  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // At the bottom of the slide, add a rating UI if onRate is provided
  const renderRating = () => (
    <div className="mt-6 bg-[#181A20] rounded-xl p-4">
      <div className="text-blue-200 mb-2">Rate this slide:</div>
      <div className="flex gap-1 mb-2">
        {[1,2,3,4,5].map((n: number) => (
          <button key={n} onClick={() => setScore(n)} className={`text-2xl ${score && n <= score ? 'text-yellow-400' : 'text-blue-700'}`}>★</button>
        ))}
      </div>
      <textarea
        className="w-full rounded bg-[#23242b] text-white p-2 mb-2"
        placeholder="Optional comment..."
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => { if (onRate && score) { onRate(score, comment); setSubmitted(true); }}}
        disabled={!score || submitted}
      >{submitted ? 'Submitted' : 'Submit Rating'}</button>
      {slide.avgRating !== undefined && <div className="text-xs text-blue-400 mt-2">Avg. rating: {slide.avgRating.toFixed(2)} / 5</div>}
    </div>
  )

  // If slide.table is true, render EditableTable, else EditableChart
  if (slide.table) {
    return (
      <Card className="p-6 bg-gradient-to-br from-[#0A0A0B] via-[#3B82F6]/10 to-[#8B5CF6]/10 border border-white/20 rounded-2xl shadow-[0_0_40px_#3B82F6]">
        <div className="mb-4 font-grotesk text-xl text-white">{slide.title || 'Table'}</div>
        <EditableTable data={data} onChange={onChange} />
        {onRate && renderRating()}
      </Card>
    )
  }
  return (
    <Card className="p-6 bg-gradient-to-br from-[#0A0A0B] via-[#3B82F6]/10 to-[#8B5CF6]/10 border border-white/20 rounded-2xl shadow-[0_0_40px_#3B82F6]">
      <div className="mb-4 font-grotesk text-xl text-white">{slide.title || 'Chart'}</div>
      <EditableChart data={data} type={slide.chartType || 'bar'} onChange={onChange} />
      {onRate && renderRating()}
    </Card>
  );
}