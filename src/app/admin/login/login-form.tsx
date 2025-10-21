'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { login, redirectToAdmin, type LoginFormState } from './actions'
import { Button } from '@/components/shared/ui/button'
import { Loader2 } from 'lucide-react'

const initialState: LoginFormState = {
  success: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ログイン中...
        </>
      ) : (
        'ログイン'
      )}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, initialState)

  useEffect(() => {
    if (state.success) {
      toast.success('ログインしました')
      // リダイレクト
      redirectToAdmin()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-6">
      {/* メールアドレス */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={`
            w-full px-4 py-2 border rounded-md shadow-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${state.fieldErrors?.email ? 'border-red-500' : 'border-gray-300'}
          `}
          placeholder="admin@birgerik.local"
        />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* パスワード */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={`
            w-full px-4 py-2 border rounded-md shadow-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${state.fieldErrors?.password ? 'border-red-500' : 'border-gray-300'}
          `}
          placeholder="••••••••"
        />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* エラーメッセージ */}
      {state.error && !state.fieldErrors && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{state.error}</p>
        </div>
      )}

      {/* 送信ボタン */}
      <SubmitButton />
    </form>
  )
}