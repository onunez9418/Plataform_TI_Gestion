// QA · El arranque en la computadora del CEO (A.3): el compose no expone la base, publica la aplicación solo en
// esta computadora, y no lleva contraseñas escritas. También: .env ignorado por Git y sin secretos en el repositorio.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const RAIZ = resolve(__dirname, '../..')
const compose = readFileSync(resolve(RAIZ, 'docker-compose.yml'), 'utf8')
/** Texto del servicio (hasta el siguiente servicio o la sección volumes). */
const servicio = (nombre: string): string => {
  const m = compose.match(new RegExp(`^  ${nombre}:\\n([\\s\\S]*?)(?=^  [a-z_]+:\\n|^volumes:|$(?![\\s\\S]))`, 'm'))
  if (!m) throw new Error(`no se encontró el servicio ${nombre} en docker-compose.yml`)
  return m[1] as string
}

describe('docker-compose.yml', () => {
  it('la base de datos NO publica ningún puerto (solo la red interna de Docker)', () => {
    expect(servicio('db')).not.toMatch(/^\s+ports:/m)
    expect(servicio('db')).not.toMatch(/expose:|5432:5432/)
  })

  it('la aplicación se publica solo en 127.0.0.1:3000 (no en toda la red local)', () => {
    const app = servicio('app')
    const puertos = [...app.matchAll(/^\s+- "([^"]+)"/gm)].map((m) => m[1] as string).filter((p) => /:\d+$/.test(p))
    expect(puertos).toEqual(['127.0.0.1:3000:3000'])
  })

  it('MODO_LOCAL=1, ENTORNO distinto de producción y todas las bases apuntan al servicio interno «db»', () => {
    const app = servicio('app')
    expect(app).toMatch(/MODO_LOCAL:\s*"1"/)
    expect(app).not.toMatch(/ENTORNO:\s*"?produccion/)
    const urls = [...app.matchAll(/(\w*DATABASE_URL):\s*(\S+)/g)]
    expect(urls.length).toBeGreaterThanOrEqual(3)
    for (const [, nombre, valor] of urls) expect(valor, nombre).toMatch(/@db:5432\//)
  })

  it('ninguna contraseña está escrita en el archivo: todas vienen de .env', () => {
    for (const m of compose.matchAll(/(PASSWORD|PG_PASS_\w+|AUTH_SECRET):\s*(.+)$/gm)) {
      expect(m[2], m[1]).toMatch(/^\$\{/)
    }
    for (const m of compose.matchAll(/postgres:\/\/\w+:([^@\s]+)@/g)) expect(m[1]).toMatch(/^\$\{/)
  })

  it('la imagen de la base es PostgreSQL 16', () => {
    expect(servicio('db')).toMatch(/image:\s*postgres:16\b/)
  })
})

describe('secretos', () => {
  const git = (...args: string[]) => execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8' })

  it('.env está ignorado por Git y nunca fue agregado', () => {
    expect(() => git('check-ignore', '-q', '.env')).not.toThrow()
    expect(git('ls-files', '.env', '.env.local')).toBe('')
  })

  it('.env.example solo tiene valores de relleno', () => {
    const ejemplo = readFileSync(resolve(RAIZ, '.env.example'), 'utf8')
    for (const linea of ejemplo.split('\n')) {
      const m = linea.match(/^(\w*(PASSWORD|PASS|SECRET|KEY|TOKEN)\w*)=(.*)$/)
      if (m && /VERSION/.test(m[1] as string)) continue // un número de versión, no un secreto
      if (m) expect(['', 'cambiar-esto', 'false'], `${m[1]} tiene un valor que no es de relleno`).toContain((m[3] as string).trim())
    }
  })

  it('ningún archivo versionado contiene una dirección de base con contraseña real (usuario:clave@servidor)', () => {
    const archivos = git('ls-files').split('\n').filter((f) => f && !/package-lock|\.png$|\.ico$|\.jpg$|docs\//.test(f))
    const sospechosos: string[] = []
    for (const f of archivos) {
      let texto = ''
      try {
        texto = readFileSync(resolve(RAIZ, f), 'utf8')
      } catch {
        continue
      }
      for (const m of texto.matchAll(/postgres(?:ql)?:\/\/(\w+):([^@\s'"`]+)@/g)) {
        const clave = m[2] as string
        if (!/^(\$|\{|%|<|cambiar-esto|x$|p$|SECRETO|\.\.\.|\w*\$\{|ci-)/.test(clave) && !/\.test\.ts$|\/pruebas\//.test(f)) sospechosos.push(`${f}: ${m[1]}:${clave.slice(0, 3)}…`)
      }
    }
    expect(sospechosos).toEqual([])
  })
})
