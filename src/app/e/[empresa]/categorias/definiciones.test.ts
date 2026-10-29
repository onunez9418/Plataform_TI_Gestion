import { describe, expect, it } from 'vitest'
import { aDefiniciones } from './definiciones'

const fila = (etiqueta: string, tipo: 'texto' | 'numero' | 'fecha' | 'lista' | 'si_no' = 'texto', opciones = '', obligatorio = false) => ({ etiqueta, tipo, opciones, obligatorio })

describe('aDefiniciones', () => {
  it('arma la clave técnica sola, sin tildes ni espacios', () => {
    const d = aDefiniciones([fila('Memoria RAM (GB)', 'numero', '', true), fila('Fecha de compra', 'fecha')])
    expect(d.map((x) => x.clave)).toEqual(['memoria_ram_gb', 'fecha_de_compra'])
    expect(d[0]).toMatchObject({ etiqueta: 'Memoria RAM (GB)', tipo: 'numero', obligatorio: true })
  })

  it('si dos etiquetas dan la misma clave, agrega un número', () => {
    const d = aDefiniciones([fila('Año'), fila('Ano')])
    expect(d.map((x) => x.clave)).toEqual(['ano', 'ano_2'])
  })

  it('las listas llevan sus opciones limpias; los demás tipos no', () => {
    const d = aDefiniciones([fila('Disco', 'lista', ' SSD, HDD ,, '), fila('Nota', 'texto', 'x')])
    expect(d[0].opciones).toEqual(['SSD', 'HDD'])
    expect('opciones' in d[1]).toBe(false)
  })

  it('ignora las filas sin nombre', () => {
    expect(aDefiniciones([fila('  '), fila('')])).toEqual([])
  })
})
