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
      books: {
        Row: {
          created_at: string
          created_by: string
          id: number
          type: Database["public"]["Enums"]["book_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: number
          type?: Database["public"]["Enums"]["book_type"]
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: number
          type?: Database["public"]["Enums"]["book_type"]
        }
        Relationships: [
          {
            foreignKeyName: "books_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fonts: {
        Row: {
          created_at: string
          fontImage: string | null
          id: number
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          fontImage?: string | null
          id?: number
          name: string
          type: string
        }
        Update: {
          created_at?: string
          fontImage?: string | null
          id?: number
          name?: string
          type?: string
        }
        Relationships: []
      }
      frames: {
        Row: {
          created_at: string
          height: number
          id: number
          maskPath: string
          name: string
          path: string
          width: number
        }
        Insert: {
          created_at?: string
          height: number
          id?: number
          maskPath: string
          name: string
          path: string
          width: number
        }
        Update: {
          created_at?: string
          height?: number
          id?: number
          maskPath?: string
          name?: string
          path?: string
          width?: number
        }
        Relationships: []
      }
      pages: {
        Row: {
          book: number | null
          canvas: Json | null
          created_at: string
          date: string
          id: number
          last_edited: string | null
        }
        Insert: {
          book?: number | null
          canvas?: Json | null
          created_at?: string
          date: string
          id?: number
          last_edited?: string | null
        }
        Update: {
          book?: number | null
          canvas?: Json | null
          created_at?: string
          date?: string
          id?: number
          last_edited?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_book_fkey"
            columns: ["book"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          new: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          new?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          new?: boolean
        }
        Relationships: []
      }
      stickers: {
        Row: {
          created_at: string
          id: number
          name: string | null
          path: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          path?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          path?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string
          data: Json | null
          id: number
          name: string | null
          path: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: number
          name?: string | null
          path?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: number
          name?: string | null
          path?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
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
      book_type: "journal" | "defaultJournal"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
