// QA · Defectos de aislamiento ENCONTRADOS que siguen abiertos. Estas pruebas describen el comportamiento
// CORRECTO: mientras el defecto exista, FALLAN (eso es lo esperado). Cuando el dueño lo corrija, pasan solas.
// Detalle y gravedad en pruebas/INFORME.md.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type pg from 'pg'
import { cerrarConexiones, conGlobal } from '../../src/nucleo/aislamiento'
import { clienteApp, empresasDeEjemplo, type Empresas } from '../apoyo/base'

let E: Empresas
let c: pg.Client
beforeAll(async () => {
  c = await clienteApp()
  E = await empresasDeEjemplo(c)
})
afterAll(async () => {
  await c.end()
  await cerrarConexiones()
})

describe('DEF-AIS-01 · siguiente() sin empresa fijada no debe fijar la empresa para el resto de la transacción', () => {
  it('en una transacción sin empresa (conGlobal), llamar a siguiente(otraEmpresa) NO abre las tablas de esa empresa', async () => {
    const vistos = await conGlobal(async (tx) => {
      await tx.consultar(`SELECT siguiente($1::uuid, 'sku:QAX', 1)`, [E.beta])
      return (await tx.consultar<{ n: number }>('SELECT count(*)::int AS n FROM sku'))[0]!.n
    })
    // Correcto: sin empresa fijada por la puerta, cero filas (A.6.1: «sin la variable fijada, cero filas»).
    expect(vistos).toBe(0)
  })

  it('con SQL directo: BEGIN; SELECT siguiente(beta,...); SELECT * FROM sku  →  cero filas', async () => {
    await c.query('BEGIN')
    try {
      await c.query(`SELECT siguiente($1::uuid, 'sku:QAY', 1)`, [E.beta])
      const r = await c.query('SELECT count(*)::int AS n FROM sku')
      expect(r.rows[0].n).toBe(0)
    } finally {
      await c.query('ROLLBACK')
    }
  })
})

describe('DEF-AIS-02 · el filtro de SQL de la puerta no se salta con un comentario delante', () => {
  const beta = () => E.beta
  it.each([
    ['SET de sesión tras un comentario /**/', () => `/**/ SET app.empresa_id = '${beta()}'`],
    ['SET de sesión tras un comentario --', () => `-- x\nSET app.empresa_id = '${beta()}'`],
    ['COMMIT tras un comentario', () => `/**/ COMMIT`],
    ['RESET tras un comentario', () => `/**/ RESET ALL`],
  ])('se rechaza: %s', async (_nombre, sql) => {
    await expect(conGlobal((tx) => tx.consultar(sql()))).rejects.toThrow(/no permitido/i)
  })
})
