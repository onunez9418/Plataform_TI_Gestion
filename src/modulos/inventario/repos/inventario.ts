import type { Tx } from '../../../nucleo/tipos-comunes'
import type { Activo, Existencia, EstadoActivo, MovimientoActivo } from '../tipos'

type FilaActivo = {
  id: string; sku_id: string; sku_codigo: string; sku_nombre: string; serie: string; estado: EstadoActivo
  ubicacion_id: string; ubicacion_nombre: string; persona_id: string | null; persona_nombre: string | null
  creado_en: Date | string
}

const iso = (f: Date | string): string => new Date(f).toISOString()

const aActivo = (f: FilaActivo): Activo => ({
  id: f.id, skuId: f.sku_id, skuCodigo: f.sku_codigo, skuNombre: f.sku_nombre, serie: f.serie, estado: f.estado,
  ubicacionId: f.ubicacion_id, ubicacionNombre: f.ubicacion_nombre, personaId: f.persona_id,
  personaNombre: f.persona_nombre, creadoEn: iso(f.creado_en),
})

const SELECT_ACTIVO = `
  SELECT a.id, a.sku_id, s.codigo AS sku_codigo, s.nombre AS sku_nombre, a.serie, a.estado,
         a.ubicacion_id, u.nombre AS ubicacion_nombre, p.id AS persona_id, p.nombre AS persona_nombre, a.creado_en
    FROM activo a
    JOIN sku s ON s.empresa_id = a.empresa_id AND s.id = a.sku_id
    JOIN ubicacion u ON u.empresa_id = a.empresa_id AND u.id = a.ubicacion_id
    LEFT JOIN asignacion g ON g.empresa_id = a.empresa_id AND g.activo_id = a.id AND g.hasta IS NULL
    LEFT JOIN persona p ON p.empresa_id = g.empresa_id AND p.id = g.persona_id`

/** Escapa % y _ para que el texto buscado se tome literal en ILIKE. */
const comoPatron = (t: string): string => `%${t.replace(/[\\%_]/g, (m) => `\\${m}`)}%`

export async function listarActivos(
  tx: Tx, empresaId: string, f: { texto?: string; skuId?: string; estado?: string; personaId?: string },
): Promise<Activo[]> {
  const filas = await tx.consultar<FilaActivo>(
    `${SELECT_ACTIVO}
      WHERE a.empresa_id = $1 AND a.anulado_en IS NULL
        AND ($2::text IS NULL OR a.serie ILIKE $2 OR s.codigo ILIKE $2 OR s.nombre ILIKE $2)
        AND ($3::uuid IS NULL OR a.sku_id = $3)
        AND ($4::text IS NULL OR a.estado = $4)
        AND ($5::uuid IS NULL OR p.id = $5)
      ORDER BY s.codigo, a.serie_norm LIMIT 500`,
    [empresaId, f.texto ? comoPatron(f.texto) : null, f.skuId ?? null, f.estado ?? null, f.personaId ?? null],
  )
  return filas.map(aActivo)
}

export async function obtenerActivo(tx: Tx, empresaId: string, id: string, bloquear = false): Promise<Activo | null> {
  if (bloquear) {
    // Bloquea la fila del activo (no las uniones) para que dos personas no lo muevan a la vez.
    await tx.consultar(`SELECT 1 FROM activo WHERE empresa_id = $1 AND id = $2 FOR UPDATE`, [empresaId, id])
  }
  const f = await tx.consultar<FilaActivo>(`${SELECT_ACTIVO} WHERE a.empresa_id = $1 AND a.id = $2 AND a.anulado_en IS NULL`, [empresaId, id])
  return f[0] ? aActivo(f[0]) : null
}

export async function listarExistencias(tx: Tx, empresaId: string): Promise<Existencia[]> {
  const f = await tx.consultar<{
    sku_id: string; sku_codigo: string; sku_nombre: string; ubicacion_id: string; ubicacion_nombre: string; cantidad: string | number
  }>(
    `SELECT e.sku_id, s.codigo AS sku_codigo, s.nombre AS sku_nombre, e.ubicacion_id, u.nombre AS ubicacion_nombre, e.cantidad
       FROM existencia e
       JOIN sku s ON s.empresa_id = e.empresa_id AND s.id = e.sku_id
       JOIN ubicacion u ON u.empresa_id = e.empresa_id AND u.id = e.ubicacion_id
      WHERE e.empresa_id = $1
      ORDER BY s.codigo, u.nombre LIMIT 500`,
    [empresaId],
  )
  return f.map((x) => ({
    skuId: x.sku_id, skuCodigo: x.sku_codigo, skuNombre: x.sku_nombre, ubicacionId: x.ubicacion_id,
    ubicacionNombre: x.ubicacion_nombre, cantidad: Number(x.cantidad),
  }))
}

export type SkuParaInventario = { id: string; codigo: string; nombre: string; control: 'serie' | 'cantidad'; activo: boolean }

export async function obtenerSkuParaInventario(tx: Tx, empresaId: string, id: string): Promise<SkuParaInventario | null> {
  const f = await tx.consultar<SkuParaInventario>(
    `SELECT id, codigo, nombre, control, activo FROM sku WHERE empresa_id = $1 AND id = $2`, [empresaId, id])
  return f[0] ?? null
}

export async function obtenerUbicacion(tx: Tx, empresaId: string, id: string): Promise<{ id: string; nombre: string; activo: boolean } | null> {
  const f = await tx.consultar<{ id: string; nombre: string; activo: boolean }>(
    `SELECT id, nombre, activo FROM ubicacion WHERE empresa_id = $1 AND id = $2`, [empresaId, id])
  return f[0] ?? null
}

export async function obtenerPersona(tx: Tx, empresaId: string, id: string): Promise<{ id: string; nombre: string; activo: boolean; correo_norm: string | null } | null> {
  const f = await tx.consultar<{ id: string; nombre: string; activo: boolean; correo_norm: string | null }>(
    `SELECT id, nombre, activo, correo_norm FROM persona WHERE empresa_id = $1 AND id = $2`, [empresaId, id])
  return f[0] ?? null
}

/** Series que ya existen para este SKU (ya normalizadas: minúsculas y sin espacios). */
export async function seriesExistentes(tx: Tx, empresaId: string, skuId: string, normalizadas: string[]): Promise<string[]> {
  const f = await tx.consultar<{ serie: string }>(
    `SELECT serie FROM activo WHERE empresa_id = $1 AND sku_id = $2 AND anulado_en IS NULL AND serie_norm = ANY($3::text[])
      ORDER BY serie_norm`,
    [empresaId, skuId, normalizadas],
  )
  return f.map((x) => x.serie)
}

export async function insertarActivo(tx: Tx, empresaId: string, skuId: string, ubicacionId: string, serie: string): Promise<string> {
  const f = await tx.consultar<{ id: string }>(
    `INSERT INTO activo (empresa_id, sku_id, serie, ubicacion_id) VALUES ($1, $2, $3, $4) RETURNING id`,
    [empresaId, skuId, serie, ubicacionId],
  )
  return (f[0] as { id: string }).id
}

/** Suma al saldo (crea la fila si no existe). La base rechaza saldos negativos o por encima del tope. */
export async function sumarExistencia(tx: Tx, empresaId: string, skuId: string, ubicacionId: string, cantidad: number): Promise<number> {
  const f = await tx.consultar<{ id: string; cantidad: string }>(
    `INSERT INTO existencia (empresa_id, sku_id, ubicacion_id, cantidad) VALUES ($1, $2, $3, $4)
     ON CONFLICT (empresa_id, sku_id, ubicacion_id) DO UPDATE SET cantidad = existencia.cantidad + EXCLUDED.cantidad
     RETURNING id, cantidad`,
    [empresaId, skuId, ubicacionId, cantidad],
  )
  return Number((f[0] as { cantidad: string }).cantidad)
}

export async function abrirAsignacion(tx: Tx, empresaId: string, activoId: string, personaId: string, membresiaId: string): Promise<void> {
  await tx.ejecutar(
    `INSERT INTO asignacion (empresa_id, activo_id, persona_id, asignada_por_membresia_id) VALUES ($1, $2, $3, $4)`,
    [empresaId, activoId, personaId, membresiaId],
  )
}

/** Cierra la asignación abierta y devuelve la persona que lo tenía (o null si no había). */
export async function cerrarAsignacion(tx: Tx, empresaId: string, activoId: string): Promise<string | null> {
  const f = await tx.consultar<{ persona_id: string }>(
    `UPDATE asignacion SET hasta = now() WHERE empresa_id = $1 AND activo_id = $2 AND hasta IS NULL RETURNING persona_id`,
    [empresaId, activoId],
  )
  return f[0]?.persona_id ?? null
}

export async function cambiarEstadoYUbicacion(tx: Tx, empresaId: string, activoId: string, estado: EstadoActivo, ubicacionId?: string): Promise<void> {
  await tx.ejecutar(
    `UPDATE activo SET estado = $3, ubicacion_id = COALESCE($4::uuid, ubicacion_id) WHERE empresa_id = $1 AND id = $2`,
    [empresaId, activoId, estado, ubicacionId ?? null],
  )
}

/** ¿Es la misma persona que quien opera? (la autoentrega está prohibida, PS-55). Compara por correo. */
export async function correoDelUsuario(tx: Tx, usuarioId: string): Promise<string | null> {
  const f = await tx.consultar<{ correo_norm: string }>(`SELECT correo_norm FROM usuario WHERE id = $1`, [usuarioId])
  return f[0]?.correo_norm ?? null
}

/**
 * Historial a partir de la auditoría (misma transacción que el cambio). La auditoría guarda solo identificadores
 * (personaId, ubicacionId); los nombres se resuelven aquí para no copiar datos personales a la auditoría.
 */
export async function historial(tx: Tx, empresaId: string, activoId: string): Promise<MovimientoActivo[]> {
  const f = await tx.consultar<{
    id: string; accion: string; creado_en: Date | string; persona_nombre: string | null
    ubicacion_nombre: string | null; autor_nombre: string | null; motivo: string | null
  }>(
    `SELECT a.id, a.accion, a.creado_en, p.nombre AS persona_nombre, ub.nombre AS ubicacion_nombre,
            us.nombre AS autor_nombre, a.motivo
       FROM auditoria a
       LEFT JOIN persona p ON p.empresa_id = a.empresa_id AND p.id::text = a.cambios->>'personaId'
       LEFT JOIN ubicacion ub ON ub.empresa_id = a.empresa_id AND ub.id::text = a.cambios->>'ubicacionId'
       LEFT JOIN membresia m ON m.empresa_id = a.empresa_id AND m.id = a.autor_membresia_id
       LEFT JOIN usuario us ON us.id = m.usuario_id
      WHERE a.empresa_id = $1 AND a.entidad_tipo = 'activo' AND a.entidad_id = $2
        AND a.accion IN ('activo.registrar', 'activo.asignar', 'activo.devolver')
      ORDER BY a.creado_en DESC, a.id DESC`,
    [empresaId, activoId],
  )
  const tipo = { 'activo.registrar': 'registro', 'activo.asignar': 'asignacion', 'activo.devolver': 'devolucion' } as const
  return f.map((x) => ({
    id: x.id, tipo: tipo[x.accion as keyof typeof tipo], creadoEn: iso(x.creado_en),
    personaNombre: x.persona_nombre, ubicacionNombre: x.ubicacion_nombre, autorNombre: x.autor_nombre, motivo: x.motivo,
  }))
}
