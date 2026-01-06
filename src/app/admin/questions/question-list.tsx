'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, FileQuestion, Filter, Eye } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { EmptyState } from '@/components/shared/ui/empty-state'
import { QuestionFormModal } from '@/components/admin/questions/question-form-modal'
import { DeleteConfirmationDialog } from '@/components/admin/questions/delete-confirmation-dialog'
import { getTextPreview, stripHtml } from '@/lib/utils/html'
import { motion, AnimatePresence } from 'framer-motion'

type QuestionSet = {
  id: string
  name: string
  certification: { id: string; name: string } | null
}

type Choice = {
  id: string
  choice_text: string
  is_correct: boolean | null
  order_index: number | null
}

interface QuestionWithRelations {
  id: string
  question_set_id: string
  question_text: string
  explanation: string | null
  is_multiple_choice: boolean | null
  order_index: number | null
  created_at: string | null
  updated_at: string | null
  question_set: QuestionSet | null
  choices: Choice[] | null
}

interface QuestionListProps {
  initialQuestions: QuestionWithRelations[]
  questionSets: QuestionSet[]
}

export function QuestionList({
  initialQuestions,
  questionSets,
}: QuestionListProps) {
  const [questions] = useState(initialQuestions)
  const [selectedCertificationId, setSelectedCertificationId] = useState<string>('all')
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState<string>('all')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionWithRelations | null>(null)
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null)

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleEdit = (question: QuestionWithRelations) => {
    setSelectedQuestion(question)
    setIsFormModalOpen(true)
  }

  const handleDelete = (question: QuestionWithRelations) => {
    setSelectedQuestion(question)
    setIsDeleteDialogOpen(true)
  }

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false)
    setSelectedQuestion(null)
    // フィルター状態は維持（削除しない）
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setSelectedQuestion(null)
  }

  // 重複を除いた資格のリストを取得（IDベースで重複除去）
  const uniqueCertifications = Array.from(
    new Map(
      questionSets
        .map(qs => qs.certification)
        .filter((cert): cert is { id: string; name: string } => cert !== null)
        .map(cert => [cert.id, cert])
    ).values()
  )

  // 資格選択に基づいて問題集を絞り込み
  const filteredQuestionSets = selectedCertificationId === 'all'
    ? questionSets
    : questionSets.filter((qs) => qs.certification?.id === selectedCertificationId)

  // フィルタリング
  let filteredQuestions = questions

  // 資格でフィルタリング
  if (selectedCertificationId !== 'all') {
    filteredQuestions = filteredQuestions.filter(
      (q) => q.question_set?.certification?.id === selectedCertificationId
    )
  }

  // 問題集でフィルタリング
  if (selectedQuestionSetId !== 'all') {
    filteredQuestions = filteredQuestions.filter(
      (q) => q.question_set_id === selectedQuestionSetId
    )
  }

  // 正解の選択肢を取得
  const getCorrectChoices = (question: QuestionWithRelations): string[] => {
    if (!question.choices) return []
    return question.choices
      .filter((c: Choice) => c.is_correct)
      .map((c: Choice) => c.choice_text)
  }

  const toggleExpand = (questionId: string) => {
    setExpandedQuestionId(
      expandedQuestionId === questionId ? null : questionId
    )
  }

  return (
    <div className="space-y-6">
      {/* アクションバー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 whitespace-nowrap">
            全 {filteredQuestions.length} 件
          </div>

          {/* 資格フィルター */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <select
              value={selectedCertificationId}
              onChange={(e) => {
                setSelectedCertificationId(e.target.value)
                // 資格を変更したら問題集フィルターをリセット
                setSelectedQuestionSetId('all')
              }}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-40"
            >
              <option value="all">すべての資格</option>
              {uniqueCertifications.map((cert) => (
                <option key={cert.id} value={cert.id}>
                  {cert.name}
                </option>
              ))}
            </select>
          </div>

          {/* 問題集フィルター */}
          <div className="flex items-center gap-2">
            <select
              value={selectedQuestionSetId}
              onChange={(e) => setSelectedQuestionSetId(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
            >
              <option value="all">すべての問題集</option>
              {filteredQuestionSets.map((qs: QuestionSet) => (
                <option key={qs.id} value={qs.id}>
                  {qs.certification?.name} - {qs.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={() => {
            setSelectedQuestion(null)
            setIsFormModalOpen(true)
          }}
          className="whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-2" />
          問題を追加
        </Button>
      </div>

      {/* 問題一覧 */}
      {filteredQuestions.length === 0 ? (
        <EmptyState
          icon={<FileQuestion className="h-8 w-8 text-gray-400" />}
          title={
            selectedQuestionSetId === 'all'
              ? '問題がありません'
              : 'この問題集の問題がありません'
          }
          description="新しい問題を追加して始めましょう"
          action={
            <Button
              onClick={() => {
                setSelectedQuestion(null)
                setIsFormModalOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              問題を追加
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQuestions.map((question: QuestionWithRelations) => {
            const correctChoices = getCorrectChoices(question)
            const isExpanded = expandedQuestionId === question.id
            const questionPreview = getTextPreview(question.question_text, 150)
            const fullQuestionText = stripHtml(question.question_text)
            const hasMore = fullQuestionText.length > 150

            return (
              <Card
                key={question.id}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {question.question_set?.certification && (
                          <Badge variant="info">
                            {question.question_set.certification.name}
                          </Badge>
                        )}
                        {question.question_set && (
                          <Badge variant="default">
                            {question.question_set.name}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            question.is_multiple_choice ? 'warning' : 'success'
                          }
                        >
                          {question.is_multiple_choice ? '複数選択' : '単一選択'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* 問題文 */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      問題文
                    </h3>
                    <div className="text-sm text-gray-900">
                      <AnimatePresence mode="wait">
                        {isExpanded ? (
                          <motion.div
                            key="expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="whitespace-pre-wrap"
                          >
                            {fullQuestionText}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="whitespace-pre-wrap"
                          >
                            {questionPreview}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {hasMore && (
                        <button
                          onClick={() => toggleExpand(question.id)}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          {isExpanded ? '閉じる' : 'もっと見る'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 選択肢数 */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600">
                      選択肢: {question.choices?.length || 0} 個 / 正解:{' '}
                      {correctChoices.length} 個
                    </p>
                  </div>

                  {/* 解説の有無 */}
                  {question.explanation && (
                    <div className="mb-4">
                      <Badge variant="info">解説あり</Badge>
                    </div>
                  )}

                  {/* 日時 */}
                  <div className="text-xs text-gray-500 mb-4">
                    作成日:{' '}
                    {new Date(question.created_at!).toLocaleDateString('ja-JP')}
                  </div>

                  {/* アクションボタン */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(question)}
                      className="flex-1"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      編集
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(question)}
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
      <QuestionFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSuccess={handleRefresh}
        question={selectedQuestion}
        questionSets={questionSets}
        defaultCertificationId={selectedCertificationId !== 'all' ? selectedCertificationId : undefined}
        defaultQuestionSetId={selectedQuestionSetId !== 'all' ? selectedQuestionSetId : undefined}
      />

      {/* 削除確認ダイアログ */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onSuccess={handleRefresh}
        question={selectedQuestion}
      />
    </div>
  )
}