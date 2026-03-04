import type { QuestionSetSummary } from '@birgerik/types'
import { Card } from '../shared/ui/card'
import { Badge } from '../shared/ui/badge'
import { ClipboardList, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface ExamCardProps {
  questionSet: QuestionSetSummary & { certificationName: string }
}

export function ExamCard({ questionSet }: ExamCardProps) {
  return (
    <Link href={`/exam/${questionSet.id}/confirm`}>
      <Card className="p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-amber-50 rounded-xl">
            <ClipboardList className="h-6 w-6 text-amber-500" />
          </div>
          <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-teal-400 transition-colors" />
        </div>
        <div className="text-xs text-gray-400 mb-1">{questionSet.certificationName}</div>
        <h2 className="font-bold text-lg mb-1 text-gray-800">{questionSet.name}</h2>
        {questionSet.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{questionSet.description}</p>
        )}
        <Badge variant="teal">{questionSet.question_count} 問</Badge>
      </Card>
    </Link>
  )
}
