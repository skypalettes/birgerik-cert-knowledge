'use client'

import type { Choice } from '@birgerik/types'
import { cn } from '@/lib/utils/cn'

interface ExamChoiceOptionProps {
  choice: Choice
  isSelected: boolean
  /** 複数選択（四角/マゼンタ）か単一選択（円/エメラルド）か */
  isMultiple: boolean
  onToggle: () => void
}

export function ExamChoiceOption({
  choice,
  isSelected,
  isMultiple,
  onToggle,
}: ExamChoiceOptionProps) {
  const containerStyles = isSelected
    ? isMultiple
      ? 'border-fuchsia-500 bg-fuchsia-900/20 shadow-neon-magenta'
      : 'border-emerald-500 bg-emerald-900/20 shadow-neon-emerald'
    : 'border-slate-700 hover:border-slate-400 hover:bg-slate-800/50'

  const borderColor = isSelected
    ? isMultiple
      ? 'border-fuchsia-400'
      : 'border-emerald-400'
    : 'border-slate-500 group-hover:border-slate-300'

  const filledColor = isMultiple ? 'bg-fuchsia-500' : 'bg-emerald-500'

  return (
    <button
      onClick={onToggle}
      className={cn(
        'group w-full glass-panel rounded-lg p-5 flex items-center gap-5 text-left transition-all duration-300',
        containerStyles
      )}
    >
      <span
        className={cn(
          'relative w-6 h-6 border-2 flex items-center justify-center shrink-0 transition-all duration-300',
          isMultiple ? 'rounded-none' : 'rounded-full',
          borderColor
        )}
      >
        <span
          className={cn(
            'absolute inset-0.5 transition-transform duration-200 ease-out',
            isMultiple ? 'rounded-none' : 'rounded-full',
            filledColor,
            isSelected ? 'scale-100' : 'scale-0'
          )}
        />
      </span>
      <span className="text-base text-slate-300">{choice.choice_text}</span>
    </button>
  )
}
