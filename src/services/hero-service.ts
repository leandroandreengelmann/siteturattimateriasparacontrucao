import { supabase } from '@/lib/supabase'
import { z } from 'zod'

export const heroSettingsSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1, 'O título é obrigatório'),
    accent_words: z.array(z.string()).default([]),
    accent_words_2: z.array(z.string()).default([]),
    accent_color_1: z.string().default('#2b00ff'),
    accent_color_2: z.string().default('#2b00ff'),
    subtitle: z.string().optional(),
    button_text: z.string().default('Ver Coleções'),
    button_url: z.string().default('/categories'),
    updated_at: z.string().optional(),
})

export type HeroSettings = z.infer<typeof heroSettingsSchema>

export class HeroService {
    private static HERO_ID = '67305963-3238-4430-a9de-39cc75790cdf'

    static async getHeroSettings(): Promise<HeroSettings> {
        const { data, error } = await supabase
            .from('hero_settings')
            .select('*')
            .eq('id', this.HERO_ID)
            .single()

        if (error) {
            console.error('DEBUG: HeroService.getHeroSettings Error:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            })
            throw new Error(`Falha ao carregar configurações da Hero: ${error.message}`)
        }

        try {
            return heroSettingsSchema.parse(data)
        } catch (parseError) {
            console.error('DEBUG: HeroService Zod Parse Error:', parseError)
            throw parseError
        }
    }

    static async updateHeroSettings(data: Partial<Omit<HeroSettings, 'id' | 'updated_at'>>): Promise<void> {
        const { error } = await (supabase as any)
            .from('hero_settings')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', this.HERO_ID)

        if (error) {
            console.error('Error updating hero settings:', error)
            throw new Error('Falha ao atualizar configurações da Hero')
        }
    }
}
