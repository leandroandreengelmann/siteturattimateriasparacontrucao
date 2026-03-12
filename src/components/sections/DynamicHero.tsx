'use client'

import { motion } from 'framer-motion'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DynamicHeroProps {
    title: string
    accentWords: string[]
    accentWords2?: string[]
    accentColor1?: string
    accentColor2?: string
    subtitle?: string
    buttonText: string
    buttonUrl: string
    className?: string
    isPreview?: boolean
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.15,
        },
    },
}

const wordVariants = {
    hidden: { opacity: 0, y: 48 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 120, damping: 18 },
    },
}

export function DynamicHero({
    title,
    accentWords,
    accentWords2 = [],
    accentColor1 = '#2b00ff',
    accentColor2 = '#2b00ff',
    subtitle,
    buttonText,
    buttonUrl,
    className,
    isPreview = false
}: DynamicHeroProps) {
    // Combine and sort highlights by length (longest first) to prevent partial matches
    const highlights = [
        ...accentWords.map(w => ({ text: w, color: accentColor1 })),
        ...accentWords2.map(w => ({ text: w, color: accentColor2 }))
    ].filter(h => h.text.trim().length > 0)
        .sort((a, b) => b.text.length - a.text.length)

    // Construct regex pattern
    const pattern = highlights.length > 0
        ? highlights.map(h => h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
        : null

    const regex = pattern ? new RegExp(`(${pattern})`, 'gi') : null
    const parts = regex ? title.split(regex) : [title]

    // Split parts into individual words, preserving highlight spans
    const words: { text: string; highlight: { text: string; color: string } | null; trailingSpace: boolean }[] = []
    parts.forEach((part) => {
        const highlight = highlights.find(h => h.text.toLowerCase() === part.toLowerCase())
        if (highlight) {
            words.push({ text: part, highlight, trailingSpace: false })
        } else {
            const tokens = part.split(/(\s+)/)
            tokens.forEach((token) => {
                if (/^\s+$/.test(token)) {
                    // attach trailing space to previous word
                    if (words.length > 0) words[words.length - 1].trailingSpace = true
                } else if (token.length > 0) {
                    words.push({ text: token, highlight: null, trailingSpace: false })
                }
            })
        }
    })

    return (
        <section className={cn(
            "relative flex items-start justify-center overflow-hidden",
            isPreview ? "min-h-full h-full py-10" : "min-h-[85vh]",
            className
        )}>
            <AuroraBackground className="absolute inset-0 z-0 !items-start !justify-start">
                <div className="container mx-auto px-6 relative z-10 text-center space-y-6 md:space-y-14 pt-28 md:pt-64">
                    <motion.h1
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={cn(
                            "font-black tracking-tight leading-[0.9] text-foreground",
                            isPreview ? "text-4xl" : "text-5xl md:text-8xl"
                        )}
                    >
                        <span className="inline">
                            {words.map((word, idx) => (
                                <motion.span
                                    key={idx}
                                    variants={wordVariants}
                                    className="inline-block"
                                    style={word.highlight
                                        ? { color: word.highlight.color, fontStyle: 'italic', marginRight: word.trailingSpace ? '0.25em' : undefined }
                                        : { marginRight: word.trailingSpace ? '0.25em' : undefined }
                                    }
                                >
                                    {word.text}
                                </motion.span>
                            ))}
                        </span>
                    </motion.h1>

                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.15 + words.length * 0.07 + 0.2 }}
                            className={cn(
                                "text-muted-foreground mx-auto leading-relaxed",
                                isPreview ? "text-sm max-w-sm" : "text-lg md:text-xl max-w-2xl"
                            )}
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15 + words.length * 0.07 + 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 md:pt-7"
                    >
                        <Link href={buttonUrl}>
                            <button className={cn(
                                "rounded-full bg-primary text-white font-bold transition-all hover:scale-105 hover:bg-primary/90 flex items-center justify-center gap-2",
                                isPreview ? "px-6 py-2 text-xs" : "w-full sm:w-auto px-10 py-4 text-sm"
                            )}>
                                {buttonText} <ArrowRight className="size-4" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </AuroraBackground>
        </section>
    )
}
