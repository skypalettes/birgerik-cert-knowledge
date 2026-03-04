'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react'
import { ExamFormModal } from '@/components/admin/exams/exam-form-modal'
import { DeleteConfirmationDialog } from '@/components/admin/exams/delete-confirmation-dialog'
import { EmptyState } from '@/components/shared/ui/empty-state'

type QuestionSet = { id: string; name: string; certification: { id: string; name: string } | null }

type ExamRow = {
  id: string
  question_set_id: string
  question_count: number
  time_limit_minutes: number
  passing_score: number
  created_at: string | null
  question_set: { id: string; name: string; certification: { id: string; name: string } | null } | null
}

interface ExamListProps {
  initialExams: ExamRow[]
  questionSets: QuestionSet[]
}

export function ExamList({ initialExams, questionSets }: ExamListProps) {
  const router = useRouter()
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState<ExamRow | null>(null)

  const handleRefresh = () => router.refresh()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight">試験管理</h1>
          <p className="text-sm text-gray-500 mt-1">試験のルールを設定します ⏱️</p>
        </div>
        <button
          onClick={() => { setSelectedExam(null); setIsFormModalOpen(true) }}
          className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-teal-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-200 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          試験作成
        </button>
      </div>

      {/* Table */}
      {initialExams.length === 0 ? (
        <div className="bg-white border-2 border-teal-50 rounded-2xl shadow-sm">
          <EmptyState
            icon={<CheckCircle className="h-8 w-8" />}
            title="試験設定がありません"
            description="問題集に試験設定を追加しましょう"
            action={
              <button
                onClick={() => { setSelectedExam(null); setIsFormModalOpen(true) }}
                className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-teal-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                試験作成
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white border-2 border-teal-50 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-teal-50/50 text-teal-700 border-b-2 border-teal-50">
              <tr>
                <th className="px-6 py-4 font-bold">問題集</th>
                <th className="px-6 py-4 font-bold">出題数</th>
                <th className="px-6 py-4 font-bold">制限時間</th>
                <th className="px-6 py-4 font-bold">合格スコア</th>
                <th className="px-6 py-4 text-right font-bold">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {initialExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-teal-50/50 transition-colors duration-200 group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{exam.question_set?.name || '—'}</div>
                    <div className="text-xs text-gray-400">{exam.question_set?.certification?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-teal-100 text-teal-600 px-2 py-1 rounded-md text-xs font-bold">
                      {exam.question_count} 問
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{exam.time_limit_minutes} 分</td>
                  <td className="px-6 py-4">
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold">
                      {exam.passing_score}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => { setSelectedExam(exam); setIsFormModalOpen(true) }}
                        className="p-2 text-teal-400 hover:text-teal-600 hover:bg-teal-100 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedExam(exam); setIsDeleteDialogOpen(true) }}
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

      <ExamFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleRefresh}
        exam={selectedExam}
        questionSets={questionSets}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleRefresh}
        exam={selectedExam as {id: string; question_set?: { name: string } | null} | null}
      />
    </div>
  )
}
