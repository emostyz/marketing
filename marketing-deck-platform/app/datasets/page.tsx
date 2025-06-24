'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Folder, 
  FileText, 
  Upload, 
  Trash2, 
  Edit, 
  Plus,
  Download,
  Eye,
  Calendar,
  HardDrive
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import PublicNavigation from '@/components/navigation/PublicNavigation'
import PublicFooter from '@/components/navigation/PublicFooter'

interface Dataset {
  id: number
  fileName: string
  fileType: string
  fileSize: number
  folder: string | null
  uploadedAt: string
  status: string
}

interface DatasetsResponse {
  datasets: Dataset[]
  datasetsByFolder: Record<string, Dataset[]>
  folders: string[]
}

export default function DatasetsPage() {
  const { user, loading } = useAuth()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [datasetsByFolder, setDatasetsByFolder] = useState<Record<string, Dataset[]>>({})
  const [folders, setFolders] = useState<string[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null)
  const router = useRouter()

  // Restrict access to signed-in users
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetchDatasets()
  }, [])

  const fetchDatasets = async () => {
    try {
      setLoadingData(true)
      const response = await fetch('/api/datasets')
      if (response.ok) {
        const data: DatasetsResponse = await response.json()
        setDatasets(data.datasets)
        setDatasetsByFolder(data.datasetsByFolder)
        setFolders(data.folders)
      }
    } catch (error) {
      console.error('Error fetching datasets:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      // Create a placeholder dataset to establish the folder
      const response = await fetch('/api/datasets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: '.folder',
          fileType: 'folder',
          fileSize: 0,
          folder: newFolderName.trim(),
          data: null
        }),
      })

      if (response.ok) {
        setNewFolderName('')
        fetchDatasets()
      }
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  const handleMoveToFolder = async (datasetId: number, folder: string) => {
    try {
      const response = await fetch('/api/datasets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          datasetId,
          folder
        }),
      })

      if (response.ok) {
        fetchDatasets()
      }
    } catch (error) {
      console.error('Error moving dataset:', error)
    }
  }

  const handleDeleteDataset = async (datasetId: number) => {
    if (!confirm('Are you sure you want to delete this dataset?')) return

    try {
      const response = await fetch(`/api/datasets?datasetId=${datasetId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchDatasets()
      }
    } catch (error) {
      console.error('Error deleting dataset:', error)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('csv')) return '📊'
    if (fileType.includes('xlsx') || fileType.includes('xls')) return '📈'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('pptx') || fileType.includes('ppt')) return '📋'
    return '📁'
  }

  const filteredDatasets = selectedFolder 
    ? datasetsByFolder[selectedFolder] || []
    : datasets

  if (loading || !user) {
    return null
  }

  if (loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading datasets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <PublicNavigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Your Data</h1>
            <p className="text-lg text-gray-300">Manage and upload your datasets for analysis and presentations.</p>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 shadow-xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Datasets</h1>
              <p className="text-gray-600">Manage and organize your data files</p>
            </div>

            {/* Stats - these are dark cards, so use white text */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gray-900 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <HardDrive className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm text-white">Total Datasets</p>
                      <p className="text-2xl font-bold text-white">{datasets.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Folder className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm text-white">Folders</p>
                      <p className="text-2xl font-bold text-white">{folders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Upload className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm text-white">Total Size</p>
                      <p className="text-2xl font-bold text-white">{formatFileSize(datasets.reduce((sum, d) => sum + (d.fileSize || 0), 0))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm text-white">Recent</p>
                      <p className="text-2xl font-bold text-white">{datasets.filter(d => {
                        const date = new Date(d.uploadedAt)
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return date > weekAgo
                      }).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Folder Navigation */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant={selectedFolder === null ? "default" : "outline"}
                  onClick={() => setSelectedFolder(null)}
                >
                  All Datasets
                </Button>
                {folders.map(folder => (
                  <Button
                    key={folder}
                    variant={selectedFolder === folder ? "default" : "outline"}
                    onClick={() => setSelectedFolder(folder)}
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    {folder}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => router.push('/files')}
                  className="ml-auto bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View All My Files
                </Button>
              </div>

              {/* Create New Folder */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="New folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="max-w-xs text-white bg-gray-800 border-gray-600 placeholder-gray-400"
                />
                <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Folder
                </Button>
              </div>
            </div>

            {/* Datasets Grid - empty state card should be dark with white text */}
            {filteredDatasets.length === 0 ? (
              <Card className="bg-gray-900 text-white">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {selectedFolder ? `No datasets in "${selectedFolder}"` : 'No datasets yet'}
                  </h3>
                  <p className="text-white mb-4">
                    {selectedFolder 
                      ? 'Upload some data files to this folder to get started.'
                      : 'Upload your first dataset to get started with creating presentations.'
                    }
                  </p>
                  <Button onClick={() => router.push('/upload')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Dataset
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDatasets.map(dataset => (
                  <Card key={dataset.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getFileIcon(dataset.fileType)}</span>
                          <div>
                            <CardTitle className="text-sm font-medium truncate text-gray-900">
                              {dataset.fileName}
                            </CardTitle>
                            <CardDescription className="text-xs text-gray-600">
                              {dataset.fileType} • {formatFileSize(dataset.fileSize || 0)}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={dataset.status === 'completed' ? 'default' : 'secondary'}>
                          {dataset.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(dataset.uploadedAt)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingDataset(dataset)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteDataset(dataset.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Edit Dataset Modal */}
            {editingDataset && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Edit Dataset</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-900">File Name</label>
                        <Input 
                          value={editingDataset.fileName}
                          onChange={(e) => setEditingDataset({
                            ...editingDataset,
                            fileName: e.target.value
                          })}
                          className="text-gray-900 bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-900">Folder</label>
                        <select
                          className="w-full p-2 border rounded-md text-gray-900 bg-white border-gray-300"
                          value={editingDataset.folder || ''}
                          onChange={(e) => setEditingDataset({
                            ...editingDataset,
                            folder: e.target.value || null
                          })}
                        >
                          <option value="">Uncategorized</option>
                          {folders.map(folder => (
                            <option key={folder} value={folder}>{folder}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={async () => {
                            await handleMoveToFolder(editingDataset.id, editingDataset.folder || '')
                            setEditingDataset(null)
                          }}
                        >
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setEditingDataset(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  )
} 