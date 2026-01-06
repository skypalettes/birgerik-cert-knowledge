'use client'

import { useEffect } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { LinkNode, AutoLinkNode } from '@lexical/link'
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { EditorState } from 'lexical'
import { cn } from '@/lib/utils/cn'

// Simple error boundary for Lexical
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
}

// マークダウンとLexicalの同期プラグイン
function MarkdownSyncPlugin({
  content,
  onChange,
}: {
  content: string
  onChange: (markdown: string) => void
}) {
  const [editor] = useLexicalComposerContext()

  // 初期コンテンツの読み込み
  useEffect(() => {
    editor.update(() => {
      $convertFromMarkdownString(content, TRANSFORMERS)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 空の依存配列で初回のみ実行

  // 変更をマークダウンに変換して親に通知
  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS)
      onChange(markdown)
    })
  }

  return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
}

// エディタの初期設定
const editorConfig = {
  namespace: 'MarkdownEditor',
  theme: {
    root: 'p-3 min-h-[200px] focus:outline-none',
    paragraph: 'mb-2',
    heading: {
      h1: 'text-3xl font-bold mb-4 mt-6',
      h2: 'text-2xl font-bold mb-3 mt-5',
      h3: 'text-xl font-bold mb-2 mt-4',
      h4: 'text-lg font-bold mb-2 mt-3',
      h5: 'text-base font-bold mb-1 mt-2',
      h6: 'text-sm font-bold mb-1 mt-2',
    },
    list: {
      ul: 'list-disc list-inside mb-2 ml-4',
      ol: 'list-decimal list-inside mb-2 ml-4',
      listitem: 'mb-1',
    },
    link: 'text-blue-600 underline hover:text-blue-800',
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
      strikethrough: 'line-through',
      code: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
    },
    code: 'bg-gray-900 text-gray-100 p-3 rounded-md font-mono text-sm overflow-x-auto block my-2',
    quote: 'border-l-4 border-gray-300 pl-4 italic my-2',
  },
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
    LinkNode,
    AutoLinkNode,
  ],
  onError: (error: Error) => {
    console.error('Lexical error:', error)
  },
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
          disabled && 'bg-gray-50 opacity-60 cursor-not-allowed'
        )}
      >
        <LexicalComposer initialConfig={editorConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={cn(
                  'w-full px-3 py-2 focus:outline-none min-h-[200px]',
                  'prose prose-sm max-w-none',
                  disabled && 'cursor-not-allowed'
                )}
                aria-placeholder={placeholder}
                placeholder={
                  <div className="absolute top-2 left-3 text-gray-400 pointer-events-none">
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <MarkdownSyncPlugin content={content} onChange={onChange} />
        </LexicalComposer>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* ヘルプテキスト */}
      {!error && (
        <p className="text-xs text-gray-500">
          Markdown記法が使用できます（**太字**、# 見出し、- リスト、```コードブロック```など）
        </p>
      )}
    </div>
  )
}
