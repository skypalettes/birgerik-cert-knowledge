/**
 * HTML to Markdown Converter
 *
 * Converts Tiptap HTML content to Markdown format.
 * Handles the specific HTML tags used by Tiptap editor.
 */

/**
 * Convert Tiptap HTML to Markdown
 */
export function htmlToMarkdown(html: string | null): string {
  if (!html) return ''

  let markdown = html

  // Step 1: Convert block-level elements
  // Headings (h1-h6)
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')

  // Code blocks (must be processed before inline code)
  markdown = markdown.replace(/<pre[^>]*><code(?:\s+class="[^"]*language-(\w+)[^"]*")?[^>]*>(.*?)<\/code><\/pre>/gis, (match, language, code) => {
    // Decode HTML entities in code
    const decodedCode = decodeHtmlEntities(code)
    const lang = language || ''
    return `\n\`\`\`${lang}\n${decodedCode}\n\`\`\`\n\n`
  })

  // Unordered lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    let listContent = content
    // Convert list items
    listContent = listContent.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    // Remove any remaining whitespace/newlines between items
    listContent = listContent.replace(/\n\s*\n/g, '\n')
    return '\n' + listContent + '\n'
  })

  // Ordered lists
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    let listContent = content
    let counter = 1
    // Convert list items with numbering
    listContent = listContent.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
      return `${counter++}. ${RegExp.$1}\n`
    })
    // Remove any remaining whitespace/newlines between items
    listContent = listContent.replace(/\n\s*\n/g, '\n')
    return '\n' + listContent + '\n'
  })

  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')

  // Line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n')

  // Step 2: Convert inline elements
  // Strong/Bold
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')

  // Emphasis/Italic
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')

  // Inline code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')

  // Links
  markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')

  // Step 3: Remove any remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '')

  // Step 4: Decode HTML entities
  markdown = decodeHtmlEntities(markdown)

  // Step 5: Clean up formatting
  // Remove excessive blank lines (more than 2 consecutive newlines)
  markdown = markdown.replace(/\n{3,}/g, '\n\n')

  // Trim leading/trailing whitespace
  markdown = markdown.trim()

  return markdown
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

/**
 * Check if text contains HTML tags
 */
export function isHtml(text: string | null): boolean {
  if (!text) return false
  return /<[^>]+>/.test(text)
}

/**
 * Convert HTML to Markdown if it contains HTML, otherwise return as-is
 */
export function convertToMarkdown(text: string | null): string {
  if (!text) return ''

  if (isHtml(text)) {
    return htmlToMarkdown(text)
  }

  return text
}
