'use client'

import { useState } from 'react'
import { Button } from './button'
import { Loader2, ArrowRight } from 'lucide-react'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showArrow?: boolean
  progress?: number
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  variant = 'default',
  size = 'default',
  showArrow = false,
  progress,
  className = '',
  ...props
}: LoadingButtonProps) {
  const isDisabled = disabled || loading

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        disabled={isDisabled}
        className={`${className} ${loading ? 'relative overflow-hidden' : ''}`}
        {...props}
      >
        {loading && (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {loadingText || 'Processing...'}
          </>
        )}
        {!loading && (
          <>
            {children}
            {showArrow && <ArrowRight className="w-4 h-4 ml-2" />}
          </>
        )}
      </Button>
      
      {/* Progress bar overlay */}
      {loading && typeof progress === 'number' && (
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
             style={{ width: `${Math.max(progress, 5)}%` }}>
        </div>
      )}
    </div>
  )
}

export default LoadingButton