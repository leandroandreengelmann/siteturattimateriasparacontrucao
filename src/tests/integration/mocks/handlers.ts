import { http, HttpResponse } from 'msw'

const SUPABASE_URL = 'https://test.supabase.co'

// Produto de exemplo para reuso nos handlers
export const mockProduct = {
  id: 'prod-001',
  subcategory_id: 'sub-001',
  name: 'Tinta Branca Premium',
  slug: 'tinta-branca-premium',
  description: 'Tinta de alta qualidade',
  price: 89.90,
  sale_price: null,
  is_on_sale: false,
  is_featured: true,
  is_promo_month: false,
  is_new: false,
  is_last_units: false,
  brand: 'Suvinil',
  is_electric: false,
  voltage: null,
  is_paint: true,
  paint_color: 'Branco',
  paint_color_hex: '#FFFFFF',
  paint_volume: '18L',
  unit: null,
  stock_status: 'em_estoque',
  image_url: 'https://example.com/img.jpg',
  images: [],
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  subcategories: {
    id: 'sub-001',
    name: 'Tintas Imobiliárias',
    slug: 'tintas-imobiliarias',
    categories: { id: 'cat-001', name: 'Tintas', slug: 'tintas' },
  },
}

export const mockCategory = {
  id: 'cat-001',
  name: 'Tintas',
  slug: 'tintas',
  is_active: true,
  subcategories: [
    { id: 'sub-001', category_id: 'cat-001', name: 'Tintas Imobiliárias', slug: 'tintas-imobiliarias', href: '/produtos/tintas/tintas-imobiliarias', is_active: true },
  ],
}

export const handlers = [
  // GET /products (getAllProducts, getFeaturedProducts, getPromoProducts)
  http.get(`${SUPABASE_URL}/rest/v1/products`, ({ request }) => {
    const url = new URL(request.url)
    const orParam = url.searchParams.get('or')
    const ilike = url.searchParams.get('name')

    // searchProducts (ilike filter)
    if (ilike) {
      return HttpResponse.json([mockProduct])
    }

    // getFeaturedProducts / getPromoProducts (or filter)
    if (orParam) {
      return HttpResponse.json([mockProduct])
    }

    // getAllProducts
    return HttpResponse.json([mockProduct])
  }),

  // GET /products?slug=eq.{slug} (getProductBySlug)
  http.get(`${SUPABASE_URL}/rest/v1/products`, ({ request }) => {
    const url = new URL(request.url)
    const slug = url.searchParams.get('slug')
    if (slug?.startsWith('eq.')) {
      return HttpResponse.json(mockProduct)
    }
    return HttpResponse.json([mockProduct])
  }),

  // POST /products (createProduct, duplicateProduct)
  http.post(`${SUPABASE_URL}/rest/v1/products`, () => {
    return new HttpResponse(null, { status: 201 })
  }),

  // PATCH /products (updateProduct)
  http.patch(`${SUPABASE_URL}/rest/v1/products`, () => {
    return new HttpResponse(null, { status: 200 })
  }),

  // DELETE /products (deleteProduct)
  http.delete(`${SUPABASE_URL}/rest/v1/products`, () => {
    return new HttpResponse(null, { status: 200 })
  }),

  // GET /categories
  http.get(`${SUPABASE_URL}/rest/v1/categories`, ({ request }) => {
    const url = new URL(request.url)
    const slug = url.searchParams.get('slug')
    if (slug?.startsWith('eq.')) {
      return HttpResponse.json(mockCategory)
    }
    return HttpResponse.json([mockCategory])
  }),

  // POST /categories
  http.post(`${SUPABASE_URL}/rest/v1/categories`, () => {
    return new HttpResponse(null, { status: 201 })
  }),

  // PATCH /categories
  http.patch(`${SUPABASE_URL}/rest/v1/categories`, () => {
    return new HttpResponse(null, { status: 200 })
  }),

  // DELETE /categories
  http.delete(`${SUPABASE_URL}/rest/v1/categories`, () => {
    return new HttpResponse(null, { status: 200 })
  }),

  // GET /subcategories
  http.get(`${SUPABASE_URL}/rest/v1/subcategories`, () => {
    return HttpResponse.json([
      { ...mockCategory.subcategories[0], categories: { name: 'Tintas' } },
    ])
  }),

  // POST /subcategories
  http.post(`${SUPABASE_URL}/rest/v1/subcategories`, () => {
    return new HttpResponse(null, { status: 201 })
  }),

  // Auth
  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({ id: 'user-001', email: 'admin@test.com' })
  }),
]
