'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExamStore } from '@/store/exam-store'
import { getQuestions } from '@/lib/api/client'
import type { QuestionSetDetail, ExamConfig } from '@birgerik/types'
import { Button } from '../shared/ui/button'
import { Clock, Target, FileQuestion } from 'lucide-react'

type Props = { questionSet: QuestionSetDetail; examConfig: ExamConfig }

export function ExamConfirm({ questionSet, examConfig }: Props) {
  const router = useRouter()
  const store = useExamStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = async () => {
    setIsLoading(true)
    try {
      const { questions } = await getQuestions(questionSet.id)
      store.startExam({
        examConfig,
        questionSetName: questionSet.name,
        certificationName: questionSet.certification_name,
        questions,
      })
      router.push(`/exam/${questionSet.id}/session`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">{questionSet.name}</h1>
      <p className="text-sm text-gray-500 mb-8">{questionSet.certification_name}</p>

      <div className="bg-white border-2 border-teal-50 rounded-2xl p-6 space-y-4 mb-8 shadow-sm">
        <InfoRow
          icon={<FileQuestion className="h-5 w-5 text-teal-500" />}
          label="出題数"
          value={`${examConfig.question_count} 問`}
        />
        <InfoRow
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          label="制限時間"
          value={`${examConfig.time_limit_minutes} 分`}
        />
        <InfoRow
          icon={<Target className="h-5 w-5 text-amber-500" />}
          label="合格ライン"
          value={`${examConfig.passing_score}%`}
        />
      </div>

      <div className="text-sm text-gray-500 mb-8 space-y-2 bg-gray-50 rounded-xl p-4">
        <p>・問題はランダムに出題されます</p>
        <p>・解答中はフィードバック・解説は表示されません</p>
        <p>・時間切れになると自動的に採点されます</p>
      </div>

      <Button
        onClick={handleStart}
        isLoading={isLoading}
        size="lg"
        className="w-full text-lg"
      >
        試験を開始する
      </Button>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-bold text-lg text-gray-800">{value}</span>
    </div>
  )
}
