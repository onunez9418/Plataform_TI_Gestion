import { conEmpresa } from '../../../nucleo/aislamiento'
import { registrarAuditoria } from '../../../nucleo/auditoria'
import { conflicto, esViolacionUnica, noEncontrado, separacionFunciones, validacion } from '../../../nucleo/errores'
import { definirServicio } from '../../../nucleo/permisos'
import { esId } from '../../../nucleo/tipos-comunes'
import * as repo from '../repos/inventario'
import { ingresarCantidad, ingresarSeries } from './ingreso'
import type {
  Activo, EntradaAsignarActivo, EntradaDevolverActivo, EntradaListarActivos, EntradaRegistrarActivos,
  Existencia, MovimientoActivo, ResultadoRegistrarActivos,
} from '../tipos'

const ESTADOS = ['en_stock', 'asignado', 'en_reparacion', 'extraviado', 'de_baja']

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

      if (sku.control === 'cantidad') {
        return ingresarCantidad(tx, ctx, { sku, ubicacion, cantidad: entrada.cantidad, series, origen: undefined })
      }
      return ingresarSeries(tx, ctx, { sku, ubicacion, series, hayCantidad, origen: undefined })
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

