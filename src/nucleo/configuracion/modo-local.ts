// MODO_LOCAL (plan A.3): permite mostrar el enlace de ingreso en pantalla en vez de mandarlo por correo.
// Es cómodo para la prueba en la computadora del CEO y PELIGROSO fuera de ella: por eso hay una guarda
// que impide arrancar la aplicación si MODO_LOCAL=1 no está en un entorno local.

import { ErrorDeNegocio } from '../errores'

type Entorno = Readonly<Record<string, string | undefined>>

// Lista permitida ESTRICTA (H-SEG-L01): solo esta computadora (localhost, 127.0.0.1, ::1) y `db`,
// el nombre del servicio de base de datos en docker-compose. Cualquier otro nombre o IP se rechaza.
const ANFITRIONES_BASE_PERMITIDOS = new Set(['localhost', '127.0.0.1', '::1', '[::1]', 'db'])
const ANFITRIONES_APP_PERMITIDOS = new Set(['localhost', '127.0.0.1'])

// Parámetros de una URL de base que cambian a dónde se conecta el driver (el parámetro manda sobre el host de la URL).
const PARAMETROS_QUE_CAMBIAN_DESTINO = ['host', 'hostaddr', 'socket', 'service', 'servicefile']

/** ¿Es un host de base permitido en modo local? (solo localhost, 127.0.0.1, ::1 y db). */
export function esAnfitrionLocalOInterno(anfitrion: string): boolean {
  return ANFITRIONES_BASE_PERMITIDOS.has(anfitrion.trim().toLowerCase())
}

function analizarUrl(valor: string): URL | null {
  // Un texto con espacios, barras invertidas o caracteres de control se interpreta distinto según el programa: se rechaza.
  if (/[\\\s\u0000-\u001f]/.test(valor.trim())) return null
  try {
    return new URL(valor.trim())
  } catch {
    return null
  }
}

/** Devuelve el motivo del rechazo de una URL de base, o null si es aceptable. */
function problemaDeUrlDeBase(nombre: string, valor: string): string | null {
  const url = analizarUrl(valor)
  if (url === null || !['postgres:', 'postgresql:'].includes(url.protocol)) {
    return `${nombre} no es una dirección de base de datos válida`
  }
  for (const clave of url.searchParams.keys()) {
    if (PARAMETROS_QUE_CAMBIAN_DESTINO.includes(clave.toLowerCase())) {
      return `${nombre} trae el parámetro «${clave}», que cambia a dónde se conecta la base`
    }
  }
  if (!esAnfitrionLocalOInterno(url.hostname)) {
    return `la base de datos (${nombre}) no está en una dirección permitida (solo localhost, 127.0.0.1, ::1 o db)`
  }
  return null
}

/** Direcciones de base: DATABASE_URL y cualquier variable cuyo nombre termine en _DATABASE_URL. */
function nombresDeUrlDeBase(env: Entorno): string[] {
  return Object.keys(env).filter(
    (n) => /(^|_)DATABASE_URL$/i.test(n) && (env[n] ?? '').trim() !== '',
  )
}

function problemaDeUrlLocal(nombre: string, valor: string): string | null {
  const url = analizarUrl(valor)
  if (url === null || !['http:', 'https:'].includes(url.protocol) || !ANFITRIONES_APP_PERMITIDOS.has(url.hostname.toLowerCase())) {
    return `${nombre} no apunta a localhost ni a 127.0.0.1`
  }
  return null
}

export function modoLocalSolicitado(env: Entorno = process.env): boolean {
  return env.MODO_LOCAL === '1'
}

/**
 * Si MODO_LOCAL=1 y el entorno no es local, LANZA: la aplicación no debe arrancar.
 * Revisa: (1) TODAS las direcciones de base (DATABASE_URL, PLATFORM_DATABASE_URL, cualquier *_DATABASE_URL)
 * contra la lista permitida y sin parámetros que cambien el destino, (2) PGHOST/PGHOSTADDR/PGSERVICE,
 * (3) que APP_URL exista y sea localhost o 127.0.0.1, (4) que ENTORNO no sea producción.
 * (NODE_ENV=production es normal dentro del contenedor local, por eso no se usa como señal:
 * la barrera es APP_URL local + hosts de base permitidos.)
 */
export function verificarModoLocal(env: Entorno = process.env): void {
  if (!modoLocalSolicitado(env)) return
  const razones: string[] = []

  if ((env.DATABASE_URL ?? '').trim() === '') {
    razones.push('no se pudo comprobar dónde está la base de datos (falta DATABASE_URL)')
  }
  for (const nombre of nombresDeUrlDeBase(env)) {
    const problema = problemaDeUrlDeBase(nombre, env[nombre] as string)
    if (problema !== null) razones.push(problema)
  }

  for (const nombre of ['PGHOST', 'PGHOSTADDR'] as const) {
    const valor = (env[nombre] ?? '').trim()
    if (valor !== '' && !esAnfitrionLocalOInterno(valor)) {
      razones.push(`${nombre} apunta a una dirección que no está permitida (solo localhost, 127.0.0.1, ::1 o db)`)
    }
  }
  if ((env.PGSERVICE ?? '').trim() !== '') razones.push('PGSERVICE puede cambiar a dónde se conecta la base')

  const entorno = (env.ENTORNO ?? '').trim().toLowerCase()
  if (entorno === 'produccion' || entorno === 'production') razones.push('el entorno es de producción')

  if ((env.APP_URL ?? '').trim() === '') {
    razones.push('falta APP_URL (debe ser http://localhost:3000 o similar)')
  } else {
    const problema = problemaDeUrlLocal('la dirección pública de la aplicación (APP_URL)', env.APP_URL as string)
    if (problema !== null) razones.push(problema)
  }
  // Auth.js puede tomar su dirección pública de estas variables: si existen, también deben ser locales.
  for (const nombre of ['AUTH_URL', 'NEXTAUTH_URL'] as const) {
    if ((env[nombre] ?? '').trim() === '') continue
    const problema = problemaDeUrlLocal(nombre, env[nombre] as string)
    if (problema !== null) razones.push(problema)
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
