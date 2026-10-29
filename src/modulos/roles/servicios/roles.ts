import { conEmpresa } from '../../../nucleo/aislamiento'
import { registrarAuditoria } from '../../../nucleo/auditoria'
import {
  duplicado, esViolacionUnica, noEncontrado, separacionFunciones, sinPermiso, validacion,
} from '../../../nucleo/errores'
import { catalogoPermisos as catalogo, definirServicio, esPermisoDelCatalogo } from '../../../nucleo/permisos'
import { esId, type Contexto } from '../../../nucleo/tipos-comunes'
import * as repo from '../repos/roles'
import type { EntradaCrearRol, EntradaEditarRol, PermisoDelCatalogo, Rol } from '../tipos'

const MENSAJE_DUPLICADO = 'Ya existe un rol con ese nombre.'

function validarNombre(nombre: unknown): string {
  const limpio = String(nombre ?? '').trim()
  if (limpio.length < 2 || limpio.length > 60) {
    throw validacion('Revise el nombre del rol.', { nombre: 'El nombre debe tener entre 2 y 60 letras.' })
  }
  return limpio
}

/** Valida contra el catálogo y contra los permisos de quien lo pide (nadie da lo que no tiene). */
function validarPermisos(ctx: Contexto, permisos: unknown): string[] {
  if (!Array.isArray(permisos)) throw validacion('Elija los permisos del rol.', { permisos: 'Elija al menos un permiso.' })
  const unicos = [...new Set(permisos.map(String))]
  const desconocidos = unicos.filter((p) => !esPermisoDelCatalogo(p))
  if (desconocidos.length > 0) throw validacion('Hay permisos que no existen.', { permisos: `No existen: ${desconocidos.join(', ')}.` })
  const demas = unicos.filter((p) => !ctx.permisos.has(p))
  if (demas.length > 0) throw sinPermiso('No puede dar permisos que usted no tiene.')
  return unicos
}

export const listarRoles = definirServicio<void, Rol[]>(
  'roles.listar',
  { permiso: 'roles.ver' },
  (ctx) => conEmpresa(ctx.empresaId, (tx) => repo.listar(tx, ctx.empresaId)),
)

export const crearRol = definirServicio<EntradaCrearRol, Rol>(
  'roles.crear',
  { permiso: 'roles.administrar' },
  async (ctx, entrada) => {
    const nombre = validarNombre(entrada?.nombre)
    const permisos = validarPermisos(ctx, entrada?.permisos)
    try {
      return await conEmpresa(ctx.empresaId, async (tx) => {
        const id = await repo.crear(tx, ctx.empresaId, nombre)
        await repo.fijarPermisos(tx, ctx.empresaId, id, permisos)
        await registrarAuditoria(tx, ctx, { accion: 'rol.crear', entidadTipo: 'rol', entidadId: id, cambios: { nombre, permisos } })
        return (await repo.obtener(tx, ctx.empresaId, id)) as Rol
      })
    } catch (e) {
      if (esViolacionUnica(e)) throw duplicado(MENSAJE_DUPLICADO, { nombre: MENSAJE_DUPLICADO })
      throw e
    }
  },
)

export const editarRol = definirServicio<EntradaEditarRol, Rol>(
  'roles.editar',
  { permiso: 'roles.administrar' },
  async (ctx, entrada) => {
    const rolId = String(entrada?.rolId ?? '')
    if (!esId(rolId)) throw noEncontrado('El rol')
    if (rolId === ctx.rolId) throw separacionFunciones('No puede editar su propio rol. Pídaselo a otra persona.')
    const nombre = entrada.nombre === undefined ? undefined : validarNombre(entrada.nombre)
    const permisos = entrada.permisos === undefined ? undefined : validarPermisos(ctx, entrada.permisos)
    try {
      return await conEmpresa(ctx.empresaId, async (tx) => {
        const actual = await repo.obtener(tx, ctx.empresaId, rolId)
        if (!actual) throw noEncontrado('El rol')
        if (actual.esBase) throw validacion('Los roles base no se modifican. Cree un rol nuevo con los permisos que necesite.')
        if (nombre !== undefined && nombre !== actual.nombre) await repo.renombrar(tx, ctx.empresaId, rolId, nombre)
        if (permisos !== undefined) await repo.fijarPermisos(tx, ctx.empresaId, rolId, permisos)
        await registrarAuditoria(tx, ctx, {
          accion: 'rol.editar',
          entidadTipo: 'rol',
          entidadId: rolId,
          cambios: {
            ...(nombre !== undefined ? { nombre: { antes: actual.nombre, despues: nombre } } : {}),
            ...(permisos !== undefined ? { permisos: { antes: actual.permisos, despues: permisos } } : {}),
          },
        })
        return (await repo.obtener(tx, ctx.empresaId, rolId)) as Rol
      })
    } catch (e) {
      if (esViolacionUnica(e)) throw duplicado(MENSAJE_DUPLICADO, { nombre: MENSAJE_DUPLICADO })
      throw e
    }
  },
)

/** Lista fija del código; no toca la base ni necesita permiso (es solo el vocabulario de la pantalla). */
export function catalogoPermisos(): PermisoDelCatalogo[] {
  return catalogo()
}
