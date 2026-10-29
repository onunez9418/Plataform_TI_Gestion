import { conEmpresa } from '../../../nucleo/aislamiento'
import { registrarAuditoria } from '../../../nucleo/auditoria'
import { duplicado, esViolacionUnica, noEncontrado, validacion } from '../../../nucleo/errores'
import { definirServicio } from '../../../nucleo/permisos'
import { esId } from '../../../nucleo/tipos-comunes'
import * as repo from '../repos/categorias'
import type { Categoria, EntradaAgregarCampo, EntradaCrearCategoria } from '../tipos'
import { MAX_CAMPOS_POR_CATEGORIA, normalizarDefinicion } from '../validar-campos'

/** Prefijos que usan los documentos (ADR-15): no pueden ser prefijo de SKU. La base los rechaza también. */
export const PREFIJOS_RESERVADOS: readonly string[] = [
  'ACTV', 'OC', 'RCP', 'OS', 'ACT', 'RCL', 'MNT', 'CTR', 'AYU', 'CAM', 'PRB', 'KB', 'EC', 'PPT', 'MPR', 'GMA', 'LSAP', 'PRG', 'PRS',
]

export const listarCategorias = definirServicio<void, Categoria[]>(
  'categorias.listar', { permiso: 'catalogos.ver' },
  (ctx) => conEmpresa(ctx.empresaId, (tx) => repo.listar(tx, ctx.empresaId)),
)

export const crearCategoria = definirServicio<EntradaCrearCategoria, Categoria>(
  'categorias.crear', { permiso: 'categorias.gestionar' },
  async (ctx, entrada) => {
    const errores: Record<string, string> = {}
    const nombre = typeof entrada?.nombre === 'string' ? entrada.nombre.trim() : ''
    if (nombre.length < 2 || nombre.length > 60) errores.nombre = 'El nombre debe tener entre 2 y 60 caracteres.'
    const prefijo = typeof entrada?.prefijo === 'string' ? entrada.prefijo.trim().toUpperCase() : ''
    if (!/^[A-Z0-9]{2,5}$/.test(prefijo)) errores.prefijo = 'El prefijo lleva de 2 a 5 letras o números, sin espacios.'
    else if (PREFIJOS_RESERVADOS.includes(prefijo)) errores.prefijo = 'Ese prefijo está reservado para documentos. Elija otro.'

    const crudos = Array.isArray(entrada?.campos) ? entrada.campos : []
    if (crudos.length > MAX_CAMPOS_POR_CATEGORIA) errores.campos = `Una categoría admite hasta ${MAX_CAMPOS_POR_CATEGORIA} campos.`
    const campos = crudos.map((c, i) => normalizarDefinicion(c, errores, `campos.${i}`))
    const vistas = new Set<string>()
    campos.forEach((c, i) => {
      if (vistas.has(c.clave)) errores[`campos.${i}.clave`] = 'Hay dos campos con la misma clave.'
      vistas.add(c.clave)
    })
    if (Object.keys(errores).length > 0) throw validacion('Revise los datos de la categoría.', errores)

    try {
      return await conEmpresa(ctx.empresaId, async (tx) => {
        const id = await repo.crear(tx, ctx.empresaId, nombre, prefijo)
        for (const [i, c] of campos.entries()) await repo.insertarCampo(tx, ctx.empresaId, id, c, i + 1)
        await registrarAuditoria(tx, ctx, {
          accion: 'categoria.crear', entidadTipo: 'categoria', entidadId: id,
          cambios: { nombre, prefijo, campos: campos.map((c) => c.etiqueta) },
        })
        return (await repo.listar(tx, ctx.empresaId, id))[0] as Categoria
      })
    } catch (e) {
      if (esViolacionUnica(e, 'prefijo')) throw duplicado('Ya existe una categoría con ese prefijo.', { prefijo: 'Ya existe una categoría con ese prefijo.' })
      if (esViolacionUnica(e)) throw duplicado('Ya existe una categoría con ese nombre.', { nombre: 'Ya existe una categoría con ese nombre.' })
      throw e
    }
  },
)

export const agregarCampo = definirServicio<EntradaAgregarCampo, Categoria>(
  'categorias.agregar_campo', { permiso: 'categorias.gestionar' },
  async (ctx, entrada) => {
    if (!esId(entrada?.categoriaId)) throw noEncontrado('La categoría')
    const errores: Record<string, string> = {}
    const campo = normalizarDefinicion(entrada.campo, errores)
    if (Object.keys(errores).length > 0) throw validacion('Revise los datos del campo.', errores)

    try {
      return await conEmpresa(ctx.empresaId, async (tx) => {
        const existe = await repo.listar(tx, ctx.empresaId, entrada.categoriaId)
        if (!existe[0]) throw noEncontrado('La categoría')
        const cantidad = await repo.contarCampos(tx, ctx.empresaId, entrada.categoriaId)
        if (cantidad >= MAX_CAMPOS_POR_CATEGORIA) throw validacion(`Una categoría admite hasta ${MAX_CAMPOS_POR_CATEGORIA} campos.`)
        const orden = Math.max(0, ...existe[0].campos.map((c) => c.orden)) + 1
        await repo.insertarCampo(tx, ctx.empresaId, entrada.categoriaId, campo, orden)
        await registrarAuditoria(tx, ctx, {
          accion: 'categoria.agregar_campo', entidadTipo: 'categoria', entidadId: entrada.categoriaId,
          cambios: { campo: campo.etiqueta, tipo: campo.tipo, obligatorio: campo.obligatorio },
        })
        return (await repo.listar(tx, ctx.empresaId, entrada.categoriaId))[0] as Categoria
      })
    } catch (e) {
      if (esViolacionUnica(e)) throw duplicado('Ya existe un campo con esa clave en la categoría.', { 'campo.clave': 'Ya existe un campo con esa clave en la categoría.' })
      throw e
    }
  },
)
