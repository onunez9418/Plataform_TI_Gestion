// QA · Ingreso por enlace y sesión, contra la base real, con «navegadores» independientes.
// Busca: enlace reutilizable, enlace usable desde otro navegador, sesión que sobrevive a una suspensión,
// empresa ajena por la dirección, y respuestas que delatan si un correo existe.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { canjearEnlace, cerrarSesion, misEmpresas, obtenerContexto, solicitarEnlace } from '../../src/nucleo/acceso'
import { cerrarConexiones } from '../../src/nucleo/aislamiento'
import { suspender } from '../../src/modulos/usuarios'
import { clienteApp, exigirEntorno } from '../apoyo/base'
import { Navegador, tokenDeEnlace } from '../apoyo/navegadores'
import { contextoDe, crearEmpresaDePrueba, type EmpresaPrueba } from '../apoyo/servicios'

let E1: EmpresaPrueba // empresa de la víctima
let E2: EmpresaPrueba // otra empresa
beforeAll(async () => {
  exigirEntorno('DATABASE_URL', 'PLATFORM_DATABASE_URL')
  process.env.MODO_LOCAL = '1'
  E1 = await crearEmpresaDePrueba('QA acceso uno')
  E2 = await crearEmpresaDePrueba('QA acceso dos')
})
afterAll(() => cerrarConexiones())

const codigo = async (p: Promise<unknown>) => {
  try {
    await p
    return 'OK'
  } catch (err) {
    return (err as { codigo?: string }).codigo ?? String(err)
  }
}
const mensaje = async (p: Promise<unknown>) => {
  try {
    await p
    return ''
  } catch (err) {
    return (err as { mensaje?: string }).mensaje ?? String(err)
  }
}

/** Pide el enlace y entra, como lo haría una persona en su navegador. */
async function ingresar(nav: Navegador, correo: string) {
  const { enlaceLocal } = await nav.usando(() => solicitarEnlace(correo))
  expect(enlaceLocal, 'en modo local debe salir el enlace').toBeTruthy()
  const r = await nav.usando(() => canjearEnlace(tokenDeEnlace(enlaceLocal!)))
  return { enlace: enlaceLocal!, empresas: r.empresas }
}

describe('ingreso básico', () => {
  it('pedir enlace, canjearlo y entrar a SU empresa', async () => {
    const nav = new Navegador()
    const { empresas } = await ingresar(nav, E1.usuarios.admin!.correo)
    expect(empresas.map((x) => x.slug)).toEqual([E1.slug])
    const ctx = await nav.usando(() => obtenerContexto(E1.slug))
    expect(ctx.empresaId).toBe(E1.id)
    expect(ctx.permisos.has('roles.administrar')).toBe(true)
  })

  it('la cookie de sesión no guarda el token en la base (solo la huella)', async () => {
    const nav = new Navegador()
    await ingresar(nav, E1.usuarios.tecnico!.correo)
    const token = nav.galletas.get('sid')!
    expect(token).toBeTruthy()
    const c = await clienteApp()
    try {
      const r = await c.query(`SELECT count(*)::int AS n FROM sesion WHERE huella = $1`, [token])
      expect(r.rows[0].n, 'el token de sesión está en la base en claro').toBe(0)
      const e = await c.query(`SELECT count(*)::int AS n FROM enlace_ingreso WHERE huella = $1`, [token])
      expect(e.rows[0].n).toBe(0)
    } finally {
      await c.end()
    }
  })
})

describe('el enlace es de un solo uso y de un solo navegador', () => {
  it('canjearlo dos veces falla la segunda (mismo navegador y otro navegador)', async () => {
    const nav = new Navegador()
    const { enlace } = await ingresar(nav, E1.usuarios.consulta!.correo)
    const t = tokenDeEnlace(enlace)
    expect(await nav.usando(() => codigo(canjearEnlace(t)))).toBe('ENLACE_INVALIDO')
    const otro = nav.clonar()
    expect(await otro.usando(() => codigo(canjearEnlace(t)))).toBe('ENLACE_INVALIDO')
    expect(await new Navegador().usando(() => codigo(canjearEnlace(t)))).toBe('ENLACE_INVALIDO')
  })

  it('un enlace pedido en un navegador no sirve en otro, y el intento ajeno no lo gasta', async () => {
    const victima = new Navegador()
    const intruso = new Navegador()
    const { enlaceLocal } = await victima.usando(() => solicitarEnlace(E1.usuarios.jefa!.correo))
    const t = tokenDeEnlace(enlaceLocal!)
    expect(await intruso.usando(() => codigo(canjearEnlace(t)))).toBe('ENLACE_INVALIDO')
    expect(intruso.galletas.get('sid')).toBeUndefined()
    // Sin ninguna cookie de navegador (alguien que solo tiene la dirección) tampoco.
    expect(await new Navegador().usando(() => codigo(canjearEnlace(t)))).toBe('ENLACE_INVALIDO')
    // La víctima todavía puede usarlo.
    const r = await victima.usando(() => canjearEnlace(t))
    expect(r.empresas.length).toBe(1)
  })

  it('10 canjes simultáneos del mismo enlace: exactamente UNA sesión', async () => {
    const nav = new Navegador()
    const { enlaceLocal } = await nav.usando(() => solicitarEnlace(E1.usuarios.tecnico!.correo))
    const t = tokenDeEnlace(enlaceLocal!)
    const copias = Array.from({ length: 10 }, () => nav.clonar())
    const r = await Promise.allSettled(copias.map((n) => n.usando(() => canjearEnlace(t))))
    expect(r.filter((x) => x.status === 'fulfilled')).toHaveLength(1)
  })

  it('el enlace vencido no entra', async () => {
    const nav = new Navegador()
    const { enlaceLocal } = await nav.usando(() => solicitarEnlace(E1.usuarios.consulta!.correo))
    const c = await clienteApp()
    try {
      await c.query(`UPDATE enlace_ingreso SET vence_en = now() - interval '1 minute' WHERE usuario_id = $1 AND consumido_en IS NULL`, [E1.usuarios.consulta!.usuarioId])
    } finally {
      await c.end()
    }
    expect(await nav.usando(() => codigo(canjearEnlace(tokenDeEnlace(enlaceLocal!))))).toBe('ENLACE_INVALIDO')
  })

  it('tokens con forma rara o inventados se rechazan', async () => {
    const nav = new Navegador()
    for (const t of ['', 'x', 'a'.repeat(43), '../../etc/passwd', "' OR '1'='1", 'a'.repeat(1000), '%00', null as unknown as string]) {
      expect(await nav.usando(() => codigo(canjearEnlace(t))), String(t).slice(0, 20)).toBe('ENLACE_INVALIDO')
    }
  })

  it('un correo que no existe recibe un enlace señuelo igual de bonito, que no canjea', async () => {
    const nav = new Navegador()
    const real = await nav.usando(() => solicitarEnlace(E1.usuarios.admin!.correo))
    const falso = await nav.usando(() => solicitarEnlace('no.existe.nunca@prueba.local'))
    expect(falso.enlaceLocal).toBeTruthy()
    expect(Object.keys(falso)).toEqual(Object.keys(real))
    expect(falso.enlaceLocal!.length).toBe(real.enlaceLocal!.length)
    expect(falso.enlaceLocal!.replace(/t=.*/, '')).toBe(real.enlaceLocal!.replace(/t=.*/, ''))
    expect(await nav.usando(() => codigo(canjearEnlace(tokenDeEnlace(falso.enlaceLocal!))))).toBe('ENLACE_INVALIDO')
  })

  it('el enlace no sirve como cookie de sesión, ni la cookie de navegador como sesión', async () => {
    const nav = new Navegador()
    const { enlaceLocal } = await nav.usando(() => solicitarEnlace(E1.usuarios.admin!.correo))
    const falso = new Navegador()
    falso.galletas.set('sid', tokenDeEnlace(enlaceLocal!))
    expect(await falso.usando(() => codigo(obtenerContexto(E1.slug)))).toBe('SIN_ACCESO')
    const otro = new Navegador()
    otro.galletas.set('sid', nav.galletas.get('nav')!)
    expect(await otro.usando(() => codigo(obtenerContexto(E1.slug)))).toBe('SIN_ACCESO')
  })

  it('correos mal escritos o con trucos no devuelven enlace', async () => {
    const nav = new Navegador()
    for (const c of ['', 'sin-arroba', 'a@b', ' ', "x'; DROP TABLE usuario;--@a.com", 'a b@c.com']) {
      expect(await nav.usando(() => codigo(solicitarEnlace(c))), c).toBe('VALIDACION')
    }
  })

  it('el correo se reconoce sin importar mayúsculas ni espacios', async () => {
    const nav = new Navegador()
    const { enlaceLocal } = await nav.usando(() => solicitarEnlace(`  ${E1.usuarios.admin!.correo.toUpperCase()} `))
    const r = await nav.usando(() => canjearEnlace(tokenDeEnlace(enlaceLocal!)))
    expect(r.empresas).toHaveLength(1)
  })
})

describe('empresa de la dirección: nadie entra a la que no es suya', () => {
  it('con sesión de la empresa 1, pedir la empresa 2 (o una que no existe o con trucos) da el MISMO SIN_ACCESO', async () => {
    const nav = new Navegador()
    await ingresar(nav, E1.usuarios.admin!.correo)
    const intentos = [E2.slug, 'no-existe-nunca', E2.slug.toUpperCase(), ` ${E2.slug} `, `${E2.slug}'--`, `../${E2.slug}`, `${E1.slug}/../${E2.slug}`, '', 'a'.repeat(200), E2.id, '%00', `${E1.slug}%0a${E2.slug}`]
    const mensajes = new Set<string>()
    for (const s of intentos) {
      const m = await nav.usando(() => mensaje(obtenerContexto(s)))
      // La propia empresa en mayúsculas o con espacios se admite (se normaliza); lo demás, no.
      if (s.trim().toLowerCase() === E1.slug) continue
      expect(await nav.usando(() => codigo(obtenerContexto(s))), JSON.stringify(s)).toBe('SIN_ACCESO')
      mensajes.add(m)
    }
    expect(mensajes.size, 'el mensaje distingue empresa inexistente de empresa ajena: revela cuáles existen').toBe(1)
  })

  it('sin sesión, cualquier empresa da SIN_ACCESO; con la cookie vacía o corrupta también', async () => {
    expect(await new Navegador().usando(() => codigo(obtenerContexto(E1.slug)))).toBe('SIN_ACCESO')
    for (const v of ['', 'basura', 'a'.repeat(43), 'a'.repeat(5000)]) {
      const nav = new Navegador()
      nav.galletas.set('sid', v)
      expect(await nav.usando(() => codigo(obtenerContexto(E1.slug))), v.slice(0, 10)).toBe('SIN_ACCESO')
    }
  })

  it('misEmpresas lista solo las del usuario y exige sesión', async () => {
    const nav = new Navegador()
    await ingresar(nav, E1.usuarios.tecnico!.correo)
    const lista = await nav.usando(() => misEmpresas())
    expect(lista.map((x) => x.slug)).toEqual([E1.slug])
    expect(await new Navegador().usando(() => codigo(misEmpresas()))).toBe('SIN_ACCESO')
  })
})

describe('cerrar sesión y suspensiones cortan el acceso en la petición siguiente', () => {
  it('cerrar sesión revoca en la base: la cookie copiada antes ya no sirve', async () => {
    const nav = new Navegador()
    await ingresar(nav, E1.usuarios.admin!.correo)
    const robada = nav.clonar()
    await nav.usando(() => cerrarSesion())
    expect(await nav.usando(() => codigo(obtenerContexto(E1.slug)))).toBe('SIN_ACCESO')
    expect(await robada.usando(() => codigo(obtenerContexto(E1.slug)))).toBe('SIN_ACCESO')
    // Cerrar dos veces no falla.
    await expect(nav.usando(() => cerrarSesion())).resolves.toBeUndefined()
  })

  it('suspender a alguien en una empresa le corta esa empresa al instante, y no toca otra empresa', async () => {
    // Un usuario con membresía en las dos empresas.
    const c = await clienteApp()
    const correo = `doble.${Math.random().toString(36).slice(2, 8)}@prueba.local`
    let usuarioId = ''
    try {
      await c.query('BEGIN')
      const u = await c.query(`INSERT INTO usuario (correo, nombre) VALUES ($1, 'Usuario Doble') RETURNING id`, [correo])
      usuarioId = u.rows[0].id
      for (const emp of [E1, E2]) {
        await c.query(`SELECT set_config('app.empresa_id', $1, true)`, [emp.id])
        await c.query(`INSERT INTO membresia (empresa_id, usuario_id, rol_id) VALUES ($1,$2,$3)`, [emp.id, usuarioId, emp.roles.tecnico])
      }
      await c.query('COMMIT')
    } finally {
      await c.end()
    }
    const nav = new Navegador()
    const { empresas } = await ingresar(nav, correo)
    expect(empresas.map((x) => x.slug).sort()).toEqual([E1.slug, E2.slug].sort())
    expect((await nav.usando(() => obtenerContexto(E1.slug))).usuarioId).toBe(usuarioId)
    expect((await nav.usando(() => obtenerContexto(E2.slug))).usuarioId).toBe(usuarioId)

    await suspender(contextoDe(E1, 'admin'), { usuarioId })
    expect(await nav.usando(() => codigo(obtenerContexto(E1.slug)))).toBe('SIN_ACCESO')
    expect(await nav.usando(() => codigo(obtenerContexto(E2.slug)))).toBe('OK')
    expect((await nav.usando(() => misEmpresas())).map((x) => x.slug)).toEqual([E2.slug])
  })

  it('un usuario suspendido en TODAS sus empresas no puede ni usar un enlace pedido antes', async () => {
    const nav = new Navegador()
    const { enlaceLocal } = await nav.usando(() => solicitarEnlace(E1.usuarios.consulta!.correo))
    await suspender(contextoDe(E1, 'admin'), { usuarioId: E1.usuarios.consulta!.usuarioId })
    const r = await nav.usando(() => canjearEnlace(tokenDeEnlace(enlaceLocal!)))
    // El canje puede dar sesión (el usuario global sigue activo), pero sin ninguna empresa a la que entrar.
    expect(r.empresas).toEqual([])
    expect(await nav.usando(() => codigo(obtenerContexto(E1.slug)))).toBe('SIN_ACCESO')
  })

  it('el rol que se le quita a alguien rige en la petición siguiente (los permisos no se guardan en la sesión)', async () => {
    const nav = new Navegador()
    await ingresar(nav, E1.usuarios.jefa!.correo)
    const antes = await nav.usando(() => obtenerContexto(E1.slug))
    expect(antes.permisos.has('ordenes_compra.aprobar')).toBe(true)
    const { cambiarRol } = await import('../../src/modulos/usuarios')
    await cambiarRol(contextoDe(E1, 'admin'), { usuarioId: E1.usuarios.jefa!.usuarioId, rolId: E1.roles.consulta! })
    const despues = await nav.usando(() => obtenerContexto(E1.slug))
    expect(despues.permisos.has('ordenes_compra.aprobar')).toBe(false)
  })
})
