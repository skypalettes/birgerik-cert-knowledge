/**
 * マークダウンプレビューコンポーネント
 *
 * react-markdownを使用してマークダウンを安全にHTMLにレンダリングします。
 * 学習モードでの問題文・解説文の表示に使用します。
 */

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import type { Components } from 'react-markdown'

interface MarkdownPreviewProps {
  content: string
  className?: string
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  // カスタムコンポーネント：マークダウン要素のスタイリング
  const components: Partial<Components> = {
    // 見出し
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold mt-5 mb-3 text-foreground">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-bold mt-4 mb-2 text-foreground">{children}</h3>
    ),

    // 段落
    p: ({ children }) => (
      <p className="mb-4 text-foreground leading-relaxed">{children}</p>
    ),

    // リスト
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-foreground">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-foreground">{children}</li>
    ),

    // コードブロック
    code: ({ inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code
            className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
            {...props}
          >
            {children}
          </code>
        )
      }
      return (
        <code
          className={`block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono text-foreground ${className || ''}`}
          {...props}
        >
          {children}
        </code>
      )
    },
    pre: ({ children }) => (
      <pre className="mb-4">{children}</pre>
    ),

    // 引用
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 py-2 mb-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),

    // 水平線
    hr: () => <hr className="my-6 border-border" />,

    // リンク
    a: ({ children, href }) => (
      <a
        href={href}
        className="text-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    // 強調
    strong: ({ children }) => (
      <strong className="font-bold text-foreground">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-foreground">{children}</em>
    ),
  }

  return (
    <div className={`markdown-preview ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
