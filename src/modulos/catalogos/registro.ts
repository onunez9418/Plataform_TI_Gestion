import { PERMISOS_CATALOGOS } from './permisos'

export const registroCatalogos = {
  modulo: 'catalogos',
  permisos: PERMISOS_CATALOGOS,
  eventosEmitidos: ['ubicacion.creada', 'proveedor.creado', 'persona.creada'],
} as const
