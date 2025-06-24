import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles
  `
  inline-flex items-center justify-center rounded-md font-medium
  transition-all duration-200 ease-out
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  disabled:pointer-events-none disabled:opacity-50
  select-none
  `,
  {
    variants: {
      variant: {
        primary: `
          bg-blue-600 text-white
          hover:bg-blue-700
          active:bg-blue-800
          focus-visible:ring-blue-600
        `,
        secondary: `
          bg-white border border-gray-300 text-gray-700
          hover:bg-gray-50 hover:border-gray-400
          active:bg-gray-100
          focus-visible:ring-blue-600
        `,
        ghost: `
          text-gray-700
          hover:bg-gray-100
          active:bg-gray-200
          focus-visible:ring-blue-600
        `,
        danger: `
          bg-red-50 text-red-700 border border-red-200
          hover:bg-red-600 hover:text-white hover:border-red-600
          active:opacity-90
          focus-visible:ring-red-600
        `,
        text: `
          text-blue-600
          hover:bg-blue-50
          active:bg-blue-100
          focus-visible:ring-blue-600
        `
      },
      size: {
        sm: 'h-8 px-3 text-sm gap-1.5',
        md: 'h-9 px-4 text-sm gap-2',
        lg: 'h-10 px-5 text-base gap-2',
        xl: 'h-12 px-6 text-base gap-2.5'
      },
      fullWidth: {
        true: 'w-full'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

interface ModernButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon}
        
        {children}
        
        {!isLoading && rightIcon}
      </motion.button>
    )
  }
)

ModernButton.displayName = 'ModernButton'