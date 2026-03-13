'use client'

import React, { useState, useRef, useTransition } from 'react'
import { Layers, Check, ImagePlus, Loader2, Trash2, GripVertical, AlertCircle } from 'lucide-react'
import RichTextEditor from '@/components/ui/rich-text-editor'
import { AboutService, type AboutSettings, type AboutImage } from '@/services/about-service'
import { toast } from 'sonner'
import { revalidatePage } from '@/app/actions/revalidate'
import { motion, Reorder } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SobreNosClientProps {
    initialSettings: AboutSettings
    initialImages: AboutImage[]
}

export default function SobreNosClient({ initialSettings, initialImages }: SobreNosClientProps) {
    const [content, setContent] = useState(initialSettings.content || '')
    const [images, setImages] = useState<AboutImage[]>(initialImages)
    const [isSavingTexts, setIsSavingTexts] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isReordering, setIsReordering] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isPending, startTransition] = useTransition()

    const handleSaveContent = async () => {
        setIsSavingTexts(true)
        try {
            await AboutService.updateSettings(content)
            toast.success('Conteúdo salvo com sucesso!')
            await revalidatePage('/sobre-nos')
        } catch (error) {
            toast.error('Erro ao salvar o conteúdo')
        } finally {
            setIsSavingTexts(false)
        }
    }

    const handleImageUpload = async (file: File) => {
        if (images.length >= 5) {
            toast.error('Limite máximo de 5 imagens atingido')
            return
        }

        setIsUploading(true)
        try {
            const newImage = await AboutService.addImage(file, images.length)
            setImages(prev => [...prev, newImage])
            toast.success('Imagem adicionada!')
            await revalidatePage('/sobre-nos')
        } catch (error) {
            toast.error('Erro ao fazer upload da imagem')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDeleteImage = async (id: string, url: string) => {
        if (!confirm('Tem certeza que deseja remover esta imagem?')) return

        startTransition(async () => {
            try {
                await AboutService.deleteImage(id, url)
                setImages(prev => prev.filter(img => img.id !== id))
                toast.success('Imagem removida')
                await revalidatePage('/sobre-nos')
            } catch (error) {
                toast.error('Erro ao excluir a imagem')
            }
        })
    }

    const handleReorder = async (newOrder: AboutImage[]) => {
        setImages(newOrder)
        setIsReordering(true)

        try {
            const updates = newOrder.map((img, idx) => ({ id: img.id, display_order: idx }))
            await AboutService.updateImageOrders(updates)
            await revalidatePage('/sobre-nos')
        } catch (error) {
            toast.error('Erro ao salvar a nova ordem')
        } finally {
            setIsReordering(false)
        }
    }

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Página Sobre Nós</h1>
                    <p className="text-muted-foreground font-medium">Gerencie o texto e a galeria de fotos da página</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Editor Section */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Conteúdo da Página</h2>
                            <button
                                onClick={handleSaveContent}
                                disabled={isSavingTexts}
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                            >
                                {isSavingTexts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Salvar Texto
                            </button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Utilize o editor abaixo para formatar a história da empresa, missão e visão.
                        </p>

                        <div className="min-h-[400px]">
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                                placeholder="Escreva a história da empresa aqui..."
                            />
                        </div>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-24">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold mb-1">Galeria Mosaico</h2>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Fotos p/ destaque ({images.length}/5)</p>
                                {isReordering && <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />}
                            </div>
                        </div>

                        {images.length === 5 && (
                            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-amber-700 dark:text-amber-400">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <p className="text-xs font-medium">Limite de 5 fotos atingido. Remova uma para adicionar outra.</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <Reorder.Group axis="y" values={images} onReorder={handleReorder} className="space-y-3">
                                {images.map((img) => (
                                    <Reorder.Item key={img.id} value={img} className="relative group">
                                        <div className="flex items-center gap-3 p-2 border border-border rounded-xl bg-background hover:border-primary/40 transition-colors cursor-grab active:cursor-grabbing">
                                            <div className="text-muted-foreground/50 hover:text-foreground p-1">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border/50 bg-muted">
                                                <img src={img.image_url} alt="Galeria" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1" />
                                            <button
                                                onClick={() => handleDeleteImage(img.id, img.image_url)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                                title="Remover"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>

                            {/* Upload Area */}
                            {images.length < 5 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-full p-6 border-2 border-dashed border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary flex flex-col items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span className="text-sm font-semibold">Enviando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <ImagePlus className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-semibold">Adicionar Foto</span>
                                        </>
                                    )}
                                </button>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (file) await handleImageUpload(file)
                                    e.target.value = ''
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
