interface StudyProgressProps {
  current: number
  total: number
  score: { correct: number; total: number; percentage: number }
  questionSetName?: string | null
}

export function StudyProgress({ current, total, score, questionSetName }: StudyProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <div className="border-l-2 border-cyan-400 pl-3 min-w-0">
          <div className="font-mono text-xs text-cyan-600 mb-1">CURRENT SECTOR</div>
          <div className="font-serif text-lg font-bold text-slate-200 truncate">
            {questionSetName ?? '—'}
          </div>
        </div>
        <div className="text-right font-mono shrink-0 ml-4">
          <div className="text-xs text-cyan-600 mb-1">
            ACCURACY {score.percentage}% ({score.correct}/{score.total})
          </div>
          <div className="text-lg text-cyan-300">
            {String(current).padStart(2, '0')} <span className="text-slate-600">/</span> {total}
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700">
        <div
          className="h-full bg-cyan-400 shadow-[0_0_10px_#0ff] relative transition-all duration-500"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-white" />
        </div>
      </div>
    </div>
  )
}
