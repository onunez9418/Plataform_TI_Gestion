// QA · Límite de pedidos de enlace de ingreso (H-SEG-L09): 5 por correo y 20 por origen cada 10 minutos,
// contando igual si el correo existe o no (así el límite tampoco delata qué correos existen).
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { solicitarEnlace } from '../../src/nucleo/acceso'
import { reiniciarLimitesDeEnlaces } from '../../src/nucleo/acceso/limite-intentos'
import { cerrarConexiones } from '../../src/nucleo/aislamiento'
import { exigirEntorno } from '../apoyo/base'
import { Navegador } from '../apoyo/navegadores'
import { crearEmpresaDePrueba, type EmpresaPrueba } from '../apoyo/servicios'

let E: EmpresaPrueba
beforeAll(async () => {
  exigirEntorno('DATABASE_URL', 'PLATFORM_DATABASE_URL')
  process.env.MODO_LOCAL = '1'
  E = await crearEmpresaDePrueba('QA límite')
})
afterAll(() => cerrarConexiones())
beforeEach(() => {
  // Valores normales del producto (la configuración de las demás pruebas los sube a propósito).
  vi.stubEnv('LIMITE_ENLACES_POR_CORREO', '5')
  vi.stubEnv('LIMITE_ENLACES_POR_ORIGEN', '20')
  vi.stubEnv('LIMITE_ENLACES_MINUTOS', '10')
  reiniciarLimitesDeEnlaces()
})

const pedir = async (correo: string) => {
  try {
    const r = await new Navegador().usando(() => solicitarEnlace(correo))
    return { ok: true as const, r }
  } catch (e) {
    return { ok: false as const, mensaje: (e as { mensaje?: string }).mensaje ?? String(e), codigo: (e as { codigo?: string }).codigo }
  }
}

describe('límite de pedidos de enlace', () => {
  it('el sexto pedido del mismo correo en 10 minutos se rechaza con un mensaje claro que dice cuánto esperar', async () => {
    const correo = E.usuarios.admin!.correo
    for (let i = 1; i <= 5; i++) expect((await pedir(correo)).ok, `pedido ${i}`).toBe(true)
    const sexto = await pedir(correo)
    expect(sexto.ok).toBe(false)
    if (!sexto.ok) expect(sexto.mensaje).toMatch(/demasiados enlaces.*Espere \d+ minutos?/)
  })

  it('un correo que NO existe se limita igual y con el mismo mensaje (no delata qué correos existen)', async () => {
    const real = E.usuarios.tecnico!.correo
    const falso = 'no.existe.qa@prueba.local'
    for (let i = 0; i < 5; i++) {
      await pedir(real)
      await pedir(falso)
    }
    const a = await pedir(real)
    const b = await pedir(falso)
    expect(a.ok || b.ok).toBe(false)
    expect(!a.ok && !b.ok && a.mensaje === b.mensaje).toBe(true)
  })

  it('el correo se normaliza: mayúsculas y espacios no esquivan el límite', async () => {
    const correo = E.usuarios.consulta!.correo
    for (let i = 0; i < 5; i++) await pedir(i % 2 ? ` ${correo.toUpperCase()} ` : correo)
    expect((await pedir(`  ${correo.toUpperCase()}`)).ok).toBe(false)
  })

  it('otro correo no se ve afectado por el límite del primero (hasta el tope por origen: 20)', async () => {
    for (let i = 0; i < 6; i++) await pedir(E.usuarios.admin!.correo)
    expect((await pedir(E.usuarios.jefa!.correo)).ok).toBe(true)
  })

  it('el tope por origen (20) frena a quien prueba muchos correos distintos desde el mismo lugar', async () => {
    let rechazados = 0
    for (let i = 0; i < 30; i++) if (!(await pedir(`barrido${i}@prueba.local`)).ok) rechazados++
    expect(rechazados).toBe(10)
  })

  it('un pedido rechazado no suma ni deja ver enlaces; pedidos con correo mal escrito no gastan el cupo', async () => {
    const correo = E.usuarios.admin!.correo
    for (let i = 0; i < 4; i++) await pedir('sin-arroba')
    for (let i = 0; i < 5; i++) expect((await pedir(correo)).ok).toBe(true)
    const rechazado = await pedir(correo)
    expect(rechazado.ok).toBe(false)
    expect(JSON.stringify(rechazado)).not.toContain('/entrar/enlace')
  })
})
