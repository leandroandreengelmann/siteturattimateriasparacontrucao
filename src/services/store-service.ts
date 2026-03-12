import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'

export type Store = Database['public']['Tables']['stores']['Row']
export type StoreInsert = Database['public']['Tables']['stores']['Insert']
export type StoreUpdate = Database['public']['Tables']['stores']['Update']

export const StoresService = {
    async getStores() {
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Store[]
    },

    async getActiveStores() {
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Store[]
    },

    async getStoreById(id: string) {
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as Store
    },

    async createStore(store: StoreInsert) {
        const { data, error } = await supabase
            .from('stores')
            .insert(store as never)
            .select()
            .single()

        if (error) throw error
        return data as Store
    },

    async updateStore(id: string, store: StoreUpdate) {
        const { data, error } = await supabase
            .from('stores')
            .update(store as never)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Store
    },

    async deleteStore(id: string) {
        const { error } = await supabase
            .from('stores')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    async uploadImage(file: File): Promise<string> {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('stores')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('stores')
            .getPublicUrl(filePath)

        return publicUrl
    },

    async deleteImage(imageUrl: string) {
        try {
            const urlParts = imageUrl.split('/')
            const filePath = urlParts[urlParts.length - 1]

            if (!filePath) return

            const { error } = await supabase.storage
                .from('stores')
                .remove([filePath])

            if (error) throw error
        } catch (error) {
            console.error('Error deleting image:', error)
        }
    }
}
