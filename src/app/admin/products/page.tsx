'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/admin-layout'
import { ProductService } from '@/services/product-service'
import { revalidatePage } from '@/app/actions/revalidate'
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Search,
    Package,
    Zap,
    Droplets,
    Tag,
    MoreHorizontal,
    Copy
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function ProductsPage() {
    const router = useRouter()
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const loadData = async () => {
        try {
            setLoading(true)
            const productsData = await ProductService.getAllProducts()
            setProducts(productsData || [])
        } catch (error) {
            toast.error('Erro ao carregar produtos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return

        try {
            await ProductService.deleteProduct(id)
            toast.success('Produto excluído com sucesso')
            loadData()
            await revalidatePage('/produtos')
        } catch (error) {
            toast.error('Erro ao excluir produto')
        }
    }

    const handleDuplicate = async (id: string) => {
        try {
            await ProductService.duplicateProduct(id)
            toast.success('Produto duplicado com sucesso')
            loadData()
            await revalidatePage('/produtos')
        } catch (error) {
            toast.error('Erro ao duplicar produto')
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const toggleStatus = async (id: string, currentStatusValue: boolean) => {
        try {
            await ProductService.updateProduct(id, { is_active: !currentStatusValue })
            toast.success('Status atualizado')
            loadData()
            await revalidatePage('/produtos')
        } catch (error) {
            toast.error('Erro ao atualizar status')
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Produtos</h1>
                        <p className="text-sm font-medium text-muted-foreground">Gerencie o catálogo de materiais de construção</p>
                    </div>
                    <Link
                        href="/admin/products/new"
                        className={cn(buttonVariants({ variant: "default", size: "lg" }), "rounded-xl font-black tracking-tight-premium gap-2")}
                    >
                        <Plus className="w-5 h-5" />
                        Novo Produto
                    </Link>
                </div>

                {/* Filters */}
                <div className="relative group rounded-xl border border-border/50 bg-muted/30 overflow-hidden focus-within:border-primary transition-colors">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Buscar produtos por nome, marca ou slug..."
                        className="w-full bg-transparent border-none focus-visible:ring-0 h-10 pl-10 pr-4 text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Products List */}
                <Card className="border-border/50 overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">Carregando produtos...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 w-[350px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Produto</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoria/Sub</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preço</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destaques</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-right pr-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id} className="group">
                                        <TableCell className="pl-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground">{product.name}</span>
                                                <span className="text-xs text-muted-foreground mt-1">{product.brand || 'Sem Marca'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium text-foreground">
                                                    {product.subcategories?.categories?.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {product.subcategories?.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground">{formatCurrency(product.price)}</span>
                                                {product.is_on_sale && product.sale_price && (
                                                    <span className="text-xs font-medium text-primary mt-1">Oferta: {formatCurrency(product.sale_price)}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                {product.is_featured && (
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none rounded-full p-3" title="Destaque">
                                                        <Tag className="w-12 h-12" />
                                                    </Badge>
                                                )}
                                                {product.is_promo_month && (
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-full p-3" title="Promoção do Mês">
                                                        <Zap className="w-12 h-12" />
                                                    </Badge>
                                                )}
                                                {product.is_paint && (
                                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none rounded-full p-3" title="Tinta">
                                                        <Droplets className="w-12 h-12" />
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => toggleStatus(product.id, product.is_active)}
                                                className={cn(
                                                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                                                    product.is_active ? "bg-primary" : "bg-muted"
                                                )}
                                            >
                                                <span className={cn(
                                                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                                                    product.is_active ? "translate-x-5" : "translate-x-1"
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
                                                    <DropdownMenuItem onClick={() => router.push(`/admin/products/${product.id}`)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(product.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDuplicate(product.id)}>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Duplicar
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
                            <p className="text-sm font-medium text-muted-foreground">Nenhum produto encontrado</p>
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    )
}
