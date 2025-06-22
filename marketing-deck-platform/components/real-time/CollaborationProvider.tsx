'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'

// Mock Socket.IO types and implementation for build compatibility
interface Socket {
  emit: (event: string, data: any) => void
  on: (event: string, callback: (data: any) => void) => void
  off: (event: string, callback?: (data: any) => void) => void
  disconnect: () => void
  connected: boolean
}

const io = (url: string, options?: any): Socket => ({
  emit: () => {},
  on: () => {},
  off: () => {},
  disconnect: () => {},
  connected: false
})

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  cursor?: { x: number, y: number }
  selection?: string
  color: string
}

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  slideId: string
  position: { x: number, y: number }
  timestamp: Date
  resolved: boolean
  replies?: Comment[]
}

interface CollaborationState {
  users: User[]
  comments: Comment[]
  isConnected: boolean
  socket: Socket | null
  currentUser: User | null
}

interface CollaborationContextType extends CollaborationState {
  // User management
  setCurrentUser: (user: User) => void
  updateUserCursor: (position: { x: number, y: number }) => void
  updateUserSelection: (selection: string) => void
  
  // Comments
  addComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void
  replyToComment: (commentId: string, reply: string) => void
  resolveComment: (commentId: string) => void
  deleteComment: (commentId: string) => void
  
  // Real-time updates
  broadcastSlideUpdate: (slideId: string, updates: any) => void
  broadcastPresentationUpdate: (updates: any) => void
  onSlideUpdate: (callback: (slideId: string, updates: any) => void) => () => void
  onPresentationUpdate: (callback: (updates: any) => void) => () => void
  
  // Presence
  joinPresentation: (presentationId: string) => void
  leavePresentation: () => void
}

const CollaborationContext = createContext<CollaborationContextType | null>(null)

export const useCollaboration = () => {
  const context = useContext(CollaborationContext)
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider')
  }
  return context
}

interface CollaborationProviderProps {
  children: React.ReactNode
  presentationId?: string
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
]

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  children,
  presentationId
}) => {
  const [users, setUsers] = useState<User[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  
  const slideUpdateCallbacks = useRef<((slideId: string, updates: any) => void)[]>([])
  const presentationUpdateCallbacks = useRef<((updates: any) => void)[]>([])

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket']
    })

    newSocket.on('connect', () => {
      console.log('🔗 Connected to collaboration server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from collaboration server')
      setIsConnected(false)
    })

    // User presence events
    newSocket.on('user-joined', (user: User) => {
      setUsers(prev => [...prev.filter(u => u.id !== user.id), user])
    })

    newSocket.on('user-left', (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId))
    })

    newSocket.on('user-cursor-update', ({ userId, position }: { userId: string, position: { x: number, y: number } }) => {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, cursor: position } : u
      ))
    })

    newSocket.on('user-selection-update', ({ userId, selection }: { userId: string, selection: string }) => {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, selection } : u
      ))
    })

    // Comment events
    newSocket.on('comment-added', (comment: Comment) => {
      setComments(prev => [...prev, comment])
    })

    newSocket.on('comment-updated', (updatedComment: Comment) => {
      setComments(prev => prev.map(c => 
        c.id === updatedComment.id ? updatedComment : c
      ))
    })

    newSocket.on('comment-deleted', (commentId: string) => {
      setComments(prev => prev.filter(c => c.id !== commentId))
    })

    // Slide and presentation updates
    newSocket.on('slide-updated', ({ slideId, updates }: { slideId: string, updates: any }) => {
      slideUpdateCallbacks.current.forEach(callback => callback(slideId, updates))
    })

    newSocket.on('presentation-updated', (updates: any) => {
      presentationUpdateCallbacks.current.forEach(callback => callback(updates))
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const setCurrentUser = (user: User) => {
    const userWithColor = {
      ...user,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }
    setCurrentUserState(userWithColor)
    
    if (socket && presentationId) {
      socket.emit('join-presentation', { presentationId, user: userWithColor })
    }
  }

  const updateUserCursor = (position: { x: number, y: number }) => {
    if (socket && currentUser) {
      socket.emit('cursor-update', { position })
    }
  }

  const updateUserSelection = (selection: string) => {
    if (socket && currentUser) {
      socket.emit('selection-update', { selection })
    }
  }

  const addComment = (comment: Omit<Comment, 'id' | 'timestamp'>) => {
    if (socket) {
      const newComment: Comment = {
        ...comment,
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      }
      socket.emit('add-comment', newComment)
    }
  }

  const replyToComment = (commentId: string, reply: string) => {
    if (socket && currentUser) {
      const replyComment: Comment = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: currentUser.id,
        userName: currentUser.name,
        content: reply,
        slideId: '',
        position: { x: 0, y: 0 },
        timestamp: new Date(),
        resolved: false
      }
      socket.emit('reply-to-comment', { commentId, reply: replyComment })
    }
  }

  const resolveComment = (commentId: string) => {
    if (socket) {
      socket.emit('resolve-comment', commentId)
    }
  }

  const deleteComment = (commentId: string) => {
    if (socket) {
      socket.emit('delete-comment', commentId)
    }
  }

  const broadcastSlideUpdate = (slideId: string, updates: any) => {
    if (socket) {
      socket.emit('update-slide', { slideId, updates })
    }
  }

  const broadcastPresentationUpdate = (updates: any) => {
    if (socket) {
      socket.emit('update-presentation', updates)
    }
  }

  const onSlideUpdate = (callback: (slideId: string, updates: any) => void) => {
    slideUpdateCallbacks.current.push(callback)
    return () => {
      slideUpdateCallbacks.current = slideUpdateCallbacks.current.filter(cb => cb !== callback)
    }
  }

  const onPresentationUpdate = (callback: (updates: any) => void) => {
    presentationUpdateCallbacks.current.push(callback)
    return () => {
      presentationUpdateCallbacks.current = presentationUpdateCallbacks.current.filter(cb => cb !== callback)
    }
  }

  const joinPresentation = (presentationId: string) => {
    if (socket && currentUser) {
      socket.emit('join-presentation', { presentationId, user: currentUser })
    }
  }

  const leavePresentation = () => {
    if (socket && presentationId) {
      socket.emit('leave-presentation', presentationId)
    }
  }

  const value: CollaborationContextType = {
    users,
    comments,
    isConnected,
    socket,
    currentUser,
    setCurrentUser,
    updateUserCursor,
    updateUserSelection,
    addComment,
    replyToComment,
    resolveComment,
    deleteComment,
    broadcastSlideUpdate,
    broadcastPresentationUpdate,
    onSlideUpdate,
    onPresentationUpdate,
    joinPresentation,
    leavePresentation
  }

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  )
}