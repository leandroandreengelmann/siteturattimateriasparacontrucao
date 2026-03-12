import { supabase } from '@/lib/supabase'

export interface StoreContact {
    name: string
    phone: string
    weekday_hours: string
    saturday_hours: string
}

export interface SiteSettings {
    id: string
    instagram_url: string
    facebook_url: string
    whatsapp: string
    store_contacts: StoreContact[]
    updated_at: string
}

export const SettingsService = {
    async getSettings(): Promise<SiteSettings> {
        const { data, error } = await (supabase as any)
            .from('site_settings')
            .select('*')
            .limit(1)
            .maybeSingle()

        if (error) {
            console.error('Error fetching site settings:', error)
            throw error
        }

        if (data) {
            // Ensure store_contacts is an array even if stored as JSON
            return {
                ...data,
                store_contacts: Array.isArray(data.store_contacts) ? data.store_contacts : []
            } as SiteSettings
        }

        return {
            id: '',
            instagram_url: 'https://instagram.com',
            facebook_url: 'https://facebook.com',
            whatsapp: '',
            store_contacts: [
                { name: 'Matupá', phone: '', weekday_hours: '07:30 - 18:00', saturday_hours: '07:30 - 12:00' },
                { name: 'Peixoto de Azevedo', phone: '', weekday_hours: '07:30 - 18:00', saturday_hours: '07:30 - 12:00' }
            ],
            updated_at: new Date().toISOString()
        }
    },

    async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
        const { data: current } = await (supabase as any)
            .from('site_settings')
            .select('id')
            .limit(1)
            .maybeSingle()

        if (current?.id) {
            const { data, error } = await (supabase as any)
                .from('site_settings')
                .update({ ...settings, updated_at: new Date().toISOString() })
                .eq('id', current.id)
                .select()
                .single()

            if (error) throw error
            return data as SiteSettings
        } else {
            const { data, error } = await (supabase as any)
                .from('site_settings')
                .insert(settings as any)
                .select()
                .single()

            if (error) throw error
            return data as SiteSettings
        }
    }
}
