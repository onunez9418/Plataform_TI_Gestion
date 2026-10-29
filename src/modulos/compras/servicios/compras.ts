import { conEmpresa } from '../../../nucleo/aislamiento'
import { registrarAuditoria } from '../../../nucleo/auditoria'
import { formatearCorrelativo, siguienteContador } from '../../../nucleo/contadores'
import { conflicto, noEncontrado, separacionFunciones, validacion } from '../../../nucleo/errores'
import { definirServicio } from '../../../nucleo/permisos'
import { esId } from '../../../nucleo/tipos-comunes'
import type { Contexto, Tx } from '../../../nucleo/tipos-comunes'
import { ingresarCantidad, ingresarSeries, obtenerUbicacion } from '../../inventario/interno'
import * as repo from '../repos/compras'
import type {
  EntradaCrearOrden, EntradaRechazarOrden, EntradaRecibirOrden, EstadoOrden, Orden, OrdenResumen, ResultadoRecepcion,
} from '../tipos'

const MAX_LINEAS = 50
const MAX_CANTIDAD = 1_000_000
const MAX_PRECIO = 1_000_000_000
const MAX_MOTIVO = 500

const ETIQUETA_ESTADO: Record<EstadoOrden, string> = {
  borrador: 'en borrador', por_aprobar: 'por aprobar', aprobada: 'aprobada', rechazada: 'rechazada',
  recibida_parcial: 'recibida en parte', recibida: 'recibida',
}

const esEnteroPositivo = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= MAX_CANTIDAD

/** Una regla de la base que rechaza la operación se explica en español; lo demás sigue su camino. */
function traducirReglaDeBase(e: unknown): never {
  const msg = typeof e === 'object' && e !== null ? String((e as { message?: unknown }).message ?? '') : ''
  if (msg.includes('SEPARACION_FUNCIONES')) {
    throw separacionFunciones('Quien preparó la orden no puede aprobarla. Pídale a otra persona con permiso que la apruebe.')
  }
  throw e
}

async function ordenBloqueada(tx: Tx, ctx: Contexto, id: string) {
  const orden = await repo.obtenerResumen(tx, ctx.empresaId, id, true)
  if (!orden) throw noEncontrado('La orden de compra')
  return orden
}

export const listarOrdenes = definirServicio<void, OrdenResumen[]>(
  'compras.listar', { permiso: 'ordenes_compra.ver' },
  async (ctx) => conEmpresa(ctx.empresaId, (tx) => repo.listar(tx, ctx.empresaId)),
)

export const obtenerOrden = definirServicio<string, Orden>(
  'compras.obtener', { permiso: 'ordenes_compra.ver' },
  async (ctx, id) => {
    if (!esId(id)) throw noEncontrado('La orden de compra')
    return conEmpresa(ctx.empresaId, async (tx) => {
      const r = await repo.obtenerResumen(tx, ctx.empresaId, id)
      if (!r) throw noEncontrado('La orden de compra')
      const { preparadaPorUsuarioId: _usuario, ...resumen } = r
      return {
        ...resumen,
        lineas: await repo.lineas(tx, ctx.empresaId, id),
        aprobaciones: await repo.aprobaciones(tx, ctx.empresaId, id),
        recepciones: await repo.recepciones(tx, ctx.empresaId, id),
      }
    })
  },
)

export const crearOrden = definirServicio<EntradaCrearOrden, Orden>(
  'compras.crear', { permiso: 'ordenes_compra.crear_editar' },
  async (ctx, entrada) => {
    const errores: Record<string, string> = {}
    if (!esId(entrada?.proveedorId)) errores.proveedorId = 'Elija el proveedor.'
    const lineas = entrada?.lineas
    if (!Array.isArray(lineas) || lineas.length === 0) errores.lineas = 'Agregue al menos un artículo a la orden.'
    else if (lineas.length > MAX_LINEAS) errores.lineas = `Una orden admite hasta ${MAX_LINEAS} artículos.`
    else {
      const vistos = new Set<string>()
      for (const l of lineas) {
        if (!esId(l?.skuId)) { errores.lineas = 'Hay una línea sin artículo válido.'; break }
        if (vistos.has(l.skuId.toLowerCase())) { errores.lineas = 'Un artículo no puede repetirse en dos líneas. Sume las cantidades en una sola.'; break }
        vistos.add(l.skuId.toLowerCase())
        if (!esEnteroPositivo(l.cantidad)) { errores.lineas = 'La cantidad de cada línea debe ser un número entero mayor que cero.'; break }
        if (typeof l.precioUnitario !== 'number' || !Number.isFinite(l.precioUnitario) || l.precioUnitario < 0 || l.precioUnitario > MAX_PRECIO) {
          errores.lineas = 'El precio de cada línea debe ser un número, cero o mayor.'; break
        }
      }
    }
    if (Object.keys(errores).length > 0) throw validacion('Revise los datos de la orden.', errores)

    const id = await conEmpresa(ctx.empresaId, async (tx) => {
      const prov = await repo.proveedor(tx, ctx.empresaId, entrada.proveedorId)
      if (!prov) throw noEncontrado('El proveedor')
      if (!prov.activo) throw validacion('El proveedor está desactivado.', { proveedorId: 'Elija un proveedor activo.' })
      const skus = await repo.skusPorId(tx, ctx.empresaId, entrada.lineas.map((l) => l.skuId))
      for (const l of entrada.lineas) {
        const sku = skus.get(l.skuId.toLowerCase())
        if (!sku) throw noEncontrado('Uno de los artículos')
        if (!sku.activo) throw validacion(`El artículo ${sku.codigo} está desactivado.`, { lineas: `El artículo ${sku.codigo} está desactivado.` })
      }
      const numero = formatearCorrelativo('OC', await siguienteContador(tx, 'doc:OC'), 6)
      const ordenId = await repo.insertarOrden(tx, ctx.empresaId, numero, prov.id, ctx.membresiaId)
      for (const l of entrada.lineas) await repo.insertarLinea(tx, ctx.empresaId, ordenId, l.skuId, l.cantidad, l.precioUnitario)
      await registrarAuditoria(tx, ctx, {
        accion: 'orden_compra.crear', entidadTipo: 'orden_compra', entidadId: ordenId,
        cambios: { numero, proveedorId: prov.id, lineas: entrada.lineas.length },
      })
      return ordenId
    })
    return obtenerOrden(ctx, id)
  },
)

export const enviarAAprobacion = definirServicio<string, Orden>(
  'compras.enviar_a_aprobacion', { permiso: 'ordenes_compra.crear_editar' },
  async (ctx, id) => {
    if (!esId(id)) throw noEncontrado('La orden de compra')
    await conEmpresa(ctx.empresaId, async (tx) => {
      const orden = await ordenBloqueada(tx, ctx, id)
      if (orden.estado !== 'borrador') throw conflicto(`La orden ${orden.numero} está ${ETIQUETA_ESTADO[orden.estado]}: solo se envía a aprobación una orden en borrador.`)
      await repo.cambiarEstado(tx, ctx.empresaId, id, 'por_aprobar', true)
      await registrarAuditoria(tx, ctx, {
        accion: 'orden_compra.enviar_a_aprobacion', entidadTipo: 'orden_compra', entidadId: id, cambios: { numero: orden.numero },
      })
    })
    return obtenerOrden(ctx, id)
  },
)

export const aprobarOrden = definirServicio<string, Orden>(
  'compras.aprobar', { permiso: 'ordenes_compra.aprobar' },
  async (ctx, id) => {
    if (!esId(id)) throw noEncontrado('La orden de compra')
    await conEmpresa(ctx.empresaId, async (tx) => {
      const orden = await ordenBloqueada(tx, ctx, id)
      // Separación de funciones: quien prepara no aprueba (la base lo impide también).
      if (orden.preparadaPorUsuarioId === ctx.usuarioId) {
        throw separacionFunciones('Quien preparó la orden no puede aprobarla. Pídale a otra persona con permiso que la apruebe.')
      }
      if (orden.estado !== 'por_aprobar') throw conflicto(`La orden ${orden.numero} está ${ETIQUETA_ESTADO[orden.estado]}: solo se aprueba una orden que está por aprobar.`)
      try {
        await repo.insertarAprobacion(tx, ctx.empresaId, id, ctx.membresiaId, 'aprobada', null)
        await repo.cambiarEstado(tx, ctx.empresaId, id, 'aprobada')
      } catch (e) {
        traducirReglaDeBase(e)
      }
      await registrarAuditoria(tx, ctx, {
        accion: 'orden_compra.aprobar', entidadTipo: 'orden_compra', entidadId: id, cambios: { numero: orden.numero },
      })
    })
    return obtenerOrden(ctx, id)
  },
)

export const rechazarOrden = definirServicio<EntradaRechazarOrden, Orden>(
  'compras.rechazar', { permiso: 'ordenes_compra.aprobar' },
  async (ctx, entrada) => {
    if (!esId(entrada?.id)) throw noEncontrado('La orden de compra')
    const motivo = typeof entrada.motivo === 'string' ? entrada.motivo.trim() : ''
    if (motivo === '') throw validacion('Escriba el motivo del rechazo.', { motivo: 'El motivo es obligatorio.' })
    if (motivo.length > MAX_MOTIVO) throw validacion(`El motivo admite hasta ${MAX_MOTIVO} caracteres.`, { motivo: 'El motivo es demasiado largo.' })
    await conEmpresa(ctx.empresaId, async (tx) => {
      const orden = await ordenBloqueada(tx, ctx, entrada.id)
      if (orden.estado !== 'por_aprobar') throw conflicto(`La orden ${orden.numero} está ${ETIQUETA_ESTADO[orden.estado]}: solo se rechaza una orden que está por aprobar.`)
      await repo.insertarAprobacion(tx, ctx.empresaId, entrada.id, ctx.membresiaId, 'rechazada', motivo)
      await repo.cambiarEstado(tx, ctx.empresaId, entrada.id, 'rechazada')
      await registrarAuditoria(tx, ctx, {
        accion: 'orden_compra.rechazar', entidadTipo: 'orden_compra', entidadId: entrada.id, cambios: { numero: orden.numero }, motivo,
      })
    })
    return obtenerOrden(ctx, entrada.id)
  },
)

export const recibirOrden = definirServicio<EntradaRecibirOrden, ResultadoRecepcion>(
  'compras.recibir', { permiso: 'recepciones.crear_confirmar' },
  async (ctx, entrada) => {
    const errores: Record<string, string> = {}
    if (!esId(entrada?.ordenId)) throw noEncontrado('La orden de compra')
    if (!esId(entrada.ubicacionId)) errores.ubicacionId = 'Elija dónde queda lo que recibe.'
    const recibidas = Array.isArray(entrada.lineas) ? entrada.lineas.filter((l) => l && Number(l.cantidad) !== 0) : []
    if (recibidas.length === 0) errores.lineas = 'Indique la cantidad recibida de al menos un artículo.'
    const vistas = new Set<string>()
    for (const l of recibidas) {
      if (!esId(l.lineaId)) { errores.lineas = 'Hay una línea que no es válida.'; break }
      if (vistas.has(l.lineaId.toLowerCase())) { errores.lineas = 'Una línea no puede repetirse en la misma recepción.'; break }
      vistas.add(l.lineaId.toLowerCase())
      if (!esEnteroPositivo(l.cantidad)) { errores.lineas = 'La cantidad recibida debe ser un número entero mayor que cero.'; break }
    }
    if (Object.keys(errores).length > 0) throw validacion('Revise los datos de la recepción.', errores)

    return conEmpresa(ctx.empresaId, async (tx) => {
      const orden = await ordenBloqueada(tx, ctx, entrada.ordenId)
      if (orden.estado !== 'aprobada' && orden.estado !== 'recibida_parcial') {
        throw conflicto(`La orden ${orden.numero} está ${ETIQUETA_ESTADO[orden.estado]}: solo se recibe una orden aprobada que aún tenga pendientes.`)
      }
      const ubicacion = await obtenerUbicacion(tx, ctx.empresaId, entrada.ubicacionId)
      if (!ubicacion) throw noEncontrado('La ubicación')
      if (!ubicacion.activo) throw validacion('La ubicación está desactivada.', { ubicacionId: 'Elija una ubicación activa.' })

      const lineasOrden = await repo.lineas(tx, ctx.empresaId, orden.id)
      const porId = new Map(lineasOrden.map((l) => [l.id.toLowerCase(), l]))

      // Se valida TODO antes de escribir nada (el mensaje dice cuál línea falla).
      for (const r of recibidas) {
        const linea = porId.get(r.lineaId.toLowerCase())
        if (!linea) throw validacion('Una de las líneas no pertenece a esta orden.', { lineas: 'Una línea no pertenece a esta orden.' })
        if (r.cantidad > linea.pendiente) {
          const m = `${linea.skuCodigo}: no puede recibir ${r.cantidad}; se pidieron ${linea.cantidad}, ya se recibieron ${linea.cantidadRecibida} y quedan ${linea.pendiente}.`
          throw validacion(m, { lineas: m })
        }
        if (linea.control === 'serie') {
          const n = r.series?.length ?? 0
          if (n !== r.cantidad) {
            const m = `${linea.skuCodigo}: escriba ${r.cantidad} ${r.cantidad === 1 ? 'serie' : 'series'} (una por equipo); recibió ${n}.`
            throw validacion(m, { lineas: m })
          }
        } else if (r.series && r.series.length > 0) {
          const m = `${linea.skuCodigo} se controla por cantidad: no lleva series.`
          throw validacion(m, { lineas: m })
        }
      }

      const numero = formatearCorrelativo('RCP', await siguienteContador(tx, 'doc:RCP'), 6)
      const recepcionId = await repo.insertarRecepcion(tx, ctx.empresaId, numero, orden.id, ubicacion.id, ctx.membresiaId)
      let activosCreados = 0
      for (const r of recibidas) {
        const linea = porId.get(r.lineaId.toLowerCase())!
        const sku = { id: linea.skuId, codigo: linea.skuCodigo }
        if (linea.control === 'serie') {
          // Las series se registran en el inventario (si alguna ya existe, se dice cuál y no se guarda nada).
          const { creados } = await ingresarSeries(tx, ctx, { sku, ubicacion, series: r.series, hayCantidad: true, origen: { recepcion: numero, orden: orden.numero } })
          activosCreados += creados
        } else {
          const { creados } = await ingresarCantidad(tx, ctx, { sku, ubicacion, cantidad: r.cantidad, series: undefined, origen: { recepcion: numero, orden: orden.numero } })
          activosCreados += creados
        }
        try {
          // La base suma lo recibido a la línea y rechaza pasarse de lo pedido (aunque dos recepciones lleguen a la vez).
          await tx.intentar(() => repo.insertarRecepcionLinea(tx, ctx.empresaId, recepcionId, linea.id, r.cantidad, linea.control === 'serie' ? (r.series ?? []).map((s) => s.trim()) : null))
        } catch (e) {
          if (typeof e === 'object' && e !== null && (e as { codigo?: string }).codigo === '23514') {
            throw validacion(`${linea.skuCodigo}: la cantidad recibida supera lo pedido.`, { lineas: 'La cantidad recibida supera lo pedido.' })
          }
          throw e
        }
      }

      const despues = await repo.lineas(tx, ctx.empresaId, orden.id)
      const completa = despues.every((l) => l.pendiente === 0)
      const estadoOrden: EstadoOrden = completa ? 'recibida' : 'recibida_parcial'
      await repo.cambiarEstado(tx, ctx.empresaId, orden.id, estadoOrden)
      await registrarAuditoria(tx, ctx, {
        accion: 'orden_compra.recibir', entidadTipo: 'orden_compra', entidadId: orden.id,
        cambios: { numero: orden.numero, recepcion: numero, ubicacionId: ubicacion.id, lineas: recibidas.length, estado: estadoOrden },
      })
      return { recepcionId, numero, activosCreados, estadoOrden }
    })
  },
)

