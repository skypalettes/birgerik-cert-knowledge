#!/usr/bin/env tsx
/**
 * User Creation Script
 *
 * Creates new Supabase users for Obsidian plugin distribution.
 * Users are created with email/password authentication.
 *
 * Usage:
 *   npm run create-user <email> [password]
 *   or
 *   tsx scripts/create-user.ts <email> [password]
 *
 * Examples:
 *   npm run create-user user@example.com
 *   npm run create-user user@example.com MySecurePass123
 *
 * If password is not provided, a random secure password will be generated.
 */

import { config } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import * as crypto from 'crypto'

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

/**
 * Generate a secure random password
 */
function generatePassword(): string {
  const length = 16
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length)
    password += charset[randomIndex]
  }

  return password
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

async function main() {
  log('='.repeat(60), 'cyan')
  log('Birgerik User Creation Script', 'cyan')
  log('='.repeat(60), 'cyan')
  log('')

  // Parse command line arguments
  const args = process.argv.slice(2)

  if (args.length < 1) {
    log('❌ Error: Email address is required', 'red')
    log('', 'reset')
    log('Usage: npm run create-user <email> [password]', 'yellow')
    log('', 'reset')
    log('Examples:', 'cyan')
    log('  npm run create-user user@example.com', 'reset')
    log('  npm run create-user user@example.com MySecurePass123', 'reset')
    process.exit(1)
  }

  const email = args[0]
  let password = args[1]

  // Validate email
  if (!isValidEmail(email)) {
    log('❌ Error: Invalid email format', 'red')
    process.exit(1)
  }

  // Generate password if not provided
  if (!password) {
    password = generatePassword()
    log('ℹ️  No password provided. Generated secure password.', 'blue')
  }

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    log('❌ Error: Missing Supabase credentials', 'red')
    log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local', 'yellow')
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

  log('Creating user...', 'blue')
  log(`  Email: ${email}`, 'reset')
  log('')

  try {
    // Create user with Supabase Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email (no verification email sent)
    })

    if (error) {
      log('❌ Failed to create user', 'red')
      log(`Error: ${error.message}`, 'red')
      process.exit(1)
    }

    if (!data.user) {
      log('❌ User creation failed: No user data returned', 'red')
      process.exit(1)
    }

    log('✅ User created successfully!', 'green')
    log('', 'reset')
    log('='.repeat(60), 'cyan')
    log('User Details', 'cyan')
    log('='.repeat(60), 'cyan')
    log(`User ID:  ${data.user.id}`, 'reset')
    log(`Email:    ${data.user.email}`, 'reset')
    log(`Password: ${password}`, 'yellow')
    log('', 'reset')
    log('⚠️  IMPORTANT: Save these credentials securely!', 'yellow')
    log('The password will not be shown again.', 'yellow')
    log('', 'reset')
    log('📝 Share these credentials with the user:', 'cyan')
    log('', 'reset')
    log('----------------------------------------', 'reset')
    log(`Email:    ${email}`, 'reset')
    log(`Password: ${password}`, 'reset')
    log('----------------------------------------', 'reset')

  } catch (err) {
    log('❌ Unexpected error occurred', 'red')
    console.error(err)
    process.exit(1)
  }
}

main()
