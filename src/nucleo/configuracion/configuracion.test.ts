import { describe, expect, it } from 'vitest'
import {
  NOMBRES_INTERRUPTORES_LEGALES, interruptorLegalActivo, interruptoresLegales,
  modoLocalActivo, verificarArranque, verificarModoLocal,
} from './index'

const baseLocal = { DATABASE_URL: 'postgres://app_empresa:x@db:5432/plataforma', APP_URL: 'http://localhost:3000', ENTORNO: 'desarrollo' }

describe('interruptores legales (D-118): nacen apagados', () => {
  it('son exactamente los seis de D-118', () => {
    expect([...NOMBRES_INTERRUPTORES_LEGALES].sort()).toEqual([
      'legal.anonimizacion', 'legal.asistente_con_datos_reales', 'legal.asistente_texto_libre',
      'legal.borrado_automatico', 'legal.envio_a_proveedores_con_datos_reales', 'legal.purga_auditoria',
    ])
  })
  it.each(NOMBRES_INTERRUPTORES_LEGALES)('%s está apagado', (nombre) => {
    expect(interruptorLegalActivo(nombre)).toBe(false)
  })
  it('ninguna variable de entorno los enciende', () => {
    const antes = { ...process.env }
    for (const n of NOMBRES_INTERRUPTORES_LEGALES) process.env[n] = '1'
    process.env.LEGAL = '1'
    try {
      expect(Object.values(interruptoresLegales()).every((v) => v === false)).toBe(true)
    } finally {
      for (const n of NOMBRES_INTERRUPTORES_LEGALES) delete process.env[n]
      Object.assign(process.env, antes)
    }
  })
})

describe('guarda de MODO_LOCAL (A.3)', () => {
  it('sin MODO_LOCAL no exige nada y el modo local queda apagado', () => {
    expect(() => verificarModoLocal({ DATABASE_URL: 'postgres://u:p@db.ejemplo.com:5432/x' })).not.toThrow()
    expect(modoLocalActivo({ DATABASE_URL: 'postgres://u:p@db.ejemplo.com:5432/x' })).toBe(false)
  })
  it.each(['db', 'localhost', '127.0.0.1'])('acepta la base en %s', (host) => {
    const env = { ...baseLocal, MODO_LOCAL: '1', DATABASE_URL: `postgres://app_empresa:x@${host}:5432/plataforma` }
    expect(() => verificarArranque(env)).not.toThrow()
    expect(modoLocalActivo(env)).toBe(true)
  })
  it('se niega a arrancar con una base externa', () => {
    const env = { ...baseLocal, MODO_LOCAL: '1', DATABASE_URL: 'postgres://u:p@midb.abc123.us-east-1.rds.amazonaws.com:5432/x' }
    expect(() => verificarArranque(env)).toThrow(/se niega a arrancar/)
    expect(() => modoLocalActivo(env)).toThrow()
  })
  it('se niega con una base de dirección IP pública', () => {
    expect(() => verificarModoLocal({ ...baseLocal, MODO_LOCAL: '1', DATABASE_URL: 'postgres://u:p@34.12.10.9:5432/x' })).toThrow()
  })
  it('se niega si cualquiera de las direcciones de base es externa', () => {
    expect(() => verificarModoLocal({ ...baseLocal, MODO_LOCAL: '1', MIGRATION_DATABASE_URL: 'postgres://u:p@prod.ejemplo.com/x' })).toThrow()
  })
  it('se niega si no puede saber dónde está la base', () => {
    expect(() => verificarModoLocal({ MODO_LOCAL: '1' })).toThrow()
    expect(() => verificarModoLocal({ MODO_LOCAL: '1', DATABASE_URL: 'esto no es una dirección' })).toThrow()
  })
  it('se niega en producción aunque la base sea local', () => {
    expect(() => verificarModoLocal({ ...baseLocal, MODO_LOCAL: '1', ENTORNO: 'produccion' })).toThrow(/producción/)
  })
  it('se niega si la dirección pública no es localhost', () => {
    expect(() => verificarModoLocal({ ...baseLocal, MODO_LOCAL: '1', APP_URL: 'https://app.miempresa.com' })).toThrow(/APP_URL/)
  })
  it('NODE_ENV=production dentro del contenedor local no bloquea', () => {
    expect(() => verificarModoLocal({ ...baseLocal, MODO_LOCAL: '1', NODE_ENV: 'production' })).not.toThrow()
  })
  it('solo MODO_LOCAL=1 lo activa', () => {
    for (const v of ['0', 'true', 'si', '']) expect(modoLocalActivo({ ...baseLocal, MODO_LOCAL: v })).toBe(false)
  })
})
