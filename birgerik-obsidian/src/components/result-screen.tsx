import { h } from 'preact'
import { useStudyStoreAll, studyStore } from '@/store/study-store'
import { formatText } from '@/utils/text'

/**
 * 結果画面コンポーネント
 *
 * 学習結果を表示し、間違えた問題を確認できる
 */
export function ResultScreen() {
  const { result, session, reset, goToQuestion, setCurrentScreen } = useStudyStoreAll()

  if (!result || !session) {
    return (
      <div className="birgerik-result-screen">
        <p>結果が見つかりません</p>
      </div>
    )
  }

  const { totalQuestions, correctCount, incorrectCount, accuracy, duration } = result

  // 所要時間をフォーマット
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`
    }
    return `${seconds}秒`
  }

  // 正答率に応じたメッセージ
  const getMessage = (accuracy: number): string => {
    if (accuracy === 100) return '🎉 完璧です！'
    if (accuracy >= 80) return '✨ 素晴らしい！'
    if (accuracy >= 60) return '👍 よくできました！'
    if (accuracy >= 40) return '📚 もう少し復習しましょう'
    return '💪 頑張りましょう！'
  }

  // 間違えた問題を見る
  const reviewIncorrectQuestion = (questionId: string) => {
    const questionIndex = session.questions.findIndex((q) => q.id === questionId)
    if (questionIndex !== -1) {
      goToQuestion(questionIndex)
      setCurrentScreen('study')
    }
  }

  return (
    <div className="birgerik-result-screen">
      {/* ヘッダー */}
      <div className="result-header">
        <h2>学習結果</h2>
        <p className="result-subtitle">{session.questionSetName}</p>
      </div>

      {/* 結果サマリー */}
      <div className="result-summary">
        <div className="result-message">{getMessage(accuracy)}</div>

        <div className="result-stats">
          {/* 正答率 */}
          <div className="result-stat result-stat-main">
            <div className="result-stat-value">{Math.round(accuracy)}%</div>
            <div className="result-stat-label">正答率</div>
          </div>

          {/* 正解数 */}
          <div className="result-stat">
            <div className="result-stat-value result-stat-correct">{correctCount}</div>
            <div className="result-stat-label">正解</div>
          </div>

          {/* 不正解数 */}
          <div className="result-stat">
            <div className="result-stat-value result-stat-incorrect">
              {incorrectCount}
            </div>
            <div className="result-stat-label">不正解</div>
          </div>

          {/* 合計問題数 */}
          <div className="result-stat">
            <div className="result-stat-value">{totalQuestions}</div>
            <div className="result-stat-label">総問題数</div>
          </div>
        </div>

        {/* 所要時間 */}
        <div className="result-duration">
          所要時間: {formatDuration(duration)}
        </div>

        {/* プログレスバー */}
        <div className="result-progress">
          <div className="result-progress-bar">
            <div
              className="result-progress-fill"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>
      </div>

      {/* 間違えた問題 */}
      {incorrectCount > 0 && (
        <div className="result-incorrect-section">
          <h3>間違えた問題 ({incorrectCount}問)</h3>
          <div className="result-incorrect-list">
            {result.incorrectQuestions.map((question, index) => {
              const questionNumber =
                session.questions.findIndex((q) => q.id === question.id) + 1

              return (
                <div
                  key={question.id}
                  className="result-incorrect-item"
                  onClick={() => reviewIncorrectQuestion(question.id)}
                >
                  <div className="result-incorrect-number">問題 {questionNumber}</div>
                  <div className="result-incorrect-text">
                    {(() => {
                      const formattedText = formatText(question.question_text)
                      return formattedText.length > 100
                        ? formattedText.substring(0, 100) + '...'
                        : formattedText
                    })()}
                  </div>
                  <div className="result-incorrect-action">復習 →</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="result-actions">
        <button className="study-btn study-btn-secondary" onClick={reset}>
          ← 問題セット選択に戻る
        </button>
        <button
          className="study-btn study-btn-primary"
          onClick={() => {
            // セッションをリセットして同じ問題セットを再開
            const { questionSetId, questionSetName, certificationName, questions } =
              session
            reset()
            studyStore.getState().startSession(
              questionSetId,
              questionSetName,
              certificationName,
              questions
            )
          }}
        >
          もう一度学習する
        </button>
      </div>
    </div>
  )
}
