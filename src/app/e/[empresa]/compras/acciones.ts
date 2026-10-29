'use server'
import { crearOrden } from '@/modulos/compras'
import { enEmpresa } from '@/app/_lib/accion'
import { texto } from '@/app/_lib/resultado'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

type LineaCruda = { skuId?: unknown; cantidad?: unknown; precioUnitario?: unknown }

export async function crear(empresa: string, datos: FormData): Promise<ResultadoAccion<{ id: string }>> {
  let crudas: LineaCruda[] = []
  try {
    const v: unknown = JSON.parse(String(datos.get('lineas') ?? '[]'))
    if (Array.isArray(v)) crudas = v as LineaCruda[]
  } catch {
    return { ok: false, error: { codigo: 'VALIDACION', mensaje: 'No se pudieron leer las líneas. Recargue la página e intente de nuevo.' } }
  }
  const lineas = crudas.map((l) => ({ skuId: String(l.skuId ?? ''), cantidad: Number(l.cantidad), precioUnitario: Number(l.precioUnitario) }))
  return enEmpresa(empresa, async (ctx) => {
    const orden = await crearOrden(ctx, { proveedorId: texto(datos, 'proveedorId') ?? '', lineas })
    return { id: orden.id }
  }, ['/compras'])
}
