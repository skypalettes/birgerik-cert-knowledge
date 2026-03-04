import type { QuestionWithChoices } from '@birgerik/types'
import { MarkdownRenderer } from '../shared/ui/markdown-renderer'
import { Badge } from '../shared/ui/badge'

interface QuestionDisplayProps {
  question: QuestionWithChoices
  index?: number
}

export function QuestionDisplay({ question, index }: QuestionDisplayProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-teal-50 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {index !== undefined && (
          <span className="text-xs font-bold text-gray-400">Q{index + 1}</span>
        )}
        {question.is_multiple_choice && (
          <Badge variant="info">複数選択</Badge>
        )}
      </div>
      <MarkdownRenderer content={question.question_text} className="text-base" />
    </div>
  )
}
