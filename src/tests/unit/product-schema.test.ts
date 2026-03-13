import { describe, it, expect } from 'vitest'
import { createProductSchema } from '@/services/product-service'

const validProduct = {
  subcategory_id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Tinta Branca Premium',
  slug: 'tinta-branca-premium',
  price: 89.90,
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

describe('createProductSchema', () => {
  it('aceita produto válido completo', () => {
    const result = createProductSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
  })

  it('rejeita name vazio', () => {
    const result = createProductSchema.safeParse({ ...validProduct, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map(i => i.path[0])
      expect(fields).toContain('name')
    }
  })

  it('rejeita slug vazio', () => {
    const result = createProductSchema.safeParse({ ...validProduct, slug: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map(i => i.path[0])
      expect(fields).toContain('slug')
    }
  })

  it('rejeita preço negativo', () => {
    const result = createProductSchema.safeParse({ ...validProduct, price: -10 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map(i => i.path[0])
      expect(fields).toContain('price')
    }
  })

  it('rejeita sale_price maior que price quando is_on_sale=true', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      is_on_sale: true,
      price: 100,
      sale_price: 150,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map(i => i.path[0])
      expect(fields).toContain('sale_price')
    }
  })

  it('aceita sale_price maior que price quando is_on_sale=false', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      is_on_sale: false,
      price: 100,
      sale_price: 150,
    })
    expect(result.success).toBe(true)
  })

  it('aceita sale_price igual ao price quando is_on_sale=true', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      is_on_sale: true,
      price: 100,
      sale_price: 100,
    })
    expect(result.success).toBe(true)
  })

  it('aceita sale_price menor que price quando is_on_sale=true', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      is_on_sale: true,
      price: 100,
      sale_price: 79.90,
    })
    expect(result.success).toBe(true)
  })

  it('aceita sale_price null com is_on_sale=true', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      is_on_sale: true,
      price: 100,
      sale_price: null,
    })
    expect(result.success).toBe(true)
  })

  it('aceita stock_status "em_estoque"', () => {
    const result = createProductSchema.safeParse({ ...validProduct, stock_status: 'em_estoque' })
    expect(result.success).toBe(true)
  })

  it('aceita stock_status "sob_encomenda"', () => {
    const result = createProductSchema.safeParse({ ...validProduct, stock_status: 'sob_encomenda' })
    expect(result.success).toBe(true)
  })

  it('aceita stock_status "esgotado"', () => {
    const result = createProductSchema.safeParse({ ...validProduct, stock_status: 'esgotado' })
    expect(result.success).toBe(true)
  })

  it('rejeita stock_status inválido', () => {
    const result = createProductSchema.safeParse({ ...validProduct, stock_status: 'disponivel' })
    expect(result.success).toBe(false)
  })

  it('usa [] como default para images quando ausente', () => {
    const { images: _, ...withoutImages } = validProduct
    const result = createProductSchema.safeParse(withoutImages)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.images).toEqual([])
    }
  })

  it('aceita campos opcionais como null', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      description: null,
      brand: null,
      voltage: null,
      paint_color: null,
      paint_color_hex: null,
      paint_volume: null,
      unit: null,
      image_url: null,
    })
    expect(result.success).toBe(true)
  })

  it('aceita array de imagens válido', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.images).toHaveLength(2)
    }
  })
})
