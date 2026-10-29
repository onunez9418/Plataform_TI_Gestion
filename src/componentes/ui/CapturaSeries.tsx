'use client'
// Captura de series en bloque: se pega una lista (de Excel, un correo, etc.) y cada fila muestra
// con TEXTO si está bien o qué falla (repetida, vacía, dañada por Excel). Esto es solo ayuda de pantalla;
// el servidor vuelve a validar todo (por ejemplo, series que ya existen) y su mensaje se muestra tal cual.
import { useMemo, useState } from 'react'
import { useErrorDeCampo } from './Formulario'
import { Icono } from './Icono'
import { analizarSeries } from './series'

export function CapturaSeries({ nombre = 'series', prefijoId = 'series', esperadas, etiqueta = 'Series (una por línea)' }: { nombre?: string; prefijoId?: string; esperadas?: number; etiqueta?: string }) {
  const [texto, setTexto] = useState('')
  const filas = useMemo(() => analizarSeries(texto), [texto])
  const errores = filas.filter((f) => f.estado !== 'ok').length
  const validas = filas.length - errores
  const distintaCantidad = esperadas !== undefined && errores === 0 && filas.length > 0 && validas !== esperadas
  const errorEnvio = useErrorDeCampo(`${nombre}_revisadas`)
  const errorServidor = useErrorDeCampo(nombre)

  return (
    <div className="captura" data-testid={`${prefijoId}-captura`}>
      <div className="campo">
        <label htmlFor={`${prefijoId}-texto`}>{etiqueta}</label>
        <textarea
          id={`${prefijoId}-texto`}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={8}
          placeholder={'SN-1001\nSN-1002\nSN-1003'}
          data-testid={`${prefijoId}-texto`}
          aria-describedby={`${prefijoId}-resumen`}
          spellCheck={false}
        />
        <div className="ayuda">Puede pegar una lista desde Excel. Se aceptan líneas, comas o tabuladores.</div>
      </div>
      <div>
        <p id={`${prefijoId}-resumen`} role="status" className="contador-grande" data-testid={`${prefijoId}-resumen`}>
          {filas.length === 0 ? 'Aún no hay series' : `${validas} de ${filas.length} series correctas`}
          {esperadas !== undefined ? ` · se esperan ${esperadas}` : ''}
        </p>
        {distintaCantidad ? (
          <p role="alert" style={{ color: 'var(--c-peligro)', fontWeight: 600 }} data-testid={`${prefijoId}-cantidad`}>
            {validas < esperadas! ? `Faltan ${esperadas! - validas} series.` : `Sobran ${validas - esperadas!} series.`}
          </p>
        ) : null}
        {errorServidor ? (
          <p role="alert" style={{ color: 'var(--c-peligro)', fontWeight: 600 }} data-testid={`${prefijoId}-error-servidor`}>{errorServidor}</p>
        ) : null}
        {errorEnvio && errores === 0 ? (
          <p role="alert" style={{ color: 'var(--c-peligro)', fontWeight: 600 }} data-testid={`${prefijoId}-sin-series`}>Pegue al menos una serie para registrar.</p>
        ) : null}
        {errores > 0 ? (
          <p className="error" role="alert" style={{ color: 'var(--c-peligro)', fontWeight: 600 }} data-testid={`${prefijoId}-errores`}>
            Hay {errores} {errores === 1 ? 'fila con problema' : 'filas con problema'}. Corríjalas para poder registrar.
          </p>
        ) : null}
        {filas.length > 0 ? (
          <div className="envoltura-tabla" style={{ maxHeight: 260, overflowY: 'auto' }}>
            <table className="tabla" data-testid={`${prefijoId}-tabla`}>
              <caption className="oculto-visual">Revisión de las series pegadas</caption>
              <thead><tr><th className="num">Fila</th><th>Serie</th><th>Revisión</th></tr></thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.numero} className={f.estado === 'ok' ? 'fila-ok' : 'fila-error'} data-testid={`${prefijoId}-fila-${f.numero}`}>
                    <td className="num">{f.numero}</td>
                    <td className="cod">{f.serie}</td>
                    <td>
                      <span className="fila" style={{ gap: 6, flexWrap: 'nowrap' }}>
                        <Icono nombre={f.estado === 'ok' ? 'check' : 'alerta'} />
                        <span>{f.detalle}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
      {/* Lista final que viaja al servidor. El segundo dato oculto impide enviar con filas con problema. */}
      <input type="hidden" name={nombre} value={JSON.stringify(filas.filter((f) => f.estado === 'ok').map((f) => f.serie))} />
      <input type="hidden" name={`${nombre}_revisadas`} data-requerido="1" value={filas.length > 0 && errores === 0 && (esperadas === undefined || validas === esperadas) ? 'si' : ''} />
    </div>
  )
}
