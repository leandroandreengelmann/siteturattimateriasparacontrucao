'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ScrollToTop({ className }: { className?: string }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' })

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ duration: 0.2 }}
                    onClick={scrollUp}
                    aria-label="Voltar ao topo"
                    className={cn(
                        "hidden md:flex fixed bottom-6 right-6 z-50 size-12 rounded-full bg-primary text-primary-foreground shadow-lg items-center justify-center hover:bg-primary/90 hover:scale-110 active:scale-95 transition-transform duration-200",
                        className
                    )}
                >
                    <ArrowUp className="size-5" />
                </motion.button>
            )}
        </AnimatePresence>
    )
}
