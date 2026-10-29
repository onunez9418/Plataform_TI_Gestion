// QA · Caso 5 de A.8.2: 2.000 peticiones intercaladas de las dos empresas, con cero filas ajenas,
// también tras un error y tras una conexión cortada. Dos versiones:
//   A) conexiones directas como app_empresa (no dependen del código de la aplicación);
//   B) por la puerta real de la aplicación (conEmpresa / conGlobal), que es lo que usan los servicios.
// Un grupo de solo 10 conexiones atiende 40 peticiones a la vez, así que las conexiones se reutilizan todo el tiempo.
import type pg from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones, conEmpresa, conGlobal } from '../../src/nucleo/aislamiento'
import { clienteApp, empresasDeEjemplo, poolApp, simulando, tablasDeNegocio, type Empresas } from '../apoyo/base'

const TOTAL = 2000
const CONCURRENCIA = 40
const TABLAS_CLAVE = ['sku', 'activo', 'auditoria', 'membresia', 'rol_permiso', 'persona', 'ubicacion'] as const

let E: Empresas
let verificador: pg.Client
let todasLasTablas: string[] = []
const base: Record<string, Record<string, number>> = {}

async function contarComo(empresaId: string): Promise<Record<string, number>> {
  return simulando(verificador, empresaId, async () => {
    const r: Record<string, number> = {}
    for (const t of TABLAS_CLAVE) r[t] = (await verificador.query(`SELECT count(*)::int AS n FROM ${t}`)).rows[0].n
    return r
  })
}

beforeAll(async () => {
  verificador = await clienteApp()
  E = await empresasDeEjemplo(verificador)
  todasLasTablas = (await tablasDeNegocio(verificador)).map((t) => t.tabla)
  base[E.alfa] = await contarComo(E.alfa)
  base[E.beta] = await contarComo(E.beta)
  expect(base[E.alfa]!.sku, 'la semilla de Alfa no tiene SKU').toBeGreaterThan(0)
  expect(base[E.beta]!.sku, 'la semilla de Beta no tiene SKU').toBeGreaterThan(0)
})
afterAll(async () => {
  await verificador.end()
  await cerrarConexiones()
})

/** Corre `total` tareas con a lo sumo `n` a la vez. */
async function enParalelo(total: number, n: number, tarea: (i: number) => Promise<void>): Promise<void> {
  let siguiente = 0
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (true) {
        const i = siguiente++
        if (i >= total) return
        await tarea(i)
      }
    }),
  )
}

describe('caso 5 · 2.000 peticiones intercaladas', () => {
  it('A) conexiones directas: alternando empresas, con errores a propósito y conexiones cortadas', async () => {
    const pool = poolApp(10)
    const asesino = await clienteApp()
    const resumen = { ok: 0, errores: 0, cortadas: 0, sondeosSinEmpresa: 0, ajenas: 0, filasDistintas: 0 }
    try {
      await enParalelo(TOTAL, CONCURRENCIA, async (i) => {
        const miEmpresa = i % 2 === 0 ? E.alfa : E.beta
        const cl = await pool.connect()
        cl.on('error', () => undefined) // una conexión cortada a propósito avisa por aquí; no debe tumbar la prueba
        let destruir = false
        try {
          // Sonda: la conexión llega «usada» por la otra empresa y debe ver CERO filas, sin error.
          const sonda = await cl.query('SELECT (SELECT count(*) FROM sku)::int + (SELECT count(*) FROM activo)::int + (SELECT count(*) FROM auditoria)::int AS n')
          if (sonda.rows[0].n !== 0) resumen.ajenas += sonda.rows[0].n
          resumen.sondeosSinEmpresa++

          await cl.query('BEGIN')
          await cl.query(`SELECT set_config('app.empresa_id', $1, true)`, [miEmpresa])
          const modo = i % 25 === 3 ? 'error' : i % 50 === 7 ? 'corte' : 'normal'

          if (modo === 'corte') {
            const pid = (await cl.query('SELECT pg_backend_pid() AS pid')).rows[0].pid
            await asesino.query('SELECT pg_terminate_backend($1)', [pid])
            destruir = true
            await expect(cl.query('SELECT count(*) FROM sku')).rejects.toBeTruthy()
            resumen.cortadas++
            return
          }
          if (modo === 'error') {
            await expect(cl.query('SELECT 1/0')).rejects.toMatchObject({ code: '22012' })
            await cl.query('ROLLBACK')
            resumen.errores++
            return
          }

          for (const t of TABLAS_CLAVE) {
            const r = await cl.query(`SELECT count(*)::int AS total, count(*) FILTER (WHERE empresa_id <> $1)::int AS ajenas FROM ${t}`, [miEmpresa])
            resumen.ajenas += r.rows[0].ajenas
            if (r.rows[0].total !== base[miEmpresa]![t]) resumen.filasDistintas++
          }
          // Cualquier tabla de negocio, elegida al azar, sin filtro.
          const t = todasLasTablas[i % todasLasTablas.length]!
          const x = await cl.query(`SELECT count(*) FILTER (WHERE empresa_id <> $1)::int AS ajenas FROM ${t}`, [miEmpresa])
          resumen.ajenas += x.rows[0].ajenas
          await cl.query('COMMIT')
          resumen.ok++
        } catch (e) {
          destruir = true
          throw e
        } finally {
          cl.release(destruir ? true : undefined)
        }
      })
    } finally {
      await asesino.end()
      await pool.end()
    }
    console.log('[QA aislamiento A]', JSON.stringify(resumen))
    expect(resumen.ajenas, 'filas de otra empresa vistas').toBe(0)
    expect(resumen.filasDistintas, 'conteos distintos a los esperados para esa empresa').toBe(0)
    expect(resumen.ok + resumen.errores + resumen.cortadas).toBe(TOTAL)
    expect(resumen.errores).toBeGreaterThanOrEqual(50)
    expect(resumen.cortadas).toBeGreaterThanOrEqual(20)
    expect(resumen.ok).toBeGreaterThan(1500)
  })

  it('B) por conEmpresa / conGlobal (la puerta real): mezcla de empresas, errores de negocio, errores de base y cortes', async () => {
    await cerrarConexiones()
    process.env.DB_POOL_MAX = '10'
    const asesino = await clienteApp()
    const resumen = { ok: 0, errores: 0, cortadas: 0, sondeosGlobales: 0, ajenas: 0, filasDistintas: 0, inesperados: 0 }
    try {
      await enParalelo(TOTAL, CONCURRENCIA, async (i) => {
        const miEmpresa = i % 2 === 0 ? E.alfa : E.beta
        const modo = i % 10 === 5 ? 'sonda' : i % 25 === 3 ? 'error-base' : i % 25 === 11 ? 'error-negocio' : i % 50 === 17 ? 'corte' : 'normal'
        try {
          if (modo === 'sonda') {
            // Sin empresa: cero filas en toda tabla de negocio, y las tablas globales sí responden.
            const r = await conGlobal(async (tx) => {
              let filas = 0
              for (const t of todasLasTablas) filas += (await tx.consultar<{ n: number }>(`SELECT count(*)::int AS n FROM ${t}`))[0]!.n
              const empresas = (await tx.consultar<{ n: number }>('SELECT count(*)::int AS n FROM empresa'))[0]!.n
              return { filas, empresas }
            })
            resumen.ajenas += r.filas
            expect(r.empresas).toBeGreaterThanOrEqual(2)
            resumen.sondeosGlobales++
            resumen.ok++
          } else if (modo === 'error-base') {
            await expect(conEmpresa(miEmpresa, (tx) => tx.consultar('SELECT 1/0'))).rejects.toMatchObject({ codigo: '22012' })
            resumen.errores++
          } else if (modo === 'error-negocio') {
            await expect(
              conEmpresa(miEmpresa, async (tx) => {
                await tx.consultar('SELECT count(*) FROM sku')
                throw new Error('falla de negocio a propósito')
              }),
            ).rejects.toThrow('falla de negocio')
            resumen.errores++
          } else if (modo === 'corte') {
            await expect(
              conEmpresa(miEmpresa, async (tx) => {
                const pid = (await tx.consultar<{ pid: number }>('SELECT pg_backend_pid() AS pid'))[0]!.pid
                await asesino.query('SELECT pg_terminate_backend($1)', [pid])
                await tx.consultar('SELECT count(*) FROM sku')
              }),
            ).rejects.toBeTruthy()
            resumen.cortadas++
          } else {
            const r = await conEmpresa(miEmpresa, async (tx) => {
              const salida: Record<string, number> = {}
              let ajenas = 0
              for (const t of TABLAS_CLAVE) {
                const f = (await tx.consultar<{ total: number; ajenas: number }>(`SELECT count(*)::int AS total, count(*) FILTER (WHERE empresa_id <> $1)::int AS ajenas FROM ${t}`, [miEmpresa]))[0]!
                salida[t] = f.total
                ajenas += f.ajenas
              }
              return { salida, ajenas }
            })
            resumen.ajenas += r.ajenas
            for (const t of TABLAS_CLAVE) if (r.salida[t] !== base[miEmpresa]![t]) resumen.filasDistintas++
            resumen.ok++
          }
        } catch (e) {
          resumen.inesperados++
          console.error('[QA aislamiento B] fallo inesperado en la petición', i, modo, (e as Error).message)
        }
      })
    } finally {
      await asesino.end()
      delete process.env.DB_POOL_MAX
    }
    console.log('[QA aislamiento B]', JSON.stringify(resumen))
    expect(resumen.inesperados, 'peticiones que fallaron por una causa no prevista').toBe(0)
    expect(resumen.ajenas, 'filas de otra empresa vistas').toBe(0)
    expect(resumen.filasDistintas).toBe(0)
    expect(resumen.ok + resumen.errores + resumen.cortadas).toBe(TOTAL)
    expect(resumen.cortadas).toBeGreaterThanOrEqual(20)
    expect(resumen.sondeosGlobales).toBeGreaterThanOrEqual(150)
  })

  it('al final, una ráfaga de 100 lecturas sin empresa sobre conexiones reutilizadas sigue dando cero filas', async () => {
    let filas = 0
    await enParalelo(100, 20, async () => {
      filas += await conGlobal(async (tx) => (await tx.consultar<{ n: number }>('SELECT (SELECT count(*) FROM sku)::int + (SELECT count(*) FROM activo)::int AS n'))[0]!.n)
    })
    expect(filas).toBe(0)
  })
})
