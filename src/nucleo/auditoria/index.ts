import { noImplementado } from '../errores'
import type { Contexto } from '../tipos-comunes'
import type { EntradaListarAuditoria, RegistroAuditoria } from './tipos'

export type * from './tipos'

/** El registro lo escribe cada servicio (nunca el Frontend) con `registrarAuditoria`. */
export async function listarAuditoria(_ctx: Contexto, _e?: EntradaListarAuditoria): Promise<RegistroAuditoria[]> {
  throw noImplementado('listarAuditoria')
}
