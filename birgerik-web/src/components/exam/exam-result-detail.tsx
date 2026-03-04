import type { QuestionWithChoices } from '@birgerik/types'
import { MarkdownRenderer } from '../shared/ui/markdown-renderer'
import { CheckCircle, XCircle } from 'lucide-react'

interface ExamResultDetailProps {
  incorrectQuestions: QuestionWithChoices[]
}

export function ExamResultDetail({ incorrectQuestions }: ExamResultDetailProps) {
  if (incorrectQuestions.length === 0) {
    return (
      <div className="text-center py-6 text-emerald-600 font-bold text-lg">
        🎯 全問正解です！
      </div>
    )
  }

  return (
    <div className="text-left">
      <h2 className="text-lg font-bold mb-4 text-gray-800">
        間違えた問題（{incorrectQuestions.length}問）
      </h2>
      <div className="space-y-6">
        {incorrectQuestions.map((q, i) => (
          <div key={q.id} className="border-2 border-red-100 rounded-2xl overflow-hidden">
            <div className="bg-red-50 px-4 py-3">
              <span className="text-sm font-bold text-red-700">問題 {i + 1}</span>
            </div>
            <div className="p-4">
              <MarkdownRenderer content={q.question_text} className="mb-4" />
              <div className="space-y-2">
                {q.choices.map((choice) => (
                  <div
                    key={choice.id}
                    className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${
                      choice.is_correct
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {choice.is_correct ? (
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-300" />
                    )}
                    <span>{choice.choice_text}</span>
                  </div>
                ))}
              </div>
              {q.explanation && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 mb-2">解説</div>
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
