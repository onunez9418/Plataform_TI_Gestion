export type EmpresaResumen = { slug: string; nombre: string }
export type ResultadoSolicitarEnlace = {
  /** Solo en MODO_LOCAL: ruta para mostrar el botón «Entrar», p. ej. `/entrar/enlace?t=...`. */
  enlaceLocal?: string
}
export type ResultadoCanjear = { empresas: EmpresaResumen[] }
