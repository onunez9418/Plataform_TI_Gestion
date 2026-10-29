import { validacion } from '../../nucleo/errores'

const CORREO_VALIDO = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/

type Reglas = { etiqueta: string; min?: number; max: number }

/** Texto obligatorio, recortado, con largo. Acumula el error en `campos` en vez de lanzar. */
export function textoObligatorio(valor: unknown, campo: string, r: Reglas, campos: Record<string, string>): string {
  const t = typeof valor === 'string' ? valor.trim() : ''
  const min = r.min ?? 2
  if (t.length < min || t.length > r.max) campos[campo] = `${r.etiqueta} debe tener entre ${min} y ${r.max} caracteres.`
  return t
}

/** Texto opcional: vacío o ausente = null. */
export function textoOpcional(valor: unknown, campo: string, r: Reglas, campos: Record<string, string>): string | null {
  if (valor === undefined || valor === null) return null
  const t = typeof valor === 'string' ? valor.trim() : ''
  if (t === '') return null
  if (t.length > r.max) campos[campo] = `${r.etiqueta} no puede pasar de ${r.max} caracteres.`
  return t
}

export function correoOpcional(valor: unknown, campo: string, campos: Record<string, string>): string | null {
  const t = textoOpcional(valor, campo, { etiqueta: 'El correo', max: 254 }, campos)
  if (t !== null && !CORREO_VALIDO.test(t)) campos[campo] = 'Escriba un correo válido.'
  return t
}

export function terminar(campos: Record<string, string>, mensaje = 'Revise los datos del formulario.'): void {
  if (Object.keys(campos).length > 0) throw validacion(mensaje, campos)
}
