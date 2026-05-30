'use client'

import type { QuestionSetSummary } from '@birgerik/types'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface ExamCardProps {
  questionSet: QuestionSetSummary & { certificationName: string }
}

export function ExamCard({ questionSet }: ExamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/exam/${questionSet.id}/confirm`}
        className="block text-left glass-panel rounded-xl p-6 transition-all hover:-translate-y-2 hover:shadow-neon-magenta group relative overflow-hidden h-full"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-400 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
        <div className="flex justify-between items-start mb-3 gap-3">
          <div>
            <div className="text-xs text-fuchsia-500 font-mono mb-1">{questionSet.certificationName}</div>
            <h2 className="font-bold text-lg text-slate-100 group-hover:text-fuchsia-300 transition-colors font-serif">
              {questionSet.name}
            </h2>
          </div>
          <span className="font-mono text-xs text-fuchsia-300 bg-fuchsia-950/50 border border-fuchsia-800 px-2 py-1 rounded whitespace-nowrap shrink-0">
            {questionSet.question_count} Qs
          </span>
        </div>
        {questionSet.description && (
          <p className="text-sm text-slate-400 line-clamp-2 font-serif">{questionSet.description}</p>
        )}
      </Link>
    </motion.div>
  )
}
