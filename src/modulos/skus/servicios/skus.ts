import { conEmpresa } from '../../../nucleo/aislamiento'
import { registrarAuditoria } from '../../../nucleo/auditoria'
import { conflicto, duplicado, esViolacionUnica, noEncontrado, validacion } from '../../../nucleo/errores'
import { siguienteContadorFuera } from './contador'
import { definirServicio, exigirPermiso } from '../../../nucleo/permisos'
import { esId } from '../../../nucleo/tipos-comunes'
import { categoriaConCampos, validarValores } from '../../categorias'
import * as repo from '../repos/skus'
import type { EntradaCrearSku, EntradaListarSkus, Sku } from '../tipos'

const MAX_INTENTOS_CODIGO = 10
const CODIGO_PROPIO_VALIDO = /^[A-Z0-9][A-Z0-9._-]{1,38}$/
const MENSAJE_CODIGO_REPETIDO = 'Ya existe un SKU con ese código en la empresa.'

export const listarSkus = definirServicio<EntradaListarSkus | undefined, Sku[]>(
  'skus.listar', { permiso: 'skus.ver' },
  async (ctx, entrada) => {
    const categoriaId = entrada?.categoriaId
    if (categoriaId !== undefined && categoriaId !== '' && !esId(categoriaId)) throw validacion('La categoría no es válida.', { categoriaId: 'Elija una categoría.' })
    const texto = entrada?.texto?.trim()
    return conEmpresa(ctx.empresaId, (tx) =>
      repo.listar(tx, ctx.empresaId, { texto: texto || undefined, categoriaId: categoriaId || undefined }))
  },
)

export const obtenerSku = definirServicio<string, Sku>(
  'skus.obtener', { permiso: 'skus.ver' },
  async (ctx, id) => {
    if (!esId(id)) throw noEncontrado('El SKU')
    const sku = await conEmpresa(ctx.empresaId, (tx) => repo.obtener(tx, ctx.empresaId, id))
    if (!sku) throw noEncontrado('El SKU')
    return sku
  },
)

export const crearSku = definirServicio<EntradaCrearSku, Sku>(
  'skus.crear', { permiso: 'skus.crear_editar' },
  async (ctx, entrada) => {
    const errores: Record<string, string> = {}
    const nombre = typeof entrada?.nombre === 'string' ? entrada.nombre.trim() : ''
    if (nombre.length < 2 || nombre.length > 120) errores.nombre = 'El nombre debe tener entre 2 y 120 caracteres.'
    if (entrada?.control !== 'serie' && entrada?.control !== 'cantidad') errores.control = 'Elija cómo se controla: por serie o por cantidad.'
    if (!esId(entrada?.categoriaId)) errores.categoriaId = 'Elija una categoría.'

    // Un código escrito a mano exige un permiso propio (RF-SKU-005).
    const pideCodigoPropio = typeof entrada?.codigo === 'string' && entrada.codigo.trim() !== ''
    let codigoPropio: string | null = null
    if (pideCodigoPropio) {
      exigirPermiso(ctx, 'skus.codigo_propio')
      codigoPropio = entrada.codigo!.trim().toUpperCase()
      if (!CODIGO_PROPIO_VALIDO.test(codigoPropio)) errores.codigo = 'El código admite letras, números, punto, guion y guion bajo (2 a 39 caracteres), sin espacios.'
    }
    if (Object.keys(errores).length > 0) throw validacion('Revise los datos del SKU.', errores)

    // 1) Categoría y validación de los campos propios de esa categoría.
    const categoria = await conEmpresa(ctx.empresaId, (tx) => categoriaConCampos(tx, ctx.empresaId, entrada.categoriaId))
    if (!categoria) throw noEncontrado('La categoría')
    const valores = validarValores(categoria.campos, entrada.valores)

    const insertar = (codigo: string, esPropio: boolean) =>
      conEmpresa(ctx.empresaId, async (tx) => {
        const id = await repo.insertar(tx, ctx.empresaId, {
          categoriaId: categoria.id, codigo, codigoPropio: esPropio, nombre, control: entrada.control, valores,
        })
        await registrarAuditoria(tx, ctx, {
          accion: 'sku.crear', entidadTipo: 'sku', entidadId: id,
          cambios: { codigo, nombre, categoria: categoria.nombre, control: entrada.control, codigoPropio: esPropio },
        })
        return (await repo.obtener(tx, ctx.empresaId, id)) as Sku
      })

    // 2a) Código propio: si ya existe es DUPLICADO.
    if (codigoPropio !== null) {
      try {
        return await insertar(codigoPropio, true)
      } catch (e) {
        if (esViolacionUnica(e)) throw duplicado(MENSAJE_CODIGO_REPETIDO, { codigo: MENSAJE_CODIGO_REPETIDO })
        throw e
      }
    }

    // 2b) Código automático PREFIJO-0001 (ADR-15): se reserva el número ANTES de la transacción; si un código
    // escrito a mano ya ocupa ese número, se pide el siguiente (puede quedar un salto, está permitido).
    for (let intento = 0; intento < MAX_INTENTOS_CODIGO; intento++) {
      const codigo = await siguienteContadorFuera(ctx.empresaId, categoria.prefijo)
      try {
        return await insertar(codigo, false)
      } catch (e) {
        if (esViolacionUnica(e)) continue
        throw e
      }
    }
    throw conflicto('No se pudo asignar un código automático. Escriba un código propio o intente de nuevo.')
  },
)

