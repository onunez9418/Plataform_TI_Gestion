import { PERMISOS_SKUS } from './permisos'
export const registroSkus = {
  modulo: 'skus',
  permisos: PERMISOS_SKUS,
  eventosEmitidos: ['sku.creado'],
  clavesDeContador: ['sku:<PREFIJO>'],
} as const
