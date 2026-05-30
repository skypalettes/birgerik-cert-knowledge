import type { QuestionWithChoices } from '@birgerik/types'
import { MarkdownRenderer } from '../shared/ui/markdown-renderer'
import { CheckCircle, XCircle } from 'lucide-react'

interface ExamResultDetailProps {
  incorrectQuestions: QuestionWithChoices[]
}

export function ExamResultDetail({ incorrectQuestions }: ExamResultDetailProps) {
  if (incorrectQuestions.length === 0) {
    return (
      <div className="text-center py-6 text-emerald-400 font-mono font-bold text-lg drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
        🎯 全問正解です！
      </div>
    )
  }

  return (
    <div className="text-left">
      <h2 className="text-lg font-mono font-bold mb-4 text-fuchsia-400 tracking-wide">
        ERROR LOG — 間違えた問題（{incorrectQuestions.length}問）
      </h2>
      <div className="space-y-6">
        {incorrectQuestions.map((q, i) => (
          <div key={q.id} className="glass-panel rounded-xl overflow-hidden border-red-500/40">
            <div className="bg-red-950/40 border-b border-red-900/50 px-4 py-3">
              <span className="text-sm font-mono font-bold text-red-300">問題 {i + 1}</span>
            </div>
            <div className="p-4">
              <MarkdownRenderer content={q.question_text} className="mb-4" />
              <div className="space-y-2">
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
                <div className="mt-4 pt-4 border-t border-cyan-900/50">
                  <div className="text-xs font-mono font-semibold text-cyan-500 mb-2">解説</div>
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
