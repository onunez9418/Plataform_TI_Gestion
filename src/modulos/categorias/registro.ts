import { PERMISOS_CATEGORIAS } from './permisos'
export const registroCategorias = {
  modulo: 'categorias',
  permisos: PERMISOS_CATEGORIAS,
  eventosEmitidos: ['categoria.creada', 'categoria.campo_agregado'],
} as const
