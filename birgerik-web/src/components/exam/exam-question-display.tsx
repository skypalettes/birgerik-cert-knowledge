import type { QuestionWithChoices } from '@birgerik/types'
import { MarkdownRenderer } from '../shared/ui/markdown-renderer'
import { Badge } from '../shared/ui/badge'

interface ExamQuestionDisplayProps {
  question: QuestionWithChoices
  currentIndex: number
}

export function ExamQuestionDisplay({ question, currentIndex }: ExamQuestionDisplayProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold text-gray-400">問 {currentIndex + 1}</span>
        {question.is_multiple_choice && (
          <Badge variant="info">複数選択</Badge>
        )}
      </div>
      <MarkdownRenderer content={question.question_text} className="text-base" />
    </div>
  )
}
