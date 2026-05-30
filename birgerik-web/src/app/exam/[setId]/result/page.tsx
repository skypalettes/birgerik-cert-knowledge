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
        <p className="text-slate-400 font-mono">試験結果が見つかりません</p>
        <Link href="/exam">
          <Button variant="secondary">試験選択へ</Button>
        </Link>
      </div>
    )
  }

  const durationMin = Math.floor(result.duration / 60000)
  const durationSec = Math.floor((result.duration % 60000) / 1000)

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* 合否バナー */}
        <div
          className={`glass-panel cyber-corners rounded-xl p-8 text-center mb-8 ${
            result.passed ? 'border-emerald-500/60 shadow-neon-emerald' : 'border-red-500/60'
          }`}
        >
          <div className="text-6xl mb-3">{result.passed ? '🎉' : '😢'}</div>
          <div
            className={`text-4xl font-mono font-black mb-1 tracking-wide ${
              result.passed ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {result.passed ? 'PASSED' : 'FAILED'}
          </div>
          <div className="text-slate-400 font-mono text-sm">
            {result.accuracy}% / 合格ライン {result.passingScore}%
          </div>
        </div>

        {/* スコア詳細 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-panel rounded-xl p-4 text-center">
            <div className="text-3xl font-mono font-bold text-cyan-300">{result.accuracy}%</div>
            <div className="text-xs text-slate-400 mt-1 font-mono tracking-wide">ACCURACY</div>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center">
            <div className="text-3xl font-mono font-bold text-emerald-400">
              {result.correctCount}/{result.totalQuestions}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono tracking-wide">CORRECT</div>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center">
            <div className="text-3xl font-mono font-bold text-fuchsia-400">
              {durationMin}:{String(durationSec).padStart(2, '0')}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono tracking-wide">TIME</div>
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
