'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, LayoutList, Filter, Eye } from 'lucide-react'
import { QuestionFormModal } from '@/components/admin/questions/question-form-modal'
import { DeleteConfirmationDialog } from '@/components/admin/questions/delete-confirmation-dialog'
import { EmptyState } from '@/components/shared/ui/empty-state'
import { getTextPreview, stripHtml } from '@/lib/utils/html'
import { motion, AnimatePresence } from 'framer-motion'

type QuestionSet = { id: string; name: string; certification: { id: string; name: string } | null }
type Choice = { id: string; choice_text: string; is_correct: boolean | null; order_index: number | null }
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

export function QuestionList({ initialQuestions, questionSets }: QuestionListProps) {
  const router = useRouter()
  const [selectedCertificationId, setSelectedCertificationId] = useState<string>('all')
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState<string>('all')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithRelations | null>(null)
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null)

  const handleRefresh = () => router.refresh()

  const uniqueCertifications = Array.from(
    new Map(
      questionSets.map(qs => qs.certification).filter((cert): cert is { id: string; name: string } => cert !== null).map(cert => [cert.id, cert])
    ).values()
  )

  const filteredQuestionSets = selectedCertificationId === 'all'
    ? questionSets
    : questionSets.filter((qs) => qs.certification?.id === selectedCertificationId)

  let filteredQuestions = initialQuestions
  if (selectedCertificationId !== 'all') {
    filteredQuestions = filteredQuestions.filter((q) => q.question_set?.certification?.id === selectedCertificationId)
  }
  if (selectedQuestionSetId !== 'all') {
    filteredQuestions = filteredQuestions.filter((q) => q.question_set_id === selectedQuestionSetId)
  }

  const getCorrectChoices = (question: QuestionWithRelations): string[] =>
    question.choices?.filter((c) => c.is_correct).map((c) => c.choice_text) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight">問題管理</h1>
          <p className="text-sm text-gray-500 mt-1">試験問題を登録・管理します ✏️</p>
        </div>
        <button
          onClick={() => { setSelectedQuestion(null); setIsFormModalOpen(true) }}
          className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-teal-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-200 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          問題を追加
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-sm text-gray-500 font-medium">全 {filteredQuestions.length} 件</div>
        <Filter className="h-4 w-4 text-teal-400" />
        <select
          value={selectedCertificationId}
          onChange={(e) => { setSelectedCertificationId(e.target.value); setSelectedQuestionSetId('all') }}
          className="text-sm border-2 border-gray-100 bg-white rounded-xl px-3 py-2 focus:ring-0 focus:border-teal-300 outline-none"
        >
          <option value="all">すべての資格</option>
          {uniqueCertifications.map((cert) => (
            <option key={cert.id} value={cert.id}>{cert.name}</option>
          ))}
        </select>
        <select
          value={selectedQuestionSetId}
          onChange={(e) => setSelectedQuestionSetId(e.target.value)}
          className="text-sm border-2 border-gray-100 bg-white rounded-xl px-3 py-2 focus:ring-0 focus:border-teal-300 outline-none"
        >
          <option value="all">すべての問題集</option>
          {filteredQuestionSets.map((qs) => (
            <option key={qs.id} value={qs.id}>{qs.certification?.name} - {qs.name}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white border-2 border-teal-50 rounded-2xl shadow-sm">
          <EmptyState
            icon={<LayoutList className="h-8 w-8" />}
            title={selectedQuestionSetId === 'all' ? '問題がありません' : 'この問題集の問題がありません'}
            description="新しい問題を追加して始めましょう"
            action={
              <button
                onClick={() => { setSelectedQuestion(null); setIsFormModalOpen(true) }}
                className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-teal-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                問題を追加
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white border-2 border-teal-50 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-teal-50/50 text-teal-700 border-b-2 border-teal-50">
              <tr>
                <th className="px-6 py-4 font-bold">問題文</th>
                <th className="px-6 py-4 font-bold">問題集</th>
                <th className="px-6 py-4 font-bold">種類</th>
                <th className="px-6 py-4 font-bold">選択肢/正解</th>
                <th className="px-6 py-4 text-right font-bold">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {filteredQuestions.map((question) => {
                const correctChoices = getCorrectChoices(question)
                const isExpanded = expandedQuestionId === question.id
                const questionPreview = getTextPreview(question.question_text, 80)
                const fullQuestionText = stripHtml(question.question_text)
                const hasMore = fullQuestionText.length > 80

                return (
                  <tr key={question.id} className="hover:bg-teal-50/50 transition-colors duration-200 group">
                    <td className="px-6 py-4 max-w-xs">
                      <AnimatePresence mode="wait">
                        {isExpanded ? (
                          <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-800 text-xs whitespace-pre-wrap">
                            {fullQuestionText}
                          </motion.div>
                        ) : (
                          <motion.div key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-800 text-xs">
                            {questionPreview}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {hasMore && (
                        <button
                          onClick={() => setExpandedQuestionId(isExpanded ? null : question.id)}
                          className="mt-1 text-xs text-teal-500 hover:text-teal-700 font-medium flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          {isExpanded ? '閉じる' : 'もっと見る'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      <div>{question.question_set?.certification?.name}</div>
                      <div className="text-gray-400">{question.question_set?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${question.is_multiple_choice ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-600'}`}>
                        {question.is_multiple_choice ? '複数' : '単一'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {question.choices?.length || 0} / {correctChoices.length}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => { setSelectedQuestion(question); setIsFormModalOpen(true) }}
                          className="p-2 text-teal-400 hover:text-teal-600 hover:bg-teal-100 rounded-xl transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedQuestion(question); setIsDeleteDialogOpen(true) }}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
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

      <QuestionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleRefresh}
        question={selectedQuestion}
        questionSets={questionSets}
        defaultCertificationId={selectedCertificationId !== 'all' ? selectedCertificationId : undefined}
        defaultQuestionSetId={selectedQuestionSetId !== 'all' ? selectedQuestionSetId : undefined}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleRefresh}
        question={selectedQuestion}
      />
    </div>
  )
}
