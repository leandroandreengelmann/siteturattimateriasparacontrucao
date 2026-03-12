import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BreadcrumbNav } from '@/components/catalog/BreadcrumbNav'
import { ProductCard } from '@/components/catalog/ProductCard'
import { CategoryService } from '@/services/category-service'
import { ProductService } from '@/services/product-service'

interface Props {
    params: Promise<{ categoria: string; subcategoria: string }>
}

export async function generateMetadata({ params }: Props) {
    const { subcategoria } = await params
    const subcategory = await CategoryService.getSubcategoryBySlug(subcategoria) as { id: string; name: string; slug: string; is_active?: boolean } | null
    if (!subcategory) return {}
    return {
        title: `${subcategory.name} | Turatti`,
        description: `Produtos da linha ${subcategory.name.toLowerCase()}.`,
    }
}

export default async function SubcategoriaPage({ params }: Props) {
    const { categoria, subcategoria } = await params
    const [subcategory, category, products] = await Promise.all([
        CategoryService.getSubcategoryBySlug(subcategoria) as Promise<{ id: string; name: string; slug: string; is_active?: boolean } | null>,
        CategoryService.getCategoryBySlug(categoria) as Promise<{ id: string; name: string; slug: string; is_active?: boolean } | null>,
        ProductService.getProductsBySubcategorySlug(subcategoria),
    ])

    if (!subcategory || !category) notFound()

    const activeProducts = (products as any[]).filter(p => p.is_active)

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="pt-[140px] md:pt-[180px]">
                <div className="catalog-hero">
                    <div className="catalog-hero-inner">
                        <h1 className="catalog-hero-title">{subcategory.name}</h1>
                        <p className="catalog-hero-sub">
                            {activeProducts.length} produto{activeProducts.length !== 1 ? 's' : ''} disponíve{activeProducts.length !== 1 ? 'is' : 'l'}
                        </p>
                    </div>
                </div>

                <div className="catalog-container">
                    <BreadcrumbNav items={[
                        { label: 'Produtos', href: '/produtos' },
                        { label: category.name, href: `/produtos/${categoria}` },
                        { label: subcategory.name },
                    ]} />

                    {activeProducts.length > 0 ? (
                        <div className="catalog-product-grid" style={{ marginTop: '16px' }}>
                            {activeProducts.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="catalog-empty">
                            <p>Nenhum produto disponível nesta subcategoria ainda.</p>
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
