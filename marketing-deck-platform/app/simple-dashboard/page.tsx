'use client'
import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Plus, FileText, BarChart3, Brain } from 'lucide-react'
import DataUploadModal from '../../components/upload/DataUploadModal'
import { DashboardClient } from '../../components/dashboard/DashboardClient'

export default function SimpleDashboard() {
  const presentations = [
    { id: 1, title: 'Q4 Sales Report', updated: '2 days ago' },
    { id: 2, title: 'Marketing Analysis', updated: '1 week ago' }
  ]
  
  const user = {
    name: 'Demo User',
    company: 'Demo Company',
    logo: null
  }

  return <DashboardClient />
}