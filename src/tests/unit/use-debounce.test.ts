import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce()', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna o valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebounce('inicial', 300))
    expect(result.current).toBe('inicial')
  })

  it('não atualiza antes do delay expirar', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'inicial' } }
    )

    rerender({ value: 'atualizado' })
    vi.advanceTimersByTime(200)
    expect(result.current).toBe('inicial')
  })

  it('atualiza após o delay expirar', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'inicial' } }
    )

    rerender({ value: 'atualizado' })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('atualizado')
  })

  it('reseta o timer ao mudar o valor antes do delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    )

    rerender({ value: 'b' })
    vi.advanceTimersByTime(200)
    rerender({ value: 'c' })
    vi.advanceTimersByTime(200)
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('c')
  })

  it('funciona com delay zero', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: 'a' } }
    )

    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(0))
    expect(result.current).toBe('b')
  })

  it('funciona com tipos numéricos', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 1 } }
    )

    rerender({ value: 42 })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe(42)
  })
})
