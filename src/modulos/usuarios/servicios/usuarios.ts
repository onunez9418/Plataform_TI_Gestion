import { crearEnlaceIngreso, enlaceSenuelo } from '../../../nucleo/acceso/emitir'
import { conEmpresa } from '../../../nucleo/aislamiento'
import { registrarAuditoria } from '../../../nucleo/auditoria'
import {
  duplicado, noEncontrado, separacionFunciones, sinPermiso, validacion,
} from '../../../nucleo/errores'
import { definirServicio } from '../../../nucleo/permisos'
import { esId } from '../../../nucleo/tipos-comunes'
import * as repo from '../repos/usuarios'
import type {
  EntradaCambiarRol, EntradaInvitarUsuario, EntradaSuspender, ResultadoInvitarUsuario, Usuario,
} from '../tipos'

const CORREO_VALIDO = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/

const exigirId = (valor: unknown, campo: string): string => {
  if (!esId(valor)) throw validacion('Falta elegir un valor válido.', { [campo]: 'Elija una opción.' })
  return valor
}

export const listarUsuarios = definirServicio<void, Usuario[]>(
  'usuarios.listar',
  { permiso: 'usuarios.ver' },
  (ctx) => conEmpresa(ctx.empresaId, (tx) => repo.listar(tx, ctx.empresaId)),
)

export const invitarUsuario = definirServicio<EntradaInvitarUsuario, ResultadoInvitarUsuario>(
  'usuarios.invitar',
  { permiso: 'usuarios.invitar' },
  async (ctx, entrada) => {
    const correo = String(entrada?.correo ?? '').trim().toLowerCase()
    const nombre = String(entrada?.nombre ?? '').trim()
    const campos: Record<string, string> = {}
    if (!CORREO_VALIDO.test(correo)) campos.correo = 'Escriba un correo válido.'
    if (nombre.length < 2 || nombre.length > 120) campos.nombre = 'El nombre debe tener entre 2 y 120 letras.'
    const rolId = esId(entrada?.rolId) ? entrada.rolId : ''
    if (!rolId) campos.rolId = 'Elija un rol.'
    if (Object.keys(campos).length > 0) throw validacion('Revise los datos de la invitación.', campos)

    return conEmpresa(ctx.empresaId, async (tx) => {
      const rol = await repo.permisosDeRol(tx, ctx.empresaId, rolId)
      if (!rol) throw noEncontrado('El rol')
      if (rol.permisos.some((p) => !ctx.permisos.has(p))) {
        throw sinPermiso('No puede dar un rol con más permisos de los que usted tiene.')
      }

      const existente = await repo.buscarUsuarioGlobalPorCorreo(tx, correo)
      const usuarioId = existente?.id ?? (await repo.crearUsuarioGlobal(tx, correo, nombre))
      if (existente && (await repo.existeMembresia(tx, ctx.empresaId, usuarioId))) {
        throw duplicado('Ese correo ya pertenece a un usuario de esta empresa.', { correo: 'Ya existe en esta empresa.' })
      }
      await repo.crearMembresia(tx, ctx.empresaId, usuarioId, rolId)
      // H-SEG-L03: si la persona ya existe (por otra empresa), solo se le da la membresía en ESTA empresa.
      // Nunca se emite un enlace de ingreso a su nombre desde una invitación: entra por el flujo normal de
      // «pedir enlace». A quien invita se le devuelve un enlace señuelo, con la misma forma que uno real,
      // para que no pueda averiguar si el correo ya estaba en la plataforma.
      // Las cuentas nuevas sí reciben su enlace; no se atan a un navegador porque quien invita no es quien entra.
      const enlace = existente ? enlaceSenuelo() : await crearEnlaceIngreso(tx, usuarioId, null)
      await registrarAuditoria(tx, ctx, {
        accion: 'usuario.invitar',
        entidadTipo: 'usuario',
        entidadId: usuarioId,
        cambios: { correo, nombre, rol: rol.nombre },
      })
      return { usuarioId, ...enlace }
    })
  },
)

export const cambiarRol = definirServicio<EntradaCambiarRol, void>(
  'usuarios.cambiar_rol',
  { permiso: 'usuarios.cambiar_rol' },
  async (ctx, entrada) => {
    const usuarioId = exigirId(entrada?.usuarioId, 'usuarioId')
    const rolId = exigirId(entrada?.rolId, 'rolId')
    if (usuarioId === ctx.usuarioId) throw separacionFunciones('No puede cambiar su propio rol. Pídaselo a otra persona.')

    await conEmpresa(ctx.empresaId, async (tx) => {
      const actual = await repo.obtener(tx, ctx.empresaId, usuarioId)
      if (!actual) throw noEncontrado('El usuario')
      const rol = await repo.permisosDeRol(tx, ctx.empresaId, rolId)
      if (!rol) throw noEncontrado('El rol')
      if (rol.permisos.some((p) => !ctx.permisos.has(p))) {
        throw sinPermiso('No puede dar un rol con más permisos de los que usted tiene.')
      }
      await repo.cambiarRolDeMembresia(tx, ctx.empresaId, usuarioId, rolId)
      await registrarAuditoria(tx, ctx, {
        accion: 'usuario.cambiar_rol',
        entidadTipo: 'usuario',
        entidadId: usuarioId,
        cambios: { rol: { antes: actual.rolNombre, despues: rol.nombre } },
      })
    })
  },
)

async function cambiarEstado(ctx: Parameters<typeof listarUsuarios>[0], usuarioId: string, estado: 'activa' | 'suspendida'): Promise<void> {
  await conEmpresa(ctx.empresaId, async (tx) => {
    const actual = await repo.obtener(tx, ctx.empresaId, usuarioId)
    if (!actual) throw noEncontrado('El usuario')
    const cambiadas = await repo.cambiarEstadoDeMembresia(tx, ctx.empresaId, usuarioId, estado)
    if (cambiadas === 0) return // ya estaba así
    await registrarAuditoria(tx, ctx, {
      accion: estado === 'suspendida' ? 'usuario.suspender' : 'usuario.reactivar',
      entidadTipo: 'usuario',
      entidadId: usuarioId,
      cambios: { estado: { antes: actual.estado, despues: estado === 'suspendida' ? 'suspendido' : 'activo' } },
    })
  })
}

/** Suspende su acceso a ESTA empresa; la sesión deja de servir en la petición siguiente (se valida siempre). */
export const suspender = definirServicio<EntradaSuspender, void>(
  'usuarios.suspender',
  { permiso: 'usuarios.suspender' },
  async (ctx, entrada) => {
    const usuarioId = exigirId(entrada?.usuarioId, 'usuarioId')
    if (usuarioId === ctx.usuarioId) throw separacionFunciones('No puede suspenderse a sí mismo.')
    await cambiarEstado(ctx, usuarioId, 'suspendida')
  },
)

/** Extra a lo pactado (A.6.2): deshacer una suspensión. Mismo permiso que suspender. */
export const reactivar = definirServicio<EntradaSuspender, void>(
  'usuarios.reactivar',
  { permiso: 'usuarios.suspender' },
  async (ctx, entrada) => {
    await cambiarEstado(ctx, exigirId(entrada?.usuarioId, 'usuarioId'), 'activa')
  },
)
