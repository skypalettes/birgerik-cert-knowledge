/**
 * マークダウンプレビューコンポーネント
 *
 * @uiw/react-markdown-previewを使用してマークダウンをHTMLにレンダリングします。
 * @uiw/react-md-editorのプレビューと完全に同じスタイルを使用します。
 * 学習モードでの問題文・解説文の表示に使用します。
 */

'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

// MarkdownPreviewはクライアントサイドでのみ動作するため、SSRを無効化
const MarkdownPreviewLib = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownPreviewProps {
  content: string
  className?: string
  showLineNumbers?: boolean // コードブロックに行番号を表示するかどうか
}

export function MarkdownPreview({
  content,
  className = '',
  showLineNumbers = false
}: MarkdownPreviewProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 行番号を追加する処理（レンダリング後）
  useEffect(() => {
    if (!showLineNumbers || !mounted || !containerRef.current) return

    const codeBlocks = containerRef.current.querySelectorAll('pre code')
    codeBlocks.forEach((codeBlock) => {
      // 既に行番号が追加されている場合はスキップ
      if (codeBlock.querySelector('.code-line-numbers')) return

      const code = codeBlock.textContent || ''
      const lines = code.split('\n')

      // 最後の空行を削除
      if (lines[lines.length - 1] === '') {
        lines.pop()
      }

      // 行番号付きHTMLを作成
      const wrapper = document.createElement('div')
      wrapper.className = 'code-line-numbers'
      wrapper.style.display = 'table'
      wrapper.style.width = '100%'

      lines.forEach((line, index) => {
        const row = document.createElement('div')
        row.style.display = 'table-row'

        const lineNumber = document.createElement('span')
        lineNumber.textContent = String(index + 1)
        lineNumber.style.display = 'table-cell'
        lineNumber.style.width = '2.5rem'
        lineNumber.style.textAlign = 'right'
        lineNumber.style.paddingRight = '1rem'
        lineNumber.style.color = '#6b7280'
        lineNumber.style.userSelect = 'none'

        const lineContent = document.createElement('span')
        lineContent.textContent = line || ' '
        lineContent.style.display = 'table-cell'
        lineContent.style.whiteSpace = 'pre'

        row.appendChild(lineNumber)
        row.appendChild(lineContent)
        wrapper.appendChild(row)
      })

      codeBlock.textContent = ''
      codeBlock.appendChild(wrapper)
    })
  }, [mounted, showLineNumbers, content])

  if (!mounted) {
    return <div className={className}>読み込み中...</div>
  }

  return (
    <>
      <style jsx>{`
        .markdown-preview-container :global(.wmde-markdown) {
          font-family: inherit;
        }
        .markdown-preview-container :global(pre) {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className={`markdown-preview-container ${className}`}
        data-color-mode="light"
      >
        <MarkdownPreviewLib
          source={content}
          remarkPlugins={[remarkGfm, remarkBreaks]}
          wrapperElement={{
            'data-color-mode': 'light',
          }}
        />
      </div>
    </>
  )
}
