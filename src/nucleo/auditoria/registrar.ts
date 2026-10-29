import type { Contexto, Tx } from '../tipos-comunes'
import { filtrarCambios } from './campos-personales'

export type EntradaRegistroAuditoria = {
  /** `entidad.verbo`, p. ej. `rol.crear`, `sku.crear`. */
  accion: string
  entidadTipo: string
  entidadId?: string | null
  cambios?: Record<string, unknown>
  /** Texto libre; no debe llevar datos personales (D-077). */
  motivo?: string
}

/**
 * Escribe UNA fila de auditoría dentro de la misma transacción que el cambio (regla 4 del contrato).
 * Se llama después de escribir la entidad. Solo agrega: la aplicación no tiene UPDATE ni DELETE sobre la tabla.
 */
export async function registrarAuditoria(tx: Tx, ctx: Contexto, e: EntradaRegistroAuditoria): Promise<void> {
  const cambios = filtrarCambios(e.entidadTipo, e.cambios ?? {})
  await tx.consultar(
    `INSERT INTO auditoria (empresa_id, autor_membresia_id, accion, entidad_tipo, entidad_id, cambios, motivo)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
    [
      ctx.empresaId,
      ctx.membresiaId,
      e.accion,
      e.entidadTipo,
      e.entidadId ?? null,
      JSON.stringify(cambios),
      e.motivo ?? null,
    ],
  )
}
