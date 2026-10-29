'use server'
import {
  crearUbicacion, editarUbicacion, crearProveedor, editarProveedor, crearPersona, editarPersona,
} from '@/modulos/catalogos'
import { enEmpresa } from '@/app/_lib/accion'
import { marcado, texto } from '@/app/_lib/resultado'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'
import { esTipoCatalogo } from '../tipos'

const sinTipo = (): ResultadoAccion<never> => ({ ok: false, error: { codigo: 'NO_ENCONTRADO', mensaje: 'Ese catálogo no existe.' } })

export async function crearItem(empresa: string, tipo: string, datos: FormData): Promise<ResultadoAccion<unknown>> {
  if (!esTipoCatalogo(tipo)) return sinTipo()
  const nombre = texto(datos, 'nombre') ?? ''
  const ruta = [`/catalogos/${tipo}`]
  switch (tipo) {
    case 'ubicaciones':
      return enEmpresa(empresa, (ctx) => crearUbicacion(ctx, { nombre, descripcion: texto(datos, 'descripcion') }), ruta)
    case 'proveedores':
      return enEmpresa(empresa, (ctx) => crearProveedor(ctx, { nombre, documento: texto(datos, 'documento'), contacto: texto(datos, 'contacto') }), ruta)
    case 'personas':
      return enEmpresa(empresa, (ctx) => crearPersona(ctx, { nombre, correo: texto(datos, 'correo'), area: texto(datos, 'area') }), ruta)
  }
}

export async function editarItem(empresa: string, tipo: string, id: string, datos: FormData): Promise<ResultadoAccion<unknown>> {
  if (!esTipoCatalogo(tipo)) return sinTipo()
  const nombre = texto(datos, 'nombre')
  const activo = marcado(datos, 'activo')
  const ruta = [`/catalogos/${tipo}`]
  switch (tipo) {
    case 'ubicaciones':
      return enEmpresa(empresa, (ctx) => editarUbicacion(ctx, { id, nombre, descripcion: texto(datos, 'descripcion') ?? null, activo }), ruta)
    case 'proveedores':
      return enEmpresa(empresa, (ctx) => editarProveedor(ctx, { id, nombre, documento: texto(datos, 'documento') ?? null, contacto: texto(datos, 'contacto') ?? null, activo }), ruta)
    case 'personas':
      return enEmpresa(empresa, (ctx) => editarPersona(ctx, { id, nombre, correo: texto(datos, 'correo') ?? null, area: texto(datos, 'area') ?? null, activo }), ruta)
  }
}
