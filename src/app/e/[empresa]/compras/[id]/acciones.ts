'use server'
import { aprobarOrden, enviarAAprobacion, rechazarOrden, recibirOrden } from '@/modulos/compras'
import { enEmpresa } from '@/app/_lib/accion'
import { texto } from '@/app/_lib/resultado'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

const rutas = (id: string) => ['/compras', `/compras/${id}`, '/inventario']

export async function enviar(empresa: string, id: string): Promise<ResultadoAccion<unknown>> {
  return enEmpresa(empresa, (ctx) => enviarAAprobacion(ctx, id), rutas(id))
}

export async function aprobar(empresa: string, id: string): Promise<ResultadoAccion<unknown>> {
  return enEmpresa(empresa, (ctx) => aprobarOrden(ctx, id), rutas(id))
}

export async function rechazar(empresa: string, id: string, datos: FormData): Promise<ResultadoAccion<unknown>> {
  const motivo = texto(datos, 'motivo') ?? ''
  return enEmpresa(empresa, (ctx) => rechazarOrden(ctx, { id, motivo }), rutas(id))
}

/** Lee, por cada línea marcada, la cantidad recibida y (si es por serie) la lista de series que armó la pantalla. */
export async function recibir(empresa: string, ordenId: string, datos: FormData): Promise<ResultadoAccion<unknown>> {
  const lineas: { lineaId: string; cantidad: number; series?: string[] }[] = []
  for (const valor of datos.getAll('lineaId')) {
    const lineaId = String(valor)
    const cantidad = Number(String(datos.get(`cantidad_${lineaId}`) ?? '0').replace(',', '.'))
    if (!Number.isFinite(cantidad) || cantidad <= 0) continue
    const crudo = datos.get(`series_${lineaId}`)
    let series: string[] | undefined
    if (typeof crudo === 'string' && crudo !== '') {
      try {
        const v: unknown = JSON.parse(crudo)
        if (Array.isArray(v)) series = v.filter((x): x is string => typeof x === 'string')
      } catch {
        /* se envía sin series y el servidor lo rechaza con su mensaje */
      }
    }
    lineas.push({ lineaId, cantidad, ...(series ? { series } : {}) })
  }
  return enEmpresa(empresa, (ctx) => recibirOrden(ctx, { ordenId, ubicacionId: texto(datos, 'ubicacionId') ?? '', lineas }), rutas(ordenId))
}
