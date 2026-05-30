import type { QuestionWithChoices } from '@birgerik/types'
import { MarkdownRenderer } from './ui/markdown-renderer'
import { CheckCircle, XCircle } from 'lucide-react'

interface WrongQuestionsListProps {
  questions: QuestionWithChoices[]
}

export function WrongQuestionsList({ questions }: WrongQuestionsListProps) {
  if (questions.length === 0) return null

  return (
    <div className="text-left mt-8">
      <h2 className="text-lg font-mono font-bold mb-4 text-fuchsia-400 tracking-wide">
        ERROR LOG — 間違えた問題（{questions.length}問）
      </h2>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="glass-panel rounded-xl overflow-hidden border-red-500/40">
            <div className="px-4 py-3 bg-red-950/40 border-b border-red-900/50">
              <span className="text-sm font-mono font-bold text-red-300">問題 {i + 1}</span>
            </div>
            <div className="p-4">
              <MarkdownRenderer content={q.question_text} className="mb-3" />
              <div className="space-y-1.5">
                {q.choices.map((choice) => (
                  <div
                    key={choice.id}
                    className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${
                      choice.is_correct
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                        : 'bg-slate-800/40 text-slate-500'
                    }`}
                  >
                    {choice.is_correct ? (
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-600" />
                    )}
                    <span>{choice.choice_text}</span>
                  </div>
                ))}
              </div>
              {q.explanation && (
                <div className="mt-3 pt-3 border-t border-cyan-900/50">
                  <div className="text-xs font-mono font-semibold text-cyan-500 mb-1">解説</div>
                  <MarkdownRenderer content={q.explanation} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
