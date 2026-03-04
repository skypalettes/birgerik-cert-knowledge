type AnswerRecord = { questionId: string; isCorrect: boolean }

type Props = {
  questions: Array<{ id: string }>
  currentIndex: number
  answerHistory: AnswerRecord[]
  onGoTo: (index: number) => void
}

export function ExamNavigator({ questions, currentIndex, answerHistory, onGoTo }: Props) {
  const answerMap = new Map(answerHistory.map((h) => [h.questionId, h]))

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-xs font-semibold text-gray-500 mb-3">問題一覧</div>
      <div className="grid grid-cols-4 gap-2">
        {questions.map((q, i) => {
          const answered = answerMap.has(q.id)
          const isActive = i === currentIndex
          return (
            <button
              key={q.id}
              onClick={() => onGoTo(i)}
              className={`
                w-8 h-8 rounded-lg text-xs font-bold transition-all
                ${isActive ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                ${!answered ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'}
              `}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      <div className="flex gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-200 inline-block" /> 未回答
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-100 inline-block" /> 回答済
        </span>
      </div>
    </div>
  )
}
