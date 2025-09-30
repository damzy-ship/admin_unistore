import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface UniqueVisitor {
  id: string
  user_id: string
  first_visit: string
  last_visit: string
  visit_count: number
  created_at: string
  phone_number?: string
  auth_user_id?: string
  full_name?: string
  email?: string
  user_type: 'user' | 'merchant'
  school_id?: string
  brand_name?: string
  verification_id?: string
  verification_status: 'verified' | 'unverified' | 'pending'
  schools?: {
    name: string
    short_name: string
  }
}

export interface Invoice {
  id: string
  created_at: string
  payment_reference?: string
  customer_id?: string
  product_id?: string
  merchant_id?: string
  invoice_status?: string
  merchant_name?: string
  merchant_number?: string
  customer_name?: string
  customer_number?: string
  customer_email?: string
  invoice_amount?: string
}

export interface MerchantProduct {
  id: string
  created_at: string
  merchant_id?: string
  product_description?: string
  product_price?: string
  is_available: boolean
  image_urls: string[]
  search_description?: string
  product_categories: string[]
  product_features: string[]
  is_featured: boolean
  discount_price?: string;
  unique_visitor?: UniqueVisitor;
}

export interface School {
  id: string
  name: string
  short_name: string
  is_active: boolean
  created_at: string
}

export interface Hostel {
  id: string
  name: string
  school_id: string
}