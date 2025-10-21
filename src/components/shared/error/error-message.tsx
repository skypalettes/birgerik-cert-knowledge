import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ErrorMessageProps {
  title?: string
  message: string
  className?: string
}

export function ErrorMessage({ 
  title = 'エラー', 
  message, 
  className 
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4',
        className
      )}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  )
}