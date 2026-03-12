'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import AdminLayout from '@/components/admin/admin-layout'
import { CategoryService, CategoryWithSub, createCategorySchema } from '@/services/category-service'
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Loader2,
    Search,
    ChevronRight,
    Tag
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

type CategoryFormValues = z.infer<typeof createCategorySchema>

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryWithSub[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<CategoryWithSub | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: {
            name: '',
            slug: '',
            is_active: true
        }
    })

    const loadCategories = async () => {
        try {
            setLoading(true)
            const data = await CategoryService.getAllCategories()
            setCategories(data)
        } catch (error) {
            toast.error('Erro ao carregar categorias')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

    const onSubmit = async (data: CategoryFormValues) => {
        setSubmitting(true)
        try {
            if (editingCategory) {
                await CategoryService.updateCategory(editingCategory.id, data)
                toast.success('Categoria atualizada com sucesso')
            } else {
                await CategoryService.createCategory(data)
                toast.success('Categoria criada com sucesso')
            }
            setIsModalOpen(false)
            form.reset()
            setEditingCategory(null)
            loadCategories()
        } catch (error) {
            toast.error('Erro ao salvar categoria. Verifique se o slug é único.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (category: CategoryWithSub) => {
        setEditingCategory(category)
        form.setValue('name', category.name)
        form.setValue('slug', category.slug)
        form.setValue('is_active', category.is_active)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria? Isso pode afetar subcategorias vinculadas.')) return

        try {
            await CategoryService.deleteCategory(id)
            toast.success('Categoria excluída com sucesso')
            loadCategories()
        } catch (error) {
            toast.error('Erro ao excluir categoria')
        }
    }

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const toggleStatus = async (id: string, currentStatusValue: boolean) => {
        try {
            await CategoryService.updateCategory(id, { is_active: !currentStatusValue })
            toast.success('Status atualizado')
            loadCategories()
        } catch (error) {
            toast.error('Erro ao atualizar status')
        }
    }

    // Helper to generate slug from name
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
        if (!editingCategory) {
            form.setValue('slug', generateSlug(name))
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Categorias</h1>
                        <p className="text-sm font-medium text-muted-foreground">Gerencie os departamentos principais do site</p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingCategory(null)
                            form.reset()
                            setIsModalOpen(true)
                        }}
                        className="rounded-xl font-black tracking-tight-premium gap-2"
                        size="lg"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Categoria
                    </Button>
                </div>

                {/* Filters */}
                <div className="relative group rounded-xl border border-border/50 bg-muted/30 overflow-hidden focus-within:border-primary transition-colors">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Buscar categorias..."
                        className="w-full bg-transparent border-none focus-visible:ring-0 h-10 pl-10 pr-4 text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Categories List */}
                <Card className="border-border/50 overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">Carregando categorias...</p>
                        </div>
                    ) : filteredCategories.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slug</TableHead>
                                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subcategorias</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-right pr-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((category) => (
                                    <TableRow key={category.id} className="group">
                                        <TableCell className="pl-6">
                                            <span className="text-sm font-medium text-foreground">{category.name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono text-[11px] py-1 px-2.5 rounded-lg border-border">
                                                {category.slug}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="text-xs font-medium text-muted-foreground">{category.subcategories?.length || 0}</span>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => toggleStatus(category.id, category.is_active)}
                                                className={cn(
                                                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                                                    category.is_active ? "bg-primary" : "bg-muted"
                                                )}
                                            >
                                                <span className={cn(
                                                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                                                    category.is_active ? "translate-x-5" : "translate-x-1"
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
                                                    <DropdownMenuItem onClick={() => handleEdit(category)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(category.id)}
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
                            <p className="text-sm font-medium text-muted-foreground">Nenhuma categoria encontrada</p>
                        </div>
                    )}
                </Card>

                {/* Dialog for Create/Edit */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-lg rounded-[24px] p-0 overflow-hidden border-none shadow-2xl">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-2">
                                {editingCategory ? 'Atualize as informações da categoria principal.' : 'Crie uma nova categoria principal para organizar seus produtos.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 pt-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground ml-1">Nome da Categoria</Label>
                                    <Input
                                        {...form.register('name')}
                                        onChange={handleNameChange}
                                        className="bg-muted/30 border-border/50 rounded-xl h-11 px-4 focus-visible:border-primary transition-colors text-sm font-medium"
                                        placeholder="Ex: Materiais de Construção"
                                    />
                                    {form.formState.errors.name && (
                                        <p className="text-base text-destructive font-bold ml-1">{form.formState.errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground ml-1">Slug (URL)</Label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">/</span>
                                        <Input
                                            {...form.register('slug')}
                                            className="bg-muted/30 border-border/50 rounded-xl h-11 pl-8 pr-4 focus-visible:border-primary transition-colors font-mono text-sm"
                                            placeholder="materiais-de-construcao"
                                        />
                                    </div>
                                    {form.formState.errors.slug && (
                                        <p className="text-base text-destructive font-bold ml-1">{form.formState.errors.slug.message}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-foreground">Categoria Ativa</span>
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
                                            {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
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
