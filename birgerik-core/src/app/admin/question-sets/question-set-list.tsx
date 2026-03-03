'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, FolderHeart } from 'lucide-react'
import { QuestionSetFormModal } from '@/components/admin/question-sets/question-set-form-modal'
import { DeleteConfirmationDialog } from '@/components/admin/question-sets/delete-confirmation-dialog'
import { EmptyState } from '@/components/shared/ui/empty-state'
import { toast } from '@/lib/utils/toast'
import { toggleQuestionSetActive } from '@/lib/actions/question-sets'

type Certification = { id: string; name: string }

type QuestionSetRow = {
  id: string
  name: string
  description: string | null
  certification_id: string
  is_active: boolean
  created_at: string | null
  certification: { id: string; name: string } | null
  questions: { count: number }[] | null
}

interface QuestionSetListProps {
  initialQuestionSets: QuestionSetRow[]
  certifications: Certification[]
}

export function QuestionSetList({ initialQuestionSets, certifications }: QuestionSetListProps) {
  const router = useRouter()
  // toggle の楽観的 UI 用オーバーライドのみ state で管理。
  // initialQuestionSets は router.refresh() 後に更新される props を直接使用。
  const [optimisticActive, setOptimisticActive] = useState<Record<string, boolean>>({})
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<QuestionSetRow | null>(null)

  const handleRefresh = () => router.refresh()

  const handleEdit = (qs: QuestionSetRow) => {
    setSelectedQuestionSet(qs)
    setIsFormModalOpen(true)
  }

  const handleDelete = (qs: QuestionSetRow) => {
    setSelectedQuestionSet(qs)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleActive = async (qs: QuestionSetRow) => {
    const currentActive = optimisticActive[qs.id] !== undefined ? optimisticActive[qs.id] : qs.is_active
    const newActive = !currentActive
    setOptimisticActive((prev) => ({ ...prev, [qs.id]: newActive }))
    try {
      const result = await toggleQuestionSetActive(qs.id, newActive)
      if (!result.success) {
        setOptimisticActive((prev) => { const next = { ...prev }; delete next[qs.id]; return next })
        toast.error(result.error || '更新に失敗しました')
      } else {
        setOptimisticActive((prev) => { const next = { ...prev }; delete next[qs.id]; return next })
        router.refresh()
      }
    } catch {
      setOptimisticActive((prev) => { const next = { ...prev }; delete next[qs.id]; return next })
      toast.error('更新に失敗しました')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight">問題集管理</h1>
          <p className="text-sm text-gray-500 mt-1">学習に使用する問題セットを管理します 📚</p>
        </div>
        <button
          onClick={() => { setSelectedQuestionSet(null); setIsFormModalOpen(true) }}
          className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-teal-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-200 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          新規作成
        </button>
      </div>

      {/* Table */}
      {initialQuestionSets.length === 0 ? (
        <div className="bg-white border-2 border-teal-50 rounded-2xl shadow-sm">
          <EmptyState
            icon={<FolderHeart className="h-8 w-8" />}
            title="問題集がありません"
            description="新しい問題集を追加して始めましょう"
            action={
              <button
                onClick={() => { setSelectedQuestionSet(null); setIsFormModalOpen(true) }}
                className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-teal-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                新規作成
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white border-2 border-teal-50 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-teal-50/50 text-teal-700 border-b-2 border-teal-50">
              <tr>
                <th className="px-6 py-4 font-bold">問題集名</th>
                <th className="px-6 py-4 font-bold">対象資格</th>
                <th className="px-6 py-4 font-bold">問題数</th>
                <th className="px-6 py-4 font-bold">公開</th>
                <th className="px-6 py-4 text-right font-bold">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {initialQuestionSets.map((qs) => {
                const count = qs.questions?.[0]?.count || 0
                const isActive = optimisticActive[qs.id] !== undefined ? optimisticActive[qs.id] : qs.is_active
                return (
                  <tr key={qs.id} className="hover:bg-teal-50/50 transition-colors duration-200 group">
                    <td className="px-6 py-4 font-bold text-gray-800">{qs.name}</td>
                    <td className="px-6 py-4 text-gray-500">{qs.certification?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-teal-100 text-teal-600 px-2 py-1 rounded-md text-xs font-bold">
                        {count} 問
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(qs)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:ring-offset-2 ${isActive ? 'bg-teal-400' : 'bg-gray-200'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${isActive ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleEdit(qs)}
                          className="p-2 text-teal-400 hover:text-teal-600 hover:bg-teal-100 rounded-xl transition-all"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(qs)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <QuestionSetFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleRefresh}
        questionSet={selectedQuestionSet}
        certifications={certifications}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleRefresh}
        questionSet={selectedQuestionSet}
      />
    </div>
  )
}
