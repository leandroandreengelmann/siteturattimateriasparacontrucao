"use client"

import React, { useRef, useState, useCallback } from "react"
import { ImagePlus, X, Loader2, UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { UploadService } from "@/services/upload-service"
import { toast } from "sonner"

interface ImageUploadProps {
    images: string[]
    mainImage: string
    onImagesChange: (urls: string[]) => void
    onMainImageChange: (url: string) => void
    maxImages?: number
    bucket?: string
    folderPath?: string
    disabled?: boolean
}

export function ImageUpload({
    images,
    mainImage,
    onImagesChange,
    onMainImageChange,
    maxImages = 10,
    bucket = "product-images",
    folderPath = "products",
    disabled = false
}: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [uploadingFiles, setUploadingFiles] = useState<{ id: string, file: File, progress: number }[]>([])

    // Trata seleção de arquivos (via clique ou drag)
    const handleFiles = async (files: FileList | File[]) => {
        if (disabled) return

        const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'))

        const availableSlots = maxImages - images.length
        if (fileArray.length > availableSlots) {
            toast.error(`Você pode adicionar no máximo ${maxImages} imagens. Vagas restantes: ${availableSlots}`)
            return
        }

        if (fileArray.length === 0) return

        // Adiciona à fila de uploading
        const newUploads = fileArray.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            progress: 0
        }))

        setUploadingFiles(prev => [...prev, ...newUploads])

        // Faz o upload sequencial/paralelo
        for (const uploadItem of newUploads) {
            try {
                // Simula progresso rápido
                setUploadingFiles(prev => prev.map(u => u.id === uploadItem.id ? { ...u, progress: 30 } : u))

                const url = await UploadService.uploadImage(bucket, folderPath, uploadItem.file)

                setUploadingFiles(prev => prev.map(u => u.id === uploadItem.id ? { ...u, progress: 100 } : u))

                // Adiciona a imagem ao final
                onImagesChange([...images, url])

                // Se for a primeira imagem, define como principal
                if (images.length === 0 && !mainImage) {
                    onMainImageChange(url)
                }

                // Remove da fila de uploading
                setTimeout(() => {
                    setUploadingFiles(prev => prev.filter(u => u.id !== uploadItem.id))
                }, 500)

            } catch (error: any) {
                toast.error(`Erro ao enviar ${uploadItem.file.name}: ${error.message}`)
                setUploadingFiles(prev => prev.filter(u => u.id !== uploadItem.id))
            }
        }
    }

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (disabled) return
        setIsDragging(true)
    }, [disabled])

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        if (disabled) return
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
        }
    }, [disabled, images.length]) // eslint-disable-line

    const handleRemove = async (urlToRemove: string) => {
        if (disabled) return

        // Remove from UI first for optimistic update
        const newImages = images.filter(url => url !== urlToRemove)
        onImagesChange(newImages)

        if (mainImage === urlToRemove) {
            onMainImageChange(newImages.length > 0 ? newImages[0] : '')
        }

        // Tenta remover do Supabase Storage em background
        try {
            await UploadService.removeImage(bucket, urlToRemove)
        } catch (error) {
            console.error("Não foi possível excluir fisicamente do storage", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence>
                    {images.map((url, index) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={url}
                            className={cn(
                                "group relative aspect-square rounded-[7px] overflow-hidden border-2 transition-all",
                                mainImage === url && url !== ''
                                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                                    : "border-border/50 hover:border-primary/50"
                            )}
                        >
                            <img
                                src={url}
                                alt={`Produto ${index + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/004EEB/FFFFFF?text=URL+Inválida'
                                }}
                            />

                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex gap-2 justify-between items-center translate-y-2 group-hover:translate-y-0 transition-transform">
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onMainImageChange(url)
                                    }}
                                    className={cn(
                                        "text-xs font-bold uppercase tracking-wider text-white px-3 py-1.5 rounded-lg transition-colors",
                                        mainImage === url ? "bg-primary" : "bg-white/20 hover:bg-white/40"
                                    )}
                                >
                                    Principal
                                </button>

                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handleRemove(url)
                                    }}
                                    className="w-7 h-7 rounded-lg bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 shadow-lg"
                                    title="Remover"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {mainImage === url && url !== '' && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-xs font-semibold text-white uppercase tracking-wider rounded-full shadow-lg border border-white/20">
                                    Principal
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* Mostrando itens em upload */}
                    {uploadingFiles.map((item) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={item.id}
                            className="aspect-square rounded-[7px] border-2 border-dashed border-primary/50 bg-primary/5 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
                        >
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            <span className="text-xs font-semibold text-primary">Enviando...</span>

                            {/* Barra de progresso visual */}
                            <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${item.progress}%` }} />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Dropzone / Upload Botão */}
                {images.length + uploadingFiles.length < maxImages && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={cn(
                            "aspect-square rounded-[7px] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 group",
                            disabled ? "opacity-50 cursor-not-allowed border-border" : "",
                            isDragging
                                ? "border-primary bg-primary/10 scale-105 shadow-lg"
                                : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                            isDragging ? "bg-primary/20" : "bg-muted/50 group-hover:bg-primary/10"
                        )}>
                            <UploadCloud className={cn(
                                "w-5 h-5",
                                isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                            )} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center px-2">
                            {isDragging ? "Solte as fotos" : "Adicionar Fotos"}
                        </span>

                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) handleFiles(e.target.files)
                                // Reseta o targe pra permitir o mesmo arquivo
                                e.target.value = ''
                            }}
                        />
                    </button>
                )}
            </div>

            <p className="text-sm font-medium text-muted-foreground ml-1">
                Suporta JPEG, PNG e WEBP. Até {maxImages} fotos. Arraste e solte ou clique para selecionar.
            </p>
        </div>
    )
}
