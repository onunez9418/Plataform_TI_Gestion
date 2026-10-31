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

/** Código corto para que la persona lo lea a TI y TI lo encuentre en el registro del servidor. */
function codigoCorto(): string {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(4))
  return Array.from(bytes, (b) => letras[b % letras.length]).join('')
}

/**
 * Registra en el servidor un error inesperado, sin datos personales: solo el código corto,
 * el tipo de error y su código técnico. Nunca el mensaje (puede traer valores) ni el formulario.
 */
function registrarInesperado(e: unknown, codigo: string): void {
  const tipo = e instanceof Error ? e.name : typeof e
  const tecnico = typeof e === 'object' && e !== null && 'code' in e ? String((e as { code: unknown }).code).slice(0, 40) : undefined
  console.error(`[error-inesperado ${codigo}] tipo=${tipo}${tecnico ? ` codigo-tecnico=${tecnico}` : ''}`)
}

export function aErrorPantalla(e: unknown): ErrorPantallaDatos {
  if (esErrorNegocio(e)) return { codigo: String(e.codigo), mensaje: e.mensaje, campos: e.campos }
  const codigo = codigoCorto()
  registrarInesperado(e, codigo)
  return { codigo: 'INESPERADO', mensaje: `Algo salió mal (código ${codigo}). Intente de nuevo; si sigue igual, avise a TI con ese código.` }
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
