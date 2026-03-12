import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'

export type Seller = Database['public']['Tables']['store_sellers']['Row']
export type SellerInsert = Database['public']['Tables']['store_sellers']['Insert']
export type SellerUpdate = Database['public']['Tables']['store_sellers']['Update']

export const SellerService = {
    async getSellersByStore(storeId: string) {
        const { data, error } = await supabase
            .from('store_sellers')
            .select('*')
            .eq('store_id', storeId)
            .order('display_order', { ascending: true })

        if (error) throw error
        return data as Seller[]
    },

    async getActiveSellersByStore(storeId: string) {
        const { data, error } = await supabase
            .from('store_sellers')
            .select('*')
            .eq('store_id', storeId)
            .eq('is_active', true)
            .order('display_order', { ascending: true })

        if (error) throw error
        return data as Seller[]
    },

    async createSeller(seller: SellerInsert) {
        const { data, error } = await supabase
            .from('store_sellers')
            .insert(seller as never)
            .select()
            .single()

        if (error) throw error
        return data as Seller
    },

    async updateSeller(id: string, seller: SellerUpdate) {
        const { data, error } = await supabase
            .from('store_sellers')
            .update(seller as never)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Seller
    },

    async deleteSeller(id: string) {
        const { error } = await supabase
            .from('store_sellers')
            .delete()
            .eq('id', id)

        if (error) throw error
    },
}
