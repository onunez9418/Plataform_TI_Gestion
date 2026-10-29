// QA · Guarda de MODO_LOCAL (A.3 y A.8.4): con una base externa, o en producción, la aplicación NO arranca
// y el enlace de ingreso NUNCA se muestra en pantalla. Sin base de datos: se prueba con variables de entorno simuladas.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { register } from '../../src/instrumentation'
import { solicitarEnlace } from '../../src/nucleo/acceso'
import { modoLocalActivo, verificarArranque } from '../../src/nucleo/configuracion'

const local = { MODO_LOCAL: '1', ENTORNO: 'desarrollo', APP_URL: 'http://localhost:3000', DATABASE_URL: 'postgres://app_empresa:x@db:5432/plataforma' }
const con = (cambios: Record<string, string | undefined>) => ({ ...local, ...cambios })

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('guarda de MODO_LOCAL · la aplicación se niega a arrancar', () => {
  it('con una base local o interna arranca (db del compose, localhost, 127.0.0.1, ::1)', () => {
    for (const host of ['db', 'localhost', '127.0.0.1', '[::1]']) {
      expect(() => verificarArranque(con({ DATABASE_URL: `postgres://app_empresa:x@${host}:5432/plataforma` })), host).not.toThrow()
    }
  })

  it.each([
    ['nombre público', 'basedatos.empresa.com'],
    ['proveedor en la nube', 'midb.abc123.us-east-1.rds.amazonaws.com'],
    ['IP pública', '34.12.10.9'],
    ['IP privada de otra máquina', '10.0.0.5'],
    ['se parece a localhost pero no lo es', 'localhost.evil.com'],
    ['nombre con dominio interno', 'db.interno.local'],
    ['localhost como usuario, no como servidor', 'x@evil.com'],
  ])('con una base externa NO arranca · %s', (_n, host) => {
    expect(() => verificarArranque(con({ DATABASE_URL: `postgres://u:p@${host}:5432/plataforma` }))).toThrow(/se niega a arrancar/)
  })

  it('NO arranca si CUALQUIERA de las direcciones de base es externa (no solo DATABASE_URL)', () => {
    for (const v of ['WORKER_DATABASE_URL', 'MIGRATION_DATABASE_URL']) {
      expect(() => verificarArranque(con({ [v]: 'postgres://u:p@prod.ejemplo.com/x' })), v).toThrow(/se niega a arrancar/)
    }
  })

  it('NO arranca en producción, aunque la base sea local, en cualquier forma de escribirlo', () => {
    for (const v of ['produccion', 'PRODUCCION', ' production ', 'Production']) {
      expect(() => verificarArranque(con({ ENTORNO: v })), v).toThrow(/producción/)
    }
  })

  it('NO arranca si la dirección pública no es localhost', () => {
    for (const url of ['https://app.miempresa.com', 'http://192.168.1.20:3000', 'http://localhost.evil.com']) {
      expect(() => verificarArranque(con({ APP_URL: url })), url).toThrow(/APP_URL/)
    }
  })

  it('NO arranca si no puede saber dónde está la base', () => {
    expect(() => verificarArranque({ MODO_LOCAL: '1' })).toThrow(/se niega a arrancar/)
    expect(() => verificarArranque(con({ DATABASE_URL: 'esto no es una dirección' }))).toThrow(/se niega a arrancar/)
  })

  it('el mensaje de error es claro, en español, y no revela contraseñas de la dirección', () => {
    try {
      verificarArranque(con({ DATABASE_URL: 'postgres://app_empresa:SECRETO-INVENTADO-123@basedatos.empresa.com:5432/x' }))
      throw new Error('debió negarse')
    } catch (e) {
      expect(String((e as Error).message)).toMatch(/MODO_LOCAL/)
      expect(String((e as Error).message)).not.toContain('SECRETO-INVENTADO-123')
    }
  })

  it('sin MODO_LOCAL=1 la guarda no exige nada, y solo el valor exacto «1» lo activa', () => {
    expect(() => verificarArranque({ DATABASE_URL: 'postgres://u:p@basedatos.empresa.com/x' })).not.toThrow()
    for (const v of ['0', 'true', 'TRUE', 'si', 'yes', ' 1', '1 ', '']) {
      expect(modoLocalActivo(con({ MODO_LOCAL: v })), JSON.stringify(v)).toBe(false)
    }
    expect(modoLocalActivo(local)).toBe(true)
  })
})

describe('guarda de MODO_LOCAL · está conectada al arranque real de Next.js (instrumentation)', () => {
  /** register() termina el proceso con código 1 y explica por qué; aquí se intercepta process.exit. */
  async function arrancarCon(entorno: Record<string, string>) {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs')
    for (const [k, v] of Object.entries(entorno)) vi.stubEnv(k, v)
    const salida = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
    const aviso = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      await register()
      return { salio: salida.mock.calls.map((c) => c[0]), mensajes: aviso.mock.calls.map((c) => String(c[0])).join('\n') }
    } finally {
      salida.mockRestore()
      aviso.mockRestore()
    }
  }

  it('con MODO_LOCAL=1 y una base externa el servidor termina con código 1 y dice por qué', async () => {
    const r = await arrancarCon(con({ DATABASE_URL: 'postgres://u:p@basedatos.empresa.com:5432/x' }))
    expect(r.salio).toEqual([1])
    expect(r.mensajes).toMatch(/se niega a arrancar/)
  })

  it('con MODO_LOCAL=1 y ENTORNO=produccion el servidor termina con código 1', async () => {
    const r = await arrancarCon(con({ ENTORNO: 'produccion' }))
    expect(r.salio).toEqual([1])
    expect(r.mensajes).toMatch(/producción/)
  })

  it('con la configuración del compose deja arrancar (no termina el proceso)', async () => {
    const r = await arrancarCon(local)
    expect(r.salio).toEqual([])
  })
})

describe('el enlace de ingreso solo se muestra en pantalla en modo local', () => {
  it('sin MODO_LOCAL, pedir un enlace NO devuelve ningún enlace (ni siquiera señuelo)', async () => {
    vi.stubEnv('MODO_LOCAL', '')
    vi.stubEnv('DATABASE_URL', 'postgres://u:p@basedatos.empresa.com:5432/x')
    await expect(solicitarEnlace('ceo@demo.local')).resolves.toEqual({})
  })

  it('con MODO_LOCAL=1 y una base externa, pedir un enlace falla y NO muestra enlace', async () => {
    for (const [k, v] of Object.entries(con({ DATABASE_URL: 'postgres://u:p@basedatos.empresa.com:5432/x' }))) vi.stubEnv(k, v as string)
    await expect(solicitarEnlace('ceo@demo.local')).rejects.toThrow(/se niega a arrancar/)
  })

  it('con MODO_LOCAL=1 en producción, pedir un enlace falla', async () => {
    for (const [k, v] of Object.entries(con({ ENTORNO: 'produccion' }))) vi.stubEnv(k, v as string)
    await expect(solicitarEnlace('ceo@demo.local')).rejects.toThrow(/producción/)
  })
})
