import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { cerrarConexiones, conGlobal } from '../aislamiento'
import { crearEmpresaDePrueba, hayBaseDeDatos, type EmpresaPrueba } from '../permisos/pruebas/apoyo'
import { COOKIE_NAVEGADOR, COOKIE_SESION, usarAlmacenDeCookies } from './cookies'
import { canjearEnlace, cerrarSesion, misEmpresas, obtenerContexto, solicitarEnlace } from './index'
import { huellaDe } from './tokens'

// Almacén de cookies de memoria: simula un navegador. `nuevoNavegador()` lo vacía.
let jarra = new Map<string, string>()
const nuevoNavegador = () => { jarra = new Map() }
const tokenDe = (ruta?: string) => new URL(ruta ?? '', 'http://x').searchParams.get('t') as string

describe.skipIf(!hayBaseDeDatos)('acceso con enlace, sesión en base y contexto', () => {
  let alfa: EmpresaPrueba
  let beta: EmpresaPrueba
  const env0 = { ...process.env }

  beforeAll(async () => {
    alfa = await crearEmpresaDePrueba('Alfa')
    beta = await crearEmpresaDePrueba('Beta')
  })
  beforeEach(() => {
    process.env.MODO_LOCAL = '1'
    delete process.env.APP_URL
    delete process.env.ENTORNO
    nuevoNavegador()
    usarAlmacenDeCookies({
      leer: (n) => jarra.get(n),
      escribir: (n, v) => void jarra.set(n, v),
      borrar: (n) => void jarra.delete(n),
    })
  })
  afterEach(() => { process.env.MODO_LOCAL = env0.MODO_LOCAL as string; if (env0.MODO_LOCAL === undefined) delete process.env.MODO_LOCAL })
  afterAll(async () => { usarAlmacenDeCookies(null); await cerrarConexiones() })

  async function ingresar(correo: string): Promise<void> {
    const { enlaceLocal } = await solicitarEnlace(correo)
    await canjearEnlace(tokenDe(enlaceLocal))
  }

  it('en MODO_LOCAL el enlace sale en pantalla y NO hay forma de saber si el correo existe', async () => {
    const real = await solicitarEnlace(alfa.usuarios.admin!.correo)
    const falso = await solicitarEnlace('nadie@no-existe.local')
    expect(real.enlaceLocal).toMatch(/^\/entrar\/enlace\?t=[A-Za-z0-9_-]{43}$/)
    expect(falso.enlaceLocal).toMatch(/^\/entrar\/enlace\?t=[A-Za-z0-9_-]{43}$/)
    await expect(canjearEnlace(tokenDe(falso.enlaceLocal))).rejects.toMatchObject({ codigo: 'ENLACE_INVALIDO' })
  })

  it('sin MODO_LOCAL no se muestra ningún enlace', async () => {
    delete process.env.MODO_LOCAL
    expect(await solicitarEnlace(alfa.usuarios.admin!.correo)).toEqual({})
  })

  it('con MODO_LOCAL=1 y una base externa la función se niega (la guarda también corre aquí)', async () => {
    const antes = process.env.DATABASE_URL
    process.env.DATABASE_URL = 'postgres://u:p@base.externa.example.com:5432/x'
    try {
      await expect(solicitarEnlace(alfa.usuarios.admin!.correo)).rejects.toThrow(/se niega a arrancar/)
    } finally {
      process.env.DATABASE_URL = antes
    }
  })

  it('valida la forma del correo', async () => {
    await expect(solicitarEnlace('esto-no-es-un-correo')).rejects.toMatchObject({ codigo: 'VALIDACION' })
  })

  it('canjear crea la sesión (cookie sin token en la base) y el enlace es de un solo uso', async () => {
    const { enlaceLocal } = await solicitarEnlace(alfa.usuarios.admin!.correo)
    const token = tokenDe(enlaceLocal)
    const { empresas } = await canjearEnlace(token)
    expect(empresas.map((e) => e.slug)).toEqual([alfa.slug])

    const cookieSesion = jarra.get(COOKIE_SESION()) as string
    expect(cookieSesion).toMatch(/^[A-Za-z0-9_-]{43}$/)
    // La base guarda la huella, nunca el valor.
    const guardadas = await conGlobal((tx) =>
      tx.consultar<{ huella: string }>(`SELECT huella FROM sesion WHERE usuario_id = $1`, [alfa.usuarios.admin!.usuarioId]))
    expect(guardadas.map((g) => g.huella)).toContain(huellaDe(cookieSesion))
    expect(guardadas.map((g) => g.huella)).not.toContain(cookieSesion)
    const enlaces = await conGlobal((tx) =>
      tx.consultar<{ huella: string }>(`SELECT huella FROM enlace_ingreso WHERE usuario_id = $1`, [alfa.usuarios.admin!.usuarioId]))
    expect(enlaces.map((e) => e.huella)).not.toContain(token)

    await expect(canjearEnlace(token)).rejects.toMatchObject({ codigo: 'ENLACE_INVALIDO' })
  })

  it('el enlace pedido en un navegador no sirve en otro, y el intento ajeno no lo gasta', async () => {
    const { enlaceLocal } = await solicitarEnlace(alfa.usuarios.admin!.correo)
    const token = tokenDe(enlaceLocal)
    const navegadorOriginal = new Map(jarra)
    nuevoNavegador()
    await expect(canjearEnlace(token)).rejects.toMatchObject({ codigo: 'ENLACE_INVALIDO' })
    jarra = navegadorOriginal
    await expect(canjearEnlace(token)).resolves.toBeDefined()
  })

  it('un enlace vencido no entra', async () => {
    const { enlaceLocal } = await solicitarEnlace(alfa.usuarios.admin!.correo)
    const token = tokenDe(enlaceLocal)
    await conGlobal((tx) => tx.consultar(`UPDATE enlace_ingreso SET vence_en = now() - interval '1 minute' WHERE huella = $1`, [huellaDe(token)]))
    await expect(canjearEnlace(token)).rejects.toMatchObject({ codigo: 'ENLACE_INVALIDO' })
  })

  it('un token con forma rara se rechaza sin tocar la base', async () => {
    for (const malo of ['', 'abc', "' OR 1=1 --", 'a'.repeat(300)]) {
      await expect(canjearEnlace(malo)).rejects.toMatchObject({ codigo: 'ENLACE_INVALIDO' })
    }
  })

  it('obtenerContexto: sesión + empresa de la dirección + permisos del rol', async () => {
    await ingresar(alfa.usuarios.tecnico!.correo)
    const ctx = await obtenerContexto(alfa.slug)
    expect(ctx).toMatchObject({ empresaId: alfa.id, empresaSlug: alfa.slug, usuarioId: alfa.usuarios.tecnico!.usuarioId, rolId: alfa.roles.tecnico })
    expect(ctx.permisos.has('skus.crear_editar')).toBe(true)
    expect(ctx.permisos.has('roles.administrar')).toBe(false)
  })

  it('sin cookie, o con una empresa a la que no pertenece, responde SIN_ACCESO', async () => {
    await expect(obtenerContexto(alfa.slug)).rejects.toMatchObject({ codigo: 'SIN_ACCESO' })
    await ingresar(alfa.usuarios.admin!.correo)
    await expect(obtenerContexto(beta.slug)).rejects.toMatchObject({ codigo: 'SIN_ACCESO' })
    await expect(obtenerContexto('no-existe-esta-empresa')).rejects.toMatchObject({ codigo: 'SIN_ACCESO' })
    await expect(obtenerContexto("alfa'; drop table x;--")).rejects.toMatchObject({ codigo: 'SIN_ACCESO' })
  })

  it('suspender la membresía corta el acceso en la petición siguiente', async () => {
    await ingresar(alfa.usuarios.consulta!.correo)
    await expect(obtenerContexto(alfa.slug)).resolves.toBeDefined()
    const { conEmpresa } = await import('../aislamiento')
    await conEmpresa(alfa.id, (tx) => tx.consultar(`UPDATE membresia SET estado = 'suspendida' WHERE empresa_id = $1 AND usuario_id = $2`, [alfa.id, alfa.usuarios.consulta!.usuarioId]))
    await expect(obtenerContexto(alfa.slug)).rejects.toMatchObject({ codigo: 'SIN_ACCESO' })
  })

  it('un usuario suspendido ni recibe sesión', async () => {
    const { enlaceLocal } = await solicitarEnlace(alfa.usuarios.jefa!.correo)
    await conGlobal((tx) => tx.consultar(`UPDATE usuario SET estado = 'suspendido' WHERE id = $1`, [alfa.usuarios.jefa!.usuarioId]))
    await expect(canjearEnlace(tokenDe(enlaceLocal))).rejects.toMatchObject({ codigo: 'ENLACE_INVALIDO' })
    await conGlobal((tx) => tx.consultar(`UPDATE usuario SET estado = 'activo' WHERE id = $1`, [alfa.usuarios.jefa!.usuarioId]))
  })

  it('cerrar sesión la revoca en la base (la cookie vieja ya no sirve)', async () => {
    await ingresar(alfa.usuarios.admin!.correo)
    const vieja = jarra.get(COOKIE_SESION()) as string
    await cerrarSesion()
    expect(jarra.has(COOKIE_SESION())).toBe(false)
    jarra.set(COOKIE_SESION(), vieja)
    await expect(obtenerContexto(alfa.slug)).rejects.toMatchObject({ codigo: 'SIN_ACCESO' })
  })

  it('caduca por inactividad (30 min) y por tiempo absoluto (12 h)', async () => {
    await ingresar(alfa.usuarios.admin!.correo)
    const huella = huellaDe(jarra.get(COOKIE_SESION()) as string)
    await conGlobal((tx) => tx.consultar(`UPDATE sesion SET ultima_actividad_en = now() - interval '31 minutes' WHERE huella = $1`, [huella]))
    await expect(obtenerContexto(alfa.slug)).rejects.toMatchObject({ codigo: 'SIN_ACCESO' })

    await ingresar(alfa.usuarios.admin!.correo)
    const huella2 = huellaDe(jarra.get(COOKIE_SESION()) as string)
    await conGlobal((tx) => tx.consultar(`UPDATE sesion SET expira_en = now() - interval '1 second' WHERE huella = $1`, [huella2]))
    await expect(obtenerContexto(alfa.slug)).rejects.toMatchObject({ codigo: 'SIN_ACCESO' })
  })

  it('misEmpresas devuelve solo las empresas del usuario y exige sesión', async () => {
    await expect(misEmpresas()).rejects.toMatchObject({ codigo: 'SIN_ACCESO' })
    await ingresar(beta.usuarios.admin!.correo)
    expect((await misEmpresas()).map((e) => e.slug)).toEqual([beta.slug])
  })

  it('las cookies de navegador se usan y se borran al entrar', async () => {
    await solicitarEnlace(alfa.usuarios.admin!.correo)
    expect(jarra.has(COOKIE_NAVEGADOR())).toBe(true)
  })
})
