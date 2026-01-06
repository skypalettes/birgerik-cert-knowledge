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
import {
  EditorState,
  COMMAND_PRIORITY_LOW,
  KEY_ENTER_COMMAND,
  $getSelection,
  $isRangeSelection,
} from 'lexical'
import { $isCodeNode } from '@lexical/code'
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

// コードブロック自動補完プラグイン
function CodeBlockAutoCompletePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      () => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }

        const anchorNode = selection.anchor.getNode()
        const element = anchorNode.getTopLevelElement()

        if (element && $isCodeNode(element)) {
          // コードブロック内でEnterが押された場合の処理
          // デフォルトの動作を許可
          return false
        }

        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])

  return null
}

// エディタの初期設定
const editorConfig = {
  namespace: 'MarkdownEditor',
  theme: {
    root: 'p-3 min-h-[200px] focus:outline-none',
    paragraph: 'mb-1',
    heading: {
      h1: 'text-3xl font-bold mb-2 mt-3',
      h2: 'text-2xl font-bold mb-2 mt-3',
      h3: 'text-xl font-bold mb-1 mt-2',
      h4: 'text-lg font-bold mb-1 mt-2',
      h5: 'text-base font-bold mb-1 mt-1',
      h6: 'text-sm font-bold mb-1 mt-1',
    },
    list: {
      ul: 'list-disc list-inside mb-1 ml-4',
      ol: 'list-decimal list-inside mb-1 ml-4',
      listitem: 'mb-0.5',
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
    quote: 'border-l-4 border-gray-300 pl-4 italic my-1',
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
              />
            }
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <CodeBlockAutoCompletePlugin />
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
