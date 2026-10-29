import { noImplementado } from '../../nucleo/errores'
import type { Contexto } from '../../nucleo/tipos-comunes'
import type { EntradaCrearRol, EntradaEditarRol, PermisoDelCatalogo, Rol } from './tipos'

export type * from './tipos'

export async function listarRoles(_ctx: Contexto): Promise<Rol[]> { throw noImplementado('listarRoles') }
export async function crearRol(_ctx: Contexto, _e: EntradaCrearRol): Promise<Rol> { throw noImplementado('crearRol') }
export async function editarRol(_ctx: Contexto, _e: EntradaEditarRol): Promise<Rol> { throw noImplementado('editarRol') }
/** Lista fija del código; no toca la base. */
export function catalogoPermisos(): PermisoDelCatalogo[] { throw noImplementado('catalogoPermisos') }
