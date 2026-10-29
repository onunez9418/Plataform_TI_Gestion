// Integración de las ACCIONES de pantalla (src/app/**/acciones.ts) con los servicios y la base real:
// comprueba que cada formulario llega al servicio con los datos correctos y que el servidor rechaza
// lo que el rol no puede hacer. Se salta si no hay base (como las demás pruebas con base real).
// Para correrla: base local encendida (npm run local -- --solo-base) y las variables del entorno cargadas.
import { createHash, randomBytes } from 'node:crypto'
import pg from 'pg'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { hayBaseDeDatos } from '@/nucleo/permisos/pruebas/apoyo'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: (u: string) => { throw Object.assign(new Error('NEXT_REDIRECT'), { digest: `NEXT_REDIRECT;${u}` }) } }))

import { usarAlmacenDeCookies } from '@/nucleo/acceso/cookies'
import { COOKIE_SESION } from '@/nucleo/acceso/cookies'

const cookies = new Map<string, string>()
usarAlmacenDeCookies({ leer: (n) => cookies.get(n), escribir: (n, v) => { cookies.set(n, v) }, borrar: (n) => { cookies.delete(n) } })

async function sesionDe(correo: string) {
  const token = randomBytes(32).toString('base64url')
  const c = new pg.Client({ connectionString: process.env.MIGRATION_DATABASE_URL })
  await c.connect()
  const u = await c.query('select id from usuario where correo_norm = $1', [correo])
  await c.query("insert into sesion (usuario_id, huella, expira_en, ultima_actividad_en) values ($1,$2, now() + interval '2 hours', now())", [u.rows[0].id, createHash('sha256').update(token).digest('hex')])
  await c.end()
  cookies.set(COOKIE_SESION(), token)
}

function fd(o: Record<string, string | string[]>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(o)) for (const x of Array.isArray(v) ? v : [v]) f.append(k, x)
  return f
}

const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase()

const hayMigraciones = Boolean(process.env.MIGRATION_DATABASE_URL)

describe.skipIf(!hayBaseDeDatos || !hayMigraciones)('acciones de pantalla (Alfa, como administrador)', () => {
  beforeAll(async () => { await sesionDe('ceo@demo.local') })

  it('catálogos: crea, edita y desactiva', async () => {
    const { crearItem, editarItem } = await import('@/app/e/[empresa]/catalogos/[tipo]/acciones')
    const { listarUbicaciones, listarPersonas, listarProveedores } = await import('@/modulos/catalogos')
    const { obtenerContexto } = await import('@/nucleo/acceso')
    const ctx = await obtenerContexto('alfa')
    const u = await crearItem('alfa', 'ubicaciones', fd({ nombre: `Piso ${sufijo}`, descripcion: 'Segundo piso' }))
    expect(u.ok).toBe(true)
    const p = await crearItem('alfa', 'proveedores', fd({ nombre: `Prov ${sufijo}`, documento: `20${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}` }))
    expect(p.ok).toBe(true)
    const pe = await crearItem('alfa', 'personas', fd({ nombre: `Persona ${sufijo}`, correo: `p${sufijo}@alfa.local`, area: 'Ventas' }))
    expect(pe.ok).toBe(true)
    const rep = await crearItem('alfa', 'ubicaciones', fd({ nombre: `Piso ${sufijo}` }))
    expect(rep.ok).toBe(false)
    const ub = (await listarUbicaciones(ctx)).find((x) => x.nombre === `Piso ${sufijo}`)!
    const ed = await editarItem('alfa', 'ubicaciones', ub.id, fd({ nombre: `Piso ${sufijo} B`, descripcion: '' }))
    expect(ed.ok).toBe(true)
    const despues = (await listarUbicaciones(ctx)).find((x) => x.id === ub.id)!
    expect(despues).toMatchObject({ nombre: `Piso ${sufijo} B`, descripcion: null, activo: false })
    expect((await listarProveedores(ctx)).some((x) => x.nombre === `Prov ${sufijo}`)).toBe(true)
    expect((await listarPersonas(ctx)).some((x) => x.nombre === `Persona ${sufijo}`)).toBe(true)
    const malTipo = await crearItem('alfa', 'otros', fd({ nombre: 'x' }))
    expect(malTipo.ok).toBe(false)
  })

  let categoriaId = ''
  it('categorías: crea con campos y agrega un campo', async () => {
    const { crear, agregar } = await import('@/app/e/[empresa]/categorias/acciones')
    const { listarCategorias } = await import('@/modulos/categorias')
    const { obtenerContexto } = await import('@/nucleo/acceso')
    const ctx = await obtenerContexto('alfa')
    const campos = [
      { clave: 'paginas', etiqueta: 'Páginas por minuto', tipo: 'numero', obligatorio: true },
      { clave: 'tinta', etiqueta: 'Tipo de tinta', tipo: 'lista', opciones: ['Láser', 'Inyección'], obligatorio: false },
    ]
    const r = await crear('alfa', fd({ nombre: `Impresoras ${sufijo}`, prefijo: `I${sufijo}`, campos: JSON.stringify(campos) }))
    expect(r.ok, JSON.stringify(r)).toBe(true)
    const cat = (await listarCategorias(ctx)).find((c) => c.nombre === `Impresoras ${sufijo}`)!
    categoriaId = cat.id
    expect(cat.campos.map((c) => c.clave)).toEqual(['paginas', 'tinta'])
    const a = await agregar('alfa', cat.id, fd({ campos: JSON.stringify([{ clave: 'color', etiqueta: 'A color', tipo: 'si_no', obligatorio: false }]) }))
    expect(a.ok, JSON.stringify(a)).toBe(true)
    const mal = await crear('alfa', fd({ nombre: 'Sin prefijo', prefijo: '', campos: '[]' }))
    expect(mal.ok).toBe(false)
    if (!mal.ok) expect(mal.error.mensaje.length).toBeGreaterThan(5)
  })

  let skuId = ''
  it('SKU: código automático, código propio, duplicado y campo obligatorio', async () => {
    const { crear } = await import('@/app/e/[empresa]/skus/acciones')
    const auto = await crear('alfa', fd({ categoriaId, nombre: 'Impresora láser', control: 'serie', valores: JSON.stringify({ paginas: 30, tinta: 'Láser', color: true }) }))
    expect(auto.ok, JSON.stringify(auto)).toBe(true)
    if (auto.ok) expect(auto.datos.codigo).toMatch(new RegExp(`^I${sufijo}-0001$`))
    const propio = await crear('alfa', fd({ categoriaId, nombre: 'Impresora especial', control: 'cantidad', codigo: `ESP-${sufijo}`, valores: JSON.stringify({ paginas: 10 }) }))
    expect(propio.ok, JSON.stringify(propio)).toBe(true)
    const dup = await crear('alfa', fd({ categoriaId, nombre: 'Otra', control: 'serie', codigo: `ESP-${sufijo}`, valores: JSON.stringify({ paginas: 10 }) }))
    expect(dup.ok).toBe(false)
    if (!dup.ok) expect(dup.error.codigo).toBe('DUPLICADO')
    const sinObligatorio = await crear('alfa', fd({ categoriaId, nombre: 'Falta dato', control: 'serie', valores: '{}' }))
    expect(sinObligatorio.ok).toBe(false)
    const { listarSkus } = await import('@/modulos/skus')
    const { obtenerContexto } = await import('@/nucleo/acceso')
    skuId = (await listarSkus(await obtenerContexto('alfa'), { texto: 'Impresora láser' }))[0].id
  })

  it('inventario: registra con series, rechaza repetidas, asigna y devuelve', async () => {
    const { registrar } = await import('@/app/e/[empresa]/inventario/acciones')
    const { asignar, devolver } = await import('@/app/e/[empresa]/inventario/[id]/acciones')
    const { listarUbicaciones, listarPersonas } = await import('@/modulos/catalogos')
    const { listarActivos } = await import('@/modulos/inventario')
    const { obtenerContexto } = await import('@/nucleo/acceso')
    const ctx = await obtenerContexto('alfa')
    const ubic = (await listarUbicaciones(ctx)).find((u) => u.activo)!
    const persona = (await listarPersonas(ctx)).find((p) => p.activo)!
    const ok = await registrar('alfa', fd({ skuId, ubicacionId: ubic.id, series: JSON.stringify([`S1-${sufijo}`, `S2-${sufijo}`, `S3-${sufijo}`]) }))
    expect(ok.ok, JSON.stringify(ok)).toBe(true)
    const rep = await registrar('alfa', fd({ skuId, ubicacionId: ubic.id, series: JSON.stringify([`S1-${sufijo}`, `NUEVA-${sufijo}`]) }))
    expect(rep.ok).toBe(false)
    if (!rep.ok) { expect(rep.error.mensaje).toContain(`S1-${sufijo}`); expect(rep.error.campos?.series).toBeTruthy() }
    const activo = (await listarActivos(ctx, { skuId })).find((x) => x.serie === `S1-${sufijo}`)!
    expect((await asignar('alfa', activo.id, fd({ personaId: persona.id }))).ok).toBe(true)
    const otraVez = await asignar('alfa', activo.id, fd({ personaId: persona.id }))
    expect(otraVez.ok).toBe(false)
    expect((await devolver('alfa', activo.id, fd({ ubicacionId: ubic.id }))).ok).toBe(true)
  })

  it('roles y usuarios: crea un rol de solo lectura, invita, cambia rol y suspende', async () => {
    const { crear, editar } = await import('@/app/e/[empresa]/roles/acciones')
    const { invitar, cambiarRolDe, suspenderA } = await import('@/app/e/[empresa]/usuarios/acciones')
    const { listarRoles } = await import('@/modulos/roles')
    const { listarUsuarios } = await import('@/modulos/usuarios')
    const { obtenerContexto } = await import('@/nucleo/acceso')
    const ctx = await obtenerContexto('alfa')
    const r = await crear('alfa', fd({ nombre: `Solo lectura ${sufijo}`, permisos: ['skus.ver', 'activos.ver'] }))
    expect(r.ok, JSON.stringify(r)).toBe(true)
    const rol = (await listarRoles(ctx)).find((x) => x.nombre === `Solo lectura ${sufijo}`)!
    expect(rol.permisos.sort()).toEqual(['activos.ver', 'skus.ver'])
    expect((await editar('alfa', rol.id, fd({ nombre: `Solo lectura ${sufijo}`, permisos: ['skus.ver'] }))).ok).toBe(true)
    const inv = await invitar('alfa', fd({ nombre: `Nuevo ${sufijo}`, correo: `n${sufijo.toLowerCase()}@alfa.local`, rolId: rol.id }))
    expect(inv.ok, JSON.stringify(inv)).toBe(true)
    if (inv.ok) expect(inv.datos.ruta).toMatch(/^\/entrar\/enlace\?t=/)
    const u = (await listarUsuarios(ctx)).find((x) => x.nombre === `Nuevo ${sufijo}`)!
    const tec = (await listarRoles(ctx)).find((x) => x.nombre === 'Técnico')!
    expect((await cambiarRolDe('alfa', u.usuarioId, tec.id)).ok).toBe(true)
    expect((await suspenderA('alfa', u.usuarioId)).ok).toBe(true)
  })

  it('compras: la autoaprobación se rechaza, otra persona aprueba y la recepción crea los equipos', async () => {
    const { crear } = await import('@/app/e/[empresa]/compras/acciones')
    const { enviar, aprobar, rechazar, recibir } = await import('@/app/e/[empresa]/compras/[id]/acciones')
    const { listarProveedores, listarUbicaciones } = await import('@/modulos/catalogos')
    const { listarSkus } = await import('@/modulos/skus')
    const { obtenerOrden } = await import('@/modulos/compras')
    const { listarActivos } = await import('@/modulos/inventario')
    const { obtenerContexto } = await import('@/nucleo/acceso')
    await sesionDe('ceo@demo.local')
    const ctx = await obtenerContexto('alfa')
    const prov = (await listarProveedores(ctx)).find((p) => p.activo)!
    const ubic = (await listarUbicaciones(ctx)).find((u) => u.activo)!
    const lap = (await listarSkus(ctx, { texto: 'LAP-0001' }))[0]
    const lineas = JSON.stringify([{ skuId: lap.id, cantidad: 2, precioUnitario: 3500 }])

    const creada = await crear('alfa', fd({ proveedorId: prov.id, lineas }))
    expect(creada.ok, JSON.stringify(creada)).toBe(true)
    if (!creada.ok) return
    const id = creada.datos.id
    expect((await enviar('alfa', id)).ok).toBe(true)

    const propia = await aprobar('alfa', id)
    expect(propia.ok).toBe(false)
    if (!propia.ok) expect(propia.error.codigo).toBe('SEPARACION_FUNCIONES')

    await sesionDe('jefa@alfa.local')
    const sinMotivo = await rechazar('alfa', id, fd({ motivo: '' }))
    expect(sinMotivo.ok).toBe(false)
    const ok = await aprobar('alfa', id)
    expect(ok.ok, JSON.stringify(ok)).toBe(true)
    // la Jefatura no recibe mercadería: el servidor lo rechaza
    const noRecibe = await recibir('alfa', id, fd({ ubicacionId: ubic.id, lineaId: 'x' }))
    expect(noRecibe.ok).toBe(false)

    await sesionDe('tecnico@alfa.local')
    const orden = await obtenerOrden(await obtenerContexto('alfa'), id)
    const linea = orden.lineas[0]
    const sinSeries = await recibir('alfa', id, fd({ ubicacionId: ubic.id, lineaId: linea.id, [`cantidad_${linea.id}`]: '2' }))
    expect(sinSeries.ok).toBe(false)
    const parcial = await recibir('alfa', id, fd({ ubicacionId: ubic.id, lineaId: linea.id, [`cantidad_${linea.id}`]: '1', [`series_${linea.id}`]: JSON.stringify([`OC1-${sufijo}`]) }))
    expect(parcial.ok, JSON.stringify(parcial)).toBe(true)
    const resto = await recibir('alfa', id, fd({ ubicacionId: ubic.id, lineaId: linea.id, [`cantidad_${linea.id}`]: '1', [`series_${linea.id}`]: JSON.stringify([`OC2-${sufijo}`]) }))
    expect(resto.ok, JSON.stringify(resto)).toBe(true)
    const final = await obtenerOrden(await obtenerContexto('alfa'), id)
    expect(final.estado).toBe('recibida')
    const nacidos = (await listarActivos(await obtenerContexto('alfa'), { texto: sufijo })).filter((a) => a.serie.startsWith('OC'))
    expect(nacidos).toHaveLength(2)
  })

  it('un usuario de solo lectura es rechazado por el servidor (no solo oculto)', async () => {
    const { crearItem } = await import('@/app/e/[empresa]/catalogos/[tipo]/acciones')
    const { crear } = await import('@/app/e/[empresa]/roles/acciones')
    await sesionDe('consulta@alfa.local')
    const a = await crearItem('alfa', 'ubicaciones', fd({ nombre: 'No debería' }))
    expect(a.ok).toBe(false)
    if (!a.ok) expect(a.error.codigo).toBe('SIN_PERMISO')
    const b = await crear('alfa', fd({ nombre: 'Intruso', permisos: ['skus.ver'] }))
    expect(b.ok).toBe(false)
    const c = await crearItem('beta', 'ubicaciones', fd({ nombre: 'Ajena' }))
    expect(c.ok).toBe(false)
    if (!c.ok) expect(c.error.codigo).toBe('SIN_ACCESO')
  })
})
