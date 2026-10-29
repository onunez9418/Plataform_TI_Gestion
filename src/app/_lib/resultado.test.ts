import { describe, expect, it } from 'vitest'
import { aErrorPantalla, ejecutar, marcado, numero, texto } from './resultado'

function datos(o: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(o)) f.append(k, v)
  return f
}

describe('lectura de formularios', () => {
  it('texto recorta y vuelve undefined lo vacío', () => {
    const f = datos({ a: '  hola ', b: '   ' })
    expect(texto(f, 'a')).toBe('hola')
    expect(texto(f, 'b')).toBeUndefined()
    expect(texto(f, 'c')).toBeUndefined()
  })
  it('numero acepta coma decimal', () => {
    expect(numero(datos({ n: '3,5' }), 'n')).toBe(3.5)
    expect(numero(datos({ n: 'abc' }), 'n')).toBeUndefined()
  })
  it('marcado detecta casillas', () => {
    expect(marcado(datos({ activo: 'on' }), 'activo')).toBe(true)
    expect(marcado(datos({}), 'activo')).toBe(false)
  })
})

describe('ejecutar', () => {
  it('devuelve el mensaje del servicio tal cual', async () => {
    const r = await ejecutar(async () => {
      throw { codigo: 'SIN_PERMISO', mensaje: 'No tiene permiso para realizar esta acción.' }
    })
    expect(r).toEqual({ ok: false, error: { codigo: 'SIN_PERMISO', mensaje: 'No tiene permiso para realizar esta acción.', campos: undefined } })
  })
  it('conserva los mensajes por campo', async () => {
    const r = await ejecutar(async () => {
      throw { codigo: 'DUPLICADO', mensaje: 'Ya existe', campos: { codigo: 'Ya existe ese código' } }
    })
    expect(!r.ok && r.error.campos).toEqual({ codigo: 'Ya existe ese código' })
  })
  it('un fallo inesperado no revela detalles', () => {
    const e = aErrorPantalla(new Error('connection refused 10.0.0.5'))
    expect(e.mensaje).not.toContain('10.0.0.5')
  })
  it('deja pasar las redirecciones de Next', async () => {
    await expect(ejecutar(async () => { throw Object.assign(new Error('x'), { digest: 'NEXT_REDIRECT;/x' }) })).rejects.toBeDefined()
  })
  it('devuelve los datos cuando sale bien', async () => {
    expect(await ejecutar(async () => 5)).toEqual({ ok: true, datos: 5 })
  })
})
