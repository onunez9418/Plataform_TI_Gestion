import { describe, expect, it } from 'vitest'
import { MARCA_CAMPO_PERSONAL, filtrarCambios } from './campos-personales'

describe('auditoría: campos personales (ADR-11)', () => {
  it('de un usuario guarda "cambió" y no el correo ni el nombre', () => {
    const r = filtrarCambios('usuario', { correo: 'ana@alfa.local', nombre: 'Ana Pérez', rol: 'Técnico' })
    expect(r).toEqual({ correo: MARCA_CAMPO_PERSONAL, nombre: MARCA_CAMPO_PERSONAL, rol: 'Técnico' })
    expect(JSON.stringify(r)).not.toContain('Ana')
  })
  it('un nombre de SKU no es personal', () => {
    expect(filtrarCambios('sku', { nombre: 'Laptop 14' })).toEqual({ nombre: 'Laptop 14' })
  })
})
