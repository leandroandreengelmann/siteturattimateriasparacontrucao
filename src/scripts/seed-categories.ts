import { createClient } from '@supabase/supabase-js'
import { CATEGORIES_DATA } from '../config/navigation'
import * as dotenv from 'dotenv'

// Carregar variáveis de ambiente para o script
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Usando anon se service role não disponível

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
    console.log('Iniciando seed de categorias...')

    for (const cat of CATEGORIES_DATA) {
        const slug = cat.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

        // Inserir Categoria
        const { data: category, error: catError } = await supabase
            .from('categories')
            .upsert({ name: cat.title, slug }, { onConflict: 'slug' })
            .select()
            .single()

        if (catError) {
            console.error(`Erro ao inserir categoria ${cat.title}:`, catError)
            continue
        }

        console.log(`Categoria processada: ${cat.title}`)

        if (cat.subcategories && cat.subcategories.length > 0) {
            const subcategoriesData = cat.subcategories.map(sub => ({
                category_id: category.id,
                name: sub.title,
                slug: sub.href.split('/').pop() || '',
                href: sub.href
            }))

            const { error: subError } = await supabase
                .from('subcategories')
                .upsert(subcategoriesData, { onConflict: 'category_id, name' }) // Precisaria de uma constraint unique para isso funcionar 100% com upsert

            if (subError) {
                console.error(`Erro ao inserir subcategorias para ${cat.title}:`, subError)
            } else {
                console.log(`  ${subcategoriesData.length} subcategorias inseridas.`)
            }
        }
    }

    console.log('Seed concluído com sucesso!')
}

seed().catch(console.error)
