'use client'

import { Modal } from '@/components/shared/ui/modal'
import { Badge } from '@/components/shared/ui/badge'
import { Button } from '@/components/shared/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface PreviewQuestion {
  question_text: string
  explanation: string
  is_multiple_choice: boolean
  choices: {
    choice_text: string
    is_correct: boolean
  }[]
}

interface QuestionPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  question: PreviewQuestion
}

export function QuestionPreviewModal({
  isOpen,
  onClose,
  question,
}: QuestionPreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="問題プレビュー"
      size="lg"
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* ヘッダー情報 */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Badge
              variant={question.is_multiple_choice ? 'warning' : 'success'}
            >
              {question.is_multiple_choice ? '複数選択問題' : '単一選択問題'}
            </Badge>
            <span className="text-sm text-gray-600">
              選択肢: {question.choices.length}個
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 問題文 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">問題文</h3>
          <div className="prose prose-sm max-w-none bg-blue-50 p-4 rounded-lg">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {question.question_text}
            </ReactMarkdown>
          </div>
        </div>

        {/* 選択肢 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">選択肢</h3>
          <div className="space-y-3">
            {question.choices.map((choice, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors',
                  choice.is_correct
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                )}
              >
                {/* チェックボックス/ラジオボタン */}
                <div className="flex items-center pt-0.5">
                  {question.is_multiple_choice ? (
                    <input
                      type="checkbox"
                      checked={choice.is_correct}
                      readOnly
                      className="w-5 h-5 text-green-600 rounded"
                      disabled
                    />
                  ) : (
                    <input
                      type="radio"
                      checked={choice.is_correct}
                      readOnly
                      className="w-5 h-5 text-green-600"
                      disabled
                    />
                  )}
                </div>

                {/* 選択肢テキスト */}
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{choice.choice_text}</p>
                  {choice.is_correct && (
                    <p className="text-xs text-green-700 font-medium mt-1">
                      ✓ 正解
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 正解数の表示 */}
          <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            <span className="font-medium">正解数:</span>{' '}
            {question.choices.filter((c) => c.is_correct).length} /{' '}
            {question.choices.length}
          </div>
        </div>

        {/* 解説 */}
        {question.explanation && question.explanation.trim() !== '' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">解説</h3>
            <div className="prose prose-sm max-w-none bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {question.explanation}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="secondary">
            閉じる
          </Button>
        </div>
      </div>
    </Modal>
  )
}