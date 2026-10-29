import { noImplementado } from '../../nucleo/errores'
import type { Contexto } from '../../nucleo/tipos-comunes'
import type { EntradaCrearSku, EntradaListarSkus, Sku } from './tipos'

export type * from './tipos'

export async function listarSkus(_ctx: Contexto, _e?: EntradaListarSkus): Promise<Sku[]> { throw noImplementado('listarSkus') }
export async function crearSku(_ctx: Contexto, _e: EntradaCrearSku): Promise<Sku> { throw noImplementado('crearSku') }
export async function obtenerSku(_ctx: Contexto, _id: string): Promise<Sku> { throw noImplementado('obtenerSku') }
