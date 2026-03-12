import { ColorService } from '@/services/color-service'
import AdminLayout from '@/components/admin/admin-layout'
import ColorsClient from './ColorsClient'

export const metadata = {
    title: 'Cores Sunvinil | Admin',
}

export default async function ColorsPage() {
    const [colors, settings] = await Promise.all([
        ColorService.getColors(),
        ColorService.getSettings()
    ])

    return (
        <AdminLayout>
            <ColorsClient
                initialColors={colors}
                initialSettings={settings}
            />
        </AdminLayout>
    )
}
