'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, Edit3 } from 'lucide-react'
import { Modal, ModalFooter } from '@/components/shared/ui/modal'
import { toast } from '@/lib/utils/toast'
import { createUser, updateUser } from '@/lib/actions/users'

const editSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください').or(z.literal('')),
  role: z.enum(['admin', 'question_manager', 'user']),
})

type EditFormValues = z.infer<typeof editSchema>

type UserRow = {
  id: string
  email?: string
  role?: string
  created_at?: string
}

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: UserRow | null
}

export function UserFormModal({ isOpen, onClose, onSuccess, user }: UserFormModalProps) {
  const isEdit = !!user

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'user',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          email: user.email || '',
          password: '',
          role: (user.role as 'admin' | 'question_manager' | 'user') || 'user',
        })
      } else {
        reset({ email: '', password: '', role: 'user' })
      }
    }
  }, [isOpen, user, reset])

  const onSubmit = async (data: EditFormValues) => {
    try {
      if (isEdit && user) {
        const updates: { email?: string; password?: string; role?: string } = {
          email: data.email,
          role: data.role,
        }
        if (data.password) updates.password = data.password
        const result = await updateUser(user.id, updates)
        if (result.success) {
          toast.success('ユーザーを更新しました')
          onSuccess()
          onClose()
        } else {
          toast.error(result.error || '更新に失敗しました')
        }
      } else {
        const result = await createUser({ email: data.email, password: data.password, role: data.role })
        if (result.success) {
          toast.success('ユーザーを作成しました')
          onSuccess()
          onClose()
        } else {
          toast.error(result.error || '作成に失敗しました')
        }
      }
    } catch {
      toast.error(isEdit ? '更新に失敗しました' : '作成に失敗しました')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'ユーザーを編集' : 'ユーザーを作成'}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            メールアドレス <span className="text-red-400">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="user@example.com"
            className="w-full px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:border-teal-300 focus:outline-none transition-colors"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            パスワード {isEdit ? '' : <span className="text-red-400">*</span>}
          </label>
          {isEdit && (
            <p className="text-xs text-gray-400 mb-1">変更しない場合は空欄のままにしてください</p>
          )}
          <input
            {...register('password')}
            type="password"
            placeholder={isEdit ? '新しいパスワード（任意）' : 'パスワード（8文字以上）'}
            className="w-full px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:border-teal-300 focus:outline-none transition-colors"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            ロール <span className="text-red-400">*</span>
          </label>
          <select
            {...register('role')}
            className="w-full px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:border-teal-300 focus:outline-none transition-colors bg-white"
          >
            <option value="admin">管理者</option>
            <option value="question_manager">問題管理者</option>
            <option value="user">ユーザー</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
          )}
        </div>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 hover:-translate-y-0.5 rounded-full transition-all disabled:opacity-50"
          >
            {isEdit ? (
              <>
                <Edit3 className="w-4 h-4" />
                {isSubmitting ? '更新中...' : '更新する'}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                {isSubmitting ? '作成中...' : '作成する'}
              </>
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
