import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AboutService } from "@/services/about-service"
import SobreNosPublicClient from "./SobreNosPublicClient"

export const metadata = {
    title: 'Sobre Nós | Turatti',
    description: 'Conheça mais sobre a história, missão e visão da Turatti.',
}

export default async function SobreNosPage() {
    const [settings, images] = await Promise.all([
        AboutService.getSettings(),
        AboutService.getImages()
    ])

    return <SobreNosPublicClient settings={settings} images={images} />
}
