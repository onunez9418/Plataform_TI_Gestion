import { conEmpresa, conGlobal } from '../aislamiento'
import { sinAcceso } from '../errores'
import { esPermisoDelCatalogo } from '../permisos'
import type { Contexto } from '../tipos-comunes'
import { COOKIE_SESION, leerCookie } from './cookies'
import { validarSesionConTx } from './sesion'

const SLUG_VALIDO = /^[a-z0-9][a-z0-9-]{0,39}$/

/**
 * Arma el contexto de una petición: sesión vigente + empresa de la dirección + membresía activa + permisos.
 * Cualquier fallo es SIN_ACCESO con el mismo mensaje (no revela si la empresa existe).
 */
export async function obtenerContexto(empresaSlug: string): Promise<Contexto> {
  const token = await leerCookie(COOKIE_SESION())
  const slug = (empresaSlug ?? '').trim().toLowerCase()

  const previo = await conGlobal(async (tx) => {
    const sesion = await validarSesionConTx(tx, token)
    if (!sesion || !SLUG_VALIDO.test(slug)) return null
    const empresas = await tx.consultar<{ id: string }>(
      `SELECT id FROM empresa WHERE slug = $1 AND estado = 'activa'`,
      [slug],
    )
    return empresas[0] ? { sesion, empresaId: empresas[0].id } : null
  })
  if (!previo) throw sinAcceso()

  const { sesion, empresaId } = previo
  const datos = await conEmpresa(empresaId, async (tx) => {
    const m = await tx.consultar<{ id: string; rol_id: string }>(
      `SELECT id, rol_id FROM membresia WHERE empresa_id = $1 AND usuario_id = $2 AND estado = 'activa'`,
      [empresaId, sesion.usuarioId],
    )
    if (!m[0]) return null
    const permisos = await tx.consultar<{ permiso: string }>(
      `SELECT permiso FROM rol_permiso WHERE empresa_id = $1 AND rol_id = $2`,
      [empresaId, m[0].rol_id],
    )
    return { membresiaId: m[0].id, rolId: m[0].rol_id, permisos: permisos.map((p) => p.permiso) }
  })
  if (!datos) throw sinAcceso()

  return {
    usuarioId: sesion.usuarioId,
    empresaId,
    empresaSlug: slug,
    rolId: datos.rolId,
    permisos: new Set(datos.permisos.filter(esPermisoDelCatalogo)),
    membresiaId: datos.membresiaId,
    usuarioNombre: sesion.usuarioNombre,
  }
}
