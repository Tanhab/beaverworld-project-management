export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      issue_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          content: Json
          created_at: string
          id: string
          issue_id: string
          user_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          content: Json
          created_at?: string
          id?: string
          issue_id: string
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          content?: Json
          created_at?: string
          id?: string
          issue_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_activities_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_assignees: {
        Row: {
          assigned_at: string
          assigned_by: string
          id: string
          issue_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          id?: string
          issue_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          id?: string
          issue_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_assignees_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_images: {
        Row: {
          display_order: number
          file_size: number
          id: string
          issue_id: string
          storage_path: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          display_order?: number
          file_size: number
          id?: string
          issue_id: string
          storage_path: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          display_order?: number
          file_size?: number
          id?: string
          issue_id?: string
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_images_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          build_version: string | null
          category: Database["public"]["Enums"]["issue_category"]
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          deadline: string | null
          description: string | null
          id: string
          is_archived: boolean
          issue_number: number
          priority: Database["public"]["Enums"]["issue_priority"]
          scenario_id: string | null
          scenario_name: string | null
          solved_commit_number: string | null
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
        }
        Insert: {
          build_version?: string | null
          category?: Database["public"]["Enums"]["issue_category"]
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          issue_number?: number
          priority?: Database["public"]["Enums"]["issue_priority"]
          scenario_id?: string | null
          scenario_name?: string | null
          solved_commit_number?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at?: string
        }
        Update: {
          build_version?: string | null
          category?: Database["public"]["Enums"]["issue_category"]
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          issue_number?: number
          priority?: Database["public"]["Enums"]["issue_priority"]
          scenario_id?: string | null
          scenario_name?: string | null
          solved_commit_number?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          activity_id: string | null
          board_id: string | null
          created_at: string
          discord_sent_at: string | null
          email_sent_at: string | null
          id: string
          issue_id: string | null
          link: string | null
          message: string
          priority: Database["public"]["Enums"]["notification_priority"]
          read: boolean
          scenario_id: string | null
          send_discord: boolean
          send_email: boolean
          show_in_app: boolean
          task_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          board_id?: string | null
          created_at?: string
          discord_sent_at?: string | null
          email_sent_at?: string | null
          id?: string
          issue_id?: string | null
          link?: string | null
          message: string
          priority?: Database["public"]["Enums"]["notification_priority"]
          read?: boolean
          scenario_id?: string | null
          send_discord?: boolean
          send_email?: boolean
          show_in_app?: boolean
          task_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          activity_id?: string | null
          board_id?: string | null
          created_at?: string
          discord_sent_at?: string | null
          email_sent_at?: string | null
          id?: string
          issue_id?: string | null
          link?: string | null
          message?: string
          priority?: Database["public"]["Enums"]["notification_priority"]
          read?: boolean
          scenario_id?: string | null
          send_discord?: boolean
          send_email?: boolean
          show_in_app?: boolean
          task_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "issue_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          discord_id: string | null
          email: string | null
          id: string
          initials: string
          roles: string[]
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          discord_id?: string | null
          email?: string | null
          id: string
          initials?: string
          roles?: string[]
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          discord_id?: string | null
          email?: string | null
          id?: string
          initials?: string
          roles?: string[]
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type:
        | "comment"
        | "status_change"
        | "assignee_add"
        | "assignee_remove"
        | "reopened"
        | "closed"
        | "field_update"
      issue_category: "ui" | "dev" | "media" | "default"
      issue_priority: "low" | "medium" | "high" | "urgent"
      issue_status: "open" | "pending_approval" | "closed"
      notification_priority: "low" | "normal" | "high"
      notification_type:
        | "issue_assigned"
        | "issue_updated"
        | "issue_closed"
        | "issue_reopened"
        | "issue_commented"
        | "issue_mentioned"
        | "scenario_assigned"
        | "scenario_updated"
        | "scenario_completed"
        | "scenario_bug_found"
        | "task_assigned"
        | "task_moved"
        | "task_deadline"
        | "board_created"
        | "board_updated"
        | "announcement"
        | "reminder"
        | "mention"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_type: [
        "comment",
        "status_change",
        "assignee_add",
        "assignee_remove",
        "reopened",
        "closed",
        "field_update",
      ],
      issue_category: ["ui", "dev", "media", "default"],
      issue_priority: ["low", "medium", "high", "urgent"],
      issue_status: ["open", "pending_approval", "closed"],
      notification_priority: ["low", "normal", "high"],
      notification_type: [
        "issue_assigned",
        "issue_updated",
        "issue_closed",
        "issue_reopened",
        "issue_commented",
        "issue_mentioned",
        "scenario_assigned",
        "scenario_updated",
        "scenario_completed",
        "scenario_bug_found",
        "task_assigned",
        "task_moved",
        "task_deadline",
        "board_created",
        "board_updated",
        "announcement",
        "reminder",
        "mention",
      ],
    },
  },
} as const
