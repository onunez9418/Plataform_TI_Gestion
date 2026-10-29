import { describe, expect, it } from 'vitest'
import { esAnfitrionLocalOInterno, modoLocalActivo, verificarModoLocal } from './modo-local'

// Prueba de la guarda de MODO_LOCAL tras el hallazgo H-SEG-L01.
const compose = {
  MODO_LOCAL: '1',
  NODE_ENV: 'production',
  ENTORNO: 'desarrollo',
  APP_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgres://app_empresa:x@db:5432/plataforma',
  PLATFORM_DATABASE_URL: 'postgres://app_plataforma:x@db:5432/plataforma',
  MIGRATION_DATABASE_URL: 'postgres://migraciones:x@db:5432/plataforma',
  AUDIT_READER_DATABASE_URL: 'postgres://lector_auditoria:x@db:5432/plataforma',
}
const desarrollo = {
  MODO_LOCAL: '1',
  ENTORNO: 'desarrollo',
  APP_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgres://app_empresa:x@localhost:54329/plataforma_dev',
  PLATFORM_DATABASE_URL: 'postgres://app_plataforma:x@127.0.0.1:54329/plataforma_dev',
}

describe('guarda de MODO_LOCAL: casos legítimos', () => {
  it('compose local (host db, APP_URL localhost, NODE_ENV=production) arranca', () => {
    expect(() => verificarModoLocal(compose)).not.toThrow()
    expect(modoLocalActivo(compose)).toBe(true)
  })
  it('desarrollo con localhost y 127.0.0.1 arranca', () => {
    expect(() => verificarModoLocal(desarrollo)).not.toThrow()
  })
  it('acepta ::1 como host de base y 127.0.0.1 como APP_URL', () => {
    expect(() => verificarModoLocal({ ...desarrollo, DATABASE_URL: 'postgres://u:p@[::1]:5432/x', APP_URL: 'http://127.0.0.1:3000' })).not.toThrow()
  })
  it('sin MODO_LOCAL no revisa nada', () => {
    expect(() => verificarModoLocal({ DATABASE_URL: 'postgres://u:p@db.externa.com/x' })).not.toThrow()
  })
})

describe('guarda de MODO_LOCAL: caso (a) parámetros que cambian el destino', () => {
  it.each(['host', 'hostaddr', 'HOST', 'socket', 'service'])('rechaza ?%s= en DATABASE_URL', (p) => {
    const url = `postgres://u:p@localhost/x?${p}=db.externa.com`
    expect(() => verificarModoLocal({ ...desarrollo, DATABASE_URL: url })).toThrow(/se niega a arrancar/)
  })
  it('rechaza host por socket (sin host en la URL)', () => {
    expect(() => verificarModoLocal({ ...desarrollo, DATABASE_URL: 'postgres:///x?host=/var/run/postgresql' })).toThrow(/se niega a arrancar/)
  })
  it('rechaza el parámetro host también en PLATFORM_DATABASE_URL y en cualquier *_DATABASE_URL', () => {
    const malo = 'postgres://u:p@db/x?host=db.externa.com'
    expect(() => verificarModoLocal({ ...compose, PLATFORM_DATABASE_URL: malo })).toThrow(/PLATFORM_DATABASE_URL/)
    expect(() => verificarModoLocal({ ...compose, OTRA_DATABASE_URL: malo })).toThrow(/OTRA_DATABASE_URL/)
  })
  it('rechaza una URL con otro destino escondido tras una arroba', () => {
    expect(() => verificarModoLocal({ ...desarrollo, DATABASE_URL: 'postgres://localhost:5432@evil.com/x' })).toThrow()
  })
  it('rechaza URLs con caracteres ambiguos o que no son de base', () => {
    for (const url of ['postgres://localhost\\@evil.com/x', 'postgres://u:p@localhost /x', 'http://localhost/x', 'esto no es una dirección']) {
      expect(() => verificarModoLocal({ ...desarrollo, DATABASE_URL: url })).toThrow()
    }
  })
})

describe('guarda de MODO_LOCAL: caso (b) lista permitida estricta', () => {
  it.each(['prod-db', 'dpg-abc123-a', 'postgres', 'servicio.interno', '0x7f.1', '2130706433', '10.0.0.5', '34.12.10.9', 'db.externa.com', 'host.docker.internal'])(
    'rechaza el host %s',
    (host) => {
      expect(() => verificarModoLocal({ ...desarrollo, DATABASE_URL: `postgres://u:p@${host}:5432/x` })).toThrow(/se niega a arrancar/)
    },
  )
  it('rechaza varios hosts separados por coma', () => {
    expect(() => verificarModoLocal({ ...desarrollo, DATABASE_URL: 'postgres://u:p@localhost,evil.com/x' })).toThrow()
  })
  it('esAnfitrionLocalOInterno solo acepta la lista', () => {
    for (const ok of ['localhost', 'LOCALHOST', '127.0.0.1', '::1', '[::1]', 'db']) expect(esAnfitrionLocalOInterno(ok)).toBe(true)
    for (const no of ['', 'prod-db', 'db.', 'db2', '127.0.0.2', '0x7f.1']) expect(esAnfitrionLocalOInterno(no)).toBe(false)
  })
  it('rechaza si cualquiera de las otras bases (no solo DATABASE_URL) está fuera de la lista', () => {
    expect(() => verificarModoLocal({ ...compose, MIGRATION_DATABASE_URL: 'postgres://u:p@prod-db/x' })).toThrow(/MIGRATION_DATABASE_URL/)
    expect(() => verificarModoLocal({ ...compose, AUDIT_READER_DATABASE_URL: 'postgres://u:p@34.1.1.1/x' })).toThrow(/AUDIT_READER_DATABASE_URL/)
  })
})

describe('guarda de MODO_LOCAL: caso (c) APP_URL obligatoria y local', () => {
  it('se niega si falta APP_URL (sin ENTORNO tampoco hay otra barrera)', () => {
    const { APP_URL: _app, ENTORNO: _ent, ...sinNada } = compose
    expect(() => verificarModoLocal(sinNada)).toThrow(/APP_URL/)
  })
  it.each(['https://app.miempresa.com', 'http://localhost.evil.com', 'http://localhost@evil.com', 'http://10.0.0.5:3000', 'no es url', 'ftp://localhost'])(
    'se niega con APP_URL=%s',
    (u) => {
      expect(() => verificarModoLocal({ ...compose, APP_URL: u })).toThrow(/APP_URL/)
    },
  )
  it('se niega si AUTH_URL o NEXTAUTH_URL apuntan fuera de localhost', () => {
    expect(() => verificarModoLocal({ ...compose, AUTH_URL: 'https://app.miempresa.com' })).toThrow(/AUTH_URL/)
    expect(() => verificarModoLocal({ ...compose, NEXTAUTH_URL: 'https://app.miempresa.com' })).toThrow(/NEXTAUTH_URL/)
    expect(() => verificarModoLocal({ ...compose, AUTH_URL: 'http://localhost:3000' })).not.toThrow()
  })
  it('se niega con ENTORNO=produccion aunque todo lo demás sea local', () => {
    expect(() => verificarModoLocal({ ...compose, ENTORNO: 'produccion' })).toThrow(/producción/)
  })
  it('NODE_ENV=production por sí solo no bloquea el compose local', () => {
    expect(() => verificarModoLocal({ ...compose, NODE_ENV: 'production' })).not.toThrow()
  })
})

describe('guarda de MODO_LOCAL: caso (d) variables de entorno de PostgreSQL', () => {
  it.each(['PGHOST', 'PGHOSTADDR'])('rechaza %s apuntando fuera de la lista', (n) => {
    expect(() => verificarModoLocal({ ...compose, [n]: 'db.externa.com' })).toThrow(new RegExp(n))
    expect(() => verificarModoLocal({ ...compose, [n]: '/var/run/postgresql' })).toThrow(new RegExp(n))
  })
  it('acepta PGHOST=db o localhost', () => {
    expect(() => verificarModoLocal({ ...compose, PGHOST: 'db' })).not.toThrow()
    expect(() => verificarModoLocal({ ...compose, PGHOST: 'localhost' })).not.toThrow()
  })
  it('rechaza PGSERVICE', () => {
    expect(() => verificarModoLocal({ ...compose, PGSERVICE: 'produccion' })).toThrow(/PGSERVICE/)
  })
  it('el mensaje de rechazo está en español y explica el motivo', () => {
    expect(() => verificarModoLocal({ ...compose, PGHOST: 'db.externa.com' })).toThrow(/solo puede usarse en la computadora de prueba/)
  })
})
