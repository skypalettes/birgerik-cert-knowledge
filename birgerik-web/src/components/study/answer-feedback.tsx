'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { MarkdownRenderer } from '../shared/ui/markdown-renderer'

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
      className={`glass-panel rounded-xl p-5 mb-6 ${
        isCorrect ? 'border-emerald-500/60 shadow-neon-emerald' : 'border-red-500/60'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {isCorrect ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        ) : (
          <XCircle className="h-5 w-5 text-red-400" />
        )}
        <span
          className={`font-mono font-bold text-sm tracking-wide ${
            isCorrect ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {isCorrect ? 'CORRECT' : 'INCORRECT'}
        </span>
      </div>
      {explanation && (
        <>
          <button
            onClick={onToggleExplanation}
            className="font-mono text-xs text-cyan-400 hover:text-cyan-300 transition-colors mt-1"
          >
            {showExplanation ? '[ - ] 解説を隠す' : '[ + ] 解説を見る'}
          </button>
          {showExplanation && (
            <div className="mt-3 pt-3 border-t border-cyan-900/50">
              <MarkdownRenderer content={explanation} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
