'use client'

import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/admin-layout'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    Plus,
    X,
    Mail,
    Lock,
    User,
    Loader2,
    Eye,
    EyeOff,
    ShieldCheck,
    Calendar,
    Search,
    Trash2,
    AlertTriangle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface AdminUser {
    id: string
    full_name: string
    email: string
    created_at: string
}

interface FormState {
    name: string
    email: string
    password: string
    confirmPassword: string
}


export default function UsuariosPage() {
    const [supabase] = useState(() => createClient())
    const [users, setUsers] = useState<AdminUser[]>([])
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const [form, setForm] = useState<FormState>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('admin_users')
            .select('id, full_name, email, created_at')
            .order('created_at', { ascending: false })

        if (error) {
            toast.error('Erro ao carregar usuários')
        } else {
            setUsers(data ?? [])
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        fetchUsers()
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUserId(data.user?.id ?? null)
        })
    }, [fetchUsers, supabase])

    const filteredUsers = users.filter((u) => {
        const q = search.toLowerCase()
        return (
            u.full_name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        )
    })

    const resetForm = () => {
        setForm({ name: '', email: '', password: '', confirmPassword: '' })
        setShowPassword(false)
        setShowConfirm(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (form.password !== form.confirmPassword) {
            toast.error('As senhas não coincidem')
            return
        }

        if (form.password.length < 8) {
            toast.error('A senha deve ter no mínimo 8 caracteres')
            return
        }

        setSubmitting(true)

        try {
            const { data, error } = await supabase.functions.invoke('create-admin-user', {
                body: {
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                },
            })

            if (error) throw new Error(error.message || 'Erro ao criar usuário')
            if (data?.error) throw new Error(data.error)

            toast.success(`Administrador "${form.name}" criado com sucesso!`)
            setShowModal(false)
            resetForm()
            fetchUsers()
        } catch (err: any) {
            toast.error(err.message || 'Erro inesperado')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (userId: string) => {
        setDeletingId(userId)
        try {
            const { data, error } = await supabase.functions.invoke('delete-admin-user', {
                body: { userId },
            })
            if (error) throw new Error(error.message)
            if (data?.error) throw new Error(data.error)
            toast.success('Administrador removido com sucesso')
            fetchUsers()
        } catch (err: any) {
            toast.error(err.message || 'Erro ao remover administrador')
        } finally {
            setDeletingId(null)
            setConfirmDeleteId(null)
        }
    }

    const formatDate = (str: string | null) => {
        if (!str) return '—'
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(str))
    }

    const initials = (name: string | null) => {
        if (!name) return '?'
        return name
            .split(' ')
            .slice(0, 2)
            .map((n) => n[0])
            .join('')
            .toUpperCase()
    }

    return (
        <AdminLayout>
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">Usuários Administradores</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Gerencie os administradores com acesso ao painel
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" />
                    Novo Administrador
                </button>
            </div>

            {/* Search + Stats */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nome..."
                        className="pl-9 h-9 text-sm rounded-xl bg-muted/30 border-border/50"
                    />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded-xl px-3 py-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span><span className="font-bold text-foreground">{users.length}</span> administrador{users.length !== 1 ? 'es' : ''}</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                        <Users className="w-10 h-10 opacity-30" />
                        <p className="text-sm font-medium">
                            {search ? 'Nenhum resultado encontrado' : 'Nenhum administrador cadastrado'}
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3">
                                    Administrador
                                </th>
                                <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3">
                                    Perfil
                                </th>
                                <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3">
                                     Última atualização
                                </th>
                                <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-black text-primary">
                                                    {initials(user.full_name)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{user.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                                            <ShieldCheck className="w-3 h-3" />
                                            Admin Geral
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(user.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {user.id === currentUserId ? (
                                            <span className="text-xs text-muted-foreground/50 italic">Você</span>
                                        ) : confirmDeleteId === user.id ? (
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-xs text-destructive font-medium flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> Confirmar?
                                                </span>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={deletingId === user.id}
                                                    className="text-xs font-bold text-white bg-destructive hover:bg-destructive/90 px-2.5 py-1 rounded-lg transition-all disabled:opacity-60"
                                                >
                                                    {deletingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Deletar'}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-all"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmDeleteId(user.id)}
                                                className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 ml-auto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                            onClick={() => { setShowModal(false); resetForm() }}
                        />
                        {/* Modal panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div
                                className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal header */}
                                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-primary" />
                                        </div>
                                        <h2 className="text-base font-black text-foreground">Novo Administrador</h2>
                                    </div>
                                    <button
                                        onClick={() => { setShowModal(false); resetForm() }}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    {/* Nome */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome completo</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                required
                                                value={form.name}
                                                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                                placeholder="Ex: João Silva"
                                                className="pl-9 h-10 rounded-xl bg-muted/30 border-border/50 text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">E-mail</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                required
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                                placeholder="admin@turatti.com.br"
                                                className="pl-9 h-10 rounded-xl bg-muted/30 border-border/50 text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Senha */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Senha <span className="normal-case font-normal text-muted-foreground/70">(mín. 8 caracteres)</span></label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                required
                                                type={showPassword ? 'text' : 'password'}
                                                value={form.password}
                                                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                                placeholder="••••••••"
                                                className="pl-9 pr-9 h-10 rounded-xl bg-muted/30 border-border/50 text-sm font-medium"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(s => !s)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirmar Senha */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirmar senha</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                required
                                                type={showConfirm ? 'text' : 'password'}
                                                value={form.confirmPassword}
                                                onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                                placeholder="••••••••"
                                                className="pl-9 pr-9 h-10 rounded-xl bg-muted/30 border-border/50 text-sm font-medium"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(s => !s)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {form.confirmPassword && form.password !== form.confirmPassword && (
                                            <p className="text-xs text-destructive font-medium">As senhas não coincidem</p>
                                        )}
                                    </div>

                                    {/* Info badge */}
                                    <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/10 rounded-xl">
                                        <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Este usuário terá <span className="font-bold text-foreground">acesso total</span> ao painel administrativo com permissão de Admin Geral.
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => { setShowModal(false); resetForm() }}
                                            className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 shadow-md shadow-primary/20"
                                        >
                                            {submitting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4" />
                                                    Criar Administrador
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
        </AdminLayout>
    )
}
