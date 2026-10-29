'use client'
// Editor de los campos propios de una categoría. Las claves técnicas se arman solas a partir de la etiqueta.
// El conjunto viaja en un solo dato oculto («campos», en JSON); el servidor valida todo.
import { useState } from 'react'
import { aDefiniciones, filaVacia, TIPOS, type Fila, type TipoCampo } from './definiciones'

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
