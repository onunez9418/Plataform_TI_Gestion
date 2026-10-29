import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { usarAlmacenDeCookies } from '../../../nucleo/acceso/cookies'
import { canjearEnlace } from '../../../nucleo/acceso'
import { cerrarConexiones, conEmpresa, conGlobal } from '../../../nucleo/aislamiento'
import { listarAuditoria } from '../../../nucleo/auditoria'
import {
  contextoDe, crearEmpresaDePrueba, hayBaseDeDatos, textoAzar, type EmpresaPrueba,
} from '../../../nucleo/permisos/pruebas/apoyo'
import { cambiarRol, invitarUsuario, listarUsuarios, reactivar, suspender } from '../index'

describe.skipIf(!hayBaseDeDatos)('usuarios (con base real)', () => {
  let alfa: EmpresaPrueba
  let beta: EmpresaPrueba
  const jarra = new Map<string, string>()

  beforeAll(async () => {
    process.env.MODO_LOCAL = '1'
    usarAlmacenDeCookies({ leer: (n) => jarra.get(n), escribir: (n, v) => void jarra.set(n, v), borrar: (n) => void jarra.delete(n) })
    alfa = await crearEmpresaDePrueba('Alfa')
    beta = await crearEmpresaDePrueba('Beta')
  })
  afterAll(async () => { usarAlmacenDeCookies(null); await cerrarConexiones() })

  const nuevoCorreo = () => `nuevo.${textoAzar()}@prueba.local`

  it('lista solo los usuarios de la empresa', async () => {
    const lista = await listarUsuarios(contextoDe(alfa, 'admin'))
    expect(lista).toHaveLength(4)
    expect(lista.map((u) => u.correo)).not.toContain(beta.usuarios.admin!.correo)
    expect(lista.find((u) => u.usuarioId === alfa.usuarios.tecnico!.usuarioId)).toMatchObject({ rolNombre: 'Técnico', estado: 'activo' })
  })

  it('invitar crea el usuario, devuelve el enlace en pantalla, deja auditoría sin datos personales y el enlace entra', async () => {
    const correo = nuevoCorreo()
    const ctx = contextoDe(alfa, 'admin')
    const r = await invitarUsuario(ctx, { correo, nombre: 'Persona Invitada', rolId: alfa.roles.consulta! })
    expect(r.enlaceLocal).toMatch(/^\/entrar\/enlace\?t=/)
    const lista = await listarUsuarios(ctx)
    expect(lista.find((u) => u.correo === correo)).toMatchObject({ nombre: 'Persona Invitada', rolNombre: 'Consulta', estado: 'activo' })

    const aud = await listarAuditoria(ctx, { entidad: 'usuario' })
    const fila = aud.find((a) => a.entidadId === r.usuarioId)
    expect(fila).toMatchObject({ accion: 'usuario.invitar', autorNombre: 'Usuario admin' })
    expect(JSON.stringify(fila?.cambios)).not.toContain(correo)
    expect(JSON.stringify(fila?.cambios)).not.toContain('Persona Invitada')

    const token = new URL(r.enlaceLocal as string, 'http://x').searchParams.get('t') as string
    const { empresas } = await canjearEnlace(token)
    expect(empresas.map((e) => e.slug)).toEqual([alfa.slug])
  })

  it('el mismo correo dos veces en la empresa es DUPLICADO', async () => {
    const ctx = contextoDe(alfa, 'admin')
    const correo = nuevoCorreo()
    await invitarUsuario(ctx, { correo, nombre: 'Primera Vez', rolId: alfa.roles.consulta! })
    await expect(invitarUsuario(ctx, { correo: correo.toUpperCase(), nombre: 'Otra Vez', rolId: alfa.roles.consulta! }))
      .rejects.toMatchObject({ codigo: 'DUPLICADO', campos: { correo: expect.any(String) } })
  })

  it('un usuario que ya está en otra empresa se reutiliza (no se duplica la cuenta)', async () => {
    const existente = beta.usuarios.admin!
    const r = await invitarUsuario(contextoDe(alfa, 'admin'), { correo: existente.correo, nombre: 'Ignorado', rolId: alfa.roles.consulta! })
    expect(r.usuarioId).toBe(existente.usuarioId)
    const n = await conGlobal((tx) => tx.consultar<{ n: number }>(`SELECT count(*)::int AS n FROM usuario WHERE correo_norm = lower($1)`, [existente.correo]))
    expect(n[0]!.n).toBe(1)
  })

  it('no se puede invitar con un rol de otra empresa', async () => {
    await expect(invitarUsuario(contextoDe(alfa, 'admin'), { correo: nuevoCorreo(), nombre: 'Intruso Uno', rolId: beta.roles.admin! }))
      .rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
  })

  it('valida los datos y dice qué campo falló', async () => {
    await expect(invitarUsuario(contextoDe(alfa, 'admin'), { correo: 'malo', nombre: 'x', rolId: 'no-es-id' }))
      .rejects.toMatchObject({ codigo: 'VALIDACION', campos: { correo: expect.any(String), nombre: expect.any(String), rolId: expect.any(String) } })
  })

  it('SIN_PERMISO: sin usuarios.invitar, ni con un rol mayor que el propio', async () => {
    await expect(invitarUsuario(contextoDe(alfa, 'consulta'), { correo: nuevoCorreo(), nombre: 'Sin Permiso', rolId: alfa.roles.consulta! }))
      .rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    const tecnicoQueInvita = contextoDe(alfa, 'tecnico', [...contextoDe(alfa, 'tecnico').permisos, 'usuarios.invitar'])
    await expect(invitarUsuario(tecnicoQueInvita, { correo: nuevoCorreo(), nombre: 'Escalada', rolId: alfa.roles.admin! }))
      .rejects.toMatchObject({ codigo: 'SIN_PERMISO', mensaje: expect.stringContaining('más permisos') })
  })

  it('cambiar el rol: audita antes y después; no el propio; no con permisos de más', async () => {
    const ctx = contextoDe(alfa, 'admin')
    const objetivo = alfa.usuarios.consulta!
    await cambiarRol(ctx, { usuarioId: objetivo.usuarioId, rolId: alfa.roles.tecnico! })
    const u = (await listarUsuarios(ctx)).find((x) => x.usuarioId === objetivo.usuarioId)
    expect(u?.rolNombre).toBe('Técnico')
    const aud = await listarAuditoria(ctx, { entidad: 'usuario' })
    expect(aud.find((a) => a.accion === 'usuario.cambiar_rol' && a.entidadId === objetivo.usuarioId)?.cambios).toEqual({ rol: { antes: 'Consulta', despues: 'Técnico' } })

    await expect(cambiarRol(ctx, { usuarioId: ctx.usuarioId, rolId: alfa.roles.consulta! })).rejects.toMatchObject({ codigo: 'SEPARACION_FUNCIONES' })
    const conCambiarRol = contextoDe(alfa, 'tecnico', [...contextoDe(alfa, 'tecnico').permisos, 'usuarios.cambiar_rol'])
    await expect(cambiarRol(conCambiarRol, { usuarioId: alfa.usuarios.jefa!.usuarioId, rolId: alfa.roles.admin! })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(cambiarRol(contextoDe(alfa, 'consulta'), { usuarioId: objetivo.usuarioId, rolId: alfa.roles.consulta! })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(cambiarRol(ctx, { usuarioId: beta.usuarios.tecnico!.usuarioId, rolId: alfa.roles.consulta! })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
  })

  it('suspender y reactivar: cambian el estado, se auditan, y no a sí mismo', async () => {
    const ctx = contextoDe(alfa, 'admin')
    const objetivo = alfa.usuarios.jefa!
    await suspender(ctx, { usuarioId: objetivo.usuarioId })
    expect((await listarUsuarios(ctx)).find((x) => x.usuarioId === objetivo.usuarioId)?.estado).toBe('suspendido')
    await suspender(ctx, { usuarioId: objetivo.usuarioId }) // repetir no rompe ni duplica auditoría
    await reactivar(ctx, { usuarioId: objetivo.usuarioId })
    expect((await listarUsuarios(ctx)).find((x) => x.usuarioId === objetivo.usuarioId)?.estado).toBe('activo')
    const aud = (await listarAuditoria(ctx, { entidad: 'usuario' })).filter((a) => a.entidadId === objetivo.usuarioId)
    expect(aud.filter((a) => a.accion === 'usuario.suspender')).toHaveLength(1)
    expect(aud.filter((a) => a.accion === 'usuario.reactivar')).toHaveLength(1)

    await expect(suspender(ctx, { usuarioId: ctx.usuarioId })).rejects.toMatchObject({ codigo: 'SEPARACION_FUNCIONES' })
    await expect(suspender(contextoDe(alfa, 'tecnico'), { usuarioId: objetivo.usuarioId })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(suspender(ctx, { usuarioId: beta.usuarios.tecnico!.usuarioId })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
  })

  it('aislamiento: lo hecho en Alfa no aparece en la auditoría de Beta', async () => {
    const aud = await listarAuditoria(contextoDe(beta, 'admin'))
    expect(aud.filter((a) => a.accion.startsWith('usuario.'))).toHaveLength(0)
    await conEmpresa(beta.id, async (tx) => {
      const filas = await tx.consultar(`SELECT 1 FROM membresia WHERE usuario_id = $1`, [alfa.usuarios.tecnico!.usuarioId])
      expect(filas).toHaveLength(0)
    })
  })
})
