'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useMemo } from 'react'
import TurndownService from 'turndown'
import { cn } from '@/lib/utils/cn'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
}

export function MarkdownEditor({
  content,
  onChange,
  disabled = false,
  error,
  label,
  required = false,
}: MarkdownEditorProps) {
  // Turndown service for HTML to Markdown conversion
  const turndownService = useMemo(() => new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  }), [])

  const editor = useEditor({
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
    ],
    content: content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = turndownService.turndown(html)
      onChange(markdown)
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3',
          disabled && 'cursor-not-allowed opacity-60'
        ),
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
        <EditorContent editor={editor} />
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
          overflow-x: auto;
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
