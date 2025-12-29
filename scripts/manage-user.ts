#!/usr/bin/env tsx
/**
 * User Management Script
 *
 * Manages Supabase users: ban, unban, view user info, and list all users.
 * When a user is banned, all their tokens are immediately invalidated.
 *
 * Usage:
 *   npm run manage-user <command> [email]
 *   or
 *   tsx scripts/manage-user.ts <command> [email]
 *
 * Commands:
 *   list              - List all users
 *   info <email>      - Show user information
 *   ban <email>       - Ban a user (invalidate all tokens)
 *   unban <email>     - Unban a user
 *
 * Examples:
 *   npm run manage-user list
 *   npm run manage-user info user@example.com
 *   npm run manage-user ban user@example.com
 *   npm run manage-user unban user@example.com
 */

import { config } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import type { User, SupabaseClient } from '@supabase/supabase-js'

// Load environment variables from .env.local or .env
const envLocalPath = resolve(process.cwd(), '.env.local')
const envPath = resolve(process.cwd(), '.env')

if (existsSync(envLocalPath)) {
  config({ path: envLocalPath })
} else if (existsSync(envPath)) {
  config({ path: envPath })
} else {
  console.warn('⚠️  No .env.local or .env file found. Using system environment variables.')
}

// Extend User type to include banned_until field
type UserWithBan = User & {
  banned_until?: string | null
}

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * List all users
 */
async function listUsers(supabase: SupabaseClient<any, any, any>) {
  log('Fetching all users...', 'blue')
  log('')

  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    log('❌ Failed to fetch users', 'red')
    log(`Error: ${error.message}`, 'red')
    process.exit(1)
  }

  if (!data.users || data.users.length === 0) {
    log('ℹ️  No users found', 'yellow')
    return
  }

  log(`Found ${data.users.length} user(s)`, 'cyan')
  log('', 'reset')

  // Display users in a table format
  for (const user of data.users as UserWithBan[]) {
    const isBanned = user.banned_until && new Date(user.banned_until) > new Date()
    const status = isBanned ? '🚫 BANNED' : '✅ Active'
    const statusColor = isBanned ? 'red' : 'green'

    log('─'.repeat(60), 'gray')
    log(`${status}`, statusColor)
    log(`Email:       ${user.email}`, 'reset')
    log(`ID:          ${user.id}`, 'gray')
    log(`Created:     ${formatDate(user.created_at)}`, 'reset')
    log(`Last Sign In: ${formatDate(user.last_sign_in_at)}`, 'reset')

    if (isBanned) {
      log(`Banned Until: ${formatDate(user.banned_until)}`, 'red')
    }
  }

  log('─'.repeat(60), 'gray')
}

/**
 * Get user by email
 */
async function getUserByEmail(
  supabase: SupabaseClient<any, any, any>,
  email: string
): Promise<UserWithBan> {
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    log('❌ Failed to fetch users', 'red')
    log(`Error: ${error.message}`, 'red')
    process.exit(1)
  }

  const user = (data.users as UserWithBan[]).find((u) => u.email === email)

  if (!user) {
    log(`❌ User not found: ${email}`, 'red')
    process.exit(1)
  }

  return user
}

/**
 * Show user information
 */
async function showUserInfo(
  supabase: SupabaseClient<any, any, any>,
  email: string
) {
  log(`Fetching user info for: ${email}`, 'blue')
  log('')

  const user = await getUserByEmail(supabase, email)

  const isBanned = user.banned_until && new Date(user.banned_until) > new Date()
  const status = isBanned ? '🚫 BANNED' : '✅ Active'
  const statusColor = isBanned ? 'red' : 'green'

  log('='.repeat(60), 'cyan')
  log('User Information', 'cyan')
  log('='.repeat(60), 'cyan')
  log(`Status:       ${status}`, statusColor)
  log(`Email:        ${user.email}`, 'reset')
  log(`ID:           ${user.id}`, 'reset')
  log(`Created:      ${formatDate(user.created_at)}`, 'reset')
  log(`Last Sign In:  ${formatDate(user.last_sign_in_at)}`, 'reset')
  log(`Confirmed:    ${user.email_confirmed_at ? 'Yes' : 'No'}`, 'reset')

  if (isBanned) {
    log(`Banned Until:  ${formatDate(user.banned_until)}`, 'red')
  }

  log('='.repeat(60), 'cyan')
}

/**
 * Ban a user
 */
async function banUser(supabase: SupabaseClient<any, any, any>, email: string) {
  log(`Banning user: ${email}`, 'blue')
  log('')

  const user = await getUserByEmail(supabase, email)

  // Ban user for a very long time (effectively permanent)
  // Supabase accepts duration strings like '24h', '7d', '876000h'
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    ban_duration: '876000h', // 100 years (100 * 365 * 24 hours)
  })

  if (error) {
    log('❌ Failed to ban user', 'red')
    log(`Error: ${error.message}`, 'red')
    process.exit(1)
  }

  log('✅ User banned successfully!', 'green')
  log('', 'reset')
  log('ℹ️  All active tokens for this user have been invalidated.', 'yellow')
  log('The user will not be able to log in or use the API.', 'yellow')
}

/**
 * Unban a user
 */
async function unbanUser(
  supabase: SupabaseClient<any, any, any>,
  email: string
) {
  log(`Unbanning user: ${email}`, 'blue')
  log('')

  const user = await getUserByEmail(supabase, email)

  // Unban user by setting ban_duration to 0
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    ban_duration: '0h',
  })

  if (error) {
    log('❌ Failed to unban user', 'red')
    log(`Error: ${error.message}`, 'red')
    process.exit(1)
  }

  log('✅ User unbanned successfully!', 'green')
  log('', 'reset')
  log('ℹ️  The user can now log in and use the API.', 'yellow')
}

async function main() {
  log('='.repeat(60), 'cyan')
  log('Birgerik User Management Script', 'cyan')
  log('='.repeat(60), 'cyan')
  log('')

  // Parse command line arguments
  const args = process.argv.slice(2)

  if (args.length < 1) {
    log('❌ Error: Command is required', 'red')
    log('', 'reset')
    log('Usage: npm run manage-user <command> [email]', 'yellow')
    log('', 'reset')
    log('Commands:', 'cyan')
    log('  list              - List all users', 'reset')
    log('  info <email>      - Show user information', 'reset')
    log('  ban <email>       - Ban a user', 'reset')
    log('  unban <email>     - Unban a user', 'reset')
    log('', 'reset')
    log('Examples:', 'cyan')
    log('  npm run manage-user list', 'reset')
    log('  npm run manage-user info user@example.com', 'reset')
    log('  npm run manage-user ban user@example.com', 'reset')
    log('  npm run manage-user unban user@example.com', 'reset')
    process.exit(1)
  }

  const command = args[0]
  const email = args[1]

  // Validate command
  const validCommands = ['list', 'info', 'ban', 'unban']
  if (!validCommands.includes(command)) {
    log(`❌ Error: Invalid command "${command}"`, 'red')
    log(`Valid commands: ${validCommands.join(', ')}`, 'yellow')
    process.exit(1)
  }

  // Validate email for commands that require it
  if (command !== 'list' && !email) {
    log(`❌ Error: Email address is required for "${command}" command`, 'red')
    process.exit(1)
  }

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    log('❌ Error: Missing Supabase credentials', 'red')
    log(
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local',
      'yellow'
    )
    process.exit(1)
  }

  log('✓ Environment variables loaded', 'green')
  log('')

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Execute command
  switch (command) {
    case 'list':
      await listUsers(supabase)
      break
    case 'info':
      await showUserInfo(supabase, email)
      break
    case 'ban':
      await banUser(supabase, email)
      break
    case 'unban':
      await unbanUser(supabase, email)
      break
  }

  log('')
  log('Done!', 'green')
}

main()
