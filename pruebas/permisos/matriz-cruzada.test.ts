// QA · Permisos en el SERVIDOR, entre módulos (A.8.3). Contra la base real y empresas de prueba nuevas.
// Para CADA servicio de la aplicación:
//   (a) con TODOS los permisos menos el suyo → SIN_PERMISO (el permiso exacto es el que manda, no «cualquiera»);
//   (b) con SOLO el suyo → no responde SIN_PERMISO (alcanza con ese permiso);
//   (c) sin ninguno, y con un contexto vacío o manipulado → SIN_ACCESO / SIN_PERMISO.
// Y por rol: lo que el Consulta, el Técnico y la Jefatura NO pueden hacer aunque llamen al servidor directo.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones } from '../../src/nucleo/aislamiento'
import { listarAuditoria } from '../../src/nucleo/auditoria'
import { SERVICIOS_DEFINIDOS } from '../../src/nucleo/permisos'
import {
  agregarCampo as agregarCampoCat, crearCategoria, listarCategorias,
} from '../../src/modulos/categorias'
import {
  crearPersona, crearProveedor, crearUbicacion, editarPersona, editarProveedor, editarUbicacion,
  listarPersonas, listarProveedores, listarUbicaciones,
} from '../../src/modulos/catalogos'
import { aprobarOrden, crearOrden, enviarAAprobacion, listarOrdenes, obtenerOrden, rechazarOrden, recibirOrden } from '../../src/modulos/compras'
import {
  asignarActivo, devolverActivo, historialActivo, listarActivos, listarExistencias, obtenerActivo, registrarActivos,
} from '../../src/modulos/inventario'
import { crearRol, editarRol, listarRoles } from '../../src/modulos/roles'
import { crearSku, listarSkus, obtenerSku } from '../../src/modulos/skus'
import { cambiarRol, invitarUsuario, listarUsuarios, reactivar, suspender } from '../../src/modulos/usuarios'
import type { Contexto } from '../../src/nucleo/tipos-comunes'
import { exigirEntorno } from '../apoyo/base'
import { cargarDatos, conPermisos, contextoDe, crearEmpresaDePrueba, TODOS_LOS_PERMISOS, type Datos, type EmpresaPrueba } from '../apoyo/servicios'

type Llamada = (ctx: Contexto) => Promise<unknown>
const ID = '018f0000-0000-7000-8000-0000000000aa' // identificador con forma válida que no existe
const x = {} as never

/** Un servicio por nombre registrado (SERVICIOS_DEFINIDOS), con argumentos inofensivos: no existe nada con ese ID. */
const SERVICIOS: Record<string, Llamada> = {
  'auditoria.listar': (c) => listarAuditoria(c),
  'usuarios.listar': (c) => listarUsuarios(c),
  'usuarios.invitar': (c) => invitarUsuario(c, x),
  'usuarios.cambiar_rol': (c) => cambiarRol(c, { usuarioId: ID, rolId: ID }),
  'usuarios.suspender': (c) => suspender(c, { usuarioId: ID }),
  'usuarios.reactivar': (c) => reactivar(c, { usuarioId: ID }),
  'roles.listar': (c) => listarRoles(c),
  'roles.crear': (c) => crearRol(c, x),
  'roles.editar': (c) => editarRol(c, { rolId: ID }),
  'catalogos.ubicaciones.listar': (c) => listarUbicaciones(c),
  'catalogos.ubicaciones.crear': (c) => crearUbicacion(c, x),
  'catalogos.ubicaciones.editar': (c) => editarUbicacion(c, { id: ID }),
  'catalogos.proveedores.listar': (c) => listarProveedores(c),
  'catalogos.proveedores.crear': (c) => crearProveedor(c, x),
  'catalogos.proveedores.editar': (c) => editarProveedor(c, { id: ID }),
  'catalogos.personas.listar': (c) => listarPersonas(c),
  'catalogos.personas.crear': (c) => crearPersona(c, x),
  'catalogos.personas.editar': (c) => editarPersona(c, { id: ID }),
  'categorias.listar': (c) => listarCategorias(c),
  'categorias.crear': (c) => crearCategoria(c, x),
  'categorias.agregar_campo': (c) => agregarCampoCat(c, { categoriaId: ID, campo: { clave: 'x', etiqueta: 'x', tipo: 'texto', obligatorio: false } }),
  'skus.listar': (c) => listarSkus(c),
  'skus.obtener': (c) => obtenerSku(c, ID),
  'skus.crear': (c) => crearSku(c, x),
  'inventario.listar': (c) => listarActivos(c),
  'inventario.listar_existencias': (c) => listarExistencias(c),
  'inventario.obtener': (c) => obtenerActivo(c, ID),
  'inventario.historial': (c) => historialActivo(c, ID),
  'inventario.registrar': (c) => registrarActivos(c, x),
  'inventario.asignar': (c) => asignarActivo(c, x),
  'inventario.devolver': (c) => devolverActivo(c, x),
  'compras.listar': (c) => listarOrdenes(c),
  'compras.obtener': (c) => obtenerOrden(c, ID),
  'compras.crear': (c) => crearOrden(c, x),
  'compras.enviar_a_aprobacion': (c) => enviarAAprobacion(c, ID),
  'compras.aprobar': (c) => aprobarOrden(c, ID),
  'compras.rechazar': (c) => rechazarOrden(c, { id: ID, motivo: 'x' }),
  'compras.recibir': (c) => recibirOrden(c, x),
}

let e: EmpresaPrueba
let d: Datos
beforeAll(async () => {
  exigirEntorno('DATABASE_URL', 'PLATFORM_DATABASE_URL')
  e = await crearEmpresaDePrueba('QA matriz')
  d = await cargarDatos(e, 'QM')
})
afterAll(() => cerrarConexiones())

const codigoDe = async (p: Promise<unknown>): Promise<string> => {
  try {
    await p
    return 'OK'
  } catch (err) {
    return (err as { codigo?: string }).codigo ?? `OTRO:${String(err)}`
  }
}

describe('cobertura: no queda ningún servicio sin probar', () => {
  it('la tabla de esta prueba tiene todos los servicios que la aplicación registró (si alguien agrega uno, esta prueba avisa)', () => {
    const registrados = SERVICIOS_DEFINIDOS.map((s) => s.nombre)
    expect(registrados.length).toBeGreaterThanOrEqual(37)
    expect(registrados.filter((n) => !(n in SERVICIOS)), 'servicios nuevos sin prueba de permisos').toEqual([])
    expect(Object.keys(SERVICIOS).filter((n) => !registrados.includes(n)), 'la tabla nombra servicios que ya no existen').toEqual([])
  })

  it('todos los permisos que exigen los servicios existen en el catálogo', () => {
    for (const s of SERVICIOS_DEFINIDOS) expect(TODOS_LOS_PERMISOS, s.nombre).toContain(s.permiso)
  })
})

describe('cada servicio exige SU permiso exacto', () => {
  const casos = SERVICIOS_DEFINIDOS.map((s) => [s.nombre, s.permiso as string] as const)

  it.each(casos)('%s · con todos los permisos menos «%s» → SIN_PERMISO', async (nombre, permiso) => {
    const ctx = conPermisos(e, 'admin', TODOS_LOS_PERMISOS.filter((p) => p !== permiso))
    expect(await codigoDe(SERVICIOS[nombre]!(ctx))).toBe('SIN_PERMISO')
  })

  it.each(casos)('%s · con SOLO «%s» → no se le niega el permiso', async (nombre, permiso) => {
    const ctx = conPermisos(e, 'admin', [permiso])
    expect(await codigoDe(SERVICIOS[nombre]!(ctx))).not.toBe('SIN_PERMISO')
  })

  it.each(casos)('%s · sin ningún permiso → SIN_PERMISO', async (nombre) => {
    expect(await codigoDe(SERVICIOS[nombre]!(conPermisos(e, 'consulta', [])))).toBe('SIN_PERMISO')
  })
})

describe('contextos vacíos o manipulados no entran a ningún servicio', () => {
  const nombres = Object.keys(SERVICIOS)
  it.each([
    ['sin empresa', (c: Contexto) => ({ ...c, empresaId: '' })],
    ['sin usuario', (c: Contexto) => ({ ...c, usuarioId: '' })],
    ['sin permisos (indefinido)', (c: Contexto) => ({ ...c, permisos: undefined as never })],
    ['nulo', () => null as never],
    ['indefinido', () => undefined as never],
  ])('%s → SIN_ACCESO en los %d servicios', async (_n, deformar) => {
    const base = conPermisos(e, 'admin', TODOS_LOS_PERMISOS)
    for (const n of nombres) expect(await codigoDe(SERVICIOS[n]!(deformar(base))), n).toMatch(/^(SIN_ACCESO|SIN_PERMISO)$/)
  })

  it('permisos inventados en el contexto (que no están en el catálogo) no abren nada nuevo', async () => {
    const ctx = conPermisos(e, 'consulta', ['todo', '*', 'admin', 'roles.*', 'ordenes_compra.aprobar '])
    for (const n of nombres) expect(await codigoDe(SERVICIOS[n]!(ctx)), n).toBe('SIN_PERMISO')
  })
})

describe('por rol: lo que cada rol de ejemplo NO puede hacer aunque llame al servidor directamente', () => {
  const nombresPorPermiso = (permiso: string) => SERVICIOS_DEFINIDOS.filter((s) => s.permiso === permiso).map((s) => s.nombre)
  const prohibidosPara = (rol: 'consulta' | 'tecnico' | 'jefa') => {
    const ctx = contextoDe(e, rol)
    return SERVICIOS_DEFINIDOS.filter((s) => !ctx.permisos.has(s.permiso as string)).map((s) => s.nombre)
  }

  it('Consulta: no puede ESCRIBIR nada (ningún servicio de crear, editar, registrar, asignar, aprobar, recibir, invitar...)', async () => {
    const ctx = contextoDe(e, 'consulta')
    const escribe = SERVICIOS_DEFINIDOS.filter((s) => !/\.(listar|obtener|historial|listar_existencias)$/.test(s.nombre))
    expect(escribe.length).toBeGreaterThan(20)
    for (const s of escribe) expect(await codigoDe(SERVICIOS[s.nombre]!(ctx)), s.nombre).toBe('SIN_PERMISO')
  })

  it('Consulta: no ve usuarios, roles ni auditoría (solo catálogos, SKU, inventario y compras en lectura)', async () => {
    const ctx = contextoDe(e, 'consulta')
    for (const n of ['usuarios.listar', 'roles.listar', 'auditoria.listar']) expect(await codigoDe(SERVICIOS[n]!(ctx)), n).toBe('SIN_PERMISO')
    for (const n of ['skus.listar', 'inventario.listar', 'compras.listar', 'catalogos.personas.listar']) expect(await codigoDe(SERVICIOS[n]!(ctx)), n).not.toBe('SIN_PERMISO')
  })

  it('Técnico: no administra usuarios, roles, categorías ni auditoría, y no aprueba ni rechaza compras', async () => {
    const ctx = contextoDe(e, 'tecnico')
    for (const n of ['usuarios.invitar', 'usuarios.cambiar_rol', 'usuarios.suspender', 'usuarios.reactivar', 'roles.crear', 'roles.editar', 'categorias.crear', 'categorias.agregar_campo', 'auditoria.listar', 'compras.aprobar', 'compras.rechazar', 'usuarios.listar', 'roles.listar']) {
      expect(await codigoDe(SERVICIOS[n]!(ctx)), n).toBe('SIN_PERMISO')
    }
  })

  it('Jefatura TI: aprueba y rechaza, pero no prepara órdenes, no recibe, no registra ni asigna equipos', async () => {
    const ctx = contextoDe(e, 'jefa')
    for (const n of ['compras.crear', 'compras.enviar_a_aprobacion', 'compras.recibir', 'inventario.registrar', 'inventario.asignar', 'inventario.devolver', 'skus.crear', 'catalogos.ubicaciones.crear', 'roles.crear', 'usuarios.invitar']) {
      expect(await codigoDe(SERVICIOS[n]!(ctx)), n).toBe('SIN_PERMISO')
    }
    for (const n of ['compras.aprobar', 'compras.rechazar']) expect(await codigoDe(SERVICIOS[n]!(ctx)), n).not.toBe('SIN_PERMISO')
  })

  it('el rol Administrador de ejemplo tiene todos los permisos del catálogo y ningún servicio le queda cerrado', async () => {
    const ctx = contextoDe(e, 'admin')
    expect([...ctx.permisos].sort()).toEqual([...TODOS_LOS_PERMISOS].sort())
    expect(nombresPorPermiso('auditoria.ver')).toContain('auditoria.listar')
    expect(prohibidosPara('consulta').length).toBeGreaterThan(20)
    expect(prohibidosPara('tecnico').length).toBeGreaterThan(8)
    expect(prohibidosPara('jefa').length).toBeGreaterThan(15)
  })
})

describe('el permiso se comprueba ANTES de tocar datos: un rechazo no deja rastro', () => {
  it('ninguna llamada sin permiso cambió nada en la empresa (misma cantidad de filas, auditoría incluida)', async () => {
    const { huella } = await import('../apoyo/servicios')
    const antes = await huella(e.id)
    const ctx = conPermisos(e, 'consulta', [])
    const escritura = [
      () => registrarActivos(ctx, { skuId: d.skuSerie.id, ubicacionId: d.ubicacionA, series: ['QA-SIN-PERMISO'] }),
      () => crearSku(ctx, { categoriaId: d.categoriaId, nombre: 'Intruso', control: 'serie', valores: {} }),
      () => crearOrden(ctx, { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 1, precioUnitario: 1 }] }),
      () => crearRol(ctx, { nombre: 'Intruso', permisos: ['skus.ver'] }),
      () => crearUbicacion(ctx, { nombre: 'Intrusa' }),
      () => invitarUsuario(ctx, { correo: 'intruso@prueba.local', nombre: 'Intruso', rolId: e.roles.consulta! }),
    ]
    for (const f of escritura) expect(await codigoDe(f())).toBe('SIN_PERMISO')
    expect(await huella(e.id)).toEqual(antes)
  })
})
