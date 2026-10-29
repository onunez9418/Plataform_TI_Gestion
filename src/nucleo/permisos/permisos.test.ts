import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { ErrorDeNegocio } from '../errores'
import type { Contexto } from '../tipos-comunes'
import {
  CATALOGO, PLANTILLAS_ROL, TODOS_LOS_PERMISOS, catalogoPermisos, definirServicio, esPermisoDelCatalogo, exigirPermiso,
} from './index'

const ctx = (permisos: string[]): Contexto => ({
  usuarioId: 'u', empresaId: 'e', empresaSlug: 'alfa', rolId: 'r', membresiaId: 'm', usuarioNombre: 'Ana',
  permisos: new Set(permisos),
})

describe('catálogo de permisos (ADR-10)', () => {
  it('no repite nombres y todos tienen la forma modulo.accion', () => {
    expect(new Set(TODOS_LOS_PERMISOS).size).toBe(TODOS_LOS_PERMISOS.length)
    for (const p of TODOS_LOS_PERMISOS) expect(p).toMatch(/^[a-z][a-z0-9_]*\.[a-z0-9_]+$/)
  })
  it('coincide con docs/registro-permisos.md (PS, nombre y sensible)', () => {
    const md = readFileSync(resolve(__dirname, '../../../docs/registro-permisos.md'), 'utf8')
    const filas = new Map<string, { ps: string; sensible: boolean }>()
    for (const linea of md.split('\n')) {
      const m = linea.match(/^\| (PS-\d+) \| `([a-z_.]+)` \|/)
      if (m) filas.set(m[2] as string, { ps: m[1] as string, sensible: linea.split('|')[4]?.trim() === 'S' })
    }
    for (const p of CATALOGO) {
      const fila = filas.get(p.nombre)
      expect(fila, `${p.nombre} no está en el registro`).toBeDefined()
      expect(fila?.ps).toBe(p.ps)
      expect(fila?.sensible, `sensible de ${p.nombre}`).toBe(p.sensible)
    }
  })
  it('las plantillas de rol solo usan permisos del catálogo y el Administrador tiene todos', () => {
    for (const permisos of Object.values(PLANTILLAS_ROL)) for (const p of permisos) expect(esPermisoDelCatalogo(p)).toBe(true)
    expect([...PLANTILLAS_ROL.Administrador].sort()).toEqual([...TODOS_LOS_PERMISOS].sort())
  })
  it('Consulta solo puede ver y Jefatura TI aprueba compras', () => {
    expect(PLANTILLAS_ROL.Consulta.every((p) => p.endsWith('.ver'))).toBe(true)
    expect(PLANTILLAS_ROL['Jefatura TI']).toContain('ordenes_compra.aprobar')
    expect(PLANTILLAS_ROL.Técnico).not.toContain('ordenes_compra.aprobar')
  })
  it('catalogoPermisos() entrega clave, etiqueta y grupo', () => {
    const lista = catalogoPermisos()
    expect(lista).toHaveLength(CATALOGO.length)
    expect(lista[0]).toEqual({ clave: expect.any(String), etiqueta: expect.any(String), grupo: expect.any(String) })
  })
})

describe('exigirPermiso y definirServicio (en el servidor)', () => {
  it('rechaza con SIN_PERMISO y mensaje claro', () => {
    try {
      exigirPermiso(ctx([]), 'roles.administrar')
      expect.unreachable()
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorDeNegocio)
      expect((e as ErrorDeNegocio).codigo).toBe('SIN_PERMISO')
      expect((e as ErrorDeNegocio).mensaje).toMatch(/^No tiene permiso para: /)
    }
  })
  it('un servicio sin el permiso no ejecuta su lógica', async () => {
    const logica = vi.fn(async () => 'hecho')
    const servicio = definirServicio('prueba.una', { permiso: 'roles.administrar' }, logica)
    await expect(servicio(ctx(['roles.ver']), undefined)).rejects.toMatchObject({ codigo: 'SIN_PERMISO' })
    expect(logica).not.toHaveBeenCalled()
    await expect(servicio(ctx(['roles.administrar']), undefined)).resolves.toBe('hecho')
    expect(logica).toHaveBeenCalledOnce()
  })
  it('sin contexto válido responde SIN_ACCESO', async () => {
    const servicio = definirServicio('prueba.dos', { permiso: 'roles.ver' }, async () => 1)
    await expect(servicio(undefined as unknown as Contexto, undefined)).rejects.toMatchObject({ codigo: 'SIN_ACCESO' })
    await expect(servicio({ ...ctx(['roles.ver']), empresaId: '' }, undefined)).rejects.toMatchObject({ codigo: 'SIN_ACCESO' })
  })
})
