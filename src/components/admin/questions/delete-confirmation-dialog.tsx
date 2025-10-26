'use client'

import { useState } from 'react'
import { Modal, ModalFooter } from '@/components/shared/ui/modal'
import { Button } from '@/components/shared/ui/button'
import { AlertCircle } from 'lucide-react'
import { toast } from '@/lib/utils/toast'
import { deleteQuestion } from '@/app/admin/questions/actions'

interface QuestionWithRelations {
  id: string
  question_set_id: string
  question_text: string
  explanation: string | null
  is_multiple_choice: boolean | null
  order_index: number | null
  created_at: string | null
  updated_at: string | null
  question_set?: { name: string } | null
}

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  question: QuestionWithRelations | null
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onSuccess,
  question,
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!question) return

    setIsDeleting(true)

    try {
      const result = await deleteQuestion(question.id)

      if (result.success) {
        toast.success('問題を削除しました')
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="問題を削除" size="sm">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-2">
              本当にこの問題を削除しますか？
            </p>
            {question?.question_set && (
              <div className="bg-gray-50 rounded p-3 mb-2">
                <p className="text-xs text-gray-600 mb-1">問題集</p>
                <p className="text-sm font-medium text-gray-900">
                  {question.question_set.name}
                </p>
              </div>
            )}
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-600 mb-1">問題文（抜粋）</p>
              <p className="text-sm text-gray-900 line-clamp-2">
                {question?.question_text}
              </p>
            </div>
            <p className="text-sm text-red-600 mt-3 font-medium">
              この操作は取り消せません。関連する選択肢もすべて削除されます。
            </p>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isDeleting}
        >
          キャンセル
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleDelete}
          isLoading={isDeleting}
        >
          削除
        </Button>
      </ModalFooter>
    </Modal>
  )
}