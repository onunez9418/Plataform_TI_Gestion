'use client'
// Botón que ejecuta una acción de servidor sin formulario (suspender, devolver, aprobar...).
// Si el servidor la rechaza, muestra su mensaje tal cual debajo del botón.
import { useState, useTransition } from 'react'
import type { ResultadoAccion } from './tipos-accion'
import { recargarConMensaje } from './recarga'

type Props = {
  accion: () => Promise<ResultadoAccion<unknown>>
  texto: string
  testid?: string
  clase?: string
  /** Pide confirmar antes de ejecutar (para acciones que no se deshacen fácil). */
  confirmar?: string
  /** Mensaje que se muestra al terminar bien (la pantalla se recarga para mostrar lo nuevo). */
  exito?: string
}

export function BotonAccion({ accion, texto, testid, clase = 'btn chico', confirmar, exito }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [enCurso, iniciar] = useTransition()

  function alPulsar() {
    if (confirmar && !window.confirm(confirmar)) return
    setError(null)
    iniciar(async () => {
      try {
        const r = await accion()
        if (!r.ok) setError(r.error.mensaje)
        else recargarConMensaje(exito ? { texto: exito } : null)
      } catch (e) {
        if (e && typeof e === 'object' && 'digest' in e && String((e as { digest: unknown }).digest).startsWith('NEXT_')) throw e
        setError('No se pudo completar la acción. Intente de nuevo.')
      }
    })
  }

  return (
    <span className="btn-con-razon">
      <button type="button" className={`${clase}${enCurso ? ' cargando' : ''}`} onClick={alPulsar} disabled={enCurso} data-testid={testid}>
        {enCurso ? 'Un momento…' : texto}
      </button>
      {error ? (
        <span className="razon" role="alert" data-testid={testid ? `${testid}-error` : 'error-accion'}>
          <span>{error}</span>
        </span>
      ) : null}
    </span>
  )
}
