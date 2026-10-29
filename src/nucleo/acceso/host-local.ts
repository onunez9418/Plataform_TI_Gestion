// Control de la cabecera `Host` en MODO_LOCAL (H-SEG-L02, «DNS rebinding»).
// Una página maliciosa puede hacer que su propio dominio apunte a 127.0.0.1 y así hablar con la aplicación
// local desde el navegador de la persona. En ese caso el navegador manda `Host: dominio-malo:3000`, y Next.js
// lo acepta porque compara `Origin` con `Host` y ambos coinciden. Aquí se rechaza todo `Host` que no sea
// exactamente `localhost:<puerto>` o `127.0.0.1:<puerto>`, con el puerto de APP_URL.
//
// Archivo sin dependencias de Node: lo usa `src/middleware.ts`, que corre en el entorno ligero («edge») de Next.js.
// Fuera de MODO_LOCAL no decide nada: en la nube la lista de dominios la fija el alojamiento (pendiente de DevOps).

export type EntornoHost = Readonly<Record<string, string | undefined>>

export type DecisionHost = { permitido: true } | { permitido: false; motivo: string }

export const RUTA_SALUD = '/api/salud'

export const MENSAJE_HOST_RECHAZADO =
  'Solicitud rechazada: esta aplicación de prueba solo responde en la dirección http://localhost o http://127.0.0.1 ' +
  'de esta misma computadora. Abra la aplicación escribiendo esa dirección en el navegador.'

const NOMBRES_LOCALES = ['localhost', '127.0.0.1']

/** Puerto de APP_URL tal como lo escribe un navegador en `Host` ('' si es el puerto por omisión). null = APP_URL ilegible. */
function puertoDeAppUrl(appUrl: string | undefined): string | null {
  try {
    const url = new URL((appUrl ?? '').trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.port
  } catch {
    return null
  }
}

const sinPuerto = (host: string): string => host.replace(/:\d{1,5}$/, '')

/** ¿Este valor de `Host` es exactamente localhost:<puerto> o 127.0.0.1:<puerto>? */
function hostExacto(host: string, puerto: string): boolean {
  const sufijo = puerto === '' ? '' : `:${puerto}`
  return NOMBRES_LOCALES.some((n) => host === `${n}${sufijo}`)
}

/**
 * Decide si una petición puede atenderse según su `Host` (y `X-Forwarded-Host`, si viene).
 * - Sin MODO_LOCAL: no opina (permitido).
 * - Con MODO_LOCAL: `Host` debe ser localhost:<puerto> o 127.0.0.1:<puerto>.
 * - `/api/salud` (healthcheck de Docker, dentro del contenedor) acepta localhost o 127.0.0.1 con cualquier puerto.
 */
export function evaluarHost(
  peticion: { host: string | null; xForwardedHost?: string | null; ruta: string },
  env: EntornoHost = process.env,
): DecisionHost {
  if (env.MODO_LOCAL !== '1') return { permitido: true }

  const rechazo = (motivo: string): DecisionHost => ({ permitido: false, motivo })
  const puerto = puertoDeAppUrl(env.APP_URL)
  const esSalud = peticion.ruta === RUTA_SALUD
  if (puerto === null && !esSalud) return rechazo('APP_URL ilegible')

  const aceptable = (valor: string): boolean => {
    const limpio = valor.trim().toLowerCase()
    if (esSalud) return NOMBRES_LOCALES.includes(sinPuerto(limpio))
    return hostExacto(limpio, puerto as string)
  }

  if (!peticion.host || !aceptable(peticion.host)) return rechazo('Host no permitido')
  // Un proxy ajeno que reescribe el destino también es señal de ataque; en local no hay proxy.
  if (peticion.xForwardedHost && !aceptable(peticion.xForwardedHost)) return rechazo('X-Forwarded-Host no permitido')
  return { permitido: true }
}
