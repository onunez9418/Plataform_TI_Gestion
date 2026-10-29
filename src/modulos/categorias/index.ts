import { noImplementado } from '../../nucleo/errores'
import type { Contexto } from '../../nucleo/tipos-comunes'
import type { Categoria, EntradaAgregarCampo, EntradaCrearCategoria } from './tipos'

export type * from './tipos'

export async function listarCategorias(_ctx: Contexto): Promise<Categoria[]> { throw noImplementado('listarCategorias') }
export async function crearCategoria(_ctx: Contexto, _e: EntradaCrearCategoria): Promise<Categoria> { throw noImplementado('crearCategoria') }
export async function agregarCampo(_ctx: Contexto, _e: EntradaAgregarCampo): Promise<Categoria> { throw noImplementado('agregarCampo') }
