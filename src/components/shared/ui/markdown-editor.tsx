'use client'

import { useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils/cn'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
}

export function MarkdownEditor({
  content,
  onChange,
  placeholder = 'Markdownを入力...',
  disabled = false,
  error,
  label,
  required = false,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`
    }
  }, [content])

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          'border rounded-md overflow-hidden',
          error ? 'border-red-500' : 'border-gray-300',
          disabled && 'bg-gray-50 opacity-60'
        )}
      >
        {/* エディタとプレビューを左右に並べて表示 */}
        <div className="grid grid-cols-2 divide-x divide-gray-300">
          {/* 左側：エディタ */}
          <div className="relative">
            <div className="absolute top-2 left-2 text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 z-10">
              入力
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'w-full px-3 pt-12 pb-3 resize-none focus:outline-none',
                'font-mono text-sm min-h-[200px] h-full',
                'disabled:cursor-not-allowed disabled:bg-gray-50'
              )}
            />
          </div>

          {/* 右側：プレビュー */}
          <div className="relative bg-gray-50">
            <div className="absolute top-2 left-2 text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 z-10">
              プレビュー
            </div>
            <div className="prose prose-sm max-w-none p-3 pt-12 min-h-[200px] overflow-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {content || '*プレビュー内容がありません*'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* ヘルプテキスト */}
      {!error && (
        <p className="text-xs text-gray-500">
          Markdown記法が使用できます（**太字**、- リスト、```コードブロック```など）
        </p>
      )}
    </div>
  )
}
