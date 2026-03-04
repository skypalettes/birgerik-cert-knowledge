import type { CertificationWithQuestionSets } from '@birgerik/types'
import { Card } from '../shared/ui/card'
import { Badge } from '../shared/ui/badge'
import { BookOpen, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface CertificationCardProps {
  certification: CertificationWithQuestionSets
}

export function CertificationCard({ certification }: CertificationCardProps) {
  const totalQuestions = certification.question_sets.reduce(
    (sum, qs) => sum + qs.question_count,
    0
  )
  const activeSetCount = certification.question_sets.filter((qs) => qs.is_active).length

  return (
    <Link href={`/study/${certification.id}`}>
      <Card className="p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-teal-50 rounded-xl">
            <BookOpen className="h-6 w-6 text-teal-500" />
          </div>
          <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-teal-400 transition-colors" />
        </div>
        <h2 className="font-bold text-lg mb-1 text-gray-800">{certification.name}</h2>
        {certification.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{certification.description}</p>
        )}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="teal">{activeSetCount} 問題集</Badge>
          <Badge variant="default">{totalQuestions} 問</Badge>
        </div>
      </Card>
    </Link>
  )
}
