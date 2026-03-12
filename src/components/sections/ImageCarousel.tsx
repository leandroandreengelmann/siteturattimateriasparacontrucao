'use client'

import React from 'react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import type { UseEmblaCarouselType } from "embla-carousel-react"
import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Autoplay from "embla-carousel-autoplay"
import { HomeImageCarousel } from '@/services/image-carousel-service'

type CarouselApi = UseEmblaCarouselType[1]

interface ImageCarouselProps {
    images: HomeImageCarousel[]
    className?: string
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

export function ImageCarousel({
    images,
    className
}: ImageCarouselProps) {
    const autoplay = React.useMemo(() => Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true
    }), [])

    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)

    React.useEffect(() => {
        if (!api) return
        setCurrent(api.selectedScrollSnap())
        api.on("select", () => setCurrent(api.selectedScrollSnap()))
    }, [api])

    if (!images || images.length === 0) return null

    return (
        <section className={cn("py-6 bg-muted/50", className)}>
            <div className="container mx-auto px-6">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    plugins={[autoplay]}
                    setApi={setApi}
                    className="w-full group/carousel"
                >
                    <CarouselContent
                        className="-ml-4 md:-ml-6"
                        viewportClassName="overflow-hidden"
                    >
                        {images.map((image, index) => (
                            <CarouselItem key={image.id} className="pl-4 md:pl-6 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                <motion.div
                                    variants={itemVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="h-full"
                                >
                                    {image.link_url ? (
                                        <Link href={image.link_url} className="block w-full h-full relative group overflow-hidden rounded-lg bg-background transition-all duration-300">
                                            <div className="relative w-full aspect-[4/5] sm:aspect-square overflow-hidden rounded-lg">
                                                <img
                                                    src={image.image_url}
                                                    alt="Banner"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="block w-full h-full relative group overflow-hidden rounded-lg bg-background">
                                            <div className="relative w-full aspect-[4/5] sm:aspect-square overflow-hidden rounded-lg">
                                                <img
                                                    src={image.image_url}
                                                    alt="Banner"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Mobile: arrows */}
                    <div className="flex items-center justify-center gap-6 mt-6 md:hidden">
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
