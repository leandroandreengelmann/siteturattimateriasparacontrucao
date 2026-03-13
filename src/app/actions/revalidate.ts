'use server'

import { revalidatePath } from 'next/cache'

/**
 * Revalidates a specific page path.
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

/**
 * Revalidates all pages under a path (including dynamic sub-routes like [slug]).
 * Use this for sections with dynamic routes.
 */
export async function revalidateLayout(path: string) {
    try {
        revalidatePath(path, 'layout')
        return { success: true }
    } catch (error) {
        console.error('Revalidation error:', error)
        return { success: false, error }
    }
}
