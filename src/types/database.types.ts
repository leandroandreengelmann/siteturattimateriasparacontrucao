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
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    created_at?: string
                }
            }
            subcategories: {
                Row: {
                    id: string
                    category_id: string
                    name: string
                    slug: string
                    href: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    category_id: string
                    name: string
                    slug: string
                    href: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    category_id?: string
                    name?: string
                    slug?: string
                    href?: string
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    subcategory_id: string
                    name: string
                    slug: string
                    description: string | null
                    price: number
                    sale_price: number | null
                    is_on_sale: boolean
                    is_featured: boolean
                    is_promo_month: boolean
                    is_new: boolean
                    is_last_units: boolean
                    brand: string | null
                    is_electric: boolean
                    voltage: string | null
                    is_paint: boolean
                    paint_color: string | null
                    paint_color_hex: string | null
                    paint_volume: string | null
                    unit: string | null
                    stock_status: string
                    image_url: string | null
                    images: string[]
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    subcategory_id: string
                    name: string
                    slug: string
                    description?: string | null
                    price: number
                    sale_price?: number | null
                    is_on_sale?: boolean
                    is_featured?: boolean
                    is_promo_month?: boolean
                    is_new?: boolean
                    is_last_units?: boolean
                    brand?: string | null
                    is_electric?: boolean
                    voltage?: string | null
                    is_paint?: boolean
                    paint_color?: string | null
                    paint_color_hex?: string | null
                    paint_volume?: string | null
                    unit?: string | null
                    stock_status?: string
                    image_url?: string | null
                    images?: string[]
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    subcategory_id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    price?: number
                    sale_price?: number | null
                    is_on_sale?: boolean
                    is_featured?: boolean
                    is_promo_month?: boolean
                    is_new?: boolean
                    is_last_units?: boolean
                    brand?: string | null
                    is_electric?: boolean
                    voltage?: string | null
                    is_paint?: boolean
                    paint_color?: string | null
                    paint_color_hex?: string | null
                    paint_volume?: string | null
                    unit?: string | null
                    stock_status?: string
                    image_url?: string | null
                    images?: string[]
                    is_active?: boolean
                    created_at?: string
                }
            }
            carousel_settings: {
                Row: {
                    id: string
                    title: string
                    product_type: 'featured' | 'promo_month' | 'new' | 'last_units'
                    is_active: boolean
                    display_order: number
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    product_type: 'featured' | 'promo_month' | 'new' | 'last_units'
                    is_active?: boolean
                    display_order: number
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    product_type?: 'featured' | 'promo_month' | 'new' | 'last_units'
                    is_active?: boolean
                    display_order?: number
                    updated_at?: string
                }
            }
            carousel_products: {
                Row: {
                    id: string
                    carousel_id: string
                    product_id: string
                    display_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    carousel_id: string
                    product_id: string
                    display_order: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    carousel_id?: string
                    product_id?: string
                    display_order?: number
                    created_at?: string
                }
            }
            stores: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    relevant_data: string | null
                    main_image_url: string | null
                    images: string[]
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    relevant_data?: string | null
                    main_image_url?: string | null
                    images?: string[]
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    relevant_data?: string | null
                    main_image_url?: string | null
                    images?: string[]
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            store_sellers: {
                Row: {
                    id: string
                    store_id: string
                    name: string
                    whatsapp: string
                    is_active: boolean
                    display_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    store_id: string
                    name: string
                    whatsapp: string
                    is_active?: boolean
                    display_order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string
                    name?: string
                    whatsapp?: string
                    is_active?: boolean
                    display_order?: number
                    created_at?: string
                }
            }
        }
    }
}
