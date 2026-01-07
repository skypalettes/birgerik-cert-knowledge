'use client'

import { Badge } from '@/components/shared/ui/badge'
import { FileQuestion } from 'lucide-react'
import { MarkdownRenderer } from '@/components/shared/ui/markdown-renderer'

interface QuestionDisplayProps {
  questionNumber: number
  totalQuestions: number
  questionText: string
  isMultipleChoice: boolean
}

export function QuestionDisplay({
  questionNumber,
  totalQuestions,
  questionText,
  isMultipleChoice,
}: QuestionDisplayProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileQuestion className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              問題 {questionNumber} / {totalQuestions}
            </p>
          </div>
        </div>
        
        <Badge variant={isMultipleChoice ? 'warning' : 'info'} className="text-xs">
          {isMultipleChoice ? '複数選択' : '単一選択'}
        </Badge>
      </div>
      
      {/* 問題文 */}
      <div className="prose prose-sm max-w-none text-gray-900">
        <MarkdownRenderer content={questionText} />
      </div>
      
      {/* 注意事項 */}
      {isMultipleChoice && (
        <div className="mt-4 text-sm text-yellow-700 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <p className="font-medium">複数選択問題</p>
          <p className="mt-1">正解と思われる選択肢をすべて選んでください。</p>
        </div>
      )}
    </div>
  )
}