import { supabase } from '@/lib/supabase'
import { UploadService } from '@/services/upload-service'

export interface FixedBannerSettings {
    id: string
    image_url: string | null
    link_url: string | null
    is_active: boolean
}

const BUCKET_NAME = 'home-banners'

export class FixedBannerService {
    static async getSettings(): Promise<FixedBannerSettings> {
        const { data, error } = await (supabase as any)
            .from('fixed_banner_settings')
            .select('*')
            .limit(1)
            .maybeSingle()

        if (error) {
            console.error('Error fetching fixed banner settings:', error)
            throw new Error('Falha ao carregar configurações do banner fixo')
        }

        if (data) return data

        return {
            id: '',
            image_url: null,
            link_url: null,
            is_active: false
        }
    }

    static async updateSettings(
        settings: { is_active: boolean; link_url: string | null },
        newImageFile?: File | null
    ): Promise<void> {
        let currentSettings = await this.getSettings().catch(() => null)
        let imageUrl = currentSettings?.image_url

        if (newImageFile) {
            // Upload new image
            const tempId = `fixed-banner-${Date.now()}`
            imageUrl = await UploadService.uploadImage(BUCKET_NAME, tempId, newImageFile)

            // Optionally delete old image
            if (currentSettings?.image_url) {
                await UploadService.removeImage(BUCKET_NAME, currentSettings.image_url).catch(console.warn)
            }
        }

        const payload = {
            is_active: settings.is_active,
            link_url: settings.link_url || null,
            image_url: imageUrl || null,
            updated_at: new Date().toISOString()
        }

        if (currentSettings && currentSettings.id) {
            const { error } = await (supabase as any)
                .from('fixed_banner_settings')
                .update(payload)
                .eq('id', currentSettings.id)

            if (error) {
                console.error('Error updating banner:', error)
                throw new Error('Falha ao atualizar o banner')
            }
        } else {
            const { error } = await (supabase as any)
                .from('fixed_banner_settings')
                .insert(payload)

            if (error) {
                console.error('Error inserting banner:', error)
                throw new Error('Falha ao criar o banner')
            }
        }
    }

    static async deleteBannerImage(): Promise<void> {
        const currentSettings = await this.getSettings().catch(() => null)

        if (currentSettings && currentSettings.image_url) {
            await UploadService.removeImage(BUCKET_NAME, currentSettings.image_url).catch(console.warn)

            if (currentSettings.id) {
                await (supabase as any)
                    .from('fixed_banner_settings')
                    .update({ image_url: null })
                    .eq('id', currentSettings.id)
            }
        }
    }
}
