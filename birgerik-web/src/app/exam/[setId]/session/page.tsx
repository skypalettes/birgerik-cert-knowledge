'use client'

import { use, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useExamStore } from '@/store/exam-store'
import { ExamTimer } from '@/components/exam/exam-timer'
import { ExamNavigator } from '@/components/exam/exam-navigator'
import { ExamQuestionDisplay } from '@/components/exam/exam-question-display'
import { ExamChoiceOption } from '@/components/exam/exam-choice-option'
import { Button } from '@/components/shared/ui/button'

type Props = { params: Promise<{ setId: string }> }

export default function ExamSessionPage({ params }: Props) {
  const { setId } = use(params)
  const router = useRouter()
  const store = useExamStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!store.isSessionActive || store.isFinished) return

    timerRef.current = setInterval(() => {
      store.tickTimer()
      if (store.timeRemaining <= 1) {
        store.finishExam()
        router.push(`/exam/${setId}/result`)
      }
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isSessionActive, store.isFinished])

  if (!store.isSessionActive) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500">試験セッションが見つかりません</p>
        <Button variant="secondary" onClick={() => router.push('/exam')}>
          試験選択に戻る
        </Button>
      </div>
    )
  }

  const question = store.getCurrentQuestion()
  const progress = store.getProgress()

  const handleFinish = () => {
    const unanswered = progress.total - progress.answeredCount
    if (unanswered > 0) {
      const ok = confirm(`未回答の問題が ${unanswered} 問あります。終了しますか？`)
      if (!ok) return
    }
    store.finishExam()
    router.push(`/exam/${setId}/result`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー: タイマー + 進捗 + 終了ボタン */}
      <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <ExamTimer seconds={store.timeRemaining} />
        <span className="text-sm text-gray-500 font-medium">
          {progress.current} / {progress.total} 問
          <span className="ml-2 text-blue-600">（回答済 {progress.answeredCount}問）</span>
        </span>
        <Button variant="danger" size="sm" onClick={handleFinish}>
          終了する
        </Button>
      </div>

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-6 gap-6">
        {/* メインエリア */}
        <div className="flex-1 min-w-0">
          {question && (
            <>
              <ExamQuestionDisplay
                question={question}
                currentIndex={store.currentIndex}
              />
              <div className="space-y-3 my-6">
                {question.choices.map((choice) => (
                  <ExamChoiceOption
                    key={choice.id}
                    choice={choice}
                    isSelected={store.selectedChoiceIds.includes(choice.id)}
                    onToggle={() =>
                      store.toggleChoice(choice.id, question.is_multiple_choice)
                    }
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={store.previousQuestion}
                  disabled={store.isFirstQuestion()}
                >
                  前の問題
                </Button>
                <Button
                  variant="primary"
                  onClick={store.nextQuestion}
                  disabled={store.isLastQuestion()}
                >
                  次の問題
                </Button>
              </div>
            </>
          )}
        </div>

        {/* サイドバー: 問題ナビゲーター */}
        <aside className="w-48 hidden lg:block">
          <ExamNavigator
            questions={store.questions}
            currentIndex={store.currentIndex}
            answerHistory={store.answerHistory}
            onGoTo={store.goToQuestion}
          />
        </aside>
      </div>
    </div>
  )
}
