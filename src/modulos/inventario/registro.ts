import { PERMISOS_INVENTARIO } from './permisos'
export const registroInventario = {
  modulo: 'inventario',
  permisos: PERMISOS_INVENTARIO,
  eventosEmitidos: ['activo.registrado', 'activo.asignado', 'activo.devuelto'],
  clavesDeContador: [],
} as const
