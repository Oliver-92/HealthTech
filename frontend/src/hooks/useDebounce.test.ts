import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('devuelve el valor inicial de inmediato', () => {
    const { result } = renderHook(() => useDebounce('a', 300))
    expect(result.current).toBe('a')
  })

  it('actualiza recién después del delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: 'a' },
    })

    rerender({ v: 'b' })
    expect(result.current).toBe('a') // todavía no pasó el delay

    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('b')
  })

  it('reinicia el timer si el valor cambia antes del delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: 'a' },
    })

    rerender({ v: 'b' })
    act(() => { vi.advanceTimersByTime(200) })
    rerender({ v: 'c' })
    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current).toBe('a') // se reinició, aún no completó 300 desde 'c'

    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBe('c')
  })
})
