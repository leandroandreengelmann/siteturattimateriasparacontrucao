import { supabase } from '@/lib/supabase'
import { z } from 'zod'

export const baseProductSchema = z.object({
    id: z.string().uuid(),
    subcategory_id: z.string().uuid(),
    name: z.string().min(1, 'Nome é obrigatório'),
    slug: z.string().min(1, 'Slug é obrigatório'),
    description: z.string().optional().nullable(),
    price: z.coerce.number().min(0, 'Preço deve ser positivo'),
    sale_price: z.coerce.number().min(0, 'Preço de oferta deve ser positivo').optional().nullable(),
    is_on_sale: z.boolean().default(false),
    is_featured: z.boolean().default(false),
    is_promo_month: z.boolean().default(false),
    is_new: z.boolean().default(false),
    is_last_units: z.boolean().default(false),
    brand: z.string().optional().nullable(),
    is_electric: z.boolean().default(false),
    voltage: z.string().optional().nullable(),
    is_paint: z.boolean().default(false),
    paint_color: z.string().optional().nullable(),
    paint_color_hex: z.string().optional().nullable(),
    paint_volume: z.string().optional().nullable(),
    unit: z.string().optional().nullable(),
    stock_status: z.enum(['em_estoque', 'sob_encomenda', 'esgotado']).default('em_estoque'),
    image_url: z.string().optional().nullable(),
    images: z.array(z.string()).default([]),
    is_active: z.boolean().default(true),
    created_at: z.string().optional(),
})

const priceRefinement = (data: any) => {
    if (data.is_on_sale && data.sale_price !== null && data.sale_price !== undefined) {
        return data.sale_price <= data.price
    }
    return true
}

const priceRefinementConfig = {
    message: "O preço de oferta não pode ser maior que o preço normal",
    path: ["sale_price"]
}

export const productSchema = baseProductSchema.refine(priceRefinement, priceRefinementConfig)

export const createProductSchema = baseProductSchema
    .omit({ id: true, created_at: true })
    .refine(priceRefinement, priceRefinementConfig)

export type Product = z.infer<typeof productSchema>

export class ProductService {
    static async searchProducts(query: string) {
        if (!query || query.trim().length < 2) return []

        const { data, error } = await supabase
            .from('products')
            .select(`
                id,
                name,
                slug,
                price,
                sale_price,
                is_on_sale,
                image_url,
                subcategories (
                    categories (slug)
                )
            `)
            .eq('is_active', true)
            .ilike('name', `%${query.trim()}%`)
            .limit(5)

        if (error) {
            console.error('Error searching products:', error)
            return []
        }

        return (data as any[]) || []
    }

    static async getAllProducts() {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                subcategories (
                    id, 
                    name,
                    slug,
                    categories (id, name, slug)
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching products:', error)
            throw new Error('Falha ao carregar produtos')
        }

        return data
    }

    static async getFeaturedProducts() {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                subcategories (
                    id, 
                    name,
                    slug,
                    categories (id, name, slug)
                )
            `)
            .or('is_featured.eq.true,is_promo_month.eq.true,is_new.eq.true')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            console.error('Error fetching featured products:', error)
            throw new Error('Falha ao carregar produtos em destaque')
        }

        return data
    }

    static async getProductBySlug(slug: string) {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                subcategories (
                    id,
                    name,
                    slug,
                    categories (id, name, slug)
                )
            `)
            .eq('slug', slug)
            .single()

        if (error) {
            console.error(`Error fetching product [${slug}]:`, {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
            throw new Error('Falha ao carregar produto')
        }
        return data as any
    }

    static async getProductById(id: string) {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                subcategories (
                    id,
                    name,
                    slug,
                    categories (id, name, slug)
                )
            `)
            .eq('id', id)
            .single()

        if (error) {
            console.error(`Error fetching product by ID [${id}]:`, {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
            throw new Error('Falha ao carregar produto')
        }
        return data as any
    }

    static async createProduct(data: z.infer<typeof createProductSchema>) {
        const { error } = await (supabase as any).from('products').insert(data)
        if (error) throw error
    }

    static async updateProduct(id: string, data: Partial<z.infer<typeof createProductSchema>>) {
        const { error } = await (supabase as any).from('products').update(data).eq('id', id)
        if (error) throw error
    }

    static async deleteProduct(id: string) {
        const { error } = await (supabase as any).from('products').delete().eq('id', id)
        if (error) throw error
    }

    static async duplicateProduct(id: string) {
        // 1. Fetch original product
        const { data, error: fetchError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !data) {
            console.error('Error fetching original product for duplication:', fetchError)
            throw new Error('Falha ao buscar produto original')
        }

        // 2. Prepare new product data
        const shortId = Math.random().toString(36).substring(2, 7)
        const product = data as any

        // Extract all fields except automated ones
        const { id: _oldId, created_at: _oldCreatedAt, ...productData } = product

        const duplicateData = {
            ...productData,
            name: `${product.name} (Cópia)`,
            slug: `${product.slug}-copy-${shortId}`,
        }

        // 3. Insert duplicate
        const { error: insertError } = await (supabase as any).from('products').insert(duplicateData)

        if (insertError) {
            console.error('Error inserting duplicated product:', insertError)
            throw new Error('Falha ao criar cópia do produto')
        }
    }

    static async getPromoProducts() {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                subcategories (
                    id,
                    name,
                    slug,
                    categories (id, name, slug)
                )
            `)
            .eq('is_active', true)
            .or('is_on_sale.eq.true,is_promo_month.eq.true')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching promo products:', error)
            throw new Error('Falha ao carregar produtos em promoção')
        }

        return (data as any[]) || []
    }

    static async getProductsByCategorySlug(categorySlug: string) {
        // Step 1: get all subcategory IDs for this category slug
        const { data: subs, error: subError } = await supabase
            .from('subcategories')
            .select('id, name, slug, categories!inner(id, name, slug)')
            .eq('categories.slug', categorySlug)

        if (subError) {
            console.error('Error fetching subcategories for category:', subError)
            throw new Error('Falha ao carregar subcategorias da categoria')
        }

        if (!subs || subs.length === 0) return []

        const subIds = subs.map((s: any) => s.id)

        // Step 2: fetch products by subcategory_id
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                subcategories (id, name, slug, categories (id, name, slug))
            `)
            .eq('is_active', true)
            .in('subcategory_id', subIds)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching products by category:', error)
            throw new Error('Falha ao carregar produtos da categoria')
        }

        return (data as any[]) || []
    }

    static async getProductsBySubcategorySlug(subcategorySlug: string) {
        // Step 1: get the subcategory ID for this slug
        const { data: sub, error: subError } = await supabase
            .from('subcategories')
            .select('id, name, slug, categories (id, name, slug)')
            .eq('slug', subcategorySlug)
            .single()

        if (subError || !sub) {
            if (subError?.code === 'PGRST116') return []
            console.error('Error fetching subcategory by slug:', subError)
            throw new Error('Falha ao carregar subcategoria')
        }

        // Step 2: fetch products by subcategory_id
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                subcategories (id, name, slug, categories (id, name, slug))
            `)
            .eq('is_active', true)
            .eq('subcategory_id', (sub as any).id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching products by subcategory:', error)
            throw new Error('Falha ao carregar produtos da subcategoria')
        }

        return (data as any[]) || []
    }
}
