import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border-2 border-teal-50 rounded-2xl shadow-sm overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  )
}
