import type { Permiso } from '../../nucleo/permisos'

/** Permisos que usa este módulo (todos existen en el registro: ADR-10). */
export const PERMISOS_USUARIOS: readonly Permiso[] = [
  'usuarios.ver', 'usuarios.invitar', 'usuarios.cambiar_rol', 'usuarios.suspender',
]
