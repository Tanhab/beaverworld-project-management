import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createNewUser,
    getAllUsers,
    getCurrentUserProfile,
    getUserById,
    updateUserProfile,
} from '../api/users'
import { CreateUserInput, UpdateProfileInput } from '@/lib/types/database'
import { toast } from 'sonner'

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: getAllUsers,
        staleTime: 5 * 60 * 1000,
    })
}

// hook to get a specific user

export function useUser(userId: string | undefined) {
    return useQuery({
        queryKey: ['users', userId],
        queryFn: () => {
            if (!userId) throw new Error('UserId is required')
            return getUserById(userId)
        },
        enabled: !!userId,
    })
}

// hook to get current logged in user profile

export function useCurrentUser() {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUserProfile,
        staleTime: 5 * 60 * 1000,
    })
}

export function useUpdateProfile() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            userId,
            updates,
        }: {
            userId: string
            updates: UpdateProfileInput
        }) => updateUserProfile(userId, updates),
        onSuccess: (data) => {
            ;(queryClient.invalidateQueries({ queryKey: ['users'] }),
                queryClient.invalidateQueries({ queryKey: ['users', data.id] }))
            queryClient.invalidateQueries({ queryKey: ['currentUser'] })

            toast.success('Profile updated successfully')
        },
        onError: (error: Error) => {
            toast.error(`Failed to update profile: ${error.message}`)
        },
    })
}
export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: CreateUserInput) => createNewUser(input),
        onSuccess: (data) => {
            // Invalidate users list to show new user
            queryClient.invalidateQueries({ queryKey: ['users'] })

            toast.success(
                `User created successfully! Temp password: ${data.tempPassword}`,
                { duration: 10000 }, // Show for 10 seconds so they can copy
            )
        },
        onError: (error: Error) => {
            toast.error(`Failed to create user: ${error.message}`)
        },
    })
}
