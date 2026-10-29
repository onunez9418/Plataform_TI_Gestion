'use server'
import { crearSku } from '@/modulos/skus'
import type { ControlSku } from '@/modulos/skus'
import { enEmpresa } from '@/app/_lib/accion'
import { texto } from '@/app/_lib/resultado'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

/** Los valores de los campos de la categoría los arma el formulario (ya con su tipo) y viajan en «valores». */
function leerValores(datos: FormData): Record<string, unknown> | null {
  const crudo = datos.get('valores')
  if (typeof crudo !== 'string' || crudo === '') return {}
  try {
    const v: unknown = JSON.parse(crudo)
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export async function crear(empresa: string, datos: FormData): Promise<ResultadoAccion<{ codigo: string }>> {
  const valores = leerValores(datos)
  if (valores === null) return { ok: false, error: { codigo: 'VALIDACION', mensaje: 'No se pudieron leer los datos del formulario. Recargue la página e intente de nuevo.' } }
  const control = texto(datos, 'control') as ControlSku | undefined
  return enEmpresa(empresa, async (ctx) => {
    const sku = await crearSku(ctx, {
      categoriaId: texto(datos, 'categoriaId') ?? '',
      nombre: texto(datos, 'nombre') ?? '',
      control: control ?? ('' as ControlSku),
      codigo: texto(datos, 'codigo'),
      valores,
    })
    return { codigo: sku.codigo }
  }, ['/skus', '/inventario'])
}
