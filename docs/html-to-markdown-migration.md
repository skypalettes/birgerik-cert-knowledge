# HTML to Markdown Migration Guide

## Overview

This guide covers the migration from Tiptap HTML format to Markdown format for question content storage.

## Why Markdown?

- **More portable**: Markdown is a universal format that can be used across different platforms
- **Easier to read**: Raw Markdown is more readable than HTML
- **Simpler editing**: Can be edited in any text editor
- **Version control friendly**: Cleaner diffs in git
- **More standard**: Markdown is the de facto standard for technical documentation

## What Changed?

### Database Fields

The following database fields were migrated from HTML to Markdown:

- `questions.question_text` - Question text content
- `questions.explanation` - Question explanation text
- `choices.choice_text` - Choice option text

### Web Application

1. **Editor Component**: Replaced `RichTextEditor` (Tiptap) with `MarkdownEditor`
   - Location: `src/components/shared/ui/markdown-editor.tsx`
   - Features:
     - Live preview toggle
     - Markdown toolbar (bold, italic, lists, code blocks, etc.)
     - Syntax highlighting in preview
     - Auto-resizing textarea

2. **Display Components**: Updated all components to use `ReactMarkdown`
   - Admin components:
     - `question-form-modal.tsx` - Question creation/editing
     - `question-preview.tsx` - Question preview modal
   - Study components:
     - `question-display.tsx` - Question display during study
     - `answer-feedback.tsx` - Answer feedback with explanation
     - `choice-option.tsx` - Choice options
     - `question-detail-modal.tsx` - Detailed question view

3. **Markdown Rendering Libraries**:
   - `react-markdown` - Markdown rendering
   - `remark-gfm` - GitHub Flavored Markdown support
   - `rehype-highlight` - Syntax highlighting for code blocks

### Obsidian Plugin

The Obsidian plugin is **backward compatible** and works with both HTML and Markdown:

- The existing `formatText()` utility automatically handles both formats
- HTML content is converted to readable text
- Markdown content is displayed as-is

## Migration Process

### Prerequisites

1. Ensure you have the following environment variables set:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Migration

1. **Backup your database** (IMPORTANT!)
   ```bash
   # Use Supabase dashboard or pg_dump to create a backup
   ```

2. **Run the migration script**:
   ```bash
   npm run migrate:html-to-markdown
   ```

3. **Review the migration output**:
   - The script will show you:
     - Number of questions converted
     - Number of choices converted
     - Any errors encountered
     - Items skipped (already in Markdown format)

### Migration Script Details

**Location**: `scripts/migrate-html-to-markdown.ts`

**What it does**:
1. Fetches all questions and choices from the database
2. Checks each text field for HTML content
3. Converts HTML to Markdown using the `htmlToMarkdown()` utility
4. Updates the database with the converted content
5. Skips fields that are already in Markdown format

**Safety features**:
- Only converts fields that contain HTML
- Provides detailed logging for each operation
- Reports errors without stopping the entire migration
- Idempotent - can be run multiple times safely

## Markdown Syntax Reference

### Basic Formatting

```markdown
**Bold text**
*Italic text*
`Inline code`
```

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Lists

```markdown
- Unordered list item 1
- Unordered list item 2

1. Ordered list item 1
2. Ordered list item 2
```

### Code Blocks

````markdown
```
Code block
```

```python
print("Code block with syntax highlighting")
```
````

### Links

```markdown
[Link text](https://example.com)
```

## HTML to Markdown Conversion Examples

### Example 1: Bold and Lists

**HTML** (Tiptap):
```html
<p><strong>Which of the following are valid?</strong></p>
<ul><li>Option A</li><li>Option B</li></ul>
```

**Markdown**:
```markdown
**Which of the following are valid?**

- Option A
- Option B
```

### Example 2: Code Blocks

**HTML** (Tiptap):
```html
<p>What does this code do?</p>
<pre><code>function test() {
  return true;
}</code></pre>
```

**Markdown**:
```markdown
What does this code do?

\`\`\`
function test() {
  return true;
}
\`\`\`
```

### Example 3: Headings and Emphasis

**HTML** (Tiptap):
```html
<h2>Important Concept</h2>
<p>Remember: <em>always</em> use <code>const</code> when possible.</p>
```

**Markdown**:
```markdown
## Important Concept

Remember: *always* use `const` when possible.
```

## Rollback Procedure

If you need to rollback the migration:

1. Restore from your database backup:
   ```bash
   # Use Supabase dashboard or pg_restore
   ```

2. Revert code changes:
   ```bash
   git revert <commit-hash>
   ```

3. Reinstall dependencies if needed:
   ```bash
   npm install
   ```

## Testing After Migration

### 1. Test Admin Interface

- [ ] Create a new question with Markdown formatting
- [ ] Edit an existing question
- [ ] Preview questions in the modal
- [ ] Verify bold, italic, lists, and code blocks render correctly

### 2. Test Study Interface

- [ ] Start a study session
- [ ] Verify questions display correctly
- [ ] Check that choices render properly
- [ ] View explanations after answering
- [ ] Check the question detail modal

### 3. Test Obsidian Plugin

- [ ] Open Obsidian plugin
- [ ] Start a study session
- [ ] Verify questions display correctly
- [ ] Check explanations and choices

## Troubleshooting

### Migration Script Fails to Connect

**Problem**: `Missing Supabase credentials`

**Solution**: Ensure environment variables are set:
```bash
export NEXT_PUBLIC_SUPABASE_URL=your_url
export SUPABASE_SERVICE_ROLE_KEY=your_key
```

### Some Content Not Converted

**Problem**: Some fields still show HTML tags

**Solution**:
1. Check migration script output for errors
2. Run the migration script again (it's idempotent)
3. Manually convert remaining items if needed

### Markdown Not Rendering

**Problem**: Markdown shows as plain text with asterisks/hashes

**Solution**:
1. Ensure `ReactMarkdown` is being used instead of `dangerouslySetInnerHTML`
2. Check that `remarkGfm` and `rehypeHighlight` plugins are included
3. Verify the `prose` class is applied to the container

## Support

If you encounter issues:

1. Check the migration script logs
2. Verify your database backup
3. Review the code changes in the pull request
4. Contact the development team

## Future Considerations

### Editor Enhancements

Possible future improvements to the Markdown editor:
- Drag-and-drop image upload
- Table support
- Math equation support (KaTeX)
- Advanced syntax highlighting
- Split-screen editing

### Additional Features

- Export questions as Markdown files
- Import questions from Markdown files
- Markdown templates for common question types
