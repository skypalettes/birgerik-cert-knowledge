'use client'

import { use } from 'react'
import { useStudyStore } from '@/store/study-store'
import { WrongQuestionsList } from '@/components/shared/wrong-questions-list'
import { ProgressCircle } from '@/components/shared/ui/progress-circle'
import { Button } from '@/components/shared/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Props = { params: Promise<{ certId: string; setId: string }> }

export default function ResultPage({ params }: Props) {
  const { certId, setId } = use(params)
  const store = useStudyStore()
  const router = useRouter()
  const score = store.getScore()
  const wrongQuestions = store.getWrongQuestions()
  const modeLabel =
    store.mode === 'random' ? 'ランダム' : store.mode === 'review' ? '復習' : '順番'

  const handleReview = () => {
    store.startReviewSession()
    router.push(`/study/${certId}/${setId}/practice?mode=review`)
  }

  const handleRetry = () => {
    router.push(`/study/${certId}/${setId}/mode-select`)
  }

  const getMessage = () => {
    if (score.percentage >= 80) return '素晴らしい！'
    if (score.percentage >= 60) return 'よくできました！'
    return 'もう少し頑張ろう！'
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="text-5xl mb-4">🏆</div>
      <h1 className="text-3xl font-bold mb-2 text-gray-800">{getMessage()}</h1>
      <p className="text-gray-500 mb-8">
        {store.questionSetName} — {modeLabel}モード
      </p>

      <div className="flex justify-center mb-8">
        <ProgressCircle percentage={score.percentage} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white border-2 border-teal-50 rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{score.percentage}%</div>
          <div className="text-sm text-gray-500 mt-1">正答率</div>
        </div>
        <div className="bg-white border-2 border-teal-50 rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-gray-800">
            {score.correct}/{score.total}
          </div>
          <div className="text-sm text-gray-500 mt-1">正解数</div>
        </div>
        <div className="bg-white border-2 border-teal-50 rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{modeLabel}</div>
          <div className="text-sm text-gray-500 mt-1">モード</div>
        </div>
      </div>

      <WrongQuestionsList questions={wrongQuestions} />

      <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
        {wrongQuestions.length > 0 && (
          <Button onClick={handleReview} variant="primary">
            間違えた問題を復習
          </Button>
        )}
        <Button onClick={handleRetry} variant="secondary">
          もう一度挑戦
        </Button>
        <Link href="/study">
          <Button variant="outline">学習トップへ</Button>
        </Link>
      </div>
    </div>
  )
}
