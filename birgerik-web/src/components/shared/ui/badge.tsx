import { cn } from '@/lib/utils/cn'
import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'teal' | 'success' | 'warning' | 'danger' | 'info' | 'active' | 'inactive'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800/80 text-slate-300 border border-slate-600',
    teal: 'bg-cyan-950/80 text-cyan-300 border border-cyan-800',
    success: 'bg-emerald-950/60 text-emerald-300 border border-emerald-700',
    warning: 'bg-amber-950/60 text-amber-300 border border-amber-700',
    danger: 'bg-red-950/60 text-red-300 border border-red-700',
    info: 'bg-fuchsia-950/50 text-fuchsia-300 border border-fuchsia-700',
    active: 'bg-cyan-950/80 text-cyan-300 border border-cyan-800',
    inactive: 'bg-slate-800/80 text-slate-500 border border-slate-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
