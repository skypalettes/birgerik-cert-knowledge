'use client'

import { useActionState } from 'react'
import { BookHeart, Mail, Lock, Loader2 } from 'lucide-react'
import { login } from './actions'
import type { LoginFormState } from './actions'

const initialState: LoginFormState = { success: false }

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-teal-200 border-2 border-teal-50 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center bg-teal-100 text-teal-500 p-3 rounded-2xl mb-4">
              <BookHeart className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight">
              Birgerik Core
            </h1>
            <p className="text-sm text-gray-500 mt-1">管理画面へログイン</p>
          </div>

          {/* Form */}
          <form action={formAction} className="px-8 pb-8 space-y-4">
            {/* Error message */}
            {state.error && (
              <div className="p-3 bg-red-50 border-2 border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-medium text-center">{state.error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-700"
              >
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-teal-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isPending}
                  placeholder="admin@example.com"
                  className="block w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:border-teal-300 focus:bg-white focus:outline-none transition-colors duration-200 disabled:opacity-60"
                />
              </div>
              {state.fieldErrors?.email && (
                <p className="text-xs text-red-500 font-medium">{state.fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-700"
              >
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-teal-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isPending}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:border-teal-300 focus:bg-white focus:outline-none transition-colors duration-200 disabled:opacity-60"
                />
              </div>
              {state.fieldErrors?.password && (
                <p className="text-xs text-red-500 font-medium">{state.fieldErrors.password[0]}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 text-white py-3 rounded-full text-sm font-bold hover:bg-teal-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-200 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  ログイン中...
                </>
              ) : (
                'ログイン'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Birgerik Core Admin &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
