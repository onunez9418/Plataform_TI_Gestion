import type { Tx } from '../../../nucleo/tipos-comunes'
import type { ControlSku, Sku } from '../tipos'

type Fila = {
  id: string; codigo: string; nombre: string; categoria_id: string; categoria_nombre: string
  control: ControlSku; valores: Record<string, unknown>; activo: boolean; codigo_propio: boolean
}

const aSku = (f: Fila): Sku => ({
  id: f.id, codigo: f.codigo, nombre: f.nombre, categoriaId: f.categoria_id, categoriaNombre: f.categoria_nombre,
  control: f.control, valores: f.valores ?? {}, activo: f.activo, codigoPropio: f.codigo_propio,
})

const SELECT_SKU = `
  SELECT s.id, s.codigo, s.nombre, s.categoria_id, c.nombre AS categoria_nombre, s.control, s.valores, s.activo, s.codigo_propio
    FROM sku s JOIN categoria c ON c.empresa_id = s.empresa_id AND c.id = s.categoria_id`

/** Escapa % y _ para que el texto buscado se tome literal en ILIKE. */
const comoPatron = (t: string): string => `%${t.replace(/[\\%_]/g, (m) => `\\${m}`)}%`

export async function listar(tx: Tx, empresaId: string, filtro: { texto?: string; categoriaId?: string }): Promise<Sku[]> {
  const f = await tx.consultar<Fila>(
    `${SELECT_SKU}
      WHERE s.empresa_id = $1
        AND ($2::uuid IS NULL OR s.categoria_id = $2)
        AND ($3::text IS NULL OR s.codigo ILIKE $3 OR s.nombre ILIKE $3)
      ORDER BY s.codigo_norm LIMIT 500`,
    [empresaId, filtro.categoriaId ?? null, filtro.texto ? comoPatron(filtro.texto) : null],
  )
  return f.map(aSku)
}

export async function obtener(tx: Tx, empresaId: string, id: string): Promise<Sku | null> {
  const f = await tx.consultar<Fila>(`${SELECT_SKU} WHERE s.empresa_id = $1 AND s.id = $2`, [empresaId, id])
  return f[0] ? aSku(f[0]) : null
}

export async function insertar(
  tx: Tx, empresaId: string,
  s: { categoriaId: string; codigo: string; codigoPropio: boolean; nombre: string; control: ControlSku; valores: Record<string, unknown> },
): Promise<string> {
  const f = await tx.consultar<{ id: string }>(
    `INSERT INTO sku (empresa_id, categoria_id, codigo, codigo_propio, nombre, control, valores)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb) RETURNING id`,
    [empresaId, s.categoriaId, s.codigo, s.codigoPropio, s.nombre, s.control, JSON.stringify(s.valores)],
  )
  return (f[0] as { id: string }).id
}
