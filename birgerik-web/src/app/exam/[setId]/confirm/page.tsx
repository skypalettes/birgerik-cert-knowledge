export const dynamic = 'force-dynamic'

import { getQuestionSetDetail, getExamConfig } from '@/lib/api/client'
import { ExamConfirm } from '@/components/exam/exam-confirm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

type Props = { params: Promise<{ setId: string }> }

export default async function ExamConfirmPage({ params }: Props) {
  const { setId } = await params
  const [qsResult, examResult] = await Promise.all([
    getQuestionSetDetail(setId).catch(() => null),
    getExamConfig(setId).catch(() => null),
  ])
  if (!qsResult || !examResult) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-teal-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <Link href="/exam" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            試験選択に戻る
          </Link>
        </div>
      </header>
      <ExamConfirm
        questionSet={qsResult.question_set}
        examConfig={examResult.exam}
      />
    </div>
  )
}
