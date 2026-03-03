'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Users, Shield, User } from 'lucide-react'
import { UserFormModal } from '@/components/admin/users/user-form-modal'
import { DeleteConfirmationDialog } from '@/components/admin/users/delete-confirmation-dialog'
import { EmptyState } from '@/components/shared/ui/empty-state'

type UserRow = {
  id: string
  email?: string
  role?: string
  created_at?: string
  last_sign_in_at?: string
}

interface UserListProps {
  initialUsers: UserRow[]
}

export function UserList({ initialUsers }: UserListProps) {
  const router = useRouter()
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)

  const handleRefresh = () => router.refresh()

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight">ユーザー管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理者・ユーザーアカウントを管理します 👤</p>
        </div>
        <button
          onClick={() => { setSelectedUser(null); setIsFormModalOpen(true) }}
          className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-teal-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-200 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          ユーザー作成
        </button>
      </div>

      {/* Table */}
      {initialUsers.length === 0 ? (
        <div className="bg-white border-2 border-teal-50 rounded-2xl shadow-sm">
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="ユーザーがいません"
            description="最初のユーザーを作成しましょう"
            action={
              <button
                onClick={() => { setSelectedUser(null); setIsFormModalOpen(true) }}
                className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-teal-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                ユーザー作成
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white border-2 border-teal-50 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-teal-50/50 text-teal-700 border-b-2 border-teal-50">
              <tr>
                <th className="px-6 py-4 font-bold">メールアドレス</th>
                <th className="px-6 py-4 font-bold">ロール</th>
                <th className="px-6 py-4 font-bold">作成日</th>
                <th className="px-6 py-4 font-bold">最終ログイン</th>
                <th className="px-6 py-4 text-right font-bold">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {initialUsers.map((user) => (
                <tr key={user.id} className="hover:bg-teal-50/50 transition-colors duration-200 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-teal-600">
                          {user.email?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{user.email || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <span className="flex items-center gap-1 bg-teal-100 text-teal-700 px-2 py-1 rounded-md text-xs font-bold w-fit">
                        <Shield className="w-3 h-3" />
                        管理者
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold w-fit">
                        <User className="w-3 h-3" />
                        ユーザー
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(user.last_sign_in_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => { setSelectedUser(user); setIsFormModalOpen(true) }}
                        className="p-2 text-teal-400 hover:text-teal-600 hover:bg-teal-100 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); setIsDeleteDialogOpen(true) }}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleRefresh}
        user={selectedUser}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleRefresh}
        user={selectedUser}
      />
    </div>
  )
}
