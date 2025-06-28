'use client'
import React, { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, FileSpreadsheet, Database, Check } from 'lucide-react'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import Modal from '../ui/Modal'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import Skeleton from '../ui/Skeleton'
import Toast from '../ui/Toast'
import EnhancedProgressTracker from '../ui/enhanced-progress-tracker'
import LoadingButton from '../ui/loading-button'
import { parseCSV } from '../../lib/data/parser'
import { validateData } from '../../lib/data/validator'
import { motion, AnimatePresence } from 'framer-motion'
import TemplateSelectModal from './TemplateSelectModal'

interface DataUploadModalProps {
  open: boolean
  onClose: () => void
  onContinue: (data: any) => void
}

interface Questionnaire {
  description: string
  keyVariables: string
  context: string
  goal: string
  keyPoint: string
}

export default function DataUploadModal({ open, onClose, onContinue }: DataUploadModalProps) {
  const [step, setStep] = useState(1)
  const [uploadedData, setUploadedData] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [processing, setProcessing] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>({
    description: 'Data Analysis Presentation',
    keyVariables: 'Key metrics and trends',
    context: 'Business performance analysis',
    goal: 'Identify insights and opportunities',
    keyPoint: 'Data-driven recommendations',
  })
  const [data, setData] = useState<Record<string, unknown>[] | null>(null)
  const [inScope, setInScope] = useState<boolean | null>(null)
  const [reason, setReason] = useState<string | null>(null)
  const [presentationName, setPresentationName] = useState('My Presentation')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [brandLogo, setBrandLogo] = useState<string | null>(null)
  const [brandColor, setBrandColor] = useState<string>('#2563eb')
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [skeletonDeck, setSkeletonDeck] = useState<File | null>(null)
  const [referenceSlides, setReferenceSlides] = useState<File[]>([])
  const [fontFamily, setFontFamily] = useState('Inter')
  const [fontSize, setFontSize] = useState(18)
  const [colorScheme, setColorScheme] = useState('#2563eb')
  const [uploadSessionId, setUploadSessionId] = useState<string | null>(null)

  // Prefill questionnaire based on uploaded data
  useEffect(() => {
    if (uploadedData && uploadedData.headers) {
      const headers = uploadedData.headers.join(', ')
      setQuestionnaire(q => ({
        ...q,
        description: q.description || `Analysis of ${uploadedData.fileName || 'uploaded data'} with columns: ${headers}`,
        keyVariables: q.keyVariables || uploadedData.headers.slice(0, 3).join(', '),
        context: q.context || `Business context for ${uploadedData.fileName || 'this dataset'}`,
        goal: q.goal || `Identify trends and insights in ${uploadedData.fileName || 'the data'}`,
        keyPoint: q.keyPoint || `Key findings from ${uploadedData.fileName || 'the analysis'}`
      }))
    }
  }, [uploadedData])

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    
    setProcessing(true)
    setLoading(true)
    
    try {
      // Create progress session
      const progressResponse = await fetch('/api/ai/data-intake/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })
      })
      
      if (!progressResponse.ok) {
        throw new Error('Failed to start upload process')
      }
      
      const { sessionId } = await progressResponse.json()
      
      // Process file with progress updates
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        // Update progress
        await fetch(`/api/ai/progress/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            status: 'processing',
            stage: 'data_intake',
            progress: 75,
            data: { rowsProcessed: jsonData.length }
          })
        })
        
        setData(jsonData as Record<string, unknown>[])
        setUploadedData({
          fileName: file.name,
          type: 'excel',
          data: jsonData,
          headers: Object.keys(jsonData[0] || {}),
          rowCount: jsonData.length,
          sessionId
        })
        setUploadSessionId(sessionId)
      } else if (file.name.endsWith('.csv')) {
        const parsed = await parseCSV(file)
        
        // Update progress
        await fetch(`/api/ai/progress/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            status: 'processing',
            stage: 'data_intake',
            progress: 75,
            data: { rowsProcessed: parsed.length }
          })
        })
        
        setData(parsed)
        setUploadedData({
          fileName: file.name,
          type: 'csv',
          data: parsed,
          headers: Object.keys(parsed[0] || {}),
          rowCount: parsed.length,
          sessionId
        })
        setUploadSessionId(sessionId)
      }
      
      // Mark as completed
      await fetch(`/api/ai/progress/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'completed',
          stage: 'data_intake',
          progress: 100
        })
      })
      
      setStep(2)
      setToast('File processed successfully!')
      
    } catch (error) {
      setError('Error processing file. Please upload a valid CSV or Excel file.')
    } finally {
      setProcessing(false)
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    } as any,
    multiple: false,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {},
  })

  const handleQuestionnaireChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setQuestionnaire({ ...questionnaire, [e.target.name]: e.target.value })
  }

  const handleValidate = () => {
    if (!data) return
    const result = validateData(data, questionnaire)
    setInScope(result.inScope)
    setReason(result.reason || null)
    if (!result.inScope) {
      setToast(result.reason || 'Data not in scope.')
    }
  }

  const handleContinue = () => {
    // Simplified validation - only require presentation name and data
    if (!presentationName.trim()) {
      setToast('Please enter a presentation name.')
      return
    }
    if (!data || data.length === 0) {
      setToast('Please upload data first.')
      return
    }
    onContinue({
      title: presentationName,
      templateId: selectedTemplate,
      dataSources: [data],
      questionnaire,
      brandLogo,
      brandColor,
      fontFamily,
      fontSize,
      colorScheme
    })
    setToast(null)
    setStep(1)
    setPresentationName('')
    setSelectedTemplate('')
    setData(null)
    setUploadedData(null)
    setQuestionnaire({ description: '', keyVariables: '', context: '', goal: '', keyPoint: '' })
    setSkeletonDeck(null)
    setReferenceSlides([])
    setFontFamily('Inter')
    setFontSize(18)
    setColorScheme('#2563eb')
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setShowTemplateModal(false)
    setStep(2)
  }

  const handleBrandContinue = () => {
    setStep(3)
  }

  return (
    <AnimatePresence>
      {open && (
        <Modal open={open} onClose={onClose}>
          <motion.div
            className="w-full max-w-lg mx-auto rounded-2xl p-8 bg-[#181A20] border border-[#23242b] flex flex-col items-center relative"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-blue-300 hover:text-white bg-[#101014] rounded-full p-2 border border-[#23242b] shadow">
              <X className="w-5 h-5" />
            </button>
            <div className="w-full mb-6">
              <h2 className="text-2xl font-grotesk font-bold text-white mb-2 text-center">Upload Data & Describe Your Project</h2>
              <div className="flex items-center justify-center gap-4 mb-6">
                {[1,2,3,4].map((s, i) => (
                  <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg border-2 ${step === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-[#23242b] text-blue-200 border-[#23242b]'}`}>{s}</div>
                ))}
              </div>
            </div>
            {step === 1 && (
              <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-400 bg-[#23242b]' : 'border-[#23242b] bg-[#101014]'}`}> 
                  <input {...getInputProps()} />
                  <Upload className="mx-auto mb-2 w-8 h-8 text-blue-400" />
                  <p className="text-blue-200 font-semibold">Drag & drop your CSV or Excel file here, or click to select</p>
                  <p className="text-xs text-blue-300 mt-1">Accepted: .csv, .xlsx</p>
                </div>
                
                {/* Progress Tracker */}
                {uploadSessionId && processing && (
                  <div className="mt-6">
                    <EnhancedProgressTracker
                      sessionId={uploadSessionId}
                      onComplete={() => {
                        setProcessing(false)
                        setLoading(false)
                      }}
                      onError={(error) => {
                        setError(error)
                        setProcessing(false)
                        setLoading(false)
                      }}
                      autoStart={true}
                    />
                  </div>
                )}
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Use sample data for demo
                      const sampleData = [
                        { Month: 'Jan', Sales: 45000, Leads: 1200, Conversion: 0.12 },
                        { Month: 'Feb', Sales: 52000, Leads: 1350, Conversion: 0.15 },
                        { Month: 'Mar', Sales: 48000, Leads: 1180, Conversion: 0.14 },
                        { Month: 'Apr', Sales: 61000, Leads: 1500, Conversion: 0.18 },
                        { Month: 'May', Sales: 58000, Leads: 1420, Conversion: 0.16 },
                        { Month: 'Jun', Sales: 67000, Leads: 1650, Conversion: 0.20 }
                      ]
                      setData(sampleData)
                      setUploadedData({
                        fileName: 'sample-sales-data.csv',
                        type: 'csv',
                        data: sampleData,
                        headers: Object.keys(sampleData[0]),
                        rowCount: sampleData.length
                      })
                      setStep(2)
                    }}
                    className="w-full"
                  >
                    📊 Use Sample Sales Data (Demo)
                  </Button>
                </div>
                {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
                <div className="mt-4 text-blue-200 text-xs text-center">
                  <ul className="list-disc list-inside">
                    <li>First row must be column headers (e.g., Date, Channel, Spend, Revenue)</li>
                    <li>No merged cells, formulas, or empty columns</li>
                    <li>Numbers only in numeric columns</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <label className="block text-blue-200 mb-1">Upload Skeleton Deck (.pptx, optional)</label>
                  <input
                    type="file"
                    accept=".pptx"
                    onChange={e => setSkeletonDeck(e.target.files?.[0] || null)}
                    className="w-full text-blue-200 mb-2"
                  />
                  {skeletonDeck && <div className="text-xs text-blue-400 mb-2">{skeletonDeck.name}</div>}
                  <label className="block text-blue-200 mb-1">Reference Slides (.pptx, up to 3, optional)</label>
                  <input
                    type="file"
                    accept=".pptx"
                    multiple
                    onChange={e => setReferenceSlides(Array.from(e.target.files || []).slice(0, 3))}
                    className="w-full text-blue-200 mb-2"
                  />
                  {referenceSlides.length > 0 && (
                    <ul className="text-xs text-blue-400 mb-2">
                      {referenceSlides.map((f, i) => (
                        <li key={i}>{f.name} <button className="text-red-400 ml-2" onClick={() => setReferenceSlides(referenceSlides.filter((_, j) => j !== i))}>Remove</button></li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex gap-2 mt-6">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-none" onClick={() => setShowTemplateModal(true)}>
                    Choose Template
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setSelectedTemplate('default')
                    setStep(2)
                  }}>
                    Skip & Use Default
                  </Button>
                </div>
                {showTemplateModal && (
                  <TemplateSelectModal open={showTemplateModal} onClose={() => setShowTemplateModal(false)} onSelect={handleTemplateSelect} />
                )}
                <div className="absolute top-2 right-2 bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg text-xs">Tip: Upload your data to get started!</div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="block text-blue-200 mb-1">Upload Your Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const url = URL.createObjectURL(file)
                    setBrandLogo(url)
                  }}
                  className="w-full text-blue-200 mb-2"
                />
                {brandLogo && <img src={brandLogo} alt="Logo Preview" className="rounded-full border-2 border-blue-500 w-16 h-16 mx-auto mb-2" />}
                <label className="block text-blue-200 mb-1">Brand Color</label>
                <input
                  type="color"
                  value={brandColor}
                  onChange={e => setBrandColor(e.target.value)}
                  className="w-16 h-10 rounded-lg border-2 border-blue-500 mb-4 mx-auto block"
                />
                <label className="block text-blue-200 mb-1">Font Family</label>
                <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full rounded-lg bg-[#23242b] border border-[#23242b] p-2 text-white mb-2">
                  <option value="Inter">Inter</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Roboto">Roboto</option>
                </select>
                <label className="block text-blue-200 mb-1">Font Size</label>
                <input type="number" min={12} max={48} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full rounded-lg bg-[#23242b] border border-[#23242b] p-2 text-white mb-2" />
                <label className="block text-blue-200 mb-1">Color Scheme</label>
                <input type="color" value={colorScheme} onChange={e => setColorScheme(e.target.value)} className="w-16 h-10 rounded-lg border-2 border-blue-500 mb-4 mx-auto block" />
                <LoadingButton 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-none" 
                  onClick={handleBrandContinue}
                  loading={loading}
                  loadingText="Processing..."
                >
                  Next: Describe Project
                </LoadingButton>
                {selectedTemplate && (
                  <div className="mb-4">
                    <div className="text-blue-200 font-semibold mb-2">Template Preview</div>
                    <div className="rounded-lg border border-[#23242b] w-full max-w-xs mx-auto h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      {selectedTemplate} Template
                    </div>
                    <div className="mt-2 text-blue-300">Brand color: <span style={{background: brandColor, color: '#fff', padding: '2px 8px', borderRadius: '4px'}}>{brandColor}</span></div>
                    {brandLogo && <img src={brandLogo} alt="Brand logo" className="h-12 mt-2 mx-auto" />}
                  </div>
                )}
              </motion.div>
            )}
            {step === 3 && (
              <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="block text-blue-200 mb-1">Presentation Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={presentationName}
                  onChange={e => setPresentationName(e.target.value)}
                  className="w-full rounded-lg bg-[#23242b] border border-[#23242b] p-2 text-white mb-4 text-lg"
                  placeholder="e.g. Q2 Executive Summary"
                />
                <div className="mb-4">
                  <label className="block text-blue-200 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={questionnaire.description}
                    onChange={handleQuestionnaireChange}
                    className="w-full rounded-lg bg-[#23242b] border border-[#23242b] p-2 text-white mb-2"
                    rows={2}
                  />
                  <label className="block text-blue-200 mb-1">Key Variables</label>
                  <input
                    name="keyVariables"
                    value={questionnaire.keyVariables}
                    onChange={handleQuestionnaireChange}
                    className="w-full rounded-lg bg-[#23242b] border border-[#23242b] p-2 text-white mb-2"
                  />
                  <label className="block text-blue-200 mb-1">Context</label>
                  <input
                    name="context"
                    value={questionnaire.context}
                    onChange={handleQuestionnaireChange}
                    className="w-full rounded-lg bg-[#23242b] border border-[#23242b] p-2 text-white mb-2"
                  />
                  <label className="block text-blue-200 mb-1">Goal</label>
                  <input
                    name="goal"
                    value={questionnaire.goal}
                    onChange={handleQuestionnaireChange}
                    className="w-full rounded-lg bg-[#23242b] border border-[#23242b] p-2 text-white mb-2"
                  />
                  <label className="block text-blue-200 mb-1">Key Point</label>
                  <input
                    name="keyPoint"
                    value={questionnaire.keyPoint}
                    onChange={handleQuestionnaireChange}
                    className="w-full rounded-lg bg-[#23242b] border border-[#23242b] p-2 text-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={handleValidate}>
                    Check if Data is in Scope
                  </Button>
                  <Button onClick={() => setStep(4)}>
                    Next: Review & Continue
                  </Button>
                </div>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="mb-4 bg-[#23242b] border border-[#23242b]">
                  <div className="text-blue-200 text-sm mb-2">File: {file?.name || uploadedData?.fileName} ({data?.length || uploadedData?.rowCount || 0} rows)</div>
                  <div className="text-xs text-blue-400">Columns: {Object.keys(data?.[0] || uploadedData?.data?.[0] || {}).join(', ')}</div>
                  <div className="text-xs text-blue-400 mt-2">Template: {selectedTemplate}</div>
                  <div className="text-xs text-blue-400 mt-2">Brand Color: <span style={{ background: brandColor, padding: '0 8px', borderRadius: '4px' }}>{brandColor}</span></div>
                  {brandLogo && <img src={brandLogo} alt="Logo Preview" className="rounded-full border-2 border-blue-500 w-10 h-10 mt-2 inline-block" />}
                  {uploadedData?.pptxStructure && (
                    <div className="mt-4 p-2 bg-blue-950/60 rounded-lg">
                      <div className="text-blue-300 font-semibold mb-1">Extracted Skeleton Deck:</div>
                      <ul className="list-disc list-inside text-xs text-blue-200">
                        {uploadedData.pptxStructure.slides?.map((slide: any, i: number) => (
                          <li key={i}><b>{slide.title || `Slide ${i + 1}`}</b>{slide.text ? `: ${slide.text.slice(0, 60)}${slide.text.length > 60 ? '...' : ''}` : ''}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
                {inScope === false && (
                  <div className="text-red-400 text-sm mt-2">Sorry, your data is not yet supported: {reason}</div>
                )}
                <LoadingButton
                  disabled={!inScope}
                  onClick={handleContinue}
                  loading={loading || processing}
                  loadingText="Creating Presentation..."
                  className="w-full py-4 text-lg mt-6 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-none"
                >
                  Create Presentation
                </LoadingButton>
                {toast === 'Presentation created!' && (
                  <div className="fixed inset-0 z-50 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#2563eb" opacity="0.2"><animate attributeName="r" from="40" to="60" dur="0.8s" repeatCount="indefinite" /></circle></svg>
                  </div>
                )}
              </motion.div>
            )}
            <Toast message={toast || ''} open={!!toast} onClose={() => setToast(null)} />
            <div className="w-full mt-6">
              <Button variant="ghost" className="w-full" onClick={() => setShowFeedback(prev => !prev)}>
                {showFeedback ? 'Hide Feedback' : 'Give Feedback'}
              </Button>
              {showFeedback && (
                <textarea
                  className="w-full min-h-[60px] bg-[#23242b] text-white rounded-lg p-2 border border-[#23242b] mt-2"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Share your feedback, feature requests, or issues..."
                />
              )}
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  )
}