'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExamStore } from '@/store/exam-store'
import { getQuestions } from '@/lib/api/client'
import type { QuestionSetDetail, ExamConfig } from '@birgerik/types'
import { Clock, Target, FileQuestion } from 'lucide-react'

type Props = { questionSet: QuestionSetDetail; examConfig: ExamConfig }

export function ExamConfirm({ questionSet, examConfig }: Props) {
  const router = useRouter()
  const store = useExamStore()
  const [isLoading, setIsLoading] = useState(false)

  // 試験確認画面に入った時点で、前回の未完了セッション（タイマー稼働中など）が
  // 残っていれば安全に破棄する。これにより試験を必ず最初からやり直せる。
  useEffect(() => {
    const { isSessionActive, isFinished, abandonExam } = useExamStore.getState()
    if (isSessionActive && !isFinished) {
      abandonExam()
    }
    // マウント時に一度だけ実行（store.getState() 参照のため依存なし）
  }, [])

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
      <div className="mb-8 border-l-4 border-cyan-400 pl-6">
        <h1 className="text-2xl font-serif font-bold text-slate-100">{questionSet.name}</h1>
        <p className="text-sm text-cyan-400 font-mono mt-1">{questionSet.certification_name}</p>
      </div>

      <div className="glass-panel cyber-corners rounded-xl p-6 space-y-4 mb-8">
        <InfoRow
          icon={<FileQuestion className="h-5 w-5 text-cyan-400" />}
          label="出題数"
          value={`${examConfig.question_count} 問`}
        />
        <InfoRow
          icon={<Clock className="h-5 w-5 text-fuchsia-400" />}
          label="制限時間"
          value={`${examConfig.time_limit_minutes} 分`}
        />
        <InfoRow
          icon={<Target className="h-5 w-5 text-emerald-400" />}
          label="合格ライン"
          value={`${examConfig.passing_score}%`}
        />
      </div>

      <div className="text-sm text-slate-400 font-serif mb-8 space-y-2 glass-panel rounded-xl p-4">
        <p>・問題はランダムに出題されます</p>
        <p>・解答中はフィードバック・解説は表示されません</p>
        <p>・時間切れになると自動的に採点されます</p>
      </div>

      <button
        onClick={handleStart}
        disabled={isLoading}
        className="group w-full font-mono font-bold text-lg px-8 py-4 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-500 hover:bg-cyan-500 hover:text-cyber-bg hover:shadow-neon-cyan transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
      >
        {isLoading ? 'INITIALIZING...' : 'INITIATE EXAM'}{' '}
        <span className="inline-block group-hover:translate-x-1 transition-transform">&gt;&gt;</span>
      </button>
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
      <div className="flex items-center gap-2 text-slate-300">
        {icon}
        <span className="text-sm font-serif">{label}</span>
      </div>
      <span className="font-mono font-bold text-lg text-cyan-300">{value}</span>
    </div>
  )
}
