import { noImplementado } from '../../nucleo/errores'
import type { Contexto } from '../../nucleo/tipos-comunes'
import type {
  EntradaCambiarRol, EntradaInvitarUsuario, EntradaSuspender, ResultadoInvitarUsuario, Usuario,
} from './tipos'

export type * from './tipos'

export async function listarUsuarios(_ctx: Contexto): Promise<Usuario[]> { throw noImplementado('listarUsuarios') }
export async function invitarUsuario(_ctx: Contexto, _e: EntradaInvitarUsuario): Promise<ResultadoInvitarUsuario> { throw noImplementado('invitarUsuario') }
export async function cambiarRol(_ctx: Contexto, _e: EntradaCambiarRol): Promise<void> { throw noImplementado('cambiarRol') }
export async function suspender(_ctx: Contexto, _e: EntradaSuspender): Promise<void> { throw noImplementado('suspender') }
