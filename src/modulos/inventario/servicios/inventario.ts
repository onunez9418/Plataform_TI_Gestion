import { conEmpresa } from '../../../nucleo/aislamiento'
import { registrarAuditoria } from '../../../nucleo/auditoria'
import { conflicto, duplicado, esViolacionUnica, noEncontrado, separacionFunciones, validacion } from '../../../nucleo/errores'
import { definirServicio } from '../../../nucleo/permisos'
import { esId } from '../../../nucleo/tipos-comunes'
import * as repo from '../repos/inventario'
import type {
  Activo, EntradaAsignarActivo, EntradaDevolverActivo, EntradaListarActivos, EntradaRegistrarActivos,
  Existencia, MovimientoActivo, ResultadoRegistrarActivos,
} from '../tipos'

const ESTADOS = ['en_stock', 'asignado', 'en_reparacion', 'extraviado', 'de_baja']
export const MAX_SERIES_POR_LOTE = 200
const MAX_CANTIDAD_POR_REGISTRO = 1_000_000
const MAX_LARGO_SERIE = 80

/** Igual que la base: sin mayúsculas ni espacios, para detectar series repetidas dentro del mismo lote. */
const normalizarSerie = (s: string): string => s.toLowerCase().replace(/\s+/g, '')
const lista = (valores: string[]): string => valores.join(', ')

export const listarActivos = definirServicio<EntradaListarActivos | undefined, Activo[]>(
  'inventario.listar', { permiso: 'activos.ver' },
  async (ctx, entrada) => {
    const { skuId, personaId } = entrada ?? {}
    const estado = entrada?.estado?.trim()
    if (skuId && !esId(skuId)) throw validacion('El artículo del filtro no es válido.')
    if (personaId && !esId(personaId)) throw validacion('La persona del filtro no es válida.')
    if (estado && !ESTADOS.includes(estado)) throw validacion('El estado del filtro no es válido.')
    const texto = entrada?.texto?.trim()
    return conEmpresa(ctx.empresaId, (tx) =>
      repo.listarActivos(tx, ctx.empresaId, {
        texto: texto || undefined, skuId: skuId || undefined, estado: estado || undefined, personaId: personaId || undefined,
      }))
  },
)

export const listarExistencias = definirServicio<void, Existencia[]>(
  'inventario.listar_existencias', { permiso: 'activos.ver' },
  async (ctx) => conEmpresa(ctx.empresaId, (tx) => repo.listarExistencias(tx, ctx.empresaId)),
)

export const obtenerActivo = definirServicio<string, Activo>(
  'inventario.obtener', { permiso: 'activos.ver' },
  async (ctx, id) => {
    if (!esId(id)) throw noEncontrado('El activo')
    const activo = await conEmpresa(ctx.empresaId, (tx) => repo.obtenerActivo(tx, ctx.empresaId, id))
    if (!activo) throw noEncontrado('El activo')
    return activo
  },
)

export const historialActivo = definirServicio<string, MovimientoActivo[]>(
  'inventario.historial', { permiso: 'activos.ver' },
  async (ctx, id) => {
    if (!esId(id)) throw noEncontrado('El activo')
    return conEmpresa(ctx.empresaId, async (tx) => {
      if (!(await repo.obtenerActivo(tx, ctx.empresaId, id))) throw noEncontrado('El activo')
      return repo.historial(tx, ctx.empresaId, id)
    })
  },
)

export const registrarActivos = definirServicio<EntradaRegistrarActivos, ResultadoRegistrarActivos>(
  'inventario.registrar', { permiso: 'activos.ingreso_manual' },
  async (ctx, entrada) => {
    const errores: Record<string, string> = {}
    if (!esId(entrada?.skuId)) errores.skuId = 'Elija el artículo (SKU).'
    if (!esId(entrada?.ubicacionId)) errores.ubicacionId = 'Elija la ubicación.'
    if (Object.keys(errores).length > 0) throw validacion('Revise los datos del registro.', errores)

    const series = entrada.series
    const hayCantidad = entrada.cantidad !== undefined && entrada.cantidad !== null
    if (series !== undefined && !Array.isArray(series)) throw validacion('Las series no son válidas.', { series: 'Escriba una serie por línea.' })

    return conEmpresa(ctx.empresaId, async (tx) => {
      const sku = await repo.obtenerSkuParaInventario(tx, ctx.empresaId, entrada.skuId)
      if (!sku) throw noEncontrado('El artículo (SKU)')
      if (!sku.activo) throw validacion('El artículo está desactivado y no admite nuevos ingresos.', { skuId: 'Elija un artículo activo.' })
      const ubicacion = await repo.obtenerUbicacion(tx, ctx.empresaId, entrada.ubicacionId)
      if (!ubicacion) throw noEncontrado('La ubicación')
      if (!ubicacion.activo) throw validacion('La ubicación está desactivada.', { ubicacionId: 'Elija una ubicación activa.' })

      // ---- SKU por cantidad: suma al saldo de esa ubicación -----------------------------------------
      if (sku.control === 'cantidad') {
        if (series && series.length > 0) {
          throw validacion(`«${sku.codigo}» se controla por cantidad: no lleva series. Indique la cantidad.`, { series: 'Este artículo no usa series.' })
        }
        const cantidad = entrada.cantidad
        if (!hayCantidad || typeof cantidad !== 'number' || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_CANTIDAD_POR_REGISTRO) {
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
          cambios: { sku: sku.codigo, ubicacionId: ubicacion.id, cantidadAgregada: cantidad, saldo },
        })
        return { creados: cantidad }
      }

      // ---- SKU por serie: una fila por serie ------------------------------------------------------------
      if (hayCantidad && !(series && series.length > 0)) {
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
          cambios: { sku: sku.codigo, serie: limpias[i], ubicacionId: ubicacion.id },
        })
      }
      return { creados: ids.length }
    })
  },
)

export const asignarActivo = definirServicio<EntradaAsignarActivo, Activo>(
  'inventario.asignar', { permiso: 'entregas.crear' },
  async (ctx, entrada) => {
    const errores: Record<string, string> = {}
    if (!esId(entrada?.activoId)) errores.activoId = 'El equipo no es válido.'
    if (!esId(entrada?.personaId)) errores.personaId = 'Elija la persona.'
    if (Object.keys(errores).length > 0) throw validacion('Revise los datos de la asignación.', errores)

    return conEmpresa(ctx.empresaId, async (tx) => {
      const activo = await repo.obtenerActivo(tx, ctx.empresaId, entrada.activoId, true)
      if (!activo) throw noEncontrado('El activo')
      const persona = await repo.obtenerPersona(tx, ctx.empresaId, entrada.personaId)
      if (!persona) throw noEncontrado('La persona')
      if (!persona.activo) throw validacion('La persona está desactivada y no puede recibir equipos.', { personaId: 'Elija una persona activa.' })

      if (activo.estado === 'asignado') {
        throw conflicto(`El equipo ${activo.serie} ya está asignado${activo.personaNombre ? ` a ${activo.personaNombre}` : ''}. Regístrele primero la devolución.`)
      }
      if (activo.estado !== 'en_stock') {
        throw conflicto(`El equipo ${activo.serie} no está disponible para asignar (estado: ${etiquetaEstado(activo.estado)}).`)
      }
      // La autoentrega está prohibida sin excepción (registro de permisos PS-55).
      const correoUsuario = await repo.correoDelUsuario(tx, ctx.usuarioId)
      if (correoUsuario && persona.correo_norm && correoUsuario === persona.correo_norm) {
        throw separacionFunciones('No puede asignarse un equipo a usted mismo. Pídaselo a otra persona con permiso.')
      }

      try {
        await tx.intentar(() => repo.abrirAsignacion(tx, ctx.empresaId, activo.id, persona.id, ctx.membresiaId))
      } catch (e) {
        if (esViolacionUnica(e)) throw conflicto(`El equipo ${activo.serie} acaba de ser asignado por otra persona. Actualice la pantalla.`)
        throw e
      }
      await repo.cambiarEstadoYUbicacion(tx, ctx.empresaId, activo.id, 'asignado')
      await registrarAuditoria(tx, ctx, {
        accion: 'activo.asignar', entidadTipo: 'activo', entidadId: activo.id,
        cambios: { sku: activo.skuCodigo, serie: activo.serie, personaId: persona.id },
      })
      return (await repo.obtenerActivo(tx, ctx.empresaId, activo.id)) as Activo
    })
  },
)

export const devolverActivo = definirServicio<EntradaDevolverActivo, Activo>(
  'inventario.devolver', { permiso: 'entregas.devolver' },
  async (ctx, entrada) => {
    const errores: Record<string, string> = {}
    if (!esId(entrada?.activoId)) errores.activoId = 'El equipo no es válido.'
    if (!esId(entrada?.ubicacionId)) errores.ubicacionId = 'Elija dónde queda el equipo.'
    if (Object.keys(errores).length > 0) throw validacion('Revise los datos de la devolución.', errores)

    return conEmpresa(ctx.empresaId, async (tx) => {
      const activo = await repo.obtenerActivo(tx, ctx.empresaId, entrada.activoId, true)
      if (!activo) throw noEncontrado('El activo')
      const ubicacion = await repo.obtenerUbicacion(tx, ctx.empresaId, entrada.ubicacionId)
      if (!ubicacion) throw noEncontrado('La ubicación')
      if (!ubicacion.activo) throw validacion('La ubicación está desactivada.', { ubicacionId: 'Elija una ubicación activa.' })
      if (activo.estado !== 'asignado') throw conflicto(`El equipo ${activo.serie} no está asignado a nadie, no hay nada que devolver.`)

      const personaId = await repo.cerrarAsignacion(tx, ctx.empresaId, activo.id)
      await repo.cambiarEstadoYUbicacion(tx, ctx.empresaId, activo.id, 'en_stock', ubicacion.id)
      await registrarAuditoria(tx, ctx, {
        accion: 'activo.devolver', entidadTipo: 'activo', entidadId: activo.id,
        cambios: { sku: activo.skuCodigo, serie: activo.serie, personaId, ubicacionId: ubicacion.id },
      })
      return (await repo.obtenerActivo(tx, ctx.empresaId, activo.id)) as Activo
    })
  },
)

const ETIQUETAS_ESTADO: Record<string, string> = {
  en_stock: 'en stock', asignado: 'asignado', en_reparacion: 'en reparación', extraviado: 'extraviado', de_baja: 'de baja',
}
const etiquetaEstado = (e: string): string => ETIQUETAS_ESTADO[e] ?? e

/** Error 23514 de la base (una regla CHECK). */
function esViolacionCheck(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false
  const { codigo, code } = e as Record<string, unknown>
  return (codigo ?? code) === '23514'
}
