// Configuración de las tres pantallas de catálogo (ubicaciones, proveedores, personas).
// Es solo presentación: qué columnas y campos se muestran. Las reglas viven en los servicios.
import { P } from '@/componentes/estructura/permisos'

export type CampoCatalogo = { nombre: string; etiqueta: string; requerido?: boolean; tipo?: 'text' | 'email' }
export type ConfigCatalogo = {
  titulo: string
  descripcion: string
  singular: string
  ver: readonly string[]
  gestionar: readonly string[]
  campos: CampoCatalogo[]
}

export const CATALOGOS = {
  ubicaciones: {
    titulo: 'Ubicaciones',
    descripcion: 'Los lugares donde se guardan los equipos.',
    singular: 'ubicación',
    ver: [P.catalogosVer],
    gestionar: [P.ubicacionesGestionar, 'catalogos.gestionar'],
    campos: [{ nombre: 'nombre', etiqueta: 'Nombre', requerido: true }, { nombre: 'descripcion', etiqueta: 'Descripción' }],
  },
  proveedores: {
    titulo: 'Proveedores',
    descripcion: 'A quién se le compra.',
    singular: 'proveedor',
    ver: [P.proveedoresVer],
    gestionar: [P.proveedoresCrearEditar],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
      { nombre: 'documento', etiqueta: 'Documento (RUC)' },
      { nombre: 'contacto', etiqueta: 'Contacto' },
    ],
  },
  personas: {
    titulo: 'Personas',
    descripcion: 'Quienes reciben los equipos. Personas ficticias en esta prueba.',
    singular: 'persona',
    ver: [P.personasVer],
    gestionar: [P.personasCrearEditar],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
      { nombre: 'correo', etiqueta: 'Correo', tipo: 'email' },
      { nombre: 'area', etiqueta: 'Área' },
    ],
  },
} as const satisfies Record<string, ConfigCatalogo>

export type TipoCatalogo = keyof typeof CATALOGOS
export const esTipoCatalogo = (v: string): v is TipoCatalogo => v in CATALOGOS
