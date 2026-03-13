'use client'

import React, { useEffect, useState, useRef } from 'react'
import { ImageCarouselService, HomeImageCarousel } from '@/services/image-carousel-service'
import { UploadService } from '@/services/upload-service'
import { toast } from 'sonner'
import { revalidatePage } from '@/app/actions/revalidate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Image as ImageIcon, Link as LinkIcon, ArrowUp, ArrowDown, Eye, EyeOff, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'

export default function ImageCarouselAdmin() {
    const [images, setImages] = useState<HomeImageCarousel[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [newLink, setNewLink] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const loadImages = async () => {
        try {
            const data = await ImageCarouselService.getImages()
            setImages(data)
        } catch (error) {
            toast.error('Erro ao carregar imagens do carrossel')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadImages()
    }, [])

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione um arquivo de imagem válido')
            return
        }

        setIsUploading(true)
        try {
            const imageUrl = await UploadService.uploadImage('product-images', 'home-carousel', file)
            
            await ImageCarouselService.addImage({
                image_url: imageUrl,
                link_url: newLink || null,
                is_active: true,
                display_order: images.length + 1
            })

            toast.success('Imagem adicionada com sucesso!')
            setNewLink('')
            if (fileInputRef.current) fileInputRef.current.value = ''
            await loadImages()
            await revalidatePage('/')

        } catch (error) {
            console.error(error)
            toast.error('Erro ao fazer upload da imagem')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async (id: string, url: string) => {
        if (!confirm('Tem certeza que deseja remover esta imagem?')) return

        try {
            await ImageCarouselService.deleteImage(id)
            await UploadService.removeImage('product-images', url)
            toast.success('Imagem removida com sucesso')
            await loadImages()
            await revalidatePage('/')
        } catch (error) {
            console.error(error)
            toast.error('Erro ao remover imagem')
        }
    }

    const handleToggleActive = async (id: string, currentState: boolean) => {
        try {
            await ImageCarouselService.updateImage(id, { is_active: !currentState })
            toast.success(currentState ? 'Imagem desativada' : 'Imagem ativada')
            setImages(images.map(img => img.id === id ? { ...img, is_active: !currentState } : img))
            await revalidatePage('/')
        } catch (error) {
            toast.error('Erro ao alterar status')
        }
    }

    const handleUpdateLink = async (id: string, link: string) => {
        try {
            await ImageCarouselService.updateImage(id, { link_url: link })
            toast.success('Link atualizado')
            await revalidatePage('/')
        } catch (error) {
            toast.error('Erro ao atualizar link')
        }
    }

    const moveImage = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === images.length - 1) return

        const newImages = [...images]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        
        // Swap
        const temp = newImages[index]
        newImages[index] = newImages[targetIndex]
        newImages[targetIndex] = temp

        // Update local state temporarily for snappy UI
        setImages(newImages)

        // Prepare bulk update array matching new positions to display_order
        const updates = newImages.map((img, i) => ({
            id: img.id,
            display_order: i + 1
        }))

        try {
            await ImageCarouselService.updateOrder(updates)
            toast.success('Ordem atualizada')
            await revalidatePage('/')
        } catch (error) {
            toast.error('Erro ao atualizar a ordem')
            loadImages() // revert on fail
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Carrossel de Imagens</h1>
                        <p className="text-sm font-medium text-muted-foreground">Adicione e gerencie imagens para o carrossel da página inicial.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add New Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-border/50 shadow-sm overflow-hidden sticky top-32">
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Link Opcional (URL)</Label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="/produtos?filter=promo" 
                                                className="pl-9 bg-muted/30"
                                                value={newLink}
                                                onChange={(e) => setNewLink(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Para onde o usuário vai ao clicar na nova imagem.</p>
                                    </div>
                                    
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                    <Button 
                                        onClick={() => fileInputRef.current?.click()} 
                                        disabled={isUploading}
                                        className="w-full gap-2 rounded-xl h-12"
                                    >
                                        {isUploading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Adicionar Nova Imagem
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-2 space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : images.length === 0 ? (
                            <div className="text-center p-12 bg-muted/30 rounded-2xl border border-dashed border-border">
                                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold text-foreground">Ainda não há imagens</h3>
                                <p className="text-sm text-muted-foreground">Adicione sua primeira imagem ao lado.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {images.map((img, index) => (
                                    <Card key={img.id} className={`overflow-hidden transition-all ${!img.is_active ? 'opacity-70 grayscale-[50%]' : ''}`}>
                                        <CardContent className="p-0 flex flex-col sm:flex-row">
                                            <div className="w-full sm:w-48 h-32 relative shrink-0">
                                                <img 
                                                    src={img.image_url} 
                                                    alt="Carousel item" 
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            </div>
                                            
                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant={img.is_active ? 'default' : 'secondary'}>
                                                            {img.is_active ? 'Ativa' : 'Inativa'}
                                                        </Badge>
                                                        <div className="flex items-center gap-1">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8"
                                                                onClick={() => moveImage(index, 'up')}
                                                                disabled={index === 0}
                                                            >
                                                                <ArrowUp className="w-4 h-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8"
                                                                onClick={() => moveImage(index, 'down')}
                                                                disabled={index === images.length - 1}
                                                            >
                                                                <ArrowDown className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <Input 
                                                            value={img.link_url || ''}
                                                            placeholder="Ex: /colecao-verao"
                                                            className="h-9 text-sm"
                                                            onChange={(e) => {
                                                                const newImages = [...images]
                                                                newImages[index] = { ...img, link_url: e.target.value }
                                                                setImages(newImages)
                                                            }}
                                                            onBlur={(e) => {
                                                                handleUpdateLink(img.id, e.target.value)
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-muted-foreground gap-2"
                                                        onClick={() => handleToggleActive(img.id, img.is_active)}
                                                    >
                                                        {img.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        {img.is_active ? 'Ocultar' : 'Mostrar'}
                                                    </Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm" 
                                                        className="gap-2"
                                                        onClick={() => handleDelete(img.id, img.image_url)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Remover
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
