import AdminLayout from '@/components/admin/admin-layout'
import SobreNosClient from './SobreNosClient'
import { AboutService } from '@/services/about-service'

export const metadata = {
    title: 'Sobre Nós | Admin Turatti',
}

export default async function SobreNosPage() {
    const [settings, images] = await Promise.all([
        AboutService.getSettings(),
        AboutService.getImages()
    ])

    return (
        <AdminLayout>
            <SobreNosClient initialSettings={settings} initialImages={images} />
        </AdminLayout>
    )
}
