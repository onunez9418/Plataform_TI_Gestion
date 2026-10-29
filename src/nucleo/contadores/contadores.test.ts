import { describe, expect, it } from 'vitest'
import { claveSku, formatearCorrelativo, reservarContador } from './index'

describe('contadores (sin base)', () => {
  it('da formato PREFIJO-0001 con ancho mínimo, no tope', () => {
    expect(formatearCorrelativo('LAP', 1)).toBe('LAP-0001')
    expect(formatearCorrelativo('LAP', 12345)).toBe('LAP-12345')
    expect(formatearCorrelativo('ACTV', 7, 6)).toBe('ACTV-000007')
  })

  it('arma la clave de SKU en mayúsculas', () => {
    expect(claveSku('lap')).toBe('sku:LAP')
  })

  it('rechaza claves y cantidades inválidas antes de tocar la base', async () => {
    const u = '01980000-0000-7000-8000-00000000a1fa'
    await expect(reservarContador(u, 'sku:lap', 1)).rejects.toThrow(/Clave de contador/)
    await expect(reservarContador(u, 'otra', 1)).rejects.toThrow(/Clave de contador/)
    await expect(reservarContador(u, 'sku:LAP', 0)).rejects.toThrow(/entre 1 y 10/)
    await expect(reservarContador(u, 'sku:LAP', 10_001)).rejects.toThrow(/entre 1 y 10/)
  })
})
