'use server'

import { revalidatePath } from 'next/cache'

/**
 * Server Action to manually revalidate a specific path.
 * This is used to clear the Next.js cache when data is updated via the admin panel.
 */
export async function revalidatePage(path: string) {
    try {
        revalidatePath(path)
        return { success: true }
    } catch (error) {
        console.error('Revalidation error:', error)
        return { success: false, error }
    }
}
