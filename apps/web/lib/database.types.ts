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
          full_name: string
          phone: string | null
          avatar_url: string | null
          role: 'customer' | 'admin' | 'superadmin'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      shops: {
        Row: {
          id: string
          admin_id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          banner_url: string | null
          status: 'pending' | 'active' | 'suspended'
          suspension_reason: string | null
          suspended_at: string | null
          gst_number: string | null
          serviceable_pincodes: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['shops']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['shops']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          pet_type: 'dog' | 'cat' | 'bird' | 'fish' | 'small_animal' | 'all'
          parent_id: string | null
          image_url: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      products: {
        Row: {
          id: string
          shop_id: string
          category_id: string
          name: string
          slug: string
          description: string | null
          price_inr: number
          gst_rate: number
          compare_at_price: number | null
          sku: string | null
          stock_quantity: number
          weight_grams: number | null
          images: string[]
          is_active: boolean
          is_featured: boolean
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          price_inr: number
          stock_quantity: number
          sku: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          full_name: string
          phone: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          pincode: string
          is_default: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['addresses']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cart_items']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['cart_items']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          address_id: string
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned'
          subtotal_inr: number
          gst_amount: number
          shipping_inr: number
          discount_inr: number
          total_inr: number
          payment_method: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          shop_id: string
          variant_id: string | null
          product_name: string
          variant_name: string | null
          quantity: number
          unit_price_inr: number
          gst_rate: number
          total_inr: number
          fulfillment_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          tracking_number: string | null
          tracking_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['wishlist_items']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['wishlist_items']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_item_id: string
          rating: number
          title: string | null
          body: string | null
          images: string[] | null
          is_verified: boolean
          is_visible: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      featured_sections: {
        Row: {
          id: string
          title: string
          slug: string
          section_type: 'product_list' | 'category_list' | 'banner'
          product_ids: string[] | null
          category_ids: string[] | null
          banner_url: string | null
          banner_link: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['featured_sections']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['featured_sections']['Insert']>
      }
      coupons: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: 'percentage' | 'flat'
          discount_value: number
          min_order_inr: number | null
          max_discount_inr: number | null
          usage_limit: number | null
          used_count: number
          valid_from: string
          valid_until: string
          is_active: boolean
          shop_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_product_stock: {
        Args: {
          p_product_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      decrement_variant_stock: {
        Args: {
          p_variant_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      increment_product_stock: {
        Args: {
          p_product_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      increment_variant_stock: {
        Args: {
          p_variant_id: string
          p_quantity: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
