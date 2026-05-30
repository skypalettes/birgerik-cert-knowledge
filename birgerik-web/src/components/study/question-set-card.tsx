'use client'

import type { QuestionSetSummary } from '@birgerik/types'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useStudyStore } from '@/store/study-store'

interface QuestionSetCardProps {
  certId: string
  questionSet: QuestionSetSummary
}

export function QuestionSetCard({ certId, questionSet }: QuestionSetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/study/${certId}/${questionSet.id}/practice`}
        // 新規にクイズを開始する際は古い永続化セッションを明示的に破棄する。
        // これにより F5 更新では状態維持、カードからの入り直しでは問1からリロードされる。
        onClick={() => useStudyStore.getState().endSession()}
        className="block text-left glass-panel rounded-xl p-6 transition-all hover:-translate-y-2 hover:shadow-neon-cyan group relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg text-slate-100 group-hover:text-cyan-300 transition-colors font-serif">
            {questionSet.name}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {questionSet.has_exam && (
              <span className="font-mono text-xs text-amber-300 bg-amber-950/60 border border-amber-700 px-2 py-1 rounded">
                EXAM
              </span>
            )}
            <span className="font-mono text-xs text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-1 rounded whitespace-nowrap">
              {questionSet.question_count} Qs
            </span>
          </div>
        </div>
        {questionSet.description && (
          <p className="text-sm text-slate-400 line-clamp-3 font-serif">{questionSet.description}</p>
        )}
      </Link>
    </motion.div>
  )
}
