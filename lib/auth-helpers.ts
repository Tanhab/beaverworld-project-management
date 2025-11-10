import { createClient } from '@/lib/supabase/server'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized: Not logged in')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single()
  
  if (!profile?.roles.includes('PM')) {
    throw new Error('Unauthorized: Admin access required')
  }
  
  return { user, profile }
}