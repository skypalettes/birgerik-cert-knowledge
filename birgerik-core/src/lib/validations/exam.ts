import { z } from 'zod'

export const examFormSchema = z.object({
  question_set_id: z.string().uuid('問題集を選択してください'),
  question_count: z.number().int().min(1, '1以上を指定してください'),
  time_limit_minutes: z.number().int().min(1, '1分以上を指定してください'),
  passing_score: z.number().int().min(0).max(100, '0〜100の範囲で指定してください'),
})

export const examSchema = examFormSchema

export const updateExamSchema = examSchema.extend({
  id: z.string().uuid(),
})

export type ExamFormInput = z.infer<typeof examFormSchema>
export type UpdateExamInput = z.infer<typeof updateExamSchema>
