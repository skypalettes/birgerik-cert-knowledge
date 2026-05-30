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
    <div className="glass-panel rounded-xl p-4">
      <div className="text-xs font-mono font-semibold text-cyan-500 mb-3 tracking-wide">INDEX</div>
      <div className="grid grid-cols-4 gap-2">
        {questions.map((q, i) => {
          const answered = answerMap.has(q.id)
          const isActive = i === currentIndex
          return (
            <button
              key={q.id}
              onClick={() => onGoTo(i)}
              className={`
                w-8 h-8 rounded text-xs font-mono font-bold transition-all border
                ${isActive ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-cyber-bg' : ''}
                ${
                  answered
                    ? 'bg-cyan-900/50 text-cyan-300 border-cyan-700'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700'
                }
              `}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      <div className="flex gap-3 mt-3 text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-800/60 border border-slate-700 inline-block" /> 未回答
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-cyan-900/50 border border-cyan-700 inline-block" /> 回答済
        </span>
      </div>
    </div>
  )
}
