import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 p-4 rounded-full border border-cyan-700 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-serif font-bold text-slate-200 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 font-serif mb-6 max-w-xs">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
