export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cells: {
        Row: {
          created_at: string
          fellowship_id: string | null
          id: string
          leader_id: string | null
          member_count: number | null
          name: string
        }
        Insert: {
          created_at?: string
          fellowship_id?: string | null
          id?: string
          leader_id?: string | null
          member_count?: number | null
          name: string
        }
        Update: {
          created_at?: string
          fellowship_id?: string | null
          id?: string
          leader_id?: string | null
          member_count?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cells_fellowship_id_fkey"
            columns: ["fellowship_id"]
            isOneToOne: false
            referencedRelation: "fellowships"
            referencedColumns: ["id"]
          },
        ]
      }
      fellowships: {
        Row: {
          cell_count: number | null
          created_at: string
          description: string | null
          id: string
          leader_id: string | null
          member_count: number | null
          name: string
        }
        Insert: {
          cell_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          leader_id?: string | null
          member_count?: number | null
          name: string
        }
        Update: {
          cell_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          leader_id?: string | null
          member_count?: number | null
          name?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          fellowship_id: string | null
          id: string
          is_active: boolean | null
          leader_id: string | null
          name: string
        }
        Insert: {
          created_at?: string
          fellowship_id?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          name: string
        }
        Update: {
          created_at?: string
          fellowship_id?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_fellowship_id_fkey"
            columns: ["fellowship_id"]
            isOneToOne: false
            referencedRelation: "fellowships"
            referencedColumns: ["id"]
          },
        ]
      }
      invitees: {
        Row: {
          attended_service: boolean | null
          cell_id: string | null
          email: string | null
          group_id: string | null
          id: string
          invite_date: string
          invited_by: string | null
          name: string
          notes: string | null
          phone: string | null
          service_date: string | null
          status: string | null
        }
        Insert: {
          attended_service?: boolean | null
          cell_id?: string | null
          email?: string | null
          group_id?: string | null
          id?: string
          invite_date?: string
          invited_by?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          service_date?: string | null
          status?: string | null
        }
        Update: {
          attended_service?: boolean | null
          cell_id?: string | null
          email?: string | null
          group_id?: string | null
          id?: string
          invite_date?: string
          invited_by?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          service_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitees_cell_id_fkey"
            columns: ["cell_id"]
            isOneToOne: false
            referencedRelation: "cells"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitees_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cell_id: string | null
          created_at: string
          email: string
          fellowship_id: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          cell_id?: string | null
          created_at?: string
          email: string
          fellowship_id?: string | null
          id: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          cell_id?: string | null
          created_at?: string
          email?: string
          fellowship_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "fellowship_leader" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "fellowship_leader", "member"],
    },
  },
} as const
