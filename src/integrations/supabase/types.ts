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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          created_at: string
          event_date: string
          event_time: string | null
          id: string
          notes: string | null
          occasion: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_date: string
          event_time?: string | null
          id?: string
          notes?: string | null
          occasion?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_date?: string
          event_time?: string | null
          id?: string
          notes?: string | null
          occasion?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_entries: {
        Row: {
          analysis_id: string
          challenge_id: string
          created_at: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          analysis_id: string
          challenge_id: string
          created_at?: string
          id?: string
          score: number
          user_id: string
        }
        Update: {
          analysis_id?: string
          challenge_id?: string
          created_at?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_entries_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "outfit_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      clothing_items: {
        Row: {
          brand: string | null
          category: string
          color: string | null
          created_at: string
          id: string
          name: string | null
          notes: string | null
          occasion: string | null
          photo_url: string | null
          price: number | null
          season: string | null
          style: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category?: string
          color?: string | null
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          occasion?: string | null
          photo_url?: string | null
          price?: number | null
          season?: string | null
          style?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string | null
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          occasion?: string | null
          photo_url?: string | null
          price?: number | null
          season?: string | null
          style?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      look_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          look_id: string
          look_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          look_id: string
          look_type?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          look_id?: string
          look_type?: string
          user_id?: string
        }
        Relationships: []
      }
      look_likes: {
        Row: {
          created_at: string
          id: string
          look_id: string
          look_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          look_id: string
          look_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          look_id?: string
          look_type?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          read: boolean
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          read?: boolean
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          read?: boolean
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      outfit_analyses: {
        Row: {
          body_type_notes: string | null
          color_palette: Json
          created_at: string
          detected_items: Json
          id: string
          image_url: string
          improvements: Json
          occasion_ratings: Json
          overall_style: string
          seasonal_fit: string | null
          strengths: Json
          style_score: number
          summary: string
          user_id: string
        }
        Insert: {
          body_type_notes?: string | null
          color_palette?: Json
          created_at?: string
          detected_items?: Json
          id?: string
          image_url: string
          improvements?: Json
          occasion_ratings?: Json
          overall_style: string
          seasonal_fit?: string | null
          strengths?: Json
          style_score: number
          summary: string
          user_id: string
        }
        Update: {
          body_type_notes?: string | null
          color_palette?: Json
          created_at?: string
          detected_items?: Json
          id?: string
          image_url?: string
          improvements?: Json
          occasion_ratings?: Json
          overall_style?: string
          seasonal_fit?: string | null
          strengths?: Json
          style_score?: number
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      outfit_items: {
        Row: {
          clothing_item_id: string
          id: string
          outfit_id: string
        }
        Insert: {
          clothing_item_id: string
          id?: string
          outfit_id: string
        }
        Update: {
          clothing_item_id?: string
          id?: string
          outfit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfit_items_clothing_item_id_fkey"
            columns: ["clothing_item_id"]
            isOneToOne: false
            referencedRelation: "clothing_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_items_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfits: {
        Row: {
          ai_explanation: string | null
          ai_generated: boolean | null
          confidence_score: number | null
          created_at: string
          description: string | null
          id: string
          is_favorite: boolean | null
          mood: string | null
          name: string
          occasion: string | null
          user_id: string
        }
        Insert: {
          ai_explanation?: string | null
          ai_generated?: boolean | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          mood?: string | null
          name: string
          occasion?: string | null
          user_id: string
        }
        Update: {
          ai_explanation?: string | null
          ai_generated?: boolean | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          mood?: string | null
          name?: string
          occasion?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_looks: {
        Row: {
          created_at: string
          id: string
          look_id: string
          look_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          look_id: string
          look_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          look_id?: string
          look_type?: string
          user_id?: string
        }
        Relationships: []
      }
      style_profiles: {
        Row: {
          archetype: string | null
          created_at: string
          id: string
          onboarding_completed: boolean | null
          preferences: Json | null
          style_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archetype?: string | null
          created_at?: string
          id?: string
          onboarding_completed?: boolean | null
          preferences?: Json | null
          style_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archetype?: string | null
          created_at?: string
          id?: string
          onboarding_completed?: boolean | null
          preferences?: Json | null
          style_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_description: string
          badge_icon: string
          badge_key: string
          badge_name: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_description: string
          badge_icon?: string
          badge_key: string
          badge_name: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_description?: string
          badge_icon?: string
          badge_key?: string
          badge_name?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_looks: {
        Row: {
          author_name: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          items: string[]
          mood: string | null
          occasion: string | null
          photo_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          author_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          items?: string[]
          mood?: string | null
          occasion?: string | null
          photo_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          author_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          items?: string[]
          mood?: string | null
          occasion?: string | null
          photo_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      wear_logs: {
        Row: {
          clothing_item_id: string
          created_at: string
          id: string
          notes: string | null
          user_id: string
          worn_at: string
        }
        Insert: {
          clothing_item_id: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id: string
          worn_at?: string
        }
        Update: {
          clothing_item_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id?: string
          worn_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wear_logs_clothing_item_id_fkey"
            columns: ["clothing_item_id"]
            isOneToOne: false
            referencedRelation: "clothing_items"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_challenges: {
        Row: {
          created_at: string
          id: string
          theme: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          theme?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          theme?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_current_challenge: { Args: never; Returns: string }
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
