/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, ModalFooter } from '@/components/shared/ui/modal'
import { Input } from '@/components/shared/ui/input'
import { MarkdownSplitEditor } from '@/components/shared/ui/markdown-split-editor'
import { QuestionPreviewModal } from './question-preview'
import { toast } from '@/lib/utils/toast'
import { Plus, Trash2, CheckCircle2, GripVertical, Eye, Sparkles } from 'lucide-react'
import { questionFormSchema, type QuestionFormInput } from '@/lib/validations/question'
import { createQuestion, updateQuestion } from '@/lib/actions/questions'
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type QuestionSet = { id: string; name: string; certification: { id: string; name: string } | null }
type Choice = { id: string; choice_text: string; is_correct: boolean | null; order_index: number | null }
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
  defaultCertificationId?: string
  defaultQuestionSetId?: string
}

function SortableChoiceItem({
  id, index, isMultipleChoice, control, register, errors, isSubmitting, onRemove, canRemove, onCorrectChange,
}: {
  id: string; index: number; isMultipleChoice: boolean; control: any; register: any; errors: any; isSubmitting: boolean; onRemove: () => void; canRemove: boolean; onCorrectChange: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start space-x-2 bg-white rounded-xl">
      <button type="button" className="p-2 text-gray-300 hover:text-teal-400 cursor-grab active:cursor-grabbing mt-0.5" {...attributes} {...listeners} disabled={isSubmitting}>
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex items-center pt-2">
        <Controller
          name={`choices.${index}.is_correct`}
          control={control}
          render={({ field }) => (
            <input
              type={isMultipleChoice ? 'checkbox' : 'radio'}
              checked={field.value || false}
              onChange={(e) => { field.onChange(e.target.checked); if (!isMultipleChoice) onCorrectChange(index) }}
              disabled={isSubmitting}
              className="w-5 h-5 text-teal-500 focus:ring-teal-400"
            />
          )}
        />
      </div>
      <div className="flex-1">
        <Input
          placeholder={`選択肢 ${index + 1}`}
          error={errors?.choices?.[index]?.choice_text?.message}
          {...register(`choices.${index}.choice_text`)}
          disabled={isSubmitting}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={isSubmitting || !canRemove}
        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl mt-0.5 transition-all disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

export function QuestionFormModal({
  isOpen, onClose, onSuccess, question, questionSets, defaultCertificationId, defaultQuestionSetId,
}: QuestionFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editorKey, setEditorKey] = useState(0)
  const [selectedCertificationId, setSelectedCertificationId] = useState<string>('')
  const isEditMode = !!question

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<QuestionFormInput>({
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

  const { fields, append, remove, move } = useFieldArray({ control, name: 'choices' })
  const isMultipleChoice = watch('is_multiple_choice')
  const watchedValues = watch()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const uniqueCertifications = Array.from(
    new Map(
      questionSets.map(qs => qs.certification).filter((cert): cert is { id: string; name: string } => cert !== null).map(cert => [cert.id, cert])
    ).values()
  )

  const filteredQuestionSets = selectedCertificationId
    ? questionSets.filter((qs) => qs.certification?.id === selectedCertificationId)
    : questionSets

  useEffect(() => {
    if (isOpen) {
      if (question?.question_set?.certification?.id) {
        setSelectedCertificationId(question.question_set.certification.id)
      } else if (defaultCertificationId) {
        setSelectedCertificationId(defaultCertificationId)
      } else {
        setSelectedCertificationId('')
      }
      reset({
        question_set_id: question?.question_set_id || defaultQuestionSetId || (questionSets.length > 0 ? questionSets[0].id : ''),
        question_text: question?.question_text || '',
        explanation: question?.explanation || '',
        is_multiple_choice: question?.is_multiple_choice ?? false,
        choices: question?.choices?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map((choice) => ({
          choice_text: choice.choice_text,
          is_correct: choice.is_correct || false,
          order_index: choice.order_index || 0,
        })) || [
          { choice_text: '', is_correct: false, order_index: 0 },
          { choice_text: '', is_correct: false, order_index: 1 },
        ],
      })
      setEditorKey((prev) => prev + 1)
    }
  }, [isOpen, question, questionSets, defaultCertificationId, defaultQuestionSetId, reset])

  useEffect(() => {
    if (isMultipleChoice === false) {
      const correctChoices = watchedValues.choices.filter((c) => c.is_correct)
      if (correctChoices.length > 1) {
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
      const formattedData = { ...data, choices: data.choices.map((choice, index) => ({ ...choice, order_index: index })) }
      const result = isEditMode && question ? await updateQuestion(question.id, formattedData) : await createQuestion(formattedData)
      if (result.success) {
        toast.success(isEditMode ? '問題を更新しました' : '問題を作成しました')
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

  const handleClose = () => { if (!isSubmitting) { reset(); onClose() } }

  const handleAddChoice = () => {
    if (fields.length < 6) {
      append({ choice_text: '', is_correct: false, order_index: fields.length })
    } else {
      toast.error('選択肢は最大6つまでです')
    }
  }

  const handleRemoveChoice = (index: number) => {
    if (fields.length > 2) { remove(index) } else { toast.error('選択肢は最低2つ必要です') }
  }

  const handleCorrectChange = (selectedIndex: number) => {
    if (!isMultipleChoice) {
      fields.forEach((_, index) => { if (index !== selectedIndex) setValue(`choices.${index}.is_correct`, false) })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id)
      const newIndex = fields.findIndex((field) => field.id === over.id)
      move(oldIndex, newIndex)
    }
  }

  const handleOpenPreview = () => {
    if (!watchedValues.question_text || watchedValues.question_text.trim() === '') {
      toast.error('問題文を入力してください')
      return
    }
    if (watchedValues.choices.some((choice) => !choice.choice_text || choice.choice_text.trim() === '')) {
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
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            {isEditMode ? '問題を編集' : '問題を追加'}
          </span> as unknown as string
        }
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} id="question-form" className="space-y-6">
          {/* 資格選択 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">資格</label>
            <select
              value={selectedCertificationId}
              onChange={(e) => { setSelectedCertificationId(e.target.value); setValue('question_set_id', '') }}
              disabled={isSubmitting}
              className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:border-teal-300 focus:bg-white focus:outline-none transition-colors duration-200 disabled:opacity-60"
            >
              <option value="">すべての資格</option>
              {uniqueCertifications.map((cert) => (
                <option key={cert.id} value={cert.id}>{cert.name}</option>
              ))}
            </select>
          </div>

          {/* 問題集選択 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">
              問題集 <span className="text-red-400">*</span>
            </label>
            <select
              {...register('question_set_id')}
              disabled={isSubmitting}
              className={`block w-full rounded-xl border-2 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:bg-white focus:outline-none transition-colors duration-200 disabled:opacity-60 ${errors.question_set_id ? 'border-red-300' : 'border-gray-100 focus:border-teal-300'}`}
            >
              <option value="">問題集を選択してください</option>
              {filteredQuestionSets.map((qs) => (
                <option key={qs.id} value={qs.id}>{qs.certification?.name} - {qs.name}</option>
              ))}
            </select>
            {errors.question_set_id && (
              <p className="text-xs text-red-500 font-medium">{errors.question_set_id.message}</p>
            )}
          </div>

          {/* 問題文（Markdownエディタ） */}
          <Controller
            name="question_text"
            control={control}
            render={({ field }) => (
              <MarkdownSplitEditor
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
            <label className="block text-sm font-bold text-gray-700">問題の種類</label>
            <Controller
              name="is_multiple_choice"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={field.value === false} onChange={() => field.onChange(false)} disabled={isSubmitting} className="w-4 h-4 text-teal-500 focus:ring-teal-400" />
                    <span className="text-sm font-medium text-gray-700">単一選択</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={field.value === true} onChange={() => field.onChange(true)} disabled={isSubmitting} className="w-4 h-4 text-teal-500 focus:ring-teal-400" />
                    <span className="text-sm font-medium text-gray-700">複数選択</span>
                  </label>
                </div>
              )}
            />
            <p className="text-xs text-gray-400">
              {isMultipleChoice ? '複数の正解を選択できます' : '正解は1つだけ選択してください'}
            </p>
          </div>

          {/* 選択肢 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-gray-700">
                選択肢 <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddChoice}
                disabled={isSubmitting || fields.length >= 6}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-40"
              >
                <Plus className="h-3 w-3" />
                選択肢を追加
              </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
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
              <p className="text-xs text-red-500 font-medium">{errors.choices.message}</p>
            )}

            <div className="flex items-start gap-2 text-xs text-gray-500 bg-teal-50 p-3 rounded-xl">
              <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-teal-700">選択肢の操作方法</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li><GripVertical className="inline h-3 w-3" /> アイコンをドラッグして順序を変更</li>
                  <li>{isMultipleChoice ? 'チェックボックス' : 'ラジオボタン'}で正解を設定{isMultipleChoice ? '（複数可）' : '（1つのみ）'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 解説（Markdownエディタ） */}
          <Controller
            name="explanation"
            control={control}
            render={({ field }) => (
              <MarkdownSplitEditor
                key={`${editorKey}-explanation`}
                label="解説（任意）"
                content={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                error={errors.explanation?.message}
              />
            )}
          />
        </form>

        <ModalFooter>
          <button type="button" onClick={handleOpenPreview} disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-teal-600 hover:bg-teal-50 rounded-full transition-colors disabled:opacity-50">
            <Eye className="h-4 w-4" />
            プレビュー
          </button>
          <button type="button" onClick={handleClose} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
            キャンセル
          </button>
          <button type="submit" form="question-form" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-teal-400 hover:bg-teal-500 hover:-translate-y-0.5 hover:shadow-md hover:shadow-teal-200 rounded-full transition-all disabled:opacity-50">
            {isSubmitting ? '処理中...' : isEditMode ? '更新する' : '作成する'}
          </button>
        </ModalFooter>
      </Modal>

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
