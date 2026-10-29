'use client'
// Editor de los campos propios de una categoría. Las claves técnicas se arman solas a partir de la etiqueta.
// El conjunto viaja en un solo dato oculto («campos», en JSON); el servidor valida todo.
import { useState } from 'react'

type TipoCampo = 'texto' | 'numero' | 'fecha' | 'lista' | 'si_no'
type Fila = { etiqueta: string; tipo: TipoCampo; opciones: string; obligatorio: boolean }

const TIPOS: { valor: TipoCampo; etiqueta: string }[] = [
  { valor: 'texto', etiqueta: 'Texto' },
  { valor: 'numero', etiqueta: 'Número' },
  { valor: 'fecha', etiqueta: 'Fecha' },
  { valor: 'lista', etiqueta: 'Lista de opciones' },
  { valor: 'si_no', etiqueta: 'Sí / No' },
]

const filaVacia = (): Fila => ({ etiqueta: '', tipo: 'texto', opciones: '', obligatorio: false })

function aClave(etiqueta: string): string {
  return etiqueta
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/** Arma las definiciones que espera el servicio; si dos etiquetas dan la misma clave, agrega un número. */
function aDefiniciones(filas: Fila[]) {
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

export function EditorCampos({ unico, prefijoId, textoVacio }: { unico?: boolean; prefijoId: string; textoVacio?: string }) {
  const [filas, setFilas] = useState<Fila[]>(unico ? [filaVacia()] : [])

  function cambiar(i: number, parte: Partial<Fila>) {
    setFilas((previas) => previas.map((f, j) => (j === i ? { ...f, ...parte } : f)))
  }

  return (
    <fieldset>
      <legend>{unico ? 'Campo nuevo' : 'Campos propios de la categoría'}</legend>
      {!unico && filas.length === 0 ? (
        <p className="suave chica" data-testid={`${prefijoId}-sin-campos`}>{textoVacio ?? 'Todavía no hay campos. Agregue los que necesite (por ejemplo: Procesador, Memoria RAM).'}</p>
      ) : null}
      {filas.map((f, i) => {
        const id = `${prefijoId}-${i}`
        return (
          <div className="tarjeta" key={i} style={{ marginBottom: 'var(--e3)' }} data-testid={`${id}-fila`}>
            <div className="fila-form">
              <div className="campo">
                <label htmlFor={`${id}-etiqueta`}>Nombre del campo</label>
                <input id={`${id}-etiqueta`} type="text" value={f.etiqueta} onChange={(e) => cambiar(i, { etiqueta: e.target.value })} data-testid={`${id}-etiqueta`} placeholder="Memoria RAM (GB)" autoComplete="off" />
              </div>
              <div className="campo">
                <label htmlFor={`${id}-tipo`}>Tipo de dato</label>
                <select id={`${id}-tipo`} value={f.tipo} onChange={(e) => cambiar(i, { tipo: e.target.value as TipoCampo })} data-testid={`${id}-tipo`}>
                  {TIPOS.map((t) => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
                </select>
              </div>
            </div>
            {f.tipo === 'lista' ? (
              <div className="campo">
                <label htmlFor={`${id}-opciones`}>Opciones (separadas por coma)</label>
                <input id={`${id}-opciones`} type="text" value={f.opciones} onChange={(e) => cambiar(i, { opciones: e.target.value })} data-testid={`${id}-opciones`} placeholder="SSD, HDD" autoComplete="off" />
              </div>
            ) : null}
            <div className="fila entre">
              <div className="opcion">
                <input id={`${id}-obligatorio`} type="checkbox" checked={f.obligatorio} onChange={(e) => cambiar(i, { obligatorio: e.target.checked })} data-testid={`${id}-obligatorio`} />
                <label htmlFor={`${id}-obligatorio`}>Obligatorio al crear un SKU</label>
              </div>
              {!unico ? (
                <button type="button" className="btn chico peligro-suave" onClick={() => setFilas((p) => p.filter((_, j) => j !== i))} data-testid={`${id}-quitar`}>
                  Quitar este campo
                </button>
              ) : null}
            </div>
          </div>
        )
      })}
      {!unico ? (
        <button type="button" className="btn chico" onClick={() => setFilas((p) => [...p, filaVacia()])} data-testid={`${prefijoId}-agregar`}>
          Agregar un campo
        </button>
      ) : null}
      <input type="hidden" name="campos" value={JSON.stringify(aDefiniciones(filas))} />
    </fieldset>
  )
}
