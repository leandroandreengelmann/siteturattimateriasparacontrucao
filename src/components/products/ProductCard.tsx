'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

interface ProductCardProps {
    product: any // Using any for now to match the complex join structure
    className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
    const isOnSale = product.is_on_sale && product.sale_price
    const discount = isOnSale
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value)
    }

    const getProductHref = () => {
        const catSlug = product.subcategories?.categories?.slug
        const subSlug = product.subcategories?.slug
        if (catSlug && subSlug) return `/produtos/${catSlug}/${subSlug}/${product.slug}`
        return `/produtos`
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={cn("group h-full", className)}
        >
            <Card className="relative h-full flex flex-col overflow-hidden bg-white/50 backdrop-blur-sm border-primary/20 transition-all duration-500 hover:border-primary/40 hover:-translate-y-1">
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {isOnSale && (
                        <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-black border-none px-3 py-1">
                            -{discount}%
                        </Badge>
                    )}
                    {product.is_new && (
                        <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold border-none">
                            Novo
                        </Badge>
                    )}
                    {product.is_promo_month && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold border-none">
                            Promoção do mês
                        </Badge>
                    )}
                </div>


                <Link href={getProductHref()} className="block relative flex items-center justify-center aspect-square overflow-hidden bg-muted rounded-t-xl">
                    <img
                        src={product.image_url || '/logo.png'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            e.currentTarget.src = '/logo.png'
                            e.currentTarget.className = "w-1/2 h-1/2 object-contain opacity-20 transition-transform duration-700 group-hover:scale-110"
                        }}
                    />
                </Link>

                <CardContent className="p-5 flex flex-col gap-3 flex-1 relative">
                    {/* Button Section - Now above the title and visible on hover */}
                    <div className="h-10 relative overflow-hidden flex justify-center">
                        <Link
                            href={getProductHref()}
                            className={cn(
                                buttonVariants({ variant: "default" }),
                                "w-1/2 h-full sm:opacity-0 sm:translate-y-full group-hover:opacity-100 group-hover:translate-y-0 text-xs font-bold tracking-widest transition-all duration-500 ease-out shadow-lg"
                            )}
                        >
                            Ver produto
                        </Link>
                    </div>

                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {product.name}
                    </h3>

                    <div className="mt-auto pt-2 border-t border-primary/5">
                        <div className="flex flex-row items-baseline gap-2 flex-wrap">
                            {isOnSale ? (
                                <>
                                    <span className="text-2xl font-black text-primary leading-none">
                                        {formatCurrency(product.sale_price)}
                                    </span>
                                    <span className="text-sm text-muted-foreground line-through decoration-red-400/50 leading-none">
                                        {formatCurrency(product.price)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-2xl font-black text-primary leading-none">
                                    {formatCurrency(product.price)}
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
