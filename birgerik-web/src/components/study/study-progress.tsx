interface StudyProgressProps {
  current: number
  total: number
  score: { correct: number; total: number; percentage: number }
}

export function StudyProgress({ current, total, score }: StudyProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-gray-600">
          {current} / {total} 問
        </span>
        <span className="text-sm font-bold text-teal-600">
          正答率: {score.percentage}%（{score.correct}/{score.total}）
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
