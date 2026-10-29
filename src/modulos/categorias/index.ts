export type * from './tipos'
export { listarCategorias, crearCategoria, agregarCampo, PREFIJOS_RESERVADOS } from './servicios/categorias'
export { validarValores, normalizarDefinicion, claveDesdeEtiqueta, TIPOS_DE_CAMPO, MAX_CAMPOS_POR_CATEGORIA } from './validar-campos'
export { registroCategorias } from './registro'

import type { Tx } from '../../nucleo/tipos-comunes'
import * as repoCategorias from './repos/categorias'
import type { Categoria } from './tipos'

/** Para otros módulos (SKU): una categoría con sus campos, dentro de la transacción que ya tienen abierta. */
export async function categoriaConCampos(tx: Tx, empresaId: string, categoriaId: string): Promise<Categoria | null> {
  return (await repoCategorias.listar(tx, empresaId, categoriaId))[0] ?? null
}
