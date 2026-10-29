'use server'
import { asignarActivo, devolverActivo } from '@/modulos/inventario'
import { enEmpresa } from '@/app/_lib/accion'
import { texto } from '@/app/_lib/resultado'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

export async function asignar(empresa: string, activoId: string, datos: FormData): Promise<ResultadoAccion<unknown>> {
  const personaId = texto(datos, 'personaId') ?? ''
  return enEmpresa(empresa, (ctx) => asignarActivo(ctx, { activoId, personaId }), ['/inventario', `/inventario/${activoId}`])
}

export async function devolver(empresa: string, activoId: string, datos: FormData): Promise<ResultadoAccion<unknown>> {
  const ubicacionId = texto(datos, 'ubicacionId') ?? ''
  return enEmpresa(empresa, (ctx) => devolverActivo(ctx, { activoId, ubicacionId }), ['/inventario', `/inventario/${activoId}`])
}
