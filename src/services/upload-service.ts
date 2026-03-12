import { supabase } from '@/lib/supabase'

export class UploadService {
    /**
     * Faz o upload de um arquivo para o Supabase Storage.
     * @param bucket Nome do bucket (ex: 'product-images')
     * @param path Caminho e nome do arquivo dentro do bucket
     * @param file Ficheiro a ser feito upload
     * @returns A URL pública da imagem recém enviada
     */
    static async uploadImage(bucket: string, path: string, file: File): Promise<string> {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `${path}/${fileName}`

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error('Erro de Upload no Storage:', error)
            throw new Error(`Falha ao fazer upload da imagem: ${error.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

        return publicUrl
    }

    /**
     * Remove um arquivo do storage baseado em sua URL pública.
     * Tenta inferir o caminho relativo a partir da URL.
     */
    static async removeImage(bucket: string, fullUrl: string) {
        try {
            // Extrai o path relativo removendo a URL base pública do Supabase
            const urlParts = fullUrl.split(`/${bucket}/`)
            if (urlParts.length !== 2) return

            const filePath = urlParts[1]

            const { error } = await supabase.storage
                .from(bucket)
                .remove([filePath])

            if (error) {
                console.error('Erro ao remover imagem do storage:', error)
            }
        } catch (err) {
            console.error('Falha ao parsear url para exclusão', err)
        }
    }
}
