'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    
    // Instância otimizada do cliente para componentes React que previne recriação 
    const [supabase] = useState(() => createClient())

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            toast.success('Bem-vindo de volta!')
            router.push('/admin/dashboard')
        } catch (error: any) {
            toast.error(error.message || 'Erro ao fazer login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden font-sans">
            {/* Background accents optimization for light theme */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-10 bg-white border border-zinc-200 rounded-[32px] z-10 relative"
            >
                <div className="text-center mb-12">
                    <div className="mb-8 flex justify-center">
                        <img src="/logo.png" alt="Turatti" className="h-20 w-auto object-contain" />
                    </div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Portal Turatti</h1>
                    <p className="text-zinc-500 mt-2 font-medium">Controle e Gestão Administrativa</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 ml-1">E-mail</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-muted/30 border-border/50 rounded-xl pl-12 pr-4 h-11 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-semibold shadow-none"
                                placeholder="admin@turatti.com.br"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 ml-1">Senha</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                            <Input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-muted/30 border-border/50 rounded-xl pl-12 pr-4 h-11 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-semibold shadow-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/95 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 group hover:-translate-y-0.5"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Acessar Sistema
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-zinc-100 text-center">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-[2px] font-bold">
                        Segurança Turatti &copy; 2026
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
