'use server'
import { registrarActivos } from '@/modulos/inventario'
import { enEmpresa } from '@/app/_lib/accion'
import { numero, texto } from '@/app/_lib/resultado'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

function leerSeries(datos: FormData): string[] | undefined {
  const crudo = datos.get('series')
  if (typeof crudo !== 'string' || crudo === '') return undefined
  try {
    const v: unknown = JSON.parse(crudo)
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined
  } catch {
    return undefined
  }
}

export async function registrar(empresa: string, datos: FormData): Promise<ResultadoAccion<unknown>> {
  const series = leerSeries(datos)
  const cantidad = numero(datos, 'cantidad')
  return enEmpresa(empresa, (ctx) => registrarActivos(ctx, {
    skuId: texto(datos, 'skuId') ?? '',
    ubicacionId: texto(datos, 'ubicacionId') ?? '',
    ...(series ? { series } : {}),
    ...(cantidad !== undefined ? { cantidad } : {}),
  }), ['/inventario', '/skus'])
}
