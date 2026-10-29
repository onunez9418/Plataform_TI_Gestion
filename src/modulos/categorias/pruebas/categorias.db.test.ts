import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones } from '../../../nucleo/aislamiento'
import { listarAuditoria } from '../../../nucleo/auditoria'
import { contextoDe, crearEmpresaDePrueba, hayBaseDeDatos, type EmpresaPrueba } from '../../../nucleo/permisos/pruebas/apoyo'
import { agregarCampo, crearCategoria, listarCategorias } from '../index'
import type { CampoDef } from '../tipos'

export const CAMPOS_LAPTOP: CampoDef[] = [
  { clave: 'procesador', etiqueta: 'Procesador', tipo: 'texto', obligatorio: true },
  { clave: 'ram_gb', etiqueta: 'RAM GB', tipo: 'numero', obligatorio: false },
  { clave: 'fecha_compra', etiqueta: 'Fecha de compra', tipo: 'fecha', obligatorio: false },
  { clave: 'disco', etiqueta: 'Disco', tipo: 'lista', opciones: ['SSD', 'HDD'], obligatorio: false },
  { clave: 'garantia', etiqueta: 'Con garantía', tipo: 'si_no', obligatorio: false },
]

describe.skipIf(!hayBaseDeDatos)('categorías con campos (con base real)', () => {
  let alfa: EmpresaPrueba
  let beta: EmpresaPrueba
  beforeAll(async () => { alfa = await crearEmpresaDePrueba('Alfa'); beta = await crearEmpresaDePrueba('Beta') })
  afterAll(async () => { await cerrarConexiones() })

  it('crea «Impresoras» con sus campos propios y deja auditoría', async () => {
    const ctx = contextoDe(alfa, 'admin')
    const cat = await crearCategoria(ctx, { nombre: 'Impresoras', prefijo: 'imp', campos: [
      { clave: '', etiqueta: 'Tipo de tinta', tipo: 'lista', opciones: ['Tinta', 'Láser'], obligatorio: true },
      { clave: 'color', etiqueta: 'A color', tipo: 'si_no', obligatorio: false },
    ] })
    expect(cat).toMatchObject({ nombre: 'Impresoras', prefijo: 'IMP', cantidadSkus: 0 })
    expect(cat.campos.map((c) => [c.clave, c.tipo, c.orden])).toEqual([['tipo_de_tinta', 'lista', 1], ['color', 'si_no', 2]])
    expect(cat.campos[0]?.opciones).toEqual(['Tinta', 'Láser'])
    expect((await listarCategorias(ctx)).map((c) => c.prefijo)).toContain('IMP')
    expect((await listarAuditoria(ctx, { entidad: 'categoria' })).some((a) => a.accion === 'categoria.crear' && a.entidadId === cat.id)).toBe(true)
  })

  it('DUPLICADO por prefijo y por nombre (sin importar tildes ni mayúsculas); el otro cliente puede repetirlos', async () => {
    const ctx = contextoDe(alfa, 'admin')
    await crearCategoria(ctx, { nombre: 'Teléfonos', prefijo: 'TEL', campos: [] })
    await expect(crearCategoria(ctx, { nombre: 'Otra cosa', prefijo: 'TEL', campos: [] })).rejects.toMatchObject({ codigo: 'DUPLICADO', campos: { prefijo: expect.any(String) } })
    await expect(crearCategoria(ctx, { nombre: 'telefonos', prefijo: 'TLF', campos: [] })).rejects.toMatchObject({ codigo: 'DUPLICADO', campos: { nombre: expect.any(String) } })
    await expect(crearCategoria(contextoDe(beta, 'admin'), { nombre: 'Teléfonos', prefijo: 'TEL', campos: [] })).resolves.toBeDefined()
  })

  it('valida prefijo (forma y reservados), campos repetidos y listas vacías', async () => {
    const ctx = contextoDe(alfa, 'admin')
    await expect(crearCategoria(ctx, { nombre: 'Mala', prefijo: 'a b', campos: [] })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { prefijo: expect.any(String) } })
    await expect(crearCategoria(ctx, { nombre: 'Órdenes', prefijo: 'OC', campos: [] })).rejects.toMatchObject({ codigo: 'VALIDACION', campos: { prefijo: expect.stringContaining('reservado') } })
    const repetidos: CampoDef[] = [
      { clave: 'a', etiqueta: 'A', tipo: 'texto', obligatorio: false }, { clave: 'a', etiqueta: 'A2', tipo: 'texto', obligatorio: false },
    ]
    await expect(crearCategoria(ctx, { nombre: 'Rep', prefijo: 'REP', campos: repetidos })).rejects.toMatchObject({ codigo: 'VALIDACION' })
    await expect(crearCategoria(ctx, { nombre: 'Lis', prefijo: 'LIS', campos: [{ clave: 'x', etiqueta: 'X', tipo: 'lista', obligatorio: false }] })).rejects.toMatchObject({ codigo: 'VALIDACION' })
    const cuarentaYUno = Array.from({ length: 41 }, (_, i) => ({ clave: `c${i}`, etiqueta: `C${i}`, tipo: 'texto' as const, obligatorio: false }))
    await expect(crearCategoria(ctx, { nombre: 'Muchas', prefijo: 'MUC', campos: cuarentaYUno })).rejects.toMatchObject({ codigo: 'VALIDACION' })
  })

  it('agrega un campo después, en orden; clave repetida es DUPLICADO; categoría ajena NO_ENCONTRADO', async () => {
    const ctx = contextoDe(alfa, 'admin')
    const cat = await crearCategoria(ctx, { nombre: 'Redes', prefijo: 'RED', campos: [{ clave: 'ip', etiqueta: 'IP', tipo: 'texto', obligatorio: false }] })
    const nueva = await agregarCampo(ctx, { categoriaId: cat.id, campo: { clave: 'puertos', etiqueta: 'Puertos', tipo: 'numero', obligatorio: false } })
    expect(nueva.campos.map((c) => c.clave)).toEqual(['ip', 'puertos'])
    await expect(agregarCampo(ctx, { categoriaId: cat.id, campo: { clave: 'ip', etiqueta: 'IP otra vez', tipo: 'texto', obligatorio: false } })).rejects.toMatchObject({ codigo: 'DUPLICADO' })
    const ajena = await crearCategoria(contextoDe(beta, 'admin'), { nombre: 'Ajena', prefijo: 'AJE', campos: [] })
    await expect(agregarCampo(ctx, { categoriaId: ajena.id, campo: { clave: 'x', etiqueta: 'X', tipo: 'texto', obligatorio: false } })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
    await expect(agregarCampo(ctx, { categoriaId: 'zzz', campo: { clave: 'x', etiqueta: 'X', tipo: 'texto', obligatorio: false } })).rejects.toMatchObject({ codigo: 'NO_ENCONTRADO' })
    expect((await listarCategorias(contextoDe(beta, 'admin'))).map((c) => c.prefijo)).not.toContain('RED')
  })

  it('SIN_PERMISO: el Técnico no gestiona categorías; Consulta solo las ve', async () => {
    await expect(crearCategoria(contextoDe(alfa, 'tecnico'), { nombre: 'Prohibida', prefijo: 'PRO', campos: [] })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(agregarCampo(contextoDe(alfa, 'consulta'), { categoriaId: 'x', campo: CAMPOS_LAPTOP[0]! })).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    await expect(listarCategorias(contextoDe(alfa, 'consulta'))).resolves.toBeInstanceOf(Array)
    await expect(listarCategorias(contextoDe(alfa, 'consulta', []))).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
  })
})
