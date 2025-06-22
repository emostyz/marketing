'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCollaboration } from './CollaborationProvider'

interface UserCursorProps {
  user: {
    id: string
    name: string
    color: string
    cursor?: { x: number, y: number }
  }
}

const UserCursor: React.FC<UserCursorProps> = ({ user }) => {
  if (!user.cursor) return null

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        left: user.cursor.x,
        top: user.cursor.y,
        color: user.color
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Cursor */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M2 2L18 8L8 12L2 18V2Z"
          fill={user.color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      
      {/* User name label */}
      <div
        className="absolute top-5 left-2 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap"
        style={{ backgroundColor: user.color }}
      >
        {user.name}
      </div>
    </motion.div>
  )
}

interface UserAvatarProps {
  user: {
    id: string
    name: string
    avatar?: string
    color: string
  }
  size?: 'sm' | 'md' | 'lg'
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium border-2 border-white`}
      style={{ backgroundColor: user.color }}
      title={user.name}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  )
}

export const UserPresence: React.FC = () => {
  const { users, currentUser } = useCollaboration()

  const otherUsers = users.filter(u => u.id !== currentUser?.id)

  return (
    <>
      {/* User cursors */}
      <AnimatePresence>
        {otherUsers.map(user => (
          <UserCursor key={user.id} user={user} />
        ))}
      </AnimatePresence>

      {/* User list in header */}
      <div className="flex items-center space-x-2">
        <AnimatePresence>
          {otherUsers.slice(0, 5).map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.5, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <UserAvatar user={user} size="sm" />
            </motion.div>
          ))}
        </AnimatePresence>

        {otherUsers.length > 5 && (
          <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs text-white font-medium border-2 border-white">
            +{otherUsers.length - 5}
          </div>
        )}

        {otherUsers.length > 0 && (
          <div className="h-4 w-px bg-gray-300 mx-2" />
        )}

        {currentUser && (
          <div className="flex items-center space-x-2">
            <UserAvatar user={currentUser} size="sm" />
            <span className="text-sm text-gray-600">You</span>
          </div>
        )}
      </div>
    </>
  )
}

interface ConnectionStatusProps {
  className?: string
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { isConnected } = useCollaboration()

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-xs text-gray-500">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  )
}