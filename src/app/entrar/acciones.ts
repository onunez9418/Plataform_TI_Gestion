'use server'
import { solicitarEnlace } from '@/nucleo/acceso'
import { ejecutar, texto } from '@/app/_lib/resultado'
import { rutaDeEnlace } from '@/app/_lib/enlace'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

export type DatosPedirEnlace = { ruta?: string }

export async function pedirEnlace(datos: FormData): Promise<ResultadoAccion<DatosPedirEnlace>> {
  const correo = texto(datos, 'correo')
  if (!correo) return { ok: false, error: { codigo: 'VALIDACION', mensaje: 'Escriba su correo.', campos: { correo: 'Este dato es obligatorio.' } } }
  return ejecutar(async () => {
    const r = await solicitarEnlace(correo)
    return { ruta: r.enlaceLocal ? rutaDeEnlace(r.enlaceLocal) : undefined }
  })
}
