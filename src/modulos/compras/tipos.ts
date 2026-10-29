export type EstadoOrden = 'borrador' | 'por_aprobar' | 'aprobada' | 'rechazada' | 'recibida_parcial' | 'recibida'

export type LineaOrden = {
  id: string
  skuId: string
  skuCodigo: string
  skuNombre: string
  /** «serie»: al recibir se piden las series; «cantidad»: se suma al saldo. */
  control: 'serie' | 'cantidad'
  cantidad: number
  precioUnitario: number
  cantidadRecibida: number
  /** cantidad - cantidadRecibida */
  pendiente: number
}

export type OrdenResumen = {
  id: string
  /** Formato OC-000001. */
  numero: string
  proveedorId: string
  proveedorNombre: string
  estado: EstadoOrden
  moneda: string
  total: number
  preparadaPorNombre: string | null
  creadoEn: string
  enviadaEn: string | null
}

export type AprobacionOrden = {
  decision: 'aprobada' | 'rechazada'
  aprobadorNombre: string | null
  motivo: string | null
  creadoEn: string
}

export type RecepcionOrden = {
  id: string
  /** Formato RCP-000001. */
  numero: string
  ubicacionNombre: string
  recibidaPorNombre: string | null
  creadoEn: string
  lineas: { skuCodigo: string; skuNombre: string; cantidad: number; series: string[] }[]
}

export type Orden = OrdenResumen & {
  lineas: LineaOrden[]
  aprobaciones: AprobacionOrden[]
  recepciones: RecepcionOrden[]
}

export type EntradaCrearOrden = {
  proveedorId: string
  lineas: { skuId: string; cantidad: number; precioUnitario: number }[]
}

export type EntradaRechazarOrden = { id: string; motivo: string }

/**
 * `ubicacionId` es AGREGADO a lo pactado en el plan (A.6.2): toda recepción dice dónde queda lo recibido.
 * Por cada línea: `cantidad` (entero, sin pasar de lo pendiente) y, si el SKU es por serie, tantas `series` como `cantidad`.
 */
export type EntradaRecibirOrden = {
  ordenId: string
  ubicacionId: string
  lineas: { lineaId: string; cantidad: number; series?: string[] }[]
}

export type ResultadoRecepcion = { recepcionId: string; numero: string; activosCreados: number; estadoOrden: EstadoOrden }
