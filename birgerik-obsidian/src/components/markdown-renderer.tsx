import { h } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import { MarkdownRenderer, Component } from 'obsidian'

interface MarkdownRendererProps {
  content: string
  sourcePath?: string
  component?: Component
}

/**
 * Obsidianの組み込みMarkdownRendererを使用してMarkdownをレンダリング
 */
export function ObsidianMarkdownRenderer({
  content,
  sourcePath = '',
  component
}: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // コンテナをクリア
    container.empty()

    // Markdownをレンダリング
    MarkdownRenderer.renderMarkdown(
      content,
      container,
      sourcePath,
      component || new Component()
    )

    // クリーンアップ
    return () => {
      container.empty()
    }
  }, [content, sourcePath])

  return <div ref={containerRef} className="birgerik-markdown-content" />
}
