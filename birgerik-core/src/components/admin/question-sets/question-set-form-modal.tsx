'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { Modal, ModalFooter } from '@/components/shared/ui/modal'
import { Input } from '@/components/shared/ui/input'
import { Textarea } from '@/components/shared/ui/textarea'
import { toast } from '@/lib/utils/toast'
import { questionSetFormSchema, type QuestionSetFormInput } from '@/lib/validations/question-set'
import { createQuestionSet, updateQuestionSet } from '@/lib/actions/question-sets'

type QuestionSet = {
  id: string
  name: string
  description: string | null
  certification_id: string
  is_active: boolean
}

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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuestionSetFormInput>({
    resolver: zodResolver(questionSetFormSchema),
    defaultValues: {
      name: '',
      description: '',
      certification_id: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (questionSet) {
      reset({
        name: questionSet.name,
        description: questionSet.description || '',
        certification_id: questionSet.certification_id,
        is_active: questionSet.is_active,
      })
    } else {
      reset({ name: '', description: '', certification_id: '', is_active: true })
    }
  }, [questionSet, reset])

  const onSubmit = async (data: QuestionSetFormInput) => {
    setIsSubmitting(true)
    try {
      const result = isEditMode && questionSet
        ? await updateQuestionSet(questionSet.id, data)
        : await createQuestionSet(data)

      if (result.success) {
        toast.success(isEditMode ? '問題集を更新しました' : '問題集を作成しました')
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
          {isEditMode ? '問題集を編集' : '問題集を追加'}
        </span> as unknown as string
      }
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} id="question-set-form" className="space-y-4">
        {/* 資格選択 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">
            資格 <span className="text-red-400">*</span>
          </label>
          <select
            {...register('certification_id')}
            disabled={isSubmitting}
            className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:border-teal-300 focus:bg-white focus:outline-none transition-colors duration-200 disabled:opacity-60"
          >
            <option value="">資格を選択してください</option>
            {certifications.map((cert) => (
              <option key={cert.id} value={cert.id}>{cert.name}</option>
            ))}
          </select>
          {errors.certification_id && (
            <p className="text-xs text-red-500 font-medium">{errors.certification_id.message}</p>
          )}
        </div>

        <Input
          label="問題集名"
          placeholder="例: AWS SAA 模擬問題 第1回"
          error={errors.name?.message}
          {...register('name')}
          disabled={isSubmitting}
          required
        />

        <Textarea
          label="説明（任意）"
          placeholder="問題集の詳細説明を入力してください"
          error={errors.description?.message}
          {...register('description')}
          disabled={isSubmitting}
          rows={3}
        />

        {/* 公開設定 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-100 rounded-xl">
          <div>
            <p className="text-sm font-bold text-gray-700">公開する</p>
            <p className="text-xs text-gray-400">ONにすると学習画面に表示されます</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...register('is_active')}
              className="sr-only peer"
              disabled={isSubmitting}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-400 shadow-sm"></div>
          </label>
        </div>
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
          form="question-set-form"
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-bold text-white bg-teal-400 hover:bg-teal-500 hover:-translate-y-0.5 hover:shadow-md hover:shadow-teal-200 rounded-full transition-all disabled:opacity-50"
        >
          {isSubmitting ? '処理中...' : isEditMode ? '更新する' : '作成する'}
        </button>
      </ModalFooter>
    </Modal>
  )
}
