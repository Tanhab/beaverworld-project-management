// lib/api/users.ts
import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/server';
import type { Profile, CreateUserInput, UpdateProfileInput } from '@/lib/types/database';

/**
 * Get all users/profiles
 */
export async function getAllUsers(): Promise<Profile[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('username', { ascending: true });
  
  if (error) throw error;
  return data;
}

/**
 * Get a single user by ID
 */
export async function getUserById(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get current logged-in user's profile
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  return getUserById(user.id);
}

/**
 * Update user profile
 * Users can only update their own profile
 */
export async function updateUserProfile(
  userId: string,
  updates: UpdateProfileInput
): Promise<Profile> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Create a new user (Admin only - uses server action)
 * This should be called from a server action, not directly from client
 */
export async function createNewUser(input: CreateUserInput): Promise<{
  profile: Profile;
  tempPassword: string;
}> {
  // This needs to be called via an API route or server action
  // because it requires admin privileges
  const response = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create user');
  }
  
  return response.json();
}

