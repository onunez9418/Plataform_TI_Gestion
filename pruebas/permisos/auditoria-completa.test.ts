// QA · La auditoría registra quién hizo qué: una fila por cada cambio (con su autor), ninguna por lo que se rechaza,
// y sin datos personales (correos, nombres de personas). Base real, empresa de prueba nueva.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones } from '../../src/nucleo/aislamiento'
import { listarAuditoria } from '../../src/nucleo/auditoria'
import { crearPersona, crearProveedor, crearUbicacion, editarPersona, editarUbicacion } from '../../src/modulos/catalogos'
import { agregarCampo, crearCategoria } from '../../src/modulos/categorias'
import { aprobarOrden, crearOrden, enviarAAprobacion, rechazarOrden, recibirOrden } from '../../src/modulos/compras'
import { asignarActivo, devolverActivo, listarActivos, registrarActivos } from '../../src/modulos/inventario'
import { crearRol, editarRol } from '../../src/modulos/roles'
import { crearSku } from '../../src/modulos/skus'
import { cambiarRol, invitarUsuario, reactivar, suspender } from '../../src/modulos/usuarios'
import { exigirEntorno } from '../apoyo/base'
import { cargarDatos, conPermisos, contextoDe, crearEmpresaDePrueba, sufijo, type Datos, type EmpresaPrueba } from '../apoyo/servicios'

let e: EmpresaPrueba
let d: Datos
const admin = () => contextoDe(e, 'admin')
const total = async () => (await listarAuditoria(admin())).length

/** Ejecuta `f` y devuelve las filas de auditoría nuevas (la lista llega ordenada de la más nueva a la más vieja, tope 200). */
async function filasNuevas(f: () => Promise<unknown>) {
  const antes = await listarAuditoria(admin())
  await f()
  const despues = await listarAuditoria(admin())
  const ids = new Set(antes.map((a) => a.id))
  return despues.filter((a) => !ids.has(a.id))
}

beforeAll(async () => {
  exigirEntorno('DATABASE_URL', 'PLATFORM_DATABASE_URL')
  e = await crearEmpresaDePrueba('QA auditoría')
  d = await cargarDatos(e, 'QU')
})
afterAll(() => cerrarConexiones())

describe('una fila de auditoría por cada cambio, con su autor', () => {
  it('roles, usuarios, catálogos, categorías y SKU', async () => {
    const quien = admin()
    const caso = async (accion: string, f: () => Promise<unknown>, cuantas = 1) => {
      const nuevas = await filasNuevas(f)
      expect(nuevas.map((n) => n.accion), accion).toEqual(Array(cuantas).fill(accion))
      for (const n of nuevas) expect(n.autorNombre, `${accion} sin autor`).toBe(quien.usuarioNombre)
    }
    const rol = await (async () => {
      let creado: Awaited<ReturnType<typeof crearRol>> | undefined
      await caso('rol.crear', async () => { creado = await crearRol(quien, { nombre: `Rol QA ${sufijo()}`, permisos: ['skus.ver'] }) })
      return creado!
    })()
    await caso('rol.editar', () => editarRol(quien, { rolId: rol.id, permisos: ['skus.ver', 'activos.ver'] }))
    const invitado = await (async () => {
      let r: Awaited<ReturnType<typeof invitarUsuario>> | undefined
      await caso('usuario.invitar', async () => { r = await invitarUsuario(quien, { correo: `inv.${sufijo()}@prueba.local`, nombre: 'Invitada QA', rolId: rol.id }) })
      return r!
    })()
    await caso('usuario.cambiar_rol', () => cambiarRol(quien, { usuarioId: invitado.usuarioId, rolId: e.roles.consulta! }))
    await caso('usuario.suspender', () => suspender(quien, { usuarioId: invitado.usuarioId }))
    await caso('usuario.reactivar', () => reactivar(quien, { usuarioId: invitado.usuarioId }))
    const ub = await (async () => {
      let u: Awaited<ReturnType<typeof crearUbicacion>> | undefined
      await caso('ubicacion.crear', async () => { u = await crearUbicacion(quien, { nombre: `Sala ${sufijo()}` }) })
      return u!
    })()
    await caso('ubicacion.editar', () => editarUbicacion(quien, { id: ub.id, descripcion: 'cambiada' }))
    await caso('proveedor.crear', () => crearProveedor(quien, { nombre: `Prov ${sufijo()}` }))
    const per = await (async () => {
      let p: Awaited<ReturnType<typeof crearPersona>> | undefined
      await caso('persona.crear', async () => { p = await crearPersona(quien, { nombre: 'Marta Ficticia', correo: `marta.${sufijo()}@prueba.local`, area: 'Contabilidad' }) })
      return p!
    })()
    await caso('persona.editar', () => editarPersona(quien, { id: per.id, nombre: 'Marta Ficticia Cambiada' }))
    const cat = await (async () => {
      let c: Awaited<ReturnType<typeof crearCategoria>> | undefined
      await caso('categoria.crear', async () => { c = await crearCategoria(quien, { nombre: `Cat ${sufijo()}`, prefijo: 'QB', campos: [] }) })
      return c!
    })()
    await caso('categoria.agregar_campo', () => agregarCampo(quien, { categoriaId: cat.id, campo: { clave: 'nota', etiqueta: 'Nota', tipo: 'texto', obligatorio: false } }))
    await caso('sku.crear', () => crearSku(quien, { categoriaId: cat.id, nombre: 'SKU QA', control: 'serie', valores: {} }))
  })

  it('inventario y compras: un registro por equipo, asignar, devolver, y cada paso de la orden', async () => {
    const quien = admin()
    const tec = contextoDe(e, 'tecnico')
    const jefa = contextoDe(e, 'jefa')
    const nuevas = await filasNuevas(() => registrarActivos(quien, { skuId: d.skuSerie.id, ubicacionId: d.ubicacionA, series: ['AU-1', 'AU-2', 'AU-3'] }))
    expect(nuevas.map((n) => n.accion)).toEqual(['activo.registrar', 'activo.registrar', 'activo.registrar'])
    const activo = (await listarActivos(quien, { texto: 'AU-1' }))[0]!
    expect((await filasNuevas(() => asignarActivo(quien, { activoId: activo.id, personaId: d.persona }))).map((n) => n.accion)).toEqual(['activo.asignar'])
    expect((await filasNuevas(() => devolverActivo(quien, { activoId: activo.id, ubicacionId: d.ubicacionB }))).map((n) => n.accion)).toEqual(['activo.devolver'])
    expect((await filasNuevas(() => registrarActivos(quien, { skuId: d.skuCantidad.id, ubicacionId: d.ubicacionA, cantidad: 4 }))).map((n) => n.accion)).toEqual(['existencia.registrar'])

    const orden = await (async () => {
      let o: Awaited<ReturnType<typeof crearOrden>> | undefined
      expect((await filasNuevas(async () => { o = await crearOrden(tec, { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 2, precioUnitario: 5 }] }) })).map((n) => n.accion)).toEqual(['orden_compra.crear'])
      return o!
    })()
    expect((await filasNuevas(() => enviarAAprobacion(tec, orden.id))).map((n) => n.accion)).toEqual(['orden_compra.enviar_a_aprobacion'])
    const aprobar = await filasNuevas(() => aprobarOrden(jefa, orden.id))
    expect(aprobar.map((n) => n.accion)).toEqual(['orden_compra.aprobar'])
    expect(aprobar[0]!.autorNombre).toBe(jefa.usuarioNombre)
    const rec = await filasNuevas(() => recibirOrden(quien, { ordenId: orden.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: orden.lineas[0]!.id, cantidad: 2, series: ['AU-R1', 'AU-R2'] }] }))
    expect(rec.map((n) => n.accion).sort()).toEqual(['activo.registrar', 'activo.registrar', 'orden_compra.recibir'])

    const otra = await crearOrden(tec, { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 1, precioUnitario: 5 }] })
    await enviarAAprobacion(tec, otra.id)
    const rech = await filasNuevas(() => rechazarOrden(jefa, { id: otra.id, motivo: 'Fuera de presupuesto' }))
    expect(rech.map((n) => n.accion)).toEqual(['orden_compra.rechazar'])
    // El texto libre del motivo no va a la auditoría (puede traer datos personales, D-077): queda en la aprobación de la orden.
    expect(rech[0]!.motivo).toBeNull()
    const { obtenerOrden } = await import('../../src/modulos/compras')
    expect((await obtenerOrden(quien, otra.id)).aprobaciones[0]).toMatchObject({ decision: 'rechazada', motivo: 'Fuera de presupuesto' })
  })
})

describe('lo rechazado no deja rastro de cambio', () => {
  it('validaciones, SIN_PERMISO, duplicados y conflictos no agregan filas de auditoría', async () => {
    const antes = await total()
    const sinNada = conPermisos(e, 'consulta', [])
    const intentos: (() => Promise<unknown>)[] = [
      () => crearRol(sinNada, { nombre: 'X', permisos: [] }),
      () => crearUbicacion(admin(), { nombre: '' }),
      () => crearSku(admin(), { categoriaId: d.categoriaId, nombre: 'x', control: 'raro' as never, valores: {} }),
      () => registrarActivos(admin(), { skuId: d.skuSerie.id, ubicacionId: d.ubicacionA, series: ['AU-2'] }), // serie repetida
      () => registrarActivos(admin(), { skuId: d.skuSerie.id, ubicacionId: d.ubicacionA, series: [] }),
      () => crearOrden(admin(), { proveedorId: d.proveedor, lineas: [] }),
      () => suspender(admin(), { usuarioId: admin().usuarioId }), // a sí mismo
    ]
    for (const f of intentos) await f().catch(() => undefined)
    expect(await total()).toBe(antes)
  })

  it('lo no cambiado no se registra: editar una ubicación sin cambios no escribe auditoría', async () => {
    const u = await crearUbicacion(admin(), { nombre: `Fija ${sufijo()}`, descripcion: 'igual' })
    const nuevas = await filasNuevas(() => editarUbicacion(admin(), { id: u.id, descripcion: 'igual' }))
    expect(nuevas).toEqual([])
  })
})

describe('sin datos personales en la auditoría', () => {
  it('ninguna fila de esta empresa guarda correos ni los nombres de las personas', async () => {
    const todo = JSON.stringify(await listarAuditoria(admin()))
    expect(todo).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/) // ningún correo
    expect(todo).not.toContain('Marta Ficticia')
    expect(todo).not.toContain('Invitada QA')
  })

  it('en la base de ejemplo (Alfa y Beta) tampoco hay correos en la auditoría', async () => {
    const { clienteApp, empresasDeEjemplo, simulando } = await import('../apoyo/base')
    const c = await clienteApp()
    try {
      const E = await empresasDeEjemplo(c)
      for (const id of [E.alfa, E.beta]) {
        await simulando(c, id, async () => {
          const r = await c.query(`SELECT accion, cambios::text AS cambios, motivo FROM auditoria WHERE cambios::text ~ '[A-Za-z0-9._-]+@[A-Za-z0-9-]+\\.' OR motivo ~ '@'`)
          expect(r.rows, 'auditoría con correos').toEqual([])
        })
      }
    } finally {
      await c.end()
    }
  })
})
