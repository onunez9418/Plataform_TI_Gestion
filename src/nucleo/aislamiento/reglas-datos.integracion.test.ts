// Reglas de negocio que viven en la base (A.6.1): serie única, control serie/cantidad, saldo >= 0,
// asignación abierta única, transiciones de estado, separación de funciones y recepción sin pasarse.
// Cada caso corre dentro de una transacción que SIEMPRE se deshace: no deja datos.
//   PRUEBAS_BD=1 DATABASE_URL=<app_empresa> PLATFORM_DATABASE_URL=<app_plataforma> \
//     npx vitest run --config vitest.config.mts src/nucleo/aislamiento/reglas-datos.integracion.test.ts

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones, conEmpresa, conGlobal, type Tx } from './index'

const hayBase = process.env.PRUEBAS_BD === '1' && !!process.env.DATABASE_URL

class Deshacer extends Error {}

describe.skipIf(!hayBase)('reglas de datos en la base (A.6.1)', () => {
  let alfa = ''
  let beta = ''

  beforeAll(async () => {
    const f = await conGlobal((tx) => tx.consultar<{ id: string; slug: string }>("SELECT id, slug FROM empresa WHERE slug IN ('alfa','beta')"))
    alfa = f.find((x) => x.slug === 'alfa')!.id
    beta = f.find((x) => x.slug === 'beta')!.id
  })
  afterAll(() => cerrarConexiones())

  /** Ejecuta `fn` y deshace todo al final. */
  async function enAlfa<T>(fn: (tx: Tx, c: Contexto) => Promise<T>): Promise<T> {
    let resultado!: T
    await conEmpresa(alfa, async (tx) => {
      resultado = await fn(tx, await contexto(tx))
      throw new Deshacer()
    }).catch((e) => {
      if (!(e instanceof Deshacer)) throw e
    })
    return resultado
  }

  type Contexto = { skuSerie: string; skuCant: string; ubic: string; ubic2: string; persona: string; persona2: string; tecnico: string; jefa: string; proveedor: string }
  async function contexto(tx: Tx): Promise<Contexto> {
    const q = async (sql: string, p: unknown[] = []) => (await tx.consultar<{ id: string }>(sql, p))[0]!.id
    return {
      skuSerie: await q("SELECT id FROM sku WHERE control = 'serie'"),
      skuCant: await q("SELECT id FROM sku WHERE control = 'cantidad'"),
      ubic: await q("SELECT id FROM ubicacion WHERE nombre = 'Almacén central'"),
      ubic2: await q("SELECT id FROM ubicacion WHERE nombre = 'Oficina Lima'"),
      persona: await q('SELECT id FROM persona ORDER BY nombre LIMIT 1'),
      persona2: await q('SELECT id FROM persona ORDER BY nombre DESC LIMIT 1'),
      tecnico: await q("SELECT m.id FROM membresia m JOIN rol r ON r.empresa_id = m.empresa_id AND r.id = m.rol_id WHERE r.nombre = 'Técnico'"),
      jefa: await q("SELECT m.id FROM membresia m JOIN rol r ON r.empresa_id = m.empresa_id AND r.id = m.rol_id WHERE r.nombre = 'Jefatura TI'"),
      proveedor: await q('SELECT id FROM proveedor ORDER BY nombre LIMIT 1'),
    }
  }

  const insertarActivo = (tx: Tx, c: Contexto, sku: string, serie: string) =>
    tx.consultar<{ id: string }>('INSERT INTO activo (empresa_id, sku_id, serie, ubicacion_id) VALUES ($1, $2, $3, $4) RETURNING id', [alfa, sku, serie, c.ubic])

  describe('series y control', () => {
    it('la serie es única por empresa y SKU, sin distinguir mayúsculas ni espacios', async () => {
      const e = await enAlfa((tx, c) => tx.intentar(() => insertarActivo(tx, c, c.skuSerie, ' sn-1001 ')).catch((x) => x))
      expect(e).toMatchObject({ esDuplicado: true, restriccion: 'uq_activo__serie' })
    })

    it('un activo dado de baja SIGUE ocupando su serie', async () => {
      const e = await enAlfa(async (tx, c) => {
        await tx.ejecutar("UPDATE activo SET estado = 'de_baja' WHERE serie = 'SN-1002'")
        return tx.intentar(() => insertarActivo(tx, c, c.skuSerie, 'SN-1002')).catch((x) => x)
      })
      expect(e).toMatchObject({ esDuplicado: true })
    })

    it('la misma serie en otro SKU o en otra empresa se acepta', async () => {
      await enAlfa(async (tx, c) => {
        const [otro] = await tx.consultar<{ id: string }>(
          "INSERT INTO sku (empresa_id, categoria_id, codigo, nombre, control) SELECT $1, categoria_id, 'LAP-0002', 'Otra laptop', 'serie' FROM sku WHERE id = $2 RETURNING id",
          [alfa, c.skuSerie],
        )
        await insertarActivo(tx, c, otro!.id, 'SN-1001') // misma serie, otro SKU: se acepta
      })
      const enBeta = await conEmpresa(beta, (tx) => tx.consultar("SELECT 1 FROM activo WHERE serie = 'SN-1001'"))
      expect(enBeta).toHaveLength(1) // Beta tiene su propio SN-1001
    })

    it('un SKU por cantidad no admite activos con serie, y uno por serie no admite existencias', async () => {
      const [a, b] = await enAlfa(async (tx, c) => [
        await tx.intentar(() => insertarActivo(tx, c, c.skuCant, 'X-1')).catch((x) => x),
        await tx.intentar(() => tx.consultar('INSERT INTO existencia (empresa_id, sku_id, ubicacion_id, cantidad) VALUES ($1, $2, $3, 1)', [alfa, c.skuSerie, c.ubic])).catch((x) => x),
      ])
      expect(a).toMatchObject({ esRegla: true })
      expect(a.message).toMatch(/cantidad no admite activos/)
      expect(b).toMatchObject({ esRegla: true })
      expect(b.message).toMatch(/serie no admite existencia/)
    })

    it('el saldo nunca es negativo ni supera el tope', async () => {
      const [neg, tope] = await enAlfa(async (tx, c) => [
        await tx.intentar(() => tx.consultar('UPDATE existencia SET cantidad = cantidad - 13 WHERE sku_id = $1', [c.skuCant])).catch((x) => x),
        await tx.intentar(() => tx.consultar('UPDATE existencia SET cantidad = 10000001 WHERE sku_id = $1', [c.skuCant])).catch((x) => x),
      ])
      expect(neg).toMatchObject({ codigo: '23514', restriccion: 'ck_existencia__cantidad' })
      expect(tope).toMatchObject({ codigo: '23514' })
    })

    it('el código, el control y la categoría de un SKU con inventario no cambian', async () => {
      const [cod, ctl] = await enAlfa(async (tx, c) => [
        await tx.intentar(() => tx.consultar("UPDATE sku SET codigo = 'LAP-9999' WHERE id = $1", [c.skuSerie])).catch((x) => x),
        await tx.intentar(() => tx.consultar("UPDATE sku SET control = 'cantidad' WHERE id = $1", [c.skuSerie])).catch((x) => x),
      ])
      expect(cod).toMatchObject({ esRegla: true })
      expect(ctl).toMatchObject({ esRegla: true })
    })
  })

  describe('estados y asignaciones', () => {
    const estados = ['en_stock', 'asignado', 'en_reparacion', 'extraviado', 'de_baja'] as const
    // Tabla de RF-INV-010 (desde -> hacia). asignado->asignado es el traspaso; extraviado/de_baja->en_stock, el reingreso.
    const permitidas = new Set([
      'en_stock>asignado', 'en_stock>en_reparacion', 'en_stock>extraviado', 'en_stock>de_baja',
      'asignado>en_stock', 'asignado>asignado', 'asignado>en_reparacion', 'asignado>extraviado', 'asignado>de_baja',
      'en_reparacion>en_stock', 'en_reparacion>asignado', 'en_reparacion>extraviado', 'en_reparacion>de_baja',
      'extraviado>en_stock', 'extraviado>de_baja',
      'de_baja>en_stock',
    ])
    it('las 25 combinaciones de estado coinciden con la tabla del documento funcional', async () => {
      await enAlfa(async (tx) => {
        for (const d of estados) {
          for (const h of estados) {
            const [{ ok }] = await tx.consultar<{ ok: boolean }>('SELECT transicion_valida($1, $2) AS ok', [d, h])
            expect(ok, `${d} -> ${h}`).toBe(permitidas.has(`${d}>${h}`))
          }
        }
      })
    })

    it('el disparador rechaza un cambio de estado prohibido en un activo real', async () => {
      const e = await enAlfa(async (tx) => {
        await tx.ejecutar("UPDATE activo SET estado = 'de_baja' WHERE serie = 'SN-1003'")
        return tx.intentar(() => tx.consultar("UPDATE activo SET estado = 'en_reparacion' WHERE serie = 'SN-1003'")).catch((x) => x)
      })
      expect(e).toMatchObject({ esRegla: true })
    })

    it('una sola asignación abierta por activo', async () => {
      const e = await enAlfa((tx, c) =>
        tx.intentar(() => tx.consultar(
          "INSERT INTO asignacion (empresa_id, activo_id, persona_id) SELECT $1, id, $2 FROM activo WHERE serie = 'SN-1001'", [alfa, c.persona2])).catch((x) => x))
      expect(e.esDuplicado || e.codigo === '23P01').toBe(true) // índice parcial o exclusión de solape
    })

    it('el historial de asignaciones no se solapa', async () => {
      const e = await enAlfa(async (tx, c) => {
        // cierra la abierta de SN-1001 y trata de abrir otra que cruza su tramo
        await tx.ejecutar("UPDATE asignacion SET hasta = now() + interval '1 day' WHERE activo_id = (SELECT id FROM activo WHERE serie = 'SN-1001')")
        return tx.intentar(() => tx.consultar(
          "INSERT INTO asignacion (empresa_id, activo_id, persona_id, desde) SELECT $1, id, $2, now() FROM activo WHERE serie = 'SN-1001'", [alfa, c.persona2])).catch((x) => x)
      })
      expect(e).toMatchObject({ codigo: '23P01' })
    })

    it('devolver y volver a asignar sin solape funciona', async () => {
      await enAlfa(async (tx, c) => {
        await tx.ejecutar("UPDATE asignacion SET hasta = now() WHERE activo_id = (SELECT id FROM activo WHERE serie = 'SN-1001') AND hasta IS NULL")
        await tx.ejecutar("UPDATE activo SET estado = 'en_stock' WHERE serie = 'SN-1001'")
        await tx.ejecutar("INSERT INTO asignacion (empresa_id, activo_id, persona_id) SELECT $1, id, $2 FROM activo WHERE serie = 'SN-1001'", [alfa, c.persona2])
        await tx.ejecutar("UPDATE activo SET estado = 'asignado' WHERE serie = 'SN-1001'")
        const filas = await tx.consultar('SELECT 1 FROM asignacion WHERE hasta IS NULL AND activo_id = (SELECT id FROM activo WHERE serie = $1)', ['SN-1001'])
        expect(filas).toHaveLength(1)
      })
    })
  })

  describe('compras y recepción', () => {
    async function crearOrden(tx: Tx, c: Contexto, cantidad = 10) {
      const [o] = await tx.consultar<{ id: string }>(
        "INSERT INTO orden_compra (empresa_id, numero, proveedor_id, preparada_por_membresia_id) VALUES ($1, 'OC-TEST-1', $2, $3) RETURNING id",
        [alfa, c.proveedor, c.tecnico],
      )
      const [l] = await tx.consultar<{ id: string }>(
        'INSERT INTO orden_linea (empresa_id, orden_id, sku_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4, 100) RETURNING id',
        [alfa, o!.id, c.skuCant, cantidad],
      )
      return { orden: o!.id, linea: l!.id }
    }
    const aprobar = (tx: Tx, orden: string, por: string) =>
      tx.consultar("INSERT INTO orden_aprobacion (empresa_id, orden_id, aprobador_membresia_id, decision) VALUES ($1, $2, $3, 'aprobada')", [alfa, orden, por])

    it('quien preparó la orden no puede aprobarla (la base lo impide)', async () => {
      const e = await enAlfa(async (tx, c) => {
        const { orden } = await crearOrden(tx, c)
        await tx.ejecutar("UPDATE orden_compra SET estado = 'por_aprobar' WHERE id = $1", [orden])
        return tx.intentar(() => aprobar(tx, orden, c.tecnico)).catch((x) => x)
      })
      expect(e.message).toMatch(/SEPARACION_FUNCIONES/)
    })

    it('la orden no pasa a aprobada sin la aprobación de otra persona', async () => {
      const e = await enAlfa(async (tx, c) => {
        const { orden } = await crearOrden(tx, c)
        await tx.ejecutar("UPDATE orden_compra SET estado = 'por_aprobar' WHERE id = $1", [orden])
        return tx.intentar(() => tx.consultar("UPDATE orden_compra SET estado = 'aprobada' WHERE id = $1", [orden])).catch((x) => x)
      })
      expect(e.message).toMatch(/SEPARACION_FUNCIONES/)
    })

    it('otra persona aprueba, se recibe en partes y nunca se supera lo pedido', async () => {
      await enAlfa(async (tx, c) => {
        const { orden, linea } = await crearOrden(tx, c, 10)
        await tx.ejecutar("UPDATE orden_compra SET estado = 'por_aprobar' WHERE id = $1", [orden])
        await aprobar(tx, orden, c.jefa)
        await tx.ejecutar("UPDATE orden_compra SET estado = 'aprobada' WHERE id = $1", [orden])

        const recibir = async (numero: string, cantidad: number) => {
          const [r] = await tx.consultar<{ id: string }>(
            'INSERT INTO recepcion (empresa_id, numero, orden_id, ubicacion_id, recibida_por_membresia_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [alfa, numero, orden, c.ubic, c.tecnico],
          )
          return tx.consultar('INSERT INTO recepcion_linea (empresa_id, recepcion_id, orden_linea_id, cantidad) VALUES ($1, $2, $3, $4)', [alfa, r!.id, linea, cantidad])
        }
        await recibir('RCP-T-1', 6)
        await tx.ejecutar("UPDATE orden_compra SET estado = 'recibida_parcial' WHERE id = $1", [orden])
        const pasada = await tx.intentar(() => recibir('RCP-T-2', 5)).catch((x) => x)
        expect(pasada).toMatchObject({ codigo: '23514', restriccion: 'ck_orden_linea__recibida' })
        await recibir('RCP-T-3', 4)
        const [{ r }] = await tx.consultar<{ r: string }>('SELECT cantidad_recibida::text AS r FROM orden_linea WHERE id = $1', [linea])
        expect(Number(r)).toBe(10)
      })
    })

    it('no se recibe una orden que no está aprobada y las líneas se congelan al enviar', async () => {
      await enAlfa(async (tx, c) => {
        const { orden, linea } = await crearOrden(tx, c)
        const [r] = await tx.consultar<{ id: string }>(
          'INSERT INTO recepcion (empresa_id, numero, orden_id, ubicacion_id, recibida_por_membresia_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [alfa, 'RCP-T-9', orden, c.ubic, c.tecnico],
        )
        const sinAprobar = await tx.intentar(() => tx.consultar('INSERT INTO recepcion_linea (empresa_id, recepcion_id, orden_linea_id, cantidad) VALUES ($1, $2, $3, 1)', [alfa, r!.id, linea])).catch((x) => x)
        expect(sinAprobar).toMatchObject({ esRegla: true })

        await tx.ejecutar("UPDATE orden_compra SET estado = 'por_aprobar' WHERE id = $1", [orden])
        const editar = await tx.intentar(() => tx.consultar('UPDATE orden_linea SET cantidad = 99 WHERE id = $1', [linea])).catch((x) => x)
        const borrar = await tx.intentar(() => tx.consultar('DELETE FROM orden_linea WHERE id = $1', [linea])).catch((x) => x)
        expect(editar).toMatchObject({ esRegla: true })
        expect(borrar).toMatchObject({ esRegla: true })
      })
    })

    it('una orden sin líneas no se envía a aprobación y la orden nace en borrador', async () => {
      await enAlfa(async (tx, c) => {
        const [o] = await tx.consultar<{ id: string }>(
          "INSERT INTO orden_compra (empresa_id, numero, proveedor_id, preparada_por_membresia_id) VALUES ($1, 'OC-TEST-2', $2, $3) RETURNING id", [alfa, c.proveedor, c.tecnico])
        const e = await tx.intentar(() => tx.consultar("UPDATE orden_compra SET estado = 'por_aprobar' WHERE id = $1", [o!.id])).catch((x) => x)
        expect(e).toMatchObject({ esRegla: true })
        const e2 = await tx.intentar(() => tx.consultar("INSERT INTO orden_compra (empresa_id, numero, proveedor_id, preparada_por_membresia_id, estado) VALUES ($1, 'OC-TEST-3', $2, $3, 'aprobada')", [alfa, c.proveedor, c.tecnico])).catch((x) => x)
        expect(e2).toMatchObject({ esRegla: true })
      })
    })

    it('la aprobación es de solo agregar', async () => {
      await enAlfa(async (tx, c) => {
        const { orden } = await crearOrden(tx, c)
        await tx.ejecutar("UPDATE orden_compra SET estado = 'por_aprobar' WHERE id = $1", [orden])
        await aprobar(tx, orden, c.jefa)
        const e = await tx.intentar(() => tx.consultar("UPDATE orden_aprobacion SET decision = 'rechazada'")).catch((x) => x)
        expect(e).toMatchObject({ esSinPermiso: true })
      })
    })
  })
})
