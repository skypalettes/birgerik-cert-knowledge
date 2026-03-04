import { cn } from '@/lib/utils/cn'
import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'teal' | 'success' | 'warning' | 'danger' | 'info' | 'active' | 'inactive'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    teal: 'bg-teal-100 text-teal-600',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    active: 'bg-teal-100 text-teal-600',
    inactive: 'bg-gray-100 text-gray-500',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
