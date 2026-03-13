'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Store as StoreIcon, ArrowLeft, Tag, Info, FileText, Image as ImageIcon, MessageCircle, Plus, Pencil, Trash2, Check, X, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import RichTextEditor from '@/components/ui/rich-text-editor'
import { ImageUpload } from '@/components/ui/image-upload'
import { cn } from '@/lib/utils'

import { Store, StoresService } from '@/services/store-service'
import { Seller, SellerService } from '@/services/seller-service'
import { revalidatePage } from '@/app/actions/revalidate'

const storeSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(100),
    description: z.string().optional().nullable(),
    relevant_data: z.string().optional().nullable(),
    images: z.array(z.string()).max(6, 'Máximo de 6 imagens'),
    main_image_url: z.string().optional().nullable(),
    is_active: z.boolean(),
})

type StoreFormValues = z.infer<typeof storeSchema>

interface StoreFormProps {
    initialData?: Store
}

export default function StoreForm({ initialData }: StoreFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // --- Sellers state ---
    const [sellers, setSellers] = useState<Seller[]>([])
    const [sellersLoading, setSellersLoading] = useState(false)
    const [editingSeller, setEditingSeller] = useState<Seller | null>(null)
    const [addingNew, setAddingNew] = useState(false)
    const [sellerForm, setSellerForm] = useState({ name: '', whatsapp: '' })
    const [sellerSaving, setSellerSaving] = useState(false)

    const loadSellers = async () => {
        if (!initialData?.id) return
        setSellersLoading(true)
        try {
            const data = await SellerService.getSellersByStore(initialData.id)
            setSellers(data)
        } catch {
            toast.error('Erro ao carregar vendedores')
        } finally {
            setSellersLoading(false)
        }
    }

    useEffect(() => {
        loadSellers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData?.id])

    const handleSaveSeller = async () => {
        if (!sellerForm.name.trim() || !sellerForm.whatsapp.trim()) {
            toast.error('Nome e WhatsApp são obrigatórios')
            return
        }
        const rawPhone = sellerForm.whatsapp.replace(/\D/g, '')
        if (rawPhone.length < 10) {
            toast.error('Número de WhatsApp inválido')
            return
        }
        setSellerSaving(true)
        try {
            if (editingSeller) {
                await SellerService.updateSeller(editingSeller.id, {
                    name: sellerForm.name.trim(),
                    whatsapp: rawPhone,
                })
                toast.success('Vendedor atualizado')
            } else {
                await SellerService.createSeller({
                    store_id: initialData!.id,
                    name: sellerForm.name.trim(),
                    whatsapp: rawPhone,
                    display_order: sellers.length,
                })
                toast.success('Vendedor adicionado')
            }
            setEditingSeller(null)
            setAddingNew(false)
            setSellerForm({ name: '', whatsapp: '' })
            loadSellers()
        } catch {
            toast.error('Erro ao salvar vendedor')
        } finally {
            setSellerSaving(false)
        }
    }

    const handleEditSeller = (seller: Seller) => {
        setEditingSeller(seller)
        setAddingNew(false)
        setSellerForm({ name: seller.name, whatsapp: seller.whatsapp })
    }

    const handleCancelSeller = () => {
        setEditingSeller(null)
        setAddingNew(false)
        setSellerForm({ name: '', whatsapp: '' })
    }

    const handleDeleteSeller = async (id: string) => {
        if (!confirm('Remover este vendedor?')) return
        try {
            await SellerService.deleteSeller(id)
            toast.success('Vendedor removido')
            loadSellers()
        } catch {
            toast.error('Erro ao remover vendedor')
        }
    }

    const handleToggleSellerStatus = async (seller: Seller) => {
        try {
            await SellerService.updateSeller(seller.id, { is_active: !seller.is_active })
            loadSellers()
        } catch {
            toast.error('Erro ao atualizar status')
        }
    }

    const form = useForm<StoreFormValues>({
        resolver: zodResolver(storeSchema),
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            relevant_data: initialData?.relevant_data || '',
            images: initialData?.images || [],
            main_image_url: initialData?.main_image_url || '',
            is_active: initialData?.is_active ?? true,
        }
    })

    const onSubmit = async (data: StoreFormValues) => {
        setIsSubmitting(true)
        try {
            if (initialData?.id) {
                await StoresService.updateStore(initialData.id, data)
                toast.success('Loja atualizada com sucesso')
            } else {
                await StoresService.createStore(data)
                toast.success('Loja criada com sucesso')
            }
            await revalidatePage('/nossas-lojas')
            router.push('/admin/stores')
            router.refresh()
        } catch (error) {
            toast.error('Erro ao salvar loja')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const { watch, setValue } = form
    const currentImages = watch('images')
    const currentMainImage = watch('main_image_url')

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-5xl">
            {/* Header / Ações */}
            <div className="flex items-center justify-between sticky top-[60px] z-10 bg-background/80 backdrop-blur-xl py-4 border-b border-border/50 -mt-6 mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/stores">
                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-muted" type="button">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                            {initialData ? 'Editar Loja' : 'Cadastrar Loja'}
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground ml-1">
                            {initialData ? 'Atualize as informações da filial.' : 'Preencha os dados da nova filial.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/admin/stores">
                        <Button variant="outline" type="button" className="rounded-xl h-11 font-bold border-border/50 bg-background hover:bg-muted hidden sm:flex">
                            Cancelar
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl h-11 font-black tracking-tight-premium gap-2 shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <StoreIcon className="w-5 h-5" />}
                        {initialData ? 'Salvar Alterações' : 'Salvar Loja'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Informações Básicas */}
                    <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight text-foreground">Informações Básicas</h3>
                                    <p className="text-sm font-medium text-muted-foreground">Nome da loja e configuração de visibilidade</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground ml-1">Nome da Loja <span className="text-destructive">*</span></Label>
                                    <Input
                                        {...form.register('name')}
                                        className="bg-muted/30 border-border/50 rounded-xl h-12 px-4 focus-visible:border-primary transition-colors font-medium text-base"
                                        placeholder="Ex: Loja Centro - Matriz"
                                    />
                                    {form.formState.errors.name && (
                                        <p className="text-sm text-destructive font-bold ml-1">{form.formState.errors.name.message}</p>
                                    )}
                                </div>


                            </div>
                        </div>
                    </Card>

                    {/* Descrição */}
                    <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm space-y-8 overflow-visible">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight text-foreground">Descrição</h3>
                                    <p className="text-sm font-medium text-muted-foreground">Fale um pouco sobre a história e diferenciais desta filial</p>
                                </div>
                            </div>

                            <Controller
                                name="description"
                                control={form.control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder="Escreva sobre a loja..."
                                    />
                                )}
                            />
                        </div>
                    </Card>

                    {/* Dados Relevantes */}
                    <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm space-y-8 overflow-visible">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight text-foreground">Dados Relevantes</h3>
                                    <p className="text-sm font-medium text-muted-foreground">Endereço completo, horários de atendimento, telefone, links de mapa, etc</p>
                                </div>
                            </div>

                            <Controller
                                name="relevant_data"
                                control={form.control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder="Ex: Rua das Flores, 123...&#10;Seg a Sex: 08h às 18h..."
                                    />
                                )}
                            />
                        </div>
                    </Card>

                    {/* Imagens */}
                    <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight text-foreground text-2xl">Imagens / Galeria (Até 6)</h3>
                                    <p className="text-sm font-medium text-muted-foreground">Fotos da fachada, interior e produtos da loja</p>
                                </div>
                            </div>

                            <Controller
                                name="images"
                                control={form.control}
                                render={({ field }) => (
                                    <ImageUpload
                                        images={field.value}
                                        mainImage={currentMainImage || ''}
                                        onImagesChange={(urls) => field.onChange(urls)}
                                        onMainImageChange={(url) => setValue('main_image_url', url)}
                                        maxImages={6}
                                        bucket="stores"
                                        folderPath="gallery"
                                    />
                                )}
                            />
                            {form.formState.errors.images && (
                                <p className="text-sm text-destructive font-bold ml-1 mt-2">{form.formState.errors.images.message}</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Coluna Lateral - Visibilidade */}
                <div className="space-y-6">
                    <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <StoreIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight text-foreground">Status</h3>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                                <span className="text-sm font-medium text-foreground">Loja Ativa</span>
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

                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                Quando desativada, a loja não aparecerá na página pública.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Seção Vendedores WhatsApp — só exibe ao editar */}
            {initialData?.id && (
                <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm max-w-5xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight text-foreground">Vendedores WhatsApp</h3>
                                <p className="text-sm font-medium text-muted-foreground">Clientes poderão escolher com quem falar</p>
                            </div>
                        </div>
                        {!addingNew && !editingSeller && (
                            <Button
                                type="button"
                                size="sm"
                                className="rounded-xl gap-2 font-bold"
                                onClick={() => { setAddingNew(true); setSellerForm({ name: '', whatsapp: '' }) }}
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar
                            </Button>
                        )}
                    </div>

                    {/* Formulário inline para novo / editar */}
                    {(addingNew || editingSeller) && (
                        <div className="mb-4 p-4 rounded-2xl border border-border/50 bg-muted/20 space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {editingSeller ? 'Editar vendedor' : 'Novo vendedor'}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground ml-1">Nome <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={sellerForm.name}
                                        onChange={e => setSellerForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="Ex: João Silva"
                                        className="bg-background border-border/50 rounded-xl h-11 font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground ml-1">WhatsApp <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={sellerForm.whatsapp}
                                        onChange={e => setSellerForm(f => ({ ...f, whatsapp: e.target.value }))}
                                        placeholder="5511999999999"
                                        className="bg-background border-border/50 rounded-xl h-11 font-medium"
                                    />
                                    <p className="text-xs text-muted-foreground ml-1">DDI + DDD + número, só dígitos</p>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={handleCancelSeller}>
                                    <X className="w-4 h-4 mr-1" /> Cancelar
                                </Button>
                                <Button type="button" size="sm" className="rounded-xl gap-1 font-bold" onClick={handleSaveSeller} disabled={sellerSaving}>
                                    {sellerSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Salvar
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Lista de vendedores */}
                    {sellersLoading ? (
                        <div className="flex items-center justify-center py-10 text-muted-foreground gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-medium">Carregando...</span>
                        </div>
                    ) : sellers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <Phone className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium">Nenhum vendedor cadastrado</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sellers.map(seller => (
                                <div
                                    key={seller.id}
                                    className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-muted/10 group"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
                                        <MessageCircle className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">{seller.name}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{seller.whatsapp}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Toggle status */}
                                        <button
                                            type="button"
                                            onClick={() => handleToggleSellerStatus(seller)}
                                            className={cn(
                                                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                                                seller.is_active ? "bg-green-500" : "bg-muted"
                                            )}
                                            title={seller.is_active ? 'Ativo' : 'Inativo'}
                                        >
                                            <span className={cn(
                                                "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                                                seller.is_active ? "translate-x-5" : "translate-x-1"
                                            )} />
                                        </button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                                            onClick={() => handleEditSeller(seller)}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDeleteSeller(seller.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </form>
    )
}
