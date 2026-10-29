// Datos inventados de las dos empresas de ejemplo (plan-etapa-1.md A.6.1).
// Ningún dato es real: correos con dominio .local, personas y proveedores ficticios.
// A propósito, Alfa y Beta repiten los mismos códigos (LAP-0001, MON-0001) y las mismas series
// (SN-1001...) con nombres distintos, para demostrar el aislamiento entre empresas.

import { EMPRESAS, USUARIOS, type ClaveEmpresa } from './ids'
import type { PLANTILLAS_ROL } from '../../src/nucleo/permisos/catalogo'

type NombreRol = keyof typeof PLANTILLAS_ROL
type ClaveUsuario = keyof typeof USUARIOS

export type CampoSemilla = {
  clave: string
  etiqueta: string
  tipo: 'texto' | 'numero' | 'fecha' | 'lista' | 'si_no'
  opciones?: string[]
  obligatorio: boolean
}

export const CAMPOS_LAPTOPS: CampoSemilla[] = [
  { clave: 'procesador', etiqueta: 'Procesador', tipo: 'texto', obligatorio: true },
  { clave: 'ram_gb', etiqueta: 'RAM (GB)', tipo: 'numero', obligatorio: false },
  { clave: 'fecha_compra', etiqueta: 'Fecha de compra', tipo: 'fecha', obligatorio: false },
  { clave: 'disco', etiqueta: 'Disco', tipo: 'lista', opciones: ['SSD', 'HDD'], obligatorio: false },
  { clave: 'con_garantia', etiqueta: 'Con garantía', tipo: 'si_no', obligatorio: false },
]

export type DatosEmpresa = {
  clave: ClaveEmpresa
  membresias: { usuario: ClaveUsuario; rol: NombreRol }[]
  ubicaciones: string[]
  proveedores: { nombre: string; documento: string; contacto: string }[]
  personas: { nombre: string; correo: string; area: string }[]
  laptop: { nombre: string; valores: Record<string, unknown> }
  monitor: { nombre: string; existencia: number }
  /** Cuarto de las series: la primera queda asignada a la primera persona. */
  series: string[]
  tecnico: ClaveUsuario
  admin: ClaveUsuario
}

export const DATOS: DatosEmpresa[] = [
  {
    clave: 'alfa',
    membresias: [
      { usuario: 'ceo', rol: 'Administrador' },
      { usuario: 'jefaAlfa', rol: 'Jefatura TI' },
      { usuario: 'tecnicoAlfa', rol: 'Técnico' },
      { usuario: 'consultaAlfa', rol: 'Consulta' },
    ],
    ubicaciones: ['Almacén central', 'Oficina Lima', 'Sala de servidores'],
    proveedores: [
      { nombre: 'Tecnosur Ficticia S.A.C.', documento: 'DEMO-0001', contacto: 'ventas@tecnosur.local' },
      { nombre: 'Equipos Andinos de Prueba E.I.R.L.', documento: 'DEMO-0002', contacto: 'contacto@andinos.local' },
    ],
    personas: [
      { nombre: 'Lucía Paredes', correo: 'lucia.paredes@alfa.local', area: 'Contabilidad' },
      { nombre: 'Marco Salazar', correo: 'marco.salazar@alfa.local', area: 'Ventas' },
      { nombre: 'Rosa Quispe', correo: 'rosa.quispe@alfa.local', area: 'Recursos Humanos' },
      { nombre: 'Diego Herrera', correo: 'diego.herrera@alfa.local', area: 'Operaciones' },
      { nombre: 'Elena Vargas', correo: 'elena.vargas@alfa.local', area: 'Gerencia' },
    ],
    laptop: {
      nombre: 'Laptop Latitude 14 (Alfa)',
      valores: { procesador: 'Intel Core i5-1235U', ram_gb: 16, fecha_compra: '2026-03-15', disco: 'SSD', con_garantia: true },
    },
    monitor: { nombre: 'Monitor 24 pulgadas Full HD (Alfa)', existencia: 12 },
    series: ['SN-1001', 'SN-1002', 'SN-1003', 'SN-1004'],
    tecnico: 'tecnicoAlfa',
    admin: 'ceo',
  },
  {
    clave: 'beta',
    membresias: [
      { usuario: 'ceo', rol: 'Administrador' },
      { usuario: 'adminBeta', rol: 'Administrador' },
      { usuario: 'tecnicoBeta', rol: 'Técnico' },
    ],
    ubicaciones: ['Bodega principal', 'Oficina Arequipa', 'Taller de reparación'],
    proveedores: [
      { nombre: 'Compuventa Demo S.A.', documento: 'DEMO-0003', contacto: 'ventas@compuventa.local' },
      { nombre: 'Insumos del Sur de Prueba S.R.L.', documento: 'DEMO-0004', contacto: 'contacto@insumosur.local' },
    ],
    personas: [
      { nombre: 'Camila Ortiz', correo: 'camila.ortiz@beta.local', area: 'Finanzas' },
      { nombre: 'Jorge Medina', correo: 'jorge.medina@beta.local', area: 'Logística' },
      { nombre: 'Patricia Ramos', correo: 'patricia.ramos@beta.local', area: 'Marketing' },
      { nombre: 'Andrés Cueva', correo: 'andres.cueva@beta.local', area: 'Soporte' },
      { nombre: 'Sofía Lozano', correo: 'sofia.lozano@beta.local', area: 'Dirección' },
    ],
    laptop: {
      nombre: 'Notebook ProBook 450 (Beta)',
      valores: { procesador: 'AMD Ryzen 5 5600U', ram_gb: 8, fecha_compra: '2026-05-02', disco: 'HDD', con_garantia: false },
    },
    monitor: { nombre: 'Monitor curvo 27 pulgadas (Beta)', existencia: 6 },
    series: ['SN-1001', 'SN-1002', 'SN-1003', 'SN-1004'],
    tecnico: 'tecnicoBeta',
    admin: 'adminBeta',
  },
]

export { EMPRESAS, USUARIOS }
