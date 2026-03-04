'use client'

import type { Choice } from '@birgerik/types'
import { CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ExamChoiceOptionProps {
  choice: Choice
  isSelected: boolean
  onToggle: () => void
}

export function ExamChoiceOption({ choice, isSelected, onToggle }: ExamChoiceOptionProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200',
        isSelected
          ? 'border-blue-400 bg-blue-50 text-blue-700'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 text-gray-700'
      )}
    >
      <span className="flex-shrink-0 mt-0.5">
        {isSelected ? (
          <CheckCircle className="h-5 w-5 text-blue-500" />
        ) : (
          <Circle className="h-5 w-5 text-gray-300" />
        )}
      </span>
      <span className="text-sm leading-relaxed">{choice.choice_text}</span>
    </button>
  )
}
