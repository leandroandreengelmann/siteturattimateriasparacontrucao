import AdminLayout from '@/components/admin/admin-layout'
import { SettingsService } from '@/services/settings-service'
import SettingsClient from './SettingsClient'

export const metadata = {
    title: 'Configurações do Site | Admin Turatti',
}

export default async function SettingsPage() {
    const settings = await SettingsService.getSettings()

    return (
        <AdminLayout>
            <SettingsClient initialSettings={settings} />
        </AdminLayout>
    )
}
