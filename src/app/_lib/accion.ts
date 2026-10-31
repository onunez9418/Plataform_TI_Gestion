// Envoltorio común de las acciones de pantalla: lee el contexto de la empresa de la dirección,
// llama al servicio y devuelve el resultado (o el mensaje del servidor). No hay reglas de negocio aquí.
import { revalidatePath } from 'next/cache'
import { obtenerContexto } from '@/nucleo/acceso'
import type { Contexto } from '@/nucleo/tipos-comunes'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'
import { ejecutar } from './resultado'

export async function enEmpresa<T>(
  empresa: string,
  trabajo: (ctx: Contexto) => Promise<T>,
  /** Rutas (sin /e/{empresa}) cuyo contenido cambia y se debe volver a leer. */
  refrescar: readonly string[] = [],
): Promise<ResultadoAccion<T>> {
  const r = await ejecutar(async () => trabajo(await obtenerContexto(empresa)))
  if (r.ok) {
    for (const ruta of refrescar) revalidatePath(`/e/${empresa}${ruta}`)
    // Y todo lo de la empresa (contadores, listas relacionadas): una sola fuente de verdad después de guardar.
    revalidatePath(`/e/${empresa}`, 'layout')
  }
  return r
}
