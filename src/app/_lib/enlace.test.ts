import { describe, expect, it } from 'vitest'
import { rutaDeEnlace } from './enlace'

describe('rutaDeEnlace', () => {
  it('conserva la ruta que da el servicio', () => {
    expect(rutaDeEnlace('/entrar/enlace?t=ABC_def-123')).toBe('/entrar/enlace?t=ABC_def-123')
  })
  it('convierte una dirección completa en ruta propia', () => {
    expect(rutaDeEnlace('http://localhost:3000/entrar/enlace?t=XYZ')).toBe('/entrar/enlace?t=XYZ')
  })
  it('si llega solo la ficha, arma la ruta', () => {
    expect(rutaDeEnlace('abc123')).toBe('/entrar/enlace?t=abc123')
  })
  it('nunca apunta a una dirección de otro sitio', () => {
    expect(rutaDeEnlace('https://malo.example/entrar/enlace?t=XYZ').startsWith('/')).toBe(true)
  })
})
