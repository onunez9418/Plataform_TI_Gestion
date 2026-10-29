// Puente entre las acciones de pantalla y los servicios: convierte un error de negocio lanzado
// por un servicio en un resultado que la pantalla muestra tal cual (el mensaje es del servidor).
import type { ResultadoAccion, ErrorPantallaDatos } from '@/componentes/ui/tipos-accion'

function esErrorNegocio(e: unknown): e is ErrorPantallaDatos {
  return typeof e === 'object' && e !== null && 'codigo' in e && 'mensaje' in e && typeof (e as { mensaje: unknown }).mensaje === 'string'
}

/** Las redirecciones y "no encontrado" de Next se lanzan como errores: no se deben tragar. */
function esControlDeNext(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'digest' in e && String((e as { digest: unknown }).digest).startsWith('NEXT_')
}

export function aErrorPantalla(e: unknown): ErrorPantallaDatos {
  if (esErrorNegocio(e)) return { codigo: String(e.codigo), mensaje: e.mensaje, campos: e.campos }
  return { codigo: 'INESPERADO', mensaje: 'Ocurrió un problema inesperado. Intente de nuevo; si sigue igual, avise a TI.' }
}

export async function ejecutar<T>(trabajo: () => Promise<T>): Promise<ResultadoAccion<T>> {
  try {
    return { ok: true, datos: await trabajo() }
  } catch (e) {
    if (esControlDeNext(e)) throw e
    return { ok: false, error: aErrorPantalla(e) }
  }
}

/** Lee un texto de un formulario; vacío se vuelve undefined. */
export function texto(datos: FormData, nombre: string): string | undefined {
  const v = datos.get(nombre)
  if (typeof v !== 'string') return undefined
  const limpio = v.trim()
  return limpio === '' ? undefined : limpio
}

export function numero(datos: FormData, nombre: string): number | undefined {
  const t = texto(datos, nombre)
  if (t === undefined) return undefined
  const n = Number(t.replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}

export function marcado(datos: FormData, nombre: string): boolean {
  return datos.get(nombre) !== null
}
