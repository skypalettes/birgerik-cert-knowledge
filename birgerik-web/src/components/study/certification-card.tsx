'use client'

import type { CertificationWithQuestionSets } from '@birgerik/types'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface CertificationCardProps {
  certification: CertificationWithQuestionSets
  /** リスト内の表示順（出現アニメのstagger用） */
  index?: number
}

export function CertificationCard({ certification, index = 0 }: CertificationCardProps) {
  const totalQuestions = certification.question_sets.reduce(
    (sum, qs) => sum + qs.question_count,
    0
  )
  const activeSetCount = certification.question_sets.filter((qs) => qs.is_active).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        href={`/study/${certification.id}`}
        className="block text-left glass-panel rounded-xl p-6 transition-all hover:-translate-y-2 hover:shadow-neon-cyan group relative overflow-hidden h-full"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
        <div className="flex justify-between items-start mb-4 gap-3">
          <h3 className="font-bold text-lg text-slate-100 group-hover:text-cyan-300 transition-colors font-serif">
            {certification.name}
          </h3>
          <span className="font-mono text-xs text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-1 rounded whitespace-nowrap shrink-0">
            {totalQuestions} Qs
          </span>
        </div>
        {certification.description && (
          <p className="text-sm text-slate-400 line-clamp-3 font-serif mb-4">
            {certification.description}
          </p>
        )}
        <div className="font-mono text-xs text-cyan-600 tracking-wide">
          {activeSetCount} 問題集 INDEXED
        </div>
      </Link>
    </motion.div>
  )
}
