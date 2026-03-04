'use client'

import type { Choice } from '@birgerik/types'
import { CheckCircle, XCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ChoiceOptionProps {
  choice: Choice
  isSelected: boolean
  isSubmitted: boolean
  onToggle: () => void
}

export function ChoiceOption({ choice, isSelected, isSubmitted, onToggle }: ChoiceOptionProps) {
  const getStyles = () => {
    if (!isSubmitted) {
      return isSelected
        ? 'border-teal-400 bg-teal-50 text-teal-700'
        : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 text-gray-700'
    }
    if (choice.is_correct) {
      return 'border-emerald-400 bg-emerald-50 text-emerald-700'
    }
    if (isSelected && !choice.is_correct) {
      return 'border-red-400 bg-red-50 text-red-700'
    }
    return 'border-gray-200 bg-gray-50 text-gray-400'
  }

  const getIcon = () => {
    if (!isSubmitted) {
      return isSelected ? (
        <CheckCircle className="h-5 w-5 text-teal-500" />
      ) : (
        <Circle className="h-5 w-5 text-gray-300" />
      )
    }
    if (choice.is_correct) return <CheckCircle className="h-5 w-5 text-emerald-500" />
    if (isSelected) return <XCircle className="h-5 w-5 text-red-500" />
    return <Circle className="h-5 w-5 text-gray-300" />
  }

  return (
    <button
      onClick={onToggle}
      disabled={isSubmitted}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200',
        getStyles()
      )}
    >
      <span className="flex-shrink-0 mt-0.5">{getIcon()}</span>
      <span className="text-sm leading-relaxed">{choice.choice_text}</span>
    </button>
  )
}
