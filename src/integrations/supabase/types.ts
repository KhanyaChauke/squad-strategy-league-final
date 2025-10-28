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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      Fantasy_leaderboard: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      Fpsl_teams: {
        Row: {
          created_at: string
          fpsl_team_names: string | null
          id: number
        }
        Insert: {
          created_at?: string
          fpsl_team_names?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          fpsl_team_names?: string | null
          id?: number
        }
        Relationships: []
      }
      players: {
        Row: {
          defending: number | null
          dribbling: number | null
          id: string
          name: string
          nationality: string
          pace: number | null
          passing: number | null
          physical: number | null
          position: string
          price: number | null
          rating: number | null
          shooting: number | null
          team: string
        }
        Insert: {
          defending?: number | null
          dribbling?: number | null
          id?: string
          name: string
          nationality: string
          pace?: number | null
          passing?: number | null
          physical?: number | null
          position: string
          price?: number | null
          rating?: number | null
          shooting?: number | null
          team: string
        }
        Update: {
          defending?: number | null
          dribbling?: number | null
          id?: string
          name?: string
          nationality?: string
          pace?: number | null
          passing?: number | null
          physical?: number | null
          position?: string
          price?: number | null
          rating?: number | null
          shooting?: number | null
          team?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          budget: number | null
          created_at: string
          formation: string | null
          full_name: string | null
          id: string
          team_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          formation?: string | null
          full_name?: string | null
          id?: string
          team_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          formation?: string | null
          full_name?: string | null
          id?: string
          team_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      psl_standings: {
        Row: {
          draw: number
          goalDifference: number
          goalsAgainst: number
          goalsFor: number
          id: string | null
          loss: number
          played: number
          points: number
          rank: number
          team: string
          win: number
        }
        Insert: {
          draw: number
          goalDifference: number
          goalsAgainst: number
          goalsFor: number
          id?: string | null
          loss: number
          played: number
          points: number
          rank: number
          team: string
          win: number
        }
        Update: {
          draw?: number
          goalDifference?: number
          goalsAgainst?: number
          goalsFor?: number
          id?: string | null
          loss?: number
          played?: number
          points?: number
          rank?: number
          team?: string
          win?: number
        }
        Relationships: []
      }
      user_teams: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          budget: number | null
          created_at: string | null
          Email: string
          formation: string | null
          id: string
          team_name: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          Email: string
          formation?: string | null
          id?: string
          team_name?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          Email?: string
          formation?: string | null
          id?: string
          team_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
