import { noImplementado } from '../../nucleo/errores'
import type { Contexto } from '../../nucleo/tipos-comunes'
import type {
  EntradaCrearPersona, EntradaCrearProveedor, EntradaCrearUbicacion, EntradaEditarPersona,
  EntradaEditarProveedor, EntradaEditarUbicacion, Persona, Proveedor, Ubicacion,
} from './tipos'

export type * from './tipos'

export async function listarUbicaciones(_ctx: Contexto): Promise<Ubicacion[]> { throw noImplementado('listarUbicaciones') }
export async function crearUbicacion(_ctx: Contexto, _e: EntradaCrearUbicacion): Promise<Ubicacion> { throw noImplementado('crearUbicacion') }
export async function editarUbicacion(_ctx: Contexto, _e: EntradaEditarUbicacion): Promise<Ubicacion> { throw noImplementado('editarUbicacion') }
export async function listarProveedores(_ctx: Contexto): Promise<Proveedor[]> { throw noImplementado('listarProveedores') }
export async function crearProveedor(_ctx: Contexto, _e: EntradaCrearProveedor): Promise<Proveedor> { throw noImplementado('crearProveedor') }
export async function editarProveedor(_ctx: Contexto, _e: EntradaEditarProveedor): Promise<Proveedor> { throw noImplementado('editarProveedor') }
export async function listarPersonas(_ctx: Contexto): Promise<Persona[]> { throw noImplementado('listarPersonas') }
export async function crearPersona(_ctx: Contexto, _e: EntradaCrearPersona): Promise<Persona> { throw noImplementado('crearPersona') }
export async function editarPersona(_ctx: Contexto, _e: EntradaEditarPersona): Promise<Persona> { throw noImplementado('editarPersona') }
