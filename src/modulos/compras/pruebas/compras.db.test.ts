import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones, conEmpresa } from '../../../nucleo/aislamiento'
import { listarAuditoria } from '../../../nucleo/auditoria'
import {
  contextoDe, contextoSinPermisos, crearEmpresaDePrueba, hayBaseDeDatos, type EmpresaPrueba,
} from '../../../nucleo/permisos/pruebas/apoyo'
import { historialActivo, listarActivos, listarExistencias } from '../../inventario'
import {
  aprobarOrden, crearOrden, enviarAAprobacion, listarOrdenes, obtenerOrden, rechazarOrden, recibirOrden,
} from '../index'

type Base = { skuSerie: string; skuCantidad: string; skuViejo: string; proveedor: string; proveedorInactivo: string; ubic: string; ubicInactiva: string }

async function prepararBase(e: EmpresaPrueba): Promise<Base> {
  return conEmpresa(e.id, async (tx) => {
    const un = async <T>(sql: string, v: unknown[]) => ((await tx.consultar<T>(sql, v))[0] as T)
    const cat = await un<{ id: string }>(`INSERT INTO categoria (empresa_id, nombre, prefijo) VALUES ($1, 'Equipos', 'EQ') RETURNING id`, [e.id])
    const sku = (codigo: string, control: string, activo = true) =>
      un<{ id: string }>(`INSERT INTO sku (empresa_id, categoria_id, codigo, nombre, control, activo) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [e.id, cat.id, codigo, `Artículo ${codigo}`, control, activo])
    const prov = (n: string, activo = true) => un<{ id: string }>(`INSERT INTO proveedor (empresa_id, nombre, activo) VALUES ($1,$2,$3) RETURNING id`, [e.id, n, activo])
    const ub = (n: string, activo = true) => un<{ id: string }>(`INSERT INTO ubicacion (empresa_id, nombre, activo) VALUES ($1,$2,$3) RETURNING id`, [e.id, n, activo])
    return {
      skuSerie: (await sku('LAP-0001', 'serie')).id, skuCantidad: (await sku('MON-0001', 'cantidad')).id, skuViejo: (await sku('VIEJO-1', 'serie', false)).id,
      proveedor: (await prov('Proveedor Inventado')).id, proveedorInactivo: (await prov('Proveedor Cerrado', false)).id,
      ubic: (await ub('Almacén')).id, ubicInactiva: (await ub('Cerrada', false)).id,
    }
  })
}

describe.skipIf(!hayBaseDeDatos)('compras (con base real)', () => {
  let alfa: EmpresaPrueba
  let beta: EmpresaPrueba
  let a: Base
  let b: Base
  beforeAll(async () => {
    alfa = await crearEmpresaDePrueba('Alfa')
    beta = await crearEmpresaDePrueba('Beta')
    a = await prepararBase(alfa)
    b = await prepararBase(beta)
  })
  afterAll(async () => { await cerrarConexiones() })

  const tecnico = () => contextoDe(alfa, 'tecnico') // prepara y recibe
  const jefa = () => contextoDe(alfa, 'jefa') // aprueba
  const admin = () => contextoDe(alfa, 'admin') // tiene todo, incluida la aprobación

  const nuevaOrden = (lineas = [{ skuId: a.skuSerie, cantidad: 3, precioUnitario: 2500 }, { skuId: a.skuCantidad, cantidad: 10, precioUnitario: 400.5 }]) =>
    crearOrden(tecnico(), { proveedorId: a.proveedor, lineas })
  const aprobada = async () => {
    const o = await nuevaOrden()
    await enviarAAprobacion(tecnico(), o.id)
    return aprobarOrden(jefa(), o.id)
  }

  describe('crear y enviar', () => {
    it('crea la orden en borrador con número correlativo, líneas y total; deja auditoría', async () => {
      const o = await nuevaOrden()
      expect(o).toMatchObject({ estado: 'borrador', moneda: 'PEN', proveedorNombre: 'Proveedor Inventado', preparadaPorNombre: 'Usuario tecnico' })
      expect(o.numero).toMatch(/^OC-\d{6}$/)
      expect(o.total).toBeCloseTo(3 * 2500 + 10 * 400.5)
      expect(o.lineas.map((l) => [l.skuCodigo, l.cantidad, l.pendiente])).toEqual([['LAP-0001', 3, 3], ['MON-0001', 10, 10]])
      const o2 = await nuevaOrden([{ skuId: a.skuSerie, cantidad: 1, precioUnitario: 1 }])
      expect(Number(o2.numero.slice(3))).toBe(Number(o.numero.slice(3)) + 1)
      const aud = await listarAuditoria(admin(), { entidad: 'orden_compra' })
      expect(aud.find((x) => x.accion === 'orden_compra.crear' && x.entidadId === o.id)).toBeDefined()
      expect((await listarOrdenes(tecnico())).length).toBeGreaterThanOrEqual(2)
    })

    it('VALIDACION: sin líneas, cantidad o precio inválidos, SKU repetido, proveedor o SKU inactivos', async () => {
      const base = { proveedorId: a.proveedor }
      await expect(crearOrden(tecnico(), { ...base, lineas: [] })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { lineas: expect.any(String) } })
      await expect(crearOrden(tecnico(), { ...base, lineas: [{ skuId: a.skuSerie, cantidad: 0, precioUnitario: 1 }] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(crearOrden(tecnico(), { ...base, lineas: [{ skuId: a.skuSerie, cantidad: 1.5, precioUnitario: 1 }] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(crearOrden(tecnico(), { ...base, lineas: [{ skuId: a.skuSerie, cantidad: 1, precioUnitario: -1 }] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(crearOrden(tecnico(), { ...base, lineas: [{ skuId: a.skuSerie, cantidad: 1, precioUnitario: 1 }, { skuId: a.skuSerie, cantidad: 2, precioUnitario: 1 }] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(crearOrden(tecnico(), { proveedorId: a.proveedorInactivo, lineas: [{ skuId: a.skuSerie, cantidad: 1, precioUnitario: 1 }] })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { proveedorId: expect.any(String) } })
      await expect(crearOrden(tecnico(), { ...base, lineas: [{ skuId: a.skuViejo, cantidad: 1, precioUnitario: 1 }] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(crearOrden(tecnico(), { proveedorId: 'xx', lineas: [{ skuId: a.skuSerie, cantidad: 1, precioUnitario: 1 }] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
    })

    it('enviar a aprobación: solo desde borrador', async () => {
      const o = await nuevaOrden()
      expect(await enviarAAprobacion(tecnico(), o.id)).toMatchObject({ estado: 'por_aprobar' })
      await expect(enviarAAprobacion(tecnico(), o.id)).rejects.toMatchObject({ codigo: 'CONFLICTO' })
    })
  })

  describe('aprobar y rechazar (separación de funciones)', () => {
    it('SEPARACION_FUNCIONES: quien preparó la orden no la aprueba, aunque tenga el permiso (Administrador)', async () => {
      const o = await crearOrden(admin(), { proveedorId: a.proveedor, lineas: [{ skuId: a.skuSerie, cantidad: 1, precioUnitario: 10 }] })
      await enviarAAprobacion(admin(), o.id)
      await expect(aprobarOrden(admin(), o.id)).rejects.toMatchObject({ codigo: 'SEPARACION_FUNCIONES', mensaje: expect.stringContaining('no puede aprobarla') })
      expect((await obtenerOrden(admin(), o.id)).estado).toBe('por_aprobar')
      expect((await obtenerOrden(admin(), o.id)).aprobaciones).toEqual([])
      // Otra persona sí.
      expect(await aprobarOrden(jefa(), o.id)).toMatchObject({ estado: 'aprobada', aprobaciones: [{ decision: 'aprobada', aprobadorNombre: 'Usuario jefa' }] })
    })

    it('la base también lo impide: aunque se salte el servicio, no se inserta la autoaprobación', async () => {
      const o = await nuevaOrden()
      await enviarAAprobacion(tecnico(), o.id)
      const yo = tecnico()
      await expect(conEmpresa(alfa.id, (tx) => tx.ejecutar(
        `INSERT INTO orden_aprobacion (empresa_id, orden_id, aprobador_membresia_id, decision) VALUES ($1,$2,$3,'aprobada')`,
        [alfa.id, o.id, yo.membresiaId]))).rejects.toMatchObject({ message: expect.stringContaining('SEPARACION_FUNCIONES') })
      await expect(conEmpresa(alfa.id, (tx) => tx.ejecutar(
        `UPDATE orden_compra SET estado = 'aprobada' WHERE empresa_id = $1 AND id = $2`, [alfa.id, o.id]))).rejects.toMatchObject({ message: expect.stringContaining('SEPARACION_FUNCIONES') })
      expect((await obtenerOrden(tecnico(), o.id)).estado).toBe('por_aprobar')
    })

    it('solo se aprueba lo que está por aprobar', async () => {
      const borrador = await nuevaOrden()
      await expect(aprobarOrden(jefa(), borrador.id)).rejects.toMatchObject({ codigo: 'CONFLICTO' })
      const ya = await aprobada()
      await expect(aprobarOrden(jefa(), ya.id)).rejects.toMatchObject({ codigo: 'CONFLICTO' })
    })

    it('rechazar exige motivo, lo guarda y deja la orden rechazada', async () => {
      const o = await nuevaOrden()
      await enviarAAprobacion(tecnico(), o.id)
      await expect(rechazarOrden(jefa(), { id: o.id, motivo: '  ' })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { motivo: expect.any(String) } })
      const r = await rechazarOrden(jefa(), { id: o.id, motivo: 'Precio fuera de presupuesto' })
      expect(r).toMatchObject({ estado: 'rechazada', aprobaciones: [{ decision: 'rechazada', motivo: 'Precio fuera de presupuesto' }] })
      const aud = await listarAuditoria(admin(), { entidad: 'orden_compra' })
      expect(aud.find((x) => x.accion === 'orden_compra.rechazar' && x.entidadId === o.id)?.motivo).toBe('Precio fuera de presupuesto')
      await expect(aprobarOrden(jefa(), o.id)).rejects.toMatchObject({ codigo: 'CONFLICTO' })
      await expect(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: a.ubic, lineas: [{ lineaId: o.lineas[0]!.id, cantidad: 1, series: ['R1'] }] })).rejects.toMatchObject({ codigo: 'CONFLICTO' })
    })
  })

  describe('recibir (parcial, sin pasar de lo pedido, crea los activos)', () => {
    it('recepción parcial: nacen los activos con su serie y el saldo; luego se completa y la orden queda recibida', async () => {
      const o = await aprobada()
      const [lSerie, lCant] = [o.lineas.find((l) => l.skuCodigo === 'LAP-0001')!, o.lineas.find((l) => l.skuCodigo === 'MON-0001')!]
      const r1 = await recibirOrden(tecnico(), {
        ordenId: o.id, ubicacionId: a.ubic,
        lineas: [{ lineaId: lSerie.id, cantidad: 2, series: ['OC-A1', 'OC-A2'] }, { lineaId: lCant.id, cantidad: 4 }],
      })
      expect(r1).toMatchObject({ activosCreados: 6, estadoOrden: 'recibida_parcial' })
      expect(r1.numero).toMatch(/^RCP-\d{6}$/)
      const activos = await listarActivos(tecnico(), { texto: 'OC-A' })
      expect(activos.map((x) => [x.serie, x.estado, x.ubicacionNombre])).toEqual([['OC-A1', 'en_stock', 'Almacén'], ['OC-A2', 'en_stock', 'Almacén']])
      const h = await historialActivo(tecnico(), activos[0]!.id)
      expect(h.map((x) => x.tipo)).toEqual(['registro'])
      expect((await listarExistencias(tecnico())).find((x) => x.skuCodigo === 'MON-0001')?.cantidad).toBe(4)

      const parcial = await obtenerOrden(tecnico(), o.id)
      expect(parcial.estado).toBe('recibida_parcial')
      expect(parcial.lineas.map((l) => [l.skuCodigo, l.cantidadRecibida, l.pendiente])).toEqual([['LAP-0001', 2, 1], ['MON-0001', 4, 6]])
      expect(parcial.recepciones).toHaveLength(1)

      const r2 = await recibirOrden(tecnico(), {
        ordenId: o.id, ubicacionId: a.ubic,
        lineas: [{ lineaId: lSerie.id, cantidad: 1, series: ['OC-A3'] }, { lineaId: lCant.id, cantidad: 6 }],
      })
      expect(r2).toMatchObject({ activosCreados: 7, estadoOrden: 'recibida' })
      const fin = await obtenerOrden(tecnico(), o.id)
      expect(fin.estado).toBe('recibida')
      expect(fin.recepciones.map((r) => r.numero)).toHaveLength(2)
      expect(fin.lineas.every((l) => l.pendiente === 0)).toBe(true)
      await expect(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: a.ubic, lineas: [{ lineaId: lCant.id, cantidad: 1 }] })).rejects.toMatchObject({ codigo: 'CONFLICTO' })
      expect((await listarExistencias(tecnico())).find((x) => x.skuCodigo === 'MON-0001')?.cantidad).toBe(10)
    })

    it('no se recibe más de lo pedido (el mensaje dice cuánto queda) y no se guarda nada', async () => {
      const o = await aprobada()
      const lCant = o.lineas.find((l) => l.skuCodigo === 'MON-0001')!
      const antes = (await listarExistencias(tecnico())).find((x) => x.skuCodigo === 'MON-0001')?.cantidad ?? 0
      await expect(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: a.ubic, lineas: [{ lineaId: lCant.id, cantidad: 11 }] }))
        .rejects.toMatchObject({ codigo: 'VALIDACION', mensaje: expect.stringContaining('quedan 10') })
      expect((await listarExistencias(tecnico())).find((x) => x.skuCodigo === 'MON-0001')?.cantidad ?? 0).toBe(antes)
      expect((await obtenerOrden(tecnico(), o.id)).estado).toBe('aprobada')
    })

    it('la base impide pasarse de lo pedido aunque se salte el servicio', async () => {
      const o = await aprobada()
      const l = o.lineas.find((x) => x.skuCodigo === 'MON-0001')!
      await expect(conEmpresa(alfa.id, async (tx) => {
        const r = await tx.consultar<{ id: string }>(`INSERT INTO recepcion (empresa_id, numero, orden_id, ubicacion_id, recibida_por_membresia_id) VALUES ($1,'RCP-999002',$2,$3,$4) RETURNING id`,
          [alfa.id, o.id, a.ubic, tecnico().membresiaId])
        await tx.ejecutar(`INSERT INTO recepcion_linea (empresa_id, recepcion_id, orden_linea_id, cantidad) VALUES ($1,$2,$3,$4)`, [alfa.id, (r[0] as { id: string }).id, l.id, 11])
      })).rejects.toBeDefined()
    })

    it('series: deben ser tantas como la cantidad; si una ya existe se dice cuál y no se guarda nada', async () => {
      const o = await aprobada()
      const lSerie = o.lineas.find((l) => l.skuCodigo === 'LAP-0001')!
      await expect(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: a.ubic, lineas: [{ lineaId: lSerie.id, cantidad: 2, series: ['S-ONLY'] }] }))
        .rejects.toMatchObject({ codigo: 'VALIDACION', mensaje: expect.stringContaining('escriba 2 series') })
      await expect(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: a.ubic, lineas: [{ lineaId: lSerie.id, cantidad: 1 }] }))
        .rejects.toMatchObject({ codigo: 'VALIDACION' })
      await recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: a.ubic, lineas: [{ lineaId: lSerie.id, cantidad: 1, series: ['DUP-1'] }] })
      const o2 = await aprobada()
      const l2 = o2.lineas.find((l) => l.skuCodigo === 'LAP-0001')!
      await expect(recibirOrden(tecnico(), { ordenId: o2.id, ubicacionId: a.ubic, lineas: [{ lineaId: l2.id, cantidad: 2, series: ['NUEVA-1', 'dup-1'] }] }))
        .rejects.toMatchObject({ codigo: 'DUPLICADO', mensaje: expect.stringContaining('DUP-1') })
      expect(await listarActivos(tecnico(), { texto: 'NUEVA-1' })).toEqual([])
      expect((await obtenerOrden(tecnico(), o2.id)).estado).toBe('aprobada')
      expect((await obtenerOrden(tecnico(), o2.id)).recepciones).toEqual([])
    })

    it('VALIDACION: ubicación inactiva, línea de otra orden, sin cantidades', async () => {
      const o = await aprobada()
      const otra = await aprobada()
      const l = o.lineas[0]!
      await expect(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: a.ubicInactiva, lineas: [{ lineaId: l.id, cantidad: 1, series: ['V1'] }] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: a.ubic, lineas: [{ lineaId: otra.lineas[0]!.id, cantidad: 1, series: ['V2'] }] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: a.ubic, lineas: [] })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { lineas: expect.any(String) } })
      await expect(recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: a.ubic, lineas: [{ lineaId: l.id, cantidad: -1 }] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
    })

    it('dos recepciones a la vez de lo mismo: entre las dos no superan lo pedido', async () => {
      const o = await aprobada()
      const l = o.lineas.find((x) => x.skuCodigo === 'MON-0001')!
      const r = await Promise.allSettled([
        recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: a.ubic, lineas: [{ lineaId: l.id, cantidad: 7 }] }),
        recibirOrden(tecnico(), { ordenId: o.id, ubicacionId: a.ubic, lineas: [{ lineaId: l.id, cantidad: 7 }] }),
      ])
      expect(r.filter((x) => x.status === 'fulfilled')).toHaveLength(1)
      const final = await obtenerOrden(tecnico(), o.id)
      expect(final.lineas.find((x) => x.skuCodigo === 'MON-0001')?.cantidadRecibida).toBe(7)
    })
  })

  describe('aislamiento entre empresas', () => {
    it('no se ven, aprueban ni reciben órdenes de otra empresa; no se compra a proveedores ni SKU ajenos', async () => {
      const ob = await crearOrden(contextoDe(beta, 'tecnico'), { proveedorId: b.proveedor, lineas: [{ skuId: b.skuSerie, cantidad: 1, precioUnitario: 5 }] })
      await enviarAAprobacion(contextoDe(beta, 'tecnico'), ob.id)
      expect((await listarOrdenes(tecnico())).map((x) => x.id)).not.toContain(ob.id)
      await expect(obtenerOrden(tecnico(), ob.id)).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      await expect(aprobarOrden(jefa(), ob.id)).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      await expect(rechazarOrden(jefa(), { id: ob.id, motivo: 'x' })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      await expect(enviarAAprobacion(tecnico(), ob.id)).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      await expect(recibirOrden(tecnico(), { ordenId: ob.id, ubicacionId: a.ubic, lineas: [{ lineaId: ob.lineas[0]!.id, cantidad: 1, series: ['Q1'] }] })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      await expect(crearOrden(tecnico(), { proveedorId: b.proveedor, lineas: [{ skuId: a.skuSerie, cantidad: 1, precioUnitario: 1 }] })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      await expect(crearOrden(tecnico(), { proveedorId: a.proveedor, lineas: [{ skuId: b.skuSerie, cantidad: 1, precioUnitario: 1 }] })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
    })
  })

  describe('permisos en el servidor (SIN_PERMISO)', () => {
    it('cada servicio rechaza a quien no tiene el permiso', async () => {
      const o = await nuevaOrden()
      const nada = contextoSinPermisos(alfa)
      const consulta = contextoDe(alfa, 'consulta') // solo ver
      await expect(listarOrdenes(nada)).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(obtenerOrden(nada, o.id)).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(crearOrden(consulta, { proveedorId: a.proveedor, lineas: [{ skuId: a.skuSerie, cantidad: 1, precioUnitario: 1 }] })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(enviarAAprobacion(consulta, o.id)).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(aprobarOrden(tecnico(), o.id)).rejects.toMatchObject({ codigo: 'SIN_PERMISO' }) // el Técnico prepara pero no aprueba
      await expect(rechazarOrden(tecnico(), { id: o.id, motivo: 'x' })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(recibirOrden(consulta, { ordenId: o.id, ubicacionId: a.ubic, lineas: [{ lineaId: o.lineas[0]!.id, cantidad: 1, series: ['P1'] }] })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(recibirOrden(jefa(), { ordenId: o.id, ubicacionId: a.ubic, lineas: [{ lineaId: o.lineas[0]!.id, cantidad: 1, series: ['P1'] }] })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' }) // la jefa aprueba pero no recibe
      await expect(listarOrdenes(consulta)).resolves.toBeDefined()
    })
  })
})
