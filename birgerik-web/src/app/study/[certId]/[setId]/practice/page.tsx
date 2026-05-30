'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudyStore } from '@/store/study-store'
import { getQuestions, getQuestionSetDetail } from '@/lib/api/client'
import { QuestionDisplay } from '@/components/study/question-display'
import { ChoiceOption } from '@/components/study/choice-option'
import { AnswerFeedback } from '@/components/study/answer-feedback'
import { StudyProgress } from '@/components/study/study-progress'
import { StudyNavigation } from '@/components/study/study-navigation'
import { MagicLoader } from '@/components/shared/magic-loader'

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
    return <MagicLoader />
  }

  const handleFinish = () => {
    router.push(`/study/${certId}/${setId}/result`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <StudyProgress
        current={store.getProgress().current}
        total={store.getProgress().total}
        score={store.getScore()}
        questionSetName={store.questionSetName}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={store.currentIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <QuestionDisplay question={question} index={store.currentIndex} />
          <div className="space-y-4 my-8">
            {question.choices.map((choice) => (
              <ChoiceOption
                key={choice.id}
                choice={choice}
                isSelected={store.selectedChoiceIds.includes(choice.id)}
                isSubmitted={store.isAnswerSubmitted}
                isMultiple={question.is_multiple_choice}
                onToggle={() => store.toggleChoice(choice.id, question.is_multiple_choice)}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {store.isAnswerSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AnswerFeedback
            isCorrect={store.answerHistory.at(-1)?.isCorrect ?? false}
            explanation={question.explanation}
            showExplanation={store.showExplanation}
            onToggleExplanation={store.toggleExplanation}
          />
        </motion.div>
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
