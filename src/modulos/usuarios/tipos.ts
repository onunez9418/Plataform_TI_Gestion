export type EstadoUsuario = 'activo' | 'suspendido'
export type Usuario = {
  usuarioId: string
  correo: string
  nombre: string
  rolId: string
  rolNombre: string
  estado: EstadoUsuario
  /** ISO 8601. */
  desde: string
}
export type EntradaInvitarUsuario = { correo: string; nombre: string; rolId: string }
export type ResultadoInvitarUsuario = { usuarioId: string; enlaceLocal?: string }
export type EntradaCambiarRol = { usuarioId: string; rolId: string }
export type EntradaSuspender = { usuarioId: string }
