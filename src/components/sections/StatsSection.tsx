'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const STATS = [
    { value: 30, suffix: '+', label: 'Anos no mercado', description: 'Décadas de experiência e confiança' },
    { value: 2, suffix: '', label: 'Lojas próprias', description: 'Showrooms completos para visitar' },
    { value: 50000, suffix: '+', label: 'Clientes atendidos', description: 'Projetos entregues com excelência' },
    { value: 5000, suffix: '+', label: 'Produtos', description: 'O maior catálogo da região' },
]

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)
    const isInView = useInView(ref, { once: true, margin: '-60px' })

    useEffect(() => {
        if (!isInView) return
        const duration = 1600
        const steps = 50
        const increment = target / steps
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                setCount(target)
                clearInterval(timer)
            } else {
                setCount(Math.floor(current))
            }
        }, duration / steps)
        return () => clearInterval(timer)
    }, [isInView, target])

    const display = count >= 1000 ? `${(count / 1000).toFixed(0)}k` : count.toString()

    return (
        <span ref={ref}>
            {display}{suffix}
        </span>
    )
}

export function StatsSection() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="flex flex-col gap-2"
                >
                    <p className="text-4xl md:text-5xl font-black text-primary tracking-tighter leading-none">
                        <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                    </p>
                    <div className="h-0.5 w-8 bg-primary/30 rounded-full mt-1" />
                    <p className="text-sm md:text-base font-bold text-foreground mt-1">{stat.label}</p>
                    <p className="text-xs md:text-sm text-muted-foreground leading-snug">{stat.description}</p>
                </motion.div>
            ))}
        </div>
    )
}
