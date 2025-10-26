import { z } from 'zod'

/**
 * フォーム用のバリデーションスキーマ
 */
export const questionSetFormSchema = z.object({
  name: z
    .string()
    .min(1, '問題集名は必須です')
    .max(100, '問題集名は100文字以内で入力してください')
    .trim(),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .trim(),
  certification_id: z
    .string()
    .uuid('資格を選択してください')
    .min(1, '資格を選択してください'),
})

/**
 * サーバーアクション用のスキーマ（空文字をnullに変換）
 */
export const questionSetSchema = z.object({
  name: z
    .string()
    .min(1, '問題集名は必須です')
    .max(100, '問題集名は100文字以内で入力してください')
    .trim(),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .transform(val => {
      const trimmed = val.trim()
      return trimmed === '' ? null : trimmed
    }),
  certification_id: z
    .string()
    .uuid('資格を選択してください'),
})

/**
 * フォーム用の型
 */
export type QuestionSetFormInput = z.infer<typeof questionSetFormSchema>

/**
 * サーバーアクション用の型
 */
export type QuestionSetFormData = z.infer<typeof questionSetSchema>

/**
 * 問題集更新用のスキーマ
 */
export const updateQuestionSetSchema = questionSetSchema.extend({
  id: z.string().uuid('無効なIDです'),
})

export type UpdateQuestionSetData = z.infer<typeof updateQuestionSetSchema>