'use server'
import { crearCategoria, agregarCampo } from '@/modulos/categorias'
import type { CampoDef } from '@/modulos/categorias'
import { enEmpresa } from '@/app/_lib/accion'
import { texto } from '@/app/_lib/resultado'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

/** Lee el dato oculto «campos» (lo arma el editor). Si viene dañado, el servicio de todos modos valida. */
function leerCampos(datos: FormData): CampoDef[] | null {
  const crudo = datos.get('campos')
  if (typeof crudo !== 'string' || crudo === '') return []
  try {
    const v: unknown = JSON.parse(crudo)
    return Array.isArray(v) ? (v as CampoDef[]) : null
  } catch {
    return null
  }
}

const dañado = (): ResultadoAccion<never> => ({ ok: false, error: { codigo: 'VALIDACION', mensaje: 'No se pudieron leer los campos. Recargue la página e intente de nuevo.' } })

export async function crear(empresa: string, datos: FormData): Promise<ResultadoAccion<unknown>> {
  const campos = leerCampos(datos)
  if (campos === null) return dañado()
  const nombre = texto(datos, 'nombre') ?? ''
  const prefijo = (texto(datos, 'prefijo') ?? '').toUpperCase()
  return enEmpresa(empresa, (ctx) => crearCategoria(ctx, { nombre, prefijo, campos }), ['/categorias', '/skus'])
}

export async function agregar(empresa: string, categoriaId: string, datos: FormData): Promise<ResultadoAccion<unknown>> {
  const campos = leerCampos(datos)
  if (campos === null) return dañado()
  const campo = campos[0]
  if (!campo) return { ok: false, error: { codigo: 'VALIDACION', mensaje: 'Escriba el nombre del campo.' } }
  return enEmpresa(empresa, (ctx) => agregarCampo(ctx, { categoriaId, campo }), ['/categorias', '/skus'])
}
