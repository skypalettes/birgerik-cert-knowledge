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
      'inline-flex items-center justify-center font-mono font-bold rounded transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'

    const variantStyles = {
      primary:
        'bg-cyan-900/40 text-cyan-300 border border-cyan-500 hover:bg-cyan-500 hover:text-cyber-bg hover:shadow-neon-cyan',
      secondary:
        'bg-slate-800/60 text-slate-200 border border-slate-600 hover:border-slate-400 hover:bg-slate-700/60',
      outline:
        'border border-cyan-700 bg-transparent text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-500',
      danger:
        'bg-red-900/40 text-red-300 border border-red-500 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]',
      ghost: 'bg-transparent text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20',
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
