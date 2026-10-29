import type { Tx } from '../../../nucleo/tipos-comunes'

/** Tablas de catálogo y sus columnas editables. Los nombres son constantes del código, nunca del usuario. */
const TABLAS = {
  ubicacion: ['nombre', 'descripcion', 'activo'],
  proveedor: ['nombre', 'documento', 'contacto', 'activo'],
  persona: ['nombre', 'correo', 'area', 'activo'],
} as const
export type TablaCatalogo = keyof typeof TABLAS

export async function listar<T>(tx: Tx, tabla: TablaCatalogo, empresaId: string): Promise<T[]> {
  return tx.consultar<T>(`SELECT id, ${TABLAS[tabla].join(', ')} FROM ${tabla} WHERE empresa_id = $1 ORDER BY activo DESC, nombre`, [empresaId])
}

export async function obtener<T>(tx: Tx, tabla: TablaCatalogo, empresaId: string, id: string): Promise<T | null> {
  const f = await tx.consultar<T>(`SELECT id, ${TABLAS[tabla].join(', ')} FROM ${tabla} WHERE empresa_id = $1 AND id = $2`, [empresaId, id])
  return f[0] ?? null
}

export async function insertar<T>(tx: Tx, tabla: TablaCatalogo, empresaId: string, valores: Record<string, unknown>): Promise<T> {
  const columnas = Object.keys(valores).filter((c) => (TABLAS[tabla] as readonly string[]).includes(c))
  const marcadores = columnas.map((_, i) => `$${i + 2}`)
  const f = await tx.consultar<T>(
    `INSERT INTO ${tabla} (empresa_id${columnas.map((c) => `, ${c}`).join('')}) VALUES ($1${marcadores.map((m) => `, ${m}`).join('')})
     RETURNING id, ${TABLAS[tabla].join(', ')}`,
    [empresaId, ...columnas.map((c) => valores[c])],
  )
  return f[0] as T
}

/** Cambia solo las columnas que vienen (lista blanca). Devuelve la fila nueva, o null si no existe. */
export async function actualizar<T>(tx: Tx, tabla: TablaCatalogo, empresaId: string, id: string, parches: Record<string, unknown>): Promise<T | null> {
  const columnas = Object.keys(parches).filter((c) => (TABLAS[tabla] as readonly string[]).includes(c))
  if (columnas.length === 0) return obtener<T>(tx, tabla, empresaId, id)
  const f = await tx.consultar<T>(
    `UPDATE ${tabla} SET ${columnas.map((c, i) => `${c} = $${i + 3}`).join(', ')}
      WHERE empresa_id = $1 AND id = $2 RETURNING id, ${TABLAS[tabla].join(', ')}`,
    [empresaId, id, ...columnas.map((c) => parches[c])],
  )
  return f[0] ?? null
}
