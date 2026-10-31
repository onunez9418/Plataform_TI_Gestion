import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones, conEmpresa } from '../../../nucleo/aislamiento'
import { listarAuditoria } from '../../../nucleo/auditoria'
import { contextoDe, crearEmpresaDePrueba, hayBaseDeDatos, type EmpresaPrueba } from '../../../nucleo/permisos/pruebas/apoyo'
import { crearCategoria, type CampoDef } from '../../categorias'
import { crearSku, listarSkus, obtenerSku } from '../index'
import { MAX_INTENTOS_CODIGO } from '../servicios/skus'

const CAMPOS: CampoDef[] = [
  { clave: 'procesador', etiqueta: 'Procesador', tipo: 'texto', obligatorio: true },
  { clave: 'ram_gb', etiqueta: 'RAM GB', tipo: 'numero', obligatorio: false },
  { clave: 'disco', etiqueta: 'Disco', tipo: 'lista', opciones: ['SSD', 'HDD'], obligatorio: false },
]

describe.skipIf(!hayBaseDeDatos)('maestro de SKU (con base real)', () => {
  let alfa: EmpresaPrueba
  let beta: EmpresaPrueba
  let lapAlfa: string
  let monAlfa: string
  let lapBeta: string

  beforeAll(async () => {
    alfa = await crearEmpresaDePrueba('Alfa'); beta = await crearEmpresaDePrueba('Beta')
    const a = contextoDe(alfa, 'admin'); const b = contextoDe(beta, 'admin')
    lapAlfa = (await crearCategoria(a, { nombre: 'Laptops', prefijo: 'LAP', campos: CAMPOS })).id
    monAlfa = (await crearCategoria(a, { nombre: 'Monitores', prefijo: 'MON', campos: [] })).id
    lapBeta = (await crearCategoria(b, { nombre: 'Laptops', prefijo: 'LAP', campos: CAMPOS })).id
  })
  afterAll(async () => { await cerrarConexiones() })

  it('código automático PREFIJO-0001, 0002… por categoría, con los valores de los campos', async () => {
    const ctx = contextoDe(alfa, 'tecnico')
    const uno = await crearSku(ctx, { categoriaId: lapAlfa, nombre: 'Laptop 14"', control: 'serie', valores: { procesador: 'Core i5', ram_gb: '16', disco: 'SSD' } })
    const dos = await crearSku(ctx, { categoriaId: lapAlfa, nombre: 'Laptop 16"', control: 'serie', valores: { procesador: 'Core i7' } })
    const mon = await crearSku(ctx, { categoriaId: monAlfa, nombre: 'Monitor 24"', control: 'cantidad', valores: {} })
    expect(uno).toMatchObject({ codigo: 'LAP-0001', codigoPropio: false, control: 'serie', categoriaNombre: 'Laptops', valores: { procesador: 'Core i5', ram_gb: 16, disco: 'SSD' } })
    expect(dos.codigo).toBe('LAP-0002')
    expect(mon.codigo).toBe('MON-0001')
    const aud = await listarAuditoria(contextoDe(alfa, 'admin'), { entidad: 'sku' })
    expect(aud.find((a) => a.accion === 'sku.crear' && a.entidadId === uno.id)?.cambios).toMatchObject({ codigo: 'LAP-0001', control: 'serie' })
  })

  it('el código propio sobrescribe el automático; uno repetido es DUPLICADO (sin importar mayúsculas)', async () => {
    const admin = contextoDe(alfa, 'admin')
    const propio = await crearSku(admin, { categoriaId: monAlfa, nombre: 'Monitor curvo', control: 'cantidad', codigo: 'mon-curvo-01', valores: {} })
    expect(propio).toMatchObject({ codigo: 'MON-CURVO-01', codigoPropio: true })
    await expect(crearSku(admin, { categoriaId: monAlfa, nombre: 'Otro', control: 'cantidad', codigo: 'MON-CURVO-01', valores: {} }))
      .rejects.toMatchObject({ codigo: 'DUPLICADO', campos: { codigo: expect.any(String) } })
    await expect(crearSku(admin, { categoriaId: lapAlfa, nombre: 'Otro más', control: 'serie', codigo: 'lap-0001', valores: { procesador: 'x' } }))
      .rejects.toMatchObject({ codigo: 'DUPLICADO' })
  })

  it('un código propio que ocupa el siguiente número hace que el automático lo salte', async () => {
    const admin = contextoDe(alfa, 'admin')
    await crearSku(admin, { categoriaId: lapAlfa, nombre: 'Ocupa el 3', control: 'serie', codigo: 'LAP-0003', valores: { procesador: 'x' } })
    const auto = await crearSku(admin, { categoriaId: lapAlfa, nombre: 'Automático', control: 'serie', valores: { procesador: 'x' } })
    expect(auto.codigo).toBe('LAP-0004')
  })

  it('DEF-SKU-01: el código automático salta más de 10 códigos propios seguidos, y avisa con claridad si pasa el tope de seguridad', async () => {
    const admin = contextoDe(alfa, 'admin')
    const ocupar = (prefijo: string, cuantos: number, categoriaId: string) => conEmpresa(alfa.id, (tx) => tx.ejecutar(
      `INSERT INTO sku (empresa_id, categoria_id, codigo, codigo_propio, nombre, control)
       SELECT $1, $2, $3 || '-' || lpad(n::text, 4, '0'), true, 'Propio ' || n, 'cantidad' FROM generate_series(1, $4::int) n`,
      [alfa.id, categoriaId, prefijo, cuantos]))
    // 25 ocupados seguidos: el automático los salta.
    const salta = (await crearCategoria(admin, { nombre: 'Salta muchos', prefijo: 'SAL', campos: [] })).id
    await ocupar('SAL', 25, salta)
    expect((await crearSku(admin, { categoriaId: salta, nombre: 'Automático', control: 'cantidad', valores: {} })).codigo).toBe('SAL-0026')
    // Justo en el límite: con (tope - 1) ocupados todavía alcanza el último intento.
    const limite = (await crearCategoria(admin, { nombre: 'En el límite', prefijo: 'LIM', campos: [] })).id
    await ocupar('LIM', MAX_INTENTOS_CODIGO - 1, limite)
    expect((await crearSku(admin, { categoriaId: limite, nombre: 'Último intento', control: 'cantidad', valores: {} })).codigo).toBe(`LIM-${MAX_INTENTOS_CODIGO}`)
    // Pasado el tope: error claro, sin crear nada.
    const tope = (await crearCategoria(admin, { nombre: 'Pasa el tope', prefijo: 'TOP', campos: [] })).id
    await ocupar('TOP', MAX_INTENTOS_CODIGO, tope)
    await expect(crearSku(admin, { categoriaId: tope, nombre: 'No cabe', control: 'cantidad', valores: {} }))
      .rejects.toMatchObject({ codigo: 'CONFLICTO', mensaje: expect.stringContaining('código propio') })
    expect(await listarSkus(admin, { texto: 'No cabe' })).toEqual([])
  })

  it('DEF-CAM-01: un campo número recibido como lista o un texto recibido como objeto se rechaza con VALIDACION', async () => {
    const ctx = contextoDe(alfa, 'tecnico')
    await expect(crearSku(ctx, { categoriaId: lapAlfa, nombre: 'RAM lista', control: 'serie', valores: { procesador: 'x', ram_gb: [16] } }))
      .rejects.toMatchObject({ codigo: 'VALIDACION', campos: { ram_gb: expect.any(String) } })
    await expect(crearSku(ctx, { categoriaId: lapAlfa, nombre: 'Procesador objeto', control: 'serie', valores: { procesador: { a: 1 } } }))
      .rejects.toMatchObject({ codigo: 'VALIDACION', campos: { procesador: expect.any(String) } })
  })

  it('sin skus.codigo_propio no se puede sobrescribir (SIN_PERMISO), pero el automático sí', async () => {
    const tecnico = contextoDe(alfa, 'tecnico')
    await expect(crearSku(tecnico, { categoriaId: monAlfa, nombre: 'Con código', control: 'cantidad', codigo: 'MIO-1', valores: {} })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(crearSku(tecnico, { categoriaId: monAlfa, nombre: 'Sin código', control: 'cantidad', valores: {} })).resolves.toBeDefined()
  })

  it('SIN_PERMISO para crear sin skus.crear_editar; ver sí con skus.ver', async () => {
    const consulta = contextoDe(alfa, 'consulta')
    await expect(crearSku(consulta, { categoriaId: monAlfa, nombre: 'No puedo', control: 'cantidad', valores: {} })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    expect((await listarSkus(consulta)).length).toBeGreaterThan(0)
    await expect(listarSkus(contextoDe(alfa, 'consulta', []))).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(obtenerSku(contextoDe(alfa, 'consulta', []), 'x')).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
  })

  it('valida datos y campos de la categoría, y dice cuál falló', async () => {
    const ctx = contextoDe(alfa, 'tecnico')
    await expect(crearSku(ctx, { categoriaId: lapAlfa, nombre: 'Falta obligatorio', control: 'serie', valores: {} }))
      .rejects.toMatchObject({ codigo: 'VALIDACION', campos: { procesador: expect.any(String) } })
    await expect(crearSku(ctx, { categoriaId: lapAlfa, nombre: 'RAM mala', control: 'serie', valores: { procesador: 'x', ram_gb: 'abc', inventado: 1 } }))
      .rejects.toMatchObject({ codigo: 'VALIDACION', campos: { ram_gb: expect.any(String), inventado: expect.any(String) } })
    await expect(crearSku(ctx, { categoriaId: lapAlfa, nombre: 'x', control: 'otro' as never, valores: { procesador: 'x' } }))
      .rejects.toMatchObject({ codigo: 'VALIDACION', campos: { nombre: expect.any(String), control: expect.any(String) } })
    await expect(crearSku(contextoDe(alfa, 'admin'), { categoriaId: lapAlfa, nombre: 'Código raro', control: 'serie', codigo: 'a b;--', valores: { procesador: 'x' } }))
      .rejects.toMatchObject({ codigo: 'VALIDACION', campos: { codigo: expect.any(String) } })
  })

  it('aislamiento: mismo código en la otra empresa, contadores independientes, categoría ajena no existe', async () => {
    const b = contextoDe(beta, 'admin')
    const enBeta = await crearSku(b, { categoriaId: lapBeta, nombre: 'Laptop distinta', control: 'serie', valores: { procesador: 'Ryzen' } })
    expect(enBeta.codigo).toBe('LAP-0001') // el mismo código que en Alfa, a propósito
    await expect(crearSku(b, { categoriaId: lapAlfa, nombre: 'Cruzada', control: 'serie', valores: { procesador: 'x' } })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
    const alfaLap1 = (await listarSkus(contextoDe(alfa, 'admin'), { texto: 'LAP-0001' }))[0]
    await expect(obtenerSku(b, alfaLap1!.id)).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
    expect((await listarSkus(b)).every((s) => s.nombre !== 'Laptop 14"')).toBe(true)
  })

  it('10 altas simultáneas en la misma categoría: 10 códigos distintos', async () => {
    const ctx = contextoDe(alfa, 'admin')
    const todos = await Promise.all(Array.from({ length: 10 }, (_, i) =>
      crearSku(ctx, { categoriaId: monAlfa, nombre: `Monitor paralelo ${i}`, control: 'cantidad', valores: {} })))
    expect(new Set(todos.map((s) => s.codigo)).size).toBe(10)
  })

  it('listar filtra por texto y categoría, y el texto se toma literal', async () => {
    const ctx = contextoDe(alfa, 'admin')
    expect((await listarSkus(ctx, { categoriaId: lapAlfa })).every((s) => s.categoriaId === lapAlfa)).toBe(true)
    expect((await listarSkus(ctx, { texto: 'curvo' })).map((s) => s.codigo)).toEqual(['MON-CURVO-01'])
    expect(await listarSkus(ctx, { texto: '%' })).toEqual([])
    expect(await listarSkus(ctx, { texto: "'; drop table sku;--" })).toEqual([])
    await expect(listarSkus(ctx, { categoriaId: 'no-es-id' })).rejects.toMatchObject({ codigo: 'VALIDACION' })
  })
})
