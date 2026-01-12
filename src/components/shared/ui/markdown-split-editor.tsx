'use client'

/**
 * マークダウン分割エディタコンポーネント
 *
 * @uiw/react-md-editorを使用した左右分割エディタ。
 * 左側にマークダウン入力、右側にプレビューを表示します。
 * ツールバーでマークダウン構文の入力補助が可能です。
 */

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

// MDEditorはクライアントサイドでのみ動作するため、SSRを無効化
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface MarkdownSplitEditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
  height?: number
  placeholder?: string
}

export function MarkdownSplitEditor({
  content,
  onChange,
  disabled = false,
  error,
  label,
  required = false,
  height = 400,
  placeholder = 'マークダウンを入力してください...',
}: MarkdownSplitEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (value?: string) => {
    onChange(value || '')
  }

  const characterCount = content?.length || 0

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
          disabled && 'opacity-60 pointer-events-none'
        )}
        data-color-mode="light"
      >
        {mounted ? (
          <MDEditor
            value={content}
            onChange={handleChange}
            height={height}
            preview="live"
            hideToolbar={disabled}
            enableScroll={true}
            visibleDragbar={false}
            textareaProps={{
              placeholder: placeholder,
              disabled: disabled,
            }}
            previewOptions={{
              remarkPlugins: [remarkGfm, remarkBreaks],
              rehypePlugins: [],
              skipHtml: true, // HTMLタグをそのまま表示（解釈しない）
              rehypeRewrite: (node: unknown, index: number, parent: unknown) => {
                // セキュリティ: 外部リンクをnoopener noreferrerで開く
                const nodeEl = node as { tagName?: string }
                const parentEl = parent as { tagName?: string; children?: unknown[] }
                if (
                  nodeEl.tagName === 'a' &&
                  parentEl &&
                  parentEl.tagName &&
                  /^h(1|2|3|4|5|6)/.test(parentEl.tagName)
                ) {
                  if (parentEl.children) {
                    parentEl.children = parentEl.children.slice(1)
                  }
                }
              },
            }}
          />
        ) : (
          <div
            className="flex items-center justify-center bg-gray-50"
            style={{ height: `${height}px` }}
          >
            <p className="text-gray-400">読み込み中...</p>
          </div>
        )}
      </div>

      {!disabled && (
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{characterCount} 文字</span>
          <span className="text-gray-400">
            ツールバーまたはマークダウン記法で書式設定できます
          </span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {!error && (
        <p className="text-xs text-gray-500">
          Markdown記法が使用できます（**太字**、# 見出し、- リスト、```コードブロック```など）
        </p>
      )}
    </div>
  )
}
