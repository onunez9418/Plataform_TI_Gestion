import { PERMISOS_ROLES } from './permisos'

export const registroRoles = {
  modulo: 'roles',
  permisos: PERMISOS_ROLES,
  eventosEmitidos: ['rol.creado', 'rol.editado'],
} as const
