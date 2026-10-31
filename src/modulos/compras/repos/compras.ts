import type { Tx } from '../../../nucleo/tipos-comunes'
import type { AprobacionOrden, EstadoOrden, LineaOrden, OrdenResumen, RecepcionOrden } from '../tipos'

const iso = (f: Date | string): string => new Date(f).toISOString()

type FilaOrden = {
  id: string; numero: string; proveedor_id: string; proveedor_nombre: string; estado: EstadoOrden; moneda: string
  total: string | number; preparada_por_nombre: string | null; preparada_por_usuario_id: string
  creado_en: Date | string; enviada_en: Date | string | null
}

const SELECT_ORDEN = `
  SELECT o.id, o.numero, o.proveedor_id, pr.nombre AS proveedor_nombre, o.estado, o.moneda,
         COALESCE((SELECT sum(l.cantidad * l.precio_unitario) FROM orden_linea l WHERE l.empresa_id = o.empresa_id AND l.orden_id = o.id), 0) AS total,
         u.nombre AS preparada_por_nombre, m.usuario_id AS preparada_por_usuario_id, o.creado_en, o.enviada_en
    FROM orden_compra o
    JOIN proveedor pr ON pr.empresa_id = o.empresa_id AND pr.id = o.proveedor_id
    JOIN membresia m ON m.empresa_id = o.empresa_id AND m.id = o.preparada_por_membresia_id
    JOIN usuario u ON u.id = m.usuario_id`

const aResumen = (f: FilaOrden): OrdenResumen => ({
  id: f.id, numero: f.numero, proveedorId: f.proveedor_id, proveedorNombre: f.proveedor_nombre, estado: f.estado,
  moneda: f.moneda, total: Number(f.total), preparadaPorNombre: f.preparada_por_nombre,
  creadoEn: iso(f.creado_en), enviadaEn: f.enviada_en ? iso(f.enviada_en) : null,
})

export async function listar(tx: Tx, empresaId: string): Promise<OrdenResumen[]> {
  const f = await tx.consultar<FilaOrden>(`${SELECT_ORDEN} WHERE o.empresa_id = $1 ORDER BY o.creado_en DESC, o.numero DESC LIMIT 300`, [empresaId])
  return f.map(aResumen)
}

/** La orden con el usuario que la preparó (para la separación de funciones). `bloquear` toma la fila para modificarla. */
export async function obtenerResumen(
  tx: Tx, empresaId: string, id: string, bloquear = false,
): Promise<(OrdenResumen & { preparadaPorUsuarioId: string }) | null> {
  if (bloquear) await tx.consultar(`SELECT 1 FROM orden_compra WHERE empresa_id = $1 AND id = $2 FOR UPDATE`, [empresaId, id])
  const f = await tx.consultar<FilaOrden>(`${SELECT_ORDEN} WHERE o.empresa_id = $1 AND o.id = $2`, [empresaId, id])
  return f[0] ? { ...aResumen(f[0]), preparadaPorUsuarioId: f[0].preparada_por_usuario_id } : null
}

export async function lineas(tx: Tx, empresaId: string, ordenId: string): Promise<LineaOrden[]> {
  const f = await tx.consultar<{
    id: string; sku_id: string; sku_codigo: string; sku_nombre: string; control: 'serie' | 'cantidad'
    cantidad: string | number; precio_unitario: string | number; cantidad_recibida: string | number
  }>(
    `SELECT l.id, l.sku_id, s.codigo AS sku_codigo, s.nombre AS sku_nombre, s.control, l.cantidad, l.precio_unitario, l.cantidad_recibida
       FROM orden_linea l JOIN sku s ON s.empresa_id = l.empresa_id AND s.id = l.sku_id
      WHERE l.empresa_id = $1 AND l.orden_id = $2 ORDER BY s.codigo`,
    [empresaId, ordenId],
  )
  return f.map((x) => ({
    id: x.id, skuId: x.sku_id, skuCodigo: x.sku_codigo, skuNombre: x.sku_nombre, control: x.control,
    cantidad: Number(x.cantidad), precioUnitario: Number(x.precio_unitario), cantidadRecibida: Number(x.cantidad_recibida),
    pendiente: Number(x.cantidad) - Number(x.cantidad_recibida),
  }))
}

export async function aprobaciones(tx: Tx, empresaId: string, ordenId: string): Promise<AprobacionOrden[]> {
  const f = await tx.consultar<{ decision: 'aprobada' | 'rechazada'; aprobador_nombre: string | null; motivo: string | null; creado_en: Date | string }>(
    `SELECT a.decision, u.nombre AS aprobador_nombre, a.motivo, a.creado_en
       FROM orden_aprobacion a
       JOIN membresia m ON m.empresa_id = a.empresa_id AND m.id = a.aprobador_membresia_id
       JOIN usuario u ON u.id = m.usuario_id
      WHERE a.empresa_id = $1 AND a.orden_id = $2 ORDER BY a.creado_en, a.id`,
    [empresaId, ordenId],
  )
  return f.map((x) => ({ decision: x.decision, aprobadorNombre: x.aprobador_nombre, motivo: x.motivo, creadoEn: iso(x.creado_en) }))
}

/** Usuarios que aprobaron la orden (para la separación de funciones: quien aprobó no la recibe). */
export async function usuariosQueAprobaron(tx: Tx, empresaId: string, ordenId: string): Promise<string[]> {
  const f = await tx.consultar<{ usuario_id: string }>(
    `SELECT DISTINCT m.usuario_id
       FROM orden_aprobacion a
       JOIN membresia m ON m.empresa_id = a.empresa_id AND m.id = a.aprobador_membresia_id
      WHERE a.empresa_id = $1 AND a.orden_id = $2 AND a.decision = 'aprobada'`,
    [empresaId, ordenId],
  )
  return f.map((x) => x.usuario_id)
}

export async function recepciones(tx: Tx, empresaId: string, ordenId: string): Promise<RecepcionOrden[]> {
  const cab = await tx.consultar<{ id: string; numero: string; ubicacion_nombre: string; recibida_por_nombre: string | null; creado_en: Date | string }>(
    `SELECT r.id, r.numero, ub.nombre AS ubicacion_nombre, u.nombre AS recibida_por_nombre, r.creado_en
       FROM recepcion r
       JOIN ubicacion ub ON ub.empresa_id = r.empresa_id AND ub.id = r.ubicacion_id
       JOIN membresia m ON m.empresa_id = r.empresa_id AND m.id = r.recibida_por_membresia_id
       JOIN usuario u ON u.id = m.usuario_id
      WHERE r.empresa_id = $1 AND r.orden_id = $2 ORDER BY r.creado_en, r.numero`,
    [empresaId, ordenId],
  )
  const det = await tx.consultar<{ recepcion_id: string; sku_codigo: string; sku_nombre: string; cantidad: string | number; series: string[] | null }>(
    `SELECT rl.recepcion_id, s.codigo AS sku_codigo, s.nombre AS sku_nombre, rl.cantidad, rl.series
       FROM recepcion_linea rl
       JOIN recepcion r ON r.empresa_id = rl.empresa_id AND r.id = rl.recepcion_id
       JOIN orden_linea l ON l.empresa_id = rl.empresa_id AND l.id = rl.orden_linea_id
       JOIN sku s ON s.empresa_id = l.empresa_id AND s.id = l.sku_id
      WHERE rl.empresa_id = $1 AND r.orden_id = $2 ORDER BY s.codigo`,
    [empresaId, ordenId],
  )
  return cab.map((c) => ({
    id: c.id, numero: c.numero, ubicacionNombre: c.ubicacion_nombre, recibidaPorNombre: c.recibida_por_nombre, creadoEn: iso(c.creado_en),
    lineas: det.filter((d) => d.recepcion_id === c.id).map((d) => ({
      skuCodigo: d.sku_codigo, skuNombre: d.sku_nombre, cantidad: Number(d.cantidad), series: d.series ?? [],
    })),
  }))
}

export async function proveedor(tx: Tx, empresaId: string, id: string): Promise<{ id: string; activo: boolean } | null> {
  const f = await tx.consultar<{ id: string; activo: boolean }>(`SELECT id, activo FROM proveedor WHERE empresa_id = $1 AND id = $2`, [empresaId, id])
  return f[0] ?? null
}

export async function skusPorId(tx: Tx, empresaId: string, ids: string[]): Promise<Map<string, { id: string; codigo: string; activo: boolean }>> {
  const f = await tx.consultar<{ id: string; codigo: string; activo: boolean }>(
    `SELECT id, codigo, activo FROM sku WHERE empresa_id = $1 AND id = ANY($2::uuid[])`, [empresaId, ids])
  return new Map(f.map((x) => [x.id, x]))
}

export async function insertarOrden(tx: Tx, empresaId: string, numero: string, proveedorId: string, membresiaId: string): Promise<string> {
  const f = await tx.consultar<{ id: string }>(
    `INSERT INTO orden_compra (empresa_id, numero, proveedor_id, preparada_por_membresia_id) VALUES ($1, $2, $3, $4) RETURNING id`,
    [empresaId, numero, proveedorId, membresiaId],
  )
  return (f[0] as { id: string }).id
}

export async function insertarLinea(tx: Tx, empresaId: string, ordenId: string, skuId: string, cantidad: number, precio: number): Promise<void> {
  await tx.ejecutar(
    `INSERT INTO orden_linea (empresa_id, orden_id, sku_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4, $5)`,
    [empresaId, ordenId, skuId, cantidad, precio],
  )
}

export async function cambiarEstado(tx: Tx, empresaId: string, ordenId: string, estado: EstadoOrden, marcarEnvio = false): Promise<void> {
  await tx.ejecutar(
    `UPDATE orden_compra SET estado = $3, enviada_en = CASE WHEN $4::boolean THEN now() ELSE enviada_en END WHERE empresa_id = $1 AND id = $2`,
    [empresaId, ordenId, estado, marcarEnvio],
  )
}

export async function insertarAprobacion(tx: Tx, empresaId: string, ordenId: string, membresiaId: string, decision: 'aprobada' | 'rechazada', motivo: string | null): Promise<void> {
  await tx.ejecutar(
    `INSERT INTO orden_aprobacion (empresa_id, orden_id, aprobador_membresia_id, decision, motivo) VALUES ($1, $2, $3, $4, $5)`,
    [empresaId, ordenId, membresiaId, decision, motivo],
  )
}

export async function insertarRecepcion(tx: Tx, empresaId: string, numero: string, ordenId: string, ubicacionId: string, membresiaId: string): Promise<string> {
  const f = await tx.consultar<{ id: string }>(
    `INSERT INTO recepcion (empresa_id, numero, orden_id, ubicacion_id, recibida_por_membresia_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [empresaId, numero, ordenId, ubicacionId, membresiaId],
  )
  return (f[0] as { id: string }).id
}

/** La base suma lo recibido a la línea (disparador) y rechaza pasarse de lo pedido. */
export async function insertarRecepcionLinea(tx: Tx, empresaId: string, recepcionId: string, lineaId: string, cantidad: number, series: string[] | null): Promise<void> {
  await tx.ejecutar(
    `INSERT INTO recepcion_linea (empresa_id, recepcion_id, orden_linea_id, cantidad, series) VALUES ($1, $2, $3, $4, $5::text[])`,
    [empresaId, recepcionId, lineaId, cantidad, series],
  )
}
