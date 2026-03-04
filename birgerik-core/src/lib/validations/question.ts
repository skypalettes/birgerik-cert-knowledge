import { z } from 'zod'

export const choiceSchema = z.object({
  id: z.string().optional(),
  choice_text: z
    .string()
    .min(1, '選択肢のテキストは必須です')
    .max(500, '選択肢は500文字以内で入力してください')
    .trim(),
  is_correct: z.boolean(),
  order_index: z.number().int().min(0),
})

export const questionFormSchema = z.object({
  question_set_id: z
    .string()
    .uuid('問題集を選択してください')
    .min(1, '問題集を選択してください'),
  question_text: z
    .string()
    .min(1, '問題文は必須です')
    .max(2000, '問題文は2000文字以内で入力してください')
    .trim(),
  explanation: z
    .string()
    .max(2000, '解説は2000文字以内で入力してください')
    .trim(),
  is_multiple_choice: z.boolean(),
  choices: z
    .array(choiceSchema)
    .min(2, '選択肢は最低2つ必要です')
    .max(6, '選択肢は最大6つまでです')
    .refine(
      (choices) => choices.some((c) => c.is_correct),
      { message: '少なくとも1つの正解を選択してください' }
    ),
})
.superRefine((data, ctx) => {
  const correctCount = data.choices.filter((c) => c.is_correct).length
  if (!data.is_multiple_choice && correctCount !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '単一選択問題では正解を1つだけ選択してください',
      path: ['choices'],
    })
  }
  if (data.is_multiple_choice && correctCount < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '複数選択問題では少なくとも1つの正解を選択してください',
      path: ['choices'],
    })
  }
})

export const questionSchema = z.object({
  question_set_id: z.string().uuid('問題集を選択してください'),
  question_text: z
    .string()
    .min(1, '問題文は必須です')
    .max(2000, '問題文は2000文字以内で入力してください')
    .trim(),
  explanation: z
    .string()
    .max(2000, '解説は2000文字以内で入力してください')
    .transform((val) => {
      const trimmed = val.trim()
      return trimmed === '' ? null : trimmed
    }),
  is_multiple_choice: z.boolean(),
  order_index: z.number().int().min(0).nullable().optional(),
  choices: z
    .array(choiceSchema)
    .min(2, '選択肢は最低2つ必要です')
    .max(6, '選択肢は最大6つまでです'),
})

export type QuestionFormInput = z.infer<typeof questionFormSchema>
export type ChoiceInput = z.infer<typeof choiceSchema>
export type QuestionFormData = z.infer<typeof questionSchema>

export const updateQuestionSchema = questionSchema.extend({
  id: z.string().uuid('無効なIDです'),
})

export type UpdateQuestionData = z.infer<typeof updateQuestionSchema>
