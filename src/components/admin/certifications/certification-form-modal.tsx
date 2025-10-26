'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, ModalFooter } from '@/components/shared/ui/modal'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Textarea } from '@/components/shared/ui/textarea'
import { toast } from '@/lib/utils/toast'
import {
  certificationSchema,
  type CertificationFormData,
} from '@/lib/validations/certification'
import {
  createCertification,
  updateCertification,
} from '@/app/admin/certifications/actions'
import { Tables } from '@/lib/supabase/types'

type Certification = Tables<'certifications'>

interface CertificationFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  certification?: Certification | null
}

export function CertificationFormModal({
  isOpen,
  onClose,
  onSuccess,
  certification,
}: CertificationFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!certification

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    name: string
    description: string
  }>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  // 編集モードの場合、フォームに既存データをセット
  useEffect(() => {
    if (certification) {
      reset({
        name: certification.name,
        description: certification.description || '',
      })
    } else {
      reset({
        name: '',
        description: '',
      })
    }
  }, [certification, reset])

  const onSubmit = async (data: { name: string; description: string }) => {
    setIsSubmitting(true)

    try {
      let result

      if (isEditMode && certification) {
        // 更新
        result = await updateCertification(certification.id, data as CertificationFormData)
      } else {
        // 新規作成
        result = await createCertification(data as CertificationFormData)
      }

      if (result.success) {
        toast.success(
          isEditMode ? '資格を更新しました' : '資格を作成しました'
        )
        reset()
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || '操作に失敗しました')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? '資格を編集' : '資格を追加'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} id="certification-form">
        <div className="space-y-4">
          {/* 資格名 */}
          <Input
            label="資格名"
            placeholder="例: 基本情報技術者試験"
            error={errors.name?.message}
            {...register('name')}
            disabled={isSubmitting}
            required
          />

          {/* 説明 */}
          <Textarea
            label="説明（任意）"
            placeholder="資格の詳細説明を入力してください"
            error={errors.description?.message}
            {...register('description')}
            disabled={isSubmitting}
            rows={4}
          />
        </div>
      </form>

      <ModalFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          form="certification-form"
          isLoading={isSubmitting}
        >
          {isEditMode ? '更新' : '作成'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}