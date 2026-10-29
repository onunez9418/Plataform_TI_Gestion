// Ayudantes de servidor para las páginas: leen el contexto (usuario, empresa, permisos) por la
// única vía permitida, `obtenerContexto`. El permiso que importa lo comprueba siempre el servicio;
// aquí solo se decide qué mostrar.
import { obtenerContexto } from '@/nucleo/acceso'
import type { Contexto } from '@/nucleo/tipos-comunes'
import { aErrorPantalla } from './resultado'
import type { ErrorPantallaDatos } from '@/componentes/ui/tipos-accion'

export type ContextoCargado = { ok: true; ctx: Contexto } | { ok: false; error: ErrorPantallaDatos }

export async function cargarContexto(empresa: string): Promise<ContextoCargado> {
  try {
    return { ok: true, ctx: await obtenerContexto(empresa) }
  } catch (e) {
    return { ok: false, error: aErrorPantalla(e) }
  }
}

export function puede(ctx: Contexto, permiso: string): boolean {
  return ctx.permisos.has(permiso)
}

export function puedeAlguno(ctx: Contexto, permisos: readonly string[]): boolean {
  return permisos.some((p) => ctx.permisos.has(p))
}

/** Carga una lista que un servicio puede rechazar; devuelve los datos o el mensaje del servidor. */
export async function cargarDatos<T>(trabajo: () => Promise<T>): Promise<{ ok: true; datos: T } | { ok: false; error: ErrorPantallaDatos }> {
  try {
    return { ok: true, datos: await trabajo() }
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e && String((e as { digest: unknown }).digest).startsWith('NEXT_')) throw e
    return { ok: false, error: aErrorPantalla(e) }
  }
}
