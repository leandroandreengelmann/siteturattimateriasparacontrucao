import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from './mocks/server'
import { http, HttpResponse } from 'msw'
import { CategoryService } from '@/services/category-service'

const SUPABASE_URL = 'https://test.supabase.co'

const mockCategory = {
  id: 'cat-001',
  name: 'Tintas',
  slug: 'tintas',
  is_active: true,
  subcategories: [
    { id: 'sub-001', category_id: 'cat-001', name: 'Tintas Imobiliárias', slug: 'tintas-imobiliarias', href: '/produtos/tintas/imobiliarias', is_active: true },
  ],
}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('CategoryService.getAllCategories()', () => {
  it('retorna lista de categorias com subcategorias', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/categories`, () =>
        HttpResponse.json([mockCategory])
      )
    )
    const result = await CategoryService.getAllCategories()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Tintas')
    expect(result[0].subcategories).toHaveLength(1)
  })

  it('lança erro em falha de Supabase', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/categories`, () =>
        HttpResponse.json({ message: 'Error' }, { status: 500 })
      )
    )
    await expect(CategoryService.getAllCategories()).rejects.toThrow('Falha ao carregar categorias')
  })
})

describe('CategoryService.getCategoryBySlug()', () => {
  it('retorna categoria para slug válido', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/categories`, () =>
        HttpResponse.json(mockCategory)
      )
    )
    const result = await CategoryService.getCategoryBySlug('tintas')
    expect(result?.name).toBe('Tintas')
  })

  it('retorna null para slug não encontrado (PGRST116)', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/categories`, () =>
        HttpResponse.json(
          { code: 'PGRST116', message: 'Not found' },
          { status: 406 }
        )
      )
    )
    const result = await CategoryService.getCategoryBySlug('inexistente')
    expect(result).toBeNull()
  })
})

describe('CategoryService.createCategory()', () => {
  it('cria categoria sem lançar erro', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/categories`, () =>
        new HttpResponse(null, { status: 201 })
      )
    )
    await expect(CategoryService.createCategory({ name: 'Ferramentas', slug: 'ferramentas' })).resolves.toBeUndefined()
  })
})

describe('CategoryService.updateCategory()', () => {
  it('atualiza categoria sem lançar erro', async () => {
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/categories`, () =>
        new HttpResponse(null, { status: 200 })
      )
    )
    await expect(CategoryService.updateCategory('cat-001', { name: 'Tintas Premium' })).resolves.toBeUndefined()
  })
})

describe('CategoryService.deleteCategory()', () => {
  it('deleta categoria sem lançar erro', async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/categories`, () =>
        new HttpResponse(null, { status: 200 })
      )
    )
    await expect(CategoryService.deleteCategory('cat-001')).resolves.toBeUndefined()
  })
})

describe('CategoryService.getAllSubCategories()', () => {
  it('retorna subcategorias com category_name mapeado', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/subcategories`, () =>
        HttpResponse.json([
          { id: 'sub-001', category_id: 'cat-001', name: 'Tintas Imobiliárias', slug: 'tintas-imobiliarias', href: '/produtos/tintas/imobiliarias', is_active: true, categories: { name: 'Tintas' } },
        ])
      )
    )
    const result = await CategoryService.getAllSubCategories()
    expect(result[0].category_name).toBe('Tintas')
  })
})

describe('CategoryService.getSubcategoryBySlug()', () => {
  it('retorna subcategoria para slug válido', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/subcategories`, () =>
        HttpResponse.json({ id: 'sub-001', name: 'Tintas Imobiliárias', slug: 'tintas-imobiliarias', categories: { id: 'cat-001', name: 'Tintas', slug: 'tintas' } })
      )
    )
    const result = await CategoryService.getSubcategoryBySlug('tintas-imobiliarias')
    expect(result?.name).toBe('Tintas Imobiliárias')
  })

  it('retorna null para slug não encontrado', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/subcategories`, () =>
        HttpResponse.json({ code: 'PGRST116', message: 'Not found' }, { status: 406 })
      )
    )
    const result = await CategoryService.getSubcategoryBySlug('inexistente')
    expect(result).toBeNull()
  })
})
