import { PERMISOS_COMPRAS } from './permisos'
export const registroCompras = {
  modulo: 'compras',
  permisos: PERMISOS_COMPRAS,
  eventosEmitidos: ['compras.orden_por_aprobar', 'compras.orden_aprobada', 'compras.orden_rechazada', 'compras.orden_recibida'],
  clavesDeContador: ['doc:OC', 'doc:RCP'],
} as const
