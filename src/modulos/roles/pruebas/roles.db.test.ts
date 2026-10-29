import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones } from '../../../nucleo/aislamiento'
import { listarAuditoria } from '../../../nucleo/auditoria'
import { contextoDe, crearEmpresaDePrueba, hayBaseDeDatos, type EmpresaPrueba } from '../../../nucleo/permisos/pruebas/apoyo'
import { catalogoPermisos, crearRol, editarRol, listarRoles } from '../index'

describe.skipIf(!hayBaseDeDatos)('roles (con base real)', () => {
  let alfa: EmpresaPrueba
  let beta: EmpresaPrueba
  beforeAll(async () => { alfa = await crearEmpresaDePrueba('Alfa'); beta = await crearEmpresaDePrueba('Beta') })
  afterAll(async () => { await cerrarConexiones() })

  it('lista los 4 roles base con sus permisos y cuántos usuarios tienen', async () => {
    const roles = await listarRoles(contextoDe(alfa, 'consulta', ['roles.ver']))
    expect(roles.map((r) => r.nombre).sort()).toEqual(['Administrador', 'Consulta', 'Jefatura TI', 'Técnico'])
    const consulta = roles.find((r) => r.nombre === 'Consulta')
    expect(consulta).toMatchObject({ esBase: true, usuarios: 1 })
    expect(consulta?.permisos).toContain('skus.ver')
    expect(consulta?.permisos).not.toContain('skus.crear_editar')
  })

  it('crear el rol «Solo lectura» (guion del CEO) deja auditoría', async () => {
    const ctx = contextoDe(alfa, 'admin')
    const rol = await crearRol(ctx, { nombre: 'Solo lectura', permisos: ['skus.ver', 'catalogos.ver'] })
    expect(rol).toMatchObject({ nombre: 'Solo lectura', esBase: false, usuarios: 0, permisos: ['catalogos.ver', 'skus.ver'] })
    const aud = await listarAuditoria(ctx, { entidad: 'rol' })
    expect(aud.find((a) => a.accion === 'rol.crear' && a.entidadId === rol.id)).toBeDefined()
  })

  it('DUPLICADO: mismo nombre sin importar mayúsculas ni tildes', async () => {
    const ctx = contextoDe(alfa, 'admin')
    await crearRol(ctx, { nombre: 'Soporte Técnico', permisos: ['skus.ver'] })
    await expect(crearRol(ctx, { nombre: 'soporte tecnico', permisos: ['skus.ver'] }))
      .rejects.toMatchObject({ codigo: 'DUPLICADO', campos: { nombre: expect.any(String) } })
    // En otra empresa el mismo nombre es válido.
    await expect(crearRol(contextoDe(beta, 'admin'), { nombre: 'Soporte Técnico', permisos: ['skus.ver'] })).resolves.toBeDefined()
  })

  it('SIN_PERMISO sin roles.administrar (y no se ve el botón ni se llega por la acción)', async () => {
    await expect(crearRol(contextoDe(alfa, 'tecnico'), { nombre: 'Intento', permisos: ['skus.ver'] })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(editarRol(contextoDe(alfa, 'consulta'), { rolId: alfa.roles.tecnico!, nombre: 'Intento' })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(listarRoles(contextoDe(alfa, 'tecnico'))).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
  })

  it('nadie da permisos que no tiene', async () => {
    const ctx = contextoDe(alfa, 'tecnico', ['roles.administrar', 'skus.ver'])
    await expect(crearRol(ctx, { nombre: 'Escalada', permisos: ['skus.ver', 'usuarios.suspender'] })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
  })

  it('valida nombre y permisos', async () => {
    const ctx = contextoDe(alfa, 'admin')
    await expect(crearRol(ctx, { nombre: ' ', permisos: [] })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { nombre: expect.any(String) } })
    await expect(crearRol(ctx, { nombre: 'Con inventado', permisos: ['inventado.todo'] })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { permisos: expect.stringContaining('inventado.todo') } })
    await expect(crearRol(ctx, { nombre: 'Sin lista', permisos: 'skus.ver' as unknown as string[] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
  })

  it('editar: cambia nombre y permisos, audita; no el propio, no los roles base, no de otra empresa', async () => {
    const ctx = contextoDe(alfa, 'admin')
    const rol = await crearRol(ctx, { nombre: 'Editable', permisos: ['skus.ver', 'catalogos.ver'] })
    const editado = await editarRol(ctx, { rolId: rol.id, nombre: 'Editado', permisos: ['skus.ver', 'activos.ver'] })
    expect(editado).toMatchObject({ nombre: 'Editado', permisos: ['activos.ver', 'skus.ver'] })
    const aud = await listarAuditoria(ctx, { entidad: 'rol' })
    expect(aud.find((a) => a.accion === 'rol.editar' && a.entidadId === rol.id)?.cambios).toMatchObject({ nombre: { antes: 'Editable', despues: 'Editado' } })

    await expect(editarRol(ctx, { rolId: alfa.roles.admin!, nombre: 'Mi rol' })).rejects.toMatchObject({ codigo: 'SEPARACION_FUNCIONES' })
    await expect(editarRol(ctx, { rolId: alfa.roles.tecnico!, nombre: 'Técnico 2' })).rejects.toMatchObject({ codigo: 'VALIDACION' })
    await expect(editarRol(ctx, { rolId: beta.roles.consulta!, nombre: 'Ajeno' })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
    await expect(editarRol(ctx, { rolId: 'no-es-id', nombre: 'Ajeno' })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
  })

  it('aislamiento: Beta no ve los roles creados en Alfa', async () => {
    const nombres = (await listarRoles(contextoDe(beta, 'admin'))).map((r) => r.nombre)
    expect(nombres).not.toContain('Solo lectura')
  })

  it('catalogoPermisos no necesita base ni permiso', () => {
    expect(catalogoPermisos().map((p) => p.clave)).toContain('roles.administrar')
  })
})
