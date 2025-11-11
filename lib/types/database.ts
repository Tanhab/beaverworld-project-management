import { Database } from './database.types'

// Export the generated Database type
export type { Database }

// Extract commonly used types
export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
    Database['public']['Enums'][T]

export type Inserts<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update']

// Type aliases for easier use

export type Profile = Tables<'profiles'>
export type Issue = Tables<'issues'>
export type IssueAssignee = Tables<'issue_assignees'>
export type IssueImage = Tables<'issue_images'>
export type IssueActivity = Tables<'issue_activities'>
export type Notification = Tables<'notifications'>
export type Scenario = Tables<'scenarios'>

// Enum types
export type IssueStatus = Enums<'issue_status'>
export type IssueCategory = Enums<'issue_category'>
export type IssuePriority = Enums<'issue_priority'>
export type ActivityType = Enums<'activity_type'>
export type NotificationType = Enums<'notification_type'>
export type NotificationPriority = Enums<'notification_priority'>
//export type ScenarioStatus = Enums<'scenario_status'>

// Insert types (for creating new records)
export type CreateIssueInput = Inserts<'issues'>
export type CreateProfileInput = Inserts<'profiles'>
export type CreateNotificationInput = Inserts<'notifications'>

// Update types (for updating existing records)
export type UpdateIssueInput = Updates<'issues'>
export type UpdateProfileInput = Updates<'profiles'>

// Custom input types (for forms, APIs)
export interface CreateUserInput {
    username: string
    email: string
    roles: string[]
    discord_id?: string
}

export interface IssueWithRelations extends Issue {
    assignees?: Profile[]
    created_by_profile?: Profile
    images?: IssueImage[]
    activities?: IssueActivity[]
}
