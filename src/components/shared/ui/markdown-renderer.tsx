'use client'

import { useMemo } from 'react'
import 'highlight.js/styles/github-dark.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

// HTMLエスケープ関数
function escapeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Markdownのコードブロックを解析してHTMLに変換
function parseContentWithCodeBlocks(content: string): string {
  if (!content) return ''

  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let result = ''

  let match
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // コードブロック前のテキスト
    const beforeText = content.substring(lastIndex, match.index)
    if (beforeText) {
      // 改行を<br>に変換
      const formattedText = escapeHtml(beforeText)
        .split('\n')
        .map(line => line.trim() ? `<p>${line}</p>` : '')
        .join('')
      result += formattedText
    }

    // コードブロック（末尾の改行を削除）
    const language = match[1] || ''
    const code = match[2].replace(/\n+$/, '') // 末尾の改行を削除

    // 行番号付きコードブロックを生成
    const lines = code.split('\n')
    const numberedLines = lines.map((line, index) => {
      const lineNumber = index + 1
      const escapedLine = escapeHtml(line)
      return `<span class="code-line"><span class="line-number">${lineNumber}</span><span class="line-content">${escapedLine}</span></span>`
    }).join('\n')

    result += `<pre class="code-block"><code class="language-${language}">${numberedLines}</code></pre>`

    lastIndex = match.index + match[0].length
  }

  // 最後のコードブロック以降のテキスト
  const afterText = content.substring(lastIndex)
  if (afterText || lastIndex === 0) {
    // コードブロックが無い場合(lastIndex === 0)、または最後にテキストがある場合
    // 先頭の改行を削除してから処理
    const trimmedAfterText = lastIndex > 0 ? afterText.replace(/^\n+/, '') : afterText
    const formattedText = escapeHtml(trimmedAfterText)
      .split('\n')
      .map(line => line.trim() ? `<p>${line}</p>` : '')
      .join('')
    result += formattedText
  }

  return result
}

/**
 * Markdownコンテンツをレンダリングするコンポーネント
 * コードブロック（```で囲まれた部分）とHTMLエスケープに対応
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const html = useMemo(() => parseContentWithCodeBlocks(content), [content])

  return (
    <>
      <div
        className={`markdown-content ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
        suppressHydrationWarning
      />
      <style jsx>{`
        .markdown-content :global(p) {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        .markdown-content :global(p:last-child) {
          margin-bottom: 0;
        }

        .markdown-content :global(pre.code-block) {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 0.75rem 0;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .markdown-content :global(pre.code-block code) {
          background-color: transparent;
          padding: 0;
          color: inherit;
          font-size: inherit;
          display: block;
        }

        .markdown-content :global(.code-line) {
          display: flex;
          min-height: 1.5em;
        }

        .markdown-content :global(.line-number) {
          display: inline-block;
          width: 2.5rem;
          text-align: right;
          padding-right: 1rem;
          color: #6b7280;
          user-select: none;
          flex-shrink: 0;
        }

        .markdown-content :global(.line-content) {
          flex: 1;
          white-space: pre;
        }

        .markdown-content :global(code) {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: 'Courier New', Courier, monospace;
        }

        .markdown-content :global(strong) {
          font-weight: 600;
        }

        .markdown-content :global(em) {
          font-style: italic;
        }
      `}</style>
    </>
  )
}
