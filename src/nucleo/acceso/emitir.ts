import { modoLocalActivo } from '../configuracion'
import type { Tx } from '../tipos-comunes'
import { MINUTOS_VIDA_ENLACE } from './constantes'
import { generarToken, huellaDe } from './tokens'

/** Ruta que muestra el botón «Entrar». El token va en `t`; el canje es un POST, nunca un GET. */
export const rutaDeEnlace = (token: string): string => `/entrar/enlace?t=${encodeURIComponent(token)}`

/**
 * Crea un enlace de ingreso de un solo uso (vence a los 15 minutos) para un usuario.
 * Devuelve la ruta SOLO en MODO_LOCAL (sin correo real); fuera de él no se muestra nada.
 * `navegadorHuella`: huella de la cookie de navegador de quien lo pidió; si es nula (invitaciones),
 * el enlace puede canjearse desde cualquier navegador.
 */
export async function crearEnlaceIngreso(
  tx: Tx,
  usuarioId: string,
  navegadorHuella: string | null,
): Promise<{ enlaceLocal?: string }> {
  const token = generarToken()
  await tx.consultar(
    `INSERT INTO enlace_ingreso (usuario_id, huella, navegador_huella, vence_en)
     VALUES ($1, $2, $3, now() + make_interval(mins => $4))`,
    [usuarioId, huellaDe(token), navegadorHuella, MINUTOS_VIDA_ENLACE],
  )
  return modoLocalActivo() ? { enlaceLocal: rutaDeEnlace(token) } : {}
}

/** Enlace falso con la misma forma que uno real (para que un correo inexistente no se distinga). */
export function enlaceSenuelo(): { enlaceLocal?: string } {
  return modoLocalActivo() ? { enlaceLocal: rutaDeEnlace(generarToken()) } : {}
}
