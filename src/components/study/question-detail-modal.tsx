'use client'

import { Modal, ModalFooter } from '@/components/shared/ui/modal'
import { Button } from '@/components/shared/ui/button'
import { Badge } from '@/components/shared/ui/badge'
import { Check, X, FileQuestion } from 'lucide-react'
import { Question } from '@/store/study-store'
import { cn } from '@/lib/utils/cn'
import { MarkdownRenderer } from '@/components/shared/ui/markdown-renderer'
import type { Choice } from '@birgerik/types'

interface QuestionDetailModalProps {
  question: Question | null
  isOpen: boolean
  onClose: () => void
}

export function QuestionDetailModal({
  question,
  isOpen,
  onClose,
}: QuestionDetailModalProps) {
  if (!question) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="問題の詳細"
      size="lg"
    >
      <div className="space-y-6">
        {/* 問題タイプバッジ */}
        <div className="flex items-center gap-2">
          <Badge variant={question.is_multiple_choice ? 'warning' : 'info'}>
            {question.is_multiple_choice ? '複数選択' : '単一選択'}
          </Badge>
        </div>

        {/* 問題文 */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <FileQuestion className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 prose prose-sm max-w-none text-gray-900">
              <MarkdownRenderer content={question.question_text} />
            </div>
          </div>
        </div>

        {/* 選択肢 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">選択肢と正解</h4>
          {question.choices.map((choice: Choice) => (
            <div
              key={choice.id}
              className={cn(
                'p-4 rounded-lg border-2 transition-all',
                choice.is_correct
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              )}
            >
              <div className="flex items-start space-x-3">
                {/* アイコン */}
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 mt-0.5',
                    choice.is_correct
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 bg-white'
                  )}
                >
                  {choice.is_correct ? (
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" strokeWidth={2} />
                  )}
                </div>

                {/* テキスト */}
                <div
                  className={cn(
                    'flex-1 prose prose-sm max-w-none',
                    choice.is_correct ? 'text-green-900' : 'text-gray-700'
                  )}
                >
                  <MarkdownRenderer content={choice.choice_text} />
                </div>

                {/* 正解ラベル */}
                {choice.is_correct && (
                  <Badge variant="success" className="flex-shrink-0">
                    正解
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 解説 */}
        {question.explanation && (
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
              <span className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center mr-2">
                <span className="text-purple-600 font-bold text-xs">解</span>
              </span>
              解説
            </h4>
            <div className="prose prose-sm max-w-none text-gray-700">
              <MarkdownRenderer content={question.explanation} />
            </div>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button onClick={onClose}>閉じる</Button>
      </ModalFooter>
    </Modal>
  )
}