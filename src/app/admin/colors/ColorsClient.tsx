'use client'

import React, { useState, useTransition, useRef } from 'react'
import { Palette, Plus, Pencil, Trash2, Eye, EyeOff, Check, X, Upload, Link, ImagePlus, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { SunvinilColor, SunvinilColorImage, InsertSunvinilColor } from '@/services/color-service'

// ---- Helpers ----
function getContrastColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return lum > 0.55 ? '#1A1A1A' : '#FFFFFF'
}

interface ColorForm {
    name: string
    hex_code: string
    code: string
    link_url: string
    is_active: boolean
    display_order: number
}

const emptyForm: ColorForm = {
    name: '',
    hex_code: '#005CA9',
    code: '',
    link_url: '',
    is_active: true,
    display_order: 0,
}

interface ColorsClientProps {
    initialColors: SunvinilColor[]
    initialSettings: { section_title: string }
}

export default function ColorsClient({ initialColors, initialSettings }: ColorsClientProps) {
    const [colors, setColors] = useState<SunvinilColor[]>(initialColors)
    const [sectionTitle, setSectionTitle] = useState(initialSettings.section_title)
    const [isSavingTitle, setIsSavingTitle] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState<ColorForm>(emptyForm)
    const [error, setError] = useState<string | null>(null)

    // Image upload state — per color being edited
    const [uploadingColorId, setUploadingColorId] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleField = (key: keyof ColorForm, value: string | boolean | number) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
        setShowForm(false)
        setError(null)
    }

    const handleEdit = (color: SunvinilColor) => {
        setForm({
            name: color.name,
            hex_code: color.hex_code,
            code: color.code ?? '',
            link_url: color.link_url ?? '',
            is_active: color.is_active,
            display_order: color.display_order,
        })
        setEditingId(color.id)
        setShowForm(true)
        setUploadingColorId(color.id)
    }

    const handleSave = async () => {
        if (!form.name.trim() || !form.hex_code) {
            setError('Nome e cor são obrigatórios.')
            return
        }

        startTransition(async () => {
            try {
                const { ColorService } = await import('@/services/color-service')
                const payload: InsertSunvinilColor = {
                    name: form.name.trim(),
                    hex_code: form.hex_code,
                    code: form.code.trim() || null,
                    link_url: form.link_url.trim() || null,
                    is_active: form.is_active,
                    display_order: Number(form.display_order) || 0,
                }

                if (editingId) {
                    const updated = await ColorService.updateColor(editingId, payload)
                    setColors(prev => prev.map(c => c.id === editingId ? { ...updated, images: c.images } : c))
                    setUploadingColorId(editingId)
                } else {
                    const created = await ColorService.addColor(payload)
                    setColors(prev => [...prev, { ...created, images: [] }])
                    setUploadingColorId(created.id)
                }

                setEditingId(null)
                setShowForm(false)
                setError(null)
            } catch {
                setError('Erro ao salvar. Tente novamente.')
            }
        })
    }

    const handleToggleActive = (color: SunvinilColor) => {
        startTransition(async () => {
            try {
                const { ColorService } = await import('@/services/color-service')
                const updated = await ColorService.updateColor(color.id, { is_active: !color.is_active })
                setColors(prev => prev.map(c => c.id === color.id ? { ...updated, images: c.images } : c))
            } catch {
                setError('Erro ao alterar status.')
            }
        })
    }

    const handleDelete = (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta cor?')) return
        startTransition(async () => {
            try {
                const { ColorService } = await import('@/services/color-service')
                await ColorService.deleteColor(id)
                setColors(prev => prev.filter(c => c.id !== id))
            } catch {
                setError('Erro ao excluir.')
            }
        })
    }

    // Image upload
    const handleImageUpload = async (colorId: string, file: File, currentImages: SunvinilColorImage[]) => {
        if (currentImages.length >= 3) {
            setError('Máximo de 3 imagens por cor.')
            return
        }
        setIsUploading(true)
        try {
            const { ColorService } = await import('@/services/color-service')
            const newImage = await ColorService.addColorImage(colorId, file, currentImages.length)
            setColors(prev => prev.map(c =>
                c.id === colorId
                    ? { ...c, images: [...(c.images || []), newImage] }
                    : c
            ))
        } catch {
            setError('Erro ao fazer upload da imagem.')
        } finally {
            setIsUploading(false)
        }
    }

    const handleImageDelete = async (colorId: string, imageId: string, imageUrl: string) => {
        startTransition(async () => {
            try {
                const { ColorService } = await import('@/services/color-service')
                await ColorService.deleteColorImage(imageId, imageUrl)
                setColors(prev => prev.map(c =>
                    c.id === colorId
                        ? { ...c, images: (c.images || []).filter(img => img.id !== imageId) }
                        : c
                ))
            } catch {
                setError('Erro ao excluir imagem.')
            }
        })
    }

    const handleSaveTitle = async () => {
        setIsSavingTitle(true)
        try {
            const { ColorService } = await import('@/services/color-service')
            await ColorService.updateSettings(sectionTitle)
        } catch {
            setError('Erro ao salvar título da seção.')
        } finally {
            setIsSavingTitle(false)
        }
    }

    // The color card currently expanded for image management
    const expandedColor = colors.find(c => c.id === uploadingColorId)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[300px]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Palette className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Paleta Sunvinil</h1>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-4 flex items-end gap-3 max-w-2xl">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Título da Seção (Home)</label>
                            <Input
                                type="text"
                                value={sectionTitle}
                                onChange={(e) => setSectionTitle(e.target.value)}
                                className="w-full rounded-lg"
                                placeholder="Título da seção de cores..."
                            />
                        </div>
                        <button
                            onClick={handleSaveTitle}
                            disabled={isSavingTitle}
                            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            {isSavingTitle ? 'Salvando...' : 'Atualizar Título'}
                        </button>
                    </div>
                </div>
                <div className="flex items-end self-end mb-1">
                    <button
                        onClick={() => { resetForm(); setShowForm(true); setUploadingColorId(null) }}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Cor
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Edit / Create Form */}
            {showForm && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
                    <h2 className="text-xl font-bold text-foreground">{editingId ? 'Editar Cor' : 'Nova Cor'}</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome *</label>
                            <Input
                                type="text"
                                value={form.name}
                                onChange={e => handleField('name', e.target.value)}
                                placeholder="Ex: Azul Royal"
                                className="w-full rounded-xl py-2.5"
                            />
                        </div>

                        {/* Hex + Color Picker */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cor *</label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl border border-border flex-shrink-0" style={{ backgroundColor: form.hex_code }} />
                                <Input
                                    type="text"
                                    value={form.hex_code}
                                    onChange={e => handleField('hex_code', e.target.value)}
                                    placeholder="#005CA9"
                                    className="flex-1 rounded-xl py-2.5 font-mono"
                                />
                                <input
                                    type="color"
                                    value={form.hex_code}
                                    onChange={e => handleField('hex_code', e.target.value)}
                                    className="w-10 h-10 rounded-xl border border-border cursor-pointer p-0.5 bg-transparent"
                                    title="Escolher cor"
                                />
                            </div>
                        </div>

                        {/* Code */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Código Catálogo</label>
                            <Input
                                type="text"
                                value={form.code}
                                onChange={e => handleField('code', e.target.value)}
                                placeholder="Ex: SV-042"
                                className="w-full rounded-xl py-2.5 font-mono"
                            />
                        </div>

                        {/* Link URL */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                <Link className="w-3 h-3" />
                                Link (opcional)
                            </label>
                            <Input
                                type="text"
                                value={form.link_url}
                                onChange={e => handleField('link_url', e.target.value)}
                                placeholder="Ex: /produtos/sunvinil-azul"
                                className="w-full rounded-xl py-2.5"
                            />
                        </div>

                        {/* Order */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ordem de exibição</label>
                            <Input
                                type="number"
                                value={form.display_order}
                                onChange={e => handleField('display_order', Number(e.target.value))}
                                min={0}
                                className="w-full rounded-xl py-2.5"
                            />
                        </div>
                    </div>

                    {/* Active toggle */}
                    <label className="flex items-center gap-3 cursor-pointer w-fit" onClick={() => handleField('is_active', !form.is_active)}>
                        <div
                            className="relative flex items-center rounded-full transition-colors duration-200 px-0.5"
                            style={{ width: 40, height: 22, backgroundColor: form.is_active ? 'var(--primary)' : 'var(--muted)' }}
                        >
                            <span
                                className="bg-white rounded-full shadow-sm transition-transform duration-200"
                                style={{ width: 16, height: 16, transform: form.is_active ? 'translateX(18px)' : 'translateX(0)' }}
                            />
                        </div>
                        <span className="text-sm font-medium text-foreground">{form.is_active ? 'Ativo' : 'Inativo'}</span>
                    </label>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            {isPending ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                            onClick={resetForm}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors border border-border"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Image Management Panel (shown when a color is selected) */}
            {uploadingColorId && expandedColor && !showForm && (
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg border border-border" style={{ backgroundColor: expandedColor.hex_code }} />
                            <div>
                                <p className="text-sm font-bold text-foreground">{expandedColor.name}</p>
                                <p className="text-xs text-muted-foreground">Imagens das latas ({(expandedColor.images || []).length}/3)</p>
                            </div>
                        </div>
                        <button onClick={() => setUploadingColorId(null)} className="text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Image grid */}
                    <div className="flex gap-3 flex-wrap">
                        {(expandedColor.images || []).map(img => (
                            <div key={img.id} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border group">
                                <img src={img.image_url} alt="Lata" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => handleImageDelete(expandedColor.id, img.id, img.image_url)}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {/* Upload slot */}
                        {(expandedColor.images || []).length < 3 && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                            >
                                {isUploading
                                    ? <Loader2 className="w-5 h-5 animate-spin" />
                                    : <><ImagePlus className="w-5 h-5" /><span className="text-[10px] font-semibold">Adicionar</span></>
                                }
                            </button>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(expandedColor.id, file, expandedColor.images || [])
                            e.target.value = ''
                        }}
                    />

                    <p className="text-xs text-muted-foreground">JPG, PNG ou WebP · máx. 5 MB · até 3 imagens</p>
                </div>
            )}

            {/* Color Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {colors.map(color => {
                    const text = getContrastColor(color.hex_code)
                    const hasImages = (color.images || []).length > 0
                    const hasLink = !!color.link_url
                    const isExpanded = uploadingColorId === color.id

                    return (
                        <div
                            key={color.id}
                            className={`group relative rounded-2xl overflow-hidden border transition-all ${isExpanded ? 'ring-2 ring-primary ring-offset-2' : 'ring-0'
                                } ${color.is_active ? 'border-transparent' : 'border-border opacity-60'}`}
                            style={{ aspectRatio: '1/1' }}
                        >
                            {/* Background */}
                            <div className="absolute inset-0" style={{ backgroundColor: color.hex_code }} />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

                            {/* Badges top */}
                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                                {!color.is_active && (
                                    <span className="bg-black/40 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">Inativo</span>
                                )}
                                {hasImages && (
                                    <span
                                        className="ml-auto text-[9px] font-bold rounded-full px-1.5 py-0.5"
                                        style={{ backgroundColor: text === '#FFFFFF' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.45)', color: text }}
                                    >
                                        📷 {(color.images || []).length}
                                    </span>
                                )}
                                {hasLink && (
                                    <span
                                        className="text-[9px] font-bold rounded-full px-1.5 py-0.5"
                                        style={{ backgroundColor: text === '#FFFFFF' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.45)', color: text }}
                                    >
                                        🔗
                                    </span>
                                )}
                            </div>

                            {/* Code */}
                            {color.code && (
                                <span
                                    className="absolute bottom-8 right-2 text-[10px] font-bold opacity-70"
                                    style={{ color: text }}
                                >
                                    {color.code}
                                </span>
                            )}

                            {/* Name badge */}
                            <div
                                className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-center"
                                style={{
                                    backgroundColor: text === '#FFFFFF' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)',
                                    backdropFilter: 'blur(6px)',
                                }}
                            >
                                <span className="text-[11px] font-bold leading-tight block truncate" style={{ color: text }}>
                                    {color.name}
                                </span>
                            </div>

                            {/* Hover actions overlay */}
                            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => handleEdit(color)}
                                        className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-lg flex items-center justify-center text-white transition-colors"
                                        title="Editar"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setUploadingColorId(isExpanded ? null : color.id)}
                                        className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-lg flex items-center justify-center text-white transition-colors"
                                        title="Gerenciar Imagens"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(color)}
                                        className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-lg flex items-center justify-center text-white transition-colors"
                                        title={color.is_active ? 'Desativar' : 'Ativar'}
                                    >
                                        {color.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(color.id)}
                                        className="w-8 h-8 bg-red-500/50 hover:bg-red-500/70 rounded-lg flex items-center justify-center text-white transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {colors.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <Palette className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhuma cor cadastrada. Clique em <strong>Nova Cor</strong> para começar.</p>
                </div>
            )}
        </div>
    )
}
