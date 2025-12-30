import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { useStudyStoreAll } from '@/store/study-store'
import { ObsidianMarkdownRenderer } from '@/components/markdown-renderer'
import type { QuestionWithChoices } from '@/types/api'

/**
 * 学習画面メインコンポーネント
 *
 * 最終デザインモックアップに基づくボトムシート形式
 */
export function StudyScreen() {
  const {
    getCurrentQuestion,
    currentQuestionIndex,
    session,
    userAnswers,
    submitAnswer,
    hasAnswered,
    getAnswer,
    nextQuestion,
    previousQuestion,
    calculateResult,
  } = useStudyStoreAll()

  const [selectedChoices, setSelectedChoices] = useState<string[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  // ボトムシートの高さ（デフォルト65%）
  const [bottomSheetHeight, setBottomSheetHeight] = useState(65)
  const [isDragging, setIsDragging] = useState(false)

  const currentQuestion = getCurrentQuestion()
  const totalQuestions = session?.questions.length || 0
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0

  // 問題が変わったらリセット
  useEffect(() => {
    if (!currentQuestion) return

    const answer = getAnswer(currentQuestion.id)
    if (answer) {
      setSelectedChoices(answer.selectedChoiceIds)
      setShowExplanation(true)
    } else {
      setSelectedChoices([])
      setShowExplanation(false)
    }
  }, [currentQuestion?.id])

  // リサイズハンドラー
  const handleMouseDown = () => {
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.querySelector('.birgerik-study-screen')
      if (!container) return

      const rect = container.getBoundingClientRect()
      const newHeight = ((rect.bottom - e.clientY) / rect.height) * 100

      // 最小30%、最大80%
      const clampedHeight = Math.max(30, Math.min(80, newHeight))
      setBottomSheetHeight(clampedHeight)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  if (!currentQuestion || !session) {
    return (
      <div className="birgerik-study-screen">
        <p>問題が見つかりません</p>
      </div>
    )
  }

  const isAnswered = hasAnswered(currentQuestion.id)
  const answer = getAnswer(currentQuestion.id)

  // 選択肢をトグル
  const toggleChoice = (choiceId: string) => {
    if (isAnswered) return // 回答済みは変更不可

    if (currentQuestion.is_multiple_choice) {
      // 複数選択
      if (selectedChoices.includes(choiceId)) {
        setSelectedChoices(selectedChoices.filter((id) => id !== choiceId))
      } else {
        setSelectedChoices([...selectedChoices, choiceId])
      }
    } else {
      // 単一選択
      setSelectedChoices([choiceId])
    }
  }

  // 回答を確認
  const handleSubmit = () => {
    if (selectedChoices.length === 0) return

    submitAnswer(currentQuestion.id, selectedChoices)
    setShowExplanation(true)
  }

  // 次の問題へ
  const handleNext = () => {
    if (currentQuestionIndex === totalQuestions - 1) {
      // 最後の問題なら結果画面へ
      calculateResult()
    } else {
      nextQuestion()
    }
  }

  // ソート済みの選択肢
  const sortedChoices = [...currentQuestion.choices].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  )

  return (
    <div className="birgerik-study-screen">
      {/* ヘッダー */}
      <div className="study-header">
        <div className="study-header-title">
          <h2>{session.certificationName}</h2>
          <p>{session.questionSetName}</p>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="study-progress-container">
        <div className="study-progress-bar">
          <div className="study-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="study-progress-text">
          問題 {currentQuestionIndex + 1} / {totalQuestions} • {Math.round(progress)}% 完了
        </div>
      </div>

      {/* 問題エリア（動的サイズ、スクロール可能） */}
      <div
        className="study-question-area"
        style={{ height: `${100 - bottomSheetHeight}%` }}
      >
        <div className="study-question-meta">
          問題 {currentQuestionIndex + 1} / {totalQuestions}
          {currentQuestion.is_multiple_choice && (
            <span className="study-question-badge">複数選択</span>
          )}
        </div>

        <div className="study-question-text">
          <ObsidianMarkdownRenderer content={currentQuestion.question_text} />
        </div>

        {/* 回答後に解説を表示 */}
        {showExplanation && currentQuestion.explanation && (
          <div className="study-explanation">
            <div className="study-explanation-header">
              {answer?.isCorrect ? (
                <span className="study-result-correct">✓ 正解</span>
              ) : (
                <span className="study-result-incorrect">✗ 不正解</span>
              )}
            </div>
            <div className="study-explanation-text">
              <ObsidianMarkdownRenderer content={currentQuestion.explanation} />
            </div>
          </div>
        )}
      </div>

      {/* リサイズハンドル */}
      <div
        className={`study-resize-handle ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="study-resize-handle-line" />
      </div>

      {/* ボトムシート（動的サイズ） */}
      <div
        className="study-bottom-sheet"
        style={{ height: `${bottomSheetHeight}%` }}
      >
        <div className="study-sheet-header">
          {isAnswered ? '回答結果' : '選択肢を選んでください'}
        </div>

        {/* 選択肢コンテナ（スクロール可能） */}
        <div className="study-choices-container">
          {sortedChoices.map((choice) => {
            const isSelected = selectedChoices.includes(choice.id)
            const isCorrect = choice.is_correct
            const showCorrectness = showExplanation

            let choiceClass = 'study-choice'
            if (isSelected) {
              choiceClass += ' study-choice-selected'
            }
            if (showCorrectness) {
              if (isCorrect) {
                choiceClass += ' study-choice-correct'
              } else if (isSelected && !isCorrect) {
                choiceClass += ' study-choice-incorrect'
              }
            }

            return (
              <div
                key={choice.id}
                className={choiceClass}
                onClick={() => toggleChoice(choice.id)}
              >
                <div className="study-choice-indicator">
                  {showCorrectness && isCorrect && '✓'}
                  {showCorrectness && isSelected && !isCorrect && '✗'}
                  {!showCorrectness && (isSelected ? '●' : '○')}
                </div>
                <div className="study-choice-text">
                  <ObsidianMarkdownRenderer content={choice.choice_text} />
                </div>
              </div>
            )
          })}
        </div>

        {/* アクションボタンエリア */}
        <div className="study-sheet-action">
          <div className="study-button-group">
            {/* 前の問題ボタン */}
            {currentQuestionIndex > 0 && (
              <button
                className="study-btn study-btn-secondary"
                onClick={previousQuestion}
              >
                ← 前の問題
              </button>
            )}

            {/* 回答確認 or 次へボタン */}
            {!isAnswered ? (
              <button
                className="study-btn study-btn-primary"
                onClick={handleSubmit}
                disabled={selectedChoices.length === 0}
              >
                回答を確認
              </button>
            ) : (
              <button className="study-btn study-btn-primary" onClick={handleNext}>
                {currentQuestionIndex === totalQuestions - 1 ? '結果を見る' : '次の問題 →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
