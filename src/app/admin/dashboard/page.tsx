'use client'

import AdminLayout from '@/components/admin/admin-layout'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <div className="space-y-8 pb-8 min-h-[calc(100vh-140px)] flex flex-col">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Administrativo</h1>
                        <p className="text-sm font-medium text-muted-foreground opacity-70">SISTEMA DE GESTÃO TURATTI — v2.0</p>
                    </motion.div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            target="_blank"
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-none font-bold tracking-premium border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300")}
                        >
                            Ver Site
                        </Link>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center opacity-30 pointer-events-none mt-20">
                    <h2 className="text-4xl font-bold tracking-tight text-muted-foreground text-center">Painel de Controle</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm text-center">Selecione uma opção no menu lateral para começar a gerenciar sua plataforma.</p>
                </div>

                {/* Footer Branding Area */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="pt-12 text-center mt-auto"
                >
                    <h2 className="text-sm font-semibold tracking-tight text-foreground opacity-[0.03]">
                        TURATTI ADMIN
                    </h2>
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-[4px] opacity-20">
                        Design & Performance by Antigravity Kit
                    </p>
                </motion.div>
            </div>
        </AdminLayout>
    )
}
