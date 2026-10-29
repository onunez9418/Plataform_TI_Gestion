// Ingreso de equipos al inventario (sin comprobar permisos: lo hacen quienes lo llaman).
// Lo usan `registrarActivos` y la recepción de compras (por `../interno`), dentro de su transacción.
import { registrarAuditoria } from '../../../nucleo/auditoria'
import { duplicado, esViolacionUnica, validacion } from '../../../nucleo/errores'
import type { Contexto, Tx } from '../../../nucleo/tipos-comunes'
import * as repo from '../repos/inventario'

export const MAX_SERIES_POR_LOTE = 200
const MAX_CANTIDAD_POR_REGISTRO = 1_000_000
const MAX_LARGO_SERIE = 80

type Sku = { id: string; codigo: string }
type Ubicacion = { id: string }
/** Dato extra que queda en la auditoría (por ejemplo, la recepción de la que nacen los equipos). */
type Origen = Record<string, unknown> | undefined

/** Igual que la base: sin mayúsculas ni espacios, para detectar series repetidas dentro del mismo lote. */
export const normalizarSerie = (s: string): string => s.toLowerCase().replace(/\s+/g, '')
const lista = (valores: string[]): string => valores.join(', ')

/** Error 23514 de la base (una regla CHECK). */
function esViolacionCheck(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false
  const { codigo, code } = e as Record<string, unknown>
  return (codigo ?? code) === '23514'
}

/** SKU por cantidad: suma al saldo de esa ubicación. */
export async function ingresarCantidad(
  tx: Tx, ctx: Contexto,
  p: { sku: Sku; ubicacion: Ubicacion; cantidad: number | undefined; series: string[] | undefined; origen: Origen },
): Promise<{ creados: number }> {
  const { sku, ubicacion, cantidad } = p
  if (p.series && p.series.length > 0) {
    throw validacion(`«${sku.codigo}» se controla por cantidad: no lleva series. Indique la cantidad.`, { series: 'Este artículo no usa series.' })
  }
  if (typeof cantidad !== 'number' || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_CANTIDAD_POR_REGISTRO) {
    throw validacion('Escriba la cantidad: un número entero mayor que cero.', { cantidad: 'Escriba un número entero mayor que cero.' })
  }
  let saldo: number
  try {
    saldo = await tx.intentar(() => repo.sumarExistencia(tx, ctx.empresaId, sku.id, ubicacion.id, cantidad))
  } catch (e) {
    if (esViolacionCheck(e)) throw validacion('La cantidad total en esa ubicación superaría el máximo permitido.', { cantidad: 'La cantidad es demasiado grande.' })
    throw e
  }
  await registrarAuditoria(tx, ctx, {
    accion: 'existencia.registrar', entidadTipo: 'existencia', entidadId: sku.id,
    cambios: { sku: sku.codigo, ubicacionId: ubicacion.id, cantidadAgregada: cantidad, saldo, ...p.origen },
  })
  return { creados: cantidad }
}

/** SKU por serie: una fila por serie. Todo el lote entra o no entra nada. */
export async function ingresarSeries(
  tx: Tx, ctx: Contexto,
  p: { sku: Sku; ubicacion: Ubicacion; series: string[] | undefined; hayCantidad: boolean; origen: Origen },
): Promise<{ creados: number; avisos: string[] }> {
  const { sku, ubicacion, series } = p
  if (p.hayCantidad && !(series && series.length > 0)) {
    throw validacion(`«${sku.codigo}» se controla por serie: escriba las series, una por equipo.`, { series: 'Escriba al menos una serie.' })
  }
  const limpias = (series ?? []).map((s) => (typeof s === 'string' ? s.trim() : ''))
  if (limpias.length === 0) throw validacion('Escriba al menos una serie.', { series: 'Escriba al menos una serie.' })
  if (limpias.length > MAX_SERIES_POR_LOTE) {
    throw validacion(`Se pueden registrar hasta ${MAX_SERIES_POR_LOTE} series a la vez.`, { series: `Máximo ${MAX_SERIES_POR_LOTE} series por vez.` })
  }
  if (limpias.some((s) => s === '')) throw validacion('Hay una serie vacía.', { series: 'Quite las líneas vacías.' })
  const largas = limpias.filter((s) => s.length > MAX_LARGO_SERIE)
  if (largas.length > 0) {
    throw validacion(`Series demasiado largas (máximo ${MAX_LARGO_SERIE} caracteres): ${lista(largas.slice(0, 5))}.`, { series: 'Una serie es demasiado larga.' })
  }
  // Repetidas dentro del mismo lote.
  const vistas = new Set<string>()
  const repetidasEnLote: string[] = []
  for (const s of limpias) {
    const n = normalizarSerie(s)
    if (vistas.has(n)) repetidasEnLote.push(s)
    vistas.add(n)
  }
  if (repetidasEnLote.length > 0) {
    const m = `Estas series están repetidas en su lista: ${lista(repetidasEnLote)}.`
    throw duplicado(m, { series: m })
  }
  // Ya registradas antes para este artículo.
  const yaExisten = await repo.seriesExistentes(tx, ctx.empresaId, sku.id, [...vistas])
  if (yaExisten.length > 0) {
    const m = `Estas series ya están registradas para «${sku.codigo}»: ${lista(yaExisten)}.`
    throw duplicado(m, { series: m })
  }

  // Una serie que ya existe en OTRO SKU de la empresa se acepta, con un aviso que dice dónde está (RF-INV-003).
  const avisos: string[] = []
  for (const o of await repo.seriesEnOtrosSkus(tx, ctx.empresaId, sku.id, [...vistas])) {
    avisos.push(`La serie ${o.serie} ya existe en el artículo ${o.sku_codigo}. Se registró igual; revise que no sea un error de digitación.`)
  }

  const ids: string[] = []
  for (const serie of limpias) {
    try {
      // Punto de guardado: si una serie choca (otra persona la registró a la vez), se explica cuál.
      ids.push(await tx.intentar(() => repo.insertarActivo(tx, ctx.empresaId, sku.id, ubicacion.id, serie)))
    } catch (e) {
      if (esViolacionUnica(e)) {
        const m = `La serie ${serie} ya está registrada para «${sku.codigo}».`
        throw duplicado(m, { series: m })
      }
      throw e
    }
  }
  for (const [i, id] of ids.entries()) {
    await registrarAuditoria(tx, ctx, {
      accion: 'activo.registrar', entidadTipo: 'activo', entidadId: id,
      cambios: { sku: sku.codigo, serie: limpias[i], ubicacionId: ubicacion.id, ...p.origen },
    })
  }
  return { creados: ids.length, avisos }
}
