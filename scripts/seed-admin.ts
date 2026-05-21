/**
 * Admin Account Seeding Script
 * 
 * Creates an initial admin account for the LMS platform.
 * Uses environment variables for credentials with sensible defaults.
 * 
 * Environment Variables:
 *   ADMIN_EMAIL - Admin email (default: admin@learnhub.local)
 *   ADMIN_PASSWORD - Admin password (default: AdminPass123!)
 *   ADMIN_FULL_NAME - Admin display name (default: System Admin)
 * 
 * Usage:
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/seed-admin.js
 */

import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@learnhub.local'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass123!'
const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || 'System Admin'

async function seedAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing required environment variables')
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
    process.exit(1)
  }

  console.log('Connecting to Supabase...')
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log(`Creating admin user: ${ADMIN_EMAIL}`)

  // Check if admin already exists
  const { data: existingUsers } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('email', ADMIN_EMAIL)
    .single()

  if (existingUsers) {
    if (existingUsers.role === 'admin') {
      console.log('Admin user already exists with admin role. No changes needed.')
      return
    }
    // Update existing user to admin
    console.log('User exists but is not admin. Updating role to admin...')
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', existingUsers.id)

    if (updateError) {
      console.error('Error updating user role:', updateError.message)
      process.exit(1)
    }
    console.log('Successfully updated user to admin role!')
    return
  }

  // Create new admin user via Supabase Admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // Auto-confirm email so they can login immediately
    user_metadata: {
      full_name: ADMIN_FULL_NAME,
      role: 'admin',
    },
  })

  if (authError) {
    // Handle case where user exists in auth but not in profiles
    if (authError.message.includes('already been registered')) {
      console.log('User exists in auth system. Checking profiles table...')
      
      // Get user by email from auth
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const existingAuthUser = users?.find(u => u.email === ADMIN_EMAIL)
      
      if (existingAuthUser) {
        // Insert into profiles with admin role
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: existingAuthUser.id,
            email: ADMIN_EMAIL,
            full_name: ADMIN_FULL_NAME,
            role: 'admin',
          }, { onConflict: 'id' })

        if (profileError) {
          console.error('Error creating profile:', profileError.message)
          process.exit(1)
        }
        console.log('Successfully created/updated admin profile!')
        return
      }
    }
    console.error('Error creating admin user:', authError.message)
    process.exit(1)
  }

  console.log('Admin user created successfully!')
  console.log('---')
  console.log(`Email: ${ADMIN_EMAIL}`)
  console.log(`Password: ${ADMIN_PASSWORD}`)
  console.log('---')
  console.log('You can now log in at /auth/login')
}

seedAdmin().catch(console.error)
