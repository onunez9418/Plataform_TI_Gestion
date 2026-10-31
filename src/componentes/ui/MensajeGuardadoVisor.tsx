'use client'
// Muestra, una sola vez, el mensaje que dejó el formulario antes de recargar la pantalla.
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Aviso } from './Piezas'
import { tomarMensaje, type MensajeGuardado } from './recarga'

export function MensajeGuardadoVisor() {
  const [mensaje, setMensaje] = useState<MensajeGuardado | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const m = tomarMensaje()
    if (m) setMensaje(m)
  }, [])
  useEffect(() => {
    if (mensaje) ref.current?.scrollIntoView?.({ block: 'nearest' })
  }, [mensaje])

  if (!mensaje) return null
  return (
    <div ref={ref} data-testid="mensaje-guardado">
      <Aviso tipo={mensaje.tipo ?? 'exito'} testid={mensaje.testid ?? 'exito-formulario'}>
        <p className="sin-margen">
          {mensaje.texto}
          {mensaje.destacado ? <> <strong className="cod" data-testid={mensaje.destacado.testid}>{mensaje.destacado.texto}</strong>.</> : null}
        </p>
        {mensaje.enlace ? (
          <>
            <p>
              <Link className="btn primario" href={mensaje.enlace.ruta} data-testid={mensaje.enlace.testid}>{mensaje.enlace.texto}</Link>
            </p>
            {mensaje.enlace.verRuta ? <p className="enlace-local" data-testid={mensaje.enlace.verRuta.testid}>{mensaje.enlace.ruta}</p> : null}
          </>
        ) : null}
      </Aviso>
      {mensaje.detalles && mensaje.detalles.length > 0 ? (
        <Aviso tipo="atencion" titulo="Para tener en cuenta" testid={mensaje.testidDetalles ?? 'mensaje-detalles'}>
          <ul style={{ margin: 0, paddingLeft: 'var(--e4)' }}>{mensaje.detalles.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </Aviso>
      ) : null}
    </div>
  )
}
