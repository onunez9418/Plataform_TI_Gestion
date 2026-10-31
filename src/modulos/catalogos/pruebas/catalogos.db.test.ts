import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones } from '../../../nucleo/aislamiento'
import { listarAuditoria } from '../../../nucleo/auditoria'
import { contextoDe, crearEmpresaDePrueba, hayBaseDeDatos, type EmpresaPrueba } from '../../../nucleo/permisos/pruebas/apoyo'
import {
  crearPersona, crearProveedor, crearUbicacion, editarPersona, editarProveedor, editarUbicacion,
  listarPersonas, listarProveedores, listarUbicaciones,
} from '../index'

describe.skipIf(!hayBaseDeDatos)('catálogos: ubicaciones, proveedores y personas (con base real)', () => {
  let alfa: EmpresaPrueba
  let beta: EmpresaPrueba
  beforeAll(async () => { alfa = await crearEmpresaDePrueba('Alfa'); beta = await crearEmpresaDePrueba('Beta') })
  afterAll(async () => { await cerrarConexiones() })

  it('ubicaciones: crear, listar, editar y desactivar, con auditoría', async () => {
    const ctx = contextoDe(alfa, 'tecnico')
    const u = await crearUbicacion(ctx, { nombre: 'Almacén central', descripcion: 'Piso 1' })
    expect(u).toMatchObject({ nombre: 'Almacén central', descripcion: 'Piso 1', activo: true })
    expect((await listarUbicaciones(ctx)).map((x) => x.id)).toContain(u.id)
    const e = await editarUbicacion(ctx, { id: u.id, nombre: 'Almacén principal', descripcion: null, activo: false })
    expect(e).toMatchObject({ nombre: 'Almacén principal', descripcion: null, activo: false })
    const aud = await listarAuditoria(contextoDe(alfa, 'admin'), { entidad: 'ubicacion' })
    expect(aud.map((a) => a.accion)).toEqual(expect.arrayContaining(['ubicacion.crear', 'ubicacion.editar']))
  })

  it('DUPLICADO: ubicación (nombre), proveedor (documento) y persona (correo); la otra empresa sí puede repetirlos', async () => {
    const ctx = contextoDe(alfa, 'admin')
    await crearUbicacion(ctx, { nombre: 'Oficina Lima' })
    await expect(crearUbicacion(ctx, { nombre: 'oficina lima' })).rejects.toMatchObject({ codigo: 'DUPLICADO', campos: { nombre: expect.any(String) } })
    await crearProveedor(ctx, { nombre: 'Proveedor Uno', documento: '20100000001' })
    await expect(crearProveedor(ctx, { nombre: 'Proveedor Dos', documento: '20100000001' })).rejects.toMatchObject({ codigo: 'DUPLICADO', campos: { documento: expect.any(String) } })
    await crearPersona(ctx, { nombre: 'Ana Ejemplo', correo: 'ana@alfa.local' })
    await expect(crearPersona(ctx, { nombre: 'Otra Ana', correo: 'ANA@alfa.local' })).rejects.toMatchObject({ codigo: 'DUPLICADO', campos: { correo: expect.any(String) } })
    const b = contextoDe(beta, 'admin')
    await expect(crearUbicacion(b, { nombre: 'Oficina Lima' })).resolves.toBeDefined()
    await expect(crearProveedor(b, { nombre: 'Proveedor Uno', documento: '20100000001' })).resolves.toBeDefined()
    await expect(crearPersona(b, { nombre: 'Ana Ejemplo', correo: 'ana@alfa.local' })).resolves.toBeDefined()
  })

  it('la auditoría de personas no guarda nombre ni correo', async () => {
    const ctx = contextoDe(alfa, 'admin')
    const p = await crearPersona(ctx, { nombre: 'Persona Secreta', correo: 'secreta@alfa.local', area: 'Finanzas' })
    await editarPersona(ctx, { id: p.id, area: 'Compras' })
    const aud = await listarAuditoria(ctx, { entidad: 'persona' })
    const texto = JSON.stringify(aud.filter((a) => a.entidadId === p.id))
    expect(texto).not.toContain('Persona Secreta')
    expect(texto).not.toContain('secreta@alfa.local')
    expect(texto).not.toContain('Finanzas')
    expect(aud.filter((a) => a.entidadId === p.id)).toHaveLength(2)
  })

  it('valida los datos con un mensaje por campo', async () => {
    const ctx = contextoDe(alfa, 'admin')
    await expect(crearPersona(ctx, { nombre: 'x', correo: 'no-es-correo' })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { nombre: expect.any(String), correo: expect.any(String) } })
    await expect(crearUbicacion(ctx, { nombre: '' })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { nombre: expect.any(String) } })
    await expect(crearProveedor(ctx, { nombre: 'Prov', documento: 'x'.repeat(31) })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { documento: expect.any(String) } })
  })

  it('SIN_PERMISO por cada servicio de escritura y de lectura', async () => {
    const consulta = contextoDe(alfa, 'consulta')
    await expect(crearUbicacion(consulta, { nombre: 'No' })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(editarUbicacion(consulta, { id: 'x', nombre: 'No' })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(crearProveedor(contextoDe(alfa, 'tecnico'), { nombre: 'No' })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(editarProveedor(consulta, { id: 'x', nombre: 'No' })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(crearPersona(consulta, { nombre: 'No Puede' })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(editarPersona(consulta, { id: 'x', nombre: 'No' })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    const nada = contextoDe(alfa, 'consulta', [])
    await expect(listarUbicaciones(nada)).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(listarProveedores(nada)).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(listarPersonas(nada)).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
  })

  it('aislamiento: no se ve ni se edita lo de la otra empresa', async () => {
    const enAlfa = await crearUbicacion(contextoDe(alfa, 'admin'), { nombre: 'Solo de Alfa' })
    const b = contextoDe(beta, 'admin')
    expect((await listarUbicaciones(b)).map((u) => u.nombre)).not.toContain('Solo de Alfa')
    await expect(editarUbicacion(b, { id: enAlfa.id, nombre: 'Robada' })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
    await expect(editarUbicacion(b, { id: 'no-es-un-id', nombre: 'Rara' })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
    expect((await listarUbicaciones(contextoDe(alfa, 'admin'))).find((u) => u.id === enAlfa.id)?.nombre).toBe('Solo de Alfa')
  })

  it('editar sin cambios no escribe auditoría y proveedores se pueden desactivar', async () => {
    const ctx = contextoDe(alfa, 'admin')
    const p = await crearProveedor(ctx, { nombre: 'Prov Editable' })
    await editarProveedor(ctx, { id: p.id, nombre: 'Prov Editable' })
    const desactivado = await editarProveedor(ctx, { id: p.id, activo: false, contacto: 'ventas@prov.local' })
    expect(desactivado).toMatchObject({ activo: false, contacto: 'ventas@prov.local' })
    const aud = (await listarAuditoria(ctx, { entidad: 'proveedor' })).filter((a) => a.entidadId === p.id)
    expect(aud.map((a) => a.accion).sort()).toEqual(['proveedor.crear', 'proveedor.editar'])
  })

  it('H-CUM-02: el contacto del proveedor no va a la auditoría con su valor, solo que cambió', async () => {
    const ctx = contextoDe(alfa, 'admin')
    const p = await crearProveedor(ctx, { nombre: 'Prov Con Contacto', contacto: 'Ana Ejemplo ana.contacto@prov.local' })
    await editarProveedor(ctx, { id: p.id, contacto: 'Beto Ejemplo beto.contacto@prov.local', nombre: 'Prov Con Contacto SAC' })
    const aud = (await listarAuditoria(ctx, { entidad: 'proveedor' })).filter((a) => a.entidadId === p.id)
    expect(aud).toHaveLength(2)
    const texto = JSON.stringify(aud)
    expect(texto).not.toContain('ana.contacto')
    expect(texto).not.toContain('beto.contacto')
    expect(texto).not.toContain('Ana Ejemplo')
    const crear = aud.find((a) => a.accion === 'proveedor.crear')
    expect(crear?.cambios).toMatchObject({ nombre: 'Prov Con Contacto', contacto: 'cambió' })
    const editar = aud.find((a) => a.accion === 'proveedor.editar')
    expect(editar?.cambios).toMatchObject({ contacto: 'cambió', nombre: { antes: 'Prov Con Contacto', despues: 'Prov Con Contacto SAC' } })
    // El dato en sí sí se guarda y se muestra en el catálogo, que es su lugar.
    expect((await listarProveedores(ctx)).find((x) => x.id === p.id)?.contacto).toBe('Beto Ejemplo beto.contacto@prov.local')
  })
})
