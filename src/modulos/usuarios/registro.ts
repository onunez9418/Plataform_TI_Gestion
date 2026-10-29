import { PERMISOS_USUARIOS } from './permisos'

/** Registro del módulo (ADR-14). En la 0.1 solo declara permisos y eventos. */
export const registroUsuarios = {
  modulo: 'usuarios',
  permisos: PERMISOS_USUARIOS,
  eventosEmitidos: ['usuario.invitado', 'usuario.rol_cambiado', 'usuario.suspendido', 'usuario.reactivado'],
} as const
