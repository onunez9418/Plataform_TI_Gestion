// QA · Defectos y brechas ENCONTRADOS en servicios. Describen lo CORRECTO: fallan mientras el defecto exista.
// Detalle, gravedad y dueño en pruebas/INFORME.md.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { canjearEnlace, obtenerContexto } from '../../src/nucleo/acceso'
import { cerrarConexiones } from '../../src/nucleo/aislamiento'
import { aprobarOrden, crearOrden, enviarAAprobacion, listarOrdenes, obtenerOrden, rechazarOrden, recibirOrden } from '../../src/modulos/compras'
import { listarActivos, registrarActivos } from '../../src/modulos/inventario'
import { crearSku } from '../../src/modulos/skus'
import { invitarUsuario } from '../../src/modulos/usuarios'
import { exigirEntorno } from '../apoyo/base'
import { Navegador, tokenDeEnlace } from '../apoyo/navegadores'
import { cargarDatos, conPermisos, contextoDe, crearEmpresaDePrueba, type Datos, type EmpresaPrueba } from '../apoyo/servicios'

let e: EmpresaPrueba
let otra: EmpresaPrueba
let d: Datos
const codigo = async (p: Promise<unknown>) => {
  try {
    await p
    return 'OK'
  } catch (err) {
    return (err as { codigo?: string }).codigo ?? String(err)
  }
}

beforeAll(async () => {
  exigirEntorno('DATABASE_URL', 'PLATFORM_DATABASE_URL')
  process.env.MODO_LOCAL = '1'
  e = await crearEmpresaDePrueba('QA defectos')
  otra = await crearEmpresaDePrueba('QA otra')
  d = await cargarDatos(e, 'QD')
})
afterAll(() => cerrarConexiones())

describe('DEF-SRV-01 · quien invita a un usuario que YA existe en otra empresa no debe recibir un enlace para entrar como esa persona', () => {
  it('el administrador de la empresa B invita al correo de un usuario de la empresa A: no puede entrar con ese enlace como él', async () => {
    const victima = otra.usuarios.jefa! // pertenece a «otra», no a «e»
    const r = await invitarUsuario(contextoDe(e, 'admin'), { correo: victima.correo, nombre: 'Da igual', rolId: e.roles.consulta! })
    const intruso = new Navegador()
    let entro = false
    if (r.enlaceLocal) {
      try {
        await intruso.usando(() => canjearEnlace(tokenDeEnlace(r.enlaceLocal!)))
        const ctx = await intruso.usando(() => obtenerContexto(otra.slug))
        entro = ctx.usuarioId === victima.usuarioId
      } catch {
        entro = false
      }
    }
    expect(entro, 'el administrador de otra empresa entró a la empresa de la víctima con la identidad de la víctima').toBe(false)
  })
})

describe('DEF-SRV-02 · un servicio que actúa y después falla por falta de permiso de lectura deja el cambio hecho', () => {
  it('con solo «preparar órdenes» (sin «ver órdenes»), crearOrden o se rechaza sin crear nada, o funciona; nunca crea y devuelve error', async () => {
    const ctx = conPermisos(e, 'tecnico', ['ordenes_compra.crear_editar'])
    const antes = (await listarOrdenes(contextoDe(e, 'admin'))).length
    const resultado = await codigo(crearOrden(ctx, { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 1, precioUnitario: 1 }] }))
    const despues = (await listarOrdenes(contextoDe(e, 'admin'))).length
    expect(resultado === 'OK' || despues === antes, `devolvió ${resultado} pero la orden quedó creada (${antes} → ${despues}); al reintentar se duplicaría`).toBe(true)
  })

  it('con solo «aprobar» (sin «ver»), aprobar no debe dejar la orden aprobada y a la vez responder error', async () => {
    const o = await crearOrden(contextoDe(e, 'tecnico'), { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 1, precioUnitario: 1 }] })
    await enviarAAprobacion(contextoDe(e, 'tecnico'), o.id)
    const solo = conPermisos(e, 'jefa', ['ordenes_compra.aprobar'])
    const resultado = await codigo(aprobarOrden(solo, o.id))
    const estado = (await obtenerOrden(contextoDe(e, 'admin'), o.id)).estado
    expect(resultado === 'OK' || estado === 'por_aprobar', `devolvió ${resultado} pero la orden quedó ${estado}`).toBe(true)
  })
})

describe('DEF-SRV-03 · una misma serie en OTRO SKU de la empresa se acepta con un aviso visible que dice dónde está (RF-INV-003, CA-023)', () => {
  it('registrar la serie «COMPARTIDA-1» en un segundo SKU de serie devuelve un aviso', async () => {
    const admin = contextoDe(e, 'admin')
    const otroSku = await crearSku(admin, { categoriaId: d.categoriaId, nombre: 'Otro equipo con serie', control: 'serie', valores: {} })
    await registrarActivos(admin, { skuId: d.skuSerie.id, ubicacionId: d.ubicacionA, series: ['COMPARTIDA-1'] })
    const r = (await registrarActivos(admin, { skuId: otroSku.id, ubicacionId: d.ubicacionA, series: ['COMPARTIDA-1'] })) as Record<string, unknown>
    expect((await listarActivos(admin, { texto: 'COMPARTIDA-1' })).length).toBe(2) // se acepta
    const avisos = (r.avisos ?? r.advertencias ?? r.aviso) as unknown
    expect(avisos, 'la respuesta no trae ningún aviso de que la serie ya existe en otro SKU').toBeTruthy()
    expect(JSON.stringify(avisos)).toContain(d.skuSerie.codigo)
  })
})

describe('DEF-SRV-04 · separación de funciones de compras según el documento funcional (RF-OC-022, 023, 024; CA-012, CA-013)', () => {
  async function ordenPorAprobar(preparador: 'admin' | 'tecnico') {
    const o = await crearOrden(contextoDe(e, preparador), { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 2, precioUnitario: 1 }] })
    await enviarAAprobacion(contextoDe(e, preparador), o.id)
    return o
  }

  it('RF-OC-022: quien preparó la orden tampoco puede RECHAZARLA', async () => {
    const o = await ordenPorAprobar('admin')
    expect(await codigo(rechazarOrden(contextoDe(e, 'admin'), { id: o.id, motivo: 'Me arrepentí' }))).toBe('SEPARACION_FUNCIONES')
  })

  it('RF-OC-023: quien aprobó la orden no puede recibir esa mercadería', async () => {
    const o = await ordenPorAprobar('tecnico')
    const aprobada = await aprobarOrden(contextoDe(e, 'admin'), o.id) // el administrador aprueba
    const r = await codigo(recibirOrden(contextoDe(e, 'admin'), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: aprobada.lineas[0]!.id, cantidad: 1, series: ['AP-REC-1'] }] }))
    expect(r).toBe('SEPARACION_FUNCIONES')
  })

  it('RF-OC-024: quien preparó la orden no puede recibirla', async () => {
    const o = await ordenPorAprobar('tecnico')
    const aprobada = await aprobarOrden(contextoDe(e, 'jefa'), o.id)
    const r = await codigo(recibirOrden(contextoDe(e, 'tecnico'), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: aprobada.lineas[0]!.id, cantidad: 1, series: ['PREP-REC-1'] }] }))
    expect(r).toBe('SEPARACION_FUNCIONES')
  })
})
