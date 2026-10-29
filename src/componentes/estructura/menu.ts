// Menú de la empresa. Cada entrada se muestra si la persona tiene AL MENOS UNO de los permisos.
// Es comodidad: el servidor vuelve a comprobar el permiso en cada servicio.
import type { NombreIcono } from '@/componentes/ui/Icono'
import { P } from './permisos'

export type EntradaMenu = { grupo: string; ruta: string; etiqueta: string; icono: NombreIcono; permisos: readonly string[] | null; testid: string }

// Las compras son la segunda prioridad (S1): se encienden solo si la Jefatura las autoriza.
export const COMPRAS_ACTIVAS = process.env.NEXT_PUBLIC_COMPRAS === '1' || process.env.COMPRAS === '1'

export const ENTRADAS_MENU: readonly EntradaMenu[] = [
  { grupo: 'General', ruta: '', etiqueta: 'Panel', icono: 'inicio', permisos: null, testid: 'menu-panel' },
  { grupo: 'Inventario', ruta: '/inventario', etiqueta: 'Inventario', icono: 'caja', permisos: [P.activosVer], testid: 'menu-inventario' },
  { grupo: 'Inventario', ruta: '/skus', etiqueta: 'Artículos (SKU)', icono: 'etiqueta', permisos: [P.skusVer], testid: 'menu-skus' },
  { grupo: 'Inventario', ruta: '/categorias', etiqueta: 'Categorías', icono: 'tabla', permisos: [P.catalogosVer, P.categoriasGestionar], testid: 'menu-categorias' },
  ...(COMPRAS_ACTIVAS
    ? ([{ grupo: 'Compras', ruta: '/compras', etiqueta: 'Órdenes de compra', icono: 'compra', permisos: [P.comprasVer], testid: 'menu-compras' }] as const)
    : []),
  { grupo: 'Catálogos', ruta: '/catalogos/ubicaciones', etiqueta: 'Ubicaciones', icono: 'edificio', permisos: [P.catalogosVer], testid: 'menu-ubicaciones' },
  { grupo: 'Catálogos', ruta: '/catalogos/proveedores', etiqueta: 'Proveedores', icono: 'compra', permisos: [P.proveedoresVer], testid: 'menu-proveedores' },
  { grupo: 'Catálogos', ruta: '/catalogos/personas', etiqueta: 'Personas', icono: 'personas', permisos: [P.personasVer], testid: 'menu-personas' },
  { grupo: 'Administración', ruta: '/usuarios', etiqueta: 'Usuarios', icono: 'usuario', permisos: [P.usuariosVer], testid: 'menu-usuarios' },
  { grupo: 'Administración', ruta: '/roles', etiqueta: 'Roles y permisos', icono: 'escudo', permisos: [P.rolesVer, P.rolesAdministrar], testid: 'menu-roles' },
  { grupo: 'Administración', ruta: '/auditoria', etiqueta: 'Auditoría', icono: 'doc', permisos: [P.auditoriaVer], testid: 'menu-auditoria' },
]
