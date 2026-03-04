'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

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
        <label className="block text-sm font-bold text-gray-700">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          'border-2 rounded-xl overflow-hidden',
          error ? 'border-red-300' : 'border-gray-100',
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
              skipHtml: true,
              rehypeRewrite: (node: unknown, index: number, parent: unknown) => {
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
            <p className="text-gray-400 text-sm">読み込み中...</p>
          </div>
        )}
      </div>

      {!disabled && (
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>{characterCount} 文字</span>
          <span>ツールバーまたはマークダウン記法で書式設定できます</span>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 font-medium" role="alert">
          {error}
        </p>
      )}

      {!error && (
        <p className="text-xs text-gray-400">
          Markdown記法が使用できます（**太字**、# 見出し、- リスト、```コードブロック```など）
        </p>
      )}
    </div>
  )
}
