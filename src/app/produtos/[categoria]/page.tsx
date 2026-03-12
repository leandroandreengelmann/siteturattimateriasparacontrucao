import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BreadcrumbNav } from '@/components/catalog/BreadcrumbNav'
import { ProductCard } from '@/components/catalog/ProductCard'
import { CategoryService } from '@/services/category-service'
import { ProductService } from '@/services/product-service'

interface Props {
    params: Promise<{ categoria: string }>
}

export async function generateMetadata({ params }: Props) {
    const { categoria } = await params
    const category = await CategoryService.getCategoryBySlug(categoria)
    if (!category) return {}
    return {
        title: `${category.name} | Turatti`,
        description: `Explore nossa linha de ${category.name.toLowerCase()}.`,
    }
}

export default async function CategoriaPage({ params }: Props) {
    const { categoria } = await params
    const [category, products] = await Promise.all([
        CategoryService.getCategoryBySlug(categoria),
        ProductService.getProductsByCategorySlug(categoria),
    ])

    if (!category || !category.is_active) notFound()

    const activeSubcategories = (category.subcategories || []).filter(s => s.is_active)

    // Group products by subcategory
    const productsBySubcat = new Map<string, any[]>()
    for (const sub of activeSubcategories) {
        const subProducts = (products as any[]).filter((p: any) => p.subcategories?.slug === sub.slug)
        if (subProducts.length > 0) productsBySubcat.set(sub.id, subProducts)
    }

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="pt-[140px] md:pt-[180px]">
                {/* Hero */}
                <div className="catalog-hero">
                    <div className="catalog-hero-inner">
                        <h1 className="catalog-hero-title">{category.name}</h1>
                        <p className="catalog-hero-sub">
                            {products.length} produto{products.length !== 1 ? 's' : ''} disponíve{products.length !== 1 ? 'is' : 'l'}
                        </p>
                    </div>
                </div>

                <div className="catalog-container">
                    <BreadcrumbNav items={[
                        { label: 'Produtos', href: '/produtos' },
                        { label: category.name },
                    ]} />

                    {/* Subcategory tabs */}
                    {activeSubcategories.length > 1 && (
                        <div className="subcat-tabs">
                            {activeSubcategories.map(sub => (
                                <Link
                                    key={sub.id}
                                    href={`/produtos/${categoria}/${sub.slug}`}
                                    className="subcat-tab"
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Sections per subcategory */}
                    {productsBySubcat.size > 0 ? (
                        Array.from(productsBySubcat.entries()).map(([subId, subProducts]) => {
                            const sub = activeSubcategories.find(s => s.id === subId)!
                            return (
                                <section key={subId} className="subcat-section">
                                    <div className="subcat-section-header">
                                        <h2 className="subcat-section-title">{sub.name}</h2>
                                        <Link
                                            href={`/produtos/${categoria}/${sub.slug}`}
                                            className="subcat-section-link"
                                        >
                                            Ver todos →
                                        </Link>
                                    </div>
                                    <div className="catalog-product-grid">
                                        {(subProducts as any[]).slice(0, 6).map((product: any) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                </section>
                            )
                        })
                    ) : (
                        <div className="catalog-empty">
                            <p>Nenhum produto disponível nesta categoria ainda.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            <style>{`
                .catalog-hero {
                    background: linear-gradient(135deg, var(--primary, #2b00ff) 0%, #1a00cc 100%);
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
                .subcat-tabs {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin: 20px 0 32px;
                }
                .subcat-tab {
                    padding: 8px 18px;
                    background: var(--muted, #f3f4f6);
                    border-radius: 9999px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: var(--foreground, #1a1a1a);
                    text-decoration: none;
                    transition: background 0.15s, color 0.15s;
                }
                .subcat-tab:hover { background: var(--primary, #2b00ff); color: white; }
                .subcat-section { margin-bottom: 48px; }
                .subcat-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }
                .subcat-section-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--foreground, #1a1a1a);
                }
                .subcat-section-link {
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: var(--primary, #2b00ff);
                    text-decoration: none;
                }
                .subcat-section-link:hover { text-decoration: underline; }
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
            `}</style>
        </div>
    )
}
