import { describe, expect, it } from 'vitest'
import { claveDesdeEtiqueta, normalizarDefinicion, validarValores } from '../validar-campos'
import type { CampoDef } from '../tipos'

const defs: CampoDef[] = [
  { clave: 'procesador', etiqueta: 'Procesador', tipo: 'texto', obligatorio: true },
  { clave: 'ram_gb', etiqueta: 'RAM GB', tipo: 'numero', obligatorio: false },
  { clave: 'fecha_compra', etiqueta: 'Fecha de compra', tipo: 'fecha', obligatorio: false },
  { clave: 'disco', etiqueta: 'Disco', tipo: 'lista', opciones: ['SSD', 'HDD'], obligatorio: false },
  { clave: 'garantia', etiqueta: 'Con garantía', tipo: 'si_no', obligatorio: false },
]
const captura = (f: () => unknown) => { try { f() } catch (e) { return e as { codigo: string; campos: Record<string, string> } } }

describe('validarValores (campos personalizados, ADR-17)', () => {
  it('acepta y normaliza valores de los cinco tipos', () => {
    expect(validarValores(defs, {
      procesador: '  Core i7 ', ram_gb: '16', fecha_compra: '2025-02-28', disco: 'SSD', garantia: true,
    })).toEqual({ procesador: 'Core i7', ram_gb: 16, fecha_compra: '2025-02-28', disco: 'SSD', garantia: true })
  })
  it('acepta número con coma y sí/no como texto true/false; false es un valor válido', () => {
    expect(validarValores(defs, { procesador: 'x', ram_gb: '7,5', garantia: 'false' })).toEqual({ procesador: 'x', ram_gb: 7.5, garantia: false })
  })
  it('los vacíos se omiten y solo falla el obligatorio', () => {
    expect(validarValores(defs, { procesador: 'x', ram_gb: '', disco: null })).toEqual({ procesador: 'x' })
    expect(captura(() => validarValores(defs, {}))).toMatchObject({ codigo: 'VALIDACION', campos: { procesador: expect.stringContaining('obligatorio') } })
    expect(captura(() => validarValores(defs, undefined))).toMatchObject({ codigo: 'VALIDACION' })
  })
  it('rechaza cada tipo mal escrito, con un mensaje por campo', () => {
    const e = captura(() => validarValores(defs, {
      procesador: 'x'.repeat(256), ram_gb: 'mucha', fecha_compra: '2025-02-30', disco: 'NVMe', garantia: 'tal vez',
    }))
    expect(e?.codigo).toBe('VALIDACION')
    expect(Object.keys(e!.campos).sort()).toEqual(['disco', 'fecha_compra', 'garantia', 'procesador', 'ram_gb'])
  })
  it('rechaza campos que la categoría no tiene', () => {
    expect(captura(() => validarValores(defs, { procesador: 'x', inventado: 1 }))?.campos).toEqual({ inventado: expect.any(String) })
  })
  it('rechaza números infinitos o enormes y fechas con formato libre', () => {
    expect(captura(() => validarValores(defs, { procesador: 'x', ram_gb: Infinity }))?.campos?.ram_gb).toBeDefined()
    expect(captura(() => validarValores(defs, { procesador: 'x', ram_gb: 1e15 }))?.campos?.ram_gb).toBeDefined()
    expect(captura(() => validarValores(defs, { procesador: 'x', fecha_compra: '28/02/2025' }))?.campos?.fecha_compra).toBeDefined()
  })
})

describe('normalizarDefinicion', () => {
  it('deriva la clave de la etiqueta cuando no viene', () => {
    expect(claveDesdeEtiqueta('Fecha de compra')).toBe('fecha_de_compra')
    expect(claveDesdeEtiqueta('Año / Modelo')).toBe('ano_modelo')
    expect(claveDesdeEtiqueta('3D')).toBe('c_3d')
  })
  it('limpia las opciones de una lista y exige al menos una', () => {
    const errores: Record<string, string> = {}
    const c = normalizarDefinicion({ clave: '', etiqueta: 'Disco', tipo: 'lista', opciones: [' SSD ', 'SSD', '', 'HDD'], obligatorio: 1 as unknown as boolean }, errores)
    expect(c).toEqual({ clave: 'disco', etiqueta: 'Disco', tipo: 'lista', opciones: ['SSD', 'HDD'], obligatorio: true })
    expect(errores).toEqual({})
    normalizarDefinicion({ clave: 'x', etiqueta: 'X', tipo: 'lista', opciones: [], obligatorio: false }, errores)
    expect(errores['campo.opciones']).toBeDefined()
  })
  it('no admite tipos ni claves inválidos y quita opciones de los tipos que no son lista', () => {
    const errores: Record<string, string> = {}
    normalizarDefinicion({ clave: 'Mal Clave', etiqueta: 'a', tipo: 'secreto' as never, obligatorio: false }, errores)
    expect(Object.keys(errores).sort()).toEqual(['campo.clave', 'campo.tipo'])
    expect(normalizarDefinicion({ clave: 'n', etiqueta: 'N', tipo: 'numero', opciones: ['1'], obligatorio: false }, {})).not.toHaveProperty('opciones')
  })
})
