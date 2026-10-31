'use server'
import { invitarUsuario, cambiarRol, suspender, reactivar } from '@/modulos/usuarios'
import { enEmpresa } from '@/app/_lib/accion'
import { texto } from '@/app/_lib/resultado'
import { rutaDeEnlace } from '@/app/_lib/enlace'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

export async function invitar(empresa: string, datos: FormData): Promise<ResultadoAccion<{ ruta?: string }>> {
  const correo = texto(datos, 'correo') ?? ''
  const nombre = texto(datos, 'nombre') ?? ''
  const rolId = texto(datos, 'rolId') ?? ''
  return enEmpresa(empresa, async (ctx) => {
    const r = await invitarUsuario(ctx, { correo, nombre, rolId })
    return { ruta: r.enlaceLocal ? rutaDeEnlace(r.enlaceLocal) : undefined }
  }, ['/usuarios'])
}

export async function cambiarRolDe(empresa: string, usuarioId: string, rolId: string): Promise<ResultadoAccion<void>> {
  return enEmpresa(empresa, (ctx) => cambiarRol(ctx, { usuarioId, rolId }), ['/usuarios', '/roles'])
}

export async function suspenderA(empresa: string, usuarioId: string): Promise<ResultadoAccion<void>> {
  return enEmpresa(empresa, (ctx) => suspender(ctx, { usuarioId }), ['/usuarios', '/roles'])
}

export async function reactivarA(empresa: string, usuarioId: string): Promise<ResultadoAccion<void>> {
  return enEmpresa(empresa, (ctx) => reactivar(ctx, { usuarioId }), ['/usuarios', '/roles'])
}
