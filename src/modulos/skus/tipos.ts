export type ControlSku = 'serie' | 'cantidad'
export type Sku = {
  id: string
  /** Formato `PREFIJO-0001` (automático) o el que escribió la persona. */
  codigo: string
  nombre: string
  categoriaId: string
  categoriaNombre: string
  control: ControlSku
  /** Valores de los campos de la categoría; la clave es `CampoDef.clave`. */
  valores: Record<string, unknown>
  activo: boolean
  codigoPropio: boolean
}
export type EntradaListarSkus = { texto?: string; categoriaId?: string }
export type EntradaCrearSku = {
  categoriaId: string
  nombre: string
  control: ControlSku
  /** Si viene, sobrescribe el automático (exige `skus.codigo_propio`). */
  codigo?: string
  valores: Record<string, unknown>
}
