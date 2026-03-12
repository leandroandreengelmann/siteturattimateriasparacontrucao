'use client'

import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/admin-layout'
import { Store, StoresService } from '@/services/store-service'
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Search,
    Store as StoreIcon
} from 'lucide-react'
import { toast } from 'sonner'
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
    Card,
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
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const loadStores = async () => {
        try {
            setLoading(true)
            const data = await StoresService.getStores()
            setStores(data)
        } catch (error) {
            toast.error('Erro ao carregar lojas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStores()
    }, [])

    const handleDelete = async (id: string, imageUrl: string | null) => {
        if (!confirm('Tem certeza que deseja excluir esta loja?')) return

        try {
            await StoresService.deleteStore(id)
            if (imageUrl) {
                // Optionally delete main image. In a full app you might delete all images associated.
                // await UploadService.removeImage('stores', imageUrl)
            }
            toast.success('Loja excluída com sucesso')
            loadStores()
        } catch (error) {
            toast.error('Erro ao excluir loja')
        }
    }

    const toggleStatus = async (id: string, currentStatusValue: boolean) => {
        try {
            await StoresService.updateStore(id, { is_active: !currentStatusValue })
            toast.success('Status atualizado')
            loadStores()
        } catch (error) {
            toast.error('Erro ao atualizar status')
        }
    }

    const filteredStores = stores.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Nossas Lojas</h1>
                        <p className="text-sm font-medium text-muted-foreground">Gerencie as filiais exibidas no site</p>
                    </div>
                    <Link href="/admin/stores/new">
                        <Button className="rounded-xl font-black tracking-tight-premium gap-2" size="lg">
                            <Plus className="w-5 h-5" />
                            Nova Loja
                        </Button>
                    </Link>
                </div>

                <div className="relative group rounded-xl border border-border/50 bg-muted/30 overflow-hidden focus-within:border-primary transition-colors">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Buscar lojas..."
                        className="w-full bg-transparent border-none focus-visible:ring-0 h-10 pl-10 pr-4 text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Card className="border-border/50 overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">Carregando lojas...</p>
                        </div>
                    ) : filteredStores.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 w-20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capa</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome</TableHead>
                                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Imagens</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-right pr-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStores.map((store) => (
                                    <TableRow key={store.id} className="group">
                                        <TableCell className="pl-6">
                                            {store.main_image_url ? (
                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border/50">
                                                    <Image
                                                        src={store.main_image_url}
                                                        alt={store.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="48px"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center border border-border/50 text-muted-foreground">
                                                    <StoreIcon className="w-5 h-5" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium text-foreground">{store.name}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="text-xs font-medium text-muted-foreground">{store.images?.length || 0} de 6</span>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => toggleStatus(store.id, store.is_active)}
                                                className={cn(
                                                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                                                    store.is_active ? "bg-primary" : "bg-muted"
                                                )}
                                            >
                                                <span className={cn(
                                                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                                                    store.is_active ? "translate-x-5" : "translate-x-1"
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
                                                    <Link href={`/admin/stores/${store.id}`}>
                                                        <DropdownMenuItem>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(store.id, store.main_image_url)}
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
                                <StoreIcon className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Nenhuma loja encontrada</p>
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    )
}
