'use client'

import React, { useState, useRef } from 'react'
import { FixedBannerService, type FixedBannerSettings } from '@/services/fixed-banner-service'
import { toast } from 'sonner'
import { Image as ImageIcon, Save, Trash2, Link as LinkIcon, Upload } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BannerFixoClientProps {
    initialSettings: FixedBannerSettings
}

export default function BannerFixoClient({ initialSettings }: BannerFixoClientProps) {
    const [settings, setSettings] = useState(initialSettings)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialSettings.image_url)
    const [isSaving, setIsSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleDeleteImage = async () => {
        if (!confirm('Tem certeza que deseja remover esta imagem? Desta forma o banner ficará inativo na home.')) return

        setIsSaving(true)
        try {
            await FixedBannerService.deleteBannerImage()
            setSettings({ ...settings, image_url: null, is_active: false })
            setPreviewUrl(null)
            setImageFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
            toast.success('Imagem removida com sucesso')
        } catch (error) {
            toast.error('Erro ao remover imagem')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSave = async () => {
        if (settings.is_active && !previewUrl) {
            toast.error('O banner não pode ficar ativo sem uma imagem!')
            return
        }

        setIsSaving(true)
        try {
            await FixedBannerService.updateSettings(
                {
                    is_active: settings.is_active,
                    link_url: settings.link_url
                },
                imageFile
            )
            toast.success('Configurações do banner salvas com sucesso!')
            const updated = await FixedBannerService.getSettings()
            setSettings(updated)
            setImageFile(null) // Reset pending file as it's uploaded
        } catch (error) {
            toast.error('Erro ao salvar as configurações')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Banner Fixo da Home</h1>
                    <p className="text-muted-foreground font-medium">Gerencie o banner exibido entre os carrosséis na página inicial</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm space-y-10">

                {/* Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-8">
                    <div className="space-y-1">
                        <Label className="text-base font-semibold text-foreground">Status do Banner</Label>
                        <p className="text-sm text-muted-foreground">Define se o banner será exibido na página inicial ou não.</p>
                    </div>
                    <div>
                        <button
                            onClick={() => setSettings({ ...settings, is_active: !settings.is_active })}
                            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${settings.is_active ? 'bg-primary' : 'bg-muted-foreground/30'
                                }`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.is_active ? 'translate-x-[12px]' : '-translate-x-[12px]'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Link */}
                <div className="space-y-4 border-b border-border/50 pb-8">
                    <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" /> Link de Redirecionamento (Opcional)
                    </Label>
                    <p className="text-sm text-muted-foreground">URL para onde o cliente será redirecionado ao clicar no banner.</p>
                    <Input
                        placeholder="Ex: /produtos?filter=promo ou https://google.com"
                        value={settings.link_url || ''}
                        onChange={(e) => setSettings({ ...settings, link_url: e.target.value })}
                        className="max-w-xl"
                    />
                </div>

                {/* Imagem */}
                <div className="space-y-6">
                    <div>
                        <Label className="text-base font-semibold text-foreground">Imagem do Banner</Label>
                        <p className="text-sm text-muted-foreground mt-1">Recomendamos uma imagem retangular (ex: 1200x300px). Na home ela irá se adaptar sem sofrer distorções.</p>
                    </div>

                    {previewUrl ? (
                        <div className="relative group rounded-2xl overflow-hidden border-2 border-border max-h-[300px] w-full bg-muted">
                            <img src={previewUrl} alt="Preview do Banner" className="w-full h-full object-cover aspect-[21/9]" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                <Button variant="destructive" onClick={handleDeleteImage}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remover Imagem
                                </Button>
                                <span className="text-white/70 text-sm">Não esqueça de Salvar após remover ou trocar.</span>
                            </div>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                            <ImageIcon className="w-12 h-12 mb-4 opacity-50 text-primary" />
                            <p className="font-semibold text-foreground">Nenhuma imagem configurada no momento</p>
                            <p className="text-sm mb-6 mt-1 text-center max-w-sm">Para ativar o banner, você deve enviar uma imagem promocional ou aviso.</p>

                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-4 h-4 mr-2" />
                                Escolher Arquivo
                            </Button>
                        </div>
                    )}

                    {previewUrl && (
                        <div className="flex gap-4 items-center">
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-4 h-4 mr-2" />
                                Trocar Imagem
                            </Button>
                            {imageFile && <span className="text-sm text-amber-500 font-medium">Imagem a ser enviada no clique do Salvar...</span>}
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                </div>

                <div className="flex justify-end pt-8">
                    <Button onClick={handleSave} disabled={isSaving} size="lg" className="px-8 font-bold rounded-xl h-12">
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        {!isSaving && <Save className="w-5 h-5 ml-2" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
