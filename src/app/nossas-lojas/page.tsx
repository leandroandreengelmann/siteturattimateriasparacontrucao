import React from 'react'
import { MapPin, Store as StoreIcon } from 'lucide-react'
import { StoresService, Store } from '@/services/store-service'
import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import * as motion from 'framer-motion/client'

export const metadata: Metadata = {
    title: 'Nossas Lojas | Turatti',
    description: 'Descubra a loja Turatti mais próxima de você. Estruturas completas, amplo showroom e atendimento especializado.',
}

export const revalidate = 60

export default async function NossasLojasPage() {
    let stores: Store[] = []
    try {
        stores = await StoresService.getActiveStores()
    } catch (error) {
        console.error('Failed to load stores', error)
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 flex flex-col">

                {/* Hero */}
                <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-background text-center">
                    <div className="container mx-auto px-6">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black tracking-tighter text-black"
                        >
                            Nossas lojas
                        </motion.h1>
                    </div>
                </section>

                {/* Lojas */}
                <section className="py-24 md:py-32">
                    <div className="container mx-auto px-6 max-w-7xl">

                        {stores.length === 0 ? (
                            <Card className="text-center py-24">
                                <CardContent className="pt-6 flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                        <StoreIcon className="w-10 h-10 opacity-40" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground">Nenhuma loja cadastrada</h3>
                                    <p className="text-muted-foreground text-lg">Em breve teremos atualizações sobre nossas filiais.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-20 md:space-y-40">
                                {stores.map((store, index) => {
                                    const isEven = index % 2 === 0
                                    const mainImg = store.main_image_url || store.images?.[0]
                                    const secondaryImages = store.images?.filter(img => img !== mainImg) || []

                                    return (
                                        <motion.div
                                            key={store.id}
                                            initial={{ opacity: 0, y: 50 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: '-10%' }}
                                            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                                            className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-start w-full`}
                                        >
                                            {/* Coluna da Imagem */}
                                            <div className="w-full lg:w-[55%] space-y-4 flex-shrink-0">
                                                <div className="overflow-hidden group rounded-xl">
                                                    {mainImg ? (
                                                        <div className="relative w-full flex items-center justify-center">
                                                            <img
                                                                src={mainImg}
                                                                alt={store.name}
                                                                className="block w-full h-auto transition-transform duration-1000 group-hover:scale-[1.02]"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="aspect-video flex items-center justify-center bg-muted">
                                                            <StoreIcon className="w-24 h-24 text-muted-foreground/20" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Thumbnails */}
                                                {secondaryImages.length > 0 && (
                                                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                                                        {secondaryImages.map((img, i) => (
                                                            <div
                                                                key={i}
                                                                className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 snap-center group/thumb cursor-pointer overflow-hidden rounded-xl bg-transparent"
                                                            >
                                                                <img
                                                                    src={img}
                                                                    alt={`${store.name} foto ${i + 1}`}
                                                                    className="block w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Coluna de Informações */}
                                            <div className="w-full lg:w-[45%] flex flex-col gap-8 min-w-0">
                                                {/* Nome e descrição */}
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-foreground leading-none break-words">
                                                            {store.name}
                                                        </h2>
                                                        <div className="h-1.5 w-16 bg-primary rounded-full mt-5" />
                                                    </div>
                                                    {store.description && (
                                                        <div
                                                            className="text-lg text-muted-foreground leading-relaxed prose prose-zinc max-w-full overflow-hidden break-words"
                                                            dangerouslySetInnerHTML={{ __html: store.description }}
                                                        />
                                                    )}
                                                </div>

                                                {/* Dados relevantes */}
                                                <div className="pt-2">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <Badge variant="secondary" className="text-xs font-black tracking-widest rounded-sm">
                                                            Showroom & Atendimento
                                                        </Badge>
                                                    </div>
                                                    {store.relevant_data ? (
                                                        <div
                                                            className="text-foreground prose prose-zinc prose-sm md:prose-base max-w-full overflow-hidden break-words
                                                                prose-a:text-primary prose-a:font-semibold
                                                                prose-p:my-2 prose-ul:my-2 prose-li:my-0.5
                                                                prose-strong:text-foreground prose-strong:font-bold"
                                                            dangerouslySetInnerHTML={{ __html: store.relevant_data }}
                                                        />
                                                    ) : (
                                                        <p className="text-muted-foreground text-sm italic">
                                                            Nesta loja você encontra nossa linha completa de acabamentos e revestimentos.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
