'use client'

import type { Choice } from '@birgerik/types'
import { cn } from '@/lib/utils/cn'

interface ChoiceOptionProps {
  choice: Choice
  isSelected: boolean
  isSubmitted: boolean
  /** 複数選択（チェックボックス=四角/マゼンタ）か単一選択（ラジオ=円/エメラルド）か */
  isMultiple: boolean
  onToggle: () => void
}

export function ChoiceOption({
  choice,
  isSelected,
  isSubmitted,
  isMultiple,
  onToggle,
}: ChoiceOptionProps) {
  // 回答前: 選択タイプごとのテーマカラー / 回答後: 正誤に応じた色
  const getContainerStyles = () => {
    if (!isSubmitted) {
      if (isSelected) {
        return isMultiple
          ? 'border-fuchsia-500 bg-fuchsia-900/20 shadow-neon-magenta'
          : 'border-emerald-500 bg-emerald-900/20 shadow-neon-emerald'
      }
      return 'border-slate-700 hover:border-slate-400 hover:bg-slate-800/50'
    }
    if (choice.is_correct) return 'border-emerald-500 bg-emerald-900/20 shadow-neon-emerald'
    if (isSelected) return 'border-red-500 bg-red-900/20'
    return 'border-slate-800 opacity-50'
  }

  // チェックインジケータ（四角 or 円）
  const showFilled = isSubmitted ? choice.is_correct || isSelected : isSelected
  const filledColor = isSubmitted
    ? choice.is_correct
      ? 'bg-emerald-500'
      : 'bg-red-500'
    : isMultiple
      ? 'bg-fuchsia-500'
      : 'bg-emerald-500'
  const borderColor = isSubmitted
    ? choice.is_correct
      ? 'border-emerald-400'
      : isSelected
        ? 'border-red-400'
        : 'border-slate-600'
    : isSelected
      ? isMultiple
        ? 'border-fuchsia-400'
        : 'border-emerald-400'
      : 'border-slate-500 group-hover:border-slate-300'

  return (
    <button
      onClick={onToggle}
      disabled={isSubmitted}
      className={cn(
        'group w-full glass-panel rounded-lg p-5 flex items-center gap-5 text-left transition-all duration-300',
        getContainerStyles()
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
            showFilled ? 'scale-100' : 'scale-0'
          )}
        />
      </span>
      <span className="text-base text-slate-300 group-disabled:text-slate-400">
        {choice.choice_text}
      </span>
    </button>
  )
}
