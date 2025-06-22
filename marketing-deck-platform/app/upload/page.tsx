"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, BarChart3, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(selectedFiles)
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Redirect to dashboard after upload
      router.push('/dashboard')
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Upload Your Data
            </h1>
            <p className="text-xl text-gray-300">
              Upload CSV, Excel, or JSON files to create stunning presentations
            </p>
          </div>

          {/* Upload Area */}
          <div className="bg-gray-800 rounded-lg p-8 mb-8">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Drop your files here
              </h3>
              <p className="text-gray-400 mb-6">
                or click to browse files
              </p>
              
              <input
                type="file"
                multiple
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Choose Files
                </Button>
              </label>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-400 mr-3" />
                      <div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {file.type || 'Unknown type'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Uploading...
                </h3>
                <span className="text-blue-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Back to Dashboard
            </Button>
            
            {files.length > 0 && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {uploading ? (
                  'Uploading...'
                ) : (
                  <>
                    Upload & Analyze
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                AI Analysis
              </h3>
              <p className="text-gray-400">
                Our AI analyzes your data and creates insightful presentations
              </p>
            </div>
            
            <div className="text-center">
              <FileText className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Multiple Formats
              </h3>
              <p className="text-gray-400">
                Support for CSV, Excel, and JSON files
              </p>
            </div>
            
            <div className="text-center">
              <ArrowRight className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Instant Results
              </h3>
              <p className="text-gray-400">
                Get your presentation ready in minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 