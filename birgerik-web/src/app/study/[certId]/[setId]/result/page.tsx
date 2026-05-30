'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
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

  const handleReview = () => {
    store.startReviewSession()
    router.push(`/study/${certId}/${setId}/practice`)
  }

  const handleRetry = () => {
    // 古いセッションを破棄してから practice を開き直し、問1からやり直す
    store.endSession()
    router.push(`/study/${certId}/${setId}/practice`)
  }

  const getMessage = () => {
    if (score.percentage >= 80) return 'KNOWLEDGE SYNCHRONIZED'
    if (score.percentage >= 60) return 'SYNC COMPLETE'
    return 'RESYNC REQUIRED'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto px-4 py-12 text-center"
    >
      <div className="font-mono text-xs text-cyan-500 tracking-[0.3em] mb-3 animate-flicker">
        {getMessage()}
      </div>
      <h1 className="text-3xl font-serif font-bold mb-2 text-slate-100 drop-shadow-[0_0_8px_rgba(0,255,255,0.3)]">
        実行結果
      </h1>
      <p className="text-slate-400 font-serif mb-8">
        {store.questionSetName}
        {store.isReviewSession && (
          <span className="ml-2 font-mono text-xs text-fuchsia-400">[ REVIEW ]</span>
        )}
      </p>

      <div className="flex justify-center mb-8">
        <ProgressCircle percentage={score.percentage} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="glass-panel rounded-xl p-4">
          <div className="text-3xl font-mono font-bold text-cyan-300">{score.percentage}%</div>
          <div className="text-xs text-slate-400 mt-1 font-mono tracking-wide">ACCURACY</div>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <div className="text-3xl font-mono font-bold text-emerald-400">
            {score.correct}/{score.total}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tracking-wide">CORRECT</div>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <div className="text-3xl font-mono font-bold text-fuchsia-400">
            {score.total - score.correct}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono tracking-wide">INCORRECT</div>
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
    </motion.div>
  )
}
