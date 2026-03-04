import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

    const variantStyles = {
      primary:
        'bg-teal-500 text-white hover:bg-teal-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-200 focus-visible:ring-teal-400',
      secondary:
        'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 focus-visible:ring-gray-400',
      outline:
        'border-2 border-teal-200 bg-transparent text-teal-600 hover:bg-teal-50 focus-visible:ring-teal-400',
      danger:
        'bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200 focus-visible:ring-red-400',
      ghost: 'bg-transparent hover:bg-teal-50 text-gray-500 hover:text-teal-600 focus-visible:ring-teal-400',
    }

    const sizeStyles = {
      sm: 'px-3.5 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
