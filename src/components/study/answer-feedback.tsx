'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AnswerFeedbackProps {
  isCorrect: boolean
  explanation: string | null
  showExplanation: boolean
  onToggleExplanation: () => void
}

export function AnswerFeedback({
  isCorrect,
  explanation,
  showExplanation,
  onToggleExplanation,
}: AnswerFeedbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* 正解/不正解メッセージ */}
      <div
        className={cn(
          'rounded-xl p-6 border-2',
          isCorrect
            ? 'bg-green-50 border-green-300'
            : 'bg-red-50 border-red-300'
        )}
      >
        <div className="flex items-center space-x-3">
          {isCorrect ? (
            <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
          )}
          <div>
            <h3
              className={cn(
                'text-lg font-bold',
                isCorrect ? 'text-green-900' : 'text-red-900'
              )}
            >
              {isCorrect ? '正解です！' : '不正解です'}
            </h3>
            <p
              className={cn(
                'text-sm mt-1',
                isCorrect ? 'text-green-700' : 'text-red-700'
              )}
            >
              {isCorrect
                ? 'よくできました。次の問題に進みましょう。'
                : '解説を読んで理解を深めましょう。'}
            </p>
          </div>
        </div>
      </div>
      
      {/* 解説 */}
      {explanation && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={onToggleExplanation}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-sm">解</span>
              </div>
              <span className="font-semibold text-gray-900">解説を見る</span>
            </div>
            {showExplanation ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          {showExplanation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200"
            >
              <div
                className="px-6 py-4 prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: explanation }}
              />
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}