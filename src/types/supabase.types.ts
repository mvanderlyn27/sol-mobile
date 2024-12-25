export type Json = Record<string, any>;

export type Database = {
  public: {
    Tables: {
      fonts: {
        Row: {
          created_at: string;
          fontImage: string | null;
          id: number;
          name: string;
          type: string;
        };
        Insert: {
          created_at?: string;
          fontImage?: string | null;
          id?: number;
          name: string;
          type: string;
        };
        Update: {
          created_at?: string;
          fontImage?: string | null;
          id?: number;
          name?: string;
          type?: string;
        };
        Relationships: [];
      };
      frames: {
        Row: {
          created_at: string;
          height: number;
          id: number;
          maskPath: string;
          name: string;
          path: string;
          width: number;
        };
        Insert: {
          created_at?: string;
          height: number;
          id?: number;
          maskPath: string;
          name: string;
          path: string;
          width: number;
        };
        Update: {
          created_at?: string;
          height?: number;
          id?: number;
          maskPath?: string;
          name?: string;
          path?: string;
          width?: number;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          created_at: string;
          deleted: boolean | null;
          group_id: string;
          id: string;
          role: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          deleted?: boolean | null;
          group_id: string;
          id?: string;
          role?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          deleted?: boolean | null;
          group_id?: string;
          id?: string;
          role?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      groups: {
        Row: {
          cover_placeholder: string | null;
          cover_url: string | null;
          created_at: string;
          created_by: string | null;
          deleted: boolean;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          cover_placeholder?: string | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted?: boolean;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          cover_placeholder?: string | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted?: boolean;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      image_items: {
        Row: {
          created_at: string;
          deleted: boolean;
          id: string;
          image_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted?: boolean;
          id: string;
          image_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted?: boolean;
          id?: string;
          image_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "image_items_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "page_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "image_items_image_id_fkey";
            columns: ["image_id"];
            isOneToOne: false;
            referencedRelation: "images";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "image_items_item_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "page_items";
            referencedColumns: ["id"];
          }
        ];
      };
      images: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted: boolean;
          hash: string | null;
          height: number;
          id: string;
          path: string;
          placeholder: string | null;
          type: string;
          updated_at: string;
          uploaded: boolean;
          width: number;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted?: boolean;
          hash?: string | null;
          height: number;
          id?: string;
          path: string;
          placeholder?: string | null;
          type: string;
          updated_at?: string;
          uploaded?: boolean;
          width: number;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted?: boolean;
          hash?: string | null;
          height?: number;
          id?: string;
          path?: string;
          placeholder?: string | null;
          type?: string;
          updated_at?: string;
          uploaded?: boolean;
          width?: number;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string;
          deleted: boolean;
          id: string;
          is_read: boolean;
          notification_data: Json;
          processed: boolean | null;
          recipient_id: string;
          sender_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted?: boolean;
          id?: string;
          is_read?: boolean;
          notification_data: Json;
          processed?: boolean | null;
          recipient_id: string;
          sender_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted?: boolean;
          id?: string;
          is_read?: boolean;
          notification_data?: Json;
          processed?: boolean | null;
          recipient_id?: string;
          sender_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      page_items: {
        Row: {
          created_at: string;
          deleted: boolean;
          height: number;
          id: string;
          page_id: string;
          rotation: number;
          type: string;
          updated_at: string;
          width: number;
          x: number;
          y: number;
          z: number;
        };
        Insert: {
          created_at?: string;
          deleted?: boolean;
          height: number;
          id?: string;
          page_id: string;
          rotation: number;
          type: string;
          updated_at?: string;
          width: number;
          x: number;
          y: number;
          z: number;
        };
        Update: {
          created_at?: string;
          deleted?: boolean;
          height?: number;
          id?: string;
          page_id?: string;
          rotation?: number;
          type?: string;
          updated_at?: string;
          width?: number;
          x?: number;
          y?: number;
          z?: number;
        };
        Relationships: [
          {
            foreignKeyName: "page_items_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages_old";
            referencedColumns: ["id"];
          }
        ];
      };
      page_reactions: {
        Row: {
          created_at: string;
          created_by: string;
          deleted: boolean;
          draft: boolean;
          id: string;
          page_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          deleted?: boolean;
          draft?: boolean;
          id?: string;
          page_id: string;
          updated_at: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          deleted?: boolean;
          draft?: boolean;
          id?: string;
          page_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_reactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "page_reactions_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages_old";
            referencedColumns: ["id"];
          }
        ];
      };
      pages: {
        Row: {
          canvas: Json | null;
          created_at: string;
          created_by: string;
          date: string;
          deleted: boolean;
          group_id: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          canvas?: Json | null;
          created_at?: string;
          created_by?: string;
          date: string;
          deleted?: boolean;
          group_id: string;
          id: string;
          updated_at: string;
        };
        Update: {
          canvas?: Json | null;
          created_at?: string;
          created_by?: string;
          date?: string;
          deleted?: boolean;
          group_id?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pages_created_by_fkey1";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      pages_old: {
        Row: {
          background_image: string | null;
          created_at: string;
          created_by: string;
          date: string;
          deleted: boolean;
          draft: boolean;
          group_id: string;
          id: string;
          screen_height: number;
          screen_width: number;
          updated_at: string;
        };
        Insert: {
          background_image?: string | null;
          created_at: string;
          created_by: string;
          date: string;
          deleted?: boolean;
          draft?: boolean;
          group_id: string;
          id?: string;
          screen_height: number;
          screen_width: number;
          updated_at: string;
        };
        Update: {
          background_image?: string | null;
          created_at?: string;
          created_by?: string;
          date?: string;
          deleted?: boolean;
          draft?: boolean;
          group_id?: string;
          id?: string;
          screen_height?: number;
          screen_width?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pages_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pages_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_placeholder: string | null;
          avatar_url: string | null;
          created_at: string;
          deleted: boolean;
          id: string;
          name: string | null;
          new: boolean;
          push_token: string | null;
          should_clear_storage: boolean;
          should_reset_storage: boolean;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_placeholder?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          deleted?: boolean;
          id?: string;
          name?: string | null;
          new?: boolean;
          push_token?: string | null;
          should_clear_storage?: boolean;
          should_reset_storage?: boolean;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_placeholder?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          deleted?: boolean;
          id?: string;
          name?: string | null;
          new?: boolean;
          push_token?: string | null;
          should_clear_storage?: boolean;
          should_reset_storage?: boolean;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      reactions: {
        Row: {
          created_at: string;
          created_by: string;
          deleted: boolean;
          id: string;
          page_id: string;
          reaction: Json;
          updated_at: string;
        };
        Insert: {
          created_at: string;
          created_by: string;
          deleted?: boolean;
          id?: string;
          page_id: string;
          reaction: Json;
          updated_at: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          deleted?: boolean;
          id?: string;
          page_id?: string;
          reaction?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reactions_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          }
        ];
      };
      reactions_old: {
        Row: {
          created_at: string;
          created_by: string;
          deleted: boolean;
          id: string;
          page_id: string;
          reaction: Json;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          deleted?: boolean;
          id?: string;
          page_id: string;
          reaction: Json;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          deleted?: boolean;
          id?: string;
          page_id?: string;
          reaction?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      stickers: {
        Row: {
          created_at: string;
          id: number;
          name: string | null;
          path: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string | null;
          path?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string | null;
          path?: string | null;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          created_at: string;
          data: Json | null;
          id: number;
          name: string | null;
          path: string | null;
        };
        Insert: {
          created_at?: string;
          data?: Json | null;
          id?: number;
          name?: string | null;
          path?: string | null;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          id?: number;
          name?: string | null;
          path?: string | null;
        };
        Relationships: [];
      };
      waitlist: {
        Row: {
          created_at: string;
          email: string;
          id: number;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: number;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_group_admin: {
        Args: {
          p_user_id: string;
          p_group_id: string;
        };
        Returns: boolean;
      };
      is_group_member: {
        Args: {
          p_user_id: string;
          p_group_id: string;
        };
        Returns: boolean;
      };
      process_notifications: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      send_push_notification: {
        Args: {
          push_token: string;
          notification_data: Json;
        };
        Returns: string;
      };
    };
    Enums: {
      book_type: "journal" | "defaultJournal";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
