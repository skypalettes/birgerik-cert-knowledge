'use client'

import { useMemo } from 'react'

type Props = { seconds: number }

export function ExamTimer({ seconds }: Props) {
  const { minutes, secs, isWarning, isCritical } = useMemo(() => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return {
      minutes: m,
      secs: s,
      isWarning: seconds <= 300,
      isCritical: seconds <= 60,
    }
  }, [seconds])

  return (
    <div
      className={`font-mono text-2xl font-bold tabular-nums transition-colors ${
        isCritical
          ? 'text-red-600 animate-pulse'
          : isWarning
            ? 'text-orange-500'
            : 'text-gray-800'
      }`}
    >
      {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  )
}
