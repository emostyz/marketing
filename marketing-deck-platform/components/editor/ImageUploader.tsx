'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, X, Image as ImageIcon, Search, Grid, List, Download,
  Star, Trash2, Eye, Copy, Link, Crop, RotateCw, Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface UploadedImage {
  id: string
  url: string
  name: string
  size: number
  width: number
  height: number
  type: string
  uploadedAt: Date
  tags: string[]
  isFavorite: boolean
}

interface ImageUploaderProps {
  isOpen: boolean
  onClose: () => void
  onImageSelect: (image: UploadedImage) => void
  existingImages?: UploadedImage[]
}

const stockImages = [
  {
    id: 'stock-1',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    name: 'Business Meeting',
    size: 245760,
    width: 400,
    height: 300,
    type: 'image/jpeg',
    uploadedAt: new Date(),
    tags: ['business', 'meeting', 'professional'],
    isFavorite: false
  },
  {
    id: 'stock-2',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    name: 'Analytics Dashboard',
    size: 186420,
    width: 400,
    height: 300,
    type: 'image/jpeg',
    uploadedAt: new Date(),
    tags: ['analytics', 'dashboard', 'data'],
    isFavorite: false
  },
  {
    id: 'stock-3',
    url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
    name: 'Team Collaboration',
    size: 298340,
    width: 400,
    height: 300,
    type: 'image/jpeg',
    uploadedAt: new Date(),
    tags: ['team', 'collaboration', 'office'],
    isFavorite: false
  },
  {
    id: 'stock-4',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    name: 'Growth Chart',
    size: 156780,
    width: 400,
    height: 300,
    type: 'image/jpeg',
    uploadedAt: new Date(),
    tags: ['growth', 'chart', 'success'],
    isFavorite: false
  }
]

export default function ImageUploader({ 
  isOpen, 
  onClose, 
  onImageSelect, 
  existingImages = [] 
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<UploadedImage[]>([...existingImages, ...stockImages])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedImage[]>([])
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const handleFileUpload = useCallback(async (files: FileList) => {
    const newImages: UploadedImage[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue

      const id = `upload-${Date.now()}-${Math.random()}`
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      
      // Get image dimensions
      const img = new Image()
      img.onload = () => {
        const newImage: UploadedImage = {
          id,
          url,
          name: file.name,
          size: file.size,
          width: img.width,
          height: img.height,
          type: file.type,
          uploadedAt: new Date(),
          tags: [],
          isFavorite: false
        }
        
        setUploadedFiles(prev => [...prev, newImage])
        setImages(prev => [newImage, ...prev])
      }
      img.src = url

      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [id]: 0 }))
      
      // Simulate gradual upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[id] || 0
          if (currentProgress >= 100) {
            clearInterval(progressInterval)
            return prev
          }
          return { ...prev, [id]: Math.min(100, currentProgress + 10) }
        })
      }, 100)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const toggleFavorite = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
    ))
  }

  const deleteImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
    setUploadedFiles(prev => prev.filter(img => img.id !== imageId))
    
    // Clean up object URL for uploaded files
    const image = images.find(img => img.id === imageId)
    if (image && image.url.startsWith('blob:')) {
      URL.revokeObjectURL(image.url)
    }
  }

  const addTag = (imageId: string, tag: string) => {
    if (!tag.trim()) return
    
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, tags: [...new Set([...img.tags, tag.trim().toLowerCase()])] }
        : img
    ))
  }

  const removeTag = (imageId: string, tagToRemove: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, tags: img.tags.filter(tag => tag !== tagToRemove) }
        : img
    ))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getAllTags = () => {
    const allTags = images.flatMap(img => img.tags)
    return [...new Set(allTags)].sort()
  }

  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTag = filterTag === 'all' || 
                      filterTag === 'favorites' && image.isFavorite ||
                      image.tags.includes(filterTag)
    
    return matchesSearch && matchesTag
  })

  const renderUploadArea = () => (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragOver ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />
      
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">Upload Images</h3>
      <p className="text-gray-400 mb-4">
        Drag and drop images here, or click to browse
      </p>
      <p className="text-xs text-gray-500">
        Supports: PNG, JPG, GIF, WebP (Max 10MB each)
      </p>
      
      <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
        Choose Files
      </Button>
    </div>
  )

  const renderImageCard = (image: UploadedImage) => {
    const progress = uploadProgress[image.id]
    const isUploading = progress !== undefined && progress < 100

    if (viewMode === 'list') {
      return (
        <div
          key={image.id}
          className="flex items-center gap-4 p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors group"
        >
          <div className="relative w-16 h-16 flex-shrink-0">
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-full object-cover rounded"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                <span className="text-xs text-white">{progress}%</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{image.name}</h4>
            <p className="text-xs text-gray-400">
              {image.width} × {image.height} • {formatFileSize(image.size)}
            </p>
            <div className="flex gap-1 mt-1">
              {image.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(image.id)}
                  className="text-gray-400 hover:text-yellow-400"
                >
                  <Star className={cn("w-4 h-4", image.isFavorite && "fill-yellow-400 text-yellow-400")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Favorite</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(image)}
                  className="text-gray-400 hover:text-blue-400"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onImageSelect(image)}
                  className="text-gray-400 hover:text-green-400"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Use Image</TooltipContent>
            </Tooltip>
            
            {uploadedFiles.some(f => f.id === image.id) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteImage(image.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      )
    }

    return (
      <Card
        key={image.id}
        className="bg-gray-800 border-gray-700 overflow-hidden hover:bg-gray-750 transition-colors group cursor-pointer"
        onClick={() => setSelectedImage(image)}
      >
        <div className="relative aspect-video">
          <img
            src={image.url}
            alt={image.name}
            className="w-full h-full object-cover"
          />
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs text-white">{progress}%</span>
              </div>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(image.id)
              }}
              className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70"
            >
              <Star className={cn("w-3 h-3", image.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-white")} />
            </Button>
            
            {uploadedFiles.some(f => f.id === image.id) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteImage(image.id)
                }}
                className="w-8 h-8 p-0 bg-black/50 hover:bg-red-600"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </Button>
            )}
          </div>
          
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex gap-1 flex-wrap">
              {image.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs bg-black/50 text-white">
                  {tag}
                </Badge>
              ))}
              {image.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs bg-black/50 text-white">
                  +{image.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-3">
          <h4 className="text-sm font-medium text-white truncate">{image.name}</h4>
          <p className="text-xs text-gray-400 mt-1">
            {image.width} × {image.height} • {formatFileSize(image.size)}
          </p>
        </div>
      </Card>
    )
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Image Library</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search images..."
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all" className="text-white">All</SelectItem>
                  <SelectItem value="favorites" className="text-white">Favorites</SelectItem>
                  {getAllTags().map(tag => (
                    <SelectItem key={tag} value={tag} className="text-white">
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-1 bg-gray-800 p-1 rounded">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="w-8 h-8 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="w-8 h-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Upload Area */}
            {renderUploadArea()}

            {/* Image Grid/List */}
            {filteredImages.length > 0 ? (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  : "space-y-2"
              )}>
                {filteredImages.map(renderImageCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No images found</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{selectedImage.name}</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onImageSelect(selectedImage)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Use This Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImage(null)}
                    className="text-gray-400 hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex gap-6">
                  <div className="flex-1">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.name}
                      className="w-full h-auto max-h-96 object-contain rounded"
                    />
                  </div>
                  
                  <div className="w-64 space-y-4">
                    <div>
                      <Label className="text-xs text-gray-400">Dimensions</Label>
                      <p className="text-white">{selectedImage.width} × {selectedImage.height}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-400">File Size</Label>
                      <p className="text-white">{formatFileSize(selectedImage.size)}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-400">Type</Label>
                      <p className="text-white">{selectedImage.type}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-400">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedImage.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}