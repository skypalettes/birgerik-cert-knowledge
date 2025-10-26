'use client'

import { useState } from 'react'
import { Modal, ModalFooter } from '@/components/shared/ui/modal'
import { Button } from '@/components/shared/ui/button'
import { AlertCircle } from 'lucide-react'
import { toast } from '@/lib/utils/toast'
import { deleteCertification } from '@/app/admin/certifications/actions'
import { Tables } from '@/lib/supabase/types'

type Certification = Tables<'certifications'>

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  certification: Certification | null
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onSuccess,
  certification,
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!certification) return

    setIsDeleting(true)

    try {
      const result = await deleteCertification(certification.id)

      if (result.success) {
        toast.success('資格を削除しました')
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="資格を削除"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              本当に <strong className="font-semibold">{certification?.name}</strong> を削除しますか？
            </p>
            <p className="text-sm text-gray-600 mt-2">
              この操作は取り消せません。関連する問題集がある場合は削除できません。
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