'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import { useEffect, useMemo, useState, useCallback } from 'react'
import TurndownService from 'turndown'
import { cn } from '@/lib/utils/cn'
import {
  Bold,
  Italic,
  Code,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code as CodeBlock,
} from 'lucide-react'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
}

// スラッシュコマンドのアイテム
const slashCommands = [
  {
    title: '見出し1',
    icon: Heading1,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: '見出し2',
    icon: Heading2,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: '見出し3',
    icon: Heading3,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: '箇条書きリスト',
    icon: List,
    command: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: '番号付きリスト',
    icon: ListOrdered,
    command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: 'コードブロック',
    icon: CodeBlock,
    command: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
]

export function MarkdownEditor({
  content,
  onChange,
  disabled = false,
  error,
  label,
  required = false,
}: MarkdownEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Turndown service for HTML to Markdown conversion
  const turndownService = useMemo(() => new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  }), [])

  // クライアントサイドでのみBubbleMenuを表示
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    immediatelyRender: false, // SSRエラーを回避
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-900 text-gray-100 p-3 rounded-md font-mono text-sm overflow-x-auto',
          },
        },
      }),
      CharacterCount,
    ],
    content: content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = turndownService.turndown(html)
      onChange(markdown)

      // スラッシュコマンドの検出
      const { state } = editor
      const { selection } = state
      const { $from } = selection
      const text = $from.nodeBefore?.text || ''

      if (text.endsWith('/')) {
        const coords = editor.view.coordsAtPos($from.pos)
        setSlashMenuPosition({ top: coords.top + 20, left: coords.left })
        setShowSlashMenu(true)
        setSelectedCommandIndex(0)
      } else {
        setShowSlashMenu(false)
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3',
          disabled && 'cursor-not-allowed opacity-60'
        ),
      },
      handleKeyDown: (view, event) => {
        if (showSlashMenu) {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setSelectedCommandIndex((prev) =>
              prev < slashCommands.length - 1 ? prev + 1 : prev
            )
            return true
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setSelectedCommandIndex((prev) => (prev > 0 ? prev - 1 : prev))
            return true
          }
          if (event.key === 'Enter') {
            event.preventDefault()
            const command = slashCommands[selectedCommandIndex]
            if (command && editor) {
              // スラッシュを削除してからコマンド実行
              editor.chain().focus().deleteRange({
                from: editor.state.selection.from - 1,
                to: editor.state.selection.from,
              }).run()
              command.command(editor)
            }
            setShowSlashMenu(false)
            return true
          }
          if (event.key === 'Escape') {
            setShowSlashMenu(false)
            return true
          }
        }
        return false
      },
    },
  })

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content) {
      const currentHTML = editor.getHTML()
      const currentMarkdown = turndownService.turndown(currentHTML)

      // Only update if content has actually changed
      if (content !== currentMarkdown) {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor, turndownService])

  // Update editor editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  // スラッシュコマンドの実行
  const executeSlashCommand = useCallback((index: number) => {
    const command = slashCommands[index]
    if (command && editor) {
      // スラッシュを削除してからコマンド実行
      editor.chain().focus().deleteRange({
        from: editor.state.selection.from - 1,
        to: editor.state.selection.from,
      }).run()
      command.command(editor)
    }
    setShowSlashMenu(false)
  }, [editor])

  // 文字数とワード数
  const characterCount = editor?.storage.characterCount.characters() || 0
  const wordCount = editor?.storage.characterCount.words() || 0

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
          'border rounded-md overflow-hidden bg-white',
          error ? 'border-red-500' : 'border-gray-300',
          disabled && 'bg-gray-50'
        )}
      >
        {/* バブルメニュー（Tiptap標準） */}
        {isMounted && editor && (
          <BubbleMenu editor={editor}>
            <div className="flex items-center gap-1 bg-gray-900 text-white rounded-lg shadow-lg p-1">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  'p-2 rounded hover:bg-gray-700 transition-colors',
                  editor.isActive('bold') && 'bg-gray-700'
                )}
                title="太字 (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  'p-2 rounded hover:bg-gray-700 transition-colors',
                  editor.isActive('italic') && 'bg-gray-700'
                )}
                title="斜体 (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                  'p-2 rounded hover:bg-gray-700 transition-colors',
                  editor.isActive('strike') && 'bg-gray-700'
                )}
                title="取り消し線"
              >
                <Strikethrough className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn(
                  'p-2 rounded hover:bg-gray-700 transition-colors',
                  editor.isActive('code') && 'bg-gray-700'
                )}
                title="インラインコード"
              >
                <Code className="h-4 w-4" />
              </button>
            </div>
          </BubbleMenu>
        )}

        <EditorContent editor={editor} />

        {/* スラッシュコマンドメニュー */}
        {showSlashMenu && (
          <div
            className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg py-1 min-w-[200px]"
            style={{ top: slashMenuPosition.top, left: slashMenuPosition.left }}
          >
            {slashCommands.map((command, index) => {
              const Icon = command.icon
              return (
                <button
                  key={index}
                  onClick={() => executeSlashCommand(index)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors',
                    index === selectedCommandIndex && 'bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4 text-gray-600" />
                  <span>{command.title}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* 文字数カウンター */}
        {!disabled && (
          <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 flex justify-between items-center">
            <span>
              {characterCount} 文字 / {wordCount} 単語
            </span>
            <span className="text-gray-400">
              / でコマンドメニューを開く
            </span>
          </div>
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
          Markdown記法が使用できます（**太字**、# 見出し、- リスト、```コードブロック```など）
        </p>
      )}

      <style jsx global>{`
        .ProseMirror {
          min-height: 200px;
        }

        .ProseMirror p {
          margin-bottom: 0.25rem;
        }

        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          margin-top: 0.75rem;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          margin-top: 0.75rem;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.25rem;
          margin-top: 0.5rem;
        }

        .ProseMirror h4 {
          font-size: 1.125rem;
          font-weight: bold;
          margin-bottom: 0.25rem;
          margin-top: 0.5rem;
        }

        .ProseMirror h5,
        .ProseMirror h6 {
          font-size: 1rem;
          font-weight: bold;
          margin-bottom: 0.25rem;
          margin-top: 0.25rem;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1rem;
          margin-bottom: 0.25rem;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        .ProseMirror li {
          margin-bottom: 0.125rem;
        }

        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: monospace;
        }

        .ProseMirror pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 0.75rem;
          border-radius: 0.375rem;
          font-family: monospace;
          font-size: 0.875rem;
          overflow-x-auto;
          margin: 0.5rem 0;
        }

        .ProseMirror pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          font-style: italic;
          margin: 0.25rem 0;
        }

        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }

        .ProseMirror a:hover {
          color: #1e40af;
        }

        .ProseMirror strong {
          font-weight: bold;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  )
}
