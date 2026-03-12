'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, MessageCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Store, StoresService } from '@/services/store-service'
import { Seller, SellerService } from '@/services/seller-service'

type Step = 'stores' | 'sellers'

export function WhatsAppWidget() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<Step>('stores')
    const [stores, setStores] = useState<Store[]>([])
    const [sellers, setSellers] = useState<Seller[]>([])
    const [selectedStore, setSelectedStore] = useState<Store | null>(null)
    const [loadingStores, setLoadingStores] = useState(false)
    const [loadingSellers, setLoadingSellers] = useState(false)

    // Não exibe no painel admin
    const isAdmin = pathname.startsWith('/admin')
    if (isAdmin) return null

    const loadStores = useCallback(async () => {
        setLoadingStores(true)
        try {
            const data = await StoresService.getActiveStores()
            setStores(data)
        } catch {
            // silently fail — widget is non-critical
        } finally {
            setLoadingStores(false)
        }
    }, [])

    useEffect(() => {
        if (open && stores.length === 0) {
            loadStores()
        }
    }, [open, stores.length, loadStores])

    const handleOpen = () => {
        setOpen(true)
        setStep('stores')
        setSelectedStore(null)
        setSellers([])
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleSelectStore = async (store: Store) => {
        setSelectedStore(store)
        setStep('sellers')
        setLoadingSellers(true)
        try {
            const data = await SellerService.getActiveSellersByStore(store.id)
            setSellers(data)
        } catch {
            setSellers([])
        } finally {
            setLoadingSellers(false)
        }
    }

    const handleBack = () => {
        setStep('stores')
        setSelectedStore(null)
        setSellers([])
    }

    const handleSelectSeller = (seller: Seller) => {
        const message = encodeURIComponent('Olá! Vim pelo site da Turatti e gostaria de mais informações.')
        window.open(`https://wa.me/${seller.whatsapp}?text=${message}`, '_blank', 'noopener,noreferrer')
        handleClose()
    }

    // Fecha ao pressionar Esc
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    return (
        <>
            {/* Botão flutuante */}
            <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2 md:bottom-8 md:left-8">
                <AnimatePresence>
                    {!open && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            onClick={handleOpen}
                            aria-label="Falar com um vendedor pelo WhatsApp"
                            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                        >
                            {/* Pulse rings */}
                            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 motion-reduce:hidden" />
                            <span className="absolute inset-[-6px] rounded-full border-2 border-[#25D366]/30 animate-pulse motion-reduce:hidden" />
                            <WhatsAppIcon className="w-7 h-7 relative z-10" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Overlay */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
                        onClick={handleClose}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Painel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                        className="fixed bottom-6 left-6 z-[60] w-[calc(100vw-3rem)] max-w-sm rounded-3xl bg-card border border-border/50 shadow-2xl overflow-hidden md:bottom-8 md:left-8"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Falar com um vendedor"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-5 py-4 bg-[#25D366]">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                <WhatsAppIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white leading-tight">Fale com um vendedor</p>
                                <p className="text-xs text-white/80 font-medium">
                                    {step === 'stores' ? 'Escolha a loja mais próxima' : selectedStore?.name}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                aria-label="Fechar"
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* Conteúdo com animação de troca de step */}
                        <div className="relative overflow-hidden">
                            <AnimatePresence mode="wait" initial={false}>
                                {step === 'stores' ? (
                                    <motion.div
                                        key="stores"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.18 }}
                                        className="p-4 space-y-2"
                                    >
                                        {loadingStores ? (
                                            <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
                                                <div className="w-5 h-5 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm font-medium">Carregando lojas...</span>
                                            </div>
                                        ) : stores.length === 0 ? (
                                            <p className="text-center text-sm text-muted-foreground py-8 font-medium">
                                                Nenhuma loja disponível no momento.
                                            </p>
                                        ) : (
                                            stores.map(store => (
                                                <button
                                                    key={store.id}
                                                    onClick={() => handleSelectStore(store)}
                                                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border/40 bg-muted/20 hover:bg-[#25D366]/5 hover:border-[#25D366]/30 active:scale-[0.98] transition-all duration-150 text-left group"
                                                >
                                                    <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
                                                        <StoreIcon className="w-4 h-4 text-[#25D366]" />
                                                    </div>
                                                    <span className="flex-1 text-sm font-semibold text-foreground truncate">{store.name}</span>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#25D366] transition-colors shrink-0" />
                                                </button>
                                            ))
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="sellers"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.18 }}
                                        className="p-4 space-y-2"
                                    >
                                        <button
                                            onClick={handleBack}
                                            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-3 -ml-0.5"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Trocar loja
                                        </button>

                                        {loadingSellers ? (
                                            <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
                                                <div className="w-5 h-5 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm font-medium">Carregando...</span>
                                            </div>
                                        ) : sellers.length === 0 ? (
                                            <p className="text-center text-sm text-muted-foreground py-8 font-medium">
                                                Nenhum vendedor disponível nesta loja.
                                            </p>
                                        ) : (
                                            sellers.map(seller => (
                                                <button
                                                    key={seller.id}
                                                    onClick={() => handleSelectSeller(seller)}
                                                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border/40 bg-muted/20 hover:bg-[#25D366]/5 hover:border-[#25D366]/30 active:scale-[0.98] transition-all duration-150 text-left group"
                                                >
                                                    <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
                                                        <span className="text-sm font-bold text-[#25D366]">
                                                            {seller.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-foreground truncate">{seller.name}</p>
                                                        <p className="text-xs text-muted-foreground font-medium">Clique para conversar</p>
                                                    </div>
                                                    <div className="shrink-0 w-8 h-8 rounded-xl bg-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <WhatsAppIcon className="w-4 h-4 text-white" />
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-border/30 bg-muted/20">
                            <p className="text-[11px] text-center text-muted-foreground font-medium">
                                Você será redirecionado ao WhatsApp
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

// Ícone SVG do WhatsApp (sem dependência externa)
function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
    )
}

// Ícones auxiliares usados no painel
function StoreIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}

function ChevronRight({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    )
}
