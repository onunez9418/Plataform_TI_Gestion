// Contadores atómicos contra PostgreSQL real (ADR-15, H5 en pequeño). Se saltan sin base:
//   PRUEBAS_BD=1 DATABASE_URL=<app_empresa> PLATFORM_DATABASE_URL=<app_plataforma> \
//     npx vitest run --config vitest.config.mts src/nucleo/contadores/contadores.integracion.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones, conEmpresa, conGlobal } from '../aislamiento'
import { reservarContador, siguienteContador } from './index'

const hayBase = process.env.PRUEBAS_BD === '1' && !!process.env.DATABASE_URL
const CLAVE = 'sku:ZZT' // clave propia de estas pruebas (queda una fila en contador por empresa)

describe.skipIf(!hayBase)('contadores (base real)', () => {
  let alfa = ''
  let beta = ''
  beforeAll(async () => {
    const f = await conGlobal((tx) => tx.consultar<{ id: string; slug: string }>("SELECT id, slug FROM empresa WHERE slug IN ('alfa','beta')"))
    alfa = f.find((x) => x.slug === 'alfa')!.id
    beta = f.find((x) => x.slug === 'beta')!.id
  })
  afterAll(() => cerrarConexiones())

  it('50 reservas simultáneas de 10 números: rangos sin solaparse ni repetirse', async () => {
    const base = await reservarContador(alfa, CLAVE, 1)
    const ultimos = await Promise.all(Array.from({ length: 50 }, () => reservarContador(alfa, CLAVE, 10)))
    const rangos = ultimos.map((u) => [u - 9, u] as const).sort((a, b) => a[0] - b[0])
    expect(new Set(ultimos).size).toBe(50)
    expect(rangos[0]![0]).toBe(base + 1)
    for (let i = 1; i < rangos.length; i++) expect(rangos[i]![0]).toBe(rangos[i - 1]![1] + 1)
    expect(rangos[49]![1]).toBe(base + 500)
  })

  it('20 transacciones simultáneas pidiendo un número cada una: todos distintos', async () => {
    const numeros = await Promise.all(
      Array.from({ length: 20 }, () => conEmpresa(alfa, (tx) => siguienteContador(tx, CLAVE, 1))),
    )
    expect(new Set(numeros).size).toBe(20)
  })

  it('cada empresa tiene su propio contador', async () => {
    const a = await reservarContador(alfa, 'sku:ZZU', 1)
    const b = await reservarContador(beta, 'sku:ZZU', 1)
    const a2 = await reservarContador(alfa, 'sku:ZZU', 1)
    expect(a2).toBe(a + 1)
    expect(b).toBeGreaterThanOrEqual(1)
    const filas = await conEmpresa(beta, (tx) => tx.consultar<{ clave: string }>("SELECT clave FROM contador WHERE clave = 'sku:ZZU'"))
    expect(filas).toHaveLength(1)
  })

  it('el contador sigue la regla de la reserva: devuelve el ÚLTIMO número del rango', async () => {
    const antes = await reservarContador(beta, CLAVE, 1)
    const u = await reservarContador(beta, CLAVE, 5)
    expect(u).toBe(antes + 5)
  })

  it('una transacción de una empresa no puede reservar en otra', async () => {
    await expect(
      conEmpresa(alfa, (tx) => tx.consultar('SELECT public.siguiente($1::uuid, $2::text, 1)', [beta, CLAVE])),
    ).rejects.toMatchObject({ esSinPermiso: true })
  })

  it('rechaza claves fuera de la forma permitida y cantidades fuera de rango', async () => {
    await expect(reservarContador(alfa, 'sku:lap', 1)).rejects.toThrow()
    await expect(reservarContador(alfa, CLAVE, 0)).rejects.toThrow()
  })
})

describe.skipIf(!hayBase)('siguiente() no deja la empresa fijada (DEF-AIS-01)', () => {
  let beta = ''
  beforeAll(async () => {
    const f = await conGlobal((tx) => tx.consultar<{ id: string }>("SELECT id FROM empresa WHERE slug = 'beta'"))
    beta = f[0]!.id
  })
  afterAll(() => cerrarConexiones())

  it('tras reservar sin empresa, la misma transacción sigue viendo cero filas de negocio', async () => {
    const r = await conGlobal(async (tx) => {
      await tx.consultar('SELECT public.siguiente($1::uuid, $2::text, 1)', [beta, 'sku:QAX'])
      const [{ v }] = await tx.consultar<{ v: string | null }>("SELECT current_setting('app.empresa_id', true) AS v")
      const [{ n }] = await tx.consultar<{ n: number }>('SELECT count(*)::int AS n FROM sku')
      return { v, n }
    })
    expect(r.v === '' || r.v === null).toBe(true)
    expect(r.n).toBe(0)
  })
})
