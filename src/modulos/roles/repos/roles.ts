import type { Tx } from '../../../nucleo/tipos-comunes'
import type { Rol } from '../tipos'

type Fila = { id: string; nombre: string; es_base: boolean; permisos: string[]; usuarios: number | string }

const aRol = (f: Fila): Rol => ({
  id: f.id, nombre: f.nombre, esBase: f.es_base, permisos: f.permisos ?? [], usuarios: Number(f.usuarios),
})

const SELECT_ROL = `
  SELECT r.id, r.nombre, r.es_base,
         COALESCE(array_agg(rp.permiso ORDER BY rp.permiso) FILTER (WHERE rp.permiso IS NOT NULL), '{}') AS permisos,
         (SELECT count(*) FROM membresia m WHERE m.empresa_id = r.empresa_id AND m.rol_id = r.id) AS usuarios
    FROM rol r
    LEFT JOIN rol_permiso rp ON rp.empresa_id = r.empresa_id AND rp.rol_id = r.id
   WHERE r.empresa_id = $1`

export async function listar(tx: Tx, empresaId: string): Promise<Rol[]> {
  const f = await tx.consultar<Fila>(`${SELECT_ROL} GROUP BY r.empresa_id, r.id, r.nombre, r.es_base ORDER BY r.es_base DESC, r.nombre`, [empresaId])
  return f.map(aRol)
}

export async function obtener(tx: Tx, empresaId: string, rolId: string): Promise<Rol | null> {
  const f = await tx.consultar<Fila>(`${SELECT_ROL} AND r.id = $2 GROUP BY r.empresa_id, r.id, r.nombre, r.es_base`, [empresaId, rolId])
  return f[0] ? aRol(f[0]) : null
}

export async function crear(tx: Tx, empresaId: string, nombre: string): Promise<string> {
  const f = await tx.consultar<{ id: string }>(
    `INSERT INTO rol (empresa_id, nombre, es_base) VALUES ($1, $2, false) RETURNING id`,
    [empresaId, nombre],
  )
  return (f[0] as { id: string }).id
}

export async function renombrar(tx: Tx, empresaId: string, rolId: string, nombre: string): Promise<void> {
  await tx.consultar(`UPDATE rol SET nombre = $3 WHERE empresa_id = $1 AND id = $2`, [empresaId, rolId, nombre])
}

/** Deja exactamente `permisos` como los permisos del rol. */
export async function fijarPermisos(tx: Tx, empresaId: string, rolId: string, permisos: string[]): Promise<void> {
  await tx.consultar(
    `DELETE FROM rol_permiso WHERE empresa_id = $1 AND rol_id = $2 AND NOT (permiso = ANY($3::text[]))`,
    [empresaId, rolId, permisos],
  )
  await tx.consultar(
    `INSERT INTO rol_permiso (empresa_id, rol_id, permiso)
     SELECT $1, $2, p FROM unnest($3::text[]) AS p
      WHERE NOT EXISTS (SELECT 1 FROM rol_permiso x WHERE x.empresa_id = $1 AND x.rol_id = $2 AND x.permiso = p)`,
    [empresaId, rolId, permisos],
  )
}
