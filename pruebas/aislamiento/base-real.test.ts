// QA · Aislamiento por empresa contra la base REAL, entrando como app_empresa (la cuenta de la aplicación).
// Los siete casos de A.8.2 del plan, escritos con conexiones directas (sin conEmpresa) para no depender
// del código que se prueba. Solo datos inventados de la semilla (Alfa y Beta). Cada escritura se deshace.
//
//   1 consulta sin filtro = cero filas ajenas      5 2.000 peticiones intercaladas (archivo aparte)
//   2 insertar con empresa ajena falla             6 conexión reutilizada sin empresa = cero filas, sin error
//   3 clave foránea cruzada falla                  7 la auditoría solo admite agregar
//   4 UPDATE y DELETE ajenos afectan 0 filas       8 roles sin dueño / sin BYPASSRLS / sin superusuario
import type pg from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { clienteApp, clienteCon, empresasDeEjemplo, intentar, poolApp, simulando, tablasDeNegocio, type Empresas } from '../apoyo/base'

let c: pg.Client
let E: Empresas
let tablas: { tabla: string; solo_agregar: boolean; borrable: boolean }[] = []
/** Un identificador real de cada tabla, por empresa (se leen como esa empresa). */
const ids: Record<string, Record<string, Record<string, unknown>>> = { alfa: {}, beta: {} }
/** Un activo de Alfa sin asignación abierta y un usuario que solo pertenece a Beta (para que el único fallo posible sea la clave foránea). */
const extra = { activoLibreAlfa: '', usuarioSoloBeta: '' }

beforeAll(async () => {
  c = await clienteApp()
  E = await empresasDeEjemplo(c)
  tablas = await tablasDeNegocio(c)
  for (const [clave, id] of [['alfa', E.alfa], ['beta', E.beta]] as const) {
    await simulando(c, id, async () => {
      for (const t of tablas) {
        const r = await c.query(`SELECT * FROM ${t.tabla} ORDER BY 1 LIMIT 1`)
        if (r.rows[0]) ids[clave]![t.tabla] = r.rows[0]
      }
    })
  }
  extra.activoLibreAlfa = await simulando(c, E.alfa, async () => (await c.query(`SELECT id FROM activo WHERE estado = 'en_stock' ORDER BY id LIMIT 1`)).rows[0].id)
  extra.usuarioSoloBeta = (await c.query(`SELECT id FROM usuario WHERE correo_norm = 'admin@beta.local'`)).rows[0].id
})
afterAll(async () => { await c.end() })

describe('caso 1 · consulta sin filtro = cero filas ajenas', () => {
  it('la semilla trae al menos 12 tablas con datos propios en cada empresa (si no, la prueba no probaría nada)', () => {
    expect(Object.keys(ids.alfa!).length).toBeGreaterThanOrEqual(12)
    expect(Object.keys(ids.beta!).length).toBeGreaterThanOrEqual(12)
  })

  it.each(['alfa', 'beta'] as const)('%s: SELECT * sin WHERE en CADA tabla de negocio no trae filas de la otra empresa', async (quien) => {
    const yo = E[quien]
    await simulando(c, yo, async () => {
      for (const t of tablas) {
        const r = await c.query(`SELECT count(*)::int AS total, count(*) FILTER (WHERE empresa_id <> $1)::int AS ajenas FROM ${t.tabla}`, [yo])
        expect(r.rows[0].ajenas, `${t.tabla} entrega filas ajenas a ${quien}`).toBe(0)
      }
    })
  })

  it.each([['alfa', 'beta'], ['beta', 'alfa']] as const)('%s no encuentra a %s por identificador, ni por serie, ni por código', async (yo, otro) => {
    await simulando(c, E[yo], async () => {
      for (const t of tablas) {
        const fila = ids[otro]![t.tabla]
        if (!fila || !('id' in fila)) continue
        const r = await c.query(`SELECT 1 FROM ${t.tabla} WHERE id = $1`, [fila.id])
        expect(r.rowCount, `${t.tabla}: se encontró por id una fila de ${otro}`).toBe(0)
        const r2 = await c.query(`SELECT 1 FROM ${t.tabla} WHERE id = ANY($1::uuid[])`, [[fila.id]])
        expect(r2.rowCount).toBe(0)
      }
      // Misma serie / mismo código que existen en la otra empresa: solo se ve el propio.
      const sku = await c.query(`SELECT empresa_id, nombre FROM sku WHERE codigo_norm = 'lap-0001'`)
      expect(sku.rows).toHaveLength(1)
      expect(sku.rows[0].empresa_id).toBe(E[yo])
      const otraSerie = ids[otro]!.activo!.serie as string
      const serie = await c.query(`SELECT empresa_id FROM activo WHERE serie = $1`, [otraSerie])
      expect(serie.rows.every((f) => f.empresa_id === E[yo])).toBe(true)
    })
  })

  it('los cruces (JOIN, subconsultas, uniones, CTE) tampoco traen filas ajenas', async () => {
    await simulando(c, E.alfa, async () => {
      const consultas = [
        `SELECT a.empresa_id FROM activo a JOIN sku s ON s.id = a.sku_id`,
        `SELECT s.empresa_id FROM sku s, ubicacion u`,
        `SELECT empresa_id FROM sku WHERE id IN (SELECT sku_id FROM activo)`,
        `SELECT empresa_id FROM sku UNION ALL SELECT empresa_id FROM activo UNION ALL SELECT empresa_id FROM auditoria`,
        `WITH x AS (SELECT empresa_id FROM membresia) SELECT empresa_id FROM x`,
        `SELECT empresa_id FROM sku WHERE EXISTS (SELECT 1 FROM sku s2 WHERE s2.empresa_id <> sku.empresa_id)`,
        `SELECT m.empresa_id FROM membresia m JOIN usuario u ON u.id = m.usuario_id`,
      ]
      for (const sql of consultas) {
        const r = await c.query(sql)
        // La penúltima pregunta «¿existe un SKU de otra empresa?»: la respuesta correcta es que no hay filas.
        if (!sql.includes('s2.empresa_id <> sku.empresa_id')) expect(r.rows.length, sql).toBeGreaterThan(0)
        expect(r.rows.every((f) => f.empresa_id === E.alfa), `ajena en: ${sql}`).toBe(true)
      }
    })
  })

  it('un conteo global (count, max, string_agg) solo ve lo propio', async () => {
    await simulando(c, E.alfa, async () => {
      const total = (await c.query(`SELECT count(*)::int AS n FROM sku`)).rows[0].n
      const propios = (await c.query(`SELECT count(*)::int AS n FROM sku WHERE empresa_id = $1`, [E.alfa])).rows[0].n
      expect(total).toBe(propios)
      const nombres = (await c.query(`SELECT string_agg(nombre, '|') AS n FROM sku`)).rows[0].n as string
      expect(nombres).not.toBe('')
    })
    // Ningún nombre de SKU de Alfa aparece en Beta ni al revés (los nombres son distintos a propósito).
    const nombresDe = async (id: string) => simulando(c, id, async () => (await c.query(`SELECT nombre FROM sku`)).rows.map((f) => f.nombre as string))
    const a = await nombresDe(E.alfa)
    const b = await nombresDe(E.beta)
    expect(a.filter((n) => b.includes(n))).toEqual([])
  })
})

describe('caso 2 · insertar con empresa ajena (o sin empresa) falla', () => {
  // Estas tablas tienen un disparador BEFORE INSERT que se ejecuta antes que la política y también rechaza (23514 / P0001).
  const CON_DISPARADOR = ['activo', 'existencia', 'orden_aprobacion', 'orden_compra', 'orden_linea', 'recepcion_linea']
  const esperado = (tabla: string) => (CON_DISPARADOR.includes(tabla) ? /^(42501|23514|P0001)$/ : /^42501$/)

  it('en CADA tabla de negocio, estando en Alfa, insertar una fila de Beta es rechazado (seguridad por fila 42501; en las tablas con disparador, el disparador)', async () => {
    await simulando(c, E.alfa, async () => {
      for (const t of tablas) {
        const r = await intentar(c, `INSERT INTO ${t.tabla} (empresa_id) VALUES ($1)`, [E.beta])
        expect(r.filas, `${t.tabla} insertó una fila de Beta`).toBe(0)
        expect(r.codigo, `${t.tabla}: ${r.mensaje}`).toMatch(esperado(t.tabla))
      }
    })
  })

  it('sin empresa fijada (variable ausente, vacía o corrupta) no se inserta en ninguna tabla', async () => {
    for (const valor of [undefined, '', 'no-es-un-uuid']) {
      await c.query('BEGIN')
      try {
        if (valor !== undefined) await c.query(`SELECT set_config('app.empresa_id', $1, true)`, [valor])
        for (const t of tablas) {
          const r = await intentar(c, `INSERT INTO ${t.tabla} (empresa_id) VALUES ($1)`, [E.alfa])
          expect(r.filas, `${t.tabla} insertó sin empresa`).toBe(0)
          expect(r.codigo, `${t.tabla} con valor ${JSON.stringify(valor)}`).toMatch(/^(42501|22P02|23514|P0001)$/)
        }
      } finally {
        await c.query('ROLLBACK')
      }
    }
  })

  it('cambiar la empresa de una fila propia hacia la otra empresa falla (UPDATE empresa_id)', async () => {
    await simulando(c, E.alfa, async () => {
      for (const t of tablas.filter((x) => !x.solo_agregar)) {
        if (!ids.alfa![t.tabla]) continue
        const r = await intentar(c, `UPDATE ${t.tabla} SET empresa_id = $1`, [E.beta])
        expect(r.codigo, `${t.tabla} permitió mudar filas a Beta`).toBeTruthy()
        expect(r.filas).toBe(0)
      }
    })
  })

  it('con la empresa propia sí se puede escribir (control: la prueba no falla por otra causa)', async () => {
    await simulando(c, E.alfa, async () => {
      const r = await c.query(`INSERT INTO ubicacion (empresa_id, nombre) VALUES ($1, 'Ubicación de prueba QA') RETURNING id`, [E.alfa])
      expect(r.rowCount).toBe(1)
    })
  })
})

describe('caso 3 · la clave foránea cruzada entre empresas falla (23503)', () => {
  /** Cada caso: estando en Alfa, una fila PROPIA apunta a una fila de Beta. */
  const casos: [string, () => [string, unknown[]]][] = [
    ['activo → ubicación de Beta', () => [`INSERT INTO activo (empresa_id, sku_id, serie, ubicacion_id) VALUES ($1,$2,'QA-FK-1',$3)`, [E.alfa, ids.alfa!.sku!.id, ids.beta!.ubicacion!.id]]],
    ['activo → SKU de Beta', () => [`INSERT INTO activo (empresa_id, sku_id, serie, ubicacion_id) VALUES ($1,$2,'QA-FK-2',$3)`, [E.alfa, ids.beta!.sku!.id, ids.alfa!.ubicacion!.id]]],
    ['asignación → persona de Beta', () => [`INSERT INTO asignacion (empresa_id, activo_id, persona_id) VALUES ($1,$2,$3)`, [E.alfa, extra.activoLibreAlfa, ids.beta!.persona!.id]]],
    ['asignación → activo de Beta', () => [`INSERT INTO asignacion (empresa_id, activo_id, persona_id) VALUES ($1,$2,$3)`, [E.alfa, ids.beta!.activo!.id, ids.alfa!.persona!.id]]],
    ['SKU → categoría de Beta', () => [`INSERT INTO sku (empresa_id, categoria_id, codigo, nombre, control) VALUES ($1,$2,'QA-FK-3','x','serie')`, [E.alfa, ids.beta!.categoria!.id]]],
    ['campo → categoría de Beta', () => [`INSERT INTO campo_definicion (empresa_id, categoria_id, clave, etiqueta, tipo) VALUES ($1,$2,'qa_fk','x','texto')`, [E.alfa, ids.beta!.categoria!.id]]],
    ['rol_permiso → rol de Beta', () => [`INSERT INTO rol_permiso (empresa_id, rol_id, permiso) VALUES ($1,$2,'skus.ver')`, [E.alfa, ids.beta!.rol!.id]]],
    ['membresía → rol de Beta', () => [`INSERT INTO membresia (empresa_id, usuario_id, rol_id) VALUES ($1,$2,$3)`, [E.alfa, extra.usuarioSoloBeta, ids.beta!.rol!.id]]],
    ['auditoría → autor (membresía) de Beta', () => [`INSERT INTO auditoria (empresa_id, autor_membresia_id, accion, entidad_tipo) VALUES ($1,$2,'qa.fk','prueba')`, [E.alfa, ids.beta!.membresia!.id]]],
    ['valor_campo → campo de Beta', () => [`INSERT INTO valor_campo (empresa_id, campo_id, sku_id, valor_texto) VALUES ($1,$2,$3,'x')`, [E.alfa, ids.beta!.campo_definicion!.id, ids.alfa!.sku!.id]]],
    ['orden de compra → proveedor de Beta', () => [`INSERT INTO orden_compra (empresa_id, proveedor_id, preparada_por_membresia_id) VALUES ($1,$2,$3)`, [E.alfa, ids.beta!.proveedor!.id, ids.alfa!.membresia!.id]]],
  ]
  it.each(casos)('%s', async (_nombre, armar) => {
    await simulando(c, E.alfa, async () => {
      const [sql, valores] = armar()
      const r = await intentar(c, sql, valores)
      // 23503 = clave foránea; 42501 si la política lo frena antes. Lo que NO puede pasar es que se inserte.
      expect(r.filas, `se insertó una fila con referencia cruzada: ${_nombre}`).toBe(0)
      expect(['23503', '42501', '23502', '23514', '23000']).toContain(r.codigo)
    })
  })

  it('la clave foránea es la que frena (23503) en los cruces de datos de negocio, no un efecto lateral', async () => {
    await simulando(c, E.alfa, async () => {
      for (const [nombre, armar] of casos.filter(([n]) => /activo → ubicación|asignación → persona|SKU → categoría|rol_permiso/.test(n))) {
        const [sql, v] = armar()
        const r = await intentar(c, sql, v)
        expect(r.codigo, nombre).toBe('23503')
      }
    })
  })

  it('un UPDATE tampoco puede apuntar a una fila de la otra empresa', async () => {
    await simulando(c, E.alfa, async () => {
      const r = await intentar(c, `UPDATE activo SET ubicacion_id = $1 WHERE id = $2`, [ids.beta!.ubicacion!.id, extra.activoLibreAlfa])
      expect(r.codigo).toBe('23503')
      const r2 = await intentar(c, `UPDATE membresia SET rol_id = $1 WHERE id = $2`, [ids.beta!.rol!.id, ids.alfa!.membresia!.id])
      expect(r2.codigo).toBe('23503')
    })
  })
})

describe('caso 4 · UPDATE y DELETE sobre filas ajenas afectan 0 filas', () => {
  it('en CADA tabla con UPDATE, tocar filas de Beta desde Alfa afecta 0 filas (por empresa, por id y sin filtro)', async () => {
    await simulando(c, E.alfa, async () => {
      for (const t of tablas.filter((x) => !x.solo_agregar)) {
        const r = await c.query(`UPDATE ${t.tabla} SET empresa_id = empresa_id WHERE empresa_id = $1`, [E.beta])
        expect(r.rowCount, `${t.tabla}: UPDATE de filas de Beta desde Alfa`).toBe(0)
        const sinFiltro = await c.query(`UPDATE ${t.tabla} SET empresa_id = empresa_id WHERE empresa_id <> $1`, [E.alfa])
        expect(sinFiltro.rowCount, `${t.tabla}: UPDATE con filtro invertido`).toBe(0)
        const fila = ids.beta![t.tabla]
        if (fila && 'id' in fila) {
          const porId = await c.query(`UPDATE ${t.tabla} SET empresa_id = empresa_id WHERE id = $1`, [fila.id])
          expect(porId.rowCount, `${t.tabla}: UPDATE por id ajeno`).toBe(0)
        }
      }
    })
  })

  it('DELETE ajeno afecta 0 filas donde se puede borrar, y donde no se puede borrar da 42501', async () => {
    await simulando(c, E.alfa, async () => {
      for (const t of tablas) {
        if (t.borrable) {
          const r = await c.query(`DELETE FROM ${t.tabla} WHERE empresa_id = $1`, [E.beta])
          expect(r.rowCount, `${t.tabla}: DELETE de Beta desde Alfa`).toBe(0)
        } else {
          const r = await intentar(c, `DELETE FROM ${t.tabla} WHERE empresa_id = $1`, [E.beta])
          expect(r.codigo, `${t.tabla} permite DELETE`).toBe('42501')
        }
      }
    })
  })

  it('lo que Alfa intentó no cambió nada en Beta (la cuenta de filas de Beta es la misma antes y después)', async () => {
    const contar = (id: string) =>
      simulando(c, id, async () => {
        const r: Record<string, number> = {}
        for (const t of tablas) r[t.tabla] = (await c.query(`SELECT count(*)::int AS n FROM ${t.tabla}`)).rows[0].n
        return r
      })
    const antes = await contar(E.beta)
    await simulando(c, E.alfa, async () => {
      for (const t of tablas.filter((x) => x.borrable)) await c.query(`DELETE FROM ${t.tabla}`)
    })
    expect(await contar(E.beta)).toEqual(antes)
  })

  it('TRUNCATE no está permitido sobre ninguna tabla de negocio', async () => {
    await simulando(c, E.alfa, async () => {
      for (const t of tablas) {
        const r = await intentar(c, `TRUNCATE ${t.tabla}`)
        expect(r.codigo, t.tabla).toBe('42501')
      }
    })
  })
})

describe('caso 6 · conexión reutilizada sin empresa = cero filas, sin error', () => {
  const sondear = async (cliente: pg.Client | pg.PoolClient) => {
    for (const t of tablas) {
      const r = await cliente.query(`SELECT count(*)::int AS n FROM ${t.tabla}`)
      expect(r.rows[0].n, `${t.tabla} devolvió filas sin empresa fijada`).toBe(0)
    }
  }

  it('tras un COMMIT con empresa, la misma conexión no ve nada', async () => {
    await c.query('BEGIN')
    await c.query(`SELECT set_config('app.empresa_id', $1, true)`, [E.alfa])
    expect((await c.query('SELECT count(*)::int AS n FROM sku')).rows[0].n).toBeGreaterThan(0)
    await c.query('COMMIT')
    await sondear(c)
  })

  it('tras un ROLLBACK, tras un error dentro de la transacción y tras un punto de guardado', async () => {
    await c.query('BEGIN')
    await c.query(`SELECT set_config('app.empresa_id', $1, true)`, [E.beta])
    await intentar(c, 'SELECT 1/0')
    await c.query('ROLLBACK')
    await sondear(c)

    await c.query('BEGIN')
    await c.query(`SELECT set_config('app.empresa_id', $1, true)`, [E.beta])
    await c.query('SAVEPOINT x')
    await c.query('ROLLBACK TO SAVEPOINT x')
    await c.query('COMMIT')
    await sondear(c)
  })

  it('con un grupo de UNA sola conexión, 200 vueltas alternando empresas y sondeos: ninguna fuga', async () => {
    const pool = poolApp(1)
    try {
      for (let i = 0; i < 200; i++) {
        const cl = await pool.connect()
        try {
          await sondear(cl) // la conexión viene de usarse con la otra empresa
          await cl.query('BEGIN')
          await cl.query(`SELECT set_config('app.empresa_id', $1, true)`, [i % 2 ? E.alfa : E.beta])
          const r = await cl.query('SELECT count(*)::int AS ajenas FROM sku WHERE empresa_id <> $1', [i % 2 ? E.alfa : E.beta])
          expect(r.rows[0].ajenas).toBe(0)
          if (i % 7 === 0) await cl.query('ROLLBACK')
          else await cl.query('COMMIT')
        } finally {
          cl.release()
        }
      }
    } finally {
      await pool.end()
    }
  })

  it('un valor corrupto en la variable no abre filas (falla cerrado)', async () => {
    await c.query('BEGIN')
    await c.query(`SELECT set_config('app.empresa_id', 'no-es-un-uuid', true)`)
    const r = await intentar(c, 'SELECT count(*) FROM sku')
    await c.query('ROLLBACK')
    expect(r.filas === 0 || r.codigo === '22P02').toBe(true)
    if (!r.codigo) throw new Error('El valor corrupto no debió leerse sin error')
  })
})

describe('caso 7 · la auditoría solo admite agregar', () => {
  it('UPDATE, DELETE y TRUNCATE de la auditoría propia son rechazados y no cambia nada', async () => {
    await simulando(c, E.alfa, async () => {
      const antes = (await c.query('SELECT count(*)::int AS n FROM auditoria')).rows[0].n
      expect(antes).toBeGreaterThan(0)
      for (const sql of [`UPDATE auditoria SET accion = 'adulterada'`, `UPDATE auditoria SET cambios = '{}'::jsonb`, `UPDATE auditoria SET creado_en = now()`, `DELETE FROM auditoria`, `DELETE FROM auditoria WHERE true`, `TRUNCATE auditoria`]) {
        const r = await intentar(c, sql)
        expect(r.codigo, sql).toBe('42501')
      }
      expect((await c.query('SELECT count(*)::int AS n FROM auditoria')).rows[0].n).toBe(antes)
    })
  })

  it('también la tabla de aprobaciones y las recepciones (solo agregar) rechazan UPDATE y DELETE', async () => {
    await simulando(c, E.alfa, async () => {
      for (const t of tablas.filter((x) => x.solo_agregar)) {
        for (const sql of [`UPDATE ${t.tabla} SET empresa_id = empresa_id`, `DELETE FROM ${t.tabla}`]) {
          const r = await intentar(c, sql)
          expect(r.codigo, `${t.tabla}: ${sql}`).toBe('42501')
        }
      }
    })
  })

  it('agregar sí se puede, y no se puede escribir auditoría a nombre de la otra empresa', async () => {
    await simulando(c, E.alfa, async () => {
      const ok = await intentar(c, `INSERT INTO auditoria (empresa_id, accion, entidad_tipo) VALUES ($1, 'qa.prueba', 'prueba')`, [E.alfa])
      expect(ok.codigo).toBeUndefined()
      const ajena = await intentar(c, `INSERT INTO auditoria (empresa_id, accion, entidad_tipo) VALUES ($1, 'qa.prueba', 'prueba')`, [E.beta])
      expect(ajena.codigo).toBe('42501')
    })
  })

  it('ni siquiera apagando los disparadores o la seguridad por fila (no es dueño de las tablas)', async () => {
    await simulando(c, E.alfa, async () => {
      for (const sql of [
        'ALTER TABLE auditoria DISABLE TRIGGER ALL',
        'ALTER TABLE auditoria DISABLE ROW LEVEL SECURITY',
        'ALTER TABLE auditoria NO FORCE ROW LEVEL SECURITY',
        'DROP POLICY aislamiento_empresa ON auditoria',
        'DROP TRIGGER trg_auditoria_solo_agregar ON auditoria',
        'SET session_replication_role = replica',
        'SET ROLE migraciones',
        'SET ROLE postgres',
        'ALTER ROLE app_empresa BYPASSRLS',
        'ALTER ROLE app_empresa SUPERUSER',
        'CREATE TABLE qa_intruso (x int)',
        'CREATE FUNCTION qa_f() RETURNS int LANGUAGE sql AS $$ SELECT 1 $$',
        `SELECT pg_read_file('/etc/passwd')`,
        'SELECT * FROM pg_shadow',
        'SELECT rolpassword FROM pg_authid',
      ]) {
        const r = await intentar(c, sql)
        expect(r.codigo, `se permitió: ${sql}`).toBe('42501')
      }
      // Un GRANT de quien no es dueño no da error en PostgreSQL (solo un aviso): se comprueba que no concedió nada.
      await c.query('GRANT UPDATE ON auditoria TO app_empresa')
      expect((await c.query(`SELECT has_table_privilege('app_empresa','auditoria','UPDATE') AS p`)).rows[0].p).toBe(false)
    })
  })
})

describe('caso 8 · roles de base: sin dueño, sin BYPASSRLS, sin superusuario', () => {
  it('los cuatro roles existen y no tienen privilegios de más', async () => {
    const r = await c.query(`SELECT rolname, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolreplication FROM pg_roles WHERE rolname IN ('migraciones','app_empresa','app_plataforma','lector_auditoria')`)
    expect(r.rows.map((f) => f.rolname).sort()).toEqual(['app_empresa', 'app_plataforma', 'lector_auditoria', 'migraciones'])
    for (const f of r.rows) {
      expect(f, f.rolname).toMatchObject({ rolsuper: false, rolbypassrls: false, rolcreaterole: false, rolcreatedb: false, rolreplication: false })
    }
  })

  it('app_empresa, app_plataforma y lector_auditoria no son dueños de ninguna tabla, función ni esquema', async () => {
    const r = await c.query(`
      SELECT 'tabla' AS tipo, c.relname AS nombre FROM pg_class c JOIN pg_roles o ON o.oid = c.relowner WHERE c.relnamespace = 'public'::regnamespace AND o.rolname IN ('app_empresa','app_plataforma','lector_auditoria')
      UNION ALL SELECT 'función', p.proname FROM pg_proc p JOIN pg_roles o ON o.oid = p.proowner WHERE p.pronamespace = 'public'::regnamespace AND o.rolname IN ('app_empresa','app_plataforma','lector_auditoria')
      UNION ALL SELECT 'esquema', n.nspname FROM pg_namespace n JOIN pg_roles o ON o.oid = n.nspowner WHERE o.rolname IN ('app_empresa','app_plataforma','lector_auditoria')`)
    expect(r.rows).toEqual([])
  })

  it('el dueño (migraciones) también queda sujeto a la seguridad por fila (FORCE) y la aplicación no puede entrar como él', async () => {
    const forzadas = await c.query(`SELECT c.relname FROM pg_class c JOIN catalogo_aislamiento a ON a.tabla = c.relname WHERE c.relnamespace='public'::regnamespace AND NOT (c.relrowsecurity AND c.relforcerowsecurity)`)
    expect(forzadas.rows).toEqual([])
    const m = await clienteCon('MIGRATION_DATABASE_URL')
    try {
      for (const t of tablas.filter((x) => x.tabla !== 'membresia')) {
        const r = await m.query(`SELECT count(*)::int AS n FROM ${t.tabla}`)
        expect(r.rows[0].n, `el dueño ve filas de ${t.tabla} sin empresa fijada`).toBe(0)
      }
    } finally {
      await m.end()
    }
  })

  it('app_plataforma y lector_auditoria no leen ninguna tabla de negocio', async () => {
    for (const v of ['PLATFORM_DATABASE_URL', 'AUDIT_READER_DATABASE_URL'] as const) {
      const x = await clienteCon(v)
      try {
        for (const t of tablas) {
          const r = await intentar(x, `SELECT 1 FROM ${t.tabla} LIMIT 1`)
          expect(r.codigo, `${v} lee ${t.tabla}`).toBe('42501')
        }
      } finally {
        await x.end()
      }
    }
  })

  it('app_empresa no lee el control de migraciones de Prisma ni las contraseñas de los roles', async () => {
    const r = await intentar(c, 'SELECT * FROM _prisma_migrations')
    expect(r.codigo).toBe('42501')
  })

  it('las funciones no son ejecutables por PUBLIC y la única SECURITY DEFINER es mis_empresas', async () => {
    const publicas = await c.query(`SELECT p.oid::regprocedure::text AS f FROM pg_proc p WHERE p.pronamespace='public'::regnamespace AND p.prokind='f' AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid=p.oid AND d.deptype='e') AND (p.proacl IS NULL OR EXISTS (SELECT 1 FROM aclexplode(p.proacl) a WHERE a.grantee = 0))`)
    expect(publicas.rows).toEqual([])
    const definer = await c.query(`SELECT proname FROM pg_proc WHERE pronamespace='public'::regnamespace AND prosecdef`)
    expect(definer.rows.map((f) => f.proname)).toEqual(['mis_empresas'])
  })
})
