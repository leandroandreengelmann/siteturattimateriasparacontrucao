import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BreadcrumbNav } from '@/components/catalog/BreadcrumbNav'
import { ProductCard } from '@/components/catalog/ProductCard'
import { CategoryService } from '@/services/category-service'
import { ProductService } from '@/services/product-service'
import Link from 'next/link'

interface SearchParams {
    filter?: string
    categoria?: string
}

type SearchParamsPromise = Promise<SearchParams>

export const metadata: Metadata = {
    title: 'Produtos | Turatti',
    description: 'Explore nosso catálogo completo de produtos para pintura e acabamento.',
}

export default async function ProdutosPage({ searchParams }: { searchParams: SearchParamsPromise }) {
    const { filter, categoria: catFilter } = await searchParams
    const [categories, products] = await Promise.all([
        CategoryService.getAllCategories(),
        ProductService.getAllProducts(),
    ])

    const activeCategories = categories.filter(c => c.is_active)

    // Apply filter
    let filteredProducts = (products as any[]).filter(p => p.is_active)
    if (filter === 'new') filteredProducts = filteredProducts.filter(p => p.is_new)
    else if (filter === 'featured') filteredProducts = filteredProducts.filter(p => p.is_featured)
    else if (filter === 'promo') filteredProducts = filteredProducts.filter(p => p.is_promo_month || p.is_on_sale)
    else if (filter === 'last') filteredProducts = filteredProducts.filter(p => p.is_last_units)

    if (catFilter) {
        filteredProducts = filteredProducts.filter((p: any) =>
            p.subcategories?.categories?.slug === catFilter
        )
    }

    const filterOptions = [
        { key: undefined, label: 'Todos' },
        { key: 'featured', label: 'Destaques' },
        { key: 'new', label: 'Novidades' },
        { key: 'promo', label: 'Promoções' },
        { key: 'last', label: 'Últimas Unidades' },
    ]

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="pt-[140px] md:pt-[180px]">
                {/* Hero */}
                <div className="catalog-hero">
                    <div className="catalog-hero-inner">
                        <h1 className="catalog-hero-title">Nossos produtos</h1>
                        <p className="catalog-hero-sub">
                            {filteredProducts.length} produtos encontrados
                        </p>
                    </div>
                </div>

                <div className="catalog-container">
                    <BreadcrumbNav items={[{ label: 'Produtos' }]} />

                    {/* Mobile filter bar — only visible below md */}
                    <div className="catalog-mobile-filters">
                        <div className="catalog-mobile-filters-scroll">
                            {filterOptions.map(opt => {
                                const url = opt.key ? `/produtos?filter=${opt.key}${catFilter ? `&categoria=${catFilter}` : ''}` : `/produtos${catFilter ? `?categoria=${catFilter}` : ''}`
                                const isActive = filter === opt.key || (!filter && !opt.key)
                                return (
                                    <Link
                                        key={opt.key ?? 'all'}
                                        href={url}
                                        className={`catalog-mobile-chip ${isActive ? 'catalog-mobile-chip-active' : ''}`}
                                    >
                                        {opt.label}
                                    </Link>
                                )
                            })}
                            <span className="catalog-mobile-divider" />
                            {activeCategories.map(cat => {
                                const url = `/produtos/${cat.slug}`
                                return (
                                    <Link
                                        key={cat.id}
                                        href={url}
                                        className={`catalog-mobile-chip ${catFilter === cat.slug ? 'catalog-mobile-chip-active' : ''}`}
                                    >
                                        {cat.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    <div className="catalog-layout">
                        {/* Sidebar */}
                        <aside className="catalog-sidebar">
                            <div className="catalog-sidebar-section">
                                <h3 className="catalog-sidebar-title">Filtrar</h3>
                                <div className="catalog-filter-list">
                                    {filterOptions.map(opt => {
                                        const url = opt.key ? `/produtos?filter=${opt.key}${catFilter ? `&categoria=${catFilter}` : ''}` : `/produtos${catFilter ? `?categoria=${catFilter}` : ''}`
                                        const isActive = filter === opt.key || (!filter && !opt.key)
                                        return (
                                            <Link
                                                key={opt.key ?? 'all'}
                                                href={url}
                                                className={`catalog-filter-item ${isActive ? 'catalog-filter-item-active' : ''}`}
                                            >
                                                {opt.label}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="catalog-sidebar-section">
                                <h3 className="catalog-sidebar-title">Categorias</h3>
                                <div className="catalog-filter-list">
                                    <Link
                                        href={filter ? `/produtos?filter=${filter}` : '/produtos'}
                                        className={`catalog-filter-item ${!catFilter ? 'catalog-filter-item-active' : ''}`}
                                    >
                                        Todas
                                    </Link>
                                    {activeCategories.map(cat => {
                                        const url = `/produtos/${cat.slug}`
                                        return (
                                            <Link
                                                key={cat.id}
                                                href={url}
                                                className={`catalog-filter-item ${catFilter === cat.slug ? 'catalog-filter-item-active' : ''}`}
                                            >
                                                {cat.name}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        </aside>

                        {/* Product Grid */}
                        <section className="catalog-grid-area">
                            {filteredProducts.length > 0 ? (
                                <div className="catalog-product-grid">
                                    {filteredProducts.map((product: any) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="catalog-empty">
                                    <p>Nenhum produto encontrado para este filtro.</p>
                                    <Link href="/produtos" className="catalog-empty-link">Ver todos os produtos</Link>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
            <Footer />

            <style>{`
                .catalog-hero {
                    background: var(--primary, #2b00ff);
                    padding: 48px 24px 40px;
                }
                .catalog-hero-inner { max-width: 1200px; margin: 0 auto; }
                .catalog-hero-title {
                    font-size: clamp(1.8rem, 4vw, 2.8rem);
                    font-weight: 900;
                    color: white;
                    margin: 0 0 6px;
                }
                .catalog-hero-sub { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin: 0; }
                .catalog-container { max-width: 1200px; margin: 0 auto; padding: 0 16px 64px; }
                .catalog-layout { display: flex; gap: 32px; margin-top: 16px; }
                .catalog-sidebar { width: 220px; flex-shrink: 0; display: none; }
                @media (min-width: 768px) { .catalog-sidebar { display: block; } }
                .catalog-sidebar-section { margin-bottom: 28px; }
                .catalog-sidebar-title {
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    color: var(--muted-foreground, #888);
                    margin-bottom: 10px;
                }
                .catalog-filter-list { display: flex; flex-direction: column; gap: 2px; }
                .catalog-filter-item {
                    display: block;
                    padding: 7px 12px;
                    border-radius: 8px;
                    font-size: 0.84rem;
                    font-weight: 500;
                    color: var(--muted-foreground, #555);
                    text-decoration: none;
                    transition: background 0.15s, color 0.15s;
                }
                .catalog-filter-item:hover { background: var(--muted, #f5f5f5); color: var(--foreground, #1a1a1a); }
                .catalog-filter-item-active {
                    background: var(--primary, #2b00ff);
                    color: white !important;
                    font-weight: 700;
                }
                .catalog-grid-area { flex: 1; min-width: 0; }
                .catalog-product-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                @media (min-width: 640px) { .catalog-product-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (min-width: 1024px) { .catalog-product-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; } }
                .catalog-empty {
                    text-align: center;
                    padding: 80px 24px;
                    color: var(--muted-foreground, #888);
                }
                .catalog-empty-link {
                    display: inline-block;
                    margin-top: 12px;
                    padding: 10px 20px;
                    background: var(--color-primary);
                    color: var(--color-primary-foreground);
                    border-radius: 10px;
                    text-decoration: none;
                    font-size: 0.88rem;
                    font-weight: 700;
                }
                /* Mobile filter chips */
                .catalog-mobile-filters {
                    display: block;
                    margin-top: 12px;
                    margin-bottom: 4px;
                }
                @media (min-width: 768px) { .catalog-mobile-filters { display: none; } }
                .catalog-mobile-filters-scroll {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding: 4px 0 10px;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                }
                .catalog-mobile-filters-scroll::-webkit-scrollbar { display: none; }
                .catalog-mobile-chip {
                    display: inline-flex;
                    align-items: center;
                    padding: 7px 14px;
                    border-radius: 9999px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    white-space: nowrap;
                    flex-shrink: 0;
                    text-decoration: none;
                    border: 1.5px solid var(--color-border);
                    color: var(--color-muted-foreground);
                    background: var(--color-background);
                    transition: all 0.15s;
                }
                .catalog-mobile-chip:active { transform: scale(0.96); }
                .catalog-mobile-chip-active {
                    background: var(--color-primary);
                    color: var(--color-primary-foreground);
                    border-color: var(--color-primary);
                    font-weight: 700;
                }
                .catalog-mobile-divider {
                    display: inline-block;
                    width: 1px;
                    height: 24px;
                    background: var(--color-border);
                    flex-shrink: 0;
                    align-self: center;
                    margin: 0 4px;
                }
            `}</style>
        </div>
    )
}
