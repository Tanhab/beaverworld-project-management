// lib/api/users.ts - FIXED: Complete field selection
import { createClient } from '@/lib/supabase/client'
import type {
    Profile,
    CreateUserInput,
    UpdateProfileInput,
} from '@/lib/types/database'
import { logger } from '../logger'

/**
 * Get all users/profiles
 */
export async function getAllUsers(): Promise<Profile[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('*') // Select all fields
        .order('username', { ascending: true })

    if (error) {
        logger.error('Error fetching users:', error)
        throw error
    }

    return data || []
}

/**
 * Get active users only (has role)
 */
export async function getActiveUsers(): Promise<Profile[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('*') // Select all fields
        .not('roles', 'is', null)
        .order('username', { ascending: true })

    if (error) {
        logger.error('Error fetching active users:', error)
        throw error
    }

    return data || []
}

/**
 * Get a single user by ID
 */
export async function getUserById(userId: string): Promise<Profile | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

    if (error) {
        logger.error('Error fetching user:', error)
        throw error
    }

    return data
}

/**
 * Get multiple users by IDs
 */
export async function getUsersByIds(userIds: string[]): Promise<Profile[]> {
    if (userIds.length === 0) return []

    const supabase = createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('*') // Select all fields
        .in('id', userIds)

    if (error) {
        logger.error('Error fetching users by IDs:', error)
        throw error
    }

    return data || []
}

/**
 * Get current logged-in user's profile
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    return getUserById(user.id)
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    updates: UpdateProfileInput,
): Promise<Profile> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        logger.error('Error updating profile:', error)
        throw error
    }

    return data
}

/**
 * Update current user's profile
 */
export async function updateCurrentUserProfile(
    updates: UpdateProfileInput,
): Promise<Profile> {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    return updateUserProfile(user.id, updates)
}

/**
 * Search users by username or email
 */
export async function searchUsers(query: string): Promise<Profile[]> {
    if (!query || query.length < 2) return []

    const supabase = createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('*') // Select all fields
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10)

    if (error) {
        logger.error('Error searching users:', error)
        throw error
    }

    return data || []
}

/**
 * Check if user exists by email
 */
export async function checkUserExists(email: string): Promise<boolean> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

    if (error) {
        logger.error('Error checking user existence:', error)
        return false
    }

    return !!data
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<{
    issuesCreated: number
    issuesAssigned: number
    boardsCreated: number
    tasksCompleted: number
}> {
    const supabase = createClient()

    const { count: issuesCreated } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)

    const { count: issuesAssigned } = await supabase
        .from('issue_assignees')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    const { count: boardsCreated } = await supabase
        .from('boards')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)

    const { count: tasksCompleted } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('completed_by', userId)

    return {
        issuesCreated: issuesCreated || 0,
        issuesAssigned: issuesAssigned || 0,
        boardsCreated: boardsCreated || 0,
        tasksCompleted: tasksCompleted || 0,
    }
}

/**
 * Create a new user (Admin only)
 */
export async function createNewUser(input: CreateUserInput): Promise<{
    profile: Profile
    tempPassword: string
}> {
    const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
    }

    return response.json()
}

/**
 * Verify profile-auth sync
 */
export async function verifyProfileSync(): Promise<{
    synced: boolean
    missingProfiles: string[]
}> {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { synced: true, missingProfiles: [] }

    const profile = await getUserById(user.id)

    return {
        synced: !!profile,
        missingProfiles: profile ? [] : [user.id],
    }
}
