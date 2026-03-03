'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { Modal, ModalFooter } from '@/components/shared/ui/modal'
import { Input } from '@/components/shared/ui/input'
import { toast } from '@/lib/utils/toast'
import { examFormSchema, type ExamFormInput } from '@/lib/validations/exam'
import { createExam, updateExam } from '@/lib/actions/exams'

type QuestionSet = { id: string; name: string; certification: { id: string; name: string } | null }

type Exam = {
  id: string
  question_set_id: string
  question_count: number
  time_limit_minutes: number
  passing_score: number
}

interface ExamFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  exam?: Exam | null
  questionSets: QuestionSet[]
}

export function ExamFormModal({ isOpen, onClose, onSuccess, exam, questionSets }: ExamFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!exam

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ExamFormInput>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      question_set_id: '',
      question_count: 20,
      time_limit_minutes: 60,
      passing_score: 65,
    },
  })

  const passingScore = watch('passing_score')

  useEffect(() => {
    if (exam) {
      reset({
        question_set_id: exam.question_set_id,
        question_count: exam.question_count,
        time_limit_minutes: exam.time_limit_minutes,
        passing_score: exam.passing_score,
      })
    } else {
      reset({ question_set_id: '', question_count: 20, time_limit_minutes: 60, passing_score: 65 })
    }
  }, [exam, reset])

  const onSubmit = async (data: ExamFormInput) => {
    setIsSubmitting(true)
    try {
      const result = isEditMode && exam
        ? await updateExam(exam.id, data)
        : await createExam(data)

      if (result.success) {
        toast.success(isEditMode ? '試験設定を更新しました' : '試験設定を作成しました')
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
          {isEditMode ? '試験設定を編集' : '試験の作成'}
        </span> as unknown as string
      }
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} id="exam-form" className="space-y-4">
        {/* 問題集選択 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">
            問題集 <span className="text-red-400">*</span>
          </label>
          <select
            {...register('question_set_id')}
            disabled={isSubmitting || isEditMode}
            className={`block w-full rounded-xl border-2 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:bg-white focus:outline-none transition-colors duration-200 disabled:opacity-60 ${errors.question_set_id ? 'border-red-300' : 'border-gray-100 focus:border-teal-300'}`}
          >
            <option value="">問題集を選択してください</option>
            {questionSets.map((qs) => (
              <option key={qs.id} value={qs.id}>
                {qs.certification?.name} - {qs.name}
              </option>
            ))}
          </select>
          {errors.question_set_id && (
            <p className="text-xs text-red-500 font-medium">{errors.question_set_id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="出題数"
            type="number"
            min={1}
            max={200}
            error={errors.question_count?.message}
            {...register('question_count', { valueAsNumber: true })}
            disabled={isSubmitting}
            required
          />
          <Input
            label="制限時間（分）"
            type="number"
            min={1}
            max={300}
            error={errors.time_limit_minutes?.message}
            {...register('time_limit_minutes', { valueAsNumber: true })}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* 合格スコア */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-gray-700">
              合格スコア（%）
            </label>
            <span className="text-lg font-extrabold text-teal-600">{passingScore ?? 65}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            {...register('passing_score', { valueAsNumber: true })}
            disabled={isSubmitting}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-teal-400"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          {errors.passing_score && (
            <p className="text-xs text-red-500 font-medium">{errors.passing_score.message}</p>
          )}
        </div>
      </form>

      <ModalFooter>
        <button type="button" onClick={handleClose} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
          キャンセル
        </button>
        <button type="submit" form="exam-form" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-teal-400 hover:bg-teal-500 hover:-translate-y-0.5 hover:shadow-md hover:shadow-teal-200 rounded-full transition-all disabled:opacity-50">
          {isSubmitting ? '処理中...' : isEditMode ? '更新する' : '作成する'}
        </button>
      </ModalFooter>
    </Modal>
  )
}
