export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      "Fantasy league": {
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
      fantasy_points: {
        Row: {
          calculated_at: string | null
          id: string
          player_stat_id: string | null
          points: number | null
        }
        Insert: {
          calculated_at?: string | null
          id?: string
          player_stat_id?: string | null
          points?: number | null
        }
        Update: {
          calculated_at?: string | null
          id?: string
          player_stat_id?: string | null
          points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_points_player_stat_id_fkey"
            columns: ["player_stat_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      gameweeks: {
        Row: {
          created_at: string | null
          deadline: string
          id: number
          is_active: boolean | null
          number: number
        }
        Insert: {
          created_at?: string | null
          deadline: string
          id?: number
          is_active?: boolean | null
          number: number
        }
        Update: {
          created_at?: string | null
          deadline?: string
          id?: number
          is_active?: boolean | null
          number?: number
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          assists: number | null
          clean_sheet: boolean | null
          created_at: string | null
          gameweek_id: number | null
          goals: number | null
          id: string
          minutes_played: number | null
          player_id: string | null
          red_cards: number | null
          yellow_cards: number | null
        }
        Insert: {
          assists?: number | null
          clean_sheet?: boolean | null
          created_at?: string | null
          gameweek_id?: number | null
          goals?: number | null
          id?: string
          minutes_played?: number | null
          player_id?: string | null
          red_cards?: number | null
          yellow_cards?: number | null
        }
        Update: {
          assists?: number | null
          clean_sheet?: boolean | null
          created_at?: string | null
          gameweek_id?: number | null
          goals?: number | null
          id?: string
          minutes_played?: number | null
          player_id?: string | null
          red_cards?: number | null
          yellow_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_gameweek_id_fkey"
            columns: ["gameweek_id"]
            isOneToOne: false
            referencedRelation: "gameweeks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          id: string
          name: string
          position: string
          price: number
          status: string | null
          team: string
        }
        Insert: {
          id?: string
          name: string
          position: string
          price: number
          status?: string | null
          team: string
        }
        Update: {
          id?: string
          name?: string
          position?: string
          price?: number
          status?: string | null
          team?: string
        }
        Relationships: []
      }
      user_chips: {
        Row: {
          chip_type: string | null
          created_at: string | null
          gameweek_id: number | null
          id: string
          used: boolean | null
          user_id: string | null
        }
        Insert: {
          chip_type?: string | null
          created_at?: string | null
          gameweek_id?: number | null
          id?: string
          used?: boolean | null
          user_id?: string | null
        }
        Update: {
          chip_type?: string | null
          created_at?: string | null
          gameweek_id?: number | null
          id?: string
          used?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_chips_gameweek_id_fkey"
            columns: ["gameweek_id"]
            isOneToOne: false
            referencedRelation: "gameweeks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_chips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_teams: {
        Row: {
          created_at: string | null
          gameweek_id: number | null
          is_captain: boolean | null
          is_starting: boolean | null
          is_vice_captain: boolean | null
          player_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          gameweek_id?: number | null
          is_captain?: boolean | null
          is_starting?: boolean | null
          is_vice_captain?: boolean | null
          player_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          gameweek_id?: number | null
          is_captain?: boolean | null
          is_starting?: boolean | null
          is_vice_captain?: boolean | null
          player_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_teams_gameweek_id_fkey"
            columns: ["gameweek_id"]
            isOneToOne: false
            referencedRelation: "gameweeks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_teams_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_teams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          budget: number | null
          created_at: string | null
          formation: string | null
          id: string
          team_name: string | null
          username: string
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          formation?: string | null
          id?: string
          team_name?: string | null
          username: string
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          formation?: string | null
          id?: string
          team_name?: string | null
          username?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
