export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      certifications: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      choices: {
        Row: {
          choice_text: string
          created_at: string | null
          id: string
          is_correct: boolean | null
          order_index: number | null
          question_id: string
        }
        Insert: {
          choice_text: string
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          order_index?: number | null
          question_id: string
        }
        Update: {
          choice_text?: string
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          order_index?: number | null
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "choices_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string | null
          id: string
          passing_score: number
          question_count: number
          question_set_id: string
          time_limit_minutes: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          passing_score: number
          question_count: number
          question_set_id: string
          time_limit_minutes: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          passing_score?: number
          question_count?: number
          question_set_id?: string
          time_limit_minutes?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_question_set_id_fkey"
            columns: ["question_set_id"]
            isOneToOne: true
            referencedRelation: "question_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      question_sets: {
        Row: {
          certification_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          certification_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          certification_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_sets_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string | null
          explanation: string | null
          id: string
          is_multiple_choice: boolean | null
          order_index: number | null
          question_set_id: string
          question_text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          explanation?: string | null
          id?: string
          is_multiple_choice?: boolean | null
          order_index?: number | null
          question_set_id: string
          question_text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          explanation?: string | null
          id?: string
          is_multiple_choice?: boolean | null
          order_index?: number | null
          question_set_id?: string
          question_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_question_set_id_fkey"
            columns: ["question_set_id"]
            isOneToOne: false
            referencedRelation: "question_sets"
            referencedColumns: ["id"]
          },
        ]
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
