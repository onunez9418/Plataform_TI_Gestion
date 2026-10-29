import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { middleware } from '../../middleware'
import { evaluarHost } from './host-local'

const local = { MODO_LOCAL: '1', APP_URL: 'http://localhost:3000' }
const pedir = (host: string | null, ruta = '/', env: Record<string, string | undefined> = local, xfh?: string) =>
  evaluarHost({ host, xForwardedHost: xfh ?? null, ruta }, env).permitido

describe('H-SEG-L02 · control de la cabecera Host en MODO_LOCAL', () => {
  it('acepta exactamente localhost:<puerto> y 127.0.0.1:<puerto>', () => {
    expect(pedir('localhost:3000')).toBe(true)
    expect(pedir('127.0.0.1:3000')).toBe(true)
    expect(pedir('LOCALHOST:3000')).toBe(true)
  })

  it('rechaza un dominio ajeno que apunta a 127.0.0.1 (DNS rebinding)', () => {
    for (const host of [
      'malo.example:3000', 'malo.example', 'localhost.malo.example:3000', 'localhost:3000.malo.example',
      'evil.com:3000, localhost:3000', 'xlocalhost:3000', '127.0.0.1.nip.io:3000', '0.0.0.0:3000', '[::1]:3000',
      '127.1:3000', '2130706433:3000', '', 'localhost:3000 ', ' ',
    ]) {
      expect(pedir(host), `«${host}»`).toBe(host.trim() === 'localhost:3000')
    }
  })

  it('rechaza un puerto distinto al de APP_URL y una cabecera ausente', () => {
    expect(pedir('localhost:3001')).toBe(false)
    expect(pedir('localhost')).toBe(false)
    expect(pedir(null)).toBe(false)
  })

  it('el puerto sale de APP_URL', () => {
    const env = { MODO_LOCAL: '1', APP_URL: 'http://127.0.0.1:3391' }
    expect(pedir('localhost:3391', '/', env)).toBe(true)
    expect(pedir('127.0.0.1:3391', '/', env)).toBe(true)
    expect(pedir('localhost:3000', '/', env)).toBe(false)
  })

  it('con el puerto por omisión (APP_URL sin puerto) el navegador manda Host sin puerto', () => {
    const env = { MODO_LOCAL: '1', APP_URL: 'http://localhost' }
    expect(pedir('localhost', '/', env)).toBe(true)
    expect(pedir('localhost:80', '/', env)).toBe(false)
  })

  it('si APP_URL falta o es ilegible rechaza todo (falla cerrada), salvo la ruta de salud', () => {
    for (const appUrl of [undefined, '', 'esto no es una dirección', 'ftp://localhost:3000']) {
      const env = { MODO_LOCAL: '1', APP_URL: appUrl }
      expect(pedir('localhost:3000', '/', env), String(appUrl)).toBe(false)
      expect(pedir('localhost:3000', '/api/salud', env), String(appUrl)).toBe(true)
    }
  })

  it('un X-Forwarded-Host ajeno también se rechaza', () => {
    expect(pedir('localhost:3000', '/', local, 'malo.example:3000')).toBe(false)
    expect(pedir('localhost:3000', '/', local, '127.0.0.1:3000')).toBe(true)
  })

  it('/api/salud responde al healthcheck de Docker (localhost o 127.0.0.1, cualquier puerto) pero no a dominios ajenos', () => {
    expect(pedir('127.0.0.1:3000', '/api/salud')).toBe(true)
    expect(pedir('localhost:8080', '/api/salud')).toBe(true)
    expect(pedir('localhost', '/api/salud')).toBe(true)
    expect(pedir('malo.example:3000', '/api/salud')).toBe(false)
    expect(pedir('localhost.malo.example', '/api/salud')).toBe(false)
    // Otras rutas siguen exigiendo el puerto exacto.
    expect(pedir('localhost:8080', '/api/salud/otra')).toBe(false)
  })

  it('sin MODO_LOCAL no decide nada (en la nube lo configura el alojamiento)', () => {
    expect(pedir('malo.example', '/', { APP_URL: 'https://app.ejemplo.com' })).toBe(true)
    expect(pedir('malo.example', '/', { MODO_LOCAL: '0' })).toBe(true)
  })
})

describe('H-SEG-L02 · middleware de Next.js', () => {
  const peticion = (host: string, ruta = '/entrar') =>
    new NextRequest(`http://127.0.0.1:3000${ruta}`, { headers: { host } })

  function conEntorno<T>(env: Record<string, string>, fn: () => T): T {
    const antes = { MODO_LOCAL: process.env.MODO_LOCAL, APP_URL: process.env.APP_URL }
    Object.assign(process.env, env)
    try { return fn() } finally {
      for (const [k, v] of Object.entries(antes)) { if (v === undefined) delete process.env[k]; else process.env[k] = v }
    }
  }

  it('responde 421 en español, sin repetir lo que envió el atacante', async () => {
    const r = conEntorno(local, () => middleware(peticion('malo.example:3000')))
    expect(r.status).toBe(421)
    const texto = await r.text()
    expect(texto).toMatch(/solo responde en la dirección http:\/\/localhost/)
    expect(texto).not.toContain('malo.example')
    expect(r.headers.get('cache-control')).toBe('no-store')
  })

  it('deja pasar localhost y 127.0.0.1 con el puerto de APP_URL', () => {
    for (const host of ['localhost:3000', '127.0.0.1:3000']) {
      const r = conEntorno(local, () => middleware(peticion(host)))
      expect(r.status, host).toBe(200)
      expect(r.headers.get('x-middleware-next')).toBe('1')
    }
  })

  it('el healthcheck /api/salud sigue respondiendo por 127.0.0.1 dentro del contenedor', () => {
    const r = conEntorno(local, () => middleware(peticion('127.0.0.1:3000', '/api/salud')))
    expect(r.headers.get('x-middleware-next')).toBe('1')
  })

  it('sin MODO_LOCAL deja pasar todo', () => {
    const r = conEntorno({ MODO_LOCAL: '0' }, () => middleware(peticion('cualquiera.example')))
    expect(r.headers.get('x-middleware-next')).toBe('1')
  })
})
