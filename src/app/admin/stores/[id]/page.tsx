'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/components/admin/admin-layout'
import StoreForm from '@/components/admin/stores/store-form'
import { Store, StoresService } from '@/services/store-service'

export default function EditStorePage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const router = useRouter()
    const { id } = use(params)
    const [store, setStore] = useState<Store | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const data = await StoresService.getStoreById(id)
                setStore(data)
            } catch (error) {
                console.error(error)
                toast.error('Erro ao carregar loja')
                router.push('/admin/stores')
            } finally {
                setLoading(false)
            }
        }

        fetchStore()
    }, [id, router])

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        )
    }

    if (!store) {
        return null
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <StoreForm initialData={store} />
            </div>
        </AdminLayout>
    )
}
