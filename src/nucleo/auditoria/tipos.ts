export type EntradaListarAuditoria = { entidad?: string; desde?: string; hasta?: string }
export type RegistroAuditoria = {
  id: string
  creadoEn: string
  autorNombre: string | null
  accion: string
  entidadTipo: string
  entidadId: string | null
  /** Campos personales aparecen como «cambió», nunca con su valor (ADR-11). */
  cambios: Record<string, unknown>
  motivo: string | null
}
