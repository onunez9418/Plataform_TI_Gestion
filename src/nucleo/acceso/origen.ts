// De dónde viene la petición, para el límite de intentos. Solo se confía en las cabeceras de un proxy
// propio (X-Forwarded-For / X-Real-IP); en la versión local no hay proxy y todo cae en el origen «local».
// Fuera de una petición de Next (pruebas) también cae en «local».

export type LectorDeOrigen = () => Promise<string | undefined> | string | undefined

let lector: LectorDeOrigen | null = null

/** Solo para pruebas. Pasar `null` vuelve a leer las cabeceras de Next. */
export function usarLectorDeOrigen(nuevo: LectorDeOrigen | null): void {
  lector = nuevo
}

export async function leerOrigen(): Promise<string> {
  if (lector) return ((await lector()) ?? '').trim() || 'local'
  try {
    const { headers } = await import('next/headers')
    const h = await headers()
    const reenviado = h.get('x-forwarded-for')?.split(',')[0]?.trim()
    return reenviado || h.get('x-real-ip')?.trim() || 'local'
  } catch {
    return 'local'
  }
}
