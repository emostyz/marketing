'use client'
import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Plus, FileText, BarChart3, Brain } from 'lucide-react'
import DataUploadModal from '../../components/upload/DataUploadModal'
import { DashboardClient } from '../../components/dashboard/DashboardClient'

export default function SimpleDashboard() {
  const presentations = [
    { 
      id: '1', 
      userId: 'demo-user-1',
      title: 'Q4 Sales Report', 
      description: 'Quarterly sales analysis and performance metrics',
      slides: [],
      status: 'completed' as const,
      dataSources: [],
      narrativeConfig: {
        tone: 'professional',
        audience: 'executives',
        keyMessages: []
      },
      aiFeedback: {
        suggestions: [],
        improvements: [],
        confidence: 0.8
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastEditedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    { 
      id: '2', 
      userId: 'demo-user-1',
      title: 'Marketing Analysis', 
      description: 'Marketing campaign performance and ROI analysis',
      slides: [],
      status: 'draft' as const,
      dataSources: [],
      narrativeConfig: {
        tone: 'professional',
        audience: 'marketing_team',
        keyMessages: []
      },
      aiFeedback: {
        suggestions: [],
        improvements: [],
        confidence: 0.6
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastEditedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ]
  
  const user = {
    name: 'Demo User',
    company: 'Demo Company',
    logo: null
  }

  return <DashboardClient user={user} drafts={presentations} />
}