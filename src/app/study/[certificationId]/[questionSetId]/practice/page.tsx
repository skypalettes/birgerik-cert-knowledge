'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { getQuestionsWithChoices } from '@/lib/actions/study'
import { useStudyStore } from '@/store/study-store'
import { QuestionDisplay } from '@/components/study/question-display'
import { ChoiceOption } from '@/components/study/choice-option'
import { AnswerFeedback } from '@/components/study/answer-feedback'
import { StudyProgress } from '@/components/study/study-progress'
import { StudyNavigation } from '@/components/study/study-navigation'
import type { Choice } from '@birgerik/types'

export default function PracticePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  
  const certificationId = params.certificationId as string
  const questionSetId = params.questionSetId as string
  const mode = searchParams.get('mode') as 'sequential' | 'random' | 'review' | null
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  
  // Zustand store
  const {
    isSessionActive,
    questions,
    currentIndex,
    selectedChoiceIds,
    isAnswerSubmitted,
    showExplanation,
    answerHistory,
    startSession,
    endSession,
    toggleChoice,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    resetCurrentAnswer,
    toggleExplanation,
    getCurrentQuestion,
    getProgress,
    getScore,
    isLastQuestion,
    isFirstQuestion,
  } = useStudyStore()
  
  // セッション初期化
  useEffect(() => {
    async function initSession() {
      if (!mode) {
        setError('学習モードが指定されていません')
        return
      }

      // 復習モードの場合は既存セッションを使用
      if (mode === 'review') {
        if (isSessionActive && questions.length > 0) {
          setIsLoading(false)
          return
        } else {
          setError('復習する問題がありません')
          return
        }
      }
      
      // 既存のセッションがある場合は継続
      if (isSessionActive && questions.length > 0) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        const result = await getQuestionsWithChoices(questionSetId)
        
        if (result.error || !result.data) {
          setError(result.error || '問題の取得に失敗しました')
          return
        }
        
        if (result.data.length === 0) {
          setError('この問題集には問題が登録されていません')
          return
        }
        
        // セッション開始
        startSession({
          questionSetId,
          questionSetName: 'Question Set', // 実際には取得する
          certificationId,
          questions: result.data,
          mode,
        })
      } catch (_err) {
        setError('予期しないエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }
    
    initSession()
  }, [questionSetId, mode, isSessionActive, questions.length, certificationId, startSession])
  
  // 現在の問題
  const currentQuestion = getCurrentQuestion()
  const progress = getProgress()
  const score = getScore()
  
  // ハンドラー
  const handleSubmit = () => {
    if (selectedChoiceIds.length === 0) return
    submitAnswer()
  }
  
  const handleNext = () => {
    if (isLastQuestion()) {
      handleFinish()
    } else {
      nextQuestion()
    }
  }
  
  const handleFinish = () => {
    // 結果画面へ遷移
    router.push(`/study/${certificationId}/${questionSetId}/result`)
  }
  
  const handleExit = () => {
    setShowExitConfirm(true)
  }
  
  const confirmExit = () => {
    endSession()
    router.push(`/study/${certificationId}`)
  }
  
  // 正解判定
  const isCorrectAnswer = () => {
    if (!currentQuestion || !isAnswerSubmitted) return false
    const lastAnswer = answerHistory[answerHistory.length - 1]
    return lastAnswer?.isCorrect || false
  }
  
  // ローディング
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">問題を読み込んでいます...</p>
        </div>
      </div>
    )
  }
  
  // エラー
  if (error || !currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">エラー</h3>
              <p className="mt-1 text-sm text-red-700">
                {error || '問題の読み込みに失敗しました'}
              </p>
            </div>
          </div>
        </div>
        <Link href={`/study/${certificationId}/${questionSetId}/mode-select`}>
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            モード選択に戻る
          </Button>
        </Link>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleExit}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">中断</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            正解: <span className="font-semibold text-green-600">{score.correct}</span> / {score.total}
          </div>
        </div>
      </div>
      
      {/* プログレスバー */}
      <div className="mb-6">
        <StudyProgress
          current={progress.current}
          total={progress.total}
          percentage={progress.percentage}
        />
      </div>
      
      {/* メインコンテンツ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* 問題表示 */}
          <QuestionDisplay
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            questionText={currentQuestion.question_text}
            isMultipleChoice={currentQuestion.is_multiple_choice}
          />
          
          {/* 選択肢 */}
          <div className="space-y-3">
            {currentQuestion.choices.map((choice: Choice) => (
              <ChoiceOption
                key={choice.id}
                choiceText={choice.choice_text}
                isSelected={selectedChoiceIds.includes(choice.id)}
                isCorrect={choice.is_correct}
                isSubmitted={isAnswerSubmitted}
                isMultipleChoice={currentQuestion.is_multiple_choice}
                onSelect={() => toggleChoice(choice.id, currentQuestion.is_multiple_choice)}
              />
            ))}
          </div>
          
          {/* フィードバック */}
          {isAnswerSubmitted && (
            <AnswerFeedback
              isCorrect={isCorrectAnswer()}
              explanation={currentQuestion.explanation}
              showExplanation={showExplanation}
              onToggleExplanation={toggleExplanation}
            />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* ナビゲーション */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <StudyNavigation
          isFirstQuestion={isFirstQuestion()}
          isLastQuestion={isLastQuestion()}
          isAnswerSubmitted={isAnswerSubmitted}
          hasSelectedChoices={selectedChoiceIds.length > 0}
          onPrevious={previousQuestion}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onReset={resetCurrentAnswer}
          onFinish={handleFinish}
        />
      </div>
      
      {/* 中断確認ダイアログ */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  学習を中断しますか？
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  進捗は保存されますが、次回開始時にこの問題から再開されます。
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExitConfirm(false)}
              >
                キャンセル
              </Button>
              <Button
                variant="danger"
                onClick={confirmExit}
              >
                中断する
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}