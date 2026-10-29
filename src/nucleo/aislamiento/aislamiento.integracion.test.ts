// Pruebas de integración de la puerta de aislamiento contra PostgreSQL REAL, como app_empresa.
// Se saltan solas si no hay base: para correrlas, con la base migrada y sembrada:
//   PRUEBAS_BD=1 DATABASE_URL=<app_empresa> PLATFORM_DATABASE_URL=<app_plataforma> \
//     npx vitest run --config vitest.config.mts src/nucleo/aislamiento/aislamiento.integracion.test.ts
// Cubre el caso 5 de A.8.2 (peticiones intercaladas, tras un error y tras una conexión cortada)
// y el resto de la conducta de conEmpresa. El guion SQL equivalente está en prisma/verificar-aislamiento.sql.

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import pg from 'pg'
import {
  cerrarConexiones, conEmpresa, conGlobal, conPlataforma, ErrorBaseDatos, ErrorUsoAislamiento,
} from './index'

const hayBase = process.env.PRUEBAS_BD === '1' && !!process.env.DATABASE_URL
const suite = describe.skipIf(!hayBase)

let alfa = ''
let beta = ''

suite('conEmpresa / conGlobal / conPlataforma (base real)', () => {
  beforeAll(async () => {
    const filas = await conGlobal((tx) => tx.consultar<{ id: string; slug: string }>('SELECT id, slug FROM empresa WHERE slug IN (\'alfa\', \'beta\')'))
    alfa = filas.find((f) => f.slug === 'alfa')!.id
    beta = filas.find((f) => f.slug === 'beta')!.id
    expect(alfa && beta).toBeTruthy()
  })
  afterAll(() => cerrarConexiones())

  it('cada empresa ve solo lo suyo, aunque repitan el mismo código de SKU', async () => {
    const deAlfa = await conEmpresa(alfa, (tx) => tx.consultar<{ codigo: string; nombre: string; empresa_id: string }>('SELECT codigo, nombre, empresa_id FROM sku ORDER BY codigo'))
    const deBeta = await conEmpresa(beta, (tx) => tx.consultar<{ codigo: string; nombre: string; empresa_id: string }>('SELECT codigo, nombre, empresa_id FROM sku ORDER BY codigo'))
    expect(deAlfa.map((s) => s.codigo)).toEqual(['LAP-0001', 'MON-0001'])
    expect(deBeta.map((s) => s.codigo)).toEqual(['LAP-0001', 'MON-0001'])
    expect(deAlfa.every((s) => s.empresa_id === alfa)).toBe(true)
    expect(deBeta.every((s) => s.empresa_id === beta)).toBe(true)
    expect(deAlfa[0]!.nombre).not.toBe(deBeta[0]!.nombre)
  })

  it('conGlobal ve las tablas globales pero cero filas de las tablas de empresa', async () => {
    const [{ n }] = await conGlobal((tx) => tx.consultar<{ n: number }>('SELECT count(*)::int AS n FROM empresa'))
    expect(n).toBeGreaterThanOrEqual(2)
    for (const tabla of ['sku', 'activo', 'membresia', 'auditoria', 'rol']) {
      const [{ c }] = await conGlobal((tx) => tx.consultar<{ c: number }>(`SELECT count(*)::int AS c FROM ${tabla}`))
      expect(c, tabla).toBe(0)
    }
  })

  it('conPlataforma crea empresas pero no lee tablas de negocio', async () => {
    await expect(conPlataforma((tx) => tx.consultar('SELECT * FROM sku'))).rejects.toMatchObject({ codigo: '42501' })
  })

  it('mis_empresas devuelve las empresas del usuario', async () => {
    const filas = await conGlobal((tx) =>
      tx.consultar<{ slug: string }>("SELECT slug FROM mis_empresas((SELECT id FROM usuario WHERE correo_norm = $1))", ['ceo@demo.local']))
    expect(filas.map((f) => f.slug).sort()).toEqual(['alfa', 'beta'])
  })

  it('no se anida y exige un UUID', async () => {
    await expect(conEmpresa(alfa, (tx) => conEmpresa(beta, (t2) => t2.consultar('SELECT 1')))).rejects.toThrow(ErrorUsoAislamiento)
    expect(() => conEmpresa('no-es-uuid', async () => 1)).toThrow(ErrorUsoAislamiento)
    expect(() => conEmpresa("x'; DROP TABLE sku; --", async () => 1)).toThrow(ErrorUsoAislamiento)
  })

  it('rechaza SQL que cambie la empresa desde un servicio', async () => {
    await expect(conEmpresa(alfa, (tx) => tx.consultar("SELECT set_config('app.empresa_id', $1, true)", [beta]))).rejects.toThrow(ErrorUsoAislamiento)
  })

  it('traduce errores de la base: duplicado, llave foránea, permiso', async () => {
    const dup = await conEmpresa(alfa, (tx) => tx.consultar("INSERT INTO ubicacion (empresa_id, nombre) VALUES ($1, 'ALMACÉN  central')", [alfa])).catch((e) => e)
    expect(dup).toBeInstanceOf(ErrorBaseDatos)
    expect(dup).toMatchObject({ codigo: '23505', esDuplicado: true, restriccion: 'uq_ubicacion__nombre' })

    const ajena = await conEmpresa(alfa, (tx) => tx.consultar("INSERT INTO ubicacion (empresa_id, nombre) VALUES ($1, 'Intrusa')", [beta])).catch((e) => e)
    expect(ajena).toMatchObject({ esSinPermiso: true })

    const aud = await conEmpresa(alfa, (tx) => tx.consultar("UPDATE auditoria SET accion = 'x'")).catch((e) => e)
    expect(aud).toMatchObject({ esSinPermiso: true })
  })

  it('el código de SKU no distingue mayúsculas ni espacios (RF-SKU-002)', async () => {
    const e = await conEmpresa(alfa, (tx) =>
      tx.consultar(
        "INSERT INTO sku (empresa_id, categoria_id, codigo, nombre, control) SELECT $1, categoria_id, ' lap-0001 ', 'Repetido', 'serie' FROM sku LIMIT 1", [alfa],
      )).catch((x) => x)
    expect(e).toMatchObject({ esDuplicado: true, restriccion: 'uq_sku__codigo' })
  })

  it('tx.intentar deshace solo lo suyo y la transacción sigue viva', async () => {
    const r = await conEmpresa(alfa, async (tx) => {
      const fallo = await tx
        .intentar(() => tx.consultar("INSERT INTO ubicacion (empresa_id, nombre) VALUES ($1, 'Almacén central')", [alfa]))
        .catch((e) => e)
      expect(fallo).toMatchObject({ esDuplicado: true })
      const [{ n }] = await tx.consultar<{ n: number }>('SELECT count(*)::int AS n FROM ubicacion')
      return n
    })
    expect(r).toBe(3)
  })

  it('una excepción dentro de la función deshace todo (no queda nada a medias)', async () => {
    await conEmpresa(alfa, async (tx) => {
      await tx.consultar("INSERT INTO ubicacion (empresa_id, nombre) VALUES ($1, 'Fantasma')", [alfa])
      throw new Error('falla a propósito')
    }).catch(() => undefined)
    const filas = await conEmpresa(alfa, (tx) => tx.consultar("SELECT 1 FROM ubicacion WHERE nombre = 'Fantasma'"))
    expect(filas).toHaveLength(0)
  })

  it('el plazo cancela la transacción y la conexión se descarta', async () => {
    await expect(conEmpresa(alfa, (tx) => tx.consultar('SELECT pg_sleep(3)'), { plazoMs: 300 })).rejects.toThrow(/plazo/)
    const ok = await conEmpresa(alfa, (tx) => tx.consultar('SELECT 1 AS uno'))
    expect(ok[0]).toEqual({ uno: 1 })
  })

  it('una conexión reutilizada sin empresa da cero filas, sin error (valor vacío, no nulo)', async () => {
    await cerrarConexiones()
    process.env.DB_POOL_MAX = '1' // una sola conexión: la reutiliza a la fuerza
    try {
      const pid1 = await conEmpresa(alfa, async (tx) => {
        const [{ n }] = await tx.consultar<{ n: number }>('SELECT count(*)::int AS n FROM sku')
        expect(n).toBe(2)
        return (await tx.consultar<{ pid: number }>('SELECT pg_backend_pid() AS pid'))[0]!.pid
      })
      const { pid2, residuo, filas } = await conGlobal(async (tx) => ({
        pid2: (await tx.consultar<{ pid: number }>('SELECT pg_backend_pid() AS pid'))[0]!.pid,
        residuo: (await tx.consultar<{ v: string | null }>("SELECT current_setting('app.empresa_id', true) AS v"))[0]!.v,
        filas: (await tx.consultar<{ n: number }>('SELECT count(*)::int AS n FROM sku'))[0]!.n,
      }))
      expect(pid2).toBe(pid1) // misma conexión
      expect(residuo === '' || residuo === null).toBe(true)
      expect(filas).toBe(0)
    } finally {
      await cerrarConexiones()
      delete process.env.DB_POOL_MAX
    }
  })

  it('2.000 peticiones intercaladas de las dos empresas: cero filas ajenas, también tras errores y conexiones cortadas', async () => {
    await cerrarConexiones()
    const TOTAL = 2000
    const CONCURRENCIA = 40
    let ajenasVistas = 0
    let aciertos = 0
    let errores = 0
    let cortadas = 0

    // Segunda conexión (misma cuenta app_empresa) para cortar conexiones de la aplicación a media petición.
    const cortador = new pg.Client({ connectionString: process.env.DATABASE_URL })
    await cortador.connect()

    async function peticion(i: number): Promise<void> {
      const propia = i % 2 === 0 ? alfa : beta
      const ajena = i % 2 === 0 ? beta : alfa
      try {
        await conEmpresa(propia, async (tx) => {
          // Consulta sin filtro sobre varias tablas.
          const r = await tx.consultar<{ propias: number; ajenas: number }>(
            `SELECT count(*) FILTER (WHERE empresa_id = $1)::int AS propias, count(*) FILTER (WHERE empresa_id = $2)::int AS ajenas
               FROM (SELECT empresa_id FROM sku UNION ALL SELECT empresa_id FROM activo UNION ALL SELECT empresa_id FROM persona) x`,
            [propia, ajena],
          )
          ajenasVistas += r[0]!.ajenas
          if (r[0]!.propias === 0) ajenasVistas += 1000 // no ve ni lo propio: también es defecto
          if (i % 7 === 0) throw new Error('error a propósito') // error de código de servicio
          if (i % 11 === 0) await tx.consultar('SELECT * FROM tabla_que_no_existe') // error de SQL: transacción abortada
          if (i % 97 === 0) {
            const [{ pid }] = await tx.consultar<{ pid: number }>('SELECT pg_backend_pid() AS pid')
            cortadas++
            await cortador.query('SELECT pg_terminate_backend($1)', [pid]) // se corta la conexión en uso
            await tx.consultar('SELECT 1') // esta consulta falla: la conexión ya no existe
          }
        })
        aciertos++
      } catch {
        errores++
      }
    }

    let siguiente = 0
    await Promise.all(
      Array.from({ length: CONCURRENCIA }, async () => {
        while (siguiente < TOTAL) await peticion(siguiente++)
      }),
    )
    await cortador.end()

    expect(ajenasVistas).toBe(0)
    expect(aciertos + errores).toBe(TOTAL)
    expect(cortadas).toBeGreaterThan(10)
    expect(errores).toBeGreaterThan(300)

    // Después del castigo, una petición limpia sigue viendo exactamente lo suyo y una sin empresa nada.
    const limpia = await conEmpresa(beta, (tx) => tx.consultar<{ n: number }>('SELECT count(*)::int AS n FROM sku WHERE empresa_id = $1', [beta]))
    expect(limpia[0]!.n).toBe(2)
    const [{ n }] = await conGlobal((tx) => tx.consultar<{ n: number }>('SELECT count(*)::int AS n FROM sku'))
    expect(n).toBe(0)
  })
})
