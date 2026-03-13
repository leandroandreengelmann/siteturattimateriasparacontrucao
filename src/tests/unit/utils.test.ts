import { describe, it, expect } from 'vitest'
import { cn, formatCurrency } from '@/lib/utils'

describe('cn()', () => {
  it('combina classes simples', () => {
    expect(cn('btn', 'primary')).toBe('btn primary')
  })

  it('ignora valores falsy', () => {
    expect(cn('btn', false && 'active', undefined, null, '')).toBe('btn')
  })

  it('resolve conflitos tailwind (twMerge)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('suporta objetos condicionais (clsx)', () => {
    expect(cn({ active: true, disabled: false })).toBe('active')
  })

  it('suporta arrays', () => {
    expect(cn(['btn', 'primary'])).toBe('btn primary')
  })

  it('retorna string vazia quando sem argumentos', () => {
    expect(cn()).toBe('')
  })
})

describe('formatCurrency()', () => {
  it('formata zero corretamente', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0,00')
    expect(result).toContain('R$')
  })

  it('formata valor simples', () => {
    const result = formatCurrency(100)
    expect(result).toContain('100,00')
  })

  it('formata valor com decimais', () => {
    const result = formatCurrency(1999.99)
    expect(result).toContain('1.999,99')
  })

  it('formata valor grande com separadores de milhar', () => {
    const result = formatCurrency(1000000)
    expect(result).toContain('1.000.000,00')
  })

  it('usa símbolo BRL (R$)', () => {
    const result = formatCurrency(50)
    expect(result).toMatch(/R\$/)
  })
})
