import { supabase } from '@/lib/supabase'

export interface HomeImageCarousel {
    id: string
    image_url: string
    link_url: string | null
    is_active: boolean
    display_order: number
    created_at: string
}

export type InsertHomeImageCarousel = Omit<HomeImageCarousel, 'id' | 'created_at'>
export type UpdateHomeImageCarousel = Partial<InsertHomeImageCarousel>

export class ImageCarouselService {
    static async getImages(activeOnly = false): Promise<HomeImageCarousel[]> {
        let query = supabase
            .from('home_image_carousels')
            .select('*')
            .order('display_order', { ascending: true })

        if (activeOnly) {
            query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (error) {
            console.error('ImageCarouselService Error:', error)
            throw new Error(`Falha ao carregar imagens do carrossel: ${error.message}`)
        }

        return data || []
    }

    static async addImage(data: InsertHomeImageCarousel): Promise<HomeImageCarousel> {
        const { data: result, error } = await (supabase as any)
            .from('home_image_carousels')
            .insert(data)
            .select()
            .single()

        if (error) {
            console.error('Error adding image:', error)
            throw new Error('Falha ao adicionar imagem ao carrossel')
        }

        return result
    }

    static async updateImage(id: string, data: UpdateHomeImageCarousel): Promise<HomeImageCarousel> {
        const { data: result, error } = await (supabase as any)
            .from('home_image_carousels')
            .update(data)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating image:', error)
            throw new Error('Falha ao atualizar imagem do carrossel')
        }

        return result
    }

    static async deleteImage(id: string): Promise<void> {
        const { error } = await (supabase as any)
            .from('home_image_carousels')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting image:', error)
            throw new Error('Falha ao deletar imagem do carrossel')
        }
    }

    static async updateOrder(items: { id: string; display_order: number }[]): Promise<void> {
        // Supabase doesn't support bulk update easily via free tier without rpc, 
        // so we can do it one by one or via a simpler approach if small quantity.
        // Assuming small quantity (e.g. 4-10 images), Promise.all is fine.
        const updates = items.map(item =>
            (supabase as any)
                .from('home_image_carousels')
                .update({ display_order: item.display_order })
                .eq('id', item.id)
        )

        const results = await Promise.all(updates)
        
        const errors = results.filter(r => r.error)
        if (errors.length > 0) {
            console.error('Error updating order:', errors)
            throw new Error('Falha ao atualizar a ordem das imagens')
        }
    }
}
