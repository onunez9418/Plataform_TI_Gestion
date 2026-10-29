import { conGlobal } from '../aislamiento'
import { sinAcceso } from '../errores'
import type { Tx } from '../tipos-comunes'
import { MINUTOS_INACTIVIDAD_SESION } from './constantes'
import { COOKIE_SESION, leerCookie } from './cookies'
import { huellaDe, TOKEN_VALIDO } from './tokens'

export type SesionValida = { sesionId: string; usuarioId: string; usuarioNombre: string }

/**
 * Valida la sesión contra la base en CADA petición (ADR-08): así suspender o revocar corta el acceso
 * al instante. Renueva la actividad. Devuelve null si no hay sesión vigente.
 */
export async function validarSesionConTx(tx: Tx, token: string | undefined): Promise<SesionValida | null> {
  if (!token || !TOKEN_VALIDO.test(token)) return null
  const filas = await tx.consultar<{ id: string; usuario_id: string; nombre: string }>(
    `UPDATE sesion s
        SET ultima_actividad_en = now()
       FROM usuario u
      WHERE s.huella = $1
        AND s.revocada_en IS NULL
        AND s.expira_en > now()
        AND s.ultima_actividad_en > now() - make_interval(mins => $2)
        AND u.id = s.usuario_id
        AND u.estado = 'activo'
    RETURNING s.id, s.usuario_id, u.nombre`,
    [huellaDe(token), MINUTOS_INACTIVIDAD_SESION],
  )
  const f = filas[0]
  return f ? { sesionId: f.id, usuarioId: f.usuario_id, usuarioNombre: f.nombre } : null
}

/** Lee la cookie y valida. Lanza SIN_ACCESO si no hay sesión vigente. */
export async function exigirSesion(): Promise<SesionValida> {
  const token = await leerCookie(COOKIE_SESION())
  const sesion = await conGlobal((tx) => validarSesionConTx(tx, token))
  if (!sesion) throw sinAcceso('Su sesión terminó. Vuelva a ingresar.')
  return sesion
}
