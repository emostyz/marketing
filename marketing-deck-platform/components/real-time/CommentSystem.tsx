'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Check, X, Reply, MoreVertical } from 'lucide-react'
import { useCollaboration } from './CollaborationProvider'
import { UserAvatar } from './UserPresence'

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

interface CommentMarkerProps {
  comment: Comment
  onClick: () => void
  isActive: boolean
}

const CommentMarker: React.FC<CommentMarkerProps> = ({ comment, onClick, isActive }) => {
  return (
    <motion.button
      className={`absolute w-6 h-6 rounded-full flex items-center justify-center z-20 ${
        comment.resolved 
          ? 'bg-green-500 text-white' 
          : isActive 
            ? 'bg-blue-500 text-white' 
            : 'bg-yellow-500 text-white hover:bg-yellow-600'
      } transition-colors shadow-lg`}
      style={{
        left: comment.position.x,
        top: comment.position.y,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {comment.resolved ? (
        <Check className="w-3 h-3" />
      ) : (
        <MessageCircle className="w-3 h-3" />
      )}
    </motion.button>
  )
}

interface CommentThreadProps {
  comment: Comment
  position: { x: number, y: number }
  onClose: () => void
  onResolve: () => void
  onDelete: () => void
  onReply: (content: string) => void
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  position,
  onClose,
  onResolve,
  onDelete,
  onReply
}) => {
  const [replyContent, setReplyContent] = useState('')
  const [showReplyInput, setShowReplyInput] = useState(false)
  const { currentUser } = useCollaboration()
  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (showReplyInput && replyInputRef.current) {
      replyInputRef.current.focus()
    }
  }, [showReplyInput])

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent.trim())
      setReplyContent('')
      setShowReplyInput(false)
    }
  }

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      className="fixed z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200"
      style={{
        left: Math.min(position.x + 20, window.innerWidth - 320),
        top: Math.min(position.y, window.innerHeight - 400)
      }}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <UserAvatar 
            user={{ 
              id: comment.userId, 
              name: comment.userName, 
              color: '#6366F1' 
            }} 
            size="sm" 
          />
          <div>
            <div className="font-medium text-sm">{comment.userName}</div>
            <div className="text-xs text-gray-500">{formatTime(comment.timestamp)}</div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {!comment.resolved && (
            <button
              onClick={onResolve}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Mark as resolved"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {currentUser?.id === comment.userId && (
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete comment"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comment content */}
      <div className="p-4">
        <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
        
        {comment.resolved && (
          <div className="mt-2 flex items-center space-x-1 text-green-600">
            <Check className="w-3 h-3" />
            <span className="text-xs">Resolved</span>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="px-4 pb-4">
          <div className="space-y-3">
            {comment.replies.map(reply => (
              <div key={reply.id} className="flex space-x-2">
                <UserAvatar 
                  user={{ 
                    id: reply.userId, 
                    name: reply.userName, 
                    color: '#8B5CF6' 
                  }} 
                  size="sm" 
                />
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs">{reply.userName}</span>
                    <span className="text-xs text-gray-500">{formatTime(reply.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-800">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply input */}
      {!comment.resolved && (
        <div className="px-4 pb-4">
          {!showReplyInput ? (
            <button
              onClick={() => setShowReplyInput(true)}
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                ref={replyInputRef}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleReply()
                  }
                }}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowReplyInput(false)
                    setReplyContent('')
                  }}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

interface CommentSystemProps {
  slideId: string
  children: React.ReactNode
}

export const CommentSystem: React.FC<CommentSystemProps> = ({ slideId, children }) => {
  const [isCommenting, setIsCommenting] = useState(false)
  const [activeComment, setActiveComment] = useState<Comment | null>(null)
  const [newCommentPosition, setNewCommentPosition] = useState<{ x: number, y: number } | null>(null)
  const [newCommentContent, setNewCommentContent] = useState('')
  
  const { 
    comments, 
    currentUser, 
    addComment, 
    replyToComment, 
    resolveComment, 
    deleteComment 
  } = useCollaboration()

  const slideComments = comments.filter(c => c.slideId === slideId)
  const newCommentInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (newCommentPosition && newCommentInputRef.current) {
      newCommentInputRef.current.focus()
    }
  }, [newCommentPosition])

  const handleSlideClick = (e: React.MouseEvent) => {
    if (!isCommenting) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setNewCommentPosition({ x, y })
    setActiveComment(null)
  }

  const handleAddComment = () => {
    if (!newCommentContent.trim() || !newCommentPosition || !currentUser) return
    
    addComment({
      userId: currentUser.id,
      userName: currentUser.name,
      content: newCommentContent.trim(),
      slideId,
      position: newCommentPosition,
      resolved: false
    })
    
    setNewCommentContent('')
    setNewCommentPosition(null)
    setIsCommenting(false)
  }

  const handleCommentClick = (comment: Comment) => {
    setActiveComment(activeComment?.id === comment.id ? null : comment)
    setNewCommentPosition(null)
  }

  const handleResolve = (commentId: string) => {
    resolveComment(commentId)
    setActiveComment(null)
  }

  const handleDelete = (commentId: string) => {
    deleteComment(commentId)
    setActiveComment(null)
  }

  const handleReply = (commentId: string, content: string) => {
    replyToComment(commentId, content)
  }

  return (
    <div className="relative">
      {/* Toggle comment mode button */}
      <button
        onClick={() => {
          setIsCommenting(!isCommenting)
          setActiveComment(null)
          setNewCommentPosition(null)
        }}
        className={`fixed top-20 right-6 z-40 p-3 rounded-full shadow-lg transition-all ${
          isCommenting 
            ? 'bg-blue-500 text-white' 
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        title={isCommenting ? 'Exit comment mode' : 'Add comments'}
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Main content with click handler for comments */}
      <div
        className={`relative ${isCommenting ? 'cursor-crosshair' : ''}`}
        onClick={handleSlideClick}
      >
        {children}
      </div>

      {/* Comment markers */}
      <AnimatePresence>
        {slideComments.map(comment => (
          <CommentMarker
            key={comment.id}
            comment={comment}
            onClick={() => handleCommentClick(comment)}
            isActive={activeComment?.id === comment.id}
          />
        ))}
      </AnimatePresence>

      {/* New comment input */}
      <AnimatePresence>
        {newCommentPosition && (
          <motion.div
            className="absolute z-30 w-80 bg-white rounded-lg shadow-xl border border-gray-200"
            style={{
              left: Math.min(newCommentPosition.x + 20, window.innerWidth - 320),
              top: Math.min(newCommentPosition.y, window.innerHeight - 200)
            }}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
          >
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                {currentUser && (
                  <UserAvatar user={currentUser} size="sm" />
                )}
                <span className="font-medium text-sm">Add a comment</span>
              </div>
              <textarea
                ref={newCommentInputRef}
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="What would you like to discuss?"
                className="w-full p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleAddComment()
                  }
                }}
              />
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  onClick={() => {
                    setNewCommentPosition(null)
                    setNewCommentContent('')
                  }}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={!newCommentContent.trim()}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active comment thread */}
      <AnimatePresence>
        {activeComment && (
          <CommentThread
            comment={activeComment}
            position={activeComment.position}
            onClose={() => setActiveComment(null)}
            onResolve={() => handleResolve(activeComment.id)}
            onDelete={() => handleDelete(activeComment.id)}
            onReply={(content) => handleReply(activeComment.id, content)}
          />
        )}
      </AnimatePresence>

      {/* Comment mode indicator */}
      {isCommenting && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Click anywhere to add a comment
        </div>
      )}
    </div>
  )
}