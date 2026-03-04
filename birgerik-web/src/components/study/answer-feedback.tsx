'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { MarkdownRenderer } from '../shared/ui/markdown-renderer'
import { Button } from '../shared/ui/button'

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
    <div
      className={`rounded-xl border-2 p-4 ${
        isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {isCorrect ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        <span
          className={`font-bold text-sm ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}
        >
          {isCorrect ? '正解！' : '不正解'}
        </span>
      </div>
      {explanation && (
        <>
          <Button variant="ghost" size="sm" onClick={onToggleExplanation} className="text-xs mt-1">
            {showExplanation ? '解説を隠す' : '解説を見る'}
          </Button>
          {showExplanation && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <MarkdownRenderer content={explanation} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
