'use client'

import React from 'react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { ProductCard } from './ProductCard'
import { motion, Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Autoplay from "embla-carousel-autoplay"
import { CircularCountdown } from '@/components/ui/circular-countdown'

interface ProductCarouselProps {
    title: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products: Record<string, any>[]
    viewAllHref?: string
    className?: string
    hasTimer?: boolean
    timerTargetDate?: string | null
    hasQuantity?: boolean
    quantityCount?: number | null
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: "easeOut"
        }
    }
}

export function ProductCarousel({
    title,
    products,
    viewAllHref,
    className,
    hasTimer = false,
    timerTargetDate = null,
    hasQuantity = false,
    quantityCount = null
}: ProductCarouselProps) {
    // Autoplay configuration with hover pause
    const autoplay = React.useMemo(() => Autoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: true
    }), [])

    if (!products || products.length === 0) return null

    return (
        <section className={cn("py-20 bg-muted/50", className)}>
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-4 max-w-2xl text-left w-full">
                        <motion.h2
                            initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="text-4xl md:text-5xl font-black tracking-tight text-foreground"
                        >
                            {title}
                        </motion.h2>

                        {/* Counters Row - Clean Premium Style */}
                        {(hasTimer || hasQuantity) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                                className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-stretch gap-4 mt-6"
                            >
                                {hasTimer && timerTargetDate && (
                                    <CircularCountdown targetDate={timerTargetDate} />
                                )}

                                {hasQuantity && quantityCount !== null && quantityCount > 0 && (
                                    <div className="flex flex-col justify-center py-4 min-w-[220px]">
                                        <div className="flex items-center mb-1">
                                            <span className={`text-xs font-black tracking-[0.15em] ${quantityCount <= 5 ? 'text-destructive' : quantityCount <= 15 ? 'text-amber-500' : 'text-primary'}`}>
                                                {quantityCount <= 5 ? '⚠ Quase Esgotado!' : quantityCount <= 15 ? 'Poucas Unidades' : 'Estoque Limitado'}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className={`text-4xl md:text-5xl font-black tracking-tight leading-none ${quantityCount <= 5 ? 'text-destructive' : quantityCount <= 15 ? 'text-amber-500' : 'text-primary'}`}>
                                                {quantityCount}
                                            </span>
                                            <span className="text-xs md:text-sm font-bold text-muted-foreground">Unidades restantes</span>
                                        </div>
                                        {/* Barra de urgência */}
                                        <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${quantityCount <= 5 ? 'bg-destructive' : quantityCount <= 15 ? 'bg-amber-500' : 'bg-primary'}`}
                                                style={{ width: `${Math.min(100, (quantityCount / 30) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {viewAllHref && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                href={viewAllHref}
                                className="group flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                            >
                                Ver tudo
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </motion.div>
                    )}
                </div>

                {/* Carousel */}
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    plugins={[autoplay]}
                    className="w-full group/carousel"
                >
                    <CarouselContent
                        className="-ml-4 md:-ml-6"
                        viewportClassName="overflow-hidden"
                    >
                        {products.map((product, index) => (
                            <CarouselItem key={product.id} className="pl-4 md:pl-6 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                <motion.div
                                    variants={itemVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <div className="flex items-center justify-center gap-6 mt-12 md:hidden">
                        <CarouselPrevious className="static translate-y-0 size-12 [&_svg]:size-6" />
                        <CarouselNext className="static translate-y-0 size-12 [&_svg]:size-6" />
                    </div>

                    <div className="hidden md:block">
                        <CarouselPrevious className="-left-16 size-14 [&_svg]:size-7 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110" />
                        <CarouselNext className="-right-16 size-14 [&_svg]:size-7 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110" />
                    </div>
                </Carousel>
            </div>
        </section>
    )
}
