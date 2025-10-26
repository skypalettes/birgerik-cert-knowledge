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
  questionSetFormSchema,
  type QuestionSetFormInput,
} from '@/lib/validations/question-set'
import {
  createQuestionSet,
  updateQuestionSet,
} from '@/app/admin/question-sets/actions'
import { Tables } from '@/lib/supabase/types'

type QuestionSet = Tables<'question_sets'>
type Certification = { id: string; name: string }

interface QuestionSetFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  questionSet?: QuestionSet | null
  certifications: Certification[]
}

export function QuestionSetFormModal({
  isOpen,
  onClose,
  onSuccess,
  questionSet,
  certifications,
}: QuestionSetFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!questionSet

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionSetFormInput>({
    resolver: zodResolver(questionSetFormSchema),
    defaultValues: {
      name: '',
      description: '',
      certification_id: '',
    },
  })

  // 編集モードの場合、フォームに既存データをセット
  useEffect(() => {
    if (questionSet) {
      reset({
        name: questionSet.name,
        description: questionSet.description || '',
        certification_id: questionSet.certification_id,
      })
    } else {
      reset({
        name: '',
        description: '',
        certification_id: certifications.length > 0 ? certifications[0].id : '',
      })
    }
  }, [questionSet, certifications, reset])

  const onSubmit = async (data: QuestionSetFormInput) => {
    setIsSubmitting(true)

    try {
      let result

      if (isEditMode && questionSet) {
        result = await updateQuestionSet(questionSet.id, data)
      } else {
        result = await createQuestionSet(data)
      }

      if (result.success) {
        toast.success(
          isEditMode ? '問題集を更新しました' : '問題集を作成しました'
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
      title={isEditMode ? '問題集を編集' : '問題集を追加'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} id="question-set-form">
        <div className="space-y-4">
          {/* 資格選択 */}
          <div className="space-y-1">
            <label
              htmlFor="certification_id"
              className="block text-sm font-medium text-gray-700"
            >
              資格 <span className="text-red-500">*</span>
            </label>
            <select
              id="certification_id"
              {...register('certification_id')}
              disabled={isSubmitting}
              className={`
                block w-full rounded-md border px-3 py-2 text-sm
                focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
                ${errors.certification_id ? 'border-red-500' : 'border-gray-300'}
              `}
            >
              <option value="">資格を選択してください</option>
              {certifications.map((cert) => (
                <option key={cert.id} value={cert.id}>
                  {cert.name}
                </option>
              ))}
            </select>
            {errors.certification_id && (
              <p className="text-sm text-red-600" role="alert">
                {errors.certification_id.message}
              </p>
            )}
          </div>

          {/* 問題集名 */}
          <Input
            label="問題集名"
            placeholder="例: 午前試験対策"
            error={errors.name?.message}
            {...register('name')}
            disabled={isSubmitting}
            required
          />

          {/* 説明 */}
          <Textarea
            label="説明（任意）"
            placeholder="問題集の詳細説明を入力してください"
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
          form="question-set-form"
          isLoading={isSubmitting}
        >
          {isEditMode ? '更新' : '作成'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}