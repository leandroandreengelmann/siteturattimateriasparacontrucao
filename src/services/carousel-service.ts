import { supabase } from '@/lib/supabase'
import { z } from 'zod'

export const carouselSettingsSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1, 'O título é obrigatório'),
    product_type: z.enum(['featured', 'promo_month', 'new', 'last_units']),
    is_active: z.boolean(),
    display_order: z.number().min(1).max(5),
    has_timer: z.boolean().optional(),
    timer_target_date: z.string().nullable().optional(),
    has_quantity: z.boolean().optional(),
    quantity_count: z.number().nullable().optional(),
    updated_at: z.string().optional(),
})

export type CarouselSettings = z.infer<typeof carouselSettingsSchema>

export interface CarouselWithProducts extends CarouselSettings {
    products: any[]
}

export class CarouselService {
    static async getCarousels(): Promise<CarouselWithProducts[]> {
        const { data, error } = await supabase
            .from('carousel_settings')
            .select(`
                *,
                carousel_products (
                    product_id,
                    display_order,
                    products:product_id (
                        *,
                        subcategories (
                            id, name, slug,
                            categories (id, name, slug)
                        )
                    )
                )
            `)
            .order('display_order', { ascending: true })

        if (error) {
            console.error('CarouselService Error:', error)
            throw new Error(`Falha ao carregar carrosséis: ${error.message}`)
        }

        if (!data || data.length === 0) {
            return []
        }

        return data.map((item: any) => ({
            ...item,
            products: item.carousel_products
                ?.sort((a: any, b: any) => a.display_order - b.display_order)
                .map((cp: any) => cp.products)
                .filter(Boolean) || []
        }))
    }

    static async updateCarousel(id: string, data: Partial<Omit<CarouselSettings, 'id' | 'updated_at'>>): Promise<void> {
        const { error } = await (supabase as any)
            .from('carousel_settings')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) {
            console.error('Error updating carousel settings:', error)
            throw new Error('Falha ao atualizar configurações do carrossel')
        }
    }

    static async syncCarouselProducts(carouselId: string, productIds: string[]): Promise<void> {
        // 1. Delete existing products for this carousel
        const { error: deleteError } = await (supabase as any)
            .from('carousel_products')
            .delete()
            .eq('carousel_id', carouselId)

        if (deleteError) {
            throw new Error('Falha ao limpar produtos do carrossel')
        }

        if (productIds.length === 0) return

        // 2. Insert new products
        const insertData = productIds.map((productId, index) => ({
            carousel_id: carouselId,
            product_id: productId,
            display_order: index + 1
        }))

        const { error: insertError } = await (supabase as any)
            .from('carousel_products')
            .insert(insertData)

        if (insertError) {
            console.error('Error syncing carousel products:', insertError)
            throw new Error('Falha ao sincronizar produtos do carrossel')
        }
    }
}
