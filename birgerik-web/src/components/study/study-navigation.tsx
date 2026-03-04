'use client'

import { Button } from '../shared/ui/button'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

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
    <div className="flex items-center justify-between gap-3 mt-6">
      <Button variant="outline" size="sm" onClick={onPrevious} disabled={isFirst}>
        <ChevronLeft className="h-4 w-4 mr-1" />
        前へ
      </Button>

      <div className="flex gap-2">
        {isSubmitted ? (
          <>
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            {isLast ? (
              <Button variant="primary" onClick={onFinish}>
                結果を見る
              </Button>
            ) : (
              <Button variant="primary" onClick={onNext}>
                次へ
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </>
        ) : (
          <Button variant="primary" onClick={onSubmit} disabled={!hasSelection}>
            解答する
          </Button>
        )}
      </div>
    </div>
  )
}
