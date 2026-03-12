import { supabase } from '@/lib/supabase'
import { UploadService } from '@/services/upload-service'

export interface AboutSettings {
    id: string
    content: string | null
    updated_at: string
}

export interface AboutImage {
    id: string
    image_url: string
    display_order: number
    created_at: string
}

const ABOUT_IMAGES_BUCKET = 'about-images'

export class AboutService {
    static async getSettings(): Promise<AboutSettings> {
        const { data, error } = await (supabase as any)
            .from('about_settings')
            .select('*')
            .limit(1)
            .maybeSingle()

        if (error) {
            console.error('Error fetching about settings:', error)
            throw new Error('Falha ao carregar configurações da página Sobre Nós')
        }

        if (data) return data

        return {
            id: '',
            content: '',
            updated_at: new Date().toISOString()
        }
    }

    static async updateSettings(content: string): Promise<void> {
        const { data: current, error: fetchError } = await (supabase as any)
            .from('about_settings')
            .select('id')
            .limit(1)
            .maybeSingle()

        if (fetchError) {
            console.error('Error fetching about settings for update:', fetchError)
            throw new Error('Falha ao localizar configurações')
        }

        if (current?.id) {
            const { error } = await (supabase as any)
                .from('about_settings')
                .update({ content, updated_at: new Date().toISOString() })
                .eq('id', current.id)

            if (error) {
                console.error('Error updating about settings row:', JSON.stringify(error))
                throw new Error('Falha ao atualizar conteúdo')
            }
        } else {
            const { error } = await (supabase as any)
                .from('about_settings')
                .insert({ content })

            if (error) {
                console.error('Error inserting about settings row:', JSON.stringify(error))
                throw new Error('Falha ao criar configurações')
            }
        }
    }

    static async getImages(): Promise<AboutImage[]> {
        const { data, error } = await (supabase as any)
            .from('about_images')
            .select('*')
            .order('display_order', { ascending: true })

        if (error) {
            console.error('Error fetching about images:', error)
            throw new Error('Falha ao carregar imagens')
        }

        return data || []
    }

    static async addImage(file: File, order: number): Promise<AboutImage> {
        // Since we don't have a record ID yet (it's generated on insert),
        // we use a timestamp or a generic prefix for the folder path or just use a generic ID for the image
        const tempId = 'about-' + Date.now().toString()
        const imageUrl = await UploadService.uploadImage(ABOUT_IMAGES_BUCKET, tempId, file)

        const { data, error } = await (supabase as any)
            .from('about_images')
            .insert({ image_url: imageUrl, display_order: order })
            .select()
            .single()

        if (error) {
            console.error('Error adding about image:', error)
            throw new Error('Falha ao salvar a imagem')
        }

        return data
    }

    static async deleteImage(id: string, imageUrl: string): Promise<void> {
        const { error } = await (supabase as any)
            .from('about_images')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting about image:', error)
            throw new Error('Falha ao excluir a imagem')
        }

        await UploadService.removeImage(ABOUT_IMAGES_BUCKET, imageUrl).catch(console.warn)
    }

    static async updateImageOrders(items: { id: string; display_order: number }[]): Promise<void> {
        const updates = items.map(item =>
            (supabase as any)
                .from('about_images')
                .update({ display_order: item.display_order })
                .eq('id', item.id)
        )

        const results = await Promise.all(updates)
        const errors = results.filter((r: any) => r.error)

        if (errors.length > 0) {
            console.error('Error updating image orders:', errors)
            throw new Error('Falha ao atualizar a ordem das imagens')
        }
    }
}
