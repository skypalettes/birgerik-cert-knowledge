'use client'

import { RotateCcw } from 'lucide-react'

interface StudyNavigationProps {
  isFirst: boolean
  isLast: boolean
  isSubmitted: boolean
  hasSelection: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  onReset: () => void
  onFinish: () => void
}

export function StudyNavigation({
  isFirst,
  isLast,
  isSubmitted,
  hasSelection,
  onPrevious,
  onNext,
  onSubmit,
  onReset,
  onFinish,
}: StudyNavigationProps) {
  return (
    <div className="flex justify-between items-center border-t border-cyan-900/50 pt-6 mt-2">
      <button
        onClick={onPrevious}
        disabled={isFirst}
        className="font-mono text-sm px-6 py-2 text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none"
      >
        <span>&lt;</span> PREV
      </button>

      <div className="flex items-center gap-2">
        {isSubmitted ? (
          <>
            <button
              onClick={onReset}
              className="font-mono text-sm p-2 text-slate-400 hover:text-cyan-300 transition-colors"
              aria-label="やり直す"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={isLast ? onFinish : onNext}
              className="group font-mono font-bold px-8 py-3 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-500 hover:bg-cyan-500 hover:text-cyber-bg hover:shadow-neon-cyan transition-all duration-300"
            >
              {isLast ? 'RESULT' : 'NEXT'}{' '}
              <span className="inline-block group-hover:translate-x-1 transition-transform">&gt;&gt;</span>
            </button>
          </>
        ) : (
          <button
            onClick={onSubmit}
            disabled={!hasSelection}
            className="group font-mono font-bold px-8 py-3 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-500 hover:bg-cyan-500 hover:text-cyber-bg hover:shadow-neon-cyan transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none"
          >
            EXECUTE{' '}
            <span className="inline-block group-hover:translate-x-1 transition-transform">&gt;&gt;</span>
          </button>
        )}
      </div>
    </div>
  )
}
