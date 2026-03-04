'use client'

import { Modal } from '@/components/shared/ui/modal'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface PreviewQuestion {
  question_text: string
  explanation: string
  is_multiple_choice: boolean
  choices: { choice_text: string; is_correct: boolean }[]
}

interface QuestionPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  question: PreviewQuestion
}

export function QuestionPreviewModal({ isOpen, onClose, question }: QuestionPreviewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="問題プレビュー" size="lg" showCloseButton={false}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-teal-50">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${question.is_multiple_choice ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-600'}`}>
              {question.is_multiple_choice ? '複数選択問題' : '単一選択問題'}
            </span>
            <span className="text-xs text-gray-400">選択肢: {question.choices.length}個</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 問題文 */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">問題文</h3>
          <div className="prose prose-sm max-w-none bg-teal-50/50 p-4 rounded-2xl border-2 border-teal-50">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {question.question_text}
            </ReactMarkdown>
          </div>
        </div>

        {/* 選択肢 */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">選択肢</h3>
          <div className="space-y-2">
            {question.choices.map((choice, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border-2 transition-colors',
                  choice.is_correct
                    ? 'border-teal-300 bg-teal-50/50'
                    : 'border-gray-100 bg-gray-50/50'
                )}
              >
                <div className="flex items-center pt-0.5">
                  {question.is_multiple_choice ? (
                    <input type="checkbox" checked={choice.is_correct} readOnly className="w-4 h-4 text-teal-500 rounded" disabled />
                  ) : (
                    <input type="radio" checked={choice.is_correct} readOnly className="w-4 h-4 text-teal-500" disabled />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{choice.choice_text}</p>
                  {choice.is_correct && (
                    <p className="text-xs text-teal-600 font-bold mt-1">✓ 正解</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 解説 */}
        {question.explanation && question.explanation.trim() !== '' && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">解説</h3>
            <div className="prose prose-sm max-w-none bg-amber-50 p-4 rounded-2xl border-2 border-amber-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {question.explanation}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="flex justify-end pt-4 border-t-2 border-teal-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </Modal>
  )
}
