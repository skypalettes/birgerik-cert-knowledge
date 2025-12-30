'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { EmptyState } from '@/components/shared/ui/empty-state'
import { CertificationFormModal } from '@/components/admin/certifications/certification-form-modal'
import { DeleteConfirmationDialog } from '@/components/admin/certifications/delete-confirmation-dialog'
import { Tables } from '@/lib/supabase/types'

type Certification = Tables<'certifications'>

interface CertificationWithCount extends Certification {
  question_sets: { count: number }[] | null
}

interface CertificationListProps {
  initialCertifications: CertificationWithCount[]
}

export function CertificationList({
  initialCertifications,
}: CertificationListProps) {
  const [certifications] = useState(initialCertifications)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null)

  const handleRefresh = () => {
    // ページをリフレッシュしてサーバーから最新データを取得
    window.location.reload()
  }

  const handleEdit = (certification: Certification) => {
    setSelectedCertification(certification)
    setIsFormModalOpen(true)
  }

  const handleDelete = (certification: Certification) => {
    setSelectedCertification(certification)
    setIsDeleteDialogOpen(true)
  }

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false)
    setSelectedCertification(null)
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setSelectedCertification(null)
  }

  const getQuestionSetCount = (cert: CertificationWithCount): number => {
    if (!cert.question_sets || cert.question_sets.length === 0) {
      return 0
    }
    return cert.question_sets[0].count || 0
  }

  return (
    <div className="space-y-6">
      {/* アクションバー */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          全 {certifications.length} 件の資格
        </div>
        <Button
          onClick={() => {
            setSelectedCertification(null)
            setIsFormModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          資格を追加
        </Button>
      </div>

      {/* 資格一覧 */}
      {certifications.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8 text-gray-400" />}
          title="資格がありません"
          description="新しい資格を追加して始めましょう"
          action={
            <Button
              onClick={() => {
                setSelectedCertification(null)
                setIsFormModalOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              最初の資格を追加
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert: CertificationWithCount) => {
            const questionSetCount = getQuestionSetCount(cert)

            return (
              <Card
                key={cert.id}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {cert.name}
                      </h3>
                      <div className="mt-2">
                        <Badge variant="info">
                          {questionSetCount} 問題集
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* 説明 */}
                  {cert.description && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {cert.description}
                    </p>
                  )}

                  {/* 日時 */}
                  <div className="text-xs text-gray-500 mb-4">
                    作成日: {new Date(cert.created_at!).toLocaleDateString('ja-JP')}
                  </div>

                  {/* アクションボタン */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(cert)}
                      className="flex-1"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      編集
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cert)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* フォームモーダル */}
      <CertificationFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSuccess={handleRefresh}
        certification={selectedCertification}
      />

      {/* 削除確認ダイアログ */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onSuccess={handleRefresh}
        certification={selectedCertification}
      />
    </div>
  )
}