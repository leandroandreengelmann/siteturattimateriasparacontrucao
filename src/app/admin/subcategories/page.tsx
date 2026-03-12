'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import AdminLayout from '@/components/admin/admin-layout'
import { CategoryService, CategoryWithSub, createSubCategorySchema } from '@/services/category-service'
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Loader2,
    Search,
    ChevronRight,
    Layers,
    ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type SubCategoryFormValues = z.infer<typeof createSubCategorySchema>

export default function SubCategoriesPage() {
    const [subcategories, setSubcategories] = useState<any[]>([])
    const [categories, setCategories] = useState<CategoryWithSub[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSub, setEditingSub] = useState<any | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const form = useForm<SubCategoryFormValues>({
        resolver: zodResolver(createSubCategorySchema),
        defaultValues: {
            category_id: '',
            name: '',
            slug: '',
            href: '',
            is_active: true
        }
    })

    const loadData = async () => {
        try {
            setLoading(true)
            const [subs, cats] = await Promise.all([
                CategoryService.getAllSubCategories(),
                CategoryService.getAllCategories()
            ])
            setSubcategories(subs)
            setCategories(cats)
        } catch (error) {
            toast.error('Erro ao carregar dados')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const onSubmit = async (data: SubCategoryFormValues) => {
        setSubmitting(true)
        try {
            if (editingSub) {
                await CategoryService.updateSubCategory(editingSub.id, data)
                toast.success('Subcategoria atualizada com sucesso')
            } else {
                await CategoryService.createSubCategory(data)
                toast.success('Subcategoria criada com sucesso')
            }
            setIsModalOpen(false)
            form.reset()
            setEditingSub(null)
            loadData()
        } catch (error) {
            toast.error('Erro ao salvar subcategoria. Verifique os campos.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (sub: any) => {
        setEditingSub(sub)
        form.setValue('category_id', sub.category_id)
        form.setValue('name', sub.name)
        form.setValue('slug', sub.slug)
        form.setValue('href', sub.href)
        form.setValue('is_active', sub.is_active)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta subcategoria?')) return

        try {
            await CategoryService.deleteSubCategory(id)
            toast.success('Subcategoria excluída com sucesso')
            loadData()
        } catch (error) {
            toast.error('Erro ao excluir subcategoria')
        }
    }

    const filteredSubs = subcategories.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const toggleStatus = async (id: string, currentStatusValue: boolean) => {
        try {
            await CategoryService.updateSubCategory(id, { is_active: !currentStatusValue })
            toast.success('Status atualizado')
            loadData()
        } catch (error) {
            toast.error('Erro ao atualizar status')
        }
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim()
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value
        form.setValue('name', name)
        if (!editingSub) {
            const slug = generateSlug(name)
            form.setValue('slug', slug)
            form.setValue('href', `/categorias/${slug}`)
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Subcategorias</h1>
                        <p className="text-sm font-medium text-muted-foreground">Gerencie as divisões específicas de cada departamento</p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingSub(null)
                            form.reset()
                            setIsModalOpen(true)
                        }}
                        className="rounded-xl font-black tracking-tight-premium gap-2"
                        size="lg"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Subcategoria
                    </Button>
                </div>

                {/* Filters */}
                <div className="relative group rounded-xl border border-border/50 bg-muted/30 overflow-hidden focus-within:border-primary transition-colors">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Buscar subcategorias..."
                        className="w-full bg-transparent border-none focus-visible:ring-0 h-10 pl-10 pr-4 text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* List Section */}
                <Card className="border-border/50 overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">Carregando dados...</p>
                        </div>
                    ) : filteredSubs.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subcategoria</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoria Pai</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Link</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-right pr-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubs.map((sub) => (
                                    <TableRow key={sub.id} className="group">
                                        <TableCell className="pl-6">
                                            <span className="text-sm font-medium text-foreground">{sub.name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-black tracking-widest-premium text-[10px] uppercase py-1 px-2.5 rounded-lg border-border">
                                                {sub.category_name || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                                                <ExternalLink className="w-3 h-3" />
                                                {sub.href}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => toggleStatus(sub.id, sub.is_active)}
                                                className={cn(
                                                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                                                    sub.is_active ? "bg-primary" : "bg-muted"
                                                )}
                                            >
                                                <span className={cn(
                                                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                                                    sub.is_active ? "translate-x-5" : "translate-x-1"
                                                )} />
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-muted-foreground")}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Abrir menu</span>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleEdit(sub)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(sub.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                <Search className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Nenhuma subcategoria encontrada</p>
                        </div>
                    )}
                </Card>

                {/* Dialog for Create/Edit */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-lg rounded-[24px] p-0 overflow-hidden border-none shadow-2xl">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                                {editingSub ? 'Editar Subcategoria' : 'Nova Subcategoria'}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-2">
                                {editingSub ? 'Atualize as informações da subcategoria selecionada.' : 'Crie uma nova subcategoria vinculada a um departamento principal.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 pt-6 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar pr-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground ml-1">Categoria Pai</Label>
                                    <Controller
                                        name="category_id"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="bg-muted/50 border-border rounded-xl h-12 px-4 focus:ring-primary/20 focus:border-primary transition-all font-semibold">
                                                    <SelectValue placeholder="Selecione uma categoria..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id} className="rounded-lg">
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.category_id && (
                                        <p className="text-xs text-destructive font-bold ml-1">{form.formState.errors.category_id.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground ml-1">Nome da Subcategoria</Label>
                                    <Input
                                        {...form.register('name')}
                                        onChange={handleNameChange}
                                        className="bg-muted/30 border-border/50 rounded-xl h-11 px-4 focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-semibold"
                                        placeholder="Ex: Pisos e Revestimentos"
                                    />
                                    {form.formState.errors.name && (
                                        <p className="text-xs text-destructive font-bold ml-1">{form.formState.errors.name.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-foreground ml-1">Slug</Label>
                                        <Input
                                            {...form.register('slug')}
                                            className="bg-muted/30 border-border/50 rounded-xl h-11 px-4 focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-mono text-xs"
                                            placeholder="pisos-e-revestimentos"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-foreground ml-1">Caminho (Href)</Label>
                                        <Input
                                            {...form.register('href')}
                                            className="bg-muted/30 border-border/50 rounded-xl h-11 px-4 focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-mono text-xs"
                                            placeholder="/categorias/pisos"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-foreground">Subcategoria Ativa</span>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visível no site</span>
                                    </div>
                                    <Controller
                                        name="is_active"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <DialogFooter className="gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-12 rounded-xl font-bold border-border hover:bg-muted"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    disabled={submitting}
                                    type="submit"
                                    className="flex-[2] h-12 rounded-xl font-bold gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {editingSub ? 'Salvar Alterações' : 'Criar Subcategoria'}
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    )
}
