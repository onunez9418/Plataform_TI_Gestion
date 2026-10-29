// Ayudas para las pruebas con base real (solo datos inventados). Las pruebas que las usan se omiten
// solas si no hay base (DATABASE_URL y PLATFORM_DATABASE_URL), para que `npm test` corra en cualquier lado.
import { randomBytes } from 'node:crypto'
import { conEmpresa, conPlataforma } from '../../aislamiento'
import { PLANTILLAS_ROL, TODOS_LOS_PERMISOS } from '../catalogo'
import type { Contexto } from '../../tipos-comunes'

export const hayBaseDeDatos = Boolean(process.env.DATABASE_URL && process.env.PLATFORM_DATABASE_URL)

const azar = () => randomBytes(4).toString('hex')

export type UsuarioPrueba = { usuarioId: string; membresiaId: string; correo: string; rolId: string }
export type EmpresaPrueba = {
  id: string
  slug: string
  nombre: string
  roles: Record<string, string>
  usuarios: Record<string, UsuarioPrueba>
}

/** Crea una empresa con los 4 roles de ejemplo y un usuario por rol (admin, jefa, tecnico, consulta). */
export async function crearEmpresaDePrueba(prefijoNombre = 'Prueba'): Promise<EmpresaPrueba> {
  const slug = `t-${azar()}${azar()}`
  const nombre = `${prefijoNombre} ${slug}`
  const id = await conPlataforma(async (tx) => {
    const f = await tx.consultar<{ id: string }>(`INSERT INTO empresa (slug, nombre) VALUES ($1, $2) RETURNING id`, [slug, nombre])
    return (f[0] as { id: string }).id
  })
  const roles: Record<string, string> = {}
  const usuarios: Record<string, UsuarioPrueba> = {}
  const pares: [string, keyof typeof PLANTILLAS_ROL][] = [
    ['admin', 'Administrador'], ['jefa', 'Jefatura TI'], ['tecnico', 'Técnico'], ['consulta', 'Consulta'],
  ]
  await conEmpresa(id, async (tx) => {
    for (const [clave, nombreRol] of pares) {
      const r = await tx.consultar<{ id: string }>(
        `INSERT INTO rol (empresa_id, nombre, es_base) VALUES ($1, $2, true) RETURNING id`, [id, nombreRol])
      const rolId = (r[0] as { id: string }).id
      roles[clave] = rolId
      await tx.consultar(
        `INSERT INTO rol_permiso (empresa_id, rol_id, permiso) SELECT $1, $2, unnest($3::text[])`,
        [id, rolId, [...PLANTILLAS_ROL[nombreRol]]],
      )
      const correo = `${clave}.${azar()}@prueba.local`
      const u = await tx.consultar<{ id: string }>(
        `INSERT INTO usuario (correo, nombre) VALUES ($1, $2) RETURNING id`, [correo, `Usuario ${clave}`])
      const usuarioId = (u[0] as { id: string }).id
      const m = await tx.consultar<{ id: string }>(
        `INSERT INTO membresia (empresa_id, usuario_id, rol_id) VALUES ($1, $2, $3) RETURNING id`, [id, usuarioId, rolId])
      usuarios[clave] = { usuarioId, membresiaId: (m[0] as { id: string }).id, correo, rolId }
    }
  })
  return { id, slug, nombre, roles, usuarios }
}

/** Contexto "a mano" para probar un servicio sin pasar por cookies. */
export function contextoDe(e: EmpresaPrueba, quien: string, permisos?: Iterable<string>): Contexto {
  const u = e.usuarios[quien] as UsuarioPrueba
  const nombreRol = ({ admin: 'Administrador', jefa: 'Jefatura TI', tecnico: 'Técnico', consulta: 'Consulta' } as Record<string, keyof typeof PLANTILLAS_ROL>)[quien]
  return {
    usuarioId: u.usuarioId,
    empresaId: e.id,
    empresaSlug: e.slug,
    rolId: u.rolId,
    membresiaId: u.membresiaId,
    usuarioNombre: `Usuario ${quien}`,
    permisos: new Set(permisos ?? (nombreRol ? PLANTILLAS_ROL[nombreRol] : TODOS_LOS_PERMISOS)),
  }
}

/** Contexto sin ningún permiso (para comprobar SIN_PERMISO en cada servicio). */
export const contextoSinPermisos = (e: EmpresaPrueba): Contexto => contextoDe(e, 'consulta', [])

export const textoAzar = azar
