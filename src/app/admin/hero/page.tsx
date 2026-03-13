'use client'

import React, { useEffect, useState } from 'react'
import { HeroService, HeroSettings } from '@/services/hero-service'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Save, RefreshCw, Eye, Image as ImageIcon, Sparkles, Layout } from 'lucide-react'
import { DynamicHero } from '@/components/sections/DynamicHero'
import { z } from 'zod'
import AdminLayout from '@/components/admin/admin-layout'
import { motion } from 'framer-motion'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'

export default function AdminHeroPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [previewData, setPreviewData] = useState<HeroSettings | null>(null)

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        resolver: zodResolver(z.object({
            title: z.string().min(1, 'O título é obrigatório'),
            accent_words_input: z.string().optional(),
            accent_words_input_2: z.string().optional(),
            accent_color_1: z.string().default('#004EEB'),
            accent_color_2: z.string().default('#004EEB'),
            subtitle: z.string().optional(),
            button_text: z.string().default('Ver Coleções'),
            button_url: z.string().default('/categories')
        })),
        defaultValues: {
            title: '',
            accent_words_input: '',
            accent_words_input_2: '',
            accent_color_1: '#004EEB',
            accent_color_2: '#004EEB',
            subtitle: '',
            button_text: 'Ver Coleções',
            button_url: '/categories'
        }
    })

    const currentData = watch()

    useEffect(() => {
        async function load() {
            try {
                const data = await HeroService.getHeroSettings()
                reset({
                    title: data.title,
                    accent_words_input: data.accent_words.join(', '),
                    accent_words_input_2: data.accent_words_2.join(', '),
                    accent_color_1: data.accent_color_1,
                    accent_color_2: data.accent_color_2,
                    subtitle: data.subtitle || '',
                    button_text: data.button_text,
                    button_url: data.button_url
                })
                setPreviewData(data)
            } catch (error) {
                toast.error('Erro ao carregar configurações')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [reset])

    const onSubmit = async (data: any) => {
        setIsSaving(true)
        try {
            const formattedData = {
                title: data.title,
                accent_words: data.accent_words_input
                    ? data.accent_words_input.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
                    : [],
                accent_words_2: data.accent_words_input_2
                    ? data.accent_words_input_2.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
                    : [],
                accent_color_1: data.accent_color_1,
                accent_color_2: data.accent_color_2,
                subtitle: data.subtitle || '',
                button_text: data.button_text,
                button_url: data.button_url
            }
            await HeroService.updateHeroSettings(formattedData)
            
            // Revalidar a home para limpar o cache estático
            const { revalidatePage } = await import('@/app/actions/revalidate')
            await revalidatePage('/')

            toast.success('Hero atualizada com sucesso!')
            setPreviewData({ ...formattedData, id: '', updated_at: '' } as HeroSettings)
        } catch (error) {
            console.error('Save error:', error)
            toast.error('Erro ao salvar configurações')
        } finally {
            setIsSaving(false)
        }
    }

    const inputClasses = "w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-4 h-auto text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 transition-all font-semibold"
    const labelClasses = "text-sm font-semibold text-zinc-700 ml-1"

    return (
        <AdminLayout>
            <div className="space-y-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[60vh]">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Banner Hero</h1>
                                <p className="text-sm font-medium text-muted-foreground">Configure o banner principal da sua página inicial.</p>
                            </div>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSaving}
                                size="lg"
                                className="rounded-xl font-black tracking-tight-premium gap-2 shadow-lg shadow-primary/20"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Salvar Alterações
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Form Settings */}
                            <div className="space-y-6">
                                <Card className="border-border/50 shadow-sm overflow-hidden">
                                    <CardHeader className="bg-muted/30 pb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-medium text-foreground">Conteúdo Principal</CardTitle>
                                                <CardDescription className="text-xs text-muted-foreground">Textos e destaques visuais do banner</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-8">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-sm font-medium text-foreground ml-1">Título da Hero</Label>
                                            <Textarea
                                                id="title"
                                                {...register('title')}
                                                placeholder="Ex: Onde o Design Encontra a Alma."
                                                className="min-h-[120px] resize-none bg-muted/30 border-border/50 rounded-xl focus-visible:ring-primary/20 transition-all font-semibold"
                                            />
                                            {errors.title && <p className="text-base text-destructive font-bold ml-1">{errors.title.message as string}</p>}
                                        </div>

                                        <Separator className="bg-border/50" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4 p-5 bg-primary/[0.03] rounded-2xl border border-primary/10">
                                                <div className="flex flex-col gap-2">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Destaque Principal</Label>
                                                    <div className="flex items-center gap-3 bg-background border border-border rounded-xl p-2 pr-4 shadow-sm hover:border-primary/30 transition-all">
                                                        <div
                                                            className="w-10 h-10 rounded-lg border border-border shrink-0 shadow-inner"
                                                            style={{ backgroundColor: currentData.accent_color_1 || '#004EEB' }}
                                                        />
                                                        <div className="flex flex-col flex-1 pl-1">
                                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter leading-none mb-1">Cor Hex</span>
                                                            <Input
                                                                type="text"
                                                                {...register('accent_color_1')}
                                                                className="bg-transparent border-none p-0 h-auto text-sm font-mono font-black text-primary focus-visible:ring-0 w-full uppercase leading-none shadow-none"
                                                                placeholder="#004EEB"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Palavras Chave</Label>
                                                    <Input
                                                        {...register('accent_words_input')}
                                                        placeholder="Ex: Design"
                                                        className="bg-muted/30 border-border/50 rounded-xl h-11 focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-semibold"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4 p-5 bg-muted/30 rounded-2xl border border-border">
                                                <div className="flex flex-col gap-2">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Destaque Secundário</Label>
                                                    <div className="flex items-center gap-3 bg-background border border-border rounded-xl p-2 pr-4 shadow-sm hover:border-muted-foreground/30 transition-all">
                                                        <div
                                                            className="w-10 h-10 rounded-lg border border-border shrink-0 shadow-inner"
                                                            style={{ backgroundColor: currentData.accent_color_2 || '#004EEB' }}
                                                        />
                                                        <div className="flex flex-col flex-1 pl-1">
                                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter leading-none mb-1">Cor Hex</span>
                                                            <Input
                                                                type="text"
                                                                {...register('accent_color_2')}
                                                                className="bg-transparent border-none p-0 h-auto text-sm font-mono font-black text-foreground focus-visible:ring-0 w-full uppercase leading-none shadow-none"
                                                                placeholder="#004EEB"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Palavras Chave</Label>
                                                    <Input
                                                        {...register('accent_words_input_2')}
                                                        placeholder="Ex: Alma"
                                                        className="bg-muted/30 border-border/50 rounded-xl h-11 focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-semibold"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            <Label htmlFor="subtitle" className="text-sm font-medium text-foreground ml-1">Subtítulo (Descrição)</Label>
                                            <Textarea
                                                id="subtitle"
                                                {...register('subtitle')}
                                                placeholder="Breve descrição sobre a coleção ou promoção."
                                                className="min-h-[100px] resize-none bg-muted/30 border-border/50 rounded-xl focus-visible:ring-primary/20 transition-all font-medium"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-border/50 shadow-sm overflow-hidden">
                                    <CardHeader className="bg-muted/30 pb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border">
                                                <Layout className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-medium text-foreground">Chamada para Ação (CTA)</CardTitle>
                                                <CardDescription className="text-xs text-muted-foreground">Configuração do botão principal</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="button_text" className="text-sm font-medium text-foreground ml-1">Texto do Botão</Label>
                                            <Input
                                                id="button_text"
                                                {...register('button_text')}
                                                className="bg-muted/30 border-border/50 rounded-xl h-11 focus-visible:ring-primary/20 focus-visible:border-primary font-bold transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="button_url" className="text-sm font-medium text-foreground ml-1">Link do Botão</Label>
                                            <div className="relative group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono tracking-tighter">/</span>
                                                <Input
                                                    id="button_url"
                                                    {...register('button_url')}
                                                    className="bg-muted/30 border-border/50 rounded-xl h-11 pl-8 focus-visible:ring-primary/20 font-mono text-sm transition-all"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Live Preview */}
                            <div className="space-y-6 lg:sticky lg:top-32 h-fit">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visualização em Tempo Real</span>
                                    </div>
                                    <Badge variant="outline" className="text-sm font-semibold uppercase tracking-wider bg-primary/5 text-primary border-primary/20 px-2">Live</Badge>
                                </div>

                                <div className="bg-muted rounded-[32px] overflow-hidden border border-border shadow-2xl relative h-[600px] flex items-center justify-center bg-card">
                                    <DynamicHero
                                        isPreview
                                        className="w-full h-full"
                                        title={currentData.title || 'Título'}
                                        accentWords={currentData.accent_words_input
                                            ? currentData.accent_words_input.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
                                            : []}
                                        accentWords2={currentData.accent_words_input_2
                                            ? currentData.accent_words_input_2.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
                                            : []}
                                        accentColor1={currentData.accent_color_1}
                                        accentColor2={currentData.accent_color_2}
                                        subtitle={currentData.subtitle || ""}
                                        buttonText={currentData.button_text || ""}
                                        buttonUrl={currentData.button_url || ""}
                                    />
                                </div>

                                <Card className="bg-primary/5 border-primary/10 overflow-hidden rounded-[24px]">
                                    <CardContent className="p-6 flex gap-4 items-start">
                                        <div className="bg-background p-2 rounded-xl text-primary shadow-sm border border-primary/20">
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-primary">Dica de Design</p>
                                            <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                                                O fundo Aurora se adapta automaticamente ao conteúdo. Mantenha os textos centralizados e as palavras de destaque curtas para o melhor impacto visual.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout >
    )
}
