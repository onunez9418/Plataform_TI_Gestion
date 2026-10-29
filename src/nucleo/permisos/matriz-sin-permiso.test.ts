// Matriz de permisos en el SERVIDOR (A.8.3): cada servicio de la instancia A, llamado con un contexto sin
// ningún permiso, debe fallar con SIN_PERMISO antes de tocar la base. No necesita base de datos.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { listarAuditoria } from '../auditoria'
import {
  crearPersona, crearProveedor, crearUbicacion, editarPersona, editarProveedor, editarUbicacion,
  listarPersonas, listarProveedores, listarUbicaciones,
} from '../../modulos/catalogos'
import { agregarCampo, crearCategoria, listarCategorias } from '../../modulos/categorias'
import { crearRol, editarRol, listarRoles } from '../../modulos/roles'
import { crearSku, listarSkus, obtenerSku } from '../../modulos/skus'
import { cambiarRol, invitarUsuario, listarUsuarios, reactivar, suspender } from '../../modulos/usuarios'
import type { Contexto } from '../tipos-comunes'
import { SERVICIOS_DEFINIDOS } from './index'

const sinNada: Contexto = {
  usuarioId: '018f0000-0000-7000-8000-000000000001', empresaId: '018f0000-0000-7000-8000-000000000002',
  empresaSlug: 'alfa', rolId: '018f0000-0000-7000-8000-000000000003', membresiaId: '018f0000-0000-7000-8000-000000000004',
  usuarioNombre: 'Sin Permisos', permisos: new Set(),
}
const x = {} as never

const SERVICIOS: [string, () => Promise<unknown>][] = [
  ['auditoria.listar', () => listarAuditoria(sinNada)],
  ['usuarios.listar', () => listarUsuarios(sinNada)],
  ['usuarios.invitar', () => invitarUsuario(sinNada, x)],
  ['usuarios.cambiar_rol', () => cambiarRol(sinNada, x)],
  ['usuarios.suspender', () => suspender(sinNada, x)],
  ['usuarios.reactivar', () => reactivar(sinNada, x)],
  ['roles.listar', () => listarRoles(sinNada)],
  ['roles.crear', () => crearRol(sinNada, x)],
  ['roles.editar', () => editarRol(sinNada, x)],
  ['catalogos.ubicaciones.listar', () => listarUbicaciones(sinNada)],
  ['catalogos.ubicaciones.crear', () => crearUbicacion(sinNada, x)],
  ['catalogos.ubicaciones.editar', () => editarUbicacion(sinNada, x)],
  ['catalogos.proveedores.listar', () => listarProveedores(sinNada)],
  ['catalogos.proveedores.crear', () => crearProveedor(sinNada, x)],
  ['catalogos.proveedores.editar', () => editarProveedor(sinNada, x)],
  ['catalogos.personas.listar', () => listarPersonas(sinNada)],
  ['catalogos.personas.crear', () => crearPersona(sinNada, x)],
  ['catalogos.personas.editar', () => editarPersona(sinNada, x)],
  ['categorias.listar', () => listarCategorias(sinNada)],
  ['categorias.crear', () => crearCategoria(sinNada, x)],
  ['categorias.agregar_campo', () => agregarCampo(sinNada, x)],
  ['skus.listar', () => listarSkus(sinNada)],
  ['skus.obtener', () => obtenerSku(sinNada, 'x')],
  ['skus.crear', () => crearSku(sinNada, x)],
]

describe('permisos comprobados en el servidor: SIN_PERMISO sin tocar la base', () => {
  it.each(SERVICIOS)('%s', async (_nombre, llamar) => {
    await expect(llamar()).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
  })

  it('la matriz cubre todos los servicios definidos por esta instancia', () => {
    const definidos = SERVICIOS_DEFINIDOS.map((s) => s.nombre)
    for (const nombre of definidos) expect(SERVICIOS.map(([n]) => n), `falta probar ${nombre}`).toContain(nombre)
  })

  it('todo servicio definido exige un permiso (ninguno queda abierto por olvido)', () => {
    expect(SERVICIOS_DEFINIDOS.length).toBeGreaterThan(20)
    expect(SERVICIOS_DEFINIDOS.filter((s) => s.permiso === null)).toEqual([])
  })
})

describe('reglas de código (ADR-14 regla 9, ADR-03)', () => {
  const raiz = resolve(__dirname, '../..')
  const propios = ['nucleo/acceso', 'nucleo/permisos', 'nucleo/auditoria', 'nucleo/configuracion', 'modulos/usuarios', 'modulos/roles', 'modulos/catalogos', 'modulos/categorias', 'modulos/skus']
  const archivos = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = join(dir, n)
      return statSync(p).isDirectory() ? archivos(p) : p.endsWith('.ts') && !p.endsWith('.test.ts') ? [p] : []
    })
  const fuentes = propios.flatMap((d) => archivos(join(raiz, d))).map((p) => ({ p, texto: readFileSync(p, 'utf8') }))

  it('no hay SQL crudo sin parámetros ni set_config fuera de aislamiento', () => {
    for (const { p, texto } of fuentes) {
      expect(texto, p).not.toMatch(/\$queryRawUnsafe|\$executeRawUnsafe/)
      expect(texto, p).not.toMatch(/set_config\s*\(/i)
    }
  })

  it('nadie importa Prisma ni el cliente de base fuera de aislamiento', () => {
    for (const { p, texto } of fuentes) {
      expect(texto, p).not.toMatch(/from ['"]@prisma\/client['"]|from ['"]pg['"]|aislamiento\/cliente/)
    }
  })

  it('los módulos solo importan el index de otros módulos', () => {
    for (const { p, texto } of fuentes.filter((f) => f.p.includes('/modulos/'))) {
      expect(texto, p).not.toMatch(/from ['"]\.\.\/\.\.\/(?!nucleo)[a-z]+\/(repos|servicios)/)
    }
  })
})
