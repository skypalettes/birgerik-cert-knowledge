import type { QuestionSetSummary } from '@birgerik/types'
import { Card } from '../shared/ui/card'
import { Badge } from '../shared/ui/badge'
import { FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface QuestionSetCardProps {
  certId: string
  questionSet: QuestionSetSummary
}

export function QuestionSetCard({ certId, questionSet }: QuestionSetCardProps) {
  return (
    <Link href={`/study/${certId}/${questionSet.id}/mode-select`}>
      <Card className="p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            {questionSet.has_exam && <Badge variant="warning">試験あり</Badge>}
            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-teal-400 transition-colors" />
          </div>
        </div>
        <h2 className="font-bold text-lg mb-1 text-gray-800">{questionSet.name}</h2>
        {questionSet.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{questionSet.description}</p>
        )}
        <Badge variant="teal">{questionSet.question_count} 問</Badge>
      </Card>
    </Link>
  )
}
