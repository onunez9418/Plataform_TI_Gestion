// Ayudas de QA para hablar con la base real SIN pasar por conEmpresa (así la prueba no depende del
// código que está probando). Solo datos inventados. Las direcciones vienen del entorno, nunca de archivos.
import pg from 'pg'

export function exigirEntorno(...nombres: string[]): void {
  const faltan = nombres.filter((n) => !process.env[n])
  if (faltan.length > 0) {
    throw new Error(
      `NO SE PUDO PROBAR: faltan las variables ${faltan.join(', ')}. ` +
        'Levante la base con "sh pruebas/preparar-base.sh" y cargue "/tmp/qa-pg/entorno.env". Esto no cuenta como aprobado.',
    )
  }
}

/** Cliente directo como app_empresa (la cuenta de la aplicación). */
export async function clienteApp(): Promise<pg.Client> {
  exigirEntorno('DATABASE_URL')
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await c.connect()
  return c
}

/** Cliente directo con otra cuenta (migraciones, app_plataforma, lector_auditoria) para comprobar sus límites. */
export async function clienteCon(variable: 'MIGRATION_DATABASE_URL' | 'PLATFORM_DATABASE_URL' | 'AUDIT_READER_DATABASE_URL'): Promise<pg.Client> {
  exigirEntorno(variable)
  const c = new pg.Client({ connectionString: process.env[variable] })
  await c.connect()
  return c
}

export function poolApp(max = 10): pg.Pool {
  exigirEntorno('DATABASE_URL')
  const p = new pg.Pool({ connectionString: process.env.DATABASE_URL, max })
  p.on('error', () => undefined)
  return p
}

export type Empresas = { alfa: string; beta: string }

export async function empresasDeEjemplo(c: pg.Client | pg.Pool): Promise<Empresas> {
  const r = await c.query<{ id: string; slug: string }>(`SELECT id, slug FROM empresa WHERE slug IN ('alfa','beta')`)
  const alfa = r.rows.find((f) => f.slug === 'alfa')?.id
  const beta = r.rows.find((f) => f.slug === 'beta')?.id
  if (!alfa || !beta) throw new Error('Faltan las empresas de ejemplo alfa y beta: cargue la semilla (prisma/semilla).')
  return { alfa, beta }
}

/** Abre una transacción, fija la empresa como lo hace la aplicación, ejecuta y SIEMPRE deshace (nada queda escrito). */
export async function simulando<T>(c: pg.Client, empresaId: string | null, fn: () => Promise<T>): Promise<T> {
  await c.query('BEGIN')
  try {
    if (empresaId) await c.query(`SELECT set_config('app.empresa_id', $1, true)`, [empresaId])
    return await fn()
  } finally {
    await c.query('ROLLBACK').catch(() => undefined)
  }
}

/** Ejecuta una sentencia que debe fallar y devuelve el código SQLSTATE y el mensaje. Usa un punto de guardado. */
export async function intentar(c: pg.Client, sql: string, valores: unknown[] = []): Promise<{ codigo?: string; mensaje?: string; filas: number }> {
  await c.query('SAVEPOINT qa_intento')
  try {
    const r = await c.query(sql, valores)
    await c.query('RELEASE SAVEPOINT qa_intento')
    return { filas: r.rowCount ?? 0 }
  } catch (e) {
    await c.query('ROLLBACK TO SAVEPOINT qa_intento')
    const x = e as { code?: string; message?: string }
    return { codigo: x.code, mensaje: x.message, filas: 0 }
  }
}

export async function tablasDeNegocio(c: pg.Client): Promise<{ tabla: string; solo_agregar: boolean; borrable: boolean }[]> {
  const r = await c.query(`SELECT tabla, solo_agregar, borrable FROM catalogo_aislamiento ORDER BY tabla`)
  return r.rows
}
