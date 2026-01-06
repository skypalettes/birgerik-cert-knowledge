/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, ModalFooter } from '@/components/shared/ui/modal'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { MarkdownEditor } from '@/components/shared/ui/markdown-editor'
import { QuestionPreviewModal } from './question-preview'
import { toast } from '@/lib/utils/toast'
import { Plus, Trash2, CheckCircle2, GripVertical, Eye } from 'lucide-react'
import {
  questionFormSchema,
  type QuestionFormInput,
} from '@/lib/validations/question'
import {
  createQuestion,
  updateQuestion,
} from '@/app/admin/questions/actions'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

// ソート可能な選択肢アイテムコンポーネント
function SortableChoiceItem({
  id,
  index,
  isMultipleChoice,
  control,
  register,
  errors,
  isSubmitting,
  onRemove,
  canRemove,
  onCorrectChange,
}: {
  id: string
  index: number
  isMultipleChoice: boolean
  control: any
  register: any
  errors: any
  isSubmitting: boolean
  onRemove: () => void
  canRemove: boolean
  onCorrectChange: (index: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start space-x-2 bg-white rounded-md"
    >
      {/* ドラッグハンドル */}
      <button
        type="button"
        className="p-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-0.5"
        {...attributes}
        {...listeners}
        disabled={isSubmitting}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* 正解チェック */}
      <div className="flex items-center pt-2">
        <Controller
          name={`choices.${index}.is_correct`}
          control={control}  // ← 追加: controlをpropsから受け取る必要があります
          render={({ field }) => (
            <input
              type={isMultipleChoice ? 'checkbox' : 'radio'}
              checked={field.value || false}  // ← 追加: checked属性で明示的に制御
              onChange={(e) => {
                field.onChange(e.target.checked)
                if (!isMultipleChoice) {
                  onCorrectChange(index)
                }
              }}
              disabled={isSubmitting}
              className="w-5 h-5 text-green-600 focus:ring-green-500"
              title="正解として設定"
            />
          )}
        />
      </div>

      {/* 選択肢テキスト */}
      <div className="flex-1">
        <Input
          placeholder={`選択肢 ${index + 1}`}
          error={errors?.choices?.[index]?.choice_text?.message}
          {...register(`choices.${index}.choice_text`)}
          disabled={isSubmitting}
        />
      </div>

      {/* 削除ボタン */}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onRemove}
        disabled={isSubmitting || !canRemove}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-0.5"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function QuestionFormModal({
  isOpen,
  onClose,
  onSuccess,
  question,
  questionSets,
}: QuestionFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const isEditMode = !!question

  const [editorKey, setEditorKey] = useState(0)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
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

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'choices',
  })

  const isMultipleChoice = watch('is_multiple_choice')
  const watchedValues = watch()

  // ドラッグ&ドロップセンサーの設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (isOpen) {
      reset({
        question_set_id: question?.question_set_id || (questionSets.length > 0 ? questionSets[0].id : ''),
        question_text: question?.question_text || '',
        explanation: question?.explanation || '',
        is_multiple_choice: question?.is_multiple_choice ?? true,
        choices:
          question?.choices
            ?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            .map((choice) => ({
              choice_text: choice.choice_text,
              is_correct: choice.is_correct || false,
              order_index: choice.order_index || 0,
            })) || [
            { choice_text: '', is_correct: false, order_index: 0 },
            { choice_text: '', is_correct: false, order_index: 1 },
          ],
      })
      // エディタをリセットするためにキーを更新
      setEditorKey((prev) => prev + 1)
    }
  }, [isOpen, question, questionSets, reset])

  useEffect(() => {
    if (isMultipleChoice === false) {
      // 単一選択に変更された場合、複数の正解があればリセット
      const correctChoices = watchedValues.choices.filter((c) => c.is_correct)
      if (correctChoices.length > 1) {
        // 最初の正解のみ残して他をfalseに
        watchedValues.choices.forEach((_, index) => {
          if (index !== watchedValues.choices.findIndex((c) => c.is_correct)) {
            setValue(`choices.${index}.is_correct`, false)
          }
        })
      }
    }
  }, [isMultipleChoice, watchedValues.choices, setValue])


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

  const handleCorrectChange = (selectedIndex: number) => {
    if (!isMultipleChoice) {
      // 単一選択の場合、選択されたもの以外をfalseに設定
      fields.forEach((_, index) => {
        if (index !== selectedIndex) {
          setValue(`choices.${index}.is_correct`, false)
        }
      })
    }
  }

  // ドラッグ終了時の処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id)
      const newIndex = fields.findIndex((field) => field.id === over.id)

      move(oldIndex, newIndex)
    }
  }

  // プレビューを開く
  const handleOpenPreview = () => {
    // 問題文が空の場合は警告
    if (!watchedValues.question_text || watchedValues.question_text.trim() === '') {
      toast.error('問題文を入力してください')
      return
    }

    // 選択肢が空の場合は警告
    const hasEmptyChoice = watchedValues.choices.some(
      (choice) => !choice.choice_text || choice.choice_text.trim() === ''
    )
    if (hasEmptyChoice) {
      toast.error('すべての選択肢を入力してください')
      return
    }

    setIsPreviewOpen(true)
  }

  return (
    <>
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

            {/* 問題文（Markdownエディタ） */}
            <Controller
              name="question_text"
              control={control}
              render={({ field }) => (
                <MarkdownEditor
                  key={`${editorKey}-question`}
                  label="問題文"
                  content={field.value}
                  onChange={field.onChange}
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
              <Controller
                name="is_multiple_choice"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={field.value === false}  // boolean値で比較
                        onChange={() => field.onChange(false)}  // boolean値を直接設定
                        disabled={isSubmitting}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">単一選択</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={field.value === true}  // boolean値で比較
                        onChange={() => field.onChange(true)}  // boolean値を直接設定
                        disabled={isSubmitting}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">複数選択</span>
                    </label>
                  </div>
                )}
              />
              <p className="text-xs text-gray-500">
                {isMultipleChoice
                  ? '複数の正解を選択できます'
                  : '正解は1つだけ選択してください'}
              </p>
            </div>

            {/* 選択肢（ドラッグ&ドロップ対応） */}
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

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((field) => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <SortableChoiceItem
                        key={field.id}
                        id={field.id}
                        index={index}
                        isMultipleChoice={isMultipleChoice}
                        control={control}
                        register={register}
                        errors={errors}
                        isSubmitting={isSubmitting}
                        onRemove={() => handleRemoveChoice(index)}
                        canRemove={fields.length > 2}
                        onCorrectChange={handleCorrectChange}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {errors.choices && typeof errors.choices.message === 'string' && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.choices.message}
                </p>
              )}

              <div className="flex items-start space-x-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-md">
                <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">選択肢の操作方法</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>
                      <GripVertical className="inline h-3 w-3" /> 
                      アイコンをドラッグして順序を変更
                    </li>
                    <li>
                      {isMultipleChoice ? 'チェックボックス' : 'ラジオボタン'}
                      で正解を設定
                      {isMultipleChoice ? '（複数可）' : '（1つのみ）'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 解説（Markdownエディタ） */}
            <Controller
              name="explanation"
              control={control}
              render={({ field }) => (
                <MarkdownEditor
                  key={`${editorKey}-explanation`}
                  label="解説（任意）"
                  content={field.value}
                  onChange={field.onChange}
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
            variant="outline"
            onClick={handleOpenPreview}
            disabled={isSubmitting}
          >
            <Eye className="h-4 w-4 mr-2" />
            プレビュー
          </Button>
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

      {/* プレビューモーダル */}
      <QuestionPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        question={{
          question_text: watchedValues.question_text || '',
          explanation: watchedValues.explanation || '',
          is_multiple_choice: watchedValues.is_multiple_choice,
          choices: watchedValues.choices.map((choice) => ({
            choice_text: choice.choice_text,
            is_correct: choice.is_correct,
          })),
        }}
      />
    </>
  )
}