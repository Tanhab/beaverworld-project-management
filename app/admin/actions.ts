'use server'
import { requireAdmin } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/server'

export async function createNewUser(data: {
  username: string,
  email: string, // Real email 
  roles: string[],
  discord_id?: string
}) {

    await requireAdmin()
    const supabase = createAdminClient() // Bypasses RLS
  
    // Create auth user 
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: data.email, 
    password: process.env.NEXT_PUBLIC_DEFAULT_USER_PASSWORD, // Default temp password
    email_confirm: true // Skip email verification
  })
  
  if (authError) throw authError
  
  // Create profile
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authUser.user.id,
    username: data.username,
    email: data.email, 
    roles: data.roles,
    discord_id: data.discord_id
  })
  
  if (profileError) throw profileError
  
  return { username: data.username, tempPassword: process.env.NEXT_PUBLIC_DEFAULT_USER_PASSWORD }
}