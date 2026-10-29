import { sinPermiso } from '../errores'
import type { Contexto } from '../tipos-comunes'
import { etiquetaDe, type Permiso } from './catalogo'

/** Única comprobación de permisos del servidor: «este usuario, en esta empresa, ¿puede hacer esto?». */
export function puede(ctx: Contexto, permiso: Permiso): boolean {
  return ctx.permisos.has(permiso)
}

export function exigirPermiso(ctx: Contexto, permiso: Permiso): void {
  if (!puede(ctx, permiso)) {
    throw sinPermiso(`No tiene permiso para: ${etiquetaDe(permiso).toLowerCase()}.`)
  }
}
