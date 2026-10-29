// MODO_LOCAL (plan A.3): permite mostrar el enlace de ingreso en pantalla en vez de mandarlo por correo.
// Es cómodo para la prueba en la computadora del CEO y PELIGROSO fuera de ella: por eso hay una guarda
// que impide arrancar la aplicación si MODO_LOCAL=1 no está en un entorno local.

import { ErrorDeNegocio } from '../errores'

type Entorno = Readonly<Record<string, string | undefined>>

const ANFITRIONES_LOCALES = new Set(['localhost', '127.0.0.1', '::1', '[::1]', 'host.docker.internal'])

/**
 * Una base es «local o interna» si está en esta misma máquina o si su nombre es de un solo tramo
 * (como `db`, el nombre del servicio en Docker Compose, que no se resuelve fuera de esa red).
 */
export function esAnfitrionLocalOInterno(anfitrion: string): boolean {
  const a = anfitrion.trim().toLowerCase()
  if (a === '') return false
  if (ANFITRIONES_LOCALES.has(a)) return true
  return /^[a-z0-9_-]+$/.test(a) && !/^\d+$/.test(a)
}

function anfitrionDe(url: string): string | null {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

export function modoLocalSolicitado(env: Entorno = process.env): boolean {
  return env.MODO_LOCAL === '1'
}

/**
 * Si MODO_LOCAL=1 y el entorno no es local, LANZA: la aplicación no debe arrancar.
 * Revisa: (1) la base (DATABASE_URL y las demás direcciones de base), (2) que el entorno no sea producción,
 * (3) que la dirección pública (APP_URL) sea localhost.
 * (NODE_ENV=production es normal dentro del contenedor local, por eso no se usa como señal.)
 */
export function verificarModoLocal(env: Entorno = process.env): void {
  if (!modoLocalSolicitado(env)) return
  const razones: string[] = []

  const direcciones = ['DATABASE_URL', 'WORKER_DATABASE_URL', 'MIGRATION_DATABASE_URL'] as const
  const definidas = direcciones.filter((n) => (env[n] ?? '').trim() !== '')
  if (definidas.length === 0) razones.push('no se pudo comprobar dónde está la base de datos (falta DATABASE_URL)')
  for (const nombre of definidas) {
    const anfitrion = anfitrionDe(env[nombre] as string)
    if (anfitrion === null || !esAnfitrionLocalOInterno(anfitrion)) {
      razones.push(`la base de datos (${nombre}) no es local ni interna`)
    }
  }

  const entorno = (env.ENTORNO ?? '').trim().toLowerCase()
  if (entorno === 'produccion' || entorno === 'production') razones.push('el entorno es de producción')

  if ((env.APP_URL ?? '').trim() !== '') {
    const anfitrion = anfitrionDe(env.APP_URL as string)
    if (anfitrion === null || !['localhost', '127.0.0.1', '::1', '[::1]'].includes(anfitrion.toLowerCase())) {
      razones.push('la dirección pública de la aplicación (APP_URL) no es localhost')
    }
  }

  if (razones.length > 0) {
    throw new ErrorDeNegocio(
      'ERROR_INTERNO',
      `La aplicación se niega a arrancar con MODO_LOCAL=1: ${razones.join('; ')}. ` +
        'El modo local solo puede usarse en la computadora de prueba con datos inventados.',
    )
  }
}

/** ¿Se puede mostrar el enlace de ingreso en pantalla? Solo con MODO_LOCAL=1 y la guarda en regla. */
export function modoLocalActivo(env: Entorno = process.env): boolean {
  if (!modoLocalSolicitado(env)) return false
  verificarModoLocal(env)
  return true
}
