// QA · Compras de punta a punta contra la base real: separación de funciones, estados, recepción parcial y total,
// recibir de más, recepciones simultáneas, series repetidas. Empresa de prueba nueva; solo datos inventados.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones } from '../../src/nucleo/aislamiento'
import { listarAuditoria } from '../../src/nucleo/auditoria'
import { aprobarOrden, crearOrden, enviarAAprobacion, obtenerOrden, rechazarOrden, recibirOrden } from '../../src/modulos/compras'
import { listarActivos, listarExistencias } from '../../src/modulos/inventario'
import { exigirEntorno } from '../apoyo/base'
import { cargarDatos, contextoDe, crearEmpresaDePrueba, type Datos, type EmpresaPrueba } from '../apoyo/servicios'

let e: EmpresaPrueba
let d: Datos
const tecnico = () => contextoDe(e, 'tecnico') // prepara y recibe
const admin = () => contextoDe(e, 'admin')
const jefa = () => contextoDe(e, 'jefa') // aprueba

const codigo = async (p: Promise<unknown>) => {
  try {
    await p
    return 'OK'
  } catch (err) {
    return (err as { codigo?: string }).codigo ?? String(err)
  }
}
const series = (prefijo: string, n: number) => Array.from({ length: n }, (_, i) => `${prefijo}-${String(i + 1).padStart(3, '0')}`)

async function ordenAprobada(cantidadSerie = 10, cantidadInsumo?: number) {
  const lineas = [{ skuId: d.skuSerie.id, cantidad: cantidadSerie, precioUnitario: 100 }]
  if (cantidadInsumo) lineas.push({ skuId: d.skuCantidad.id, cantidad: cantidadInsumo, precioUnitario: 5 })
  const o = await crearOrden(tecnico(), { proveedorId: d.proveedor, lineas })
  await enviarAAprobacion(tecnico(), o.id)
  return aprobarOrden(jefa(), o.id)
}

beforeAll(async () => {
  exigirEntorno('DATABASE_URL', 'PLATFORM_DATABASE_URL')
  e = await crearEmpresaDePrueba('QA compras')
  d = await cargarDatos(e, 'QC')
})
afterAll(() => cerrarConexiones())

describe('separación de funciones al aprobar (guion paso 9)', () => {
  it('quien prepara la orden NO la aprueba, ni siquiera siendo Administrador; otra persona sí', async () => {
    const o = await crearOrden(admin(), { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 2, precioUnitario: 10 }] })
    await enviarAAprobacion(admin(), o.id)
    expect(await codigo(aprobarOrden(admin(), o.id))).toBe('SEPARACION_FUNCIONES')
    expect((await obtenerOrden(admin(), o.id)).estado).toBe('por_aprobar')
    expect((await obtenerOrden(admin(), o.id)).aprobaciones).toHaveLength(0)
    const aprobada = await aprobarOrden(jefa(), o.id)
    expect(aprobada.estado).toBe('aprobada')
    expect(aprobada.aprobaciones).toHaveLength(1)
  })

  it('el intento de autoaprobación no deja aprobación ni auditoría de aprobación', async () => {
    const o = await crearOrden(admin(), { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 1, precioUnitario: 10 }] })
    await enviarAAprobacion(admin(), o.id)
    await codigo(aprobarOrden(admin(), o.id))
    const aud = await listarAuditoria(admin(), { entidad: 'orden_compra' })
    expect(aud.filter((a) => a.accion === 'orden_compra.aprobar' && a.entidadId === o.id)).toHaveLength(0)
  })

  it('la base lo impide aunque el servicio se saltara: un aprobador igual al preparador es rechazado por el disparador', async () => {
    const { conEmpresa } = await import('../../src/nucleo/aislamiento')
    const o = await crearOrden(admin(), { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 1, precioUnitario: 10 }] })
    await enviarAAprobacion(admin(), o.id)
    const err = await conEmpresa(e.id, (tx) =>
      tx.consultar(`INSERT INTO orden_aprobacion (empresa_id, orden_id, aprobador_membresia_id, decision) VALUES ($1,$2,$3,'aprobada')`, [e.id, o.id, admin().membresiaId]),
    ).catch((x) => x)
    expect(err, 'la base aceptó la autoaprobación').toBeInstanceOf(Error)
  })
})

describe('estados de la orden', () => {
  it('no se aprueba un borrador, ni dos veces, ni una rechazada; no se envía dos veces', async () => {
    const borrador = await crearOrden(tecnico(), { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 1, precioUnitario: 1 }] })
    expect(await codigo(aprobarOrden(jefa(), borrador.id))).toBe('CONFLICTO')
    expect(await codigo(rechazarOrden(jefa(), { id: borrador.id, motivo: 'no' }))).toBe('CONFLICTO')
    await enviarAAprobacion(tecnico(), borrador.id)
    expect(await codigo(enviarAAprobacion(tecnico(), borrador.id))).toBe('CONFLICTO')
    await aprobarOrden(jefa(), borrador.id)
    expect(await codigo(aprobarOrden(jefa(), borrador.id))).toBe('CONFLICTO')
    expect(await codigo(rechazarOrden(jefa(), { id: borrador.id, motivo: 'tarde' }))).toBe('CONFLICTO')

    const otra = await crearOrden(tecnico(), { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 1, precioUnitario: 1 }] })
    await enviarAAprobacion(tecnico(), otra.id)
    await rechazarOrden(jefa(), { id: otra.id, motivo: 'Precio fuera de presupuesto' })
    expect(await codigo(aprobarOrden(jefa(), otra.id))).toBe('CONFLICTO')
    expect(await codigo(recibirOrden(tecnico(), { ordenId: otra.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: otra.lineas[0]!.id, cantidad: 1, series: ['X-1'] }] }))).toBe('CONFLICTO')
  })

  it('rechazar exige motivo (vacío, solo espacios o enorme se rechazan)', async () => {
    const o = await crearOrden(tecnico(), { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 1, precioUnitario: 1 }] })
    await enviarAAprobacion(tecnico(), o.id)
    for (const motivo of ['', '   ', 'x'.repeat(501)]) expect(await codigo(rechazarOrden(jefa(), { id: o.id, motivo }))).toBe('VALIDACION')
    expect((await obtenerOrden(jefa(), o.id)).estado).toBe('por_aprobar')
  })

  it('no se recibe una orden en borrador ni por aprobar', async () => {
    const o = await crearOrden(tecnico(), { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 1, precioUnitario: 1 }] })
    const entrada = { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: o.lineas[0]!.id, cantidad: 1, series: ['Q-1'] }] }
    expect(await codigo(recibirOrden(tecnico(), entrada))).toBe('CONFLICTO')
    await enviarAAprobacion(tecnico(), o.id)
    expect(await codigo(recibirOrden(tecnico(), entrada))).toBe('CONFLICTO')
  })

  it('datos inválidos al crear: sin líneas, cantidad 0, negativa, decimal, NaN, precio negativo, SKU repetido', async () => {
    const lin = (cantidad: number, precioUnitario = 1) => [{ skuId: d.skuSerie.id, cantidad, precioUnitario }]
    for (const lineas of [[], lin(0), lin(-1), lin(1.5), lin(Number.NaN), lin(1, -5), lin(1, Number.POSITIVE_INFINITY), [...lin(1), ...lin(2)], lin(2_000_000)]) {
      expect(await codigo(crearOrden(tecnico(), { proveedorId: d.proveedor, lineas })), JSON.stringify(lineas)).toBe('VALIDACION')
    }
    expect(await codigo(crearOrden(tecnico(), { proveedorId: 'no-es-id', lineas: lin(1) }))).toBe('VALIDACION')
  })
})

describe('recepción parcial y luego total (CA-033)', () => {
  it('10 pedidas: se reciben 4 con 4 series (orden «recibida en parte»), luego las 6 restantes (orden «recibida»); nacen 10 activos', async () => {
    const o = await ordenAprobada(10)
    const linea = o.lineas[0]!.id
    const r1 = await recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: linea, cantidad: 4, series: series('PAR', 4) }] })
    expect(r1).toMatchObject({ activosCreados: 4, estadoOrden: 'recibida_parcial' })
    const medio = await obtenerOrden(tecnico(), o.id)
    expect(medio.lineas[0]).toMatchObject({ cantidadRecibida: 4, pendiente: 6 })
    expect(medio.recepciones).toHaveLength(1)

    const r2 = await recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionB, lineas: [{ lineaId: linea, cantidad: 6, series: series('PAR', 10).slice(4) }] })
    expect(r2).toMatchObject({ activosCreados: 6, estadoOrden: 'recibida' })
    const fin = await obtenerOrden(tecnico(), o.id)
    expect(fin.estado).toBe('recibida')
    expect(fin.lineas[0]).toMatchObject({ cantidadRecibida: 10, pendiente: 0 })
    expect(fin.recepciones).toHaveLength(2)
    expect(new Set(fin.recepciones.map((r) => r.numero)).size).toBe(2)

    const activos = (await listarActivos(tecnico(), { skuId: d.skuSerie.id })).filter((a) => a.serie.startsWith('PAR-'))
    expect(activos).toHaveLength(10)
    expect(activos.filter((a) => a.ubicacionId === d.ubicacionA)).toHaveLength(4)
    expect(activos.filter((a) => a.ubicacionId === d.ubicacionB)).toHaveLength(6)

    // Una orden cerrada ya no recibe nada más.
    expect(await codigo(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: linea, cantidad: 1, series: ['PAR-999'] }] }))).toBe('CONFLICTO')
  })

  it('línea por cantidad: suma al saldo de la ubicación, en dos entregas', async () => {
    const antes = (await listarExistencias(tecnico())).find((x) => x.skuId === d.skuCantidad.id && x.ubicacionId === d.ubicacionA)?.cantidad ?? 0
    const o = await ordenAprobada(1, 30)
    const lin = o.lineas.find((l) => l.skuId === d.skuCantidad.id)!
    await recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: lin.id, cantidad: 12 }] })
    await recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: lin.id, cantidad: 18 }] })
    const despues = (await listarExistencias(tecnico())).find((x) => x.skuId === d.skuCantidad.id && x.ubicacionId === d.ubicacionA)!.cantidad
    expect(despues - antes).toBe(30)
  })
})

describe('recibir más de lo pedido, series mal puestas', () => {
  it('no se puede recibir más de lo pedido, ni en una vez ni acumulado; no queda ningún activo a medias', async () => {
    const o = await ordenAprobada(5)
    const linea = o.lineas[0]!.id
    const antes = (await listarActivos(tecnico(), { skuId: d.skuSerie.id })).length
    expect(await codigo(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: linea, cantidad: 6, series: series('EXC', 6) }] }))).toBe('VALIDACION')
    await recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: linea, cantidad: 3, series: series('EXC', 3) }] })
    expect(await codigo(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: linea, cantidad: 3, series: series('EXD', 3) }] }))).toBe('VALIDACION')
    expect((await listarActivos(tecnico(), { skuId: d.skuSerie.id })).length - antes).toBe(3)
    expect((await obtenerOrden(tecnico(), o.id)).lineas[0]).toMatchObject({ cantidadRecibida: 3, pendiente: 2 })
  })

  it('cantidades raras al recibir: 0 solas, negativa, decimal, texto, línea ajena a la orden', async () => {
    const o = await ordenAprobada(5)
    const otra = await ordenAprobada(5)
    const linea = o.lineas[0]!.id
    for (const l of [{ lineaId: linea, cantidad: -1, series: ['R-1'] }, { lineaId: linea, cantidad: 1.5, series: ['R-1', 'R-2'] }, { lineaId: linea, cantidad: '2' as unknown as number, series: ['R-1', 'R-2'] }, { lineaId: otra.lineas[0]!.id, cantidad: 1, series: ['R-1'] }]) {
      expect(await codigo(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [l] })), JSON.stringify(l)).toBe('VALIDACION')
    }
    expect(await codigo(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: linea, cantidad: 0 }] }))).toBe('VALIDACION')
  })

  it('series: faltan, sobran, vacías, repetidas entre sí o ya registradas en el inventario → se rechaza todo y se dice cuál', async () => {
    const o = await ordenAprobada(4)
    const linea = o.lineas[0]!.id
    const recibir = (s: string[], n = s.length) => recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: linea, cantidad: n, series: s }] })
    expect(await codigo(recibir(['S-1'], 2))).toBe('VALIDACION') // falta una
    expect(await codigo(recibir(['S-1', 'S-2', 'S-3'], 2))).toBe('VALIDACION') // sobra una
    expect(await codigo(recibir(['S-1', ' '], 2))).toBe('VALIDACION') // vacía
    expect(await codigo(recibir(['S-1', 's-1']))).toBe('DUPLICADO') // repetida (mayúsculas)
    await recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: linea, cantidad: 1, series: ['YA-EXISTE'] }] })
    const err = await recibir(['NUEVA-1', 'ya-existe']).catch((x) => x)
    expect(err.codigo).toBe('DUPLICADO')
    expect(err.mensaje).toMatch(/ya-existe/i)
    expect((await listarActivos(tecnico(), { texto: 'NUEVA-1' })).length, 'quedó a medias un activo del lote rechazado').toBe(0)
    expect((await obtenerOrden(tecnico(), o.id)).lineas[0]!.cantidadRecibida).toBe(1)
  })

  it('un SKU por cantidad no admite series en la recepción', async () => {
    const o = await ordenAprobada(1, 5)
    const lin = o.lineas.find((l) => l.skuId === d.skuCantidad.id)!
    expect(await codigo(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: lin.id, cantidad: 2, series: ['SN-1', 'SN-2'] }] }))).toBe('VALIDACION')
  })
})

describe('simultaneidad (dos personas a la vez)', () => {
  it('dos recepciones de 6 sobre una línea de 10 al mismo tiempo: gana una, la otra se rechaza, nunca se pasa de 10', async () => {
    const o = await ordenAprobada(10)
    const linea = o.lineas[0]!.id
    const intento = (pref: string) => recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: linea, cantidad: 6, series: series(pref, 6) }] })
    const resultados = await Promise.allSettled([intento('SIM-A'), intento('SIM-B')])
    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    const final = await obtenerOrden(tecnico(), o.id)
    expect(final.lineas[0]!.cantidadRecibida).toBe(6)
    const creados = (await listarActivos(tecnico(), { skuId: d.skuSerie.id })).filter((a) => /^SIM-[AB]-/.test(a.serie))
    expect(creados).toHaveLength(6)
  })

  it('dos aprobaciones simultáneas de la misma orden: una sola queda registrada', async () => {
    const o = await crearOrden(tecnico(), { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 1, precioUnitario: 1 }] })
    await enviarAAprobacion(tecnico(), o.id)
    const r = await Promise.allSettled([aprobarOrden(jefa(), o.id), aprobarOrden(admin(), o.id)])
    expect(r.filter((x) => x.status === 'fulfilled')).toHaveLength(1)
    expect((await obtenerOrden(jefa(), o.id)).aprobaciones).toHaveLength(1)
  })

  it('la misma serie registrada a la vez en dos recepciones distintas: una sola gana', async () => {
    const a = await ordenAprobada(1)
    const b = await ordenAprobada(1)
    const intento = (o: typeof a) => recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: d.ubicacionA, lineas: [{ lineaId: o.lineas[0]!.id, cantidad: 1, series: ['MISMA-SERIE'] }] })
    const r = await Promise.allSettled([intento(a), intento(b)])
    expect(r.filter((x) => x.status === 'fulfilled')).toHaveLength(1)
    expect((await listarActivos(tecnico(), { texto: 'MISMA-SERIE' })).filter((x) => x.serie === 'MISMA-SERIE')).toHaveLength(1)
  })
})

describe('numeración de documentos', () => {
  it('20 órdenes creadas a la vez por dos personas tienen 20 números OC distintos', async () => {
    const crear = (c: ReturnType<typeof tecnico>) => crearOrden(c, { proveedorId: d.proveedor, lineas: [{ skuId: d.skuSerie.id, cantidad: 1, precioUnitario: 1 }] })
    const ordenes = await Promise.all(Array.from({ length: 20 }, (_, i) => crear(i % 2 ? tecnico() : admin())))
    expect(new Set(ordenes.map((o) => o.numero)).size).toBe(20)
    for (const o of ordenes) expect(o.numero).toMatch(/^OC-\d{6}$/)
  })
})
