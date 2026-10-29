// QA · Maestro de SKU: correlativo sin repetirse con muchas altas a la vez, código propio contra automático,
// y campos personalizados obligatorios vacíos o con tipo incorrecto. Base real; empresas de prueba nuevas.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cerrarConexiones } from '../../src/nucleo/aislamiento'
import { agregarCampo, crearCategoria } from '../../src/modulos/categorias'
import { crearSku, listarSkus, obtenerSku } from '../../src/modulos/skus'
import { exigirEntorno } from '../apoyo/base'
import { contextoDe, crearEmpresaDePrueba, type EmpresaPrueba } from '../apoyo/servicios'

let A: EmpresaPrueba
let B: EmpresaPrueba
const codigo = async (p: Promise<unknown>) => {
  try {
    await p
    return 'OK'
  } catch (err) {
    return (err as { codigo?: string }).codigo ?? String(err)
  }
}
const camposDe = async (p: Promise<unknown>) => {
  try {
    await p
    return {}
  } catch (err) {
    return (err as { campos?: Record<string, string> }).campos ?? {}
  }
}

beforeAll(async () => {
  exigirEntorno('DATABASE_URL', 'PLATFORM_DATABASE_URL')
  A = await crearEmpresaDePrueba('QA sku A')
  B = await crearEmpresaDePrueba('QA sku B')
})
afterAll(() => cerrarConexiones())

describe('correlativo del código automático', () => {
  it('60 altas a la vez por dos usuarios en la misma categoría: 60 códigos distintos, de formato PREFIJO-0001', async () => {
    const admin = contextoDe(A, 'admin')
    const tecnico = contextoDe(A, 'tecnico')
    const cat = await crearCategoria(admin, { nombre: 'Concurrente', prefijo: 'CON', campos: [] })
    const altas = Array.from({ length: 60 }, (_, i) =>
      crearSku(i % 2 ? admin : tecnico, { categoriaId: cat.id, nombre: `Equipo ${i}`, control: i % 3 ? 'serie' : 'cantidad', valores: {} }))
    const r = await Promise.all(altas)
    const codigos = r.map((s) => s.codigo)
    expect(new Set(codigos).size).toBe(60)
    for (const c of codigos) expect(c).toMatch(/^CON-\d{4}$/)
    const numeros = codigos.map((c) => Number(c.slice(4))).sort((a, b) => a - b)
    expect(numeros[0]).toBe(1)
    expect(numeros[59]).toBeLessThanOrEqual(70) // puede haber saltos, nunca repetidos
  })

  it('las dos empresas con el MISMO prefijo llevan cuentas independientes: ambas empiezan en 0001', async () => {
    const [ca, cb] = await Promise.all([
      crearCategoria(contextoDe(A, 'admin'), { nombre: 'Laptops', prefijo: 'LAP', campos: [] }),
      crearCategoria(contextoDe(B, 'admin'), { nombre: 'Laptops', prefijo: 'LAP', campos: [] }),
    ])
    const [sa, sb] = await Promise.all([
      crearSku(contextoDe(A, 'admin'), { categoriaId: ca.id, nombre: 'Laptop A', control: 'serie', valores: {} }),
      crearSku(contextoDe(B, 'admin'), { categoriaId: cb.id, nombre: 'Laptop B', control: 'serie', valores: {} }),
    ])
    expect(sa.codigo).toBe('LAP-0001')
    expect(sb.codigo).toBe('LAP-0001')
    expect(sa.id).not.toBe(sb.id)
    expect((await listarSkus(contextoDe(A, 'admin'), { categoriaId: ca.id })).map((s) => s.nombre)).toEqual(['Laptop A'])
    expect(await codigo(obtenerSku(contextoDe(B, 'admin'), sa.id))).toBe('NO_ENCONTRADO')
  })

  it('código propio: se respeta, uno repetido se rechaza (mayúsculas/espacios no engañan), y el automático lo salta', async () => {
    const admin = contextoDe(A, 'admin')
    const cat = await crearCategoria(admin, { nombre: 'Impresoras', prefijo: 'IMP', campos: [] })
    const uno = await crearSku(admin, { categoriaId: cat.id, nombre: 'Impresora 1', control: 'serie', valores: {} })
    expect(uno.codigo).toBe('IMP-0001')
    const propio = await crearSku(admin, { categoriaId: cat.id, nombre: 'Con código propio', control: 'serie', codigo: 'imp-0002', valores: {} })
    expect(propio).toMatchObject({ codigo: 'IMP-0002', codigoPropio: true })
    for (const c of ['IMP-0002', 'imp-0002', 'Imp-0002']) {
      expect(await codigo(crearSku(admin, { categoriaId: cat.id, nombre: 'Repetido', control: 'serie', codigo: c, valores: {} })), c).toBe('DUPLICADO')
    }
    const auto = await crearSku(admin, { categoriaId: cat.id, nombre: 'Automático', control: 'serie', valores: {} })
    expect(auto.codigo).toBe('IMP-0003') // saltó el 0002 que ya estaba ocupado
  })

  it('código propio inválido: espacios, símbolos, muy corto o muy largo, vacío de verdad', async () => {
    const admin = contextoDe(A, 'admin')
    const cat = await crearCategoria(admin, { nombre: 'Varios códigos', prefijo: 'VAR', campos: [] })
    for (const c of ['A', 'con espacios', 'ñandú', "x'; DROP TABLE sku;--", 'a'.repeat(60), '<script>', '../x']) {
      expect(await codigo(crearSku(admin, { categoriaId: cat.id, nombre: 'Malo', control: 'serie', codigo: c, valores: {} })), c).toBe('VALIDACION')
    }
  })

  it('un código propio escrito a la vez que automáticos: ninguno se repite y todos se crean', async () => {
    const admin = contextoDe(A, 'admin')
    const cat = await crearCategoria(admin, { nombre: 'Mezcla', prefijo: 'MEZ', campos: [] })
    const propios = [3, 4, 5, 6].map((n) => crearSku(admin, { categoriaId: cat.id, nombre: `Propio ${n}`, control: 'serie', codigo: `MEZ-000${n}`, valores: {} }))
    const autos = Array.from({ length: 12 }, (_, i) => crearSku(contextoDe(A, 'tecnico'), { categoriaId: cat.id, nombre: `Auto ${i}`, control: 'serie', valores: {} }))
    const resultados = await Promise.allSettled([...propios, ...autos])
    const fallos = resultados.filter((r) => r.status === 'rechazada' || r.status === 'rejected')
    expect(fallos.map((f) => (f as PromiseRejectedResult).reason?.mensaje)).toEqual([])
    const codigos = resultados.map((r) => (r as PromiseFulfilledResult<{ codigo: string }>).value.codigo)
    expect(new Set(codigos).size).toBe(codigos.length)
  })
})

describe('campos personalizados: obligatorios, tipos y valores raros', () => {
  let categoriaId = ''
  beforeAll(async () => {
    const admin = contextoDe(A, 'admin')
    const c = await crearCategoria(admin, {
      nombre: 'Con campos', prefijo: 'CCM',
      campos: [
        { clave: 'procesador', etiqueta: 'Procesador', tipo: 'texto', obligatorio: true },
        { clave: 'ram_gb', etiqueta: 'RAM GB', tipo: 'numero', obligatorio: true },
        { clave: 'fecha_compra', etiqueta: 'Fecha de compra', tipo: 'fecha', obligatorio: false },
        { clave: 'disco', etiqueta: 'Disco', tipo: 'lista', opciones: ['SSD', 'HDD'], obligatorio: false },
        { clave: 'garantia', etiqueta: 'Con garantía', tipo: 'si_no', obligatorio: false },
      ],
    })
    categoriaId = c.id
  })
  const sku = (valores: Record<string, unknown>) =>
    crearSku(contextoDe(A, 'admin'), { categoriaId, nombre: 'Prueba campos', control: 'serie', valores })
  const buenos = { procesador: 'i7', ram_gb: 16 }

  it('los obligatorios vacíos se rechazan diciendo cuál (ausente, null, vacío, solo espacios)', async () => {
    for (const v of [{}, { procesador: null, ram_gb: 16 }, { procesador: '', ram_gb: 16 }, { procesador: '   ', ram_gb: 16 }, { procesador: 'i7' }, { procesador: 'i7', ram_gb: '' }]) {
      const c = await camposDe(sku(v as Record<string, unknown>))
      expect(Object.keys(c).length, JSON.stringify(v)).toBeGreaterThan(0)
    }
    expect(Object.keys(await camposDe(sku({})))).toEqual(expect.arrayContaining(['procesador', 'ram_gb']))
  })

  it('número: texto, NaN, infinito, enorme, con letras o con dos separadores se rechazan; «16» y «16,5» valen', async () => {
    for (const ram of ['abc', 'NaN', 'Infinity', 1e300, '1e5', '16 GB', '1.2.3', '--5', Number.NaN, Number.POSITIVE_INFINITY, true]) {
      expect(await codigo(sku({ ...buenos, ram_gb: ram })), String(ram)).toBe('VALIDACION')
    }
    const ok = await sku({ ...buenos, ram_gb: '16,5' })
    expect(ok.valores.ram_gb).toBe(16.5)
    expect((await sku({ ...buenos, ram_gb: '16' })).valores.ram_gb).toBe(16)
  })

  it('fecha: solo AAAA-MM-DD real. 31/12/2026, 2026-02-30, 2026-13-01, 2026-1-1, texto y números se rechazan', async () => {
    for (const f of ['31/12/2026', '2026-02-30', '2026-13-01', '2026-1-1', 'ayer', '', 20260101, '2026-02-29', '2026-12-31T10:00:00Z']) {
      if (f === '') continue // vacío = no hay valor (campo opcional)
      expect(await codigo(sku({ ...buenos, fecha_compra: f })), String(f)).toBe('VALIDACION')
    }
    expect((await sku({ ...buenos, fecha_compra: '2028-02-29' })).valores.fecha_compra).toBe('2028-02-29') // año bisiesto real
  })

  it('lista: solo una de las opciones (sin importar tildes? no: exacta); sí/no: solo verdadero o falso', async () => {
    for (const v of ['SSD ', 'ssd', 'NVMe', 5, true]) {
      if (v === 'SSD ') continue // se recorta: vale
      expect(await codigo(sku({ ...buenos, disco: v })), String(v)).toBe('VALIDACION')
    }
    for (const v of ['si', 'sí', 'yes', 1, 0, 'verdadero', 'TRUE', {}]) {
      expect(await codigo(sku({ ...buenos, garantia: v })), String(v)).toBe('VALIDACION')
    }
    const ok = await sku({ ...buenos, disco: 'SSD', garantia: 'false' })
    expect(ok.valores).toMatchObject({ disco: 'SSD', garantia: false })
  })

  it('un campo que no existe en la categoría se rechaza (no se guarda basura)', async () => {
    expect(await codigo(sku({ ...buenos, inventado: 'x' }))).toBe('VALIDACION')
    // «__proto__» (llega así desde JSON) no se guarda ni contamina nada, aunque se ignore.
    const guardado = await sku(JSON.parse('{"procesador":"i7","ram_gb":16,"__proto__":{"admin":true}}'))
    expect(Object.keys(guardado.valores).sort()).toEqual(['procesador', 'ram_gb'])
    expect(({} as Record<string, unknown>).admin).toBeUndefined()
    expect(await codigo(sku({ ...buenos, constructor: 'x' }))).toBe('VALIDACION')
  })

  it('texto demasiado largo se rechaza; texto con símbolos y HTML se guarda tal cual (sin interpretarse)', async () => {
    expect(await codigo(sku({ ...buenos, procesador: 'x'.repeat(256) }))).toBe('VALIDACION')
    const raro = `<img src=x onerror=alert(1)> ' " ; -- ñ 日本`
    expect((await sku({ ...buenos, procesador: raro })).valores.procesador).toBe(raro)
  })

  it('valores que no son un objeto (lista, texto, nulo) no rompen: se tratan como vacío y fallan por obligatorios', async () => {
    for (const v of [null, 'texto', [1, 2], 5]) {
      expect(await codigo(crearSku(contextoDe(A, 'admin'), { categoriaId, nombre: 'x', control: 'serie', valores: v as never }))).toBe('VALIDACION')
    }
  })

  it('agregar un campo OBLIGATORIO después no rompe los SKU ya creados y exige el valor en los nuevos', async () => {
    const admin = contextoDe(A, 'admin')
    const viejo = await sku(buenos)
    await agregarCampo(admin, { categoriaId, campo: { clave: 'serie_interna', etiqueta: 'Serie interna', tipo: 'texto', obligatorio: true } })
    expect((await obtenerSku(admin, viejo.id)).id).toBe(viejo.id) // se sigue pudiendo leer
    expect(Object.keys(await camposDe(sku(buenos)))).toContain('serie_interna')
    expect((await sku({ ...buenos, serie_interna: 'X1' })).valores.serie_interna).toBe('X1')
  })

  it('definiciones de campo inválidas al crear la categoría: clave mala, tipo falso, lista sin opciones, claves repetidas, más de 40', async () => {
    const admin = contextoDe(A, 'admin')
    const cat = (campos: unknown[], prefijo = 'ZZ1') => crearCategoria(admin, { nombre: `Cat ${Math.random()}`, prefijo, campos: campos as never })
    expect(await codigo(cat([{ clave: 'Mal Clave', etiqueta: 'x', tipo: 'texto' }]))).toBe('VALIDACION')
    expect(await codigo(cat([{ clave: 'a', etiqueta: 'x', tipo: 'inventado' }]))).toBe('VALIDACION')
    expect(await codigo(cat([{ clave: 'a', etiqueta: 'x', tipo: 'lista', opciones: [] }]))).toBe('VALIDACION')
    expect(await codigo(cat([{ clave: 'a', etiqueta: 'x', tipo: 'lista', opciones: ['', '  '] }]))).toBe('VALIDACION')
    expect(await codigo(cat([{ clave: 'a', etiqueta: 'x', tipo: 'texto' }, { clave: 'a', etiqueta: 'y', tipo: 'texto' }]))).toBe('VALIDACION')
    expect(await codigo(cat(Array.from({ length: 41 }, (_, i) => ({ clave: `c${i}`, etiqueta: `C${i}`, tipo: 'texto' }))))).toBe('VALIDACION')
    expect(await codigo(cat([{ clave: 'a', etiqueta: '', tipo: 'texto' }]))).toBe('VALIDACION')
    // prefijos
    for (const p of ['A', 'ABCDEF', 'oc', 'OC', 'RCP', 'a b', 'ñ1']) expect(await codigo(crearCategoria(admin, { nombre: `P ${p}`, prefijo: p, campos: [] })), p).toMatch(/VALIDACION/)
  })
})
