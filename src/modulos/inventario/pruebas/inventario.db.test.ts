import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones, conEmpresa } from '../../../nucleo/aislamiento'
import { listarAuditoria } from '../../../nucleo/auditoria'
import {
  contextoDe, contextoSinPermisos, crearEmpresaDePrueba, hayBaseDeDatos, textoAzar, type EmpresaPrueba,
} from '../../../nucleo/permisos/pruebas/apoyo'
import {
  asignarActivo, devolverActivo, historialActivo, listarActivos, listarExistencias, obtenerActivo, registrarActivos,
} from '../index'

type Base = { skuSerie: string; skuCantidad: string; skuViejo: string; ubicA: string; ubicB: string; ubicInactiva: string; persona: string; personaInactiva: string }

/** Datos de apoyo (inventados) de una empresa: dos SKU, ubicaciones y personas. */
async function prepararBase(e: EmpresaPrueba, codigoSerie = 'LAP-0001'): Promise<Base> {
  return conEmpresa(e.id, async (tx) => {
    const un = async <T>(sql: string, v: unknown[]) => ((await tx.consultar<T>(sql, v))[0] as T)
    const cat = await un<{ id: string }>(`INSERT INTO categoria (empresa_id, nombre, prefijo) VALUES ($1, 'Equipos', 'EQ') RETURNING id`, [e.id])
    const sku = (codigo: string, nombre: string, control: string, activo = true) =>
      un<{ id: string }>(`INSERT INTO sku (empresa_id, categoria_id, codigo, nombre, control, activo) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [e.id, cat.id, codigo, nombre, control, activo])
    const ub = (n: string, activo = true) => un<{ id: string }>(`INSERT INTO ubicacion (empresa_id, nombre, activo) VALUES ($1,$2,$3) RETURNING id`, [e.id, n, activo])
    const pe = (n: string, activo = true) => un<{ id: string }>(`INSERT INTO persona (empresa_id, nombre, activo) VALUES ($1,$2,$3) RETURNING id`, [e.id, n, activo])
    return {
      skuSerie: (await sku(codigoSerie, 'Laptop de prueba', 'serie')).id,
      skuCantidad: (await sku('MON-0001', 'Monitor de prueba', 'cantidad')).id,
      skuViejo: (await sku('VIEJO-1', 'Artículo retirado', 'serie', false)).id,
      ubicA: (await ub('Almacén')).id, ubicB: (await ub('Oficina')).id, ubicInactiva: (await ub('Cerrada', false)).id,
      persona: (await pe('Ana Inventada')).id, personaInactiva: (await pe('Beto Inactivo', false)).id,
    }
  })
}

describe.skipIf(!hayBaseDeDatos)('inventario (con base real)', () => {
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

  const tecnico = () => contextoDe(alfa, 'tecnico')

  describe('registrar por serie', () => {
    it('crea una fila por serie, las lista y deja auditoría por equipo', async () => {
      const r = await registrarActivos(tecnico(), { skuId: a.skuSerie, ubicacionId: a.ubicA, series: ['SN-001', ' SN-002 ', 'SN-003'] })
      expect(r).toEqual({ creados: 3 })
      const lista = await listarActivos(tecnico(), { skuId: a.skuSerie })
      expect(lista.map((x) => x.serie)).toEqual(['SN-001', 'SN-002', 'SN-003'])
      expect(lista[0]).toMatchObject({ skuCodigo: 'LAP-0001', estado: 'en_stock', ubicacionNombre: 'Almacén', personaId: null, personaNombre: null })
      const aud = await listarAuditoria(contextoDe(alfa, 'admin'), { entidad: 'activo' })
      expect(aud.filter((x) => x.accion === 'activo.registrar')).toHaveLength(3)
    })

    it('DUPLICADO: una serie ya registrada se rechaza diciendo cuál, y no se guarda nada del lote', async () => {
      const antes = (await listarActivos(tecnico(), { skuId: a.skuSerie })).length
      await expect(registrarActivos(tecnico(), { skuId: a.skuSerie, ubicacionId: a.ubicA, series: ['SN-NUEVA', 'sn-002'] }))
        .rejects.toMatchObject({ codigo: 'DUPLICADO', mensaje: expect.stringContaining('SN-002'), campos: { series: expect.stringContaining('SN-002') } })
      expect((await listarActivos(tecnico(), { skuId: a.skuSerie })).length).toBe(antes)
    })

    it('DUPLICADO: series repetidas dentro de la misma lista, sin importar mayúsculas ni espacios', async () => {
      await expect(registrarActivos(tecnico(), { skuId: a.skuSerie, ubicacionId: a.ubicA, series: ['X-1', 'x - 1', 'Y-9'] }))
        .rejects.toMatchObject({ codigo: 'DUPLICADO', mensaje: expect.stringContaining('x - 1') })
    })

    it('una serie que ya existe en OTRO SKU de la empresa se acepta con un aviso que dice dónde está', async () => {
      const otroSku = await conEmpresa(alfa.id, async (tx) =>
        ((await tx.consultar<{ id: string }>(`INSERT INTO sku (empresa_id, categoria_id, codigo, nombre, control)
          SELECT $1, categoria_id, 'TAB-0001', 'Tablet de prueba', 'serie' FROM sku WHERE empresa_id = $1 LIMIT 1 RETURNING id`, [alfa.id]))[0] as { id: string }).id)
      const primero = await registrarActivos(tecnico(), { skuId: a.skuSerie, ubicacionId: a.ubicA, series: ['COMPARTIDA-1'] })
      expect(primero.avisos ?? []).toEqual([])
      const segundo = await registrarActivos(tecnico(), { skuId: otroSku, ubicacionId: a.ubicA, series: ['compartida-1'] })
      expect(segundo.creados).toBe(1)
      expect(segundo.avisos).toEqual([expect.stringMatching(/COMPARTIDA-1.*LAP-0001/)])
    })

    it('la misma serie vale en otro SKU y en otra empresa', async () => {
      await expect(registrarActivos(contextoDe(beta, 'tecnico'), { skuId: b.skuSerie, ubicacionId: b.ubicA, series: ['SN-001'] })).resolves.toEqual({ creados: 1 })
    })

    it('VALIDACION: sin series, series vacías, demasiadas, SKU inactivo o ubicación inactiva', async () => {
      const base = { skuId: a.skuSerie, ubicacionId: a.ubicA }
      await expect(registrarActivos(tecnico(), base)).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(registrarActivos(tecnico(), { ...base, series: ['A', '  '] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(registrarActivos(tecnico(), { ...base, series: Array.from({ length: 201 }, (_, i) => `S${i}`) })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(registrarActivos(tecnico(), { skuId: a.skuViejo, ubicacionId: a.ubicA, series: ['V1'] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(registrarActivos(tecnico(), { ...base, ubicacionId: a.ubicInactiva, series: ['V2'] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(registrarActivos(tecnico(), { skuId: 'no-es-id', ubicacionId: a.ubicA, series: ['V3'] })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { skuId: expect.any(String) } })
    })

    it('un SKU por serie no admite cantidad', async () => {
      await expect(registrarActivos(tecnico(), { skuId: a.skuSerie, ubicacionId: a.ubicA, cantidad: 5 }))
        .rejects.toMatchObject({ codigo: 'VALIDACION', campos: { series: expect.any(String) } })
    })
  })

  describe('registrar por cantidad', () => {
    it('suma al saldo de la ubicación y se ve en las existencias', async () => {
      await registrarActivos(tecnico(), { skuId: a.skuCantidad, ubicacionId: a.ubicA, cantidad: 10 })
      await registrarActivos(tecnico(), { skuId: a.skuCantidad, ubicacionId: a.ubicA, cantidad: 5 })
      await registrarActivos(tecnico(), { skuId: a.skuCantidad, ubicacionId: a.ubicB, cantidad: 2 })
      const ex = await listarExistencias(tecnico())
      expect(ex.find((x) => x.ubicacionId === a.ubicA)).toMatchObject({ skuCodigo: 'MON-0001', cantidad: 15, ubicacionNombre: 'Almacén' })
      expect(ex.find((x) => x.ubicacionId === a.ubicB)?.cantidad).toBe(2)
    })

    it('VALIDACION: cantidad cero, negativa, decimal, ausente o enorme; y no admite series', async () => {
      const base = { skuId: a.skuCantidad, ubicacionId: a.ubicA }
      for (const cantidad of [0, -3, 1.5, 2_000_000]) {
        await expect(registrarActivos(tecnico(), { ...base, cantidad })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { cantidad: expect.any(String) } })
      }
      await expect(registrarActivos(tecnico(), base)).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(registrarActivos(tecnico(), { ...base, series: ['A1'] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
    })

    it('el saldo nunca queda negativo ni pasa el tope (la base lo impide)', async () => {
      await expect(conEmpresa(alfa.id, (tx) =>
        tx.ejecutar(`UPDATE existencia SET cantidad = cantidad - 1000 WHERE empresa_id = $1`, [alfa.id]))).rejects.toBeDefined()
      const ex = await listarExistencias(tecnico())
      expect(ex.every((x) => x.cantidad >= 0)).toBe(true)
    })
  })

  describe('asignar y devolver', () => {
    it('recorrido del guion: asignar, ver quién lo tiene, devolver a otra ubicación, historial', async () => {
      const [activo] = await listarActivos(tecnico(), { texto: 'SN-001', skuId: a.skuSerie })
      const asignado = await asignarActivo(tecnico(), { activoId: activo!.id, personaId: a.persona })
      expect(asignado).toMatchObject({ estado: 'asignado', personaId: a.persona, personaNombre: 'Ana Inventada' })
      expect(await listarActivos(tecnico(), { personaId: a.persona })).toHaveLength(1)
      expect(await listarActivos(tecnico(), { estado: 'asignado' })).toHaveLength(1)

      const devuelto = await devolverActivo(tecnico(), { activoId: activo!.id, ubicacionId: a.ubicB })
      expect(devuelto).toMatchObject({ estado: 'en_stock', personaId: null, ubicacionId: a.ubicB, ubicacionNombre: 'Oficina' })
      expect((await obtenerActivo(tecnico(), activo!.id)).ubicacionNombre).toBe('Oficina')

      const h = await historialActivo(tecnico(), activo!.id)
      expect(h.map((x) => x.tipo)).toEqual(['devolucion', 'asignacion', 'registro'])
      expect(h[1]).toMatchObject({ personaNombre: 'Ana Inventada', autorNombre: 'Usuario tecnico' })
      expect(h[0]).toMatchObject({ ubicacionNombre: 'Oficina' })
      // La auditoría guarda ids, no el nombre de la persona.
      const aud = await listarAuditoria(contextoDe(alfa, 'admin'), { entidad: 'activo' })
      expect(JSON.stringify(aud)).not.toContain('Ana Inventada')
    })

    it('CONFLICTO: no se asigna dos veces, ni se devuelve lo que no está asignado', async () => {
      const [activo] = await listarActivos(tecnico(), { texto: 'SN-002' })
      await asignarActivo(tecnico(), { activoId: activo!.id, personaId: a.persona })
      await expect(asignarActivo(tecnico(), { activoId: activo!.id, personaId: a.persona })).rejects.toMatchObject({ codigo: 'CONFLICTO', mensaje: expect.stringContaining('Ana Inventada') })
      const [libre] = await listarActivos(tecnico(), { texto: 'SN-003' })
      await expect(devolverActivo(tecnico(), { activoId: libre!.id, ubicacionId: a.ubicA })).rejects.toMatchObject({ codigo: 'CONFLICTO' })
    })

    it('dos asignaciones a la vez del mismo equipo: solo una gana', async () => {
      const [activo] = await listarActivos(tecnico(), { texto: 'SN-003' })
      const r = await Promise.allSettled([
        asignarActivo(tecnico(), { activoId: activo!.id, personaId: a.persona }),
        asignarActivo(tecnico(), { activoId: activo!.id, personaId: a.persona }),
      ])
      expect(r.filter((x) => x.status === 'fulfilled')).toHaveLength(1)
      expect(r.filter((x) => x.status === 'rejected')).toHaveLength(1)
      const rechazo = r.find((x) => x.status === 'rejected') as PromiseRejectedResult
      expect(rechazo.reason).toMatchObject({ codigo: 'CONFLICTO' })
    })

    it('VALIDACION: persona inactiva, ubicación inactiva, ids que no son ids', async () => {
      const [activo] = await listarActivos(tecnico(), { estado: 'en_stock' })
      await expect(asignarActivo(tecnico(), { activoId: activo!.id, personaId: a.personaInactiva })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      await expect(asignarActivo(tecnico(), { activoId: 'x', personaId: a.persona })).rejects.toMatchObject({ codigo: 'VALIDACION' })
      const [asignado] = await listarActivos(tecnico(), { estado: 'asignado' })
      await expect(devolverActivo(tecnico(), { activoId: asignado!.id, ubicacionId: a.ubicInactiva })).rejects.toMatchObject({ codigo: 'VALIDACION' })
    })

    it('SEPARACION_FUNCIONES: nadie se asigna un equipo a sí mismo (persona con su mismo correo)', async () => {
      const correo = alfa.usuarios.tecnico!.correo
      const personaYo = await conEmpresa(alfa.id, async (tx) =>
        ((await tx.consultar<{ id: string }>(`INSERT INTO persona (empresa_id, nombre, correo) VALUES ($1, 'Yo Mismo', $2) RETURNING id`, [alfa.id, correo]))[0] as { id: string }).id)
      await registrarActivos(tecnico(), { skuId: a.skuSerie, ubicacionId: a.ubicA, series: ['SN-YO'] })
      const [activo] = await listarActivos(tecnico(), { texto: 'SN-YO' })
      await expect(asignarActivo(tecnico(), { activoId: activo!.id, personaId: personaYo })).rejects.toMatchObject({ codigo: 'SEPARACION_FUNCIONES' })
      expect((await obtenerActivo(tecnico(), activo!.id)).estado).toBe('en_stock')
    })
  })

  describe('aislamiento entre empresas', () => {
    it('no se ven, ni se tocan, ni se usan datos de la otra empresa', async () => {
      const deBeta = (await listarActivos(contextoDe(beta, 'tecnico'), {}))
      expect(deBeta.map((x) => x.serie)).toEqual(['SN-001'])
      const idBeta = deBeta[0]!.id
      await expect(obtenerActivo(tecnico(), idBeta)).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      await expect(historialActivo(tecnico(), idBeta)).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      await expect(asignarActivo(tecnico(), { activoId: idBeta, personaId: a.persona })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      await expect(devolverActivo(tecnico(), { activoId: idBeta, ubicacionId: a.ubicA })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      // SKU, ubicación y persona de otra empresa no existen para esta.
      await expect(registrarActivos(tecnico(), { skuId: b.skuSerie, ubicacionId: a.ubicA, series: ['Z1'] })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      await expect(registrarActivos(tecnico(), { skuId: a.skuSerie, ubicacionId: b.ubicA, series: ['Z1'] })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      const [propio] = await listarActivos(tecnico(), { estado: 'en_stock' })
      await expect(asignarActivo(tecnico(), { activoId: propio!.id, personaId: b.persona })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
      expect((await listarExistencias(contextoDe(beta, 'tecnico')))).toEqual([])
    })
  })

  describe('permisos en el servidor (SIN_PERMISO)', () => {
    it('cada servicio rechaza a quien no tiene el permiso', async () => {
      const nada = contextoSinPermisos(alfa)
      const [activo] = await listarActivos(tecnico(), {})
      const consulta = contextoDe(alfa, 'consulta') // solo ver
      await expect(listarActivos(nada, {})).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(listarExistencias(nada)).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(obtenerActivo(nada, activo!.id)).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(historialActivo(nada, activo!.id)).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(registrarActivos(consulta, { skuId: a.skuSerie, ubicacionId: a.ubicA, series: ['P1'] })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(asignarActivo(consulta, { activoId: activo!.id, personaId: a.persona })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(devolverActivo(consulta, { activoId: activo!.id, ubicacionId: a.ubicA })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      // Con solo «ver», consulta sí lista.
      await expect(listarActivos(consulta, {})).resolves.toBeDefined()
    })

    it('registrar, asignar y devolver son permisos distintos', async () => {
      const [activo] = await listarActivos(tecnico(), { estado: 'en_stock' })
      const soloAsignar = contextoDe(alfa, 'tecnico', ['entregas.crear', 'activos.ver'])
      await expect(registrarActivos(soloAsignar, { skuId: a.skuSerie, ubicacionId: a.ubicA, series: ['P2'] })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(devolverActivo(soloAsignar, { activoId: activo!.id, ubicacionId: a.ubicA })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
      await expect(asignarActivo(soloAsignar, { activoId: activo!.id, personaId: a.persona })).resolves.toMatchObject({ estado: 'asignado' })
    })

    it('el contexto vacío no entra', async () => {
      await expect(listarActivos(undefined as never, {})).rejects.toMatchObject({ codigo: 'SIN_ACCESO' })
    })
  })

  it('el texto buscado se toma literal (no como comodín)', async () => {
    await registrarActivos(tecnico(), { skuId: a.skuSerie, ubicacionId: a.ubicA, series: [`PCT%${textoAzar()}`] })
    expect((await listarActivos(tecnico(), { texto: '%' })).length).toBe(1)
  })
})
