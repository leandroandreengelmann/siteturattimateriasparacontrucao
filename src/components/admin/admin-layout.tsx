'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Tag,
    Layers,
    Package,
    LogOut,
    ChevronRight,
    ChevronLeft,
    User,
    Users,
    Image as ImageIcon,
    Settings,
    MapPin,
    Menu,
    X,
    Palette,
    Store as StoreIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
    const pathname = usePathname()
    const router = useRouter()

    // Instância com cache em estado para previnir loops de re-render com estado original
    const [supabase] = React.useState(() => createClient())

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Banner Hero', href: '/admin/hero', icon: ImageIcon },
        { name: 'Banner Fixo', href: '/admin/banner-fixo', icon: ImageIcon },
        { name: 'Sobre Nós', href: '/admin/sobre-nos', icon: Layers },
        { name: 'Carrossel Imagens', href: '/admin/image-carousel', icon: ImageIcon },
        { name: 'Carrosséis', href: '/admin/carousels', icon: LayoutDashboard },
        { name: 'Cores Sunvinil', href: '/admin/colors', icon: Palette },
        { name: 'Categorias', href: '/admin/categories', icon: Tag },
        { name: 'Subcategorias', href: '/admin/subcategories', icon: Layers },
        { name: 'Produtos', href: '/admin/products', icon: Package },
        { name: 'Nossas Lojas', href: '/admin/stores', icon: StoreIcon },
        { name: 'Configurações de Rodapé', href: '/admin/settings', icon: Settings },
        { name: 'Usuários', href: '/admin/usuarios', icon: Users },
    ]

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out",
                    "bg-card border-r border-border",
                    isSidebarOpen ? "w-60" : "w-[68px]"
                )}
            >
                {/* Logo area */}
                <div className={cn(
                    "flex items-center shrink-0 pt-6 pb-4",
                    isSidebarOpen ? "px-4 justify-between gap-3" : "justify-center mt-3"
                )}>
                    {isSidebarOpen ? (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex items-center justify-center"
                        >
                            <img src="/logo.png" alt="Turatti" className="w-[130px] h-auto object-contain" />
                        </motion.div>
                    ) : null}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 shrink-0"
                    >
                        {isSidebarOpen
                            ? <ChevronLeft className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />
                        }
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
                    {isSidebarOpen && (
                        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-3 pb-2 pt-1">
                            Menu
                        </p>
                    )}
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={!isSidebarOpen ? item.name : undefined}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg transition-all duration-200 group relative",
                                    isSidebarOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >

                                <item.icon className={cn(
                                    "shrink-0 transition-transform duration-200",
                                    isSidebarOpen ? "w-4 h-4" : "w-5 h-5",
                                    !isActive && "group-hover:scale-110"
                                )} />
                                {isSidebarOpen && (
                                    <span className="text-sm font-medium leading-none">{item.name}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer / Logout */}
                <div className="shrink-0 border-t border-border p-2">
                    <button
                        onClick={handleLogout}
                        title={!isSidebarOpen ? 'Sair' : undefined}
                        className={cn(
                            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group",
                            !isSidebarOpen && "justify-center px-0"
                        )}
                    >
                        <LogOut className="w-4 h-4 shrink-0 group-hover:-translate-x-0.5 transition-transform duration-200" />
                        {isSidebarOpen && (
                            <span className="text-sm font-medium">Sair</span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={cn(
                "flex-1 transition-all duration-300 ease-in-out min-w-0 bg-background",
                isSidebarOpen ? "ml-60" : "ml-[68px]"
            )}>
                {/* Top Header */}
                <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40 px-6 flex items-center justify-end w-full">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-foreground leading-tight">Administrador</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Turatti</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                </header>

                <div className="p-8 w-full max-w-full">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="w-full block"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
