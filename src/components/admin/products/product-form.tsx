'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProductService, createProductSchema } from '@/services/product-service'
import { CategoryService } from '@/services/category-service'
import { revalidatePage } from '@/app/actions/revalidate'
import {
    Loader2,
    ChevronRight,
    Search,
    Package,
    Settings,
    Zap,
    Droplets,
    Tag,
    Image as ImageIcon,
    ArrowLeft,
    Plus,
    X,
    Star,
    ImagePlus,
    DollarSign
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { ImageUpload } from '@/components/ui/image-upload'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'
import RichTextEditor from '@/components/ui/rich-text-editor'

type ProductFormValues = {
    name: string;
    slug: string;
    description: string;
    price: number;
    sale_price: number | null;
    is_on_sale: boolean;
    is_featured: boolean;
    is_promo_month: boolean;
    is_new: boolean;
    is_last_units: boolean;
    brand: string;
    unit: string;
    stock_status: "em_estoque" | "sob_encomenda" | "esgotado";
    is_active: boolean;
    subcategory_id: string;
    is_electric: boolean;
    voltage: string;
    is_paint: boolean;
    paint_color: string;
    paint_color_hex: string;
    paint_volume: string;
    image_url: string;
    images: string[];
}

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
    const router = useRouter()
    const [subcategories, setSubcategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(createProductSchema) as any,
        defaultValues: initialData || {
            name: '',
            slug: '',
            description: '',
            price: 0,
            sale_price: null,
            is_on_sale: false,
            is_featured: false,
            is_promo_month: false,
            is_new: false,
            is_last_units: false,
            brand: '',
            unit: 'un',
            stock_status: 'em_estoque',
            is_active: true,
            subcategory_id: '',
            is_electric: false,
            voltage: '',
            is_paint: false,
            paint_color: '',
            paint_color_hex: '#004EEB',
            paint_volume: '',
            image_url: '',
            images: []
        }
    })

    useEffect(() => {
        const loadSubs = async () => {
            try {
                const data = await CategoryService.getAllSubCategories()
                setSubcategories(data)
            } catch (error) {
                toast.error('Erro ao carregar subcategorias')
            } finally {
                setLoading(false)
            }
        }
        loadSubs()
    }, [])

    const onSubmit = async (data: ProductFormValues) => {
        setSubmitting(true)
        try {
            if (isEditing && initialData?.id) {
                await ProductService.updateProduct(initialData.id, data)
                toast.success('Produto atualizado com sucesso')
            } else {
                await ProductService.createProduct(data)
                toast.success('Produto criado com sucesso')
            }
            await revalidatePage('/produtos')
            router.push('/admin/products')
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error('Erro ao salvar produto. Verifique se o slug é único.')
        } finally {
            setSubmitting(false)
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
        if (!isEditing) {
            form.setValue('slug', generateSlug(name))
        }
    }

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Carregando configurações...</p>
            </div>
        )
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 pb-20 max-w-4xl mx-auto">
            {/* Main Header inside form for mobile/actions */}
            {/* Main Header inside form for mobile/actions */}
            <div className="flex items-center justify-between pointer-events-none sticky top-0 z-20 py-4 -mt-4 bg-background/80 backdrop-blur-md px-2">
                <div className="pointer-events-auto">
                    <Link
                        href="/admin/products"
                        className={cn(buttonVariants({ variant: "ghost" }), "rounded-xl font-black tracking-tight-premium -ml-2 flex items-center gap-2")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para lista
                    </Link>
                </div>
                <div className="pointer-events-auto flex gap-3">
                    <Button
                        disabled={submitting}
                        type="submit"
                        size="lg"
                        className="rounded-xl font-black tracking-tight-premium px-8 shadow-lg transition-all"
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isEditing ? 'Salvar Alterações' : 'Criar Produto'}
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Section 1: Informações do Produto */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Informações do Produto</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">Identificação e Categorização</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-foreground ml-1">Nome do Produto</Label>
                                <Input
                                    id="name"
                                    {...form.register('name')}
                                    onChange={handleNameChange}
                                    className="bg-muted/30 border-border/50 rounded-xl h-11 transition-all font-semibold focus-visible:border-primary"
                                    placeholder="Ex: Cimento CP II 50kg"
                                />
                                {form.formState.errors.name && (
                                    <p className="text-xs text-destructive font-bold ml-1">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-foreground ml-1">Subcategoria</Label>
                                <Controller
                                    name="subcategory_id"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="bg-muted/30 border-border/50 rounded-xl h-11 w-full font-semibold focus:border-primary transition-all">
                                                <SelectValue placeholder="Selecione uma subcategoria" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subcategories.map((sub) => (
                                                    <SelectItem key={sub.id} value={sub.id}>
                                                        {sub.category_name} - {sub.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-sm font-semibold text-foreground ml-1">Slug (URL)</Label>
                                <Input
                                    id="slug"
                                    {...form.register('slug')}
                                    className="bg-muted/30 border-border/50 rounded-xl h-11 transition-all font-mono text-xs focus-visible:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brand" className="text-sm font-semibold text-foreground ml-1">Marca</Label>
                                <Input
                                    id="brand"
                                    {...form.register('brand')}
                                    className="bg-muted/30 border-border/50 rounded-xl h-11 transition-all font-semibold focus-visible:border-primary"
                                    placeholder="Ex: Bosch, Votorantim"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground ml-1">Descrição do Produto</Label>
                            <Controller
                                name="description"
                                control={form.control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Descreva as características técnicas, diferenciais e aplicações do produto..."
                                    />
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Preços e Unidade */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Preços e Unidade</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">Valores e unidade de medida</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-sm font-semibold text-foreground ml-1">Preço Normal</Label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black group-focus-within:text-primary transition-colors text-sm">R$</span>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        {...form.register('price')}
                                        className="bg-muted/30 border-border/50 rounded-xl h-11 pl-12 font-black text-base transition-all focus-visible:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-1.5 px-0.5">
                                    <Label className="text-sm font-semibold text-foreground">Preço Oferta</Label>
                                    <div className="flex items-center gap-2.5 bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50 transition-all hover:bg-muted/50">
                                        <Controller
                                            name="is_on_sale"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    id="is_on_sale"
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => {
                                                        field.onChange(checked)
                                                        if (!checked) {
                                                            form.setValue('sale_price', null)
                                                            form.clearErrors('sale_price')
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                        <Label htmlFor="is_on_sale" className={`text-sm font-semibold uppercase tracking-wider cursor-pointer transition-colors ${form.watch('is_on_sale') ? 'text-primary' : 'text-muted-foreground/50'}`}>
                                            {form.watch('is_on_sale') ? 'Ativo' : 'Ativar'}
                                        </Label>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black transition-colors text-sm ${form.watch('is_on_sale') ? 'text-primary' : 'text-muted-foreground/30'}`}>R$</span>
                                    <Input
                                        disabled={!form.watch('is_on_sale')}
                                        type="number"
                                        step="0.01"
                                        {...form.register('sale_price')}
                                        className={`rounded-xl h-11 pl-12 font-black text-base transition-all ${form.watch('is_on_sale')
                                            ? 'bg-primary/5 border-primary/20 text-primary'
                                            : 'bg-muted/30 border-border/50 opacity-40'
                                            }`}
                                    />
                                </div>
                                {form.formState.errors.sale_price && (
                                    <p className="text-xs text-destructive font-bold ml-1">{form.formState.errors.sale_price.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-foreground ml-1">Unidade</Label>
                                <Controller
                                    name="unit"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="bg-muted/20 border-border/50 rounded-xl h-11 w-full font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="un">Unidade (un)</SelectItem>
                                                <SelectItem value="m2">Metro Quadrado (m²)</SelectItem>
                                                <SelectItem value="m">Metro (m)</SelectItem>
                                                <SelectItem value="kg">Quilo (kg)</SelectItem>
                                                <SelectItem value="litro">Litro (L)</SelectItem>
                                                <SelectItem value="saco">Saco</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Destaques e Status */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Destaques e Status</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">Visibilidade e Etiquetas</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'is_featured', label: 'Destaque', color: 'bg-amber-500' },
                            { id: 'is_promo_month', label: 'Promoção do Mês', color: 'bg-red-500' },
                            { id: 'is_new', label: 'Novidade', color: 'bg-emerald-500' },
                            { id: 'is_last_units', label: 'Últimas Unidades', color: 'bg-orange-500' }
                        ].map((flag) => (
                            <div key={flag.id} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all group">
                                <Controller
                                    name={flag.id as any}
                                    control={form.control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id={flag.id}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <div className="flex flex-col gap-0.5">
                                    <Label
                                        htmlFor={flag.id}
                                        className={cn(
                                            "text-sm font-semibold uppercase tracking-wider cursor-pointer transition-colors",
                                            form.watch(flag.id as any) ? "text-primary" : "text-muted-foreground/60"
                                        )}
                                    >
                                        {flag.label}
                                    </Label>
                                    <div className={cn(
                                        "h-0.5 w-4 rounded-full transition-all",
                                        form.watch(flag.id as any) ? flag.color : "bg-muted-foreground/20"
                                    )} />
                                </div>
                            </div>
                        ))}

                        {/* is_active toggle */}
                        <div className="col-span-2 md:col-span-4 flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">Produto Ativo</span>
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
                    </CardContent>
                </Card>

                {/* Section 4: Atributos Técnicos */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <Settings className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Atributos Técnicos</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">Elétrico, Ferramentas e Tintas</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Configuração Elétrica */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <span className="text-xl font-semibold uppercase tracking-wider">Configuração Elétrica</span>
                                </div>
                                <Controller
                                    name="is_electric"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>

                            <AnimatePresence>
                                {form.watch('is_electric') && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 pt-2 overflow-hidden"
                                    >
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">Voltagem / Tensão</Label>
                                            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                                                {[
                                                    { id: '110v', label: '110V' },
                                                    { id: '220v', label: '220V' },
                                                    { id: '12v', label: '12V (Bateria)' },
                                                    { id: '20v', label: '20V (Bateria)' }
                                                ].map((option) => (
                                                    <div key={option.id} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`voltage-${option.id}`}
                                                            checked={(form.watch('voltage') || '').split(',').includes(option.id)}
                                                            onCheckedChange={(checked) => {
                                                                const currentVolts = (form.getValues('voltage') || '').split(',').filter(Boolean)
                                                                let newVolts
                                                                if (checked) {
                                                                    newVolts = [...currentVolts, option.id]
                                                                } else {
                                                                    newVolts = currentVolts.filter(v => v !== option.id)
                                                                }
                                                                form.setValue('voltage', newVolts.join(','))
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`voltage-${option.id}`}
                                                            className="text-lg font-medium cursor-pointer"
                                                        >
                                                            {option.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Configuração de Tintas */}
                        <div className="space-y-6 md:border-l md:pl-12 border-border/20">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-3">
                                    <Droplets className="w-4 h-4 text-primary" />
                                    <span className="text-xl font-semibold uppercase tracking-wider">Configuração de Tintas</span>
                                </div>
                                <Controller
                                    name="is_paint"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>

                            <AnimatePresence>
                                {form.watch('is_paint') && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 pt-2 overflow-hidden"
                                    >
                                        <div className="space-y-4 pt-2 overflow-hidden">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">Litragem (Volume)</Label>
                                                    <Input
                                                        {...form.register('paint_volume')}
                                                        className="bg-muted/30 border-border/50 rounded-xl h-11 font-bold focus-visible:border-primary transition-all"
                                                        placeholder="Ex: 18L, 3.6L, 900ml"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">Nome da Cor</Label>
                                                        <Input
                                                            {...form.register('paint_color')}
                                                            className="bg-muted/30 border-border/50 rounded-xl h-11 font-bold focus-visible:border-primary transition-all"
                                                            placeholder="Ex: Branco Neve"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">Código Hexadecimal</Label>
                                                        <div className="flex gap-2">
                                                            <div
                                                                className="w-11 h-11 rounded-xl border border-border/50 shrink-0 shadow-inner"
                                                                style={{ backgroundColor: form.watch('paint_color_hex') || '#ffffff' }}
                                                            />
                                                            <Input
                                                                {...form.register('paint_color_hex')}
                                                                className="bg-muted/30 border-border/50 rounded-xl h-11 font-mono text-xs focus-visible:border-primary transition-all uppercase"
                                                                placeholder="#FFFFFF"
                                                                maxLength={7}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val === '' || /^#?([0-9A-F]{0,6})$/i.test(val)) {
                                                                        form.setValue('paint_color_hex', val.startsWith('#') ? val : `#${val}`);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 5: Mídia do Produto */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <ImagePlus className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Mídia do Produto</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">Adicione até 10 fotos (Links Externos)</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-8">
                        <Controller
                            name="images"
                            control={form.control}
                            render={({ field: imagesField }) => (
                                <Controller
                                    name="image_url"
                                    control={form.control}
                                    render={({ field: image_urlField }) => (
                                        <ImageUpload
                                            images={imagesField.value || []}
                                            mainImage={image_urlField.value || ''}
                                            onImagesChange={imagesField.onChange}
                                            onMainImageChange={image_urlField.onChange}
                                            disabled={submitting}
                                            bucket="product-images"
                                            folderPath="products"
                                        />
                                    )}
                                />
                            )}
                        />
                    </CardContent>
                </Card>
            </div>
        </form>
    )
}
