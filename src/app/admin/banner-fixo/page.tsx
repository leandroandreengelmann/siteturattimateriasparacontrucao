import { FixedBannerService } from "@/services/fixed-banner-service"
import BannerFixoClient from "./BannerFixoClient"
import AdminLayout from '@/components/admin/admin-layout'

export const metadata = {
    title: 'Gerenciar Banner Fixo | Admin Turatti',
    description: 'Gerenciamento do banner fixo da página inicial.',
}

export default async function BannerFixoAdmin() {
    const settings = await FixedBannerService.getSettings()

    return (
        <AdminLayout>
            <div className="p-8">
                <BannerFixoClient initialSettings={settings} />
            </div>
        </AdminLayout>
    )
}
