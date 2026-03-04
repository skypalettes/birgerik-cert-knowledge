import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-bold text-gray-700">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'block w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-800',
            'placeholder:text-gray-400',
            'focus:border-teal-300 focus:bg-white focus:outline-none focus:ring-0',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'min-h-[100px] resize-y',
            'transition-colors duration-200',
            error && 'border-red-300 bg-red-50/30 focus:border-red-400',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
