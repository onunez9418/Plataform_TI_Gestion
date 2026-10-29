import type { Tx } from '../../../nucleo/tipos-comunes'
import type { Usuario } from '../tipos'

type Fila = {
  usuario_id: string; correo: string; nombre: string; rol_id: string; rol_nombre: string
  estado: 'activa' | 'suspendida'; creado_en: Date | string
}

const aUsuario = (f: Fila): Usuario => ({
  usuarioId: f.usuario_id,
  correo: f.correo,
  nombre: f.nombre,
  rolId: f.rol_id,
  rolNombre: f.rol_nombre,
  estado: f.estado === 'activa' ? 'activo' : 'suspendido',
  desde: new Date(f.creado_en).toISOString(),
})

const SELECT_USUARIO = `
  SELECT u.id AS usuario_id, u.correo, u.nombre, m.rol_id, r.nombre AS rol_nombre, m.estado, m.creado_en
    FROM membresia m
    JOIN usuario u ON u.id = m.usuario_id
    JOIN rol r ON r.empresa_id = m.empresa_id AND r.id = m.rol_id`

export async function listar(tx: Tx, empresaId: string): Promise<Usuario[]> {
  const filas = await tx.consultar<Fila>(`${SELECT_USUARIO} WHERE m.empresa_id = $1 ORDER BY u.nombre`, [empresaId])
  return filas.map(aUsuario)
}

export async function obtener(tx: Tx, empresaId: string, usuarioId: string): Promise<Usuario | null> {
  const filas = await tx.consultar<Fila>(`${SELECT_USUARIO} WHERE m.empresa_id = $1 AND u.id = $2`, [
    empresaId,
    usuarioId,
  ])
  return filas[0] ? aUsuario(filas[0]) : null
}

export async function buscarUsuarioGlobalPorCorreo(tx: Tx, correo: string): Promise<{ id: string } | null> {
  const filas = await tx.consultar<{ id: string }>(`SELECT id FROM usuario WHERE correo_norm = $1`, [correo])
  return filas[0] ?? null
}

export async function crearUsuarioGlobal(tx: Tx, correo: string, nombre: string): Promise<string> {
  const filas = await tx.consultar<{ id: string }>(
    `INSERT INTO usuario (correo, nombre, estado) VALUES ($1, $2, 'activo') RETURNING id`,
    [correo, nombre],
  )
  return (filas[0] as { id: string }).id
}

export async function existeMembresia(tx: Tx, empresaId: string, usuarioId: string): Promise<boolean> {
  const f = await tx.consultar(`SELECT 1 FROM membresia WHERE empresa_id = $1 AND usuario_id = $2`, [empresaId, usuarioId])
  return f.length > 0
}

export async function crearMembresia(tx: Tx, empresaId: string, usuarioId: string, rolId: string): Promise<void> {
  await tx.consultar(
    `INSERT INTO membresia (empresa_id, usuario_id, rol_id, estado) VALUES ($1, $2, $3, 'activa')`,
    [empresaId, usuarioId, rolId],
  )
}

export async function cambiarRolDeMembresia(tx: Tx, empresaId: string, usuarioId: string, rolId: string): Promise<number> {
  const f = await tx.consultar(
    `UPDATE membresia SET rol_id = $3 WHERE empresa_id = $1 AND usuario_id = $2 RETURNING id`,
    [empresaId, usuarioId, rolId],
  )
  return f.length
}

export async function cambiarEstadoDeMembresia(
  tx: Tx, empresaId: string, usuarioId: string, estado: 'activa' | 'suspendida',
): Promise<number> {
  const f = await tx.consultar(
    `UPDATE membresia SET estado = $3 WHERE empresa_id = $1 AND usuario_id = $2 AND estado <> $3 RETURNING id`,
    [empresaId, usuarioId, estado],
  )
  return f.length
}

/** Permisos de un rol de la empresa, o null si el rol no existe. */
export async function permisosDeRol(tx: Tx, empresaId: string, rolId: string): Promise<{ nombre: string; permisos: string[] } | null> {
  const r = await tx.consultar<{ nombre: string }>(`SELECT nombre FROM rol WHERE empresa_id = $1 AND id = $2`, [empresaId, rolId])
  if (!r[0]) return null
  const p = await tx.consultar<{ permiso: string }>(`SELECT permiso FROM rol_permiso WHERE empresa_id = $1 AND rol_id = $2`, [empresaId, rolId])
  return { nombre: r[0].nombre, permisos: p.map((x) => x.permiso) }
}
