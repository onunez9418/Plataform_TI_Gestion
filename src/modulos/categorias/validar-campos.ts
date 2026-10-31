// Validador único de campos personalizados (ADR-17): lo usan categorías (definiciones) y SKU (valores).
// Pantallas, importación y API deben validar con estas mismas funciones.

import { validacion } from '../../nucleo/errores'
import type { CampoDef, TipoCampo } from './tipos'

export const TIPOS_DE_CAMPO: readonly TipoCampo[] = ['texto', 'numero', 'fecha', 'lista', 'si_no']
export const MAX_CAMPOS_POR_CATEGORIA = 40
const MAX_TEXTO = 255
const MAX_OPCIONES = 100
const CLAVE_VALIDA = /^[a-z][a-z0-9_]{0,39}$/

/** «Fecha de compra» -> `fecha_de_compra`. Se usa si la pantalla no manda una clave. */
export function claveDesdeEtiqueta(etiqueta: string): string {
  const base = etiqueta.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  const conLetra = /^[a-z]/.test(base) ? base : `c_${base}`
  return conLetra.slice(0, 40).replace(/_+$/, '') || 'campo'
}

/** Valida y normaliza UNA definición de campo. Acumula errores en `errores` bajo `prefijoError`. */
export function normalizarDefinicion(c: CampoDef, errores: Record<string, string>, prefijoError = 'campo'): CampoDef {
  const etiqueta = typeof c?.etiqueta === 'string' ? c.etiqueta.trim() : ''
  if (etiqueta.length < 1 || etiqueta.length > 60) errores[`${prefijoError}.etiqueta`] = 'El nombre del campo debe tener entre 1 y 60 caracteres.'
  const claveBruta = typeof c?.clave === 'string' ? c.clave.trim() : ''
  const clave = claveBruta !== '' ? claveBruta : claveDesdeEtiqueta(etiqueta)
  if (!CLAVE_VALIDA.test(clave)) errores[`${prefijoError}.clave`] = 'La clave solo admite minúsculas, números y guion bajo, y empieza con letra.'
  const tipo = c?.tipo
  if (!TIPOS_DE_CAMPO.includes(tipo)) errores[`${prefijoError}.tipo`] = 'Elija un tipo: texto, número, fecha, lista o sí/no.'

  let opciones: string[] | undefined
  if (tipo === 'lista') {
    const crudas = Array.isArray(c.opciones) ? c.opciones : []
    const limpias = [...new Set(crudas.map((o) => String(o).trim()).filter((o) => o !== ''))]
    if (limpias.length === 0) errores[`${prefijoError}.opciones`] = 'Escriba al menos una opción para la lista.'
    else if (limpias.length > MAX_OPCIONES || limpias.some((o) => o.length > MAX_TEXTO)) errores[`${prefijoError}.opciones`] = 'Máximo 100 opciones de hasta 255 caracteres.'
    opciones = limpias
  }
  return {
    clave, etiqueta, tipo, obligatorio: Boolean(c?.obligatorio), ...(opciones ? { opciones } : {}),
  }
}

const fechaReal = (t: string): boolean => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  if (!m) return false
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const f = new Date(Date.UTC(a, mes - 1, d))
  return f.getUTCFullYear() === a && f.getUTCMonth() === mes - 1 && f.getUTCDate() === d
}

/** Un valor «simple» (texto o número). Listas y objetos no son ni lo uno ni lo otro: String([16]) daría «16» y String({}) «[object Object]». */
const esTextoONumero = (v: unknown): v is string | number => typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v))

const vacio = (v: unknown): boolean => v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

/**
 * Valida los valores de un SKU contra los campos de su categoría y los deja normalizados
 * (números como número, textos recortados, sí/no como booleano). Lanza VALIDACION con un mensaje por campo.
 */
export function validarValores(definiciones: readonly CampoDef[], valores: unknown): Record<string, unknown> {
  const entrada: Record<string, unknown> =
    valores && typeof valores === 'object' && !Array.isArray(valores) ? (valores as Record<string, unknown>) : {}
  const errores: Record<string, string> = {}
  const salida: Record<string, unknown> = {}
  const conocidas = new Set(definiciones.map((d) => d.clave))

  for (const clave of Object.keys(entrada)) {
    if (!conocidas.has(clave)) errores[clave] = 'Este campo no existe en la categoría.'
  }
  for (const d of definiciones) {
    const crudo = entrada[d.clave]
    if (vacio(crudo)) {
      if (d.obligatorio) errores[d.clave] = `«${d.etiqueta}» es obligatorio.`
      continue
    }
    switch (d.tipo) {
      case 'texto': {
        if (!esTextoONumero(crudo)) { errores[d.clave] = `«${d.etiqueta}» debe ser un texto.`; break }
        const t = String(crudo).trim()
        if (t.length > MAX_TEXTO) errores[d.clave] = `«${d.etiqueta}» admite hasta ${MAX_TEXTO} caracteres.`
        else salida[d.clave] = t
        break
      }
      case 'numero': {
        if (!esTextoONumero(crudo)) { errores[d.clave] = `«${d.etiqueta}» debe ser un número.`; break }
        const n = typeof crudo === 'number' ? crudo : /^-?\d+([.,]\d+)?$/.test(String(crudo).trim()) ? Number(String(crudo).trim().replace(',', '.')) : NaN
        if (!Number.isFinite(n) || Math.abs(n) > 1e12) errores[d.clave] = `«${d.etiqueta}» debe ser un número.`
        else salida[d.clave] = n
        break
      }
      case 'fecha': {
        if (typeof crudo !== 'string') { errores[d.clave] = `«${d.etiqueta}» debe ser una fecha válida (AAAA-MM-DD).`; break }
        const t = crudo.trim()
        if (!fechaReal(t)) errores[d.clave] = `«${d.etiqueta}» debe ser una fecha válida (AAAA-MM-DD).`
        else salida[d.clave] = t
        break
      }
      case 'lista': {
        if (!esTextoONumero(crudo)) { errores[d.clave] = `«${d.etiqueta}»: elija una de las opciones de la lista.`; break }
        const t = String(crudo).trim()
        if (!(d.opciones ?? []).includes(t)) errores[d.clave] = `«${d.etiqueta}»: elija una de las opciones de la lista.`
        else salida[d.clave] = t
        break
      }
      case 'si_no': {
        if (typeof crudo === 'boolean') salida[d.clave] = crudo
        else if (crudo === 'true' || crudo === 'false') salida[d.clave] = crudo === 'true'
        else errores[d.clave] = `«${d.etiqueta}» debe ser sí o no.`
        break
      }
    }
  }
  if (Object.keys(errores).length > 0) throw validacion('Revise los campos de la categoría.', errores)
  return salida
}
