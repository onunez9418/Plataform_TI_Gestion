'use server'
import { redirect } from 'next/navigation'
import { cerrarSesion } from '@/nucleo/acceso'

export async function salir(): Promise<void> {
  try {
    await cerrarSesion()
  } catch {
    // Si la sesión ya no existe, igual se vuelve al inicio.
  }
  redirect('/')
}
