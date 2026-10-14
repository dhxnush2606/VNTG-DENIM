export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      products: { Row: { id: string; slug: string; name: string; fit: string; fabric: string; description: string; price_in_paise: number; status: string; is_active: boolean; is_featured: boolean; created_at: string; updated_at: string }; Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & Pick<Database["public"]["Tables"]["products"]["Row"], "slug" | "name" | "fit" | "price_in_paise">; Update: Partial<Database["public"]["Tables"]["products"]["Row"]>; Relationships: [] };
      product_images: { Row: { id: string; product_id: string; storage_path: string; alt_text: string; sort_order: number; created_at: string }; Insert: Partial<Database["public"]["Tables"]["product_images"]["Row"]> & Pick<Database["public"]["Tables"]["product_images"]["Row"], "product_id" | "storage_path">; Update: Partial<Database["public"]["Tables"]["product_images"]["Row"]>; Relationships: [] };
      product_sizes: { Row: { id: string; product_id: string; size: string; available: boolean; created_at: string; updated_at: string }; Insert: Partial<Database["public"]["Tables"]["product_sizes"]["Row"]> & Pick<Database["public"]["Tables"]["product_sizes"]["Row"], "product_id" | "size">; Update: Partial<Database["public"]["Tables"]["product_sizes"]["Row"]>; Relationships: [] };
      profiles: { Row: { id: string; display_name: string | null; role: "customer" | "admin"; created_at: string; updated_at: string }; Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & Pick<Database["public"]["Tables"]["profiles"]["Row"], "id">; Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>; Relationships: [] };
      orders: { Row: { id: string; order_number: string; user_id: string | null; status: "pending_payment" | "paid" | "processing" | "shipped" | "completed" | "cancelled"; customer_name: string; customer_email: string | null; customer_mobile: string; shipping_address: Record<string, string>; subtotal_in_paise: number; currency: string; shipping_carrier: string | null; tracking_number: string | null; created_at: string; updated_at: string }; Insert: never; Update: Partial<Pick<Database["public"]["Tables"]["orders"]["Row"], "status" | "shipping_carrier" | "tracking_number">>; Relationships: [] };
      order_items: { Row: { id: string; order_id: string; product_id: string; product_slug: string; product_name: string; size: string; quantity: number; unit_price_in_paise: number; line_total_in_paise: number; created_at: string }; Insert: never; Update: never; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: { create_pending_order: { Args: { p_customer: Json; p_items: Json }; Returns: { id: string; order_number: string; status: "pending_payment" }[] } };
    Enums: { order_status: "pending_payment" | "paid" | "processing" | "shipped" | "completed" | "cancelled"; profile_role: "customer" | "admin" };
    CompositeTypes: Record<string, never>;
  };
};
