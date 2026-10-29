// Armado de las definiciones de campos a partir de lo que se escribe en pantalla (sin React, para probarlo solo).

export type TipoCampo = 'texto' | 'numero' | 'fecha' | 'lista' | 'si_no'
export type Fila = { etiqueta: string; tipo: TipoCampo; opciones: string; obligatorio: boolean }

export const TIPOS: { valor: TipoCampo; etiqueta: string }[] = [
  { valor: 'texto', etiqueta: 'Texto' },
  { valor: 'numero', etiqueta: 'Número' },
  { valor: 'fecha', etiqueta: 'Fecha' },
  { valor: 'lista', etiqueta: 'Lista de opciones' },
  { valor: 'si_no', etiqueta: 'Sí / No' },
]

export const filaVacia = (): Fila => ({ etiqueta: '', tipo: 'texto', opciones: '', obligatorio: false })

function aClave(etiqueta: string): string {
  return etiqueta
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/** Arma las definiciones que espera el servicio; si dos etiquetas dan la misma clave, agrega un número. */
export function aDefiniciones(filas: Fila[]) {
  const usadas = new Map<string, number>()
  return filas
    .filter((f) => f.etiqueta.trim() !== '')
    .map((f) => {
      const base = aClave(f.etiqueta) || 'campo'
      const n = (usadas.get(base) ?? 0) + 1
      usadas.set(base, n)
      return {
        clave: n === 1 ? base : `${base}_${n}`,
        etiqueta: f.etiqueta.trim(),
        tipo: f.tipo,
        ...(f.tipo === 'lista' ? { opciones: f.opciones.split(',').map((o) => o.trim()).filter(Boolean) } : {}),
        obligatorio: f.obligatorio,
      }
    })
}

