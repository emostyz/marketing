'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { Textarea as BaseTextarea } from './textarea'

// TextInput component with Tremor-like API
interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string
  onValueChange?: (value: string) => void
  error?: boolean
  errorMessage?: string
  icon?: React.ElementType
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ value, onValueChange, error, errorMessage, icon: Icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <Input
            ref={ref}
            value={value}
            onChange={(e) => onValueChange?.(e.target.value)}
            className={cn(
              Icon && "pl-10",
              error && "border-red-500 focus-visible:border-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && errorMessage && (
          <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    )
  }
)
TextInput.displayName = 'TextInput'

// Textarea component with Tremor-like API
interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  value?: string
  onValueChange?: (value: string) => void
  error?: boolean
  errorMessage?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ value, onValueChange, error, errorMessage, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <BaseTextarea
          ref={ref}
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          className={cn(
            error && "border-red-500 focus-visible:border-red-500",
            className
          )}
          {...props}
        />
        {error && errorMessage && (
          <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// Toggle component (Switch)
interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const Toggle: React.FC<ToggleProps> = ({ 
  checked = false, 
  onChange, 
  disabled = false,
  className 
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-blue-600" : "bg-gray-200",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  )
}

// Select component with Tremor-like API
interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onValueChange, 
  children, 
  placeholder = "Select...",
  disabled = false,
  className 
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      disabled={disabled}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {placeholder && !value && (
        <option value="" disabled>{placeholder}</option>
      )}
      {children}
    </select>
  )
}

// SelectItem component
interface SelectItemProps {
  value: string
  children: React.ReactNode
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return <option value={value}>{children}</option>
}

// Metric component
interface MetricProps {
  title?: string
  value?: string
  children?: React.ReactNode
  className?: string
}

export const Metric: React.FC<MetricProps> = ({ title, value, children, className }) => {
  return (
    <div className={cn("", className)}>
      {title && (
        <p className="text-sm font-medium text-gray-500">{title}</p>
      )}
      <p className="text-3xl font-semibold text-gray-900">
        {value || children}
      </p>
    </div>
  )
}

// Text component
interface TextProps {
  children: React.ReactNode
  className?: string
}

export const Text: React.FC<TextProps> = ({ children, className }) => {
  return (
    <p className={cn("text-sm text-gray-700", className)}>
      {children}
    </p>
  )
}