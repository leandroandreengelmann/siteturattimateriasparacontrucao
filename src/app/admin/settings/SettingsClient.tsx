'use client'

import React, { useState } from 'react'
import { SiteSettings, SettingsService, StoreContact } from '@/services/settings-service'
import { toast } from 'sonner'
import {
    Save,
    Instagram,
    Facebook,
    Phone,
    MessageSquare,
    Clock,
    Loader2,
    Globe,
    Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface SettingsClientProps {
    initialSettings: SiteSettings
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
    const [settings, setSettings] = useState<SiteSettings>(initialSettings)
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        try {
            setLoading(true)
            await SettingsService.updateSettings(settings)
            toast.success('Configurações atualizadas com sucesso!')
        } catch (error) {
            console.error(error)
            toast.error('Erro ao atualizar configurações')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: keyof SiteSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }))
    }

    const handleStoreChange = (index: number, field: keyof StoreContact, value: string) => {
        setSettings(prev => {
            const newContacts = [...prev.store_contacts]
            newContacts[index] = { ...newContacts[index], [field]: value }
            return { ...prev, store_contacts: newContacts }
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Globe className="w-8 h-8 text-primary" />
                        Configurações de Rodapé
                    </h1>
                    <p className="text-muted-foreground mt-1">Gerencie as informações globais e links do rodapé</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="rounded-xl font-bold tracking-tight gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    size="lg"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Salvar Alterações
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Social Media Section */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/5 hover:border-primary/20 transition-all duration-300">
                    <CardHeader className="border-b border-border/50 pb-6">
                        <CardTitle className="text-xl">Redes sociais</CardTitle>
                        <CardDescription>Links para as redes sociais oficiais da Turatti</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="instagram" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Url instagram</Label>
                            <Input
                                id="instagram"
                                value={settings.instagram_url}
                                onChange={(e) => handleChange('instagram_url', e.target.value)}
                                className="h-12 bg-muted/30 border-border/50 focus:border-primary rounded-xl"
                                placeholder="https://instagram.com/turatti"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="facebook" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Url facebook</Label>
                            <Input
                                id="facebook"
                                value={settings.facebook_url}
                                onChange={(e) => handleChange('facebook_url', e.target.value)}
                                className="h-12 bg-muted/30 border-border/50 focus:border-primary rounded-xl"
                                placeholder="https://facebook.com/turatti"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whatsapp" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Link whatsapp</Label>
                            <Input
                                id="whatsapp"
                                value={settings.whatsapp}
                                onChange={(e) => handleChange('whatsapp', e.target.value)}
                                className="h-12 bg-muted/30 border-border/50 focus:border-primary rounded-xl"
                                placeholder="https://wa.me/55..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Stores Contact Section */}
                <div className="space-y-8">
                    {settings.store_contacts.map((store, index) => (
                        <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/5 hover:border-primary/20 transition-all duration-300">
                            <CardHeader className="border-b border-border/50 pb-6">
                                <CardTitle className="text-xl">Contato e Atendimento - {store.name || `Loja ${index + 1}`}</CardTitle>
                                <CardDescription>Informações de contato para a {store.name || `Loja ${index + 1}`}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nome da loja</Label>
                                    <Input
                                        value={store.name}
                                        onChange={(e) => handleStoreChange(index, 'name', e.target.value)}
                                        className="h-12 bg-muted/30 border-border/50 focus:border-primary rounded-xl"
                                        placeholder="Ex: Loja de Matupá"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Telefone</Label>
                                    <Input
                                        value={store.phone}
                                        onChange={(e) => handleStoreChange(index, 'phone', e.target.value)}
                                        className="h-12 bg-muted/30 border-border/50 focus:border-primary rounded-xl"
                                        placeholder="(00) 0000-0000"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Segunda a sexta</Label>
                                        <Input
                                            value={store.weekday_hours}
                                            onChange={(e) => handleStoreChange(index, 'weekday_hours', e.target.value)}
                                            className="h-12 bg-muted/30 border-border/50 focus:border-primary rounded-xl"
                                            placeholder="Ex: 07:30 - 18:00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sábado</Label>
                                        <Input
                                            value={store.saturday_hours}
                                            onChange={(e) => handleStoreChange(index, 'saturday_hours', e.target.value)}
                                            className="h-12 bg-muted/30 border-border/50 focus:border-primary rounded-xl"
                                            placeholder="Ex: 07:30 - 12:00"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {settings.store_contacts.length < 2 && (
                        <Button
                            variant="outline"
                            className="w-full h-12 border-dashed rounded-xl"
                            onClick={() => setSettings(prev => ({
                                ...prev,
                                store_contacts: [...prev.store_contacts, { name: '', phone: '', weekday_hours: '', saturday_hours: '' }]
                            }))}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Adicionar outra loja
                        </Button>
                    )}
                </div>
            </div>

            <div className="pt-4 flex justify-end items-center gap-4 border-t border-border/20">
                <p className="text-xs text-muted-foreground italic">Última atualização: {new Date(settings.updated_at).toLocaleString('pt-BR')}</p>
            </div>
        </div>
    )
}
