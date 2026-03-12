'use client'

import React from 'react'
import AdminLayout from '@/components/admin/admin-layout'
import ProductForm from '@/components/admin/products/product-form'

export default function NewProductPage() {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Novo Produto</h1>
                        <p className="text-sm font-medium text-muted-foreground">Cadastre um novo item no catálogo do site</p>
                    </div>
                </div>

                <ProductForm />
            </div>
        </AdminLayout>
    )
}
