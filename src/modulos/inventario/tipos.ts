export type EstadoActivo = 'en_stock' | 'asignado' | 'en_reparacion' | 'extraviado' | 'de_baja'

/** Un equipo con número de serie (SKU controlado por serie). */
export type Activo = {
  id: string
  skuId: string
  skuCodigo: string
  skuNombre: string
  serie: string
  estado: EstadoActivo
  ubicacionId: string
  ubicacionNombre: string
  /** Persona que lo tiene ahora (solo si está asignado). */
  personaId: string | null
  personaNombre: string | null
  /** Fecha y hora en formato ISO. */
  creadoEn: string
}

/** Saldo de un SKU controlado por cantidad en una ubicación. */
export type Existencia = {
  skuId: string
  skuCodigo: string
  skuNombre: string
  ubicacionId: string
  ubicacionNombre: string
  cantidad: number
}

export type EntradaListarActivos = {
  /** Busca en la serie, el código y el nombre del SKU. */
  texto?: string
  skuId?: string
  estado?: EstadoActivo | string
  personaId?: string
}

export type EntradaRegistrarActivos = {
  skuId: string
  ubicacionId: string
  /** SKU por serie: una serie por equipo. */
  series?: string[]
  /** SKU por cantidad: entero mayor que cero. */
  cantidad?: number
}

/** `creados`: equipos creados (por serie) o unidades sumadas (por cantidad). */
export type ResultadoRegistrarActivos = { creados: number }

export type EntradaAsignarActivo = { activoId: string; personaId: string }
export type EntradaDevolverActivo = { activoId: string; ubicacionId: string }

export type MovimientoActivo = {
  id: string
  tipo: 'registro' | 'asignacion' | 'devolucion'
  creadoEn: string
  personaNombre: string | null
  ubicacionNombre: string | null
  autorNombre: string | null
  motivo: string | null
}
