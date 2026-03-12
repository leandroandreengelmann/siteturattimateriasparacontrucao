import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/catalog/ProductCard'
import { ProductService } from '@/services/product-service'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Promoções | Turatti',
    description: 'Aproveite as melhores promoções em materiais para construção e acabamento da Turatti.',
}

export default async function PromocoesPage() {
    const products = await ProductService.getPromoProducts()

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="pt-[140px] md:pt-[180px]">
                {/* Hero */}
                <div className="promo-hero">
                    <div className="promo-hero-inner">
                        <h1 className="promo-hero-title">Promoções</h1>
                        <p className="promo-hero-sub">
                            {products.length} {products.length === 1 ? 'produto em promoção' : 'produtos em promoção'}
                        </p>
                    </div>
                </div>

                <div className="catalog-container">
                    {products.length > 0 ? (
                        <div className="catalog-product-grid" style={{ marginTop: '24px' }}>
                            {products.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="catalog-empty">
                            <p className="catalog-empty-title">Nenhuma promoção ativa no momento.</p>
                            <p className="catalog-empty-sub">Volte em breve para conferir nossas ofertas!</p>
                            <Link href="/produtos" className="catalog-empty-link">
                                Ver todos os produtos
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            <style>{`
                .promo-hero {
                    background: #2b00ff;
                    padding: 48px 24px 40px;
                }
                .promo-hero-inner { max-width: 1200px; margin: 0 auto; }
.promo-hero-title {
                    font-size: clamp(1.8rem, 4vw, 2.8rem);
                    font-weight: 900;
                    color: white;
                    margin: 0 0 6px;
                }
                .promo-hero-sub { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin: 0; }

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
                .catalog-empty-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--foreground);
                    margin: 0 0 8px;
                }
                .catalog-empty-sub {
                    font-size: 0.9rem;
                    margin: 0 0 20px;
                }
                .catalog-empty-link {
                    display: inline-block;
                    padding: 10px 24px;
                    background: var(--color-primary);
                    color: var(--color-primary-foreground);
                    border-radius: 9999px;
                    text-decoration: none;
                    font-size: 0.88rem;
                    font-weight: 700;
                    transition: opacity 0.15s;
                }
                .catalog-empty-link:hover { opacity: 0.85; }
            `}</style>
        </div>
    )
}
