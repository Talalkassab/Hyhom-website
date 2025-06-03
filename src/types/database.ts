export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          full_name_ar: string
          avatar_url: string | null
          phone: string | null
          department: 'management' | 'operations' | 'kitchen' | 'service' | 'hr' | 'finance' | 'marketing' | null
          position: string | null
          position_ar: string | null
          bio: string | null
          joined_date: string
          is_active: boolean
          last_seen: string
          notification_preferences: Json
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          full_name_ar: string
          avatar_url?: string | null
          phone?: string | null
          department?: 'management' | 'operations' | 'kitchen' | 'service' | 'hr' | 'finance' | 'marketing' | null
          position?: string | null
          position_ar?: string | null
          bio?: string | null
          joined_date?: string
          is_active?: boolean
          last_seen?: string
          notification_preferences?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          full_name_ar?: string
          avatar_url?: string | null
          phone?: string | null
          department?: 'management' | 'operations' | 'kitchen' | 'service' | 'hr' | 'finance' | 'marketing' | null
          position?: string | null
          position_ar?: string | null
          bio?: string | null
          joined_date?: string
          is_active?: boolean
          last_seen?: string
          notification_preferences?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'supervisor' | 'employee'
          assigned_by: string | null
          assigned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'supervisor' | 'employee'
          assigned_by?: string | null
          assigned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'supervisor' | 'employee'
          assigned_by?: string | null
          assigned_at?: string
        }
      }
      channels: {
        Row: {
          id: string
          name: string
          name_ar: string
          description: string | null
          description_ar: string | null
          type: 'public' | 'private' | 'department' | 'announcement'
          department: string | null
          icon: string
          color: string
          is_archived: boolean
          is_default: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_ar: string
          description?: string | null
          description_ar?: string | null
          type: 'public' | 'private' | 'department' | 'announcement'
          department?: string | null
          icon?: string
          color?: string
          is_archived?: boolean
          is_default?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_ar?: string
          description?: string | null
          description_ar?: string | null
          type?: 'public' | 'private' | 'department' | 'announcement'
          department?: string | null
          icon?: string
          color?: string
          is_archived?: boolean
          is_default?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      channel_members: {
        Row: {
          id: string
          channel_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          joined_at: string
          last_read_at: string
          notifications_enabled: boolean
        }
        Insert: {
          id?: string
          channel_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
          last_read_at?: string
          notifications_enabled?: boolean
        }
        Update: {
          id?: string
          channel_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
          last_read_at?: string
          notifications_enabled?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          channel_id: string
          user_id: string
          content: string
          content_type: 'text' | 'image' | 'file' | 'system'
          metadata: Json
          is_edited: boolean
          edited_at: string | null
          is_deleted: boolean
          deleted_at: string | null
          thread_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          user_id: string
          content: string
          content_type?: 'text' | 'image' | 'file' | 'system'
          metadata?: Json
          is_edited?: boolean
          edited_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          thread_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          user_id?: string
          content?: string
          content_type?: 'text' | 'image' | 'file' | 'system'
          metadata?: Json
          is_edited?: boolean
          edited_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          thread_id?: string | null
          created_at?: string
        }
      }
      direct_messages: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          content: string
          content_type: 'text' | 'image' | 'file'
          metadata: Json
          is_read: boolean
          read_at: string | null
          is_edited: boolean
          edited_at: string | null
          is_deleted: boolean
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          content: string
          content_type?: 'text' | 'image' | 'file'
          metadata?: Json
          is_read?: boolean
          read_at?: string | null
          is_edited?: boolean
          edited_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          content?: string
          content_type?: 'text' | 'image' | 'file'
          metadata?: Json
          is_read?: boolean
          read_at?: string | null
          is_edited?: boolean
          edited_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
        }
      }
      file_uploads: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_size: number
          file_type: string
          storage_path: string
          message_id: string | null
          direct_message_id: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_size: number
          file_type: string
          storage_path: string
          message_id?: string | null
          direct_message_id?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_size?: number
          file_type?: string
          storage_path?: string
          message_id?: string | null
          direct_message_id?: string | null
          uploaded_at?: string
        }
      }
      user_presence: {
        Row: {
          user_id: string
          status: 'online' | 'away' | 'busy' | 'offline'
          last_seen: string
          status_message: string | null
          status_message_ar: string | null
        }
        Insert: {
          user_id: string
          status?: 'online' | 'away' | 'busy' | 'offline'
          last_seen?: string
          status_message?: string | null
          status_message_ar?: string | null
        }
        Update: {
          user_id?: string
          status?: 'online' | 'away' | 'busy' | 'offline'
          last_seen?: string
          status_message?: string | null
          status_message_ar?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'message' | 'mention' | 'announcement' | 'system'
          title: string
          title_ar: string
          content: string
          content_ar: string
          metadata: Json
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'message' | 'mention' | 'announcement' | 'system'
          title: string
          title_ar: string
          content: string
          content_ar: string
          metadata?: Json
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'message' | 'mention' | 'announcement' | 'system'
          title?: string
          title_ar?: string
          content?: string
          content_ar?: string
          metadata?: Json
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      update_last_seen: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
      get_unread_count: {
        Args: { user_uuid: string }
        Returns: {
          channel_id: string
          unread_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}