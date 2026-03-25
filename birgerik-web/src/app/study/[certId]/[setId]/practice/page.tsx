'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStudyStore } from '@/store/study-store'
import { getQuestions, getQuestionSetDetail } from '@/lib/api/client'
import { QuestionDisplay } from '@/components/study/question-display'
import { ChoiceOption } from '@/components/study/choice-option'
import { AnswerFeedback } from '@/components/study/answer-feedback'
import { StudyProgress } from '@/components/study/study-progress'
import { StudyNavigation } from '@/components/study/study-navigation'

type Props = { params: Promise<{ certId: string; setId: string }> }

export default function PracticePage({ params }: Props) {
  const { certId, setId } = use(params)
  const router = useRouter()
  const store = useStudyStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (store.isSessionActive && store.questionSetId === setId) return

    setIsLoading(true)
    let cancelled = false
    const init = async () => {
      const [{ question_set }, { questions }] = await Promise.all([
        getQuestionSetDetail(setId),
        getQuestions(setId),
      ])
      if (!cancelled) {
        store.startSession({
          questionSetId: setId,
          questionSetName: question_set.name,
          certificationName: question_set.certification_name,
          questions,
          mode: 'random',
        })
        setIsLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId])

  const question = store.getCurrentQuestion()
  const isWrongSession = store.isSessionActive && store.questionSetId !== setId

  if (isLoading || isWrongSession || !question) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        読み込み中...
      </div>
    )
  }

  const handleFinish = () => {
    router.push(`/study/${certId}/${setId}/result`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <StudyProgress
        current={store.getProgress().current}
        total={store.getProgress().total}
        score={store.getScore()}
      />
      <QuestionDisplay question={question} index={store.currentIndex} />
      <div className="space-y-3 my-6">
        {question.choices.map((choice) => (
          <ChoiceOption
            key={choice.id}
            choice={choice}
            isSelected={store.selectedChoiceIds.includes(choice.id)}
            isSubmitted={store.isAnswerSubmitted}
            onToggle={() => store.toggleChoice(choice.id, question.is_multiple_choice)}
          />
        ))}
      </div>
      {store.isAnswerSubmitted && (
        <AnswerFeedback
          isCorrect={store.answerHistory.at(-1)?.isCorrect ?? false}
          explanation={question.explanation}
          showExplanation={store.showExplanation}
          onToggleExplanation={store.toggleExplanation}
        />
      )}
      <StudyNavigation
        isFirst={store.isFirstQuestion()}
        isLast={store.isLastQuestion()}
        isSubmitted={store.isAnswerSubmitted}
        hasSelection={store.selectedChoiceIds.length > 0}
        onPrevious={store.previousQuestion}
        onNext={store.nextQuestion}
        onSubmit={store.submitAnswer}
        onReset={store.resetCurrentAnswer}
        onFinish={handleFinish}
      />
    </div>
  )
}
