'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/services/product-service'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
    product: Product & {
        subcategories?: { slug: string; categories?: { slug: string } | null } | null
    }
}

function formatPrice(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function getProductHref(product: ProductCardProps['product']) {
    const catSlug = product.subcategories?.categories?.slug
    const subSlug = product.subcategories?.slug
    if (catSlug && subSlug) return `/produtos/${catSlug}/${subSlug}/${product.slug}`
    return `/produtos`
}

export function ProductCard({ product }: ProductCardProps) {
    const href = getProductHref(product)
    const hasDiscount = product.is_on_sale && product.sale_price && product.sale_price < product.price
    const discountPct = hasDiscount
        ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
        : null

    return (
        <Link href={href} className="group block h-full">
            <Card className="h-full overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                        src={product.image_url || '/logo.png'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            e.currentTarget.src = '/logo.png'
                            e.currentTarget.className = "w-1/2 h-1/2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain opacity-20 transition-transform duration-500 group-hover:scale-110"
                        }}
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {product.is_new && <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border-none font-bold">Novo</Badge>}
                        {product.is_promo_month && <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border-none font-bold">Promoção</Badge>}
                        {product.is_last_units && <Badge className="bg-amber-600 hover:bg-amber-700 text-white border-none font-bold">Últimas unidades</Badge>}
                        {discountPct && <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border-none font-bold">-{discountPct}%</Badge>}
                    </div>
                </div>

                {/* Info */}
                <CardContent className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>

                    {product.brand && (
                        <p className="text-xs font-medium text-muted-foreground">
                            {product.brand}
                        </p>
                    )}

                    {product.price > 0 && (
                        <div className="mt-auto pt-2 flex items-center gap-2 flex-wrap">
                            {hasDiscount ? (
                                <>
                                    <span className="text-xs text-muted-foreground line-through">
                                        {formatPrice(product.price)}
                                    </span>
                                    <span className="text-base font-bold text-primary">
                                        {formatPrice(product.sale_price!)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-base font-bold text-foreground">
                                    {formatPrice(product.price)}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Stock */}
                    {product.stock_status === 'esgotado' && (
                        <Badge variant="outline" className="mt-1 w-fit bg-destructive/10 text-destructive border-transparent">
                            Esgotado
                        </Badge>
                    )}
                    {product.stock_status === 'sob_encomenda' && (
                        <Badge variant="outline" className="mt-1 w-fit bg-amber-100 text-amber-800 border-transparent">
                            Sob encomenda
                        </Badge>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}
