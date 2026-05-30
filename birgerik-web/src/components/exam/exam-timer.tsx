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
          ? 'text-red-400 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'
          : isWarning
            ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
            : 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.4)]'
      }`}
    >
      {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  )
}
