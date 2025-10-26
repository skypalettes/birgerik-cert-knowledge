'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Undo,
  Redo,
  Heading2,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const lowlight = createLowlight(common)

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'テキストを入力...',
  disabled = false,
  error,
  label,
  required = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // CodeBlockLowlightを使用するため無効化
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2',
          'prose-headings:font-semibold prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2',
          'prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1',
          'prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
          'prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-x-auto'
        ),
      },
    },
  })

  if (!editor) {
    return null
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title,
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded hover:bg-gray-100 transition-colors',
        isActive && 'bg-gray-200 text-blue-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )

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
          disabled && 'bg-gray-50 opacity-60'
        )}
      >
        {/* ツールバー */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
          {/* テキストスタイル */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            disabled={disabled}
            title="太字"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            disabled={disabled}
            title="斜体"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            disabled={disabled}
            title="インラインコード"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 見出し */}
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive('heading', { level: 2 })}
            disabled={disabled}
            title="見出し"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* リスト */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            disabled={disabled}
            title="箇条書きリスト"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            disabled={disabled}
            title="番号付きリスト"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* コードブロック */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            disabled={disabled}
            title="コードブロック"
          >
            <Code className="h-4 w-4" />
            <span className="text-xs ml-1">Block</span>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 元に戻す/やり直す */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().undo()}
            title="元に戻す"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().redo()}
            title="やり直す"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* エディタ本体 */}
        <EditorContent editor={editor} className="bg-white" />

        {/* プレースホルダー（空の場合） */}
        {editor.isEmpty && (
          <div className="absolute top-[60px] left-3 text-gray-400 pointer-events-none">
            {placeholder}
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
          太字、リスト、コードブロックなどの装飾が使用できます
        </p>
      )}
    </div>
  )
}