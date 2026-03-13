import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { server } from './mocks/server'
import { http, HttpResponse } from 'msw'
import { ProductService } from '@/services/product-service'

const SUPABASE_URL = 'https://test.supabase.co'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ProductService.searchProducts()', () => {
  it('retorna [] quando query é vazia', async () => {
    const result = await ProductService.searchProducts('')
    expect(result).toEqual([])
  })

  it('retorna [] quando query tem menos de 2 chars', async () => {
    const result = await ProductService.searchProducts('a')
    expect(result).toEqual([])
  })

  it('retorna [] quando query tem apenas espaços', async () => {
    const result = await ProductService.searchProducts('  ')
    expect(result).toEqual([])
  })

  it('chama Supabase e retorna produtos com query válida', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/products`, () =>
        HttpResponse.json([{ id: '1', name: 'Tinta', slug: 'tinta', price: 50, sale_price: null, is_on_sale: false, image_url: null, subcategories: { categories: { slug: 'tintas' } } }])
      )
    )
    const result = await ProductService.searchProducts('tinta')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Tinta')
  })
})

describe('ProductService.getAllProducts()', () => {
  it('retorna lista de produtos', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/products`, () =>
        HttpResponse.json([{ id: '1', name: 'Produto A' }, { id: '2', name: 'Produto B' }])
      )
    )
    const result = await ProductService.getAllProducts()
    expect(result).toHaveLength(2)
  })

  it('lança erro quando Supabase retorna erro', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/products`, () =>
        HttpResponse.json({ code: 'PGRST301', message: 'DB Error' }, { status: 500 })
      )
    )
    await expect(ProductService.getAllProducts()).rejects.toThrow('Falha ao carregar produtos')
  })
})

describe('ProductService.getFeaturedProducts()', () => {
  it('retorna lista de produtos em destaque', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/products`, () =>
        HttpResponse.json([{ id: '1', name: 'Destaque', is_featured: true }])
      )
    )
    const result = await ProductService.getFeaturedProducts()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThanOrEqual(0)
  })

  it('lança erro em falha de rede', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/products`, () =>
        HttpResponse.json({ code: 'PGRST301', message: 'Error' }, { status: 500 })
      )
    )
    await expect(ProductService.getFeaturedProducts()).rejects.toThrow('Falha ao carregar produtos em destaque')
  })
})

describe('ProductService.getProductBySlug()', () => {
  it('retorna produto para slug válido', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/products`, () =>
        HttpResponse.json({ id: '1', name: 'Tinta', slug: 'tinta' })
      )
    )
    const result = await ProductService.getProductBySlug('tinta')
    expect(result.name).toBe('Tinta')
  })

  it('lança erro para slug não encontrado (PGRST116)', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/products`, () =>
        HttpResponse.json(
          { code: 'PGRST116', details: 'Results contain 0 rows', message: 'Not found' },
          { status: 406 }
        )
      )
    )
    await expect(ProductService.getProductBySlug('inexistente')).rejects.toThrow('Falha ao carregar produto')
  })
})

describe('ProductService.getProductById()', () => {
  it('retorna produto para ID válido', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/products`, () =>
        HttpResponse.json({ id: 'abc-123', name: 'Produto' })
      )
    )
    const result = await ProductService.getProductById('abc-123')
    expect(result.id).toBe('abc-123')
  })

  it('lança erro para ID não encontrado', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/products`, () =>
        HttpResponse.json(
          { code: 'PGRST116', message: 'Not found' },
          { status: 406 }
        )
      )
    )
    await expect(ProductService.getProductById('invalid-id')).rejects.toThrow('Falha ao carregar produto')
  })
})

describe('ProductService.createProduct()', () => {
  it('cria produto sem lançar erro', async () => {
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/products`, () =>
        new HttpResponse(null, { status: 201 })
      )
    )
    const data = {
      subcategory_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Novo Produto',
      slug: 'novo-produto',
      price: 50,
      is_on_sale: false,
      is_featured: false,
      is_promo_month: false,
      is_new: false,
      is_last_units: false,
      is_electric: false,
      is_paint: false,
      is_active: true,
      stock_status: 'em_estoque' as const,
      images: [],
    }
    await expect(ProductService.createProduct(data)).resolves.toBeUndefined()
  })
})

describe('ProductService.updateProduct()', () => {
  it('atualiza produto sem lançar erro', async () => {
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/products`, () =>
        new HttpResponse(null, { status: 200 })
      )
    )
    await expect(ProductService.updateProduct('prod-001', { name: 'Atualizado' })).resolves.toBeUndefined()
  })
})

describe('ProductService.deleteProduct()', () => {
  it('deleta produto sem lançar erro', async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/products`, () =>
        new HttpResponse(null, { status: 200 })
      )
    )
    await expect(ProductService.deleteProduct('prod-001')).resolves.toBeUndefined()
  })
})

describe('ProductService.getPromoProducts()', () => {
  it('retorna lista de produtos em promoção', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/products`, () =>
        HttpResponse.json([{ id: '1', name: 'Promoção', is_on_sale: true }])
      )
    )
    const result = await ProductService.getPromoProducts()
    expect(Array.isArray(result)).toBe(true)
  })

  it('lança erro em falha', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/products`, () =>
        HttpResponse.json({ message: 'Error' }, { status: 500 })
      )
    )
    await expect(ProductService.getPromoProducts()).rejects.toThrow('Falha ao carregar produtos em promoção')
  })
})
