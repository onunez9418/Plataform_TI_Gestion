// Interfaz pública del acceso (A.6.2). El Frontend solo importa de aquí.
import { noImplementado } from '../errores'
import type { Contexto } from '../tipos-comunes'
import type { EmpresaResumen, ResultadoCanjear, ResultadoSolicitarEnlace } from './tipos'

export type { EmpresaResumen, ResultadoCanjear, ResultadoSolicitarEnlace } from './tipos'

/** Lee la cookie de sesión y valida membresía en `empresaSlug`. Lanza SIN_ACCESO. */
export async function obtenerContexto(_empresaSlug: string): Promise<Contexto> {
  throw noImplementado('obtenerContexto')
}
/** `enlaceLocal` solo en MODO_LOCAL. Misma respuesta si el correo no existe. */
export async function solicitarEnlace(_correo: string): Promise<ResultadoSolicitarEnlace> {
  throw noImplementado('solicitarEnlace')
}
/** Se llama por POST (botón «Entrar»), nunca por GET. Crea la sesión y su cookie. */
export async function canjearEnlace(_token: string): Promise<ResultadoCanjear> {
  throw noImplementado('canjearEnlace')
}
export async function cerrarSesion(): Promise<void> {
  throw noImplementado('cerrarSesion')
}
export async function misEmpresas(): Promise<EmpresaResumen[]> {
  throw noImplementado('misEmpresas')
}
