'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, MessageCircle, Eye, EyeOff, MousePointer2, 
  Video, Mic, MicOff, VideoOff, Share2, Settings,
  UserPlus, Crown, Shield, Edit3, Clock, Wifi,
  WifiOff, Circle, Square, Triangle, Type, Image,
  MoreHorizontal, X, Check, AlertCircle, Bell,
  ChevronDown, ChevronUp, Sparkles, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Avatar } from '@/components/ui/avatar'

interface CollaboratorCursor {
  id: string
  userId: string
  userName: string
  userAvatar: string
  position: { x: number; y: number }
  color: string
  isActive: boolean
  lastSeen: Date
  tool?: string
  isSelecting?: boolean
  selection?: { x: number; y: number; width: number; height: number }
}

interface CollaborationComment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  position: { x: number; y: number }
  content: string
  timestamp: Date
  resolved: boolean
  replies: CollaborationReply[]
  elementId?: string
}

interface CollaborationReply {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: Date
}

interface CollaborationActivity {
  id: string
  userId: string
  userName: string
  userAvatar: string
  action: string
  elementType?: string
  timestamp: Date
  description: string
}

interface Collaborator {
  id: string
  userId: string
  userName: string
  userEmail: string
  userAvatar: string
  role: 'owner' | 'editor' | 'viewer' | 'commenter'
  status: 'online' | 'away' | 'offline'
  joinedAt: Date
  lastActive: Date
  permissions: {
    canEdit: boolean
    canComment: boolean
    canShare: boolean
    canManageUsers: boolean
  }
  presence: {
    currentTool?: string
    currentElement?: string
    isTyping?: boolean
    isPresenting?: boolean
  }
}

interface RealtimeCollaborationProps {
  slideId: string
  currentUser: {
    id: string
    name: string
    email: string
    avatar: string
  }
  onCollaboratorJoin?: (collaborator: Collaborator) => void
  onCollaboratorLeave?: (collaboratorId: string) => void
  onCursorMove?: (cursor: CollaboratorCursor) => void
  onCommentAdd?: (comment: CollaborationComment) => void
  onActivityLog?: (activity: CollaborationActivity) => void
  className?: string
}

// Predefined collaborator colors
const COLLABORATOR_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#6366f1', '#14b8a6', '#eab308'
]

export function RealtimeCollaboration({
  slideId,
  currentUser,
  onCollaboratorJoin,
  onCollaboratorLeave,
  onCursorMove,
  onCommentAdd,
  onActivityLog,
  className = ''
}: RealtimeCollaborationProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [cursors, setCursors] = useState<CollaboratorCursor[]>([])
  const [comments, setComments] = useState<CollaborationComment[]>([])
  const [activities, setActivities] = useState<CollaborationActivity[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [selectedComment, setSelectedComment] = useState<string | null>(null)
  const [isPresenting, setIsPresenting] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('excellent')
  
  const wsRef = useRef<WebSocket | null>(null)
  const cursorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize WebSocket connection
  useEffect(() => {
    connectToCollaboration()
    
    return () => {
      disconnectFromCollaboration()
    }
  }, [slideId])

  const connectToCollaboration = useCallback(() => {
    try {
      // In real implementation, this would connect to your WebSocket server
      // For demo purposes, we'll simulate the connection
      setIsConnected(true)
      setConnectionQuality('excellent')
      
      // Simulate initial collaborators
      const initialCollaborators: Collaborator[] = [
        {
          id: '1',
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          userAvatar: currentUser.avatar,
          role: 'owner',
          status: 'online',
          joinedAt: new Date(),
          lastActive: new Date(),
          permissions: {
            canEdit: true,
            canComment: true,
            canShare: true,
            canManageUsers: true
          },
          presence: {}
        }
      ]
      
      setCollaborators(initialCollaborators)
      
      // Simulate some demo collaborators
      setTimeout(() => {
        addDemoCollaborators()
      }, 2000)
      
      toast.success('Connected to collaboration session')
    } catch (error) {
      setIsConnected(false)
      setConnectionQuality('disconnected')
      toast.error('Failed to connect to collaboration')
    }
  }, [slideId, currentUser])

  const disconnectFromCollaboration = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
    }
    setIsConnected(false)
  }, [])

  // Add demo collaborators for demonstration
  const addDemoCollaborators = () => {
    const demoCollaborators: Collaborator[] = [
      {
        id: '2',
        userId: 'demo-user-1',
        userName: 'Sarah Chen',
        userEmail: 'sarah@company.com',
        userAvatar: '👩‍💼',
        role: 'editor',
        status: 'online',
        joinedAt: new Date(),
        lastActive: new Date(),
        permissions: {
          canEdit: true,
          canComment: true,
          canShare: false,
          canManageUsers: false
        },
        presence: {
          currentTool: 'text',
          isTyping: false
        }
      },
      {
        id: '3',
        userId: 'demo-user-2',
        userName: 'Marcus Rodriguez',
        userEmail: 'marcus@company.com',
        userAvatar: '👨‍💻',
        role: 'viewer',
        status: 'online',
        joinedAt: new Date(Date.now() - 300000),
        lastActive: new Date(Date.now() - 60000),
        permissions: {
          canEdit: false,
          canComment: true,
          canShare: false,
          canManageUsers: false
        },
        presence: {
          currentElement: 'chart-1'
        }
      }
    ]

    setCollaborators(prev => [...prev, ...demoCollaborators])
    
    // Add demo cursors
    const demoCursors: CollaboratorCursor[] = [
      {
        id: 'cursor-2',
        userId: 'demo-user-1',
        userName: 'Sarah Chen',
        userAvatar: '👩‍💼',
        position: { x: 450, y: 300 },
        color: COLLABORATOR_COLORS[1],
        isActive: true,
        lastSeen: new Date(),
        tool: 'text'
      }
    ]

    setCursors(demoCursors)
    
    // Add demo activities
    const demoActivities: CollaborationActivity[] = [
      {
        id: 'activity-1',
        userId: 'demo-user-1',
        userName: 'Sarah Chen',
        userAvatar: '👩‍💼',
        action: 'added_element',
        elementType: 'text',
        timestamp: new Date(Date.now() - 120000),
        description: 'Added text element "Q4 Revenue Analysis"'
      },
      {
        id: 'activity-2',
        userId: 'demo-user-2',
        userName: 'Marcus Rodriguez',
        userAvatar: '👨‍💻',
        action: 'added_comment',
        timestamp: new Date(Date.now() - 300000),
        description: 'Added comment on chart element'
      }
    ]

    setActivities(demoActivities)
    
    // Animate cursor movement
    animateDemoCursor()
  }

  // Animate demo cursor for realistic effect
  const animateDemoCursor = () => {
    let position = { x: 450, y: 300 }
    
    const animateInterval = setInterval(() => {
      position.x += (Math.random() - 0.5) * 20
      position.y += (Math.random() - 0.5) * 20
      
      // Keep cursor within bounds
      position.x = Math.max(0, Math.min(800, position.x))
      position.y = Math.max(0, Math.min(600, position.y))
      
      setCursors(prev => prev.map(cursor => 
        cursor.id === 'cursor-2'
          ? { ...cursor, position, lastSeen: new Date() }
          : cursor
      ))
    }, 2000)

    // Stop animation after 30 seconds
    setTimeout(() => {
      clearInterval(animateInterval)
    }, 30000)
  }

  // Handle cursor movement
  const handleCursorMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    // Broadcast cursor position to other collaborators
    onCursorMove?.({
      id: `cursor-${currentUser.id}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      position,
      color: COLLABORATOR_COLORS[0],
      isActive: true,
      lastSeen: new Date()
    })
  }, [currentUser, onCursorMove])

  // Add comment at position
  const addComment = useCallback((position: { x: number; y: number }, content: string) => {
    const newCommentObj: CollaborationComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      position,
      content,
      timestamp: new Date(),
      resolved: false,
      replies: []
    }

    setComments(prev => [...prev, newCommentObj])
    onCommentAdd?.(newCommentObj)
    
    // Log activity
    const activity: CollaborationActivity = {
      id: `activity-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'added_comment',
      timestamp: new Date(),
      description: `Added comment: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`
    }
    
    setActivities(prev => [activity, ...prev])
    onActivityLog?.(activity)
    
    toast.success('Comment added')
  }, [currentUser, onCommentAdd, onActivityLog])

  // Handle canvas click for adding comments
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (isAddingComment) {
      const rect = e.currentTarget.getBoundingClientRect()
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
      setCommentPosition(position)
    }
  }, [isAddingComment])

  // Invite collaborator
  const inviteCollaborator = useCallback((email: string, role: Collaborator['role']) => {
    // In real implementation, this would send an invitation
    toast.success(`Invitation sent to ${email}`)
  }, [])

  // Connection quality indicator
  const getConnectionIndicator = () => {
    switch (connectionQuality) {
      case 'excellent':
        return { icon: Wifi, color: 'text-green-500', text: 'Excellent connection' }
      case 'good':
        return { icon: Wifi, color: 'text-yellow-500', text: 'Good connection' }
      case 'poor':
        return { icon: Wifi, color: 'text-orange-500', text: 'Poor connection' }
      case 'disconnected':
        return { icon: WifiOff, color: 'text-red-500', text: 'Disconnected' }
    }
  }

  const connectionIndicator = getConnectionIndicator()

  return (
    <div className={`relative ${className}`}>
      {/* Collaboration Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        onMouseMove={handleCursorMove}
        onClick={handleCanvasClick}
        style={{ pointerEvents: isAddingComment ? 'auto' : 'none' }}
      >
        {/* Other users' cursors */}
        <AnimatePresence>
          {cursors.map((cursor) => (
            <motion.div
              key={cursor.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute pointer-events-none z-50"
              style={{
                left: cursor.position.x,
                top: cursor.position.y,
                color: cursor.color
              }}
            >
              {/* Cursor */}
              <div className="relative">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="drop-shadow-lg"
                >
                  <path
                    d="M8.5 2L2 8.5L8.5 15L15 8.5L8.5 2Z"
                    fill="currentColor"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
                
                {/* User label */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-6 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
                  style={{ backgroundColor: cursor.color }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{cursor.userAvatar}</span>
                    <span>{cursor.userName}</span>
                    {cursor.tool && (
                      <span className="opacity-75">
                        {cursor.tool === 'text' && <Type className="w-3 h-3" />}
                        {cursor.tool === 'image' && <Image className="w-3 h-3" />}
                        {cursor.tool === 'shape' && <Square className="w-3 h-3" />}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Selection area */}
                {cursor.isSelecting && cursor.selection && (
                  <div
                    className="absolute border-2 border-dashed pointer-events-none"
                    style={{
                      left: cursor.selection.x,
                      top: cursor.selection.y,
                      width: cursor.selection.width,
                      height: cursor.selection.height,
                      borderColor: cursor.color,
                      backgroundColor: `${cursor.color}20`
                    }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Comments */}
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute pointer-events-auto z-40"
              style={{
                left: comment.position.x,
                top: comment.position.y
              }}
            >
              <CommentBubble
                comment={comment}
                isSelected={selectedComment === comment.id}
                onSelect={() => setSelectedComment(comment.id)}
                onResolve={() => {
                  setComments(prev => prev.map(c => 
                    c.id === comment.id ? { ...c, resolved: true } : c
                  ))
                  toast.success('Comment resolved')
                }}
                onReply={(content: string) => {
                  const reply: CollaborationReply = {
                    id: `reply-${Date.now()}`,
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userAvatar: currentUser.avatar,
                    content,
                    timestamp: new Date()
                  }
                  
                  setComments(prev => prev.map(c => 
                    c.id === comment.id 
                      ? { ...c, replies: [...c.replies, reply] }
                      : c
                  ))
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* New comment input */}
        <AnimatePresence>
          {commentPosition && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute pointer-events-auto z-50"
              style={{
                left: commentPosition.x,
                top: commentPosition.y
              }}
            >
              <Card className="w-64 p-3 shadow-lg">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full h-20 p-2 text-sm border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCommentPosition(null)
                      setNewComment('')
                      setIsAddingComment(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newComment.trim()) {
                        addComment(commentPosition, newComment)
                        setCommentPosition(null)
                        setNewComment('')
                        setIsAddingComment(false)
                      }
                    }}
                    disabled={!newComment.trim()}
                  >
                    Add
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collaboration Panel */}
      <div className="absolute top-4 right-4 z-30">
        <Card className="w-80 bg-white shadow-lg">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Live Collaboration</h3>
                  <div className="flex items-center space-x-1">
                    <connectionIndicator.icon className={`w-3 h-3 ${connectionIndicator.color}`} />
                    <span className="text-xs text-gray-500">{connectionIndicator.text}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">{collaborators.length} active</span>
                <div className="flex -space-x-1">
                  {collaborators.slice(0, 3).map((collaborator, index) => (
                    <div
                      key={collaborator.id}
                      className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs"
                      style={{ zIndex: 10 - index }}
                    >
                      {collaborator.userAvatar}
                    </div>
                  ))}
                  {collaborators.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                      +{collaborators.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={isAddingComment ? "default" : "outline"}
                onClick={() => setIsAddingComment(!isAddingComment)}
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Comment
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPresenting(!isPresenting)}
                className="flex-1"
              >
                {isPresenting ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                Present
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => {
                  setShowCollaborators(true)
                  setShowComments(false)
                  setShowActivity(false)
                }}
                className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                  showCollaborators
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                People ({collaborators.length})
              </button>
              
              <button
                onClick={() => {
                  setShowCollaborators(false)
                  setShowComments(true)
                  setShowActivity(false)
                }}
                className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                  showComments
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Comments ({comments.filter(c => !c.resolved).length})
              </button>
              
              <button
                onClick={() => {
                  setShowCollaborators(false)
                  setShowComments(false)
                  setShowActivity(true)
                }}
                className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                  showActivity
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Activity
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {showCollaborators && (
              <CollaboratorsList
                collaborators={collaborators}
                currentUserId={currentUser.id}
                onInvite={inviteCollaborator}
                onRemove={(collaboratorId) => {
                  setCollaborators(prev => prev.filter(c => c.id !== collaboratorId))
                  onCollaboratorLeave?.(collaboratorId)
                }}
                onRoleChange={(collaboratorId, role) => {
                  setCollaborators(prev => prev.map(c => 
                    c.id === collaboratorId ? { ...c, role } : c
                  ))
                }}
              />
            )}
            
            {showComments && (
              <CommentsList
                comments={comments}
                onResolve={(commentId) => {
                  setComments(prev => prev.map(c => 
                    c.id === commentId ? { ...c, resolved: true } : c
                  ))
                }}
                onNavigate={(comment) => {
                  // Scroll to comment position
                  setSelectedComment(comment.id)
                }}
              />
            )}
            
            {showActivity && (
              <ActivityList activities={activities} />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

// Comment Bubble Component
interface CommentBubbleProps {
  comment: CollaborationComment
  isSelected: boolean
  onSelect: () => void
  onResolve: () => void
  onReply: (content: string) => void
}

function CommentBubble({ comment, isSelected, onSelect, onResolve, onReply }: CommentBubbleProps) {
  const [showReplies, setShowReplies] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  return (
    <div className="relative">
      {/* Comment Pin */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onSelect}
        className={`w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer flex items-center justify-center ${
          comment.resolved
            ? 'bg-green-500'
            : isSelected
              ? 'bg-blue-500'
              : 'bg-yellow-500'
        }`}
      >
        {comment.resolved ? (
          <Check className="w-3 h-3 text-white" />
        ) : (
          <MessageCircle className="w-3 h-3 text-white" />
        )}
      </motion.div>

      {/* Comment Popup */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: -20 }}
            className="absolute left-8 top-0 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{comment.userAvatar}</span>
                  <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">
                    {comment.timestamp.toLocaleTimeString()}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onSelect}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <p className="text-sm text-gray-700 mb-3">{comment.content}</p>
              
              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsReplying(!isReplying)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                  
                  {comment.replies.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowReplies(!showReplies)}
                    >
                      {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {comment.replies.length}
                    </Button>
                  )}
                </div>
                
                {!comment.resolved && (
                  <Button
                    size="sm"
                    onClick={onResolve}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>

              {/* Reply Input */}
              <AnimatePresence>
                {isReplying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-gray-200"
                  >
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full h-16 p-2 text-sm border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsReplying(false)
                          setReplyContent('')
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (replyContent.trim()) {
                            onReply(replyContent)
                            setReplyContent('')
                            setIsReplying(false)
                          }
                        }}
                        disabled={!replyContent.trim()}
                      >
                        Reply
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Replies */}
              <AnimatePresence>
                {showReplies && comment.replies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-gray-200 space-y-2"
                  >
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-2">
                        <span className="text-xs">{reply.userAvatar}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-900">{reply.userName}</span>
                            <span className="text-xs text-gray-500">{reply.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-gray-700 mt-1">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Collaborators List Component
interface CollaboratorsListProps {
  collaborators: Collaborator[]
  currentUserId: string
  onInvite: (email: string, role: Collaborator['role']) => void
  onRemove: (collaboratorId: string) => void
  onRoleChange: (collaboratorId: string, role: Collaborator['role']) => void
}

function CollaboratorsList({ collaborators, currentUserId, onInvite, onRemove, onRoleChange }: CollaboratorsListProps) {
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Collaborator['role']>('editor')

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInvite(inviteEmail, inviteRole)
      setInviteEmail('')
      setShowInvite(false)
    }
  }

  const getRoleIcon = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'editor': return <Edit3 className="w-4 h-4 text-blue-500" />
      case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />
      case 'commenter': return <MessageCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getStatusIndicator = (status: Collaborator['status']) => {
    switch (status) {
      case 'online': return <Circle className="w-2 h-2 text-green-500 fill-current" />
      case 'away': return <Circle className="w-2 h-2 text-yellow-500 fill-current" />
      case 'offline': return <Circle className="w-2 h-2 text-gray-400 fill-current" />
    }
  }

  return (
    <div className="p-4">
      {/* Invite Button */}
      <Button
        onClick={() => setShowInvite(!showInvite)}
        size="sm"
        variant="outline"
        className="w-full mb-4"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Invite People
      </Button>

      {/* Invite Form */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 border border-gray-200 rounded-lg"
          >
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full p-2 text-sm border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex space-x-2">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Collaborator['role'])}
                className="flex-1 p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="viewer">Viewer</option>
                <option value="commenter">Commenter</option>
                <option value="editor">Editor</option>
              </select>
              <Button size="sm" onClick={handleInvite} disabled={!inviteEmail.trim()}>
                Invite
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collaborators List */}
      <div className="space-y-2">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  {collaborator.userAvatar}
                </div>
                <div className="absolute -bottom-1 -right-1">
                  {getStatusIndicator(collaborator.status)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {collaborator.userName}
                  </span>
                  {getRoleIcon(collaborator.role)}
                </div>
                <p className="text-xs text-gray-500 truncate">{collaborator.userEmail}</p>
                {collaborator.presence.currentTool && (
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs text-blue-600">Using {collaborator.presence.currentTool}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {collaborator.userId !== currentUserId && (
              <div className="flex items-center space-x-1">
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Comments List Component
interface CommentsListProps {
  comments: CollaborationComment[]
  onResolve: (commentId: string) => void
  onNavigate: (comment: CollaborationComment) => void
}

function CommentsList({ comments, onResolve, onNavigate }: CommentsListProps) {
  const activeComments = comments.filter(c => !c.resolved)
  const resolvedComments = comments.filter(c => c.resolved)

  return (
    <div className="p-4">
      {/* Active Comments */}
      {activeComments.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Active Comments</h4>
          <div className="space-y-2">
            {activeComments.map((comment) => (
              <div
                key={comment.id}
                className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => onNavigate(comment)}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs">{comment.userAvatar}</span>
                  <span className="text-xs font-medium text-gray-900">{comment.userName}</span>
                  <span className="text-xs text-gray-500">{comment.timestamp.toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-gray-700 line-clamp-2">{comment.content}</p>
                {comment.replies.length > 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <MessageCircle className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{comment.replies.length} replies</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Comments */}
      {resolvedComments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Resolved Comments</h4>
          <div className="space-y-2">
            {resolvedComments.map((comment) => (
              <div
                key={comment.id}
                className="p-2 border border-gray-200 rounded-lg opacity-60"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-xs">{comment.userAvatar}</span>
                  <span className="text-xs font-medium text-gray-900">{comment.userName}</span>
                  <span className="text-xs text-gray-500">{comment.timestamp.toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-gray-700 line-clamp-1">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {comments.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No comments yet</p>
          <p className="text-xs text-gray-400">Click anywhere on the slide to add a comment</p>
        </div>
      )}
    </div>
  )
}

// Activity List Component
interface ActivityListProps {
  activities: CollaborationActivity[]
}

function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className="p-4">
      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                {activity.userAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.userName}</span>
                  {' '}
                  <span className="text-gray-600">{activity.description}</span>
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No activity yet</p>
        </div>
      )}
    </div>
  )
}