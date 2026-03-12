import { supabase } from '@/lib/supabase'
import { UploadService } from '@/services/upload-service'

export interface SunvinilColorImage {
    id: string
    color_id: string
    image_url: string
    display_order: number
    created_at: string
}

export interface SunvinilColor {
    id: string
    name: string
    hex_code: string
    code: string | null
    link_url: string | null
    is_active: boolean
    display_order: number
    created_at: string
    images?: SunvinilColorImage[]
}

export type InsertSunvinilColor = Omit<SunvinilColor, 'id' | 'created_at' | 'images'>
export type UpdateSunvinilColor = Partial<InsertSunvinilColor>

const COLOR_IMAGES_BUCKET = 'color-images'

export class ColorService {
    static async getColors(activeOnly = false): Promise<SunvinilColor[]> {
        let query = (supabase as any)
            .from('sunvinil_colors')
            .select('*, images:sunvinil_color_images(id, color_id, image_url, display_order, created_at)')
            .order('display_order', { ascending: true })

        if (activeOnly) {
            query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (error) {
            console.error('ColorService Error:', error)
            throw new Error(`Falha ao carregar cores: ${error.message}`)
        }

        // Sort images by display_order within each color
        return ((data as any[]) || []).map((color: any) => ({
            ...color,
            images: ((color.images as SunvinilColorImage[]) || []).sort(
                (a, b) => a.display_order - b.display_order
            ),
        }))
    }

    static async addColor(data: InsertSunvinilColor): Promise<SunvinilColor> {
        const { data: result, error } = await (supabase as any)
            .from('sunvinil_colors')
            .insert(data)
            .select()
            .single()

        if (error) {
            console.error('Error adding color:', error)
            throw new Error('Falha ao adicionar cor')
        }

        return { ...result, images: [] }
    }

    static async updateColor(id: string, data: UpdateSunvinilColor): Promise<SunvinilColor> {
        const { data: result, error } = await (supabase as any)
            .from('sunvinil_colors')
            .update(data)
            .eq('id', id)
            .select('*, images:sunvinil_color_images(id, color_id, image_url, display_order, created_at)')
            .single()

        if (error) {
            console.error('Error updating color:', error)
            throw new Error('Falha ao atualizar cor')
        }

        return {
            ...result,
            images: (result.images || []).sort((a: SunvinilColorImage, b: SunvinilColorImage) => a.display_order - b.display_order),
        }
    }

    static async deleteColor(id: string): Promise<void> {
        const { error } = await (supabase as any)
            .from('sunvinil_colors')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting color:', error)
            throw new Error('Falha ao deletar cor')
        }
    }

    static async updateOrder(items: { id: string; display_order: number }[]): Promise<void> {
        const updates = items.map(item =>
            (supabase as any)
                .from('sunvinil_colors')
                .update({ display_order: item.display_order })
                .eq('id', item.id)
        )

        const results = await Promise.all(updates)
        const errors = results.filter((r: any) => r.error)

        if (errors.length > 0) {
            console.error('Error updating order:', errors)
            throw new Error('Falha ao atualizar ordem das cores')
        }
    }

    // ---- Color Images ----

    static async addColorImage(colorId: string, file: File, order: number): Promise<SunvinilColorImage> {
        const imageUrl = await UploadService.uploadImage(COLOR_IMAGES_BUCKET, colorId, file)

        const { data, error } = await (supabase as any)
            .from('sunvinil_color_images')
            .insert({ color_id: colorId, image_url: imageUrl, display_order: order })
            .select()
            .single()

        if (error) {
            console.error('Error adding color image:', error)
            throw new Error('Falha ao salvar imagem da cor')
        }

        return data
    }

    static async deleteColorImage(imageId: string, imageUrl: string): Promise<void> {
        const { error } = await (supabase as any)
            .from('sunvinil_color_images')
            .delete()
            .eq('id', imageId)

        if (error) {
            console.error('Error deleting color image:', error)
            throw new Error('Falha ao excluir imagem')
        }

        // Remove from storage (non-blocking)
        await UploadService.removeImage(COLOR_IMAGES_BUCKET, imageUrl).catch(console.warn)
    }

    // ---- Settings ----

    static async getSettings(): Promise<{ section_title: string }> {
        const { data, error } = await (supabase as any)
            .from('sunvinil_settings')
            .select('section_title')
            .single()

        if (error) {
            console.error('Error fetching sunvinil settings:', error)
            // Return default if table is empty or error
            return { section_title: 'Nossa Paleta de Cores' }
        }

        return data
    }

    static async updateSettings(title: string): Promise<void> {
        // First, let's find the current row to get its ID
        const { data: current, error: fetchError } = await (supabase as any)
            .from('sunvinil_settings')
            .select('id')
            .limit(1)
            .maybeSingle()

        if (fetchError) {
            console.error('Error fetching settings for update:', fetchError)
            throw new Error('Falha ao localizar configurações')
        }

        if (current?.id) {
            const { error } = await (supabase as any)
                .from('sunvinil_settings')
                .update({ section_title: title, updated_at: new Date().toISOString() })
                .eq('id', current.id)

            if (error) {
                console.error('Error updating settings row:', JSON.stringify(error))
                throw new Error('Falha ao atualizar título')
            }
        } else {
            // No row exists yet, insert a new one
            const { error } = await (supabase as any)
                .from('sunvinil_settings')
                .insert({ section_title: title })

            if (error) {
                console.error('Error inserting settings row:', JSON.stringify(error))
                throw new Error('Falha ao criar configurações')
            }
        }
    }
}
