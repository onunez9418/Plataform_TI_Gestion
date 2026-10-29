// QA · Los seis interruptores legales de D-118 nacen APAGADOS (A.8.5), y hay una prueba por cada uno.
// Cada prueba comprueba dos cosas: (a) el interruptor está apagado y nada lo enciende, y
// (b) la conducta que gobierna no existe en el código (por ejemplo: nadie borra solo, nadie envía datos afuera).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { interruptorLegalActivo, interruptoresLegales, NOMBRES_INTERRUPTORES_LEGALES, type InterruptorLegal } from '../../src/nucleo/configuracion'

const RAIZ = resolve(__dirname, '../..')
function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    if (n === 'node_modules' || n === '.next') return []
    return statSync(p).isDirectory() ? archivos(p) : /\.(ts|tsx|mjs)$/.test(p) && !/\.test\.tsx?$/.test(p) && !p.includes('/pruebas/') ? [p] : []
  })
}
/** Código de producción de la aplicación (sin pruebas). */
const codigo = archivos(join(RAIZ, 'src')).map((p) => ({ p: p.replace(RAIZ + '/', ''), t: readFileSync(p, 'utf8') }))
const fuera = (re: RegExp, excluir: RegExp = /$^/) => codigo.filter((f) => re.test(f.t) && !excluir.test(f.p)).map((f) => f.p)

afterEach(() => {
  vi.unstubAllEnvs()
})

/** Intentos de encenderlo: variables de entorno con distintos nombres, mutar lo devuelto, reasignar. */
function intentarEncender(nombre: InterruptorLegal): boolean {
  const variantes = [nombre, nombre.toUpperCase(), nombre.replace('.', '_'), nombre.replace('.', '_').toUpperCase(), 'LEGAL_TODO', 'LEGAL']
  for (const v of variantes) vi.stubEnv(v, '1')
  const copia = interruptoresLegales() as Record<string, boolean>
  try {
    copia[nombre] = true
  } catch {
    /* si está congelado, lanza: mejor */
  }
  return interruptorLegalActivo(nombre) || interruptoresLegales()[nombre]
}

describe('interruptores legales (D-118)', () => {
  it('son exactamente seis', () => {
    expect([...NOMBRES_INTERRUPTORES_LEGALES]).toHaveLength(6)
  })

  it('legal.borrado_automatico: apagado, no se enciende, y ningún código borra solo', () => {
    expect(interruptorLegalActivo('legal.borrado_automatico')).toBe(false)
    expect(intentarEncender('legal.borrado_automatico')).toBe(false)
    // Los únicos DELETE permitidos: reemplazar los permisos de un rol al editarlo (con auditoría).
    expect(fuera(/DELETE\s+FROM/i, /modulos\/roles\/repos\/roles\.ts|nucleo\/aislamiento\/errores-base/)).toEqual([])
    expect(fuera(/setInterval\s*\(|node-cron|\bcron\b/i, /nucleo\/aislamiento\/cliente\.ts/)).toEqual([])
    expect(fuera(/TRUNCATE/i, /sql-permitido/)).toEqual([])
  })

  it('legal.anonimizacion: apagado, no se enciende, y ningún código anonimiza datos personales', () => {
    expect(interruptorLegalActivo('legal.anonimizacion')).toBe(false)
    expect(intentarEncender('legal.anonimizacion')).toBe(false)
    expect(fuera(/anonimiz/i, /nucleo\/configuracion|nucleo\/auditoria\/campos-personales/)).toEqual([])
    // Nadie reescribe el nombre o el correo de un usuario ya creado.
    expect(fuera(/UPDATE\s+usuario\s+SET\s+(nombre|correo)/i)).toEqual([])
    expect(fuera(/UPDATE\s+persona\s+SET\s+(nombre|correo)\s*=\s*(NULL|'anon)/i)).toEqual([])
  })

  it('legal.purga_auditoria: apagado, no se enciende, y nada purga la auditoría', () => {
    expect(interruptorLegalActivo('legal.purga_auditoria')).toBe(false)
    expect(intentarEncender('legal.purga_auditoria')).toBe(false)
    expect(fuera(/(DELETE\s+FROM|TRUNCATE|DROP\s+TABLE|UPDATE)\s+(public\.)?auditoria\b/i)).toEqual([])
  })

  it('legal.asistente_texto_libre: apagado, no se enciende, y no hay asistente ni biblioteca de IA', () => {
    expect(interruptorLegalActivo('legal.asistente_texto_libre')).toBe(false)
    expect(intentarEncender('legal.asistente_texto_libre')).toBe(false)
    const paquete = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8')) as { dependencies?: Record<string, string> }
    const dependencias = Object.keys(paquete.dependencies ?? {})
    expect(dependencias.filter((d) => /anthropic|openai|langchain|^ai$|@ai-sdk|llama|gemini|mistral|cohere/i.test(d))).toEqual([])
    expect(fuera(/asistente|chat\/completions|messages\.create/i, /nucleo\/configuracion|\/ui\/|componentes/)).toEqual([])
  })

  it('legal.asistente_con_datos_reales: apagado, no se enciende, y ninguna ruta del servidor expone un asistente', () => {
    expect(interruptorLegalActivo('legal.asistente_con_datos_reales')).toBe(false)
    expect(intentarEncender('legal.asistente_con_datos_reales')).toBe(false)
    const rutas = codigo.map((f) => f.p).filter((p) => /src\/app\/api\//.test(p))
    expect(rutas.filter((p) => !/api\/salud\//.test(p))).toEqual([])
  })

  it('legal.envio_a_proveedores_con_datos_reales: apagado, no se enciende, y nada sale a internet ni por correo', () => {
    expect(interruptorLegalActivo('legal.envio_a_proveedores_con_datos_reales')).toBe(false)
    expect(intentarEncender('legal.envio_a_proveedores_con_datos_reales')).toBe(false)
    expect(fuera(/\bfetch\s*\(|axios|node:https?|from ['"]https?['"]|XMLHttpRequest|nodemailer|resend|sendgrid|postmark|smtp/i)).toEqual([])
  })

  it('ninguna variable de entorno, con ningún nombre, enciende ninguno de los seis a la vez', () => {
    for (const n of NOMBRES_INTERRUPTORES_LEGALES) intentarEncender(n)
    expect(Object.values(interruptoresLegales()).every((v) => v === false)).toBe(true)
  })

  it('nadie fuera de la configuración lee los interruptores desde el entorno o la base', () => {
    expect(fuera(/process\.env\[?\.?['"]?legal/i)).toEqual([])
    expect(fuera(/legal\.[a-z_]+/, /nucleo\/configuracion|nucleo\/auditoria\/campos/)).toEqual([])
  })
})
