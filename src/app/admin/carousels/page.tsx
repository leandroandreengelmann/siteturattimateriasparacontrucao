'use client'

import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/admin-layout'
import { CarouselService, CarouselWithProducts } from '@/services/carousel-service'
import { ProductService } from '@/services/product-service'
import { toast } from 'sonner'
import { revalidatePage } from '@/app/actions/revalidate'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Loader2,
    CheckCircle2,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'

export default function AdminCarouselsPage() {
    const [carousels, setCarousels] = useState<CarouselWithProducts[]>([])
    const [allProducts, setAllProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const loadData = async () => {
        try {
            setLoading(true)
            const [carouselsData, productsData] = await Promise.all([
                CarouselService.getCarousels().catch(err => {
                    toast.error(`Erro ao carregar carrosséis: ${err.message}`)
                    return []
                }),
                ProductService.getAllProducts().catch(err => {
                    toast.error(`Erro ao carregar produtos: ${err.message}`)
                    return []
                })
            ])
            setCarousels(carouselsData)
            setAllProducts(productsData || [])
        } catch (error: any) {
            toast.error(`Erro geral: ${error.message || 'Erro desconhecido'}`)
        } finally {
            setLoading(false)
        }
    }

    const handleInitialize = async () => {
        try {
            setLoading(true)
            // Just refresh to see if data appeared after SQL execution
            await loadData()
            toast.info('Dados atualizados')
        } catch (error) {
            toast.error('Erro ao inicializar')
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleUpdateSettings = async (id: string, updates: any) => {
        try {
            setSavingId(id)
            await CarouselService.updateCarousel(id, updates)
            toast.success('Configurações atualizadas')
            loadData()
            await revalidatePage('/')
        } catch (error) {
            toast.error('Erro ao salvar')
        } finally {
            setSavingId(null)
        }
    }

    const toggleProductSelection = async (carousel: CarouselWithProducts, productId: string) => {
        const isSelected = carousel.products.some(p => p.id === productId)
        let newProductIds: string[] = []

        if (isSelected) {
            newProductIds = carousel.products.filter(p => p.id !== productId).map(p => p.id)
        } else {
            newProductIds = [...carousel.products.map(p => p.id), productId]
        }

        try {
            setSavingId(carousel.id)
            await CarouselService.syncCarouselProducts(carousel.id, newProductIds)
            toast.success('Produtos atualizados')
            loadData()
            await revalidatePage('/')
        } catch (error) {
            toast.error('Erro ao atualizar produtos')
        } finally {
            setSavingId(null)
        }
    }

    const getProductTypeLabel = (type: string) => {
        const labels: any = {
            featured: 'Destaques',
            promo_month: 'Promoção do Mês',
            new: 'Novidades',
            last_units: 'Últimas Unidades'
        }
        return labels[type] || type
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestão de Carrosséis</h1>
                    <p className="text-sm font-medium text-muted-foreground opacity-70">
                        Configure até 5 carrosséis independentes para sua página inicial.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {carousels.length > 0 ? (
                        carousels.map((carousel) => (
                            <Card key={carousel.id} className={cn(
                                "border-border/50 shadow-sm transition-all duration-300",
                                carousel.is_active ? "border-primary/20 bg-primary/[0.01]" : "opacity-80"
                            )}>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                                                carousel.is_active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            )}>
                                                {carousel.display_order}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-bold">{carousel.title}</CardTitle>
                                                <CardDescription className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                                    {getProductTypeLabel(carousel.product_type)} • {carousel.products.length} produtos
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                    {carousel.is_active ? 'Ativo' : 'Inativo'}
                                                </Label>
                                                <button
                                                    onClick={() => handleUpdateSettings(carousel.id, { is_active: !carousel.is_active })}
                                                    disabled={savingId === carousel.id}
                                                    className={cn(
                                                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                                                        carousel.is_active ? "bg-primary" : "bg-muted"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                                                        carousel.is_active ? "translate-x-5" : "translate-x-1"
                                                    )} />
                                                </button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setExpandedId(expandedId === carousel.id ? null : carousel.id)}
                                                className="rounded-lg h-9 w-9 p-0"
                                            >
                                                {expandedId === carousel.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                {expandedId === carousel.id && (
                                    <CardContent className="pt-4 border-t border-border/50 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold ml-1">Título do Carrossel</Label>
                                                    <Input
                                                        defaultValue={carousel.title}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== carousel.title) {
                                                                handleUpdateSettings(carousel.id, { title: e.target.value })
                                                            }
                                                        }}
                                                        className="rounded-xl bg-muted/30 border-border/50 font-semibold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold ml-1">Tipo de Conteúdo</Label>
                                                    <Select
                                                        defaultValue={carousel.product_type}
                                                        onValueChange={(val) => {
                                                            handleUpdateSettings(carousel.id, { product_type: val as any })
                                                        }}
                                                    >
                                                        <SelectTrigger className="rounded-xl bg-muted/30 border-border/50 font-semibold">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="featured">Produtos em Destaque</SelectItem>
                                                            <SelectItem value="promo_month">Promoções do Mês</SelectItem>
                                                            <SelectItem value="new">Lançamentos / Novidades</SelectItem>
                                                            <SelectItem value="last_units">Últimas Unidades</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 mt-6 space-y-6">
                                                    <h4 className="text-xs font-black uppercase tracking-[2px] text-muted-foreground">Configurações Especiais</h4>

                                                    {/* Timer Toggle */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Label className="text-sm font-bold">Cronômetro de Tempo</Label>
                                                                <p className="text-xs text-muted-foreground opacity-80 mt-1">Adiciona contador regressivo</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleUpdateSettings(carousel.id, { has_timer: !carousel.has_timer })}
                                                                disabled={savingId === carousel.id}
                                                                className={cn(
                                                                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none flex-shrink-0",
                                                                    carousel.has_timer ? "bg-primary" : "bg-muted"
                                                                )}
                                                            >
                                                                <span className={cn(
                                                                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                                                                    carousel.has_timer ? "translate-x-5" : "translate-x-1"
                                                                )} />
                                                            </button>
                                                        </div>
                                                        {carousel.has_timer && (
                                                            <div className="pt-2">
                                                                <Label className="text-xs font-bold ml-1 mb-2 block text-muted-foreground">Data e Hora de Encerramento</Label>
                                                                <Input
                                                                    type="datetime-local"
                                                                    defaultValue={carousel.timer_target_date ? new Date(new Date(carousel.timer_target_date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                                                    onBlur={(e) => {
                                                                        if (e.target.value) {
                                                                            handleUpdateSettings(carousel.id, { timer_target_date: new Date(e.target.value).toISOString() })
                                                                        }
                                                                    }}
                                                                    className="rounded-xl border-border/50 text-sm bg-background font-medium"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Quantity Toggle */}
                                                    <div className="space-y-4 pt-4 border-t border-border/50">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Label className="text-sm font-bold">Contador de Quantidade</Label>
                                                                <p className="text-xs text-muted-foreground opacity-80 mt-1">Exibe unidades restantes na promoção</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleUpdateSettings(carousel.id, { has_quantity: !carousel.has_quantity })}
                                                                disabled={savingId === carousel.id}
                                                                className={cn(
                                                                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none flex-shrink-0",
                                                                    carousel.has_quantity ? "bg-primary" : "bg-muted"
                                                                )}
                                                            >
                                                                <span className={cn(
                                                                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                                                                    carousel.has_quantity ? "translate-x-5" : "translate-x-1"
                                                                )} />
                                                            </button>
                                                        </div>
                                                        {carousel.has_quantity && (
                                                            <div className="pt-2">
                                                                <Label className="text-xs font-bold ml-1 mb-2 block text-muted-foreground">Quantidade</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    defaultValue={carousel.quantity_count || 0}
                                                                    onBlur={(e) => handleUpdateSettings(carousel.id, { quantity_count: parseInt(e.target.value) || 0 })}
                                                                    className="rounded-xl border-border/50 text-sm bg-background font-medium max-w-[150px]"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-muted/30 border border-border/50 rounded-2xl p-6">
                                                    <h4 className="text-xs font-black uppercase tracking-[2px] text-muted-foreground mb-4">Seleção Manual</h4>
                                                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                                        {allProducts
                                                            .filter(p => {
                                                                if (carousel.product_type === 'featured') return p.is_featured
                                                                if (carousel.product_type === 'promo_month') return p.is_promo_month
                                                                if (carousel.product_type === 'new') return p.is_new
                                                                if (carousel.product_type === 'last_units') return p.is_last_units
                                                                return true
                                                            })
                                                            .map(product => {
                                                                const isSelected = carousel.products.some(p => p.id === product.id)
                                                                return (
                                                                    <div
                                                                        key={product.id}
                                                                        onClick={() => toggleProductSelection(carousel, product.id)}
                                                                        className={cn(
                                                                            "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                                                                            isSelected
                                                                                ? "bg-primary/10 border-primary/30"
                                                                                : "bg-background border-border hover:border-primary/20"
                                                                        )}
                                                                    >
                                                                        <div className={cn(
                                                                            "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                                                                            isSelected ? "bg-primary text-white scale-110" : "bg-muted text-transparent"
                                                                        )}>
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-bold text-foreground truncate">{product.name}</p>
                                                                            <p className="text-[10px] font-semibold text-muted-foreground opacity-70 uppercase tracking-tighter">
                                                                                {product.brand || 'Turatti'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-3xl bg-muted/20">
                            <LayoutDashboard className="w-12 h-12 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-bold text-foreground">Nenhum carrossel encontrado</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                É necessário inicializar as 5 vagas padrão no banco de dados.
                            </p>
                            <Button onClick={handleInitialize} className="rounded-xl font-bold">
                                Verificar Dados
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
