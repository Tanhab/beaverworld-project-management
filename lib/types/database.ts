// lib/types/database.ts
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
    initials?: string 
}

export interface IssueActivityWithUser extends IssueActivity {
  user_profile?: {
    id: string;
    username: string;
    initials: string;
    avatar_url: string | null;
  };
}

export interface IssueWithRelations extends Issue {
  assignees?: Profile[]
  created_by_profile?: Profile
  closed_by_profile?: Profile
  images?: IssueImage[]
  activities?: IssueActivityWithUser[] // Update this line
}

// Helper type for assignee display in UI
export interface AssigneeDisplay {
    id: string
    username: string
    initials: string
    avatar_url: string | null
}

export type Board = Database['public']['Tables']['boards']['Row'];
export type BoardInsert = Database['public']['Tables']['boards']['Insert'];
export type BoardUpdate = Database['public']['Tables']['boards']['Update'];

export type TaskColumn = Database['public']['Tables']['task_columns']['Row'];
export type TaskColumnInsert = Database['public']['Tables']['task_columns']['Insert'];
export type TaskColumnUpdate = Database['public']['Tables']['task_columns']['Update'];

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type TaskComment = Database['public']['Tables']['task_comments']['Row'];
export type TaskCommentInsert = Database['public']['Tables']['task_comments']['Insert'];
export type TaskCommentUpdate = Database['public']['Tables']['task_comments']['Update'];

export type TaskActivity = Database['public']['Tables']['task_activity']['Row'];
export type TaskActivityInsert = Database['public']['Tables']['task_activity']['Insert'];

// Enums
export type TaskPriority = Database['public']['Enums']['task_priority'];
export type BoardCategory = Database['public']['Enums']['board_category'];
export type TaskAction = Database['public']['Enums']['task_action'];

// Keep your custom extended types
export interface BoardWithColumns extends Board {
  columns: TaskColumn[];
  task_count?: number;
}

export interface TaskColumnWithTasks extends TaskColumn {
  tasks: Task[];
}

export interface TaskWithDetails extends Task {
  comments: TaskComment[];
  activity: TaskActivity[];
  created_by_user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  assigned_users?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

// Form input types - keep these as they are more flexible than Insert types
export interface CreateBoardInput {
  title: string;
  description?: string;
  category?: BoardCategory;
  color?: string;
}

export interface UpdateBoardInput {
  title?: string;
  description?: string;
  category?: BoardCategory;
  color?: string;
  is_pinned?: boolean;
}

export interface CreateColumnInput {
  board_id: string;
  title: string;
  position: number;
  color?: string;
}

export interface UpdateColumnInput {
  title?: string;
  position?: number;
  color?: string;
}

export interface CreateTaskInput {
  board_id: string;
  column_id: string;
  title: string;
  description?: string;
  assigned_to?: string[];
  priority?: TaskPriority;
  due_date?: string;
  position: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  column_id?: string;
  assigned_to?: string[];
  priority?: TaskPriority;
  due_date?: string;
  position?: number;
  is_completed?: boolean;
}

export interface CreateCommentInput {
  task_id: string;
  content: string;
}

export interface UpdateCommentInput {
  content: string;
}

// Filter and sort types
export interface BoardFilters {
  category?: BoardCategory;
  created_by?: string;
  search?: string;
  pinned_only?: boolean;
}

export interface TaskFilters {
  priority?: TaskPriority;
  assigned_to?: string;
  is_completed?: boolean;
  has_due_date?: boolean;
  overdue?: boolean;
}

export type BoardSortField = 'created_at' | 'updated_at' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface BoardSort {
  field: BoardSortField;
  direction: SortDirection;
}