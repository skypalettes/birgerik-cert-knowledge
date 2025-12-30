'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, FileText, Filter } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { EmptyState } from '@/components/shared/ui/empty-state'
import { QuestionSetFormModal } from '@/components/admin/question-sets/question-set-form-modal'
import { DeleteConfirmationDialog } from '@/components/admin/question-sets/delete-confirmation-dialog'
import { Tables } from '@/lib/supabase/types'

type QuestionSet = Tables<'question_sets'>
type Certification = { id: string; name: string }

interface QuestionSetWithRelations extends QuestionSet {
  certification: Certification | null
  questions: { count: number }[] | null
}

interface QuestionSetListProps {
  initialQuestionSets: QuestionSetWithRelations[]
  certifications: Certification[]
}

export function QuestionSetList({
  initialQuestionSets,
  certifications,
}: QuestionSetListProps) {
  const [questionSets] = useState(initialQuestionSets)
  const [selectedCertificationId, setSelectedCertificationId] = useState<string>('all')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<QuestionSet | null>(null)

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleEdit = (questionSet: QuestionSet) => {
    setSelectedQuestionSet(questionSet)
    setIsFormModalOpen(true)
  }

  const handleDelete = (questionSet: QuestionSet) => {
    setSelectedQuestionSet(questionSet)
    setIsDeleteDialogOpen(true)
  }

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false)
    setSelectedQuestionSet(null)
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setSelectedQuestionSet(null)
  }

  const getQuestionCount = (qs: QuestionSetWithRelations): number => {
    if (!qs.questions || qs.questions.length === 0) {
      return 0
    }
    return qs.questions[0].count || 0
  }

  // フィルタリング
  const filteredQuestionSets = selectedCertificationId === 'all'
    ? questionSets
    : questionSets.filter(qs => qs.certification_id === selectedCertificationId)

  return (
    <div className="space-y-6">
      {/* アクションバー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            全 {filteredQuestionSets.length} 件の問題集
          </div>

          {/* 資格フィルター */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCertificationId}
              onChange={(e) => setSelectedCertificationId(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべての資格</option>
              {certifications.map((cert: Certification) => (
                <option key={cert.id} value={cert.id}>
                  {cert.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={() => {
            setSelectedQuestionSet(null)
            setIsFormModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          問題集を追加
        </Button>
      </div>

      {/* 問題集一覧 */}
      {filteredQuestionSets.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8 text-gray-400" />}
          title={
            selectedCertificationId === 'all'
              ? '問題集がありません'
              : 'この資格の問題集がありません'
          }
          description="新しい問題集を追加して始めましょう"
          action={
            <Button
              onClick={() => {
                setSelectedQuestionSet(null)
                setIsFormModalOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              問題集を追加
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestionSets.map((qs: QuestionSetWithRelations) => {
            const questionCount = getQuestionCount(qs)

            return (
              <Card
                key={qs.id}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
                        {qs.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {qs.certification && (
                          <Badge variant="info">
                            {qs.certification.name}
                          </Badge>
                        )}
                        <Badge variant="default">
                          {questionCount} 問題
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* 説明 */}
                  {qs.description && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {qs.description}
                    </p>
                  )}

                  {/* 日時 */}
                  <div className="text-xs text-gray-500 mb-4">
                    作成日: {new Date(qs.created_at!).toLocaleDateString('ja-JP')}
                  </div>

                  {/* アクションボタン */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(qs)}
                      className="flex-1"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      編集
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(qs)}
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
      <QuestionSetFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSuccess={handleRefresh}
        questionSet={selectedQuestionSet}
        certifications={certifications}
      />

      {/* 削除確認ダイアログ */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onSuccess={handleRefresh}
        questionSet={selectedQuestionSet}
      />
    </div>
  )
}