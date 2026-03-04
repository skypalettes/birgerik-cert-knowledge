'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { Modal, ModalFooter } from '@/components/shared/ui/modal'
import { Input } from '@/components/shared/ui/input'
import { Textarea } from '@/components/shared/ui/textarea'
import { toast } from '@/lib/utils/toast'
import { certificationFormSchema, type CertificationFormInput } from '@/lib/validations/certification'
import { createCertification, updateCertification } from '@/lib/actions/certifications'
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CertificationFormInput>({
    resolver: zodResolver(certificationFormSchema),
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    if (certification) {
      reset({ name: certification.name, description: certification.description || '' })
    } else {
      reset({ name: '', description: '' })
    }
  }, [certification, reset])

  const onSubmit = async (data: CertificationFormInput) => {
    setIsSubmitting(true)
    try {
      const result = isEditMode && certification
        ? await updateCertification(certification.id, data)
        : await createCertification(data)

      if (result.success) {
        toast.success(isEditMode ? '資格を更新しました' : '資格を作成しました')
        reset()
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || '操作に失敗しました')
      }
    } catch {
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) { reset(); onClose() }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" />
          {isEditMode ? '資格を編集' : '資格を追加'}
        </span> as unknown as string
      }
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} id="certification-form" className="space-y-4">
        <Input
          label="資格名"
          placeholder="例: 基本情報技術者試験"
          error={errors.name?.message}
          {...register('name')}
          disabled={isSubmitting}
          required
        />
        <Textarea
          label="説明（任意）"
          placeholder="資格の詳細説明を入力してください"
          error={errors.description?.message}
          {...register('description')}
          disabled={isSubmitting}
          rows={4}
        />
      </form>

      <ModalFooter>
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          form="certification-form"
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-bold text-white bg-teal-400 hover:bg-teal-500 hover:-translate-y-0.5 hover:shadow-md hover:shadow-teal-200 rounded-full transition-all disabled:opacity-50 disabled:translate-y-0"
        >
          {isSubmitting ? '処理中...' : isEditMode ? '更新する' : '作成する'}
        </button>
      </ModalFooter>
    </Modal>
  )
}
