/**
 * マークダウンレンダラーコンポーネント
 *
 * react-markdownを使用してマークダウンを安全にレンダリングします。
 * 学習モードでの問題文・解説文の表示に使用します。
 */

import { MarkdownPreview } from './markdown-preview'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return <MarkdownPreview content={content} className={className} />
}
