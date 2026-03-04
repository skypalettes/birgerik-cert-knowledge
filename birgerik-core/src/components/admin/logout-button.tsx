'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { logout } from '@/app/admin/login/actions'

export function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      const result = await logout()
      if (result.success) {
        toast.success('ログアウトしました')
        router.push('/admin/login')
        router.refresh()
      } else {
        toast.error(result.error || 'ログアウトに失敗しました')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('ログアウト処理中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="ログアウト"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <LogOut className="h-5 w-5" />
      )}
    </button>
  )
}
