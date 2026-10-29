import { describe, expect, it } from 'vitest'
import { analizarSeries } from './series'

describe('analizarSeries', () => {
  it('acepta líneas, comas y tabuladores, y quita espacios', () => {
    const f = analizarSeries('SN-1\n SN-2 ,SN-3\tSN-4\r\n\n')
    expect(f.map((x) => x.serie)).toEqual(['SN-1', 'SN-2', 'SN-3', 'SN-4'])
    expect(f.every((x) => x.estado === 'ok')).toBe(true)
  })

  it('marca la repetida e indica en qué fila está la primera (sin distinguir mayúsculas)', () => {
    const f = analizarSeries('A-1\nB-2\na-1')
    expect(f[2]).toMatchObject({ estado: 'repetida', numero: 3 })
    expect(f[2].detalle).toContain('fila 1')
    expect(f[0].estado).toBe('ok')
  })

  it('detecta series dañadas por Excel (notación científica)', () => {
    const f = analizarSeries('1.23E+11\n123456789012\n9E+5')
    expect(f[0].estado).toBe('danada')
    expect(f[1].estado).toBe('ok')
    expect(f[2].estado).toBe('danada')
  })

  it('una lista vacía no da filas', () => {
    expect(analizarSeries('  \n ,, ')).toEqual([])
  })
})
