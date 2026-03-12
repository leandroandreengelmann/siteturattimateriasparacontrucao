'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import ProductForm from '@/components/admin/products/product-form'
import { ProductService } from '@/services/product-service'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function EditProductPage() {
    const params = useParams()
    const id = params.id as string
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const data = await ProductService.getProductById(id)
                setProduct(data)
            } catch (error) {
                toast.error('Erro ao carregar produto')
            } finally {
                setLoading(false)
            }
        }
        loadProduct()
    }, [id])

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Buscando dados do produto...</p>
                </div>
            </AdminLayout>
        )
    }

    if (!product) {
        return (
            <AdminLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <p className="text-sm font-medium text-muted-foreground">Produto não encontrado</p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Editar Produto</h1>
                        <p className="text-sm font-medium text-muted-foreground">Atualize as informações de {product.name}</p>
                    </div>
                </div>

                <ProductForm initialData={product} isEditing={true} />
            </div>
        </AdminLayout>
    )
}
