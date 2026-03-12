import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const subCategorySchema = z.object({
    id: z.string(),
    category_id: z.string(),
    name: z.string(),
    slug: z.string(),
    href: z.string(),
    is_active: z.boolean().default(true),
})

const categorySchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    is_active: z.boolean().default(true),
    subcategories: z.array(subCategorySchema).optional(),
})

export const createCategorySchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    slug: z.string().min(1, 'Slug é obrigatório'),
    is_active: z.boolean().optional(),
})

export const createSubCategorySchema = z.object({
    category_id: z.string(),
    name: z.string().min(1, 'Nome é obrigatório'),
    slug: z.string().min(1, 'Slug é obrigatório'),
    href: z.string().min(1, 'Link é obrigatório'),
    is_active: z.boolean().optional(),
})

export type CategoryWithSub = z.infer<typeof categorySchema>

export class CategoryService {
    static async getAllCategories(): Promise<CategoryWithSub[]> {
        const { data, error } = await supabase
            .from('categories')
            .select(`
        *,
        subcategories (*)
      `)
            .order('name')

        if (error) {
            console.error('Error fetching categories:', error)
            throw new Error('Falha ao carregar categorias')
        }

        return z.array(categorySchema).parse(data)
    }

    static async getCategoryBySlug(slug: string): Promise<CategoryWithSub | null> {
        const { data, error } = await supabase
            .from('categories')
            .select(`
        *,
        subcategories (*)
      `)
            .eq('slug', slug)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // Not found
            console.error('Error fetching category:', error)
            throw new Error('Falha ao carregar categoria')
        }

        return categorySchema.parse(data)
    }

    static async createCategory(data: z.infer<typeof createCategorySchema>) {
        const { error } = await (supabase as any).from('categories').insert(data)
        if (error) throw error
    }

    static async updateCategory(id: string, data: Partial<z.infer<typeof createCategorySchema>>) {
        const { error } = await (supabase as any).from('categories').update(data).eq('id', id)
        if (error) throw error
    }

    static async deleteCategory(id: string) {
        const { error } = await (supabase as any).from('categories').delete().eq('id', id)
        if (error) throw error
    }

    static async createSubCategory(data: z.infer<typeof createSubCategorySchema>) {
        const { error } = await (supabase as any).from('subcategories').insert(data)
        if (error) throw error
    }

    static async updateSubCategory(id: string, data: Partial<z.infer<typeof createSubCategorySchema>>) {
        const { error } = await (supabase as any).from('subcategories').update(data).eq('id', id)
        if (error) throw error
    }

    static async deleteSubCategory(id: string) {
        const { error } = await (supabase as any).from('subcategories').delete().eq('id', id)
        if (error) throw error
    }

    static async getAllSubCategories(): Promise<(z.infer<typeof subCategorySchema> & { category_name?: string })[]> {
        const { data, error } = await supabase
            .from('subcategories')
            .select(`
                *,
                categories (name)
            `)
            .order('name')

        if (error) {
            console.error('Error fetching subcategories:', error)
            throw new Error('Falha ao carregar subcategorias')
        }

        return (data as any[]).map(sub => ({
            ...sub,
            category_name: sub.categories?.name
        }))
    }

    static async getSubcategoryBySlug(slug: string) {
        const { data, error } = await supabase
            .from('subcategories')
            .select('*, categories(id, name, slug)')
            .eq('slug', slug)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            console.error('Error fetching subcategory:', error)
            throw new Error('Falha ao carregar subcategoria')
        }

        return data as any
    }
}
