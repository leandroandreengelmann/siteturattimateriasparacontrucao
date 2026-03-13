import { describe, it, expect } from 'vitest'
import { createCategorySchema, createSubCategorySchema } from '@/services/category-service'

describe('createCategorySchema', () => {
  it('aceita dados válidos', () => {
    const result = createCategorySchema.safeParse({ name: 'Tintas', slug: 'tintas' })
    expect(result.success).toBe(true)
  })

  it('rejeita name vazio', () => {
    const result = createCategorySchema.safeParse({ name: '', slug: 'tintas' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map(i => i.path[0])
      expect(fields).toContain('name')
    }
  })

  it('rejeita slug vazio', () => {
    const result = createCategorySchema.safeParse({ name: 'Tintas', slug: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map(i => i.path[0])
      expect(fields).toContain('slug')
    }
  })

  it('aceita is_active opcional', () => {
    const result = createCategorySchema.safeParse({ name: 'Tintas', slug: 'tintas', is_active: true })
    expect(result.success).toBe(true)
  })

  it('aceita sem is_active (campo opcional)', () => {
    const result = createCategorySchema.safeParse({ name: 'Tintas', slug: 'tintas' })
    expect(result.success).toBe(true)
  })
})

describe('createSubCategorySchema', () => {
  const validSub = {
    category_id: 'cat-123',
    name: 'Tintas Imobiliárias',
    slug: 'tintas-imobiliarias',
    href: '/produtos/tintas/tintas-imobiliarias',
  }

  it('aceita dados válidos', () => {
    const result = createSubCategorySchema.safeParse(validSub)
    expect(result.success).toBe(true)
  })

  it('rejeita sem category_id', () => {
    const { category_id: _, ...withoutCatId } = validSub
    const result = createSubCategorySchema.safeParse(withoutCatId)
    expect(result.success).toBe(false)
  })

  it('rejeita name vazio', () => {
    const result = createSubCategorySchema.safeParse({ ...validSub, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map(i => i.path[0])
      expect(fields).toContain('name')
    }
  })

  it('rejeita slug vazio', () => {
    const result = createSubCategorySchema.safeParse({ ...validSub, slug: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map(i => i.path[0])
      expect(fields).toContain('slug')
    }
  })

  it('rejeita href vazio', () => {
    const result = createSubCategorySchema.safeParse({ ...validSub, href: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map(i => i.path[0])
      expect(fields).toContain('href')
    }
  })

  it('aceita is_active opcional', () => {
    const result = createSubCategorySchema.safeParse({ ...validSub, is_active: false })
    expect(result.success).toBe(true)
  })
})
