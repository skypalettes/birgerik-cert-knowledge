'use client'

/**
 * マークダウンレンダラーコンポーネント
 *
 * 学習モードでの問題文・解説文の表示に使用します。
 */

import { useMemo } from 'react'
import { parseMarkdownToHtml } from '@/lib/utils/markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const html = useMemo(() => parseMarkdownToHtml(content, true), [content])

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
          line-height: 0.6rem;
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
        .markdown-content :global(a) {
          color: #2563eb;
          text-decoration: underline;
        }
        .markdown-content :global(a:hover) {
          color: #1e40af;
        }
        .markdown-content :global(ul) {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content :global(ol) {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content :global(li) {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </>
  )
}
