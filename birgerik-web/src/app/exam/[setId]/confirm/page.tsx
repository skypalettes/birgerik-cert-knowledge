export const dynamic = 'force-dynamic'

import { getQuestionSetDetail, getExamConfig } from '@/lib/api/client'
import { ExamConfirm } from '@/components/exam/exam-confirm'
import { CyberHeader } from '@/components/shared/cyber-header'
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
    <>
      <CyberHeader active="exam" />
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link
          href="/exam"
          className="inline-flex items-center gap-1 text-sm font-mono text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          試験選択に戻る
        </Link>
      </div>
      <ExamConfirm questionSet={qsResult.question_set} examConfig={examResult.exam} />
    </>
  )
}
