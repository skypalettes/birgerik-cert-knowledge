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
      <h2 className="text-lg font-bold mb-4 text-gray-800">
        間違えた問題（{questions.length}問）
      </h2>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-red-50 border-2 border-red-100 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 bg-red-100/50">
              <span className="text-sm font-bold text-red-700">問題 {i + 1}</span>
            </div>
            <div className="p-4">
              <MarkdownRenderer content={q.question_text} className="mb-3" />
              <div className="space-y-1.5">
                {q.choices.map((choice) => (
                  <div
                    key={choice.id}
                    className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${
                      choice.is_correct
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-white/60 text-gray-400'
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
                <div className="mt-3 pt-3 border-t border-red-100">
                  <div className="text-xs font-semibold text-gray-500 mb-1">解説</div>
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
