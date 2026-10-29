'use server'
import { redirect } from 'next/navigation'
import { canjearEnlace } from '@/nucleo/acceso'
import { ejecutar, texto } from '@/app/_lib/resultado'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

/** El canje ocurre solo aquí, por POST al pulsar «Entrar». Abrir el enlace no canjea nada. */
export async function canjear(datos: FormData): Promise<ResultadoAccion<never>> {
  const token = texto(datos, 'token')
  if (!token) return { ok: false, error: { codigo: 'ENLACE_INVALIDO', mensaje: 'Falta el enlace. Pida uno nuevo desde la pantalla de entrada.' } }
  const r = await ejecutar(() => canjearEnlace(token))
  if (!r.ok) return r
  const empresas = r.datos.empresas
  redirect(empresas.length === 1 ? `/e/${empresas[0].slug}` : '/empresas')
}
