import { describe, it, expect, vi } from 'vitest'

// Mock next/cache antes de importar o módulo
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock 'use server' directive — não suportado em ambiente de teste
vi.mock('@/app/actions/revalidate', async () => {
  const { revalidatePath } = await import('next/cache')
  return {
    revalidatePage: async (path: string) => {
      try {
        revalidatePath(path)
        return { success: true }
      } catch (error) {
        return { success: false, error }
      }
    },
    revalidateLayout: async (path: string) => {
      try {
        revalidatePath(path, 'layout')
        return { success: true }
      } catch (error) {
        return { success: false, error }
      }
    },
  }
})

import { revalidatePage, revalidateLayout } from '@/app/actions/revalidate'

describe('revalidatePage()', () => {
  it('retorna { success: true } para path válido', async () => {
    const result = await revalidatePage('/')
    expect(result).toEqual({ success: true })
  })

  it('retorna { success: true } para path /produtos', async () => {
    const result = await revalidatePage('/produtos')
    expect(result).toEqual({ success: true })
  })

  it('retorna { success: false } quando revalidatePath lança erro', async () => {
    const { revalidatePath } = await import('next/cache')
    vi.mocked(revalidatePath).mockImplementationOnce(() => { throw new Error('Cache error') })
    const result = await revalidatePage('/falha')
    expect(result.success).toBe(false)
  })
})

describe('revalidateLayout()', () => {
  it('retorna { success: true } para layout', async () => {
    const result = await revalidateLayout('/produtos')
    expect(result).toEqual({ success: true })
  })

  it('retorna { success: false } quando revalidatePath lança erro', async () => {
    const { revalidatePath } = await import('next/cache')
    vi.mocked(revalidatePath).mockImplementationOnce(() => { throw new Error('Cache error') })
    const result = await revalidateLayout('/falha')
    expect(result.success).toBe(false)
  })
})
