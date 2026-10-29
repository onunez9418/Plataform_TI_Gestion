export type TipoCampo = 'texto' | 'numero' | 'fecha' | 'lista' | 'si_no'
export type CampoDef = {
  /** Identificador estable (minúsculas, números y guion bajo). Las claves del JSON de valores. */
  clave: string
  etiqueta: string
  tipo: TipoCampo
  /** Solo para tipo «lista». */
  opciones?: string[]
  obligatorio: boolean
}
export type CampoDefinicion = CampoDef & { id: string; orden: number }
export type Categoria = { id: string; nombre: string; prefijo: string; campos: CampoDefinicion[]; cantidadSkus: number }
export type EntradaCrearCategoria = { nombre: string; prefijo: string; campos: CampoDef[] }
export type EntradaAgregarCampo = { categoriaId: string; campo: CampoDef }
