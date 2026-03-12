import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductService } from '@/services/product-service'
import type { Product } from '@/services/product-service'
import { ProductGallery } from '@/components/catalog/ProductGallery'

interface Props {
    params: Promise<{ categoria: string; subcategoria: string; produto: string }>
}

export async function generateMetadata({ params }: Props) {
    const { produto } = await params
    const product = await ProductService.getProductBySlug(produto).catch(() => null) as Product | null
    if (!product) return {}
    return {
        title: `${product.name} | Turatti`,
        description: product.description ?? `Compre ${product.name} com the melhor preço.`,
    }
}

function formatPrice(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const WHATSAPP_NUMBER = '5511999999999' // TODO: update with real number

export default async function ProdutoPage({ params }: Props) {
    const { categoria, subcategoria, produto } = await params
    const product = await ProductService.getProductBySlug(produto).catch(() => null) as Product | null
    if (!product || !product.is_active) notFound()

    const sub = (product as any).subcategories
    const cat = sub?.categories
    const categorySlug = cat?.slug ?? categoria
    const subcategorySlug = sub?.slug ?? subcategoria

    const allImages: string[] = [
        ...(product.image_url ? [product.image_url] : []),
        ...(Array.isArray(product.images) ? product.images : []),
    ]

    const hasDiscount = product.is_on_sale && product.sale_price && product.sale_price < product.price
    const discountPct = hasDiscount
        ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
        : null


    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="pt-[140px] md:pt-[180px]">
                <div className="pd-container">

                    {/* Main layout */}
                    <div className="pd-layout">
                        {/* Gallery */}
                        <ProductGallery images={allImages} productName={product.name} />

                        {/* Info */}
                        <div className="pd-info">
                            {/* Badges */}
                            <div className="pd-badges">
                                {product.is_new && <span className="pd-badge pd-badge-new">Novo</span>}
                                {product.is_promo_month && <span className="pd-badge pd-badge-promo">Promoção do mês</span>}
                                {product.is_last_units && <span className="pd-badge pd-badge-last">Últimas unidades</span>}
                                {product.is_featured && <span className="pd-badge pd-badge-feat">Destaque</span>}
                            </div>

                            <h1 className="pd-name">{product.name}</h1>
                            {product.brand && <p className="pd-brand">Marca: {product.brand}</p>}


                            {/* Price */}
                            {product.price > 0 && (
                                <div className="pd-price-box">
                                    {product.sale_price && product.sale_price < product.price ? (
                                        <>
                                            <div className="pd-price-row">
                                                <span className="pd-old-price">
                                                    {formatPrice(product.price)}
                                                </span>
                                                <span className="pd-discount-tag">
                                                    -{discountPct}%
                                                </span>
                                            </div>
                                            <p className="pd-price">{formatPrice(product.sale_price)}</p>
                                        </>
                                    ) : (
                                        <p className="pd-price">{formatPrice(product.price)}</p>
                                    )}
                                </div>
                            )}

                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá,%20tenho%20interesse%20no%20produto:%20${product.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="specialist-cta mt-3"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span>Falar com um Vendedor</span>
                                <ArrowRight className="w-5 h-5" />
                            </a>

                            {/* Paint specific */}
                            {product.is_paint && (
                                <div className="pd-specs">
                                    {product.paint_color && (
                                        <div className="pd-spec-item">
                                            <span className="pd-spec-label">Cor</span>
                                            <div className="pd-spec-value-row">
                                                {product.paint_color_hex && (
                                                    <span className="pd-color-dot" style={{ backgroundColor: product.paint_color_hex }} />
                                                )}
                                                <span className="pd-spec-value">{product.paint_color}</span>
                                            </div>
                                        </div>
                                    )}
                                    {product.paint_volume && (
                                        <div className="pd-spec-item">
                                            <span className="pd-spec-label">Volume</span>
                                            <span className="pd-spec-value">{product.paint_volume}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Electric specific */}
                            {product.is_electric && product.voltage && (
                                <div className="pd-specs">
                                    <div className="pd-spec-item">
                                        <span className="pd-spec-label">Voltagem</span>
                                        <span className="pd-spec-value">{product.voltage}</span>
                                    </div>
                                </div>
                            )}


                        </div>
                    </div>

                </div>
            </main>
            <Footer />


            <style>{`
                .pd-container { 
                    max-width: 1200px; 
                    margin: 0 auto; 
                    padding: 0 16px 80px;
                    width: 100%;
                    box-sizing: border-box;
                }
                .pd-layout {
                    display: flex;
                    gap: 32px;
                    flex-direction: column;
                    margin-top: 16px;
                    width: 100%;
                }
                @media (min-width: 768px) { 
                    .pd-layout { 
                        flex-direction: row; 
                        align-items: flex-start;
                        gap: 48px;
                    } 
                }

                /* Gallery - Handled in ProductGallery component */

                /* Info */
                .pd-info { flex: 1; min-width: 0; }
                .pd-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
                .pd-badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.62rem;
                    font-weight: 800;
                    letter-spacing: 0.07em;
                }
                .pd-badge-new { background: #2b00ff; color: white; }
                .pd-badge-promo { background: #e11d48; color: white; }
                .pd-badge-last { background: #d97706; color: white; }
                .pd-badge-feat { background: #7c3aed; color: white; }
                .pd-name {
                    font-size: 20px;
                    font-weight: 500;
                    color: var(--foreground);
                    margin-bottom: 8px;
                    line-height: 1.3;
                }
                .pd-brand {
                    font-size: 16px;
                    color: #666;
                    margin-bottom: 24px;
                }
                .pd-stock { font-size: 0.8rem; font-weight: 700; margin: 0 0 16px; }
                .pd-price-box { margin-bottom: 24px; }
                .pd-price-row { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
                .pd-old-price {
                    font-size: 1.4rem;
                    color: #999;
                    text-decoration: line-through;
                }
                .pd-discount-tag {
                    background: #dcfce7;
                    color: #166534;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 1.1rem;
                    font-weight: 800;
                }
                .pd-price {
                    font-size: 3.2rem;
                    font-weight: 900;
                    color: var(--foreground);
                    line-height: 1;
                    margin: 0;
                }
                .pd-cta-placeholder { display: none; }
                .pd-specs { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
                .pd-spec-item { display: flex; flex-direction: column; gap: 2px; }
                .pd-spec-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    color: var(--muted-foreground, #888);
                }
                .pd-spec-value-row { display: flex; align-items: center; gap: 6px; }
                .pd-spec-value { font-size: 0.88rem; font-weight: 600; color: var(--foreground, #1a1a1a); }
                .pd-color-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.1); flex-shrink: 0; }
                .pd-description {
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: var(--muted-foreground, #444);
                    margin-bottom: 32px;
                }
                .richtext p { margin-bottom: 1em; }
                .richtext strong { color: var(--foreground, #000); font-weight: 700; }
                .richtext ul, .richtext ol { margin: 1em 0; padding-left: 1.5em; }
                .richtext li { margin-bottom: 0.5em; }
                .richtext img { max-width: 100%; height: auto; border-radius: 8px; }
                .pd-cta-disabled { background: #ccc; cursor: not-allowed; pointer-events: none; }
            `}</style>
        </div>
    )
}
