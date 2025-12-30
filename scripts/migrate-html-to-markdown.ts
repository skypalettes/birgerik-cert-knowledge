#!/usr/bin/env tsx
/**
 * Database Migration Script: HTML to Markdown
 *
 * Converts all question_text, explanation, and choice_text fields
 * from Tiptap HTML format to Markdown format.
 *
 * Usage:
 *   npm run migrate:html-to-markdown
 *   or
 *   tsx scripts/migrate-html-to-markdown.ts
 */

import { createClient } from '@supabase/supabase-js'
import { htmlToMarkdown, isHtml } from '../src/lib/utils/html-to-markdown'
import type { Database } from '../src/lib/types/database.types'

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function main() {
  log('='.repeat(60), 'cyan')
  log('HTML to Markdown Migration Script', 'cyan')
  log('='.repeat(60), 'cyan')
  log('')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    log('❌ Error: Missing Supabase credentials', 'red')
    log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set', 'yellow')
    process.exit(1)
  }

  log('✓ Environment variables loaded', 'green')
  log('')

  // Create Supabase client with service role key
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

  try {
    // Step 1: Migrate questions
    log('Step 1: Migrating questions...', 'blue')
    await migrateQuestions(supabase)
    log('')

    // Step 2: Migrate choices
    log('Step 2: Migrating choices...', 'blue')
    await migrateChoices(supabase)
    log('')

    log('='.repeat(60), 'cyan')
    log('✓ Migration completed successfully!', 'green')
    log('='.repeat(60), 'cyan')
  } catch (error) {
    log('='.repeat(60), 'red')
    log('❌ Migration failed!', 'red')
    log('='.repeat(60), 'red')
    console.error(error)
    process.exit(1)
  }
}

async function migrateQuestions(
  supabase: ReturnType<typeof createClient<Database>>
) {
  // Fetch all questions
  const { data: questions, error: fetchError } = await supabase
    .from('questions')
    .select('id, question_text, explanation')

  if (fetchError) {
    throw new Error(`Failed to fetch questions: ${fetchError.message}`)
  }

  if (!questions || questions.length === 0) {
    log('  No questions found to migrate', 'yellow')
    return
  }

  log(`  Found ${questions.length} questions`, 'cyan')

  let convertedCount = 0
  let skippedCount = 0
  let errorCount = 0

  // Process each question
  for (const question of questions) {
    try {
      let needsUpdate = false
      const updates: Partial<Database['public']['Tables']['questions']['Update']> = {}

      // Convert question_text if it contains HTML
      if (isHtml(question.question_text)) {
        const markdown = htmlToMarkdown(question.question_text)
        updates.question_text = markdown
        needsUpdate = true
      }

      // Convert explanation if it exists and contains HTML
      if (question.explanation && isHtml(question.explanation)) {
        const markdown = htmlToMarkdown(question.explanation)
        updates.explanation = markdown
        needsUpdate = true
      }

      if (needsUpdate) {
        // Update the database
        const { error: updateError } = await supabase
          .from('questions')
          .update(updates)
          .eq('id', question.id)

        if (updateError) {
          log(`  ❌ Error updating question ${question.id}: ${updateError.message}`, 'red')
          errorCount++
        } else {
          convertedCount++
          log(`  ✓ Converted question ${question.id}`, 'green')
        }
      } else {
        skippedCount++
      }
    } catch (error) {
      log(`  ❌ Error processing question ${question.id}: ${error}`, 'red')
      errorCount++
    }
  }

  log('')
  log(`  Summary:`, 'cyan')
  log(`    - Converted: ${convertedCount}`, 'green')
  log(`    - Skipped (already Markdown): ${skippedCount}`, 'yellow')
  log(`    - Errors: ${errorCount}`, errorCount > 0 ? 'red' : 'green')
}

async function migrateChoices(
  supabase: ReturnType<typeof createClient<Database>>
) {
  // Fetch all choices
  const { data: choices, error: fetchError } = await supabase
    .from('choices')
    .select('id, choice_text')

  if (fetchError) {
    throw new Error(`Failed to fetch choices: ${fetchError.message}`)
  }

  if (!choices || choices.length === 0) {
    log('  No choices found to migrate', 'yellow')
    return
  }

  log(`  Found ${choices.length} choices`, 'cyan')

  let convertedCount = 0
  let skippedCount = 0
  let errorCount = 0

  // Process each choice
  for (const choice of choices) {
    try {
      // Convert choice_text if it contains HTML
      if (isHtml(choice.choice_text)) {
        const markdown = htmlToMarkdown(choice.choice_text)

        // Update the database
        const { error: updateError } = await supabase
          .from('choices')
          .update({ choice_text: markdown })
          .eq('id', choice.id)

        if (updateError) {
          log(`  ❌ Error updating choice ${choice.id}: ${updateError.message}`, 'red')
          errorCount++
        } else {
          convertedCount++
          log(`  ✓ Converted choice ${choice.id}`, 'green')
        }
      } else {
        skippedCount++
      }
    } catch (error) {
      log(`  ❌ Error processing choice ${choice.id}: ${error}`, 'red')
      errorCount++
    }
  }

  log('')
  log(`  Summary:`, 'cyan')
  log(`    - Converted: ${convertedCount}`, 'green')
  log(`    - Skipped (already Markdown): ${skippedCount}`, 'yellow')
  log(`    - Errors: ${errorCount}`, errorCount > 0 ? 'red' : 'green')
}

// Run the migration
main()
