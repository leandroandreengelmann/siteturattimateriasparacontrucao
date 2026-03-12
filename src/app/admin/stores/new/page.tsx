import StoreForm from '@/components/admin/stores/store-form'
import AdminLayout from '@/components/admin/admin-layout'

export default function NewStorePage() {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <StoreForm />
            </div>
        </AdminLayout>
    )
}
