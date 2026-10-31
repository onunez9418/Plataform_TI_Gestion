// QA · Una empresa intenta ver o modificar datos de la otra USANDO LOS SERVICIOS (lo que hace la aplicación):
// identificadores de la otra empresa en cada entrada, filtros, búsquedas por texto, listados y auditoría.
// Dos empresas nuevas con datos marcados. Nada de la empresa B debe aparecer ni cambiar.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones } from '../../src/nucleo/aislamiento'
import { listarAuditoria } from '../../src/nucleo/auditoria'
import { agregarCampo, crearCategoria, listarCategorias } from '../../src/modulos/categorias'
import { editarPersona, editarProveedor, editarUbicacion, listarPersonas, listarProveedores, listarUbicaciones } from '../../src/modulos/catalogos'
import { aprobarOrden, crearOrden, enviarAAprobacion, listarOrdenes, obtenerOrden, rechazarOrden, recibirOrden } from '../../src/modulos/compras'
import { asignarActivo, devolverActivo, historialActivo, listarActivos, listarExistencias, obtenerActivo, registrarActivos } from '../../src/modulos/inventario'
import { crearRol, editarRol, listarRoles } from '../../src/modulos/roles'
import { crearSku, listarSkus, obtenerSku } from '../../src/modulos/skus'
import { cambiarRol, invitarUsuario, listarUsuarios, reactivar, suspender } from '../../src/modulos/usuarios'
import { exigirEntorno } from '../apoyo/base'
import { cargarDatos, contextoDe, crearEmpresaDePrueba, huella, type Datos, type EmpresaPrueba } from '../apoyo/servicios'

let A: EmpresaPrueba
let B: EmpresaPrueba
let dA: Datos
let dB: Datos
let activoA = ''
let activoB = ''
let ordenB = ''
let lineaB = ''
let ordenA = ''
const MARCA = 'MARCA-SECRETA-DE-B'

const codigo = async (p: Promise<unknown>) => {
  try {
    await p
    return 'OK'
  } catch (err) {
    return (err as { codigo?: string }).codigo ?? String(err)
  }
}
const adminA = () => contextoDe(A, 'admin')
const adminB = () => contextoDe(B, 'admin')

beforeAll(async () => {
  exigirEntorno('DATABASE_URL', 'PLATFORM_DATABASE_URL')
  A = await crearEmpresaDePrueba('QA cruce A')
  B = await crearEmpresaDePrueba('QA cruce B')
  dA = await cargarDatos(A, 'QX')
  dB = await cargarDatos(B, 'QX') // mismos prefijos y códigos en las dos a propósito
  await registrarActivos(adminA(), { skuId: dA.skuSerie.id, ubicacionId: dA.ubicacionA, series: ['SERIE-COMUN-1', 'A-SOLO-1'] })
  await registrarActivos(adminB(), { skuId: dB.skuSerie.id, ubicacionId: dB.ubicacionA, series: ['SERIE-COMUN-1', `${MARCA}-1`] })
  activoA = (await listarActivos(adminA(), { texto: 'A-SOLO-1' }))[0]!.id
  activoB = (await listarActivos(adminB(), { texto: `${MARCA}-1` }))[0]!.id
  // Cosas marcadas en B: persona, proveedor, ubicación, rol, categoría, orden.
  await crearRol(adminB(), { nombre: `${MARCA} rol`, permisos: ['skus.ver'] })
  await crearCategoria(adminB(), { nombre: `${MARCA} categoría`, prefijo: 'MB', campos: [{ clave: 'campo_b', etiqueta: `${MARCA} campo`, tipo: 'texto', obligatorio: false }] })
  const o = await crearOrden(contextoDe(B, 'tecnico'), { proveedorId: dB.proveedor, lineas: [{ skuId: dB.skuSerie.id, cantidad: 3, precioUnitario: 9 }] })
  ordenB = o.id
  lineaB = o.lineas[0]!.id
  await enviarAAprobacion(contextoDe(B, 'tecnico'), ordenB)
  const oa = await crearOrden(contextoDe(A, 'tecnico'), { proveedorId: dA.proveedor, lineas: [{ skuId: dA.skuSerie.id, cantidad: 2, precioUnitario: 1 }] })
  ordenA = oa.id
})
afterAll(() => cerrarConexiones())

describe('A usa identificadores de B en cada servicio: no existe, y B no cambia', () => {
  it('ninguna llamada con ids de B funciona, y las dos empresas quedan idénticas (cuentas de filas y auditoría)', async () => {
    const antesA = await huella(A.id)
    const antesB = await huella(B.id)
    const a = adminA()
    const tecA = contextoDe(A, 'tecnico')
    const jefaA = contextoDe(A, 'jefa')
    const usuarioB = B.usuarios.tecnico!.usuarioId
    const llamadas: [string, () => Promise<unknown>][] = [
      ['obtenerSku(B)', () => obtenerSku(a, dB.skuSerie.id)],
      ['obtenerActivo(B)', () => obtenerActivo(a, activoB)],
      ['historialActivo(B)', () => historialActivo(a, activoB)],
      ['registrar: sku de B', () => registrarActivos(a, { skuId: dB.skuSerie.id, ubicacionId: dA.ubicacionA, series: ['INTRUSA-1'] })],
      ['registrar: ubicación de B', () => registrarActivos(a, { skuId: dA.skuSerie.id, ubicacionId: dB.ubicacionA, series: ['INTRUSA-2'] })],
      ['registrar cantidad: ubicación de B', () => registrarActivos(a, { skuId: dA.skuCantidad.id, ubicacionId: dB.ubicacionA, cantidad: 5 })],
      ['asignar: activo de B', () => asignarActivo(a, { activoId: activoB, personaId: dA.persona })],
      ['asignar: persona de B', () => asignarActivo(a, { activoId: activoA, personaId: dB.persona })],
      ['devolver: activo de B', () => devolverActivo(a, { activoId: activoB, ubicacionId: dA.ubicacionA })],
      ['crearSku: categoría de B', () => crearSku(a, { categoriaId: dB.categoriaId, nombre: 'Intruso', control: 'serie', valores: {} })],
      ['agregarCampo: categoría de B', () => agregarCampo(a, { categoriaId: dB.categoriaId, campo: { clave: 'intruso', etiqueta: 'Intruso', tipo: 'texto', obligatorio: false } })],
      ['editarUbicacion(B)', () => editarUbicacion(a, { id: dB.ubicacionA, nombre: 'Hackeada' })],
      ['editarProveedor(B)', () => editarProveedor(a, { id: dB.proveedor, nombre: 'Hackeado' })],
      ['editarPersona(B)', () => editarPersona(a, { id: dB.persona, nombre: 'Hackeada' })],
      ['editarRol(B)', () => editarRol(a, { rolId: B.roles.consulta!, nombre: 'Hackeado', permisos: ['skus.ver'] })],
      ['cambiarRol: usuario de B', () => cambiarRol(a, { usuarioId: usuarioB, rolId: A.roles.consulta! })],
      ['cambiarRol: rol de B', () => cambiarRol(a, { usuarioId: A.usuarios.tecnico!.usuarioId, rolId: B.roles.admin! })],
      ['suspender usuario de B', () => suspender(a, { usuarioId: usuarioB })],
      ['reactivar usuario de B', () => reactivar(a, { usuarioId: usuarioB })],
      ['invitar con rol de B', () => invitarUsuario(a, { correo: 'nuevo.qa@prueba.local', nombre: 'Nuevo QA', rolId: B.roles.consulta! })],
      ['obtenerOrden(B)', () => obtenerOrden(a, ordenB)],
      ['enviarAAprobacion(B)', () => enviarAAprobacion(tecA, ordenB)],
      ['aprobarOrden(B)', () => aprobarOrden(jefaA, ordenB)],
      ['rechazarOrden(B)', () => rechazarOrden(jefaA, { id: ordenB, motivo: 'intruso' })],
      ['recibirOrden(B)', () => recibirOrden(adminA(), { ordenId: ordenB, ubicacionId: dA.ubicacionA, lineas: [{ lineaId: lineaB, cantidad: 1, series: ['I-1'] }] })],
      ['crearOrden: proveedor de B', () => crearOrden(tecA, { proveedorId: dB.proveedor, lineas: [{ skuId: dA.skuSerie.id, cantidad: 1, precioUnitario: 1 }] })],
      ['crearOrden: sku de B', () => crearOrden(tecA, { proveedorId: dA.proveedor, lineas: [{ skuId: dB.skuSerie.id, cantidad: 1, precioUnitario: 1 }] })],
      ['recibirOrden de A con línea de B', () => recibirOrden(adminA(), { ordenId: ordenA, ubicacionId: dA.ubicacionA, lineas: [{ lineaId: lineaB, cantidad: 1, series: ['I-2'] }] })],
      ['recibirOrden de A con ubicación de B', () => recibirOrden(adminA(), { ordenId: ordenA, ubicacionId: dB.ubicacionA, lineas: [{ lineaId: lineaB, cantidad: 1, series: ['I-3'] }] })],
    ]
    for (const [nombre, f] of llamadas) {
      const c = await codigo(f())
      expect(['NO_ENCONTRADO', 'VALIDACION', 'CONFLICTO', 'SIN_PERMISO'], `${nombre} respondió ${c}`).toContain(c)
      expect(c, `${nombre} funcionó con datos de otra empresa`).not.toBe('OK')
    }
    expect(await huella(B.id)).toEqual(antesB)
    expect(await huella(A.id)).toEqual(antesA)
    // B sigue intacta en lo que importa:
    expect((await obtenerOrden(adminB(), ordenB)).estado).toBe('por_aprobar')
    expect((await listarActivos(adminB(), { texto: `${MARCA}-1` }))[0]!.estado).toBe('en_stock')
  })

  it('la existencia de B no se alcanza con un ID de B (NO_ENCONTRADO igual que un ID inexistente: no delata)', async () => {
    const inexistente = '018f0000-0000-7000-8000-0000000000bb'
    const mensajeB = await obtenerActivo(adminA(), activoB).catch((e) => e.mensaje)
    const mensajeNada = await obtenerActivo(adminA(), inexistente).catch((e) => e.mensaje)
    expect(mensajeB).toBe(mensajeNada)
    const ordenB1 = await obtenerOrden(adminA(), ordenB).catch((e) => e.mensaje)
    const ordenNada = await obtenerOrden(adminA(), inexistente).catch((e) => e.mensaje)
    expect(ordenB1).toBe(ordenNada)
  })
})

describe('listados, filtros, búsquedas y auditoría de A no traen nada de B', () => {
  const sinMarca = (x: unknown) => expect(JSON.stringify(x)).not.toContain(MARCA)

  it('ningún listado de A contiene datos marcados de B ni sus identificadores', async () => {
    const a = adminA()
    const todo = {
      skus: await listarSkus(a), activos: await listarActivos(a), existencias: await listarExistencias(a),
      ordenes: await listarOrdenes(a), usuarios: await listarUsuarios(a), roles: await listarRoles(a),
      ubicaciones: await listarUbicaciones(a), proveedores: await listarProveedores(a), personas: await listarPersonas(a),
      categorias: await listarCategorias(a), auditoria: await listarAuditoria(a),
    }
    sinMarca(todo)
    const texto = JSON.stringify(todo)
    for (const idB of [activoB, ordenB, lineaB, dB.skuSerie.id, dB.ubicacionA, dB.persona, dB.proveedor, dB.categoriaId, B.roles.admin!, B.usuarios.admin!.usuarioId, B.usuarios.admin!.correo, B.id]) {
      expect(texto, `aparece algo de B: ${idB}`).not.toContain(idB)
    }
    expect(todo.usuarios.map((u) => u.correo).sort()).toEqual(Object.values(A.usuarios).map((u) => u.correo).sort())
  })

  it('los filtros con ids de B devuelven vacío', async () => {
    const a = adminA()
    expect(await listarActivos(a, { skuId: dB.skuSerie.id })).toEqual([])
    expect(await listarActivos(a, { personaId: dB.persona })).toEqual([])
    expect(await listarSkus(a, { categoriaId: dB.categoriaId })).toEqual([])
  })

  it('buscar por texto algo que solo existe en B no encuentra nada; la serie repetida en las dos solo muestra la propia', async () => {
    const a = adminA()
    expect(await listarActivos(a, { texto: MARCA })).toEqual([])
    expect(await listarSkus(a, { texto: MARCA })).toEqual([])
    expect(await listarActivos(a, { texto: '%' }), 'el % se tomó como comodín y trajo todo').toEqual([]) // se toma literal
    const comunes = await listarActivos(a, { texto: 'SERIE-COMUN-1' })
    expect(comunes).toHaveLength(1)
    expect(comunes[0]!.skuId).toBe(dA.skuSerie.id)
  })

  it('los códigos repetidos a propósito (mismo prefijo, mismo SKU) no se mezclan: cada empresa tiene su correlativo', async () => {
    const codigosA = (await listarSkus(adminA())).map((s) => s.codigo)
    const codigosB = (await listarSkus(adminB())).map((s) => s.codigo)
    expect(codigosA.sort()).toEqual(codigosB.sort()) // mismos códigos, a propósito
    const idsA = new Set((await listarSkus(adminA())).map((s) => s.id))
    expect((await listarSkus(adminB())).some((s) => idsA.has(s.id))).toBe(false)
  })

  it('la auditoría de B solo habla de B: ninguna entrada tiene un identificador de A, y viceversa', async () => {
    const audA = JSON.stringify(await listarAuditoria(adminA()))
    const audB = JSON.stringify(await listarAuditoria(adminB()))
    for (const idA of [activoA, ordenA, dA.skuSerie.id, dA.ubicacionA, A.usuarios.admin!.correo]) expect(audB, idA).not.toContain(idA)
    for (const idB of [activoB, ordenB, dB.skuSerie.id, dB.ubicacionA, B.usuarios.admin!.correo]) expect(audA, idB).not.toContain(idB)
  })

  it('el filtro de auditoría por entidad y fechas tampoco mezcla empresas', async () => {
    const r = await listarAuditoria(adminA(), { entidad: 'activo', desde: '2000-01-01', hasta: '2100-01-01' })
    expect(r.length).toBeGreaterThan(0)
    expect(JSON.stringify(r)).not.toContain(activoB)
    await expect(listarAuditoria(adminA(), { desde: 'no-es-fecha' })).rejects.toMatchObject({ codigo: 'VALIDACION' })
  })
})
