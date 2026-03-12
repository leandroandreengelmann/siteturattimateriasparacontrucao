'use client'

import React, { useState } from 'react'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Building2, Info, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import * as motion from 'framer-motion/client'

interface SobreNosClientProps {
    settings: {
        content: string | null
    }
    images: {
        id: string
        image_url: string
    }[]
}

export default function SobreNosClient({ settings, images }: SobreNosClientProps) {
    const [mainImage, setMainImage] = useState(images[0]?.image_url || '')
    const secondaryImages = images.filter(img => img.image_url !== mainImage)

    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-white">
            <Header />

            <main className="flex-1 flex flex-col">
                {/* Hero Minimalist */}
                <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-background text-center">
                    <div className="container mx-auto px-6 relative z-10">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-6xl font-black tracking-tighter text-black leading-none"
                        >
                            Sobre a Turatti
                        </motion.h1>
                    </div>
                </section>

                <div className="container mx-auto px-6 max-w-7xl pb-32 space-y-24">
                    {/* Gallery Showcase - Interactive */}
                    {images.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            {/* Main Image View */}
                            <div className="relative w-full overflow-hidden rounded-2xl bg-muted">
                                <motion.img
                                    key={mainImage}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6 }}
                                    src={mainImage}
                                    alt="Turatti Main View"
                                    className="block w-full h-auto object-contain bg-muted aspect-[16/9] md:aspect-[21/9]"
                                />
                            </div>

                            {/* Clickable Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                                    {images.map((img) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setMainImage(img.image_url)}
                                            className={`relative w-28 h-28 md:w-40 md:h-40 flex-shrink-0 rounded-xl overflow-hidden snap-center transition-all duration-300 ${mainImage === img.image_url ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                                                }`}
                                        >
                                            <img
                                                src={img.image_url}
                                                alt="Turatti view thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Content Section - Fused into context */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="mb-8">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-black">
                                Sobre a Turatti
                            </h2>
                        </div>

                        {settings.content && settings.content.replace(/<[^>]*>?/gm, '').trim() !== '' ? (
                            <div
                                className="prose prose-zinc prose-sm md:prose-base max-w-none break-words overflow-hidden
                                prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-foreground
                                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:font-medium
                                prose-strong:text-foreground prose-strong:font-bold
                                prose-a:text-primary prose-a:font-bold hover:prose-a:underline
                                prose-img:rounded-2xl prose-img:shadow-xl"
                                dangerouslySetInnerHTML={{ __html: settings.content }}
                            />
                        ) : (
                            <div className="text-center py-20 px-10 rounded-3xl bg-muted/30 border-2 border-dashed border-border/50">
                                <Info className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                                <h3 className="text-2xl font-bold text-foreground/50">História em construção</h3>
                                <p className="text-muted-foreground/60">O conteúdo oficial da Turatti será publicado em breve.</p>
                            </div>
                        )}
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
