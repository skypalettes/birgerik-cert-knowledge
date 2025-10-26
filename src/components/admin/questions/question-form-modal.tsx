'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, ModalFooter } from '@/components/shared/ui/modal'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { RichTextEditor } from '@/components/shared/ui/rich-text-editor'
import { toast } from '@/lib/utils/toast'
import { Plus, Trash2, CheckCircle2 } from 'lucide-react'
import {
  questionFormSchema,
  type QuestionFormInput,
} from '@/lib/validations/question'
import {
  createQuestion,
  updateQuestion,
} from '@/app/admin/questions/actions'

type QuestionSet = {
  id: string
  name: string
  certification: { id: string; name: string } | null
}

type Choice = {
  id: string
  choice_text: string
  is_correct: boolean | null
  order_index: number | null
}

interface QuestionWithRelations {
  id: string
  question_set_id: string
  question_text: string
  explanation: string | null
  is_multiple_choice: boolean | null
  order_index: number | null
  created_at: string | null
  updated_at: string | null
  question_set: QuestionSet | null
  choices: Choice[] | null
}

interface QuestionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  question?: QuestionWithRelations | null
  questionSets: QuestionSet[]
}

export function QuestionFormModal({
  isOpen,
  onClose,
  onSuccess,
  question,
  questionSets,
}: QuestionFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!question

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<QuestionFormInput>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      question_set_id: '',
      question_text: '',
      explanation: '',
      is_multiple_choice: false,
      choices: [
        { choice_text: '', is_correct: false, order_index: 0 },
        { choice_text: '', is_correct: false, order_index: 1 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'choices',
  })

  const isMultipleChoice = watch('is_multiple_choice')

  useEffect(() => {
    if (question && question.choices) {
      reset({
        question_set_id: question.question_set_id,
        question_text: question.question_text,
        explanation: question.explanation || '',
        is_multiple_choice: question.is_multiple_choice || false,
        choices: question.choices.map((choice, index) => ({
          choice_text: choice.choice_text,
          is_correct: choice.is_correct || false,
          order_index: index,
        })),
      })
    } else {
      reset({
        question_set_id: questionSets.length > 0 ? questionSets[0].id : '',
        question_text: '',
        explanation: '',
        is_multiple_choice: false,
        choices: [
          { choice_text: '', is_correct: false, order_index: 0 },
          { choice_text: '', is_correct: false, order_index: 1 },
        ],
      })
    }
  }, [question, questionSets, reset])

  const onSubmit = async (data: QuestionFormInput) => {
    setIsSubmitting(true)

    try {
      const formattedData = {
        ...data,
        choices: data.choices.map((choice, index) => ({
          ...choice,
          order_index: index,
        })),
      }

      let result

      if (isEditMode && question) {
        result = await updateQuestion(question.id, formattedData)
      } else {
        result = await createQuestion(formattedData)
      }

      if (result.success) {
        toast.success(isEditMode ? '問題を更新しました' : '問題を作成しました')
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

  const handleAddChoice = () => {
    if (fields.length < 6) {
      append({
        choice_text: '',
        is_correct: false,
        order_index: fields.length,
      })
    } else {
      toast.error('選択肢は最大6つまでです')
    }
  }

  const handleRemoveChoice = (index: number) => {
    if (fields.length > 2) {
      remove(index)
    } else {
      toast.error('選択肢は最低2つ必要です')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? '問題を編集' : '問題を追加'}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} id="question-form">
        <div className="space-y-6">
          {/* 問題集選択 */}
          <div className="space-y-1">
            <label
              htmlFor="question_set_id"
              className="block text-sm font-medium text-gray-700"
            >
              問題集 <span className="text-red-500">*</span>
            </label>
            <select
              id="question_set_id"
              {...register('question_set_id')}
              disabled={isSubmitting}
              className={`
                block w-full rounded-md border px-3 py-2 text-sm
                focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
                ${errors.question_set_id ? 'border-red-500' : 'border-gray-300'}
              `}
            >
              <option value="">問題集を選択してください</option>
              {questionSets.map((qs) => (
                <option key={qs.id} value={qs.id}>
                  {qs.certification?.name} - {qs.name}
                </option>
              ))}
            </select>
            {errors.question_set_id && (
              <p className="text-sm text-red-600" role="alert">
                {errors.question_set_id.message}
              </p>
            )}
          </div>

          {/* 問題文（リッチテキストエディタ） */}
          <Controller
            name="question_text"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                label="問題文"
                content={field.value}
                onChange={field.onChange}
                placeholder="問題文を入力してください。太字、リスト、コードブロックなどが使用できます。"
                disabled={isSubmitting}
                error={errors.question_text?.message}
                required
              />
            )}
          />

          {/* 単一/複数選択 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              問題の種類
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  {...register('is_multiple_choice')}
                  value="false"
                  disabled={isSubmitting}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">単一選択</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  {...register('is_multiple_choice')}
                  value="true"
                  disabled={isSubmitting}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">複数選択</span>
              </label>
            </div>
            <p className="text-xs text-gray-500">
              {isMultipleChoice
                ? '複数の正解を選択できます'
                : '正解は1つだけ選択してください'}
            </p>
          </div>

          {/* 選択肢 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                選択肢 <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleAddChoice}
                disabled={isSubmitting || fields.length >= 6}
              >
                <Plus className="h-4 w-4 mr-1" />
                選択肢を追加
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start space-x-2">
                  {/* 正解チェック */}
                  <div className="flex items-center pt-2">
                    <input
                      type={isMultipleChoice ? 'checkbox' : 'radio'}
                      {...register(`choices.${index}.is_correct` as const)}
                      disabled={isSubmitting}
                      className="w-5 h-5 text-green-600 focus:ring-green-500"
                      title="正解として設定"
                    />
                  </div>

                  {/* 選択肢テキスト */}
                  <div className="flex-1">
                    <Input
                      placeholder={`選択肢 ${index + 1}`}
                      error={errors.choices?.[index]?.choice_text?.message}
                      {...register(`choices.${index}.choice_text` as const)}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* 削除ボタン */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveChoice(index)}
                    disabled={isSubmitting || fields.length <= 2}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-0.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {errors.choices && typeof errors.choices.message === 'string' && (
              <p className="text-sm text-red-600" role="alert">
                {errors.choices.message}
              </p>
            )}

            <div className="flex items-start space-x-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-md">
              <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">正解の設定方法</p>
                <p>
                  各選択肢の左側の{isMultipleChoice ? 'チェックボックス' : 'ラジオボタン'}
                  をクリックして、正解を設定してください。
                  {isMultipleChoice
                    ? '複数選択できます。'
                    : '1つだけ選択してください。'}
                </p>
              </div>
            </div>
          </div>

          {/* 解説（リッチテキストエディタ） */}
          <Controller
            name="explanation"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                label="解説（任意）"
                content={field.value}
                onChange={field.onChange}
                placeholder="問題の解説を入力してください。太字、リスト、コードブロックなどが使用できます。"
                disabled={isSubmitting}
                error={errors.explanation?.message}
              />
            )}
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
        <Button type="submit" form="question-form" isLoading={isSubmitting}>
          {isEditMode ? '更新' : '作成'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}