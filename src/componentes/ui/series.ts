// Revisión de las series pegadas (sin pantalla, para poder probarla sola).

export type FilaSerie = { numero: number; serie: string; estado: 'ok' | 'repetida' | 'danada'; detalle: string }

/** Excel convierte números largos en notación científica (1,23E+11); esa serie ya perdió dígitos. */
const PARECE_DANADA = /^\d+([.,]\d+)?e[+-]?\d+$/i

export function analizarSeries(texto: string): FilaSerie[] {
  const partes = texto.split(/[\n\r;\t,]+/).map((s) => s.trim()).filter((s) => s !== '')
  const vistas = new Map<string, number>()
  return partes.map((serie, i) => {
    const numero = i + 1
    const clave = serie.toUpperCase()
    const antes = vistas.get(clave)
    if (antes !== undefined) return { numero, serie, estado: 'repetida', detalle: `Repetida: ya está en la fila ${antes}.` }
    vistas.set(clave, numero)
    if (PARECE_DANADA.test(serie)) return { numero, serie, estado: 'danada', detalle: 'Parece dañada por Excel (notación científica). Pegue la serie como texto.' }
    return { numero, serie, estado: 'ok', detalle: 'Correcta' }
  })
}

