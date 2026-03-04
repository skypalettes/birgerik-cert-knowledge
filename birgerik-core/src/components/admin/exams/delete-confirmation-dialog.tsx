'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal, ModalFooter } from '@/components/shared/ui/modal'
import { toast } from '@/lib/utils/toast'
import { deleteExam } from '@/lib/actions/exams'

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  exam: { id: string; question_set?: { name: string } | null } | null
}

export function DeleteConfirmationDialog({ isOpen, onClose, onSuccess, exam }: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!exam) return
    setIsDeleting(true)
    try {
      const result = await deleteExam(exam.id)
      if (result.success) {
        toast.success('試験設定を削除しました')
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || '削除に失敗しました')
      }
    } catch {
      toast.error('削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="試験設定を削除" size="sm">
      <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-100 rounded-2xl">
        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-700">本当に削除しますか？</p>
          <p className="text-sm text-red-600 mt-1">
            <span className="font-bold">{exam?.question_set?.name}</span> の試験設定を削除します。
          </p>
        </div>
      </div>
      <ModalFooter>
        <button type="button" onClick={onClose} disabled={isDeleting} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
          キャンセル
        </button>
        <button type="button" onClick={handleDelete} disabled={isDeleting} className="px-5 py-2.5 text-sm font-bold text-white bg-red-400 hover:bg-red-500 hover:-translate-y-0.5 rounded-full transition-all disabled:opacity-50">
          {isDeleting ? '削除中...' : '削除する'}
        </button>
      </ModalFooter>
    </Modal>
  )
}
