'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Heading2,
  Eye,
  EyeOff,
} from 'lucide-react'
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
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.max(150, textarea.scrollHeight)}px`
    }
  }, [content])

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea || disabled) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end)

    onChange(newText)

    // Set cursor position after inserted text
    setTimeout(() => {
      const newPosition = start + before.length + selectedText.length
      textarea.focus()
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const insertLineMarkdown = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea || disabled) return

    const start = textarea.selectionStart
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    const lineEnd = content.indexOf('\n', start)
    const line = content.substring(
      lineStart,
      lineEnd === -1 ? content.length : lineEnd
    )

    // Check if line already has the prefix
    if (line.startsWith(prefix)) {
      // Remove prefix
      const newText =
        content.substring(0, lineStart) +
        line.substring(prefix.length) +
        content.substring(lineEnd === -1 ? content.length : lineEnd)
      onChange(newText)
    } else {
      // Add prefix
      const newText =
        content.substring(0, lineStart) +
        prefix +
        line +
        content.substring(lineEnd === -1 ? content.length : lineEnd)
      onChange(newText)
    }

    textarea.focus()
  }

  const ToolbarButton = ({
    onClick,
    disabled: btnDisabled,
    children,
    title,
  }: {
    onClick: () => void
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={btnDisabled || disabled}
      title={title}
      className={cn(
        'p-2 rounded hover:bg-gray-100 transition-colors',
        (btnDisabled || disabled) && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )

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
        {/* ツールバー */}
        <div className="flex items-center justify-between gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
          <div className="flex items-center gap-1">
            {/* テキストスタイル */}
            <ToolbarButton
              onClick={() => insertMarkdown('**', '**')}
              title="太字"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => insertMarkdown('*', '*')}
              title="斜体"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => insertMarkdown('`', '`')}
              title="インラインコード"
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* 見出し */}
            <ToolbarButton onClick={() => insertLineMarkdown('## ')} title="見出し">
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* リスト */}
            <ToolbarButton
              onClick={() => insertLineMarkdown('- ')}
              title="箇条書きリスト"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => insertLineMarkdown('1. ')}
              title="番号付きリスト"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* コードブロック */}
            <ToolbarButton
              onClick={() => insertMarkdown('```\n', '\n```')}
              title="コードブロック"
            >
              <Code className="h-4 w-4" />
              <span className="text-xs ml-1">Block</span>
            </ToolbarButton>
          </div>

          {/* プレビュー切り替え */}
          <ToolbarButton
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? 'エディタに戻る' : 'プレビュー'}
          >
            {showPreview ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="text-xs ml-1">
              {showPreview ? 'エディタ' : 'プレビュー'}
            </span>
          </ToolbarButton>
        </div>

        {/* エディタ/プレビュー */}
        {showPreview ? (
          <div className="prose prose-sm max-w-none p-3 min-h-[150px] bg-white overflow-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content || '*プレビュー内容がありません*'}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full px-3 py-2 resize-none focus:outline-none',
              'font-mono text-sm min-h-[150px]',
              'disabled:cursor-not-allowed disabled:bg-gray-50'
            )}
          />
        )}
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
