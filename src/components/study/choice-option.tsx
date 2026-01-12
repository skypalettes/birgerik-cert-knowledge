'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { MarkdownRenderer } from '@/components/shared/ui/markdown-renderer'

interface ChoiceOptionProps {
  choiceText: string
  isSelected: boolean
  isCorrect?: boolean
  isSubmitted: boolean
  isMultipleChoice: boolean
  onSelect: () => void
}

export function ChoiceOption({
  choiceText,
  isSelected,
  isCorrect,
  isSubmitted,
  isMultipleChoice,
  onSelect,
}: ChoiceOptionProps) {
  // 正解/不正解の判定
  const showResult = isSubmitted
  const isCorrectAnswer = showResult && isCorrect
  const isWrongAnswer = showResult && isSelected && !isCorrect
  const isCorrectButNotSelected = showResult && !isSelected && isCorrect
  
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={isSubmitted}
      whileHover={!isSubmitted ? { scale: 1.02 } : {}}
      whileTap={!isSubmitted ? { scale: 0.98 } : {}}
      className={cn(
        'w-full text-left p-4 rounded-lg border-2 transition-all',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        // 未提出時のスタイル
        !isSubmitted && !isSelected && 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50',
        !isSubmitted && isSelected && 'border-blue-500 bg-blue-50',
        // 提出後のスタイル
        isCorrectAnswer && 'border-green-500 bg-green-50',
        isWrongAnswer && 'border-red-500 bg-red-50',
        isCorrectButNotSelected && 'border-green-300 bg-green-50/50',
        isSubmitted && !isCorrectAnswer && !isWrongAnswer && !isCorrectButNotSelected && 'border-gray-200 bg-gray-50',
        // 無効化時
        isSubmitted && 'cursor-not-allowed'
      )}
    >
      <div className="flex items-start space-x-3">
        {/* チェックボックス/ラジオボタン */}
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={cn(
              'w-6 h-6 rounded flex items-center justify-center border-2 transition-all',
              // 形状
              isMultipleChoice ? 'rounded-md' : 'rounded-full',
              // 未提出時
              !isSubmitted && !isSelected && 'border-gray-300 bg-white',
              !isSubmitted && isSelected && 'border-blue-500 bg-blue-500',
              // 提出後
              isCorrectAnswer && 'border-green-500 bg-green-500',
              isWrongAnswer && 'border-red-500 bg-red-500',
              isCorrectButNotSelected && 'border-green-500 bg-green-500',
              isSubmitted && !isCorrectAnswer && !isWrongAnswer && !isCorrectButNotSelected && 'border-gray-300 bg-white'
            )}
          >
            {/* チェックマーク */}
            {(isSelected && !isSubmitted) || isCorrectAnswer || isCorrectButNotSelected ? (
              <Check className="h-4 w-4 text-white" strokeWidth={3} />
            ) : null}
            
            {/* バツマーク */}
            {isWrongAnswer && (
              <X className="h-4 w-4 text-white" strokeWidth={3} />
            )}
          </div>
        </div>
        
        {/* 選択肢テキスト */}
        <div
          className={cn(
            'flex-1 prose prose-sm max-w-none',
            isCorrectAnswer && 'text-green-900',
            isWrongAnswer && 'text-red-900',
            isCorrectButNotSelected && 'text-green-800',
            !showResult && 'text-gray-900'
          )}
        >
          <MarkdownRenderer content={choiceText} />
        </div>
        
        {/* 正解ラベル */}
        {isCorrectButNotSelected && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
              正解
            </span>
          </div>
        )}
      </div>
    </motion.button>
  )
}