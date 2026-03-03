'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Award } from 'lucide-react'
import { CertificationFormModal } from '@/components/admin/certifications/certification-form-modal'
import { DeleteConfirmationDialog } from '@/components/admin/certifications/delete-confirmation-dialog'
import { EmptyState } from '@/components/shared/ui/empty-state'
import { Tables } from '@/lib/supabase/types'

type Certification = Tables<'certifications'>
interface CertificationWithCount extends Certification {
  question_sets: { count: number }[] | null
}

interface CertificationListProps {
  initialCertifications: CertificationWithCount[]
}

export function CertificationList({ initialCertifications }: CertificationListProps) {
  const router = useRouter()
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCertification, setSelectedCertification] = useState<CertificationWithCount | null>(null)

  const handleRefresh = () => router.refresh()

  const handleEdit = (cert: CertificationWithCount) => {
    setSelectedCertification(cert)
    setIsFormModalOpen(true)
  }

  const handleDelete = (cert: CertificationWithCount) => {
    setSelectedCertification(cert)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight">資格管理</h1>
          <p className="text-sm text-gray-500 mt-1">資格試験の種別を管理します 🏆</p>
        </div>
        <button
          onClick={() => { setSelectedCertification(null); setIsFormModalOpen(true) }}
          className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-teal-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-200 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          新規作成
        </button>
      </div>

      {/* Table */}
      {initialCertifications.length === 0 ? (
        <div className="bg-white border-2 border-teal-50 rounded-2xl shadow-sm">
          <EmptyState
            icon={<Award className="h-8 w-8" />}
            title="資格がありません"
            description="新しい資格を追加して始めましょう"
            action={
              <button
                onClick={() => { setSelectedCertification(null); setIsFormModalOpen(true) }}
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
                <th className="px-6 py-4 font-bold">資格名</th>
                <th className="px-6 py-4 font-bold">説明</th>
                <th className="px-6 py-4 font-bold">問題集数</th>
                <th className="px-6 py-4 font-bold">作成日</th>
                <th className="px-6 py-4 text-right font-bold">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {initialCertifications.map((cert) => {
                const questionSetCount = cert.question_sets?.[0]?.count || 0
                return (
                  <tr key={cert.id} className="hover:bg-teal-50/50 transition-colors duration-200 group">
                    <td className="px-6 py-4 font-bold text-gray-800">{cert.name}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {cert.description || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-teal-100 text-teal-600 px-2 py-1 rounded-md text-xs font-bold">
                        {questionSetCount} 件
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(cert.created_at!).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleEdit(cert)}
                          className="p-2 text-teal-400 hover:text-teal-600 hover:bg-teal-100 rounded-xl transition-all"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cert)}
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

      <CertificationFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleRefresh}
        certification={selectedCertification}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleRefresh}
        certification={selectedCertification}
      />
    </div>
  )
}
