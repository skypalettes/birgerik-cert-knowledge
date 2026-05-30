import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn('glass-panel rounded-xl overflow-hidden', className)}
    >
      {children}
    </div>
  )
}
