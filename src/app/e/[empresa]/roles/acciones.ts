'use server'
import { crearRol, editarRol } from '@/modulos/roles'
import { enEmpresa } from '@/app/_lib/accion'
import { texto } from '@/app/_lib/resultado'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

function permisosMarcados(datos: FormData): string[] {
  return datos.getAll('permisos').filter((v): v is string => typeof v === 'string')
}

export async function crear(empresa: string, datos: FormData): Promise<ResultadoAccion<unknown>> {
  const nombre = texto(datos, 'nombre') ?? ''
  const permisos = permisosMarcados(datos)
  return enEmpresa(empresa, (ctx) => crearRol(ctx, { nombre, permisos }), ['/roles', '/usuarios'])
}

export async function editar(empresa: string, rolId: string, datos: FormData): Promise<ResultadoAccion<unknown>> {
  const nombre = texto(datos, 'nombre')
  const permisos = permisosMarcados(datos)
  return enEmpresa(empresa, (ctx) => editarRol(ctx, { rolId, nombre, permisos }), ['/roles', '/usuarios'])
}
