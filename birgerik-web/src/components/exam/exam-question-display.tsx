import type { QuestionWithChoices } from '@birgerik/types'
import { MarkdownRenderer } from '../shared/ui/markdown-renderer'
import { ChoiceTypeBadge } from '../study/choice-type-badge'

interface ExamQuestionDisplayProps {
  question: QuestionWithChoices
  currentIndex: number
}

export function ExamQuestionDisplay({ question, currentIndex }: ExamQuestionDisplayProps) {
  return (
    <div className="glass-panel cyber-corners rounded-xl p-8 relative">
      <div className="absolute -top-3 left-4 bg-cyber-bg px-2">
        <ChoiceTypeBadge isMultiple={question.is_multiple_choice} />
      </div>
      <span className="font-mono text-xs text-cyan-600 absolute top-3 right-4">
        Q{String(currentIndex + 1).padStart(2, '0')}
      </span>
      <div className="font-serif text-lg leading-relaxed text-slate-100 mt-2">
        <MarkdownRenderer content={question.question_text} className="text-lg" />
      </div>
    </div>
  )
}
