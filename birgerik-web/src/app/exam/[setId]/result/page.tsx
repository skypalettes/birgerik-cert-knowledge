'use client'

import { use } from 'react'
import { useExamStore } from '@/store/exam-store'
import { ExamResultDetail } from '@/components/exam/exam-result-detail'
import { Button } from '@/components/shared/ui/button'
import Link from 'next/link'

type Props = { params: Promise<{ setId: string }> }

export default function ExamResultPage({ params }: Props) {
  const { setId } = use(params)
  const store = useExamStore()
  const result = store.getExamResult()

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500">試験結果が見つかりません</p>
        <Link href="/exam">
          <Button variant="secondary">試験選択へ</Button>
        </Link>
      </div>
    )
  }

  const durationMin = Math.floor(result.duration / 60000)
  const durationSec = Math.floor((result.duration % 60000) / 1000)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* 合否バナー */}
        <div
          className={`rounded-2xl p-8 text-center mb-8 ${
            result.passed ? 'bg-emerald-50 border-2 border-emerald-100' : 'bg-red-50 border-2 border-red-100'
          }`}
        >
          <div className="text-6xl mb-3">{result.passed ? '🎉' : '😢'}</div>
          <div
            className={`text-4xl font-black mb-1 ${
              result.passed ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {result.passed ? '合格' : '不合格'}
          </div>
          <div className="text-gray-500">
            {result.accuracy}% / 合格ライン {result.passingScore}%
          </div>
        </div>

        {/* スコア詳細 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border-2 border-teal-50 rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{result.accuracy}%</div>
            <div className="text-sm text-gray-500 mt-1">正答率</div>
          </div>
          <div className="bg-white border-2 border-teal-50 rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-800">
              {result.correctCount}/{result.totalQuestions}
            </div>
            <div className="text-sm text-gray-500 mt-1">正解数</div>
          </div>
          <div className="bg-white border-2 border-teal-50 rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-800">
              {durationMin}:{String(durationSec).padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-500 mt-1">所要時間</div>
          </div>
        </div>

        {/* 間違えた問題詳細 */}
        <ExamResultDetail incorrectQuestions={result.incorrectQuestions} />

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link href={`/exam/${setId}/confirm`} className="flex-1">
            <Button variant="primary" className="w-full">
              もう一度挑戦
            </Button>
          </Link>
          <Link href="/exam" className="flex-1">
            <Button variant="outline" className="w-full">
              試験選択へ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
