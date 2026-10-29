import { sinAcceso } from '../errores'
import type { Contexto } from '../tipos-comunes'
import type { Permiso } from './catalogo'
import { exigirPermiso } from './exigir'

type Opciones = { permiso: Permiso } | { sinPermiso: string }

/** Nombres de los servicios definidos, para la prueba de arquitectura (ADR-10). */
export const SERVICIOS_DEFINIDOS: { nombre: string; permiso: Permiso | null }[] = []

/**
 * Única forma de crear un servicio de negocio (ADR-10): comprueba el contexto y el permiso
 * en el servidor ANTES de ejecutar nada. La pantalla solo oculta botones.
 */
export function definirServicio<E = void, S = unknown>(
  nombre: string,
  opciones: Opciones,
  fn: (ctx: Contexto, entrada: E) => Promise<S>,
): (ctx: Contexto, entrada: E) => Promise<S> {
  SERVICIOS_DEFINIDOS.push({ nombre, permiso: 'permiso' in opciones ? opciones.permiso : null })
  return async (ctx, entrada) => {
    if (!ctx || !ctx.empresaId || !ctx.usuarioId || !ctx.permisos) throw sinAcceso()
    if ('permiso' in opciones) exigirPermiso(ctx, opciones.permiso)
    return fn(ctx, entrada)
  }
}
