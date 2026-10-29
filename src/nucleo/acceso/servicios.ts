import { conGlobal } from '../aislamiento'
import { enlaceInvalido, validacion } from '../errores'
import { modoLocalActivo } from '../configuracion'
import {
  HORAS_VIDA_SESION, SEGUNDOS_VIDA_COOKIE_NAVEGADOR, SEGUNDOS_VIDA_COOKIE_SESION,
} from './constantes'
import { borrarCookie, COOKIE_NAVEGADOR, COOKIE_SESION, escribirCookie, leerCookie } from './cookies'
import { crearEnlaceIngreso, enlaceSenuelo } from './emitir'
import { exigirSesion } from './sesion'
import { generarToken, huellaDe, TOKEN_VALIDO } from './tokens'
import type { EmpresaResumen, ResultadoCanjear, ResultadoSolicitarEnlace } from './tipos'

const CORREO_VALIDO = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/

/**
 * Pide un enlace de ingreso. Misma respuesta exista o no el correo (D-054.3).
 * En MODO_LOCAL devuelve la ruta para mostrarla en pantalla; sin MODO_LOCAL no hay correo en la 0.1,
 * así que no se crea nada.
 */
export async function solicitarEnlace(correo: string): Promise<ResultadoSolicitarEnlace> {
  const limpio = (correo ?? '').trim().toLowerCase()
  if (!CORREO_VALIDO.test(limpio)) throw validacion('Escriba un correo válido.', { correo: 'Escriba un correo válido.' })
  if (!modoLocalActivo()) return {}

  // El enlace queda atado al navegador que lo pidió (cookie `nav`, ADR-08).
  let navegador = await leerCookie(COOKIE_NAVEGADOR())
  if (!navegador || !TOKEN_VALIDO.test(navegador)) {
    navegador = generarToken()
    await escribirCookie(COOKIE_NAVEGADOR(), navegador, SEGUNDOS_VIDA_COOKIE_NAVEGADOR)
  }
  const huellaNavegador = huellaDe(navegador)

  return conGlobal(async (tx) => {
    const u = await tx.consultar<{ id: string }>(
      `SELECT id FROM usuario WHERE correo_norm = $1 AND estado = 'activo'`,
      [limpio],
    )
    return u[0] ? crearEnlaceIngreso(tx, u[0].id, huellaNavegador) : enlaceSenuelo()
  })
}

/** Canjea el enlace por una sesión. Es de un solo uso. Solo se llama desde un POST (botón «Entrar»). */
export async function canjearEnlace(token: string): Promise<ResultadoCanjear> {
  if (!token || !TOKEN_VALIDO.test(token)) throw enlaceInvalido()
  const navegador = await leerCookie(COOKIE_NAVEGADOR())
  const huellaNavegador = navegador && TOKEN_VALIDO.test(navegador) ? huellaDe(navegador) : null
  const tokenSesion = generarToken()

  const empresas = await conGlobal(async (tx) => {
    // Una sola sentencia: comprueba que vale, que es del navegador correcto y lo gasta.
    const gastado = await tx.consultar<{ usuario_id: string }>(
      `UPDATE enlace_ingreso e
          SET consumido_en = now()
         FROM usuario u
        WHERE e.huella = $1
          AND e.consumido_en IS NULL
          AND e.vence_en > now()
          AND (e.navegador_huella IS NULL OR e.navegador_huella = $2)
          AND u.id = e.usuario_id
          AND u.estado = 'activo'
      RETURNING e.usuario_id`,
      [huellaDe(token), huellaNavegador],
    )
    const usuarioId = gastado[0]?.usuario_id
    if (!usuarioId) throw enlaceInvalido()

    await tx.consultar(
      `INSERT INTO sesion (usuario_id, huella, expira_en, ultima_actividad_en)
       VALUES ($1, $2, now() + make_interval(hours => $3), now())`,
      [usuarioId, huellaDe(tokenSesion), HORAS_VIDA_SESION],
    )
    return tx.consultar<{ slug: string; nombre: string }>(
      `SELECT slug, nombre FROM mis_empresas($1) ORDER BY nombre`,
      [usuarioId],
    )
  })

  await escribirCookie(COOKIE_SESION(), tokenSesion, SEGUNDOS_VIDA_COOKIE_SESION)
  await borrarCookie(COOKIE_NAVEGADOR())
  return { empresas: empresas.map((e) => ({ slug: e.slug, nombre: e.nombre })) }
}

/** Revoca la sesión en la base y borra la cookie. No falla si ya no había sesión. */
export async function cerrarSesion(): Promise<void> {
  const token = await leerCookie(COOKIE_SESION())
  if (token && TOKEN_VALIDO.test(token)) {
    await conGlobal((tx) =>
      tx.consultar(`UPDATE sesion SET revocada_en = now() WHERE huella = $1 AND revocada_en IS NULL`, [huellaDe(token)]),
    )
  }
  await borrarCookie(COOKIE_SESION())
}

/** Empresas a las que pertenece quien tiene la sesión (para el selector). */
export async function misEmpresas(): Promise<EmpresaResumen[]> {
  const sesion = await exigirSesion()
  const filas = await conGlobal((tx) =>
    tx.consultar<{ slug: string; nombre: string }>(`SELECT slug, nombre FROM mis_empresas($1) ORDER BY nombre`, [
      sesion.usuarioId,
    ]),
  )
  return filas.map((f) => ({ slug: f.slug, nombre: f.nombre }))
}
